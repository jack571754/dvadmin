import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { test, expect } from '../i18n/fixtures/auth';

test('authenticated browser opens the redesigned user list and workspace', async ({ authenticatedPage }) => {
  const { page } = authenticatedPage;
  await mkdir('quality-reports', { recursive: true });
  await page.setViewportSize({ width: 1440, height: 960 });
  const result = page.waitForResponse(response => response.url().includes('/api/system/user/?') && response.request().method() === 'GET');
  await page.goto('/#/user');
  const response = await result;
  expect((await response.json()).code).toBe(2000);
  await expect(page.locator('.el-table').first()).toBeVisible();
  await expect(page.getByText('e2e_reader', { exact: true }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: '用户管理', exact: true })).toBeVisible();
  await expect(page.locator('.loading-next')).toHaveCount(0);
  await page.screenshot({ path: 'quality-reports/actual-v2-users.png', fullPage: false, animations: 'disabled' });
  const searchResponse = page.waitForResponse(response => response.url().includes('/api/system/user/?') && new URL(response.url()).searchParams.get('search') === 'e2e_reader');
  await page.getByRole('textbox', { name: '搜索姓名或账号', exact: true }).fill('e2e_reader');
  await page.getByRole('textbox', { name: '搜索姓名或账号', exact: true }).press('Enter');
  const searched = await (await searchResponse).json();
  expect(searched.data).toHaveLength(1);
  expect(searched.data[0].username).toBe('e2e_reader');
  const disabledResponse = page.waitForResponse(response => response.url().includes('/api/system/user/?') && new URL(response.url()).searchParams.get('is_active') === 'False');
  await page.getByRole('tab', { name: '已停用', exact: true }).click();
  const disabled = await (await disabledResponse).json();
  expect(disabled.data.every((item: { is_active: boolean }) => item.is_active === false)).toBeTruthy();
  await page.goto('/#/home');
  await expect(page.locator('.workspace-shortcut').first()).toBeVisible();
  await page.screenshot({ path: 'quality-reports/actual-v2-home.png', fullPage: false, animations: 'disabled' });
});

for (const username of ['e2e_admin', 'e2e_reader', 'e2e_scoped']) {
  test(`${username}: login, menu and query contracts`, async ({ request }, testInfo) => {
    const password = createHash('md5').update(process.env.TEST_ADMIN_PASSWORD || 'E2eOnly-ChangeMe123!').digest('hex');
    const login = await request.post(`${process.env.API_BASE_URL}/api/login/`, { data: { username, password } });
    const body = await login.json();
    expect(body.code).toBe(2000);
    const headers = { Authorization: `JWT ${body.data.access}` };
    const menu = await request.get(`${process.env.API_BASE_URL}/api/system/menu/web_router/`, { headers });
    const menuBody = await menu.json();
    expect(menuBody.code).toBe(2000);
    const paths = menuBody.data.map((item: { web_path: string }) => item.web_path);
    expect(new Set(paths).size).toBe(paths.length);
    expect(menuBody.data.some((item: { component: string }) => item.component === 'system/user/index')).toBeTruthy();
    const users = await request.get(`${process.env.API_BASE_URL}/api/system/user/?page=1&limit=100`, { headers });
    const userBody = await users.json();
    expect(userBody.code).toBe(2000);
    expect(Array.isArray(userBody.data)).toBeTruthy();
    const names = userBody.data.map((item: { username: string }) => item.username);
    // The existing user endpoint excludes superusers from its result set.
    expect(names).toContain(username === 'e2e_admin' ? 'e2e_reader' : username);
    if (username === 'e2e_scoped') expect(names).not.toContain('e2e_outside');
    if (username === 'e2e_reader') {
      expect(names).toContain('e2e_outside');
      const denied = await request.post(`${process.env.API_BASE_URL}/api/system/user/`, { headers, data: {} });
      const deniedBody = await denied.json();
      expect(deniedBody.code).toBe(4000);
      expect(String(deniedBody.msg)).toMatch(/permission|权限/i);
    }
    const contract = JSON.stringify({ username,
      login: { code: body.code, fields: Object.keys(body.data).filter(key => !['access', 'refresh'].includes(key)) },
      menu: { code: menuBody.code, count: menuBody.data.length },
      users: { code: userBody.code, page: userBody.page, limit: userBody.limit, total: userBody.total,
        sampleFields: Object.keys(userBody.data[0] || {}) } }, null, 2);
    await mkdir('quality-reports', { recursive: true });
    await writeFile(`quality-reports/contract-${username}.json`, contract);
    await testInfo.attach('sanitized-contract', { body: contract, contentType: 'application/json' });
  });
}
