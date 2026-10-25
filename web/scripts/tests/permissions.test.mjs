import assert from 'node:assert/strict';
import test from 'node:test';
import { createPinia, disposePinia } from 'pinia';
import { createPermissionStore } from '../../src/shared/access/permissionStore.ts';

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
function fixture(fetch) {
  let token = 'account-a';
  const listeners = new Set();
  const pinia = createPinia();
  const useStore = createPermissionStore(fetch, {
    getToken: () => token,
    subscribe: reset => { listeners.add(reset); return () => listeners.delete(reset); },
  });
  return { store: useStore(pinia), listeners,
    changeToken(next) { token = next; listeners.forEach(reset => reset()); },
    dispose() { disposePinia(pinia); } };
}

test('awaits permissions and shares concurrent requests', async () => {
  const request = deferred();
  let calls = 0;
  const { store } = fixture(() => { calls++; return request.promise; });
  const first = store.getBtnPermissionStore();
  const second = store.getBtnPermissionStore();
  await Promise.resolve();
  assert.equal(calls, 1);
  assert.equal(store.status, 'loading');
  assert.equal(store.hasPermission('user:Add'), false);
  request.resolve(['user:Add', 'user:Add']);
  assert.deepEqual(await first, ['user:Add']);
  await second;
  assert.equal(store.hasPermission('user:Add'), true);
});

test('failure denies access and permits an explicit retry', async () => {
  let fail = true;
  const { store } = fixture(async () => {
    if (fail) throw new Error('offline');
    return ['user:Search'];
  });
  await assert.rejects(store.getBtnPermissionStore(), /offline/);
  assert.equal(store.status, 'error');
  assert.deepEqual(store.data, []);
  fail = false;
  await store.getBtnPermissionStore();
  assert.equal(store.hasPermission('user:Search'), true);
});

test('logout clears grants synchronously and does not fetch without a token', async () => {
  let calls = 0;
  const f = fixture(async () => { calls++; return ['user:Add']; });
  await f.store.getBtnPermissionStore();
  f.changeToken(null);
  assert.equal(f.store.hasPermission('user:Add'), false);
  assert.deepEqual(f.store.data, []);
  await f.store.getBtnPermissionStore();
  assert.equal(calls, 1);
});

test('old account response cannot overwrite a new account or clear its pending request', async () => {
  const old = deferred();
  const fresh = deferred();
  let calls = 0;
  const f = fixture(() => (++calls === 1 ? old.promise : fresh.promise));
  const oldRequest = f.store.getBtnPermissionStore();
  await Promise.resolve();
  f.changeToken('account-b');
  const newRequest = f.store.getBtnPermissionStore();
  await Promise.resolve();
  old.resolve(['user:Delete']);
  await assert.rejects(oldRequest, { name: 'AbortError' });
  const duplicate = f.store.getBtnPermissionStore();
  assert.equal(calls, 2);
  assert.equal(f.store.status, 'loading');
  fresh.resolve(['user:Search']);
  await Promise.all([newRequest, duplicate]);
  assert.deepEqual(f.store.data, ['user:Search']);
  assert.equal(f.store.hasPermission('user:Delete'), false);
});

test('a late error from the old account does not revoke the current account', async () => {
  const old = deferred();
  let calls = 0;
  const f = fixture(() => ++calls === 1 ? old.promise : Promise.resolve(['user:Search']));
  const first = f.store.getBtnPermissionStore();
  await Promise.resolve();
  f.changeToken('account-b');
  await f.store.getBtnPermissionStore();
  old.reject(new Error('old request failed'));
  await assert.rejects(first, /old request failed/);
  assert.equal(f.store.status, 'ready');
  assert.equal(f.store.hasPermission('user:Search'), true);
});

test('invalid payloads fail closed instead of retaining previous grants', async () => {
  for (const payload of [null, {}, ['user:Add', 1]]) {
    const { store } = fixture(async () => payload);
    await assert.rejects(store.getBtnPermissionStore(), TypeError);
    assert.equal(store.status, 'error');
    assert.equal(store.hasPermission('user:Add'), false);
  }
});

test('refresh revokes removed grants and disposal releases session subscriptions', async () => {
  let grants = ['user:Add'];
  const f = fixture(async () => grants);
  await f.store.getBtnPermissionStore();
  grants = [];
  await f.store.getBtnPermissionStore();
  assert.equal(f.store.hasPermission('user:Add'), false);
  assert.equal(f.listeners.size, 1);
  f.dispose();
  assert.equal(f.listeners.size, 0);
});

