import { Page } from '@playwright/test';
import { watchIntlifyWarnings } from './console-watcher';

/**
 * Switches the page language by setting localStorage and reloading the page.
 * This is more reliable than clicking the UI dropdown, which may have visibility
 * issues (the language icon blends into the header background in some themes).
 *
 * @param page Playwright page
 * @param lang Target language: 'zh-cn' or 'en'
 */
export async function switchLanguage(page: Page, lang: 'zh-cn' | 'en'): Promise<void> {
  // Set the language in localStorage to match how the app reads it at startup
  // App.vue reads: Local.get('themeConfig')?.globalI18n
  await page.evaluate((targetLang) => {
    const current = JSON.parse(localStorage.getItem('themeConfig') || '{}');
    current.globalI18n = targetLang;
    localStorage.setItem('themeConfig', JSON.stringify(current));
  }, lang);
  // Reload to trigger vue-i18n to re-render with the new locale
  await page.reload();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3000); // Allow SPA to re-initialize with new locale
}

/**
 * Helper to check for intlify warnings in a given language.
 * Combines navigation, console watching, and language switching into one flow.
 *
 * NOTE: Does NOT use waitForLoadState('networkidle') because the app has
 * persistent SSE/WebSocket connections (SSE for message center, websocket for
 * real-time updates) that prevent networkidle from being reached.
 *
 * @param page Playwright page
 * @param urlPath Hash route path (e.g., '/home', '/user')
 * @param lang Language to test: 'zh-cn' or 'en'
 * @returns Array of [intlify] warning texts
 */
export async function collectPageWarnings(
  page: Page,
  urlPath: string,
  lang: 'zh-cn' | 'en'
): Promise<{ warnings: { text: string }[] }> {
  await page.goto(`http://localhost:8080/#${urlPath}`);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);

  const stop = await watchIntlifyWarnings(page);
  await page.waitForTimeout(2000);
  const warnings = await stop();

  if (lang === 'en') {
    await switchLanguage(page, 'en');
    const stop2 = await watchIntlifyWarnings(page);
    await page.waitForTimeout(2000);
    const enWarnings = await stop2();
    return { warnings: enWarnings };
  }

  return { warnings };
}
