import { test, expect } from './fixtures/auth';
import { watchIntlifyWarnings } from './utils/console-watcher';
import { switchLanguage } from './utils/page-helper';

test.describe('User Management i18n', () => {
  test('user page has zero [intlify] warnings in zh-CN and en', async ({ authenticatedPage }) => {
    const { page } = authenticatedPage;

    // 1. Navigate to user management page
    // NOTE: Do NOT use waitForLoadState('networkidle') — the app has persistent
    // SSE/WebSocket connections (message center, real-time updates) that prevent networkidle.
    await page.goto('http://localhost:8080/#/user');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000); // Allow SPA routing + API calls + Fast-Crud table to load

    // 2. Watch in zh-CN (default)
    const stop1 = await watchIntlifyWarnings(page);
    await page.waitForTimeout(2000);
    const zhWarnings = await stop1();

    // 3. Switch to English via localStorage + reload
    await switchLanguage(page, 'en');

    // 4. Watch in en
    const stop2 = await watchIntlifyWarnings(page);
    await page.waitForTimeout(2000);
    const enWarnings = await stop2();

    // 5. Assert
    expect(
      zhWarnings,
      `zh-CN [intlify] warnings on /user:\n${zhWarnings.map((w) => w.text).join('\n')}`
    ).toHaveLength(0);
    expect(
      enWarnings,
      `en [intlify] warnings on /user:\n${enWarnings.map((w) => w.text).join('\n')}`
    ).toHaveLength(0);
  });
});
