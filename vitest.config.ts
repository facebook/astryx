// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file vitest.config.ts
 * @input Uses vitest/config, @vitejs/plugin-react
 * @output Vitest configuration with jsdom, coverage, and test setup
 * @position Root test config; applies to all packages in monorepo
 *
 * SYNC: When modified, update this header and root README.md
 */

import path from 'node:path';
import {defineConfig} from 'vitest/config';
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
    ],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: [
      'packages/**/src/**/*.test.{ts,tsx,mjs}',
      'internal/**/*.test.{ts,tsx,mjs}',
      'scripts/**/*.test.{ts,tsx,mjs}',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['packages/**/src/**/*.{ts,tsx}'],
      exclude: ['**/*.test.{ts,tsx}', '**/*.stories.{ts,tsx}', '**/index.ts'],
    },
    setupFiles: ['./internal/test-utils/src/setup.ts'],
    // Increase worker heap to prevent OOM crashes on memory-heavy test files
    // (e.g. Chat composer tests with contentEditable + popover portals in jsdom).
    poolOptions: {
      forks: {
        execArgv: ['--max-old-space-size=4096'],
      },
    },
  },
});
