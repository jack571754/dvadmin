import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/i18n',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:8080',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Load test credentials from .env.test for the authenticated fixture
    env: {
      TEST_ADMIN_USER: process.env.TEST_ADMIN_USER || 'admin',
      TEST_ADMIN_PASSWORD: process.env.TEST_ADMIN_PASSWORD || 'admin123456',
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm run dev',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
