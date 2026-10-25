import { Page } from '@playwright/test';

export interface IntlifyWarning {
  text: string;
  type: string;
}

/**
 * Listens to page console output and collects [intlify] warnings.
 * Returns a cleanup function — call it AFTER collecting to stop listening.
 *
 * Usage:
 *   const stop = await watchIntlifyWarnings(page);
 *   await page.waitForTimeout(2000);
 *   const warnings = await stop();
 *   // Now warnings is an array of IntlifyWarning objects
 */
export async function watchIntlifyWarnings(page: Page): Promise<() => IntlifyWarning[]> {
  const warnings: IntlifyWarning[] = [];

  const handler = (msg: { type: () => string; text: () => string }) => {
    if (msg.type() === 'warning') {
      const text = msg.text();
      if (text.includes('[intlify]')) {
        warnings.push({ text, type: msg.type() });
      }
    }
  };

  page.on('console', handler);

  // Return cleanup: remove listener and return collected warnings
  return () => {
    page.off('console', handler);
    return warnings;
  };
}
