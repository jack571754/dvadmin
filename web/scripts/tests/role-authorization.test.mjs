import test from 'node:test';
import assert from 'node:assert/strict';
import { createRoleAuthorization } from '../../src/features/roles/authorization.ts';
const node = id => ({ id, name: `menu${id}`, is_catalog: false, isCheck: false });
const data = id => ({ menu_btn: [{ id, name: `button${id}`, isCheck: false, data_range: 0, dept: [] }],
  menu_field: [{ id, field_name: 'name', title: `field${id}`, is_create: true, is_update: true, is_query: true }] });
function setup(overrides = {}) {
  const calls = [];
  const api = { menus: async () => [node(1), node(2)], detail: async (_, id) => data(id), menu: async value => calls.push(value),
    fields: async (role, rows) => calls.push({ role, rows }), buttons: async value => calls.push(value), range: async value => calls.push(value),
    allowed: () => true, discard: async () => false, failed: error => error.message, ...overrides };
  return { state: createRoleAuthorization(api), calls };
}
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };

test('late menu and role responses never overwrite the active context', async () => {
  const slow = deferred();
  const { state } = setup({ detail: (_, id) => id === 1 ? slow.promise : Promise.resolve(data(id)) });
  await state.open(11);
  const first = state.select(node(1)); await Promise.resolve();
  await state.select(node(2)); slow.resolve(data(1)); await first;
  assert.equal(state.buttons.value[0].id, 2);
  const oldTree = deferred();
  const other = setup({ menus: role => role === 11 ? oldTree.promise : Promise.resolve([node(9)]) }).state;
  const opening = other.open(11); await other.open(22); oldTree.resolve([node(1)]); await opening;
  assert.equal(other.tree.value[0].id, 9);
});

test('field drafts require explicit discard; a failed save preserves inputs and retries', async () => {
  let fail = true, discard = false;
  const { state, calls } = setup({ discard: async () => discard, fields: async (role, rows) => {
    if (fail) throw new Error('save failed'); calls.push({ role, rows });
  } });
  await state.open(11); await state.select(node(1)); state.fields.value[0].is_create = false;
  assert.equal(await state.select(node(2)), false);
  assert.equal(await state.canLeave(), false);
  assert.equal(await state.saveFields(), false);
  assert.equal(state.dirty.value, true); assert.equal(state.fields.value[0].is_create, false);
  fail = false; assert.equal(await state.saveFields(), true); assert.equal(state.dirty.value, false);
  assert.equal(calls[0].role, 11);
  state.fields.value[0].is_query = false; discard = true;
  assert.equal(await state.select(node(2)), true); assert.equal(state.dirty.value, false);
});

test('writes capture role/menu, reject duplicates, and cannot switch or close while pending', async () => {
  const pending = deferred();
  const { state, calls } = setup({ buttons: async payload => { calls.push(payload); await pending.promise; } });
  await state.open(11); await state.select(node(1)); state.fields.value[0].is_query = false;
  const saving = state.saveButtons([1], true, 4, [7]);
  assert.equal(await state.saveButtons([1], true, 0, []), false);
  assert.equal(await state.select(node(2)), false); assert.equal(await state.canLeave(), false);
  assert.deepEqual(calls, [{ roleId: 11, menuId: 1, buttons: [{ btnId: 1, isCheck: true, data_range: 4, dept: [7] }] }]);
  pending.resolve(); await saving;
  assert.equal(state.dirty.value, true); assert.equal(state.fields.value[0].is_query, false);
});

test('failed immediate operations preserve confirmed state; revoked grants send no writes', async () => {
  let allowed = true;
  const { state, calls } = setup({ menu: async () => { throw new Error('menu failed'); },
    buttons: async () => { throw new Error('button failed'); }, allowed: () => allowed });
  await state.open(11); await state.select(node(1));
  assert.equal(await state.toggleMenu(state.tree.value[0], true), false);
  assert.equal(state.tree.value[0].isCheck, false);
  assert.equal(await state.saveButtons([1], true, 0, []), false);
  assert.equal(state.buttons.value[0].isCheck, false);
  allowed = false; state.fields.value[0].is_create = false;
  assert.equal(await state.saveFields(), false); assert.equal(await state.saveRange({ id: 1 }), false);
  assert.equal(calls.length, 0);
});

test('context reset suppresses old write failures and clears drafts', async () => {
  const pending = deferred();
  const { state } = setup({ fields: () => pending.promise });
  await state.open(11); await state.select(node(1)); state.fields.value[0].is_create = false;
  const saving = state.saveFields(); state.reset(); await state.open(22);
  pending.reject(new Error('old role failure')); await saving;
  assert.equal(state.role.value, 22); assert.equal(state.error.value, ''); assert.equal(state.dirty.value, false);
});

test('user assignment captures its role, deduplicates, restores on failure and preserves field drafts', async () => {
  let fail = true; const pending = deferred();
  const { state, calls } = setup({ users: async (role, data) => { calls.push({ role, data }); await pending.promise;
    if (fail) throw new Error('assignment failed'); return [{ id: 2, name: 'new' }]; } });
  await state.open(11, [{ id: 1, name: 'old' }]); await state.select(node(1)); state.fields.value[0].is_query = false;
  const assignment = state.assignUsers('right', [2]);
  assert.equal(await state.assignUsers('left', [1]), false); assert.equal(await state.canLeave(), false);
  pending.resolve(); assert.equal(await assignment, false); assert.equal(state.users.value[0].id, 1);
  fail = false; assert.equal(await state.assignUsers('right', [2]), true);
  assert.equal(state.users.value[0].id, 2); assert.equal(state.dirty.value, true);
  assert.deepEqual(calls[0], { role: 11, data: { direction: 'right', movedKeys: [2] } });
});

test('an old role assignment cannot replace the new role users', async () => {
  const pending = deferred(); const { state } = setup({ users: () => pending.promise });
  await state.open(11); const saving = state.assignUsers('right', [1]);
  await state.open(22, [{ id: 2, name: 'current' }]); pending.resolve([{ id: 1, name: 'old' }]); await saving;
  assert.deepEqual(state.users.value, [{ id: 2, name: 'current' }]);
});
