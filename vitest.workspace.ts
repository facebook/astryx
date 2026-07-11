// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file vitest.workspace.ts
 * @input Uses vitest/config defineWorkspace, extends ./vitest.config.ts
 * @output Two test projects: `ui` (jsdom + StyleX babel) and `node` (plain node)
 * @position Test entry point; when this file exists, `vitest run` executes the
 *   projects below instead of the root config's include list.
 *
 * Why two projects: ~105 of the ~316 test files (packages/cli, scripts,
 * internal tooling) never touch the DOM, but the single root config gave every
 * file a fresh jsdom environment plus the React/StyleX babel transform —
 * pure per-file overhead for node code. Splitting lets the node project skip
 * both.
 *
 * Partitioning rule (nothing can fall through):
 *   - `ui`  = packages/core + packages/lab (explicit list)
 *   - `node`= everything else the root include matches (same globs, with
 *             core/lab excluded)
 * A new package lands in `node` by default; if its tests need the DOM they
 * fail loudly there — move the package into the `ui` include list.
 *
 * SYNC: When modified, update this header. Keep the `ui` include list and the
 * `node` exclude list in lockstep.
 */

import {configDefaults, defineWorkspace} from 'vitest/config';

export default defineWorkspace([
  // UI packages — need jsdom, the StyleX babel transform, and the jest-dom
  // setup file. Inherits all of that from the root config.
  {
    extends: './vitest.config.ts',
    test: {
      name: 'ui',
      include: [
        'packages/core/src/**/*.test.{ts,tsx,mjs}',
        'packages/lab/src/**/*.test.{ts,tsx,mjs}',
      ],
    },
  },
  // Node-only code (CLI, build tooling, scripts, internal utils) — no DOM, no
  // StyleX/babel transform, no jest-dom matchers. Deliberately does NOT extend
  // the root config: a plain node environment skips the per-file jsdom
  // instantiation that dominated these files' runtime.
  // forks pool (vitest default) is required here: several CLI tests call
  // process.chdir(), which worker threads do not support.
  {
    test: {
      name: 'node',
      globals: true,
      environment: 'node',
      include: [
        'packages/**/src/**/*.test.{ts,tsx,mjs}',
        'internal/**/*.test.{ts,tsx,mjs}',
        'scripts/**/*.test.{ts,tsx,mjs}',
      ],
      exclude: [
        ...configDefaults.exclude,
        'packages/core/**',
        'packages/lab/**',
      ],
    },
  },
]);
