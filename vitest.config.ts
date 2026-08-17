// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file vitest.config.ts
 * @input Uses vitest/config, @vitejs/plugin-react
 * @output Vitest configuration with jsdom, coverage, test setup, and the two
 *   test projects (`ui`, `node`)
 * @position Root test config and the actual test entry point. The two projects
 *   under `test.projects` decide which files run where via their per-project
 *   include lists. The root-level `test` options (globals, environment,
 *   coverage, setupFiles, pool sizing) are inherited by projects that set
 *   `extends: true`; the `node` project deliberately does NOT extend, so it
 *   runs in a plain node environment without the jsdom/StyleX overhead.
 *
 *   (Migrated from the removed `vitest.workspace.ts` for Vitest 4, which
 *   dropped the standalone workspace file in favor of inline `test.projects`.)
 *
 * SYNC: When modified, update this header and root README.md
 */

import path from 'node:path';
import {configDefaults, defineConfig} from 'vitest/config';
import react from '@vitejs/plugin-react';

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
              enableDebugDataProp: false,
              runtimeInjection: true,
              genConditionalClasses: true,
              treeshakeCompensation: true,
              aliases: {
                '@astryxdesign/core/*': [
                  path.join(rootDir, 'packages/core/src/*'),
                ],
                '@astryxdesign/core': [path.join(rootDir, 'packages/core/src')],
              },
              unstable_moduleResolution: {
                type: 'commonJS',
                rootDir: rootDir,
              },
            },
          ],
        ],
      },
    }),
  ],
  resolve: {
    alias: [
      // Map @astryxdesign/core subpath imports to source for lab package tests.
      // Must use regex to match subpaths like @astryxdesign/core/Dialog, @astryxdesign/core/theme/tokens.stylex
      // while not breaking core's own relative imports.
      {
        find: /^@astryxdesign\/core\/(.*)$/,
        replacement: path.join(coreSrc, '$1'),
      },
      // Map the bare specifier to source too (charts package tests import
      // runtime components like Text/VisuallyHidden from the package root).
      {
        find: /^@astryxdesign\/core$/,
        replacement: path.join(coreSrc, 'index.ts'),
      },
    ],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['packages/**/src/**/*.{ts,tsx}'],
      exclude: ['**/*.test.{ts,tsx}', '**/*.stories.{ts,tsx}', '**/index.ts'],
    },
    setupFiles: ['./internal/test-utils/src/setup.ts'],
    globalSetup: ['./internal/test-utils/src/globalSetup.ts'],
    // Increase worker heap to prevent OOM crashes on memory-heavy test files
    // (e.g. Chat composer tests with contentEditable + popover portals in
    // jsdom). Vitest 4 removed `poolOptions`; per-worker argv is now top-level.
    execArgv: ['--max-old-space-size=4096'],
    // Test projects (migrated from vitest.workspace.ts). Partitioning rule
    // (nothing can fall through):
    //   - `ui`   = packages/core + packages/lab + packages/charts + packages/richtext —
    //              need jsdom, the StyleX babel
    //              transform, and the jest-dom setup; inherit all of that from
    //              the root config via `extends: true`.
    //   - `node` = everything else (CLI, build tooling, scripts, internal
    //              utils) — no DOM, no StyleX/babel transform, no jest-dom
    //              matchers. Deliberately does NOT extend the root config so it
    //              runs in a plain node environment and skips the per-file jsdom
    //              instantiation that dominated these files' runtime. A new
    //              package lands in `node` by default; if its tests need the DOM
    //              they fail loudly there — move it into the `ui` include list.
    projects: [
      {
        extends: true,
        test: {
          name: 'ui',
          include: [
            'packages/core/src/**/*.test.{ts,tsx,mjs}',
            'packages/lab/src/**/*.test.{ts,tsx,mjs}',
            'packages/charts/src/**/*.test.{ts,tsx,mjs}',
            'packages/richtext/src/**/*.test.{ts,tsx,mjs}',
          ],
        },
      },
      {
        // forks pool (vitest default) is required here: several CLI tests call
        // process.chdir(), which worker threads do not support.
        test: {
          name: 'node',
          globals: true,
          environment: 'node',
          // Several CLI suites spawn a fresh `node bin/astryx.mjs` per assertion
          // (real process boundary). Under the forks pool these cold-starts can
          // run long on a busy box; the 5s default testTimeout then flakes
          // non-deterministically (every failure was "timed out in 5000ms").
          // Give spawn-backed tests + their fixture hooks a real budget so a
          // slow-but-correct run never trips the timeout. (The other half of the
          // fix was removing a full `pnpm build` that scripts/build-css.test ran
          // in-suite, which hogged every core and starved these — see that file.)
          testTimeout: 30_000,
          hookTimeout: 30_000,
          // Build @astryxdesign/core once before workers fork. The build-theme
          // suites need a compiled core; doing it here (not per-suite in
          // parallel workers) avoids concurrent `rimraf dist && build`
          // collisions that flake under Vitest 4's reworked pool.
          globalSetup: ['./vitest.global-setup.node.mjs'],
          include: [
            'packages/**/src/**/*.test.{ts,tsx,mjs}',
            // The CLI dissolved its src/ wrapper (pillars live at the package
            // root), so collect its colocated tests wherever they now live.
            'packages/cli/**/*.test.{ts,tsx,mjs}',
            'internal/**/*.test.{ts,tsx,mjs}',
            'scripts/**/*.test.{ts,tsx,mjs}',
            '.github/scripts/**/*.test.{ts,tsx,mjs}',
            // Storybook config invariants (no DOM needed) — e.g. the
            // workspace source-alias guard in .storybook/main.test.ts.
            'apps/storybook/.storybook/**/*.test.{ts,tsx,mjs}',
          ],
          exclude: [
            ...configDefaults.exclude,
            'packages/core/**',
            'packages/lab/**',
            'packages/charts/**',
            'packages/richtext/**',
          ],
        },
      },
    ],
  },
});
