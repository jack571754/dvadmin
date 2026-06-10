import { test as base } from '@playwright/test';

export interface AuthenticatedPage {
  // authenticated page with token cookie set
}

export const test = base.extend<{ authenticatedPage: AuthenticatedPage }>({
  authenticatedPage: async ({ page }, use) => {
    // Read credentials from .env.test
    const adminUser = process.env.TEST_ADMIN_USER || 'admin';
    const adminPassword = process.env.TEST_ADMIN_PASSWORD || 'admin123456';

    // Login via POST /api/login/ (TokenObtainPairView from backend)
    // Per backend/conftest.py: LOGIN_NO_CAPTCHA_AUTH=True in env.py
    // Per backend/dvadmin/system/views/login.py: POST /api/login/ returns JWT tokens
    const loginResponse = await page.request.post('http://127.0.0.1:8000/api/login/', {
      data: {
        username: adminUser,
        password: adminPassword,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!loginResponse.ok()) {
      const body = await loginResponse.text();
      throw new Error(`Login failed (${loginResponse.status()}): ${body}`);
    }

    const body = await loginResponse.json();
    // LoginSerializer.validate() wraps tokens in body.data
    const token: string = body.data?.access;
    if (!token) {
      throw new Error(`Login response missing 'access' token: ${JSON.stringify(body)}`);
    }

    // Store token in localStorage — matches Session.set('token', ...) in web/src/utils/storage.ts
    // Token is stored in localStorage (not cookies) so Authorization header works across origins
    await page.evaluate((accessToken: string) => {
      window.localStorage.setItem('token', accessToken);
    }, token);

    await use({ page });
  },
});

export { expect } from '@playwright/test';
