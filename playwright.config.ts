// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file playwright.config.ts
 * @input Uses @playwright/test
 * @output The real-Chromium lane for the accessibility spec-test contracts.
 * @position Run with `pnpm test:a11y-contract`. Deliberately separate from
 *   `pnpm test`: the Vitest projects must stay runnable from a cold clone with
 *   no browser installed, and the accessibility-tree and real-browser evidence
 *   layers cannot run without one.
 *
 * `docs/specs/AST-020/spec.md` puts it plainly: a DOM emulator cannot prove
 * focus navigation, computed accessibility-tree exposure, or engine state
 * transitions. Everything matched here is an expectation assigned to a layer
 * only a shipping engine can observe.
 *
 * The component bindings read stories out of a built Storybook, the same
 * artifact every other Chromium check in this repository uses. Build it first:
 *
 *   pnpm storybook:build
 *   npx playwright install chromium
 *   pnpm test:a11y-contract
 *
 * SYNC: When a package gains an accessibility binding, add its spec glob here.
 */

import {defineConfig, devices} from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: [
    // The contract's own conforming/violating fixture proof.
    'internal/a11y-spec/src/**/*.chromium.spec.ts',
    // Component bindings.
    'packages/*/src/**/*.a11y.chromium.spec.ts',
  ],
  // The contract mounts, focuses, and types into one page at a time; parallel
  // workers would race over real keyboard focus.
  workers: 1,
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  reporter: process.env.CI == null ? [['list']] : [['list'], ['github']],
  use: {
    ...devices['Desktop Chrome'],
    // Motion is held at its end state: an expectation that reads state must not
    // read a frame the transition happens to be showing.
    launchOptions: {args: ['--force-prefers-reduced-motion']},
  },
  projects: [{name: 'chromium', use: {...devices['Desktop Chrome']}}],
});
