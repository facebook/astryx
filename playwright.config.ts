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

// GitHub Actions sets CI=true; some runners set it to an empty string. One
// definition, so `forbidOnly` and the reporter choice cannot disagree.
const isCI = (process.env.CI ?? '') !== '';

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
  forbidOnly: isCI,
  reporter: isCI ? [['list'], ['github']] : [['list']],
  // One `use` block, on the project. Motion is NOT held here: neither
  // `use.reducedMotion` nor Chromium's `--force-prefers-reduced-motion` reaches
  // `matchMedia` in this Playwright version — both were measured returning
  // false. The specs call `holdMotionStill(page)` instead, which does work.
  projects: [{name: 'chromium', use: {...devices['Desktop Chrome']}}],
});
