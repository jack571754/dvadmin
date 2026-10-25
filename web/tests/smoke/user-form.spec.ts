import { createHash } from 'node:crypto';
import { test, expect } from '../i18n/fixtures/auth';
import type { Page, Locator } from '@playwright/test';

const errors = new Map<string, string[]>();
test.beforeEach(({ page }, info) => { const values: string[] = []; errors.set(info.testId, values); page.on('pageerror', error => values.push(error.message)); });
test.afterEach(({ page: _page }, info) => { const values = errors.get(info.testId) || []; errors.delete(info.testId); expect(values).toEqual([]); });
const allow = { is_query: true, is_create: true, is_update: true };

async function openUsers(page: Page) {
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.goto('/#/user');
  await expect(page.locator('.el-table').first()).toBeVisible();
}
async function createForm(page: Page) {
  await page.locator('.fs-actionbar').getByRole('button', { name: '新增', exact: true }).click();
  const dialog = page.getByRole('dialog').filter({ has: page.getByPlaceholder('请输入账号', { exact: true }) });
  await expect(dialog).toBeVisible();
  return dialog;
}
async function completeCreate(page: Page, dialog: Locator) {
  await dialog.getByPlaceholder('请输入账号', { exact: true }).fill('e2e_form_trial');
  await dialog.getByPlaceholder('请输入姓名', { exact: true }).fill('表单测试');
  await dialog.getByPlaceholder('请输入密码', { exact: true }).fill('E2e-Form-Password123!');
  await dialog.getByRole('combobox', { name: /所属部门/ }).locator('xpath=ancestor::div[contains(concat(" ", normalize-space(@class), " "), " el-select ")][1]').click();
  await page.locator('.el-select-dropdown:visible').getByText('E2E 总部', { exact: true }).click();
  await dialog.getByRole('combobox', { name: /角色/ }).locator('xpath=ancestor::div[contains(concat(" ", normalize-space(@class), " "), " el-select ")][1]').click();
  await page.locator('.el-select-dropdown:visible').getByText('e2e_reader', { exact: true }).click();
  await dialog.getByPlaceholder('请输入姓名', { exact: true }).click();
  const email = dialog.getByPlaceholder('请输入邮箱', { exact: true });
  if (await email.count()) await email.fill('trial@example.com');
}

for (const username of ['e2e_admin', 'e2e_reader', 'e2e_scoped']) {
  test(`${username} can read the real field policy and anonymous access is rejected`, async ({ request }) => {
    const password = createHash('md5').update(process.env.TEST_ADMIN_PASSWORD || 'E2eOnly-ChangeMe123!').digest('hex');
    const login = await request.post(`${process.env.API_BASE_URL}/api/login/`, { data: { username, password } });
    const account = await login.json();
    expect(account.code).toBe(2000);
    const result = await request.get(`${process.env.API_BASE_URL}/api/system/user/field_permission/`, { headers: { Authorization: `JWT ${account.data.access}` } });
    const policy = await result.json();
    expect(policy.code).toBe(2000);
    for (const access of Object.values(policy.data) as Array<Record<string, unknown>>) {
      for (const flag of ['is_query', 'is_create', 'is_update']) expect(typeof access[flag]).toBe('boolean');
    }
    const anonymous = await request.get(`${process.env.API_BASE_URL}/api/system/user/field_permission/`);
    expect((await anonymous.json()).code).not.toBe(2000);
  });
}

test('field loading failure exposes a retry without rendering the unrestricted list', async ({ authenticatedPage }) => {
  const { page } = authenticatedPage;
  let fail = true, queries = 0;
  page.on('request', request => { if (/\/api\/system\/user\/\?/.test(request.url())) queries++; });
  await page.route('**/api/system/user/field_permission/**', async route => {
    if (fail) await route.fulfill({ json: { code: 4000, msg: 'field policy unavailable', data: null } });
    else await route.continue();
  });
  await page.goto('/#/user');
  await expect(page.getByRole('alert').filter({ hasText: '字段权限加载失败' })).toBeVisible();
  await expect(page.locator('.el-table')).toHaveCount(0);
  expect(queries).toBe(0);
  fail = false;
  await page.getByRole('button', { name: '重新加载', exact: true }).click();
  await expect(page.locator('.el-table').first()).toBeVisible();
});

test('query-hidden fields stay locked in column settings and creation rules remain intact', async ({ authenticatedPage }) => {
  const { page } = authenticatedPage;
  await page.route('**/api/system/user/field_permission/**', route => route.fulfill({ json: { code: 2000, data: {
    email: { is_query: false, is_create: false, is_update: true }, mobile: { is_query: true, is_create: true, is_update: false }, password: allow,
  } } }));
  await openUsers(page);
  await expect(page.locator('.el-table__header-wrapper').getByText('邮箱', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: '列设置', exact: true }).click();
  const email = page.getByRole('checkbox', { name: '邮箱', exact: true });
  await expect(email).toBeDisabled();
  await expect(email).not.toBeChecked();
  await page.getByRole('button', { name: '确定', exact: true }).click();
  const dialog = await createForm(page);
  await expect(dialog.getByPlaceholder('请输入邮箱', { exact: true })).toHaveCount(0);
  await dialog.getByRole('button', { name: '确定', exact: true }).click();
  await expect(dialog.getByText('账号必填项', { exact: true })).toBeVisible();
});

test('failed creation retains plaintext input, focuses server field errors, and retries one encoded snapshot', async ({ authenticatedPage }) => {
  const { page } = authenticatedPage;
  await openUsers(page);
  const dialog = await createForm(page);
  await completeCreate(page, dialog);
  const bodies: Array<Record<string, unknown>> = [];
  let release!: () => void;
  const barrier = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/api/system/user/', async route => {
    if (route.request().method() !== 'POST') { await route.continue(); return; }
    bodies.push(route.request().postDataJSON());
    if (bodies.length === 1) {
      await barrier;
      await route.fulfill({ json: { code: 4000, msg: '邮箱已被占用', data: { email: ['邮箱已被占用'] } } });
    } else await route.fulfill({ json: { code: 2000, msg: '保存成功', data: { id: 99991 } } });
  });
  const save = dialog.getByRole('button', { name: '确定', exact: true });
  await save.click();
  await expect(save).toBeDisabled();
  await save.dispatchEvent('click');
  expect(bodies).toHaveLength(1);
  release();
  await expect(dialog.locator('.user-form-error')).toContainText('邮箱已被占用');
  await expect(dialog.getByPlaceholder('请输入邮箱', { exact: true })).toBeFocused();
  await expect(dialog.getByPlaceholder('请输入账号', { exact: true })).toHaveValue('e2e_form_trial');
  await expect(dialog.getByPlaceholder('请输入密码', { exact: true })).toHaveValue('E2e-Form-Password123!');
  await dialog.getByPlaceholder('请输入邮箱', { exact: true }).fill('retry@example.com');
  await save.click();
  await expect(dialog).not.toBeVisible();
  expect(bodies).toHaveLength(2);
  const digest = createHash('md5').update('E2e-Form-Password123!').digest('hex');
  expect(bodies[0].password).toBe(digest);
  expect(bodies[1].password).toBe(digest);
  expect(bodies[0]).not.toHaveProperty('is_superuser');
});

test('editing excludes denied fields and password while failure keeps its inputs', async ({ authenticatedPage }) => {
  const { page } = authenticatedPage;
  await page.route('**/api/system/user/field_permission/**', route => route.fulfill({ json: { code: 2000, data: { mobile: { ...allow, is_update: false }, password: allow } } }));
  await openUsers(page);
  await page.getByRole('button', { name: '编辑', exact: true }).first().click();
  const dialog = page.getByRole('dialog').filter({ has: page.getByPlaceholder('请输入账号', { exact: true }) });
  await expect(dialog.getByPlaceholder('请输入密码', { exact: true })).toHaveCount(0);
  await expect(dialog.getByPlaceholder('请输入手机号码', { exact: true })).toHaveCount(0);
  await dialog.getByPlaceholder('请输入姓名', { exact: true }).fill('保留编辑内容');
  let submitted: Record<string, unknown> | undefined;
  await page.route('**/api/system/user/*/', route => {
    if (route.request().method() !== 'PUT') return route.fallback();
    submitted = route.request().postDataJSON();
    return route.fulfill({ json: { code: 4000, msg: '保存失败', data: null } });
  });
  await dialog.getByRole('button', { name: '确定', exact: true }).click();
  await expect(dialog.locator('.user-form-error')).toContainText('保存失败');
  await expect(dialog.getByPlaceholder('请输入姓名', { exact: true })).toHaveValue('保留编辑内容');
  expect(submitted).not.toHaveProperty('mobile');
  expect(submitted).not.toHaveProperty('password');
  expect(submitted).not.toHaveProperty('role_info');
});

test('changed operation or field permissions block an open form without sending a write', async ({ authenticatedPage }) => {
  const { page } = authenticatedPage;
  let changed = false, writes = 0;
  await page.route('**/api/system/user/field_permission/**', route => route.fulfill({ json: { code: 2000,
    data: changed ? { email: { ...allow, is_create: false } } : {} } }));
  page.on('request', request => { if (request.method() === 'POST' && /\/api\/system\/user\/$/.test(request.url())) writes++; });
  await openUsers(page);
  const dialog = await createForm(page);
  await completeCreate(page, dialog);
  changed = true;
  await dialog.getByRole('button', { name: '确定', exact: true }).click();
  await expect(dialog.locator('.user-form-error')).toContainText('字段权限已变化');
  expect(writes).toBe(0);
  await page.route('**/api/system/menu_button/menu_button_all_permission/**', route => route.fulfill({ json: { code: 2000, data: ['user:Search'] } }));
  await page.evaluate(async () => { const path = '/src/stores/btnPermission.ts'; await (await import(path)).BtnPermissionStore().getBtnPermissionStore(); });
  await expect(dialog.getByRole('button', { name: '确定', exact: true })).toBeDisabled();
  await expect(dialog.getByPlaceholder('请输入账号', { exact: true })).toHaveValue('e2e_form_trial');
  expect(writes).toBe(0);
});

test('real user creation and editing preserve the password login contract', async ({ authenticatedPage }) => {
  const { page } = authenticatedPage;
  const username = `e2e_form_${Date.now()}`;
  const api = `${process.env.API_BASE_URL}/api/system/user/`;
  const digest = (value: string) => createHash('md5').update(value).digest('hex');
  const admin = await (await page.request.post(`${process.env.API_BASE_URL}/api/login/`, { data: {
    username: process.env.TEST_ADMIN_USER || 'e2e_admin', password: digest(process.env.TEST_ADMIN_PASSWORD || 'E2eOnly-ChangeMe123!'),
  } })).json();
  const headers = { Authorization: `JWT ${admin.data.access}` };
  let id: number | undefined;
  try {
    await openUsers(page);
    const dialog = await createForm(page);
    await completeCreate(page, dialog);
    await dialog.getByPlaceholder('请输入账号', { exact: true }).fill(username);
    const created = page.waitForResponse(response => response.request().method() === 'POST' && response.url() === api);
    await dialog.getByRole('button', { name: '确定', exact: true }).click();
    const result = await (await created).json();
    id = result.data?.id;
    expect(result.code).toBe(2000);
    expect(id).toBeTruthy();
    await expect(dialog).not.toBeVisible();
    await page.getByPlaceholder('搜索姓名或账号', { exact: true }).fill(username);
    await page.getByPlaceholder('搜索姓名或账号', { exact: true }).press('Enter');
    const row = page.locator('.el-table__row').filter({ hasText: username });
    await expect(row).toHaveCount(1);
    await row.getByRole('button', { name: '编辑', exact: true }).click();
    const editing = page.getByRole('dialog').filter({ has: page.getByPlaceholder('请输入账号', { exact: true }) });
    await editing.getByPlaceholder('请输入姓名', { exact: true }).fill('真实表单回归');
    const updated = page.waitForResponse(response => response.request().method() === 'PUT' && response.url() === `${api}${id}/`);
    await editing.getByRole('button', { name: '确定', exact: true }).click();
    expect((await (await updated).json()).code).toBe(2000);
    await expect(editing).not.toBeVisible();
    const stored = await (await page.request.get(`${api}${id}/`, { headers })).json();
    expect(stored.data.name).toBe('真实表单回归');
    const login = await (await page.request.post(`${process.env.API_BASE_URL}/api/login/`, { data: {
      username, password: digest('E2e-Form-Password123!'),
    } })).json();
    expect(login.code).toBe(2000);
  } finally {
    if (id) expect((await (await page.request.delete(`${api}${id}/`, { headers })).json()).code).toBe(2000);
  }
});
