import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { test, expect } from '@playwright/test';

test('production preview: 20 cold and 20 warm user-list samples', async ({ browser, request, baseURL }, testInfo) => {
  test.skip(process.env.E2E_PREVIEW !== '1', 'Run with E2E_PREVIEW=1 to measure a production preview.');
  test.setTimeout(240_000);
  const login = await request.post(`${process.env.API_BASE_URL}/api/login/`, { data: {
    username: 'e2e_admin', password: createHash('md5').update(process.env.TEST_ADMIN_PASSWORD || 'E2eOnly-ChangeMe123!').digest('hex'),
  } });
  const body = await login.json();
  expect(body.code).toBe(2000);
  if (!baseURL) throw new Error('Missing preview URL');
  const samples: { coldMs: number; warmMs: number; jsTransferBytes: number; jsRequests: number }[] = [];
  for (let i = 0; i < 20; i++) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'zh-CN' });
    try {
      await context.addInitScript(({ token, origin }) => {
        if (location.origin === origin) {
          localStorage.setItem('token', token);
          localStorage.setItem('themeConfigVersion', '1.0.0');
        }
      }, { token: String(body.data.access), origin: baseURL });
      const page = await context.newPage();
      const start = performance.now();
      await page.goto(`${baseURL}/#/user`);
      await expect(page.locator('.el-table').first()).toBeVisible();
      await expect(page.getByText('e2e_reader', { exact: true }).first()).toBeVisible();
      const coldMs = performance.now() - start;
      const resources = await page.evaluate(() => performance.getEntriesByType('resource')
        .filter((entry): entry is PerformanceResourceTiming => entry instanceof PerformanceResourceTiming)
        .filter(entry => entry.name.includes('/assets/') && new URL(entry.name).pathname.endsWith('.js'))
        .map(entry => entry.transferSize));
      await page.goto(`${baseURL}/#/home`);
      await expect(page.locator('.home-container')).toBeVisible();
      const warmStart = performance.now();
      await page.goto(`${baseURL}/#/user`);
      await expect(page.getByText('e2e_reader', { exact: true }).first()).toBeVisible();
      samples.push({ coldMs, warmMs: performance.now() - warmStart,
        jsTransferBytes: resources.reduce((sum, size) => sum + size, 0), jsRequests: resources.length });
    } finally { await context.close(); }
  }
  const percentile = (values: number[], p: number) => [...values].sort((a, b) => a - b)[Math.ceil(values.length * p) - 1];
  const report = { samples, conditions: { browser: browser.version(), viewport: '1440x900',
    mode: 'production preview', network: 'loopback, no throttling', cpu: 'host, no throttling',
    cold: 'fresh browser context per sample', warm: 'hash navigation home -> user in the same context',
    metric: 'navigation until seeded user row is visible; includes API and automation overhead',
    compression: 'Vite preview defaults; transfer bytes are not gzip bundle size' },
    coldP75Ms: percentile(samples.map(sample => sample.coldMs), .75),
    warmP75Ms: percentile(samples.map(sample => sample.warmMs), .75) };
  await mkdir('quality-reports', { recursive: true });
  await writeFile('quality-reports/browser-baseline.json', JSON.stringify(report, null, 2));
  await testInfo.attach('browser-baseline', { body: JSON.stringify(report, null, 2), contentType: 'application/json' });
});
