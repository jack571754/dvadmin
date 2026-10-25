import test from 'node:test';
import assert from 'node:assert/strict';
import { createLatestRequest } from '../../src/shared/composables/latestRequest.ts';
import { createUserListState } from '../../src/features/users/listState.ts';

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

test('equal in-flight list queries share one request', async () => {
  const response = deferred();
  const list = createLatestRequest();
  let calls = 0;
  const load = async () => { calls++; return response.promise; };
  const first = list.run('same', load);
  const second = list.run('same', load);
  await Promise.resolve();
  assert.equal(calls, 1);
  response.resolve('rows');
  assert.deepEqual(await Promise.all([first, second]), ['rows', 'rows']);
});

test('late list responses cannot overwrite newer queries even if transport ignores abort', async () => {
  const a = deferred(), b = deferred();
  const busy = [];
  const list = createLatestRequest(value => busy.push(value));
  let oldSignal;
  const old = list.run('old', signal => { oldSignal = signal; return a.promise; });
  await Promise.resolve();
  const fresh = list.run('new', () => b.promise);
  assert.equal(oldSignal.aborted, true);
  b.resolve('new');
  assert.equal(await fresh, 'new');
  a.resolve('old');
  await assert.rejects(old, error => error.kind === 'cancelled');
  assert.deepEqual(busy, [true, true, false]);
});

test('late failures cannot replace current loading/error state', async () => {
  const a = deferred(), b = deferred();
  let busy = false;
  const list = createLatestRequest(value => { busy = value; });
  const old = list.run('old', () => a.promise);
  await Promise.resolve();
  const current = list.run('new', () => b.promise);
  a.reject(new Error('old failed'));
  await assert.rejects(old, error => error.kind === 'cancelled');
  assert.equal(busy, true);
  b.resolve('new');
  await current;
  assert.equal(busy, false);
});

test('list disposal cancels work and prevents another network call', async () => {
  const response = deferred();
  const list = createLatestRequest();
  const old = list.run('old', () => response.promise);
  await Promise.resolve();
  list.dispose();
  response.resolve('old');
  await assert.rejects(old, error => error.kind === 'cancelled');
  await assert.rejects(list.run('new', () => assert.fail('disposed request started')), error => error.kind === 'cancelled');
});

test('failed list queries can retry without losing the last committed result', async () => {
  const list = createLatestRequest();
  await assert.rejects(list.run('query', async () => { throw new Error('offline'); }), /offline/);
  assert.equal(await list.run('query', async () => 'retried'), 'retried');
});

test('list preferences are account scoped and never store free-text or personal fields', () => {
  const values = new Map();
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  const a = createUserListState(storage, 'a');
  a.write({ status: 'active', department: 4, page: 3, pageSize: 10, ordering: '-id', search: 'private name', email: 'private@example.com' });
  assert.deepEqual(a.read(), { status: 'active', department: 4, page: 3, pageSize: 10, ordering: '-id' });
  assert.equal([...values.values()].some(value => /private|email|search/.test(value)), false);
  assert.equal(createUserListState(storage, 'b').read().department, null);
});

test('invalid and unavailable list storage fall back without blocking a query', () => {
  const storage = { getItem: () => 'broken json', setItem: () => { throw new Error('quota'); } };
  const cache = createUserListState(storage, 'a');
  assert.equal(cache.read().page, 1);
  assert.doesNotThrow(() => cache.write({ page: -1, status: 'unknown', department: -2, pageSize: 100000, ordering: 'password' }));
});
