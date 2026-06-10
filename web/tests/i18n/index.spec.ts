import { test, expect } from './fixtures/auth';
import { watchIntlifyWarnings } from './utils/console-watcher';

test.describe('Login Page i18n', () => {
  test('login page has zero [intlify] warnings in zh-CN', async ({ page }) => {
    // Login page has no header nav with language switcher.
    // Set language via localStorage before app loads.
    await page.addInitScript(() => {
      window.localStorage.setItem(
        'themeConfig',
        JSON.stringify({ globalI18n: 'zh-cn' })
      );
    });

    await page.goto('http://localhost:8080/#/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Allow page to settle

    const stop = await watchIntlifyWarnings(page);
    await page.waitForTimeout(2000);
    const zhWarnings = await stop();

    expect(
      zhWarnings,
      `zh-CN [intlify] warnings:\n${zhWarnings.map((w) => w.text).join('\n')}`
    ).toHaveLength(0);
  });

  test('login page has zero [intlify] warnings in en', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        'themeConfig',
        JSON.stringify({ globalI18n: 'en' })
      );
    });

    await page.goto('http://localhost:8080/#/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const stop = await watchIntlifyWarnings(page);
    await page.waitForTimeout(2000);
    const enWarnings = await stop();

    expect(
      enWarnings,
      `en [intlify] warnings:\n${enWarnings.map((w) => w.text).join('\n')}`
    ).toHaveLength(0);
  });
});
