// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file vitest.config.browser.ts
 * @input Uses vitest/config, @vitejs/plugin-react, and (at run time)
 *   @vitest/browser with the Playwright provider
 * @output Tier 2 (real browser) Vitest config for the aria-spec suite. Kept
 *   separate from vitest.config.ts so the optional @vitest/browser + Playwright
 *   deps are only needed when running the browser tier, and so `pnpm test` (the
 *   hot path) never boots Chromium.
 * @position Config for `pnpm test:aria-browser`. NOT wired into CI yet — the
 *   Tier 2 suite is run on demand while the prototype is under review.
 *
 * Setup to run locally (the deps are already root devDependencies):
 *   pnpm exec playwright install --with-deps chromium
 *   pnpm test:aria-browser
 *
 * SYNC: Keep the @astryxdesign alias list in sync with vitest.config.ts
 */

import path from 'node:path';
import {defineConfig} from 'vitest/config';
import react from '@vitejs/plugin-react';
// Vitest 4 takes a provider factory, not a string.
import {defineBrowserCommand, playwright} from '@vitest/browser-playwright';

const rootDir = path.resolve(__dirname, '.');
const coreSrc = path.resolve(__dirname, 'packages/core/src');

/**
 * Serialize the REAL accessibility tree of a selector-addressed element.
 *
 * Playwright's `Locator.ariaSnapshot()` lives in the Node process, and Vitest's
 * in-browser `Locator` only exposes the tree through the `toMatchAriaSnapshot`
 * matcher (which asserts rather than returning it). A browser command is the
 * supported bridge, and it is what `createBrowserHarness()` calls.
 *
 * SYNC: The augmentation of `BrowserCommands` in
 *   internal/aria-spec/src/harness/browserHarness.ts must match this signature.
 */
const ariaSnapshot = defineBrowserCommand<[selector: string]>(
  // Tests render inside the tester iframe, so the locator must be scoped to it —
  // `page.locator()` would search the orchestrator page and never resolve.
  async ({iframe}, selector) => await iframe.locator(selector).ariaSnapshot(),
);

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
    ],
    // Core's source and the browser test runner must share ONE React instance.
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    // Pre-bundle React (and the browser render helper) up front. Discovering
    // them mid-run re-optimizes the graph while the page is live and leaves two
    // React copies behind — the classic "Cannot read properties of null
    // (reading 'useId')" from a hook called on the second copy.
    include: [
      'react',
      'react/jsx-dev-runtime',
      'react-dom',
      'react-dom/client',
      'vitest-browser-react',
    ],
  },
  test: {
    globals: true,
    name: 'browser',
    include: ['packages/**/src/**/*.aria.browser.test.{ts,tsx}'],
    browser: {
      enabled: true,
      provider: playwright(),
      commands: {ariaSnapshot},
      // Chromium only per-PR: the accessibility tree + keyboard are
      // engine-consistent enough that one browser catches ~all APG issues.
      // Cross-browser is a nightly concern, not a per-PR gate.
      instances: [{browser: 'chromium'}],
      headless: true,
    },
  },
});
