import { test, expect } from '../i18n/fixtures/auth';
import type { Page } from '@playwright/test';
const root = '**/api/system/role_menu_button_permission/';
const detail = (id: number) => ({ menu_btn: [{ id, name: `操作${id}`, value: 'system:Demo:List', isCheck: false, data_range: 0, dept: [], role_menu_btn_perm_id: id }],
  menu_field: [{ id, field_name: 'name', title: `字段${id}`, is_create: true, is_update: true, is_query: true }] });
const errors = new Map<string, string[]>();
test.beforeEach(({ page }, info) => { const list: string[] = []; errors.set(info.testId, list); page.on('pageerror', error => list.push(error.message)); });
test.afterEach(({ page: _page }, info) => { expect(errors.get(info.testId)).toEqual([]); errors.delete(info.testId); });
async function open(page: Page) {
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.route(`${root}get_role_menu/**`, route => route.fulfill({ json: { code: 2000, data: [1, 2].map(id => ({
    id, name: `测试菜单${id}`, parent: null, is_catalog: false, isCheck: true,
  })) } }));
  await page.route(`${root}get_role_menu_btn_field/**`, route => route.fulfill({ json: { code: 2000,
    data: detail(Number(new URL(route.request().url()).searchParams.get('menuId'))) } }));
  await page.goto('/#/role');
  await page.getByRole('button', { name: '权限配置', exact: true }).first().click();
  const drawer = page.locator('.admin-permission-drawer');
  await expect(drawer.getByText('测试菜单1', { exact: true })).toBeVisible();
  return drawer;
}

test('initial tree hydration performs no writes; failed menu changes restore confirmed checks', async ({ authenticatedPage }) => {
  const { page } = authenticatedPage;
  let writes = 0;
  await page.route(`${root}set_role_menu/`, route => { writes++; return route.fulfill({ json: { code: 4000, msg: '菜单保存失败' } }); });
  const drawer = await open(page);
  expect(writes).toBe(0);
  const checkbox = drawer.getByRole('treeitem').filter({ hasText: '测试菜单1' }).getByRole('checkbox');
  await expect(checkbox).toBeChecked(); await checkbox.locator('..').click();
  await expect(drawer.getByRole('alert')).toContainText('菜单保存失败');
  await expect(checkbox).toBeChecked(); expect(writes).toBe(1);
});

test('field failures retain the draft, block duplicate saves, and require discard before switching or closing', async ({ authenticatedPage }) => {
  const { page } = authenticatedPage;
  const drawer = await open(page);
  await drawer.getByText('测试菜单1', { exact: true }).click();
  await drawer.getByRole('tab', { name: '列字段权限', exact: true }).click();
  const field = drawer.locator('.columns-item').filter({ hasText: '字段1' }).getByRole('checkbox').first();
  await expect(field).toBeChecked(); await field.locator('..').click();
  let writes = 0, release!: () => void;
  const pending = new Promise<void>(resolve => { release = resolve; });
  await page.route(`${root}*/set_role_menu_field/`, async route => { writes++; await pending; await route.fulfill({ json: { code: 4000, msg: '字段保存失败' } }); });
  const save = drawer.getByRole('button', { name: '保存当前菜单字段', exact: true });
  await save.click(); await expect(save).toBeDisabled(); await save.dispatchEvent('click');
  expect(writes).toBe(1); release();
  await expect(drawer.getByRole('alert')).toContainText('字段保存失败'); await expect(field).not.toBeChecked();
  await drawer.getByText('测试菜单2', { exact: true }).click();
  const confirm = page.locator('.el-message-box');
  await expect(confirm).toContainText('字段修改尚未保存');
  await confirm.getByRole('button', { name: '继续编辑', exact: true }).click();
  await expect(field).not.toBeChecked();
  await drawer.getByRole('button', { name: '关闭此对话框', exact: true }).click();
  await expect(confirm).toBeVisible();
  await confirm.getByRole('button', { name: '放弃修改', exact: true }).click();
  await expect(drawer).not.toBeVisible();
});

test('late detail responses cannot replace a newer selected menu and a failed read can retry', async ({ authenticatedPage }) => {
  const { page } = authenticatedPage;
  const drawer = await open(page);
  let release!: () => void;
  const pending = new Promise<void>(resolve => { release = resolve; });
  await page.route(`${root}get_role_menu_btn_field/**`, async route => {
    const id = Number(new URL(route.request().url()).searchParams.get('menuId'));
    if (id === 1) await pending;
    await route.fulfill({ json: { code: 2000, data: detail(id) } });
  });
  await drawer.getByText('测试菜单1', { exact: true }).click();
  await drawer.getByText('测试菜单2', { exact: true }).click();
  await expect(drawer.getByText('操作2', { exact: true })).toBeVisible(); release();
  await expect(drawer.getByText('操作1', { exact: true })).toHaveCount(0);
  let fail = true;
  await page.route(`${root}get_role_menu_btn_field/**`, route => route.fulfill({ json: fail ? { code: 4000, msg: '读取权限失败' } : { code: 2000, data: detail(1) } }));
  await drawer.getByText('测试菜单1', { exact: true }).click();
  await expect(drawer.getByRole('alert')).toContainText('读取权限失败'); fail = false;
  await drawer.getByRole('button', { name: '重新加载', exact: true }).click();
  await expect(drawer.getByText('操作1', { exact: true })).toBeVisible();
});

test('button changes save immediately to a captured menu and failed writes keep the confirmed state', async ({ authenticatedPage }) => {
  const { page } = authenticatedPage;
  const drawer = await open(page);
  await drawer.getByText('测试菜单1', { exact: true }).click();
  const checkbox = drawer.locator('.btn-checkbox-item').filter({ hasText: '操作1' }).getByRole('checkbox');
  let body: Record<string, unknown> | undefined, release!: () => void;
  const pending = new Promise<void>(resolve => { release = resolve; });
  await page.route(`${root}batch_set_role_menu_btn/`, async route => {
    body = route.request().postDataJSON(); await pending; await route.fulfill({ json: { code: 4000, msg: '接口保存失败' } });
  });
  await checkbox.locator('..').click(); await expect(checkbox).toBeDisabled();
  await drawer.getByText('测试菜单2', { exact: true }).click();
  expect(body?.menuId).toBe(1); release();
  await expect(drawer.getByRole('alert')).toContainText('接口保存失败'); await expect(checkbox).not.toBeChecked();
  await drawer.getByText('测试菜单2', { exact: true }).click();
  await expect(drawer.getByText('操作2', { exact: true })).toBeVisible();
});

test('data range dialogs use a draft and keep it after failure; cancel leaves the confirmed range intact', async ({ authenticatedPage }) => {
  const { page } = authenticatedPage;
  const drawer = await open(page);
  await page.route(`${root}get_role_menu_btn_field/**`, route => route.fulfill({ json: { code: 2000,
    data: { ...detail(1), menu_btn: [{ ...detail(1).menu_btn[0], isCheck: true }] } } }));
  await drawer.getByText('测试菜单1', { exact: true }).click();
  const settings = drawer.locator('.btn-checkbox-item').getByRole('button');
  await settings.click();
  const dialog = page.getByRole('dialog').filter({ hasText: '数据权限配置' }).last();
  await dialog.getByRole('combobox').first().locator('xpath=ancestor::div[contains(concat(" ", normalize-space(@class), " "), " el-select ")][1]').click();
  await page.locator('.el-select-dropdown:visible').getByText('全部数据权限', { exact: true }).click();
  let payload: Record<string, unknown> | undefined;
  await page.route(`${root}set_role_menu_btn_data_range/`, route => {
    payload = route.request().postDataJSON(); return route.fulfill({ json: { code: 4000, msg: '范围保存失败' } });
  });
  await dialog.getByRole('button', { name: '确定', exact: true }).click();
  await expect(dialog.getByRole('alert')).toContainText('范围保存失败'); expect(payload?.data_range).toBe(3);
  await expect(dialog.locator('.el-select__selected-item').filter({ hasText: /^全部数据权限$/ })).toBeVisible();
  await dialog.getByRole('button', { name: '取消', exact: true }).click();
  await settings.click();
  await expect(dialog.locator('.el-select__selected-item').filter({ hasText: /^仅本人数据权限$/ })).toBeVisible();
});

test('assigning users locks the role context and failure restores the confirmed selection', async ({ authenticatedPage }) => {
  const { page } = authenticatedPage;
  const drawer = await open(page);
  await page.route('**/api/system/user/?*', route => route.fulfill({ json: { code: 2000, page: 1, limit: 200, total: 1,
    data: [{ id: 89991, name: 'e2e_pick' }] } }));
  let body: Record<string, unknown> | undefined, release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/api/system/role/*/set_role_users/', async route => {
    body = route.request().postDataJSON(); await gate; return route.fulfill({ json: { code: 4000, msg: '用户授权失败' } });
  });
  await drawer.locator('.el-drawer__header .el-button').click();
  const dialog = page.getByRole('dialog').filter({ has: page.locator('.el-transfer') }).last();
  const left = dialog.locator('.el-transfer-panel').first(), right = dialog.locator('.el-transfer-panel').last();
  await left.getByRole('checkbox', { name: 'e2e_pick', exact: true }).locator('..').click();
  await dialog.locator('.el-transfer__buttons .el-button').nth(1).click();
  await expect.poll(() => body).toEqual({ direction: 'right', movedKeys: [89991] });
  await expect(dialog.getByRole('checkbox', { name: 'e2e_pick', exact: true })).toBeDisabled();
  release(); await expect(dialog.getByRole('alert')).toContainText('用户授权失败');
  await expect(left.getByText('e2e_pick', { exact: true })).toBeVisible();
  await expect(right.getByText('e2e_pick', { exact: true })).toHaveCount(0);
});
