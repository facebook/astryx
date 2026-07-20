// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file vitest.config.browser.ts
 * @input Uses vitest/config, @vitejs/plugin-react, and (at run time)
 *   @vitest/browser with the Playwright provider
 * @output Tier 2 (real browser) Vitest config for the aria-spec suite. Kept
 *   separate from vitest.config.ts so the optional @vitest/browser + Playwright
 *   deps are only needed when running the browser tier, and so `pnpm test` (the
 *   hot path) never boots Chromium.
 * @position Config for `pnpm test:aria-browser`. Wired into CI as a gated,
 *   component-changed-only job (see .github/workflows/ci.yml aria-spec-browser).
 *
 * Setup to run locally:
 *   pnpm add -Dw @vitest/browser @vitest/browser-playwright vitest-browser-react
 *   pnpm exec playwright install --with-deps chromium
 *   pnpm test:aria-browser
 *
 * SYNC: Keep the @astryxdesign alias list in sync with vitest.config.ts
 */

import path from 'node:path';
import {defineConfig} from 'vitest/config';
import react from '@vitejs/plugin-react';
// Vitest 4 takes a provider factory, not a string. Imported lazily so the
// default `pnpm test` path never requires this optional dependency.
// @ts-expect-error — optional Tier 2 dependency, present only when running browser tests
import {playwright} from '@vitest/browser-playwright';

const rootDir = path.resolve(__dirname, '.');
const coreSrc = path.resolve(__dirname, 'packages/core/src');

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          [
            '@stylexjs/babel-plugin',
            {
              dev: true,
              runtimeInjection: true,
              genConditionalClasses: true,
              treeshakeCompensation: true,
              aliases: {
                '@astryxdesign/core/*': [path.join(coreSrc, '*')],
                '@astryxdesign/core': [coreSrc],
              },
              unstable_moduleResolution: {type: 'commonJS', rootDir},
            },
          ],
        ],
      },
    }),
  ],
  resolve: {
    alias: [
      {
        find: /^@astryxdesign\/core\/(.*)$/,
        replacement: path.join(coreSrc, '$1'),
      },
      {
        find: '@astryxdesign/aria-spec',
        replacement: path.resolve(rootDir, 'internal/aria-spec/src/index.ts'),
      },
    ],
  },
  test: {
    globals: true,
    name: 'browser',
    include: ['packages/**/src/**/*.aria.browser.test.{ts,tsx}'],
    browser: {
      enabled: true,
      provider: playwright(),
      // Chromium only per-PR: the accessibility tree + keyboard are
      // engine-consistent enough that one browser catches ~all APG issues.
      // Cross-browser is a nightly concern, not a per-PR gate.
      instances: [{browser: 'chromium'}],
      headless: true,
    },
  },
});
