import { createHash } from 'node:crypto';
import { test, expect } from '../i18n/fixtures/auth';
import type { APIRequestContext } from '@playwright/test';
const base = () => `${process.env.API_BASE_URL}/api/system/`;
async function login(request: APIRequestContext, username: string) {
  const result = await (await request.post(`${process.env.API_BASE_URL}/api/login/`, { data: { username,
    password: createHash('md5').update(process.env.TEST_ADMIN_PASSWORD || 'E2eOnly-ChangeMe123!').digest('hex'),
  } })).json();
  expect(result.code).toBe(2000); return { Authorization: `JWT ${result.data.access}` };
}
test('reader and scoped accounts cannot call authorization reads or writes directly', async ({ request }) => {
  for (const username of ['e2e_reader', 'e2e_scoped']) {
    const headers = await login(request, username);
    const prefix = `${base()}role_menu_button_permission/`;
    for (const action of ['get_role_menu', 'get_role_menu_btn_field', 'role_to_dept_all']) {
      const result = await (await request.get(`${prefix}${action}/`, { headers, params: { roleId: 1, menuId: 1 } })).json();
      expect(result.code).not.toBe(2000);
    }
    for (const action of ['set_role_menu', 'set_role_menu_btn', 'batch_set_role_menu_btn', 'set_role_menu_btn_data_range', '1/set_role_menu_field']) {
      const result = await (await request.put(`${prefix}${action}/`, { headers, data: {} })).json();
      expect(result.code).not.toBe(2000);
      expect(String(result.msg)).toMatch(/permission|权限/i);
    }
    expect((await (await request.put(`${base()}role/1/set_role_users/`, { headers, data: { direction: 'right', movedKeys: [1] } })).json()).code).not.toBe(2000);
  }
});

test('real batch grants persist custom departments, replace ranges, and reject cross-menu inputs atomically', async ({ request }) => {
  const headers = await login(request, 'e2e_admin');
  const prefix = `${base()}role_menu_button_permission/`;
  const roles = await (await request.post(`${base()}role/`, { headers, data: { name: `e2e_auth_${Date.now()}`, key: `e2e_auth_${Date.now()}` } })).json();
  expect(roles.code).toBe(2000); const roleId = roles.data.id;
  let temporaryField: number | undefined;
  try {
    const menus = await (await request.get(`${prefix}get_role_menu/`, { headers, params: { roleId } })).json();
    const menuId = menus.data.find((row: { name: string }) => row.name === '用户管理').id;
    const getDetail = async () => (await (await request.get(`${prefix}get_role_menu_btn_field/`, { headers, params: { roleId, menuId } })).json()).data;
    const before = await getDetail(); const btnId = before.menu_btn[0].id;
    const depts = (await (await request.get(`${base()}dept/all_dept/`, { headers })).json()).data;
    const ids = depts.filter((row: { name: string }) => ['E2E 总部', 'E2E 其他部门'].includes(row.name)).map((row: { id: number }) => row.id);
    expect(ids).toHaveLength(2);
    const batch = (buttons: unknown[], menu = menuId) => request.put(`${prefix}batch_set_role_menu_btn/`, { headers, data: { roleId, menuId: menu, buttons } });
    expect((await (await batch([{ btnId, isCheck: true, data_range: 4, dept: ids }])).json()).code).toBe(2000);
    let grant = (await getDetail()).menu_btn.find((row: { id: number }) => row.id === btnId);
    expect(grant.dept.sort()).toEqual([...ids].sort()); expect(grant.data_range).toBe(4);
    const saveRange = (range: number, dept: number[]) => request.put(`${prefix}set_role_menu_btn_data_range/`, { headers,
      data: { role_menu_btn_perm_id: grant.role_menu_btn_perm_id, data_range: range, dept } });
    expect((await (await saveRange(4, [ids[1]])).json()).code).toBe(2000);
    grant = (await getDetail()).menu_btn.find((row: { id: number }) => row.id === btnId);
    expect(grant.dept).toEqual([ids[1]]);
    expect((await (await saveRange(2, ids)).json()).code).toBe(2000);
    grant = (await getDetail()).menu_btn.find((row: { id: number }) => row.id === btnId);
    expect(grant.dept).toEqual([]); expect(grant.data_range).toBe(2);
    const otherMenu = menus.data.find((row: { id: number }) => row.id !== menuId).id;
    expect((await (await batch([{ btnId, isCheck: false }], otherMenu)).json()).code).not.toBe(2000);
    expect((await (await batch([{ btnId, isCheck: false }, { btnId: 99999999, isCheck: true }])).json()).code).not.toBe(2000);
    expect((await getDetail()).menu_btn.find((row: { id: number }) => row.id === btnId).isCheck).toBe(true);
    // Always exercise creation and cleanup, rather than hiding a stale route behind seeded fields.
    const result = await (await request.post(`${base()}column/`, { headers, data: { menu: menuId, model: 'Users',
      field_name: `e2e_parity_${Date.now()}`, title: 'E2E 字段' } })).json();
    expect(result.code).toBe(2000); temporaryField = result.data.id;
    const field = { id: temporaryField };
    const fieldsUrl = `${prefix}${roleId}/set_role_menu_field/`;
    const saved = { id: field.id, is_query: true, is_create: false, is_update: true };
    expect((await (await request.put(fieldsUrl, { headers, data: [saved] })).json()).code).toBe(2000);
    expect((await getDetail()).menu_field.find((row: { id: number }) => row.id === field.id)).toMatchObject(saved);
    const invalid = await (await request.put(fieldsUrl, { headers, data: [{ ...saved, is_query: false }, { ...saved, id: 99999999 }] })).json();
    expect(invalid.code).not.toBe(2000);
    expect((await getDetail()).menu_field.find((row: { id: number }) => row.id === field.id).is_query).toBe(true);
    const userList = await (await request.get(`${base()}user/`, { headers, params: { search: 'e2e_reader' } })).json();
    const userId = userList.data[0].id;
    const assignmentUrl = `${base()}role/${roleId}/set_role_users/`;
    const assignment = await (await request.put(assignmentUrl, { headers, data: { direction: 'right', movedKeys: [userId] } })).json();
    expect(assignment.code).toBe(2000); expect(assignment.data.users.map((row: { id: number }) => row.id)).toContain(userId);
    expect((await (await request.put(assignmentUrl, { headers, data: { direction: 'left', movedKeys: [userId, 99999999] } })).json()).code).not.toBe(2000);
    const restored = await (await request.get(`${base()}role/${roleId}/`, { headers })).json();
    expect(restored.data.users.map((row: { id: number }) => row.id)).toContain(userId);
  } finally {
    if (temporaryField) expect((await (await request.delete(`${base()}column/${temporaryField}/`, { headers })).json()).code).toBe(2000);
    expect((await (await request.delete(`${base()}role/${roleId}/`, { headers })).json()).code).toBe(2000);
  }
});

test('five data ranges constrain real user queries and another operation cannot widen a custom scope', async ({ request }) => {
  const headers = await login(request, 'e2e_admin'), scoped = await login(request, 'e2e_scoped');
  const prefix = `${base()}role_menu_button_permission/`;
  const users = await (await request.get(`${base()}user/`, { headers, params: { search: 'e2e_scoped' } })).json();
  const account = users.data.find((row: { username: string }) => row.username === 'e2e_scoped');
  const roleId = account.role[0], rootId = account.dept;
  const menus = await (await request.get(`${prefix}get_role_menu/`, { headers, params: { roleId } })).json();
  const menuId = menus.data.find((row: { name: string }) => row.name === '用户管理').id;
  const before = (await (await request.get(`${prefix}get_role_menu_btn_field/`, { headers, params: { roleId, menuId } })).json()).data;
  const query = before.menu_btn.find((row: { value: string }) => row.value === 'user:Search');
  const extra = before.menu_btn.find((row: { value: string; isCheck: boolean }) => row.value === 'user:Create' && !row.isCheck);
  const range = (data_range: number, dept: number[]) => request.put(`${prefix}set_role_menu_btn_data_range/`, { headers,
    data: { role_menu_btn_perm_id: query.role_menu_btn_perm_id, data_range, dept } });
  let childId: number | undefined, userId: number | undefined, extraAdded = false;
  const username = `e2e_scope_child_${Date.now()}`;
  try {
    const child = await (await request.post(`${base()}dept/`, { headers, data: { name: username, key: username, parent: rootId, status: true } })).json();
    expect(child.code).toBe(2000); childId = child.data.id;
    const user = await (await request.post(`${base()}user/`, { headers, data: { username, name: username, dept: childId, role: [roleId],
      password: createHash('md5').update('E2e-Range-123!').digest('hex') } })).json();
    expect(user.code).toBe(2000); userId = user.data.id;
    for (const value of [0, 1, 2, 3, 4]) {
      expect((await (await range(value, value === 4 ? [childId!] : [])).json()).code).toBe(2000);
      const result = await (await request.get(`${base()}user/`, { headers: scoped, params: { limit: 999 } })).json();
      expect(result.code).toBe(2000);
      const names = result.data.map((row: { username: string }) => row.username);
      expect(names.includes(username)).toBe([1, 3, 4].includes(value));
      expect(names.includes('e2e_reader')).toBe([1, 2, 3].includes(value));
      expect(names.includes('e2e_outside')).toBe(value === 3);
      if (value === 0) expect(result.data.every((row: { creator: number }) => row.creator === account.id)).toBe(true);
    }
    expect(extra).toBeTruthy();
    const response = await (await request.put(`${prefix}batch_set_role_menu_btn/`, { headers, data: { roleId, menuId,
      buttons: [{ btnId: extra.id, isCheck: true, data_range: 4, dept: [rootId] }] } })).json();
    expect(response.code).toBe(2000); extraAdded = true;
    const isolated = await (await request.get(`${base()}user/`, { headers: scoped, params: { limit: 999 } })).json();
    expect(isolated.data.map((row: { username: string }) => row.username)).toEqual([username]);
  } finally {
    expect((await (await range(query.data_range, query.dept || [])).json()).code).toBe(2000);
    if (extraAdded) expect((await (await request.put(`${prefix}batch_set_role_menu_btn/`, { headers, data: { roleId, menuId,
      buttons: [{ btnId: extra.id, isCheck: false }] } })).json()).code).toBe(2000);
    if (userId) expect((await (await request.delete(`${base()}user/${userId}/`, { headers })).json()).code).toBe(2000);
    if (childId) expect((await (await request.delete(`${base()}dept/${childId}/`, { headers })).json()).code).toBe(2000);
  }
});
