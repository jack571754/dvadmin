import { createHash } from 'node:crypto';
import { test as base, expect, type Page } from '@playwright/test';

export interface AuthenticatedPage { page: Page }

export const test = base.extend<{ authenticatedPage: AuthenticatedPage }>({
  authenticatedPage: async ({ page, baseURL }, use) => {
    const response = await page.request.post(`${process.env.API_BASE_URL}/api/login/`, {
      data: { username: process.env.TEST_ADMIN_USER || 'e2e_admin',
        password: createHash('md5').update(process.env.TEST_ADMIN_PASSWORD || 'E2eOnly-ChangeMe123!').digest('hex') },
    });
    expect(response.ok(), 'Isolated E2E login should succeed').toBeTruthy();
    const body = await response.json();
    expect(body.code).toBe(2000);
    const token: unknown = body.data?.access;
    if (typeof token !== 'string' || !baseURL) throw new Error('E2E login missing access token or web origin');
    await page.addInitScript(({ access, origin }) => {
      if (location.origin === origin) {
        localStorage.setItem('token', access);
        localStorage.setItem('themeConfigVersion', JSON.stringify('1.0.0'));
      }
    }, { access: token, origin: new URL(baseURL).origin });
    await use({ page });
  },
});
export { expect };
