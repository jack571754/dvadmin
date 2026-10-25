import assert from 'node:assert/strict';
import test from 'node:test';
import { createSessionBootstrap } from '../../src/shared/access/bootstrap.ts';

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

test('bootstrap deduplicates in-flight work and reuses a completed initialization', async () => {
  const barrier = deferred();
  const bootstrap = createSessionBootstrap(() => 'account-a');
  let calls = 0;
  const initialize = async check => { calls++; await barrier.promise; check(); };
  const a = bootstrap.ensure(initialize);
  const b = bootstrap.ensure(initialize);
  await Promise.resolve();
  assert.equal(calls, 1);
  barrier.resolve();
  await Promise.all([a, b]);
  await bootstrap.ensure(initialize);
  assert.equal(calls, 1);
});

test('failed initialization is retried and never cached as ready', async () => {
  const bootstrap = createSessionBootstrap(() => 'account-a');
  await assert.rejects(bootstrap.ensure(async () => { throw new Error('menu offline'); }), /menu offline/);
  let committed = false;
  await bootstrap.ensure(async check => { check(); committed = true; });
  assert.equal(committed, true);
});

test('session reset blocks old publication without disturbing the new in-flight work', async () => {
  let key = 'account-a';
  const bootstrap = createSessionBootstrap(() => key);
  const old = deferred();
  const fresh = deferred();
  const commits = [];
  const a = bootstrap.ensure(async check => { await old.promise; check(); commits.push('a'); });
  await Promise.resolve();
  bootstrap.reset();
  key = 'account-b';
  let bCalls = 0;
  const initB = async check => { bCalls++; await fresh.promise; check(); commits.push('b'); };
  const b = bootstrap.ensure(initB);
  await Promise.resolve();
  old.resolve();
  await assert.rejects(a, { name: 'AbortError' });
  const duplicate = bootstrap.ensure(initB);
  fresh.resolve();
  await Promise.all([b, duplicate]);
  assert.equal(bCalls, 1);
  assert.deepEqual(commits, ['b']);
});

test('logout invalidates even a response for the same token after re-login', async () => {
  const bootstrap = createSessionBootstrap(() => 'account-a');
  const barrier = deferred();
  const old = bootstrap.ensure(async check => { await barrier.promise; check(); });
  await Promise.resolve();
  bootstrap.reset();
  await bootstrap.ensure(async () => {});
  barrier.resolve();
  await assert.rejects(old, { name: 'AbortError' });
});

test('a session change before initialization starts sends no stale work', async () => {
  const bootstrap = createSessionBootstrap(() => 'account-a');
  let calls = 0;
  const pending = bootstrap.ensure(async () => { calls++; });
  bootstrap.reset();
  await assert.rejects(pending, { name: 'AbortError' });
  assert.equal(calls, 0);
});

test('an anonymous session cannot initialize protected resources', async () => {
  const bootstrap = createSessionBootstrap(() => null);
  let calls = 0;
  await assert.rejects(bootstrap.ensure(async () => { calls++; }), { name: 'AbortError' });
  assert.equal(calls, 0);
});
