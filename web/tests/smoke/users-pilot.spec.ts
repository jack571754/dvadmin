import { test, expect } from '../i18n/fixtures/auth';
import type { Page } from '@playwright/test';

const failures = new Map<string, string[]>();
test.beforeEach(({ page }, info) => {
  const errors: string[] = [];
  failures.set(info.testId, errors);
  page.on('pageerror', error => errors.push(error.message));
});
test.afterEach(({ page: _page }, info) => {
  const errors = failures.get(info.testId) || [];
  failures.delete(info.testId);
  expect(errors, 'Pilot interactions should not reject outside their UI boundary').toEqual([]);
});

const row = (name: string, id = 701) => ({ id, username: name, name, is_active: true,
  role: [], role_info: [], manage_dept: [], dept_name_all: 'E2E 总部', gender: 1, user_type: 0 });
const response = (data: unknown[], page = 1, limit = 20, total = data.length) => ({ code: 2000, msg: 'ok', data, page, limit, total });
async function navigate(page: Page, path = '/user') {
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.goto(`/#${path}`);
  await expect(page.locator('.el-table').first()).toBeVisible();
}
async function permissions(page: Page, values: string[]) {
  await page.route('**/api/system/menu_button/menu_button_all_permission/**', route => route.fulfill({ json: { code: 2000, data: values, msg: 'ok' } }));
  await page.evaluate(async () => {
    const path = '/src/stores/btnPermission.ts';
    await (await import(path)).BtnPermissionStore().getBtnPermissionStore();
  });
}

test('user and role actions update immediately when grants change', async ({ authenticatedPage }) => {
  const { page } = authenticatedPage;
  for (const feature of ['user', 'role']) {
    await navigate(page, `/${feature}`);
    const add = page.locator('.fs-actionbar').getByRole('button', { name: '新增', exact: true });
    await permissions(page, [`${feature}:Search`]);
    await expect(add).toHaveCount(0);
    await expect(page.getByRole('button', { name: '编辑', exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: '删除', exact: true })).toHaveCount(0);
    await expect(page.getByRole('switch').first()).toBeDisabled();
    await permissions(page, [`${feature}:Search`, `${feature}:Create`, `${feature}:Update`, `${feature}:Delete`]);
    await expect(add).toBeVisible();
    await expect(page.getByRole('button', { name: '编辑', exact: true }).first()).toBeVisible();
    await expect(page.getByRole('switch').first()).toBeEnabled();
    await permissions(page, [`${feature}:Search`]);
    await expect(add).toHaveCount(0);
    await expect(page.getByRole('button', { name: '编辑', exact: true })).toHaveCount(0);
    await expect(page.getByRole('switch').first()).toBeDisabled();
  }
});

test('fast user searches use one latest result and duplicate pending queries share one request', async ({ authenticatedPage }) => {
  const { page } = authenticatedPage;
  const counts = new Map<string, number>();
  let release!: () => void, started!: () => void;
  const barrier = new Promise<void>(resolve => { release = resolve; });
  const requested = new Promise<void>(resolve => { started = resolve; });
  await page.route('**/api/system/user/?*', async route => {
    const query = new URL(route.request().url()).searchParams.get('search') || 'initial';
    counts.set(query, (counts.get(query) || 0) + 1);
    if (query === 'slow') { started(); await barrier; }
    await route.fulfill({ json: response([row(query)]) }).catch(() => {});
  });
  await navigate(page);
  await expect(page.getByText('initial', { exact: true }).first()).toBeVisible();
  expect(counts.get('initial')).toBe(1);
  const search = page.getByRole('textbox', { name: '搜索姓名或账号', exact: true });
  await search.fill('slow');
  await search.press('Enter');
  await requested;
  await search.press('Enter');
  await search.fill('fresh');
  await search.press('Enter');
  await expect(page.getByText('fresh', { exact: true }).first()).toBeVisible();
  release();
  await expect(page.getByText('slow', { exact: true })).toHaveCount(0);
  expect(counts.get('slow')).toBe(1);
  expect(counts.get('fresh')).toBe(1);
});

test('a failed user query retains results and filters and can retry locally', async ({ authenticatedPage }) => {
  const { page } = authenticatedPage;
  let fail = false;
  await page.route('**/api/system/user/?*', route => route.fulfill({ json: fail
    ? { code: 4000, msg: 'fixture query failure', data: null }
    : response([row(new URL(route.request().url()).searchParams.get('search') || 'retained')]) }));
  await navigate(page);
  await expect(page.getByText('retained', { exact: true }).first()).toBeVisible();
  fail = true;
  const search = page.getByRole('textbox', { name: '搜索姓名或账号', exact: true });
  await search.fill('retry-me');
  await search.press('Enter');
  await expect(page.getByRole('alert').filter({ hasText: '用户列表加载失败' })).toBeVisible();
  await expect(page.getByText('retained', { exact: true }).first()).toBeVisible();
  await expect(search).toHaveValue('retry-me');
  fail = false;
  await page.getByRole('button', { name: '重新加载', exact: true }).click();
  await expect(page.getByText('retry-me', { exact: true }).first()).toBeVisible();
  await expect(page.locator('.member-load-error')).toHaveCount(0);
});

test('user department, status and pagination restore after reload while free text is never stored', async ({ authenticatedPage }) => {
  const { page } = authenticatedPage;
  const queries: URLSearchParams[] = [];
  await page.route('**/api/system/user/?*', route => {
    const params = new URL(route.request().url()).searchParams;
    queries.push(params);
    return route.fulfill({ json: response([row(`page-${params.get('page') || '1'}`)], Number(params.get('page') || 1), Number(params.get('limit') || 20), 50) });
  });
  await navigate(page);
  await page.getByText('E2E 总部', { exact: true }).first().click();
  await page.getByRole('tab', { name: '已停用', exact: true }).click();
  await expect(page.getByText('page-1', { exact: true }).first()).toBeVisible();
  await page.locator('.el-pagination').getByRole('button', { name: '下一页' }).click();
  await expect(page.getByText('page-2', { exact: true }).first()).toBeVisible();
  const expectedDept = queries.at(-1)?.get('dept');
  expect(expectedDept).toBeTruthy();
  await page.reload();
  await expect(page.getByText('page-2', { exact: true }).first()).toBeVisible();
  expect(queries.at(-1)?.get('dept')).toBe(expectedDept);
  expect(queries.at(-1)?.get('is_active')).toBe('False');
  await expect(page.getByRole('tab', { name: '已停用', exact: true })).toHaveAttribute('aria-selected', 'true');
  const search = page.getByRole('textbox', { name: '搜索姓名或账号', exact: true });
  await search.fill('private-person-name');
  await search.press('Enter');
  await expect(page.getByText('page-1', { exact: true }).first()).toBeVisible();
  expect(await page.evaluate(() => Object.keys(sessionStorage).filter(key => key.startsWith('dvadmin:users:list:'))
    .some(key => sessionStorage.getItem(key)?.includes('private-person-name')))).toBe(false);
});

for (const feature of ['user', 'role']) {
  test(`${feature} status writes wait for success, block duplicates and recover from failure`, async ({ authenticatedPage }) => {
    const { page } = authenticatedPage;
    await navigate(page, `/${feature}`);
    await permissions(page, [`${feature}:Search`, `${feature}:Update`]);
    const toggle = page.getByRole('switch').first();
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
    let calls = 0, release!: () => void;
    const barrier = new Promise<void>(resolve => { release = resolve; });
    await page.route(`**/api/system/${feature}/*/`, async route => {
      if (route.request().method() !== 'PUT') { await route.continue(); return; }
      calls++;
      await barrier;
      await route.fulfill({ json: { code: 4000, msg: 'fixture write failure', data: null } });
    });
    await toggle.locator('..').click();
    await expect(toggle).toBeDisabled();
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
    expect(calls).toBe(1);
    release();
    await expect(toggle).toBeEnabled();
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
    expect(calls).toBe(1);
    await page.unroute(`**/api/system/${feature}/*/`);
    await page.route(`**/api/system/${feature}/*/`, route => {
      if (route.request().method() !== 'PUT') return route.continue();
      calls++;
      return route.fulfill({ json: { code: 2000, msg: 'ok', data: {} } });
    });
    await toggle.locator('..').click();
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
    expect(calls).toBe(2);
  });
}

test('language changes keep the user query, pagination and advanced panel usable', async ({ authenticatedPage }) => {
  const { page } = authenticatedPage;
  const queries: string[] = [];
  await page.route('**/api/system/user/?*', route => {
    const params = new URL(route.request().url()).searchParams;
    queries.push(params.get('search') || 'initial');
    return route.fulfill({ json: response([row(params.get('search') || 'initial')]) });
  });
  await navigate(page);
  const search = page.getByRole('textbox', { name: '搜索姓名或账号', exact: true });
  await search.fill('kept-filter');
  await search.press('Enter');
  await expect(page.getByText('kept-filter', { exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: '高级筛选', exact: true }).click();
  await page.evaluate(async () => {
    const themePath = '/src/stores/themeConfig.ts';
    const intlPath = '/src/i18n/index.ts';
    (await import(themePath)).useThemeConfig().themeConfig.globalI18n = 'en';
    (await import(intlPath)).i18n.global.locale.value = 'en';
  });
  await expect(page.getByRole('heading', { name: 'Users', exact: true })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Search name or username', exact: true })).toHaveValue('kept-filter');
  await expect(page.getByRole('button', { name: 'Advanced filters', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Search', exact: true }).first().click();
  await expect(page.getByText('kept-filter', { exact: true }).first()).toBeVisible();
  expect(queries.at(-1)).toBe('kept-filter');
});

test('clearing quick search removes its request parameter and advanced reset keeps the selected status scope', async ({ authenticatedPage }) => {
  const { page } = authenticatedPage;
  const queries: URLSearchParams[] = [];
  await page.route('**/api/system/user/?*', route => {
    const params = new URL(route.request().url()).searchParams;
    queries.push(params);
    return route.fulfill({ json: response([row(params.get('search') || 'cleared')]) });
  });
  await navigate(page);
  const search = page.getByRole('textbox', { name: '搜索姓名或账号', exact: true });
  await search.fill('to-clear');
  await search.press('Enter');
  await expect(page.getByText('to-clear', { exact: true }).first()).toBeVisible();
  await search.fill('');
  await search.press('Enter');
  await expect(page.getByText('cleared', { exact: true }).first()).toBeVisible();
  expect(queries.at(-1)?.has('search')).toBe(false);
  await page.getByRole('tab', { name: '已停用', exact: true }).click();
  await page.getByRole('button', { name: '高级筛选', exact: true }).click();
  await search.fill('reset-quick');
  await search.press('Enter');
  await expect(page.getByText('reset-quick', { exact: true }).first()).toBeVisible();
  await page.locator('.fs-search').getByRole('button', { name: '重置', exact: true }).click();
  await expect(search).toHaveValue('');
  await expect(page.getByText('cleared', { exact: true }).first()).toBeVisible();
  expect(queries.at(-1)?.get('is_active')).toBe('False');
});

test('slow department loading does not block an unfiltered user list', async ({ authenticatedPage }) => {
  const { page } = authenticatedPage;
  await page.goto('/#/home');
  await expect(page.locator('.workspace-shortcut').first()).toBeVisible();
  let release!: () => void;
  const barrier = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/api/system/dept/all_dept/**', async route => {
    await barrier;
    await route.fulfill({ json: { code: 2000, msg: 'ok', data: [] } }).catch(() => {});
  });
  await page.route('**/api/system/user/?*', route => route.fulfill({ json: response([row('independent-list')]) }));
  await page.evaluate(async () => {
    const path = '/src/router/index.ts';
    await (await import(path)).router.push('/user');
  });
  await expect(page.getByText('independent-list', { exact: true }).first()).toBeVisible();
  await expect(page.locator('.admin-departments .el-skeleton')).toBeVisible();
  release();
  await expect(page.locator('.admin-departments .el-skeleton')).toHaveCount(0);
});
