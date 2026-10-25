import { test, expect } from '../i18n/fixtures/auth';

test('permission directives and slot components react to grants, binding changes and logout', async ({ authenticatedPage }) => {
  const { page } = authenticatedPage;
  await page.goto('/#/home');
  await expect(page.locator('.workspace-shortcut').first()).toBeVisible();
  let grants = ['harness:edit'];
  await page.route('**/api/system/menu_button/menu_button_all_permission/**', route => route.fulfill({
    json: { code: 2000, data: grants, msg: 'ok' },
  }));
  await page.evaluate(async () => {
    const modulePath = '/tests/helpers/permission-harness.js';
    const harness = await (await import(modulePath)).mountPermissionHarness();
    Object.assign(window, { permissionHarness: harness });
    if (!harness.sameStore) throw new Error('Compatibility store differs');
  });
  const run = (method: string, value?: string) => page.evaluate(async ({ method, value }) => {
    const harness = Reflect.get(window, 'permissionHarness');
    await harness[method](value);
  }, { method, value });
  await expect(page.locator('#permission-single')).toBeHidden();
  await expect(page.locator('#component-single')).toHaveCount(0);
  await run('load');
  await expect(page.locator('#permission-single')).toBeVisible();
  await expect(page.locator('#permission-single')).toHaveCSS('display', 'inline-flex');
  await expect(page.locator('#permission-some')).toBeVisible();
  await expect(page.locator('#permission-every')).toBeHidden();
  await expect(page.locator('#component-single')).toBeVisible();
  await expect(page.locator('#component-some')).toBeVisible();
  await expect(page.locator('#component-every')).toHaveCount(0);
  await run('binding', 'harness:view');
  await expect(page.locator('#permission-single')).toBeHidden();
  await expect(page.locator('#component-single')).toHaveCount(0);
  grants = ['harness:view', 'harness:edit'];
  await run('load');
  await expect(page.locator('#permission-single')).toBeVisible();
  await expect(page.locator('#permission-every')).toBeVisible();
  await expect(page.locator('#component-every')).toBeVisible();
  await run('logout');
  await expect(page.locator('#permission-single')).toBeHidden();
  await expect(page.locator('#permission-some')).toBeHidden();
  await expect(page.locator('#permission-every')).toBeHidden();
  await expect(page.locator('#component-single')).toHaveCount(0);
  await expect(page.locator('#component-some')).toHaveCount(0);
  await expect(page.locator('#component-every')).toHaveCount(0);
  await run('unmount');
  await expect(page.locator('#permission-harness')).toHaveCount(0);
});

test('user page waits for delayed permissions before constructing CRUD actions', async ({ authenticatedPage }) => {
  const { page } = authenticatedPage;
  let release!: () => void;
  const barrier = new Promise<void>(resolve => { release = resolve; });
  let requested!: () => void;
  const started = new Promise<void>(resolve => { requested = resolve; });
  let userQueries = 0;
  page.on('request', request => {
    if (/\/api\/system\/user\/\?/.test(request.url())) userQueries++;
  });
  await page.route('**/api/system/menu_button/menu_button_all_permission/**', async route => {
    requested();
    await barrier;
    await route.continue();
  });
  await page.goto('/#/user');
  await started;
  expect(userQueries).toBe(0);
  release();
  await expect(page.getByText('e2e_reader', { exact: true }).first()).toBeVisible();
  await expect(page.locator('.loading-next')).toHaveCount(0);
});

test('failed permission initialization releases loading and retries on the next navigation', async ({ authenticatedPage }) => {
  const { page } = authenticatedPage;
  let fail = true;
  await page.route('**/api/system/menu_button/menu_button_all_permission/**', async route => {
    if (fail) await route.fulfill({ json: { code: 4000, msg: 'permission fixture unavailable', data: null } });
    else await route.continue();
  });
  const failed = page.waitForResponse(response => response.url().includes('/menu_button_all_permission/'));
  await page.goto('/#/user');
  await failed;
  await expect(page.locator('.loading-next')).toHaveCount(0);
  await expect(page.locator('.el-table')).toHaveCount(0);
  fail = false;
  await page.evaluate(async () => {
    const modulePath = '/src/router/index.ts';
    await (await import(modulePath)).router.push('/user');
  });
  await expect(page.getByText('e2e_reader', { exact: true }).first()).toBeVisible();
  await expect(page.locator('.loading-next')).toHaveCount(0);
});

test('signing out in another tab immediately revokes rendered grants', async ({ authenticatedPage, context }) => {
  const { page } = authenticatedPage;
  await page.goto('/#/home');
  await expect(page.locator('.workspace-shortcut').first()).toBeVisible();
  const peer = await context.newPage();
  await peer.goto('/favicon.ico');
  await page.route('**/api/system/menu_button/menu_button_all_permission/**', route => route.fulfill({
    json: { code: 2000, data: ['harness:edit'], msg: 'ok' },
  }));
  await page.evaluate(async () => {
    const modulePath = '/tests/helpers/permission-harness.js';
    const harness = await (await import(modulePath)).mountPermissionHarness();
    Object.assign(window, { permissionHarness: harness });
    await harness.load();
  });
  await expect(page.locator('#permission-single')).toBeVisible();
  await peer.evaluate(() => localStorage.removeItem('token'));
  await expect(page.locator('#permission-single')).toBeHidden();
  await expect(page.locator('#component-single')).toHaveCount(0);
  await peer.close();
});
