import test from 'node:test';
import assert from 'node:assert/strict';
import { createRoleUserList } from '../../src/features/roles/userList.ts';
const deferred = () => { let resolve; const promise = new Promise(yes => { resolve = yes; }); return { promise, resolve }; };
test('role user lists replace stale role ids and never publish a late previous-role response', async () => {
  let role = 1; const slow = deferred(), seen = [];
  const list = createRoleUserList(() => role, async query => { seen.push(query.role_id); return query.role_id === 1 ? slow.promise : { data: ['current'] }; });
  const first = list.request({ role_id: 9 }); const rejected = assert.rejects(first, error => error.kind === 'cancelled');
  await Promise.resolve(); role = 2; list.reset();
  assert.deepEqual((await list.request({ role_id: 1 })).data, ['current']);
  slow.resolve({ data: ['old'] }); await rejected;
  assert.deepEqual(seen, [1, 2]); assert.equal(list.error.value, '');
});
test('closed user lists do not query an arbitrary role; failure keeps selection for retry', async () => {
  let role; let calls = 0, fail = true;
  const list = createRoleUserList(() => role, async () => { calls++; if (fail) throw new Error('offline'); return { data: [] }; });
  assert.deepEqual((await list.request({ role_id: 1 })).data, []); assert.equal(calls, 0);
  role = 1; list.selected.value = [{ id: 7 }];
  await assert.rejects(list.request({}), /offline/); assert.deepEqual(list.selected.value, [{ id: 7 }]);
  fail = false; await list.request({}); assert.equal(list.error.value, '');
  list.reset(); assert.deepEqual(list.selected.value, []);
});
