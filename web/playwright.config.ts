import { defineConfig, devices } from '@playwright/test';
import { testEnvironment } from './scripts/test-environment.mjs';

const urls = testEnvironment();
process.env.WEB_BASE_URL = urls.web;
process.env.API_BASE_URL = urls.api;

export default defineConfig({
  testDir: './tests', fullyParallel: false, workers: 1,
  forbidOnly: !!process.env.CI, retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: urls.web, trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [
    { name: 'smoke', testMatch: /smoke\/.*\.spec\.ts/, use: { ...devices['Desktop Chrome'] } },
    { name: 'i18n', testMatch: /i18n\/.*\.spec\.ts/, use: { ...devices['Desktop Chrome'] } },
    { name: 'baseline', testMatch: /baseline\/.*\.spec\.ts/, use: { ...devices['Desktop Chrome'] } },
    { name: 'parity', testMatch: /parity\/.*\.spec\.ts/, use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: [
    { command: 'node scripts/e2e-server.mjs --backend', url: `${urls.api}/healthz`, timeout: 180_000, reuseExistingServer: false },
    { command: 'node scripts/e2e-server.mjs', url: urls.web, timeout: 180_000, reuseExistingServer: false },
  ],
});
