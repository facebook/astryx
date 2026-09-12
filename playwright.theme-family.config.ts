// Copyright (c) Meta Platforms, Inc. and affiliates.

import {defineConfig, devices} from '@playwright/test';

export default defineConfig({
  testDir: 'packages/cli/clients/cli/commands',
  testMatch: 'theme-build-family.chromium.spec.ts',
  workers: 1,
  fullyParallel: false,
  reporter: [
    ['list'],
    ['html', {outputFolder: 'playwright-report', open: 'never'}],
  ],
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        ...(process.platform === 'darwin' ? {channel: 'chrome'} : {}),
      },
    },
  ],
});
