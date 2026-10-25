import { createHash } from 'node:crypto';
import { test, expect } from '../i18n/fixtures/auth';

const loginPassword = () => createHash('md5').update(process.env.TEST_ADMIN_PASSWORD || 'E2eOnly-ChangeMe123!').digest('hex');
const browserErrors = new Map<string, string[]>();
test.beforeEach(({ page }, testInfo) => {
  const errors: string[] = [];
  browserErrors.set(testInfo.testId, errors);
  page.on('pageerror', error => errors.push(error.stack || error.message));
  page.on('response', async response => {
    if (!response.url().includes('/api/')) return;
    try {
      const body = await response.json();
      if (body.code && body.code !== 2000) {
        await testInfo.attach('api-failure', { body: JSON.stringify({ path: new URL(response.url()).pathname,
          code: body.code, msg: body.msg }), contentType: 'application/json' });
      }
    } catch { /* Non-JSON and aborted responses are not contract samples. */ }
  });
});
test.afterEach(({ page: _page }, testInfo) => {
  const errors = browserErrors.get(testInfo.testId) || [];
  browserErrors.delete(testInfo.testId);
  expect(errors, 'Session operations must not leave uncaught browser errors').toEqual([]);
});

const modulePaths = {
  backend: '/src/router/backEnd.ts', session: '/src/utils/storage.ts', router: '/src/router/index.ts',
  user: '/src/stores/userInfo.ts', pinia: '/src/stores/index.ts', routes: '/src/stores/routesList.ts',
  keepAlive: '/src/stores/keepAliveNames.ts', events: '/src/utils/mitt.ts',
  sessionEvents: '/src/shared/access/sessionEvents.ts',
};

test('concurrent bootstrap callers share required requests and reuse the ready session', async ({ authenticatedPage }) => {
  const { page } = authenticatedPage;
  await page.goto('/#/home');
  await expect(page.locator('.workspace-shortcut').first()).toBeVisible();
  const counts = { user: 0, menu: 0, permission: 0, dept: 0, dictionary: 0, settings: 0 };
  page.on('request', request => {
    const path = new URL(request.url()).pathname;
    if (path.endsWith('/user/user_info/')) counts.user++;
    if (path.endsWith('/menu/web_router/')) counts.menu++;
    if (path.endsWith('/menu_button_all_permission/')) counts.permission++;
    if (path.endsWith('/dept/all_dept/')) counts.dept++;
    if (path.endsWith('/init/dictionary/')) counts.dictionary++;
    if (path.endsWith('/init/settings/')) counts.settings++;
  });
  await page.evaluate(async paths => {
    const { resetSessionRoutes, initBackEndControlRoutes } = await import(paths.backend);
    resetSessionRoutes();
    await Promise.all(Array.from({ length: 8 }, () => initBackEndControlRoutes()));
    await initBackEndControlRoutes();
  }, modulePaths);
  expect(counts).toEqual({ user: 1, menu: 1, permission: 1, dept: 1, dictionary: 1, settings: 1 });
});

test('a failing auxiliary endpoint keeps menus and permissions usable', async ({ authenticatedPage }) => {
  const { page } = authenticatedPage;
  await page.goto('/#/home');
  await expect(page.locator('.workspace-shortcut').first()).toBeVisible();
  let dictionaryCalls = 0;
  await page.route('**/api/init/dictionary/**', async route => {
    dictionaryCalls++;
    await route.fulfill({ status: 500, json: { code: 5000, msg: 'dictionary unavailable' } });
  });
  await page.evaluate(async paths => {
    const backend = await import(paths.backend);
    backend.resetSessionRoutes();
    Reflect.set(window, 'bootstrapWithDictionaryDown', backend.initBackEndControlRoutes()
      .then(() => 'ok', (error: Error) => `failed:${error.message}`));
  }, modulePaths);
  expect(await page.evaluate(() => Reflect.get(window, 'bootstrapWithDictionaryDown'))).toBe('ok');
  expect(dictionaryCalls).toBe(1);
  expect(await page.evaluate(async paths => (await import(paths.sessionEvents)).sessionViewReady.value, modulePaths)).toBe(true);
  expect(await page.evaluate(async paths => {
    const { default: pinia } = await import(paths.pinia);
    return (await import(paths.routes)).useRoutesList(pinia).routesList.length;
  }, modulePaths)).toBeGreaterThan(0);
});

test('a failing permission endpoint still closes the shell', async ({ authenticatedPage }) => {
  const { page } = authenticatedPage;
  await page.goto('/#/home');
  await expect(page.locator('.workspace-shortcut').first()).toBeVisible();
  await page.route('**/api/system/menu_button/menu_button_all_permission/**', route =>
    route.fulfill({ status: 500, json: { code: 5000, msg: 'permission unavailable' } }));
  await page.evaluate(async paths => {
    const backend = await import(paths.backend);
    backend.resetSessionRoutes();
    Reflect.set(window, 'bootstrapWithoutPermissions', backend.initBackEndControlRoutes()
      .then(() => 'unexpected-success', (error: Error) => `failed:${error.message}`));
  }, modulePaths);
  expect(await page.evaluate(() => Reflect.get(window, 'bootstrapWithoutPermissions'))).toMatch(/^failed:/);
  expect(await page.evaluate(async paths => (await import(paths.sessionEvents)).sessionViewReady.value, modulePaths)).toBe(false);
});

test('account replacement clears menus, tabs, cached pages and loads the new identity without reload', async ({ authenticatedPage, request }) => {
  const { page } = authenticatedPage;
  const login = await request.post(`${process.env.API_BASE_URL}/api/login/`, {
    data: { username: 'e2e_reader', password: loginPassword() },
  });
  const reader = await login.json();
  expect(reader.code).toBe(2000);
  await page.goto('/#/user');
  await expect(page.getByText('e2e_reader', { exact: true }).first()).toBeVisible();
  await page.evaluate(() => { Reflect.set(window, 'sessionDocumentMarker', 'same-document'); });
  await page.evaluate(async ({ paths, token }) => {
    const { default: pinia } = await import(paths.pinia);
    const { router } = await import(paths.router);
    router.addRoute({ path: '/previous-account-only', name: 'previous-account-only', component: { render: () => null } });
    const { useKeepALiveNames } = await import(paths.keepAlive);
    useKeepALiveNames(pinia).cachedViews.push('previous-account-only');
    const { Session } = await import(paths.session);
    Session.set('tagsViewList', [{ name: 'previous-account-only', path: '/previous-account-only', meta: { isKeepAlive: true } }]);
    Session.set('token', token);
    if (router.hasRoute('previous-account-only')) throw new Error('Old dynamic route survived');
    if (useKeepALiveNames(pinia).cachedViews.length) throw new Error('Old cache survived');
    if (Session.get('tagsViewList')) throw new Error('Old tags survived');
  }, { paths: modulePaths, token: reader.data.access });
  await expect.poll(() => page.evaluate(async paths => {
    const { default: pinia } = await import(paths.pinia);
    const { useUserInfo } = await import(paths.user);
    return useUserInfo(pinia).userInfos.name;
  }, modulePaths)).toBe('e2e_reader');
  await expect(page.locator('.el-table').first()).toBeVisible();
  expect(await page.evaluate(() => Reflect.get(window, 'sessionDocumentMarker'))).toBe('same-document');
  await expect(page.getByRole('button', { name: '新增', exact: true })).toHaveCount(0);
});

test('late old profile response cannot restore identity after logout', async ({ authenticatedPage }) => {
  const { page } = authenticatedPage;
  await page.goto('/#/home');
  await expect(page.locator('.workspace-shortcut').first()).toBeVisible();
  let release!: () => void;
  const barrier = new Promise<void>(resolve => { release = resolve; });
  let started!: () => void;
  const requested = new Promise<void>(resolve => { started = resolve; });
  await page.route('**/api/system/user/user_info/**', async route => {
    const response = await route.fetch();
    started();
    await barrier;
    await route.fulfill({ response });
  });
  await page.evaluate(paths => {
    Reflect.set(window, 'lateProfileDone', (async () => {
      const { default: pinia } = await import(paths.pinia);
      const { useUserInfo } = await import(paths.user);
      try { await useUserInfo(pinia).getApiUserInfo(); return 'unexpected-success'; }
      catch (error) { return error instanceof Error ? error.name : 'unknown'; }
    })());
  }, modulePaths);
  await requested;
  await page.evaluate(async paths => { (await import(paths.session)).Session.remove('token'); }, modulePaths);
  release();
  await expect(page).toHaveURL(/#\/login/);
  expect(await page.evaluate(() => Reflect.get(window, 'lateProfileDone'))).toBe('AbortError');
  expect(await page.evaluate(async paths => {
    const { default: pinia } = await import(paths.pinia);
    const { useUserInfo } = await import(paths.user);
    return useUserInfo(pinia).userInfos.id;
  }, modulePaths)).toBe('');
});

test('repeated session changes do not accumulate navigation listeners', async ({ authenticatedPage, request }) => {
  const { page } = authenticatedPage;
  await page.goto('/#/home');
  await expect(page.locator('.workspace-shortcut').first()).toBeVisible();
  const snapshot = () => page.evaluate(async paths => {
    const { default: bus } = await import(paths.events);
    return Object.fromEntries([...bus.all.entries()].map(([key, handlers]) => [String(key), handlers.length]));
  }, modulePaths);
  const initial = await snapshot();
  for (const username of ['e2e_reader', 'e2e_admin', 'e2e_reader']) {
    const response = await request.post(`${process.env.API_BASE_URL}/api/login/`, {
      data: { username, password: loginPassword() },
    });
    const body = await response.json();
    await page.evaluate(async ({ paths, token }) => {
      (await import(paths.session)).Session.set('token', token);
    }, { paths: modulePaths, token: body.data.access });
    await expect(page.locator('.workspace-shortcut').first()).toBeVisible();
    // The new shell must be mounted before comparing listeners.
    await expect(page.locator('.layout-navbars-tagsview')).toBeVisible();
    await expect.poll(snapshot).toEqual(initial);
  }
});


test('a late old menu cannot publish routes after account replacement', async ({ authenticatedPage, request }) => {
  const { page } = authenticatedPage;
  const response = await request.post(`${process.env.API_BASE_URL}/api/login/`, {
    data: { username: 'e2e_reader', password: loginPassword() },
  });
  const reader = await response.json();
  await page.goto('/#/home');
  await expect(page.locator('.workspace-shortcut').first()).toBeVisible();
  let release!: () => void;
  const barrier = new Promise<void>(resolve => { release = resolve; });
  let started!: () => void;
  const requested = new Promise<void>(resolve => { started = resolve; });
  let held = false;
  await page.route('**/api/system/menu/web_router/**', async route => {
    if (held) { await route.continue(); return; }
    held = true;
    const original = await route.fetch();
    const body = await original.json();
    body.data.push({ id: 999991, parent: null, component: 'system/user/index',
      component_name: 'OldAccountOnly', web_path: '/old-account-only', title: 'Old account only', visible: true });
    started();
    await barrier;
    await route.fulfill({ json: body });
  });
  await page.evaluate(async paths => {
    const backend = await import(paths.backend);
    backend.resetSessionRoutes();
    Reflect.set(window, 'bootstrapAttempt', backend.initBackEndControlRoutes().then(() => 'unexpected-success',
      (error: Error) => error.name));
  }, modulePaths);
  await requested;
  await page.evaluate(async ({ paths, token }) => {
    (await import(paths.session)).Session.set('token', token);
  }, { paths: modulePaths, token: reader.data.access });
  await expect(page.locator('.workspace-shortcut').first()).toBeVisible();
  release();
  expect(await page.evaluate(() => Reflect.get(window, 'bootstrapAttempt'))).toBe('AbortError');
  expect(await page.evaluate(async paths => (await import(paths.router)).router.hasRoute('OldAccountOnly'), modulePaths)).toBe(false);
});

test('all four retained layouts survive navigation and unmount without delayed errors', async ({ authenticatedPage }) => {
  const { page } = authenticatedPage;
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto('/#/home');
  await expect(page.locator('.workspace-shortcut').first()).toBeVisible();
  for (const layout of ['classic', 'transverse', 'columns', 'defaults']) {
    await page.evaluate(async ({ layout, paths }) => {
      const themePath = '/src/stores/themeConfig.ts';
      const { default: pinia } = await import(paths.pinia);
      const store = (await import(themePath)).useThemeConfig(pinia);
      store.themeConfig.layout = layout;
      const { Local } = await import(paths.session);
      Local.set('oldLayout', layout);
      Local.set('themeConfig', store.themeConfig);
      await (await import(paths.router)).router.push('/user');
    }, { layout, paths: modulePaths });
    await expect(page.locator('.el-table').first()).toBeVisible();
    await page.evaluate(async paths => { await (await import(paths.router)).router.push('/home'); }, modulePaths);
    await expect(page.locator('.workspace-shortcut').first()).toBeVisible();
  }
});

test('fresh login preserves its token and waits for initialization before entering the workspace', async ({ page }) => {
  await page.goto('/#/login');
  await page.getByPlaceholder('请输入登录账号/邮箱/手机号').fill('e2e_admin');
  await page.getByPlaceholder('请输入登录密码').fill(process.env.TEST_ADMIN_PASSWORD || 'E2eOnly-ChangeMe123!');
  await page.getByRole('tabpanel', { name: '账号密码登录' }).getByRole('button', { name: '登 录', exact: true }).click();
  await expect(page.locator('.workspace-shortcut').first()).toBeVisible();
  await expect(page).toHaveURL(/#\/home/);
  expect(await page.evaluate(() => Boolean(localStorage.getItem('token')))).toBe(true);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('themeConfigVersion') || 'null'))).toBe('1.0.0');
});

test('OAuth token cleanup preserves the requested hash route and unrelated query parameters', async ({ page, request }) => {
  const login = await request.post(`${process.env.API_BASE_URL}/api/login/`, {
    data: { username: 'e2e_reader', password: loginPassword() },
  });
  const body = await login.json();
  expect(body.code).toBe(2000);
  await page.goto(`/?_oauth2_token=${encodeURIComponent(body.data.access)}&source=e2e#/user?deepLink=1`);
  await expect(page.getByText('e2e_reader', { exact: true }).first()).toBeVisible();
  const location = await page.evaluate(() => ({
    tokenInUrl: new URL(window.location.href).searchParams.has('_oauth2_token'),
    source: new URL(window.location.href).searchParams.get('source'),
    hash: window.location.hash,
  }));
  expect(location).toEqual({ tokenInUrl: false, source: 'e2e', hash: '#/user?deepLink=1' });
});
