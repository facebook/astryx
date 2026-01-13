/**
 * @file playwright.config.ts
 * @input Uses @playwright/test
 * @output Playwright configuration for e2e tests against Storybook
 * @position Test config; defines browser matrix and web server setup
 *
 * SYNC: When modified, update this header and /e2e/README.md
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:6006',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'yarn storybook',
    url: 'http://localhost:6006',
    reuseExistingServer: !process.env.CI,
  },
});
