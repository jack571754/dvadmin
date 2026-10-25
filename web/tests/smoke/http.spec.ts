import { createHash } from 'node:crypto';
import { test, expect } from '../i18n/fixtures/auth';

const paths = { service: '/src/utils/service.ts', legacy: '/src/utils/request.ts',
  session: '/src/utils/storage.ts', events: '/src/shared/access/sessionEvents.ts' };

async function openWorkspace(page: import('@playwright/test').Page) {
  await page.goto('/#/home');
  await expect(page.locator('.workspace-shortcut').first()).toBeVisible();
}

test('compatibility adapters preserve envelopes, serializers and explicit upload headers', async ({ authenticatedPage }) => {
  const { page } = authenticatedPage;
  await openWorkspace(page);
  const captured: Array<{ path: string; query: string; auth: boolean; language?: string; upload?: string; type?: string; data?: string | null }> = [];
  await page.route('**/api/e2e-http/**', async route => {
    const request = route.request();
    const url = new URL(request.url());
    const headers = await request.allHeaders();
    captured.push({ path: url.pathname, query: url.search, auth: headers.authorization?.startsWith('JWT ') || false,
      language: headers['accept-language'], upload: headers['x-upload'], type: headers['content-type'], data: request.postData() });
    await route.fulfill({ json: { code: url.pathname.endsWith('/legacy') ? 0 : 2000, msg: 'ok', data: [1], page: 2, limit: 10, total: 11 } });
  });
  const result = await page.evaluate(async paths => {
    const { request } = await import(paths.service);
    const { default: legacy } = await import(paths.legacy);
    const standard = await request({ url: '/api/e2e-http/standard', params: { is_active: false, empty: '', nested: { name: 'x' } } });
    const compatible = await legacy.get('/api/e2e-http/legacy', { params: { nested: { name: 'x' } } });
    const form = new FormData();
    form.set('file', new Blob(['upload payload']), 'fixture.txt');
    await request({ url: '/api/e2e-http/upload', method: 'post', data: form,
      headers: { 'Content-Type': 'multipart/form-data', 'X-Upload': 'preserved', 'Accept-Language': 'en' } });
    return { standard, compatible };
  }, paths);
  expect(result.standard).toEqual({ code: 2000, msg: 'ok', data: [1], page: 2, limit: 10, total: 11 });
  expect(result.compatible.code).toBe(0);
  expect(new URLSearchParams(captured[0].query).get('is_active')).toBe('False');
  expect(new URLSearchParams(captured[0].query).has('empty')).toBe(false);
  expect(new URLSearchParams(captured[1].query).get('nested.name')).toBe('x');
  expect(captured.every(item => item.auth)).toBe(true);
  expect(captured[2]).toMatchObject({ upload: 'preserved', language: 'en' });
  expect(captured[2].type).toContain('multipart/form-data; boundary=');
  expect(captured[2].data).toContain('upload payload');
});

test('concurrent 401 across both adapters clears once, shows one prompt and navigates without reload', async ({ authenticatedPage }) => {
  const { page } = authenticatedPage;
  await openWorkspace(page);
  await page.route('**/api/e2e-http/**', route => route.fulfill(route.request().url().endsWith('/http')
    ? { status: 401, json: { detail: 'expired' } } : { json: { code: 4001, msg: 'expired', data: null } }));
  const result = await page.evaluate(async paths => {
    Reflect.set(window, 'httpDocumentMarker', 'same-document');
    const { request } = await import(paths.service);
    const { default: legacy } = await import(paths.legacy);
    const { sessionRevision } = await import(paths.events);
    const before = sessionRevision.value;
    const requests = await Promise.allSettled([request({ url: '/api/e2e-http/http' }),
      request({ url: '/api/e2e-http/business' }), legacy.get('/api/e2e-http/legacy')]);
    return { revisionDelta: sessionRevision.value - before, rejected: requests.every(item => item.status === 'rejected') };
  }, paths);
  expect(result).toEqual({ revisionDelta: 1, rejected: true });
  await expect(page).toHaveURL(/#\/login/);
  await expect(page.locator('.el-message-box')).toHaveCount(1);
  await expect(page.locator('.el-message--error')).toHaveCount(0);
  expect(await page.evaluate(() => Reflect.get(window, 'httpDocumentMarker'))).toBe('same-document');
});

test('an old pending 401 cannot expire a replacement account', async ({ authenticatedPage, request }) => {
  const { page } = authenticatedPage;
  await openWorkspace(page);
  const login = await request.post(`${process.env.API_BASE_URL}/api/login/`, { data: { username: 'e2e_reader',
    password: createHash('md5').update(process.env.TEST_ADMIN_PASSWORD || 'E2eOnly-ChangeMe123!').digest('hex') } });
  const reader = await login.json();
  expect(reader.code).toBe(2000);
  let release!: () => void, started!: () => void;
  const held = new Promise<void>(resolve => { release = resolve; });
  const sent = new Promise<void>(resolve => { started = resolve; });
  await page.route('**/api/e2e-http/old', async route => {
    started(); await held;
    await route.fulfill({ status: 401, json: { detail: 'old expired token' } }).catch(() => {});
  });
  await page.evaluate(async paths => {
    const { request } = await import(paths.service);
    Reflect.set(window, 'oldHttpRequest', request({ url: '/api/e2e-http/old' }).then(() => 'unexpected-success',
      (error: { kind: string }) => error.kind));
  }, paths);
  await sent;
  await page.evaluate(async ({ paths, token }) => { (await import(paths.session)).Session.set('token', token); },
    { paths, token: reader.data.access });
  release();
  expect(await page.evaluate(() => Reflect.get(window, 'oldHttpRequest'))).toBe('cancelled');
  await expect(page.locator('.workspace-shortcut').first()).toBeVisible();
  await expect(page.locator('.el-message-box')).toHaveCount(0);
  expect(await page.evaluate(token => localStorage.getItem('token') === token, reader.data.access)).toBe(true);
});

test('caller cancellation is quiet and a failed POST has one attempt and one network notification', async ({ authenticatedPage }) => {
  const { page } = authenticatedPage;
  await openWorkspace(page);
  let writes = 0;
  await page.route('**/api/e2e-http/**', async route => {
    if (route.request().method() === 'POST') writes++;
    await route.abort('failed');
  });
  const kinds = await page.evaluate(async paths => {
    const { request } = await import(paths.service);
    const controller = new AbortController(); controller.abort();
    const cancelled = await request({ url: '/api/e2e-http/cancelled', signal: controller.signal }).catch((error: { kind: string }) => error.kind);
    const network = await request({ url: '/api/e2e-http/write', method: 'post', data: { value: 1 } }).catch((error: { kind: string }) => error.kind);
    return { cancelled, network };
  }, paths);
  expect(kinds).toEqual({ cancelled: 'cancelled', network: 'network' });
  expect(writes).toBe(1);
  await expect(page.locator('.el-message--error')).toHaveCount(1);
  await expect(page.locator('.el-message-box')).toHaveCount(0);
});

test('403 keeps the page and returns validation details without clearing authentication', async ({ authenticatedPage }) => {
  const { page } = authenticatedPage;
  await openWorkspace(page);
  await page.route('**/api/e2e-http/denied', route => route.fulfill({ status: 403,
    json: { code: 4000, msg: 'fixture denied', data: { field: ['not permitted'] } } }));
  const result = await page.evaluate(async paths => {
    const { request } = await import(paths.service);
    const before = localStorage.getItem('token');
    try { await request({ url: '/api/e2e-http/denied' }); return null; }
    catch (error) {
      const failure = error as { kind: string; status: number; data: unknown; msg: string };
      return { kind: failure.kind, status: failure.status, data: failure.data, msg: failure.msg,
        retained: localStorage.getItem('token') === before };
    }
  }, paths);
  expect(result).toEqual({ kind: 'forbidden', status: 403, data: { field: ['not permitted'] }, msg: 'fixture denied', retained: true });
  await expect(page.locator('.workspace-shortcut').first()).toBeVisible();
  await expect(page.locator('.el-message--error')).toHaveCount(1);
  await expect(page.locator('.el-message-box')).toHaveCount(0);
});

test('downloads preserve real bytes and filenames and reject a JSON error Blob without downloading it', async ({ authenticatedPage }) => {
  const { page } = authenticatedPage;
  await openWorkspace(page);
  let downloads = 0;
  page.on('download', () => downloads++);
  await page.route('**/api/e2e-http/file', route => route.fulfill({
    headers: { 'content-type': 'application/octet-stream', 'content-disposition': "attachment; filename*=UTF-8''users%20export.xlsx",
      'access-control-expose-headers': 'Content-Disposition' },
    body: 'fixture spreadsheet bytes',
  }));
  await page.route('**/api/e2e-http/error-file', route => route.fulfill({
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ code: 4000, msg: 'export denied', data: null }),
  }));
  const blob = await page.evaluate(async paths => {
    const { request } = await import(paths.service);
    const response = await request({ url: '/api/e2e-http/file', responseType: 'blob' });
    return { content: await response.data.text(), disposition: response.headers['content-disposition'] };
  }, paths);
  expect(blob.content).toBe('fixture spreadsheet bytes');
  expect(blob.disposition).toContain('users%20export.xlsx');
  const downloaded = page.waitForEvent('download');
  await page.evaluate(async paths => { await (await import(paths.service)).downloadFile({ url: '/api/e2e-http/file', method: 'get' }); }, paths);
  expect((await downloaded).suggestedFilename()).toBe('users export.xlsx');
  const result = await page.evaluate(async paths => {
    try { await (await import(paths.service)).downloadFile({ url: '/api/e2e-http/error-file', method: 'get' }); return null; }
    catch (error) { return (error as { kind: string }).kind; }
  }, paths);
  expect(result).toBe('business');
  expect(downloads).toBe(1);
});
