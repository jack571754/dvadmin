import { test, expect } from './fixtures/auth';
import { watchIntlifyWarnings } from './utils/console-watcher';
import { switchLanguage } from './utils/page-helper';

test.describe('Message Center i18n', () => {
  test('messageCenter page has zero [intlify] warnings in zh-CN and en', async ({ authenticatedPage }) => {
    const { page } = authenticatedPage;

    await page.goto('http://localhost:8080/#/messageCenter');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    const stop1 = await watchIntlifyWarnings(page);
    await page.waitForTimeout(2000);
    const zhWarnings = await stop1();

    await switchLanguage(page, 'en');

    const stop2 = await watchIntlifyWarnings(page);
    await page.waitForTimeout(2000);
    const enWarnings = await stop2();

    expect(
      zhWarnings,
      `zh-CN [intlify] warnings:\n${zhWarnings.map((w) => w.text).join('\n')}`
    ).toHaveLength(0);
    expect(
      enWarnings,
      `en [intlify] warnings:\n${enWarnings.map((w) => w.text).join('\n')}`
    ).toHaveLength(0);
  });
});
