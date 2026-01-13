/**
 * @file vitest.config.ts
 * @input Uses vitest/config, @vitejs/plugin-react
 * @output Vitest configuration with jsdom, coverage, and test setup
 * @position Root test config; applies to all packages in monorepo
 *
 * SYNC: When modified, update this header and root README.md
 */

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

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
              unstable_moduleResolution: {
                type: 'commonJS',
                rootDir: '.',
              },
            },
          ],
        ],
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['packages/**/src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['packages/**/src/**/*.{ts,tsx}'],
      exclude: [
        '**/*.test.{ts,tsx}',
        '**/*.stories.{ts,tsx}',
        '**/index.ts',
      ],
    },
    setupFiles: ['./internal/test-utils/src/setup.ts'],
  },
});
