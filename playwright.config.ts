import {defineConfig, devices} from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,
    },
  },

  snapshotPathTemplate:
    '{testDir}/visual-regression.spec.ts-snapshots/{arg}{ext}',

  projects: [
    {
      name: 'chromium',
      use: {...devices['Desktop Chrome']},
    },
  ],

  webServer: {
    command: 'node e2e/serve.mjs',
    port: 6006,
    reuseExistingServer: !process.env.CI,
  },
});
