// Copyright (c) Meta Platforms, Inc. and affiliates.

import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {viteSingleFile} from 'vite-plugin-singlefile';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../..');

/**
 * Vite config for building reports ONLY — no StyleX plugin required.
 *
 * Reports use pre-compiled CSS from @astryxdesign/core/dist/astryx.css and
 * @astryxdesign/theme-neutral/dist/theme.css. Astryx component JS is loaded from
 * the built dist (which has stylex.create already compiled away by tsup).
 * Report-specific styles live in plain CSS (report.css).
 *
 * This makes report builds fast and removes the StyleX build-time dependency.
 * The full vite.config.ts (with StyleX) is still used for preview builds.
 */

/**
 * Browser targets for lightningcss.
 * Prevents lowering native light-dark() into --lightningcss-light/--lightningcss-dark
 * polyfill variables. Astryx tokens use native light-dark() which is baseline 2024:
 * Chrome 123+, Firefox 120+, Safari 17.5+
 *
 * Must match the targets in apps/storybook/.storybook/main.ts
 */
const lightningcssTargets = {
  chrome: 123 << 16,
  firefox: 120 << 16,
  safari: (17 << 16) | (5 << 8),
};

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: {
    // The bundled @astryxdesign/core (Babel output) uses modern syntax that
    // esbuild can't downlevel to the default es2020 target (destructuring in
    // certain positions). The report is an internal artifact viewed in current
    // browsers, so target esnext and skip downleveling. CSS targets stay modern
    // below to preserve native light-dark().
    target: 'esnext',
    rollupOptions: {
      input: path.resolve(__dirname, 'index.report.html'),
    },
    // Don't use lightningcss for minification — it lowers light-dark()
    // into --lightningcss-light/--lightningcss-dark polyfill variables
    // which breaks theming. The pre-compiled CSS is already minified.
    cssMinify: false,
  },
  css: {
    // Set Vite's own CSS transformer targets so any CSS processing
    // (including dev server) preserves native light-dark().
    transformer: 'lightningcss',
    lightningcss: {
      targets: lightningcssTargets,
    },
  },
  resolve: {
    alias: [
      // Pre-compiled CSS — no StyleX build needed
      {
        find: 'astryx-css',
        replacement: path.resolve(repoRoot, 'packages/core/dist/astryx.css'),
      },
      {
        find: 'astryx-theme-css',
        replacement: path.resolve(
          repoRoot,
          'packages/themes/neutral/dist/theme.css',
        ),
      },
      // Core CSS files live in src/
      {
        find: /^@astryxdesign\/core\/(.+\.css)$/,
        replacement: path.resolve(repoRoot, 'packages/core/src/$1'),
      },
      // Core subpath imports → dist (bypasses "source" condition in exports map)
      {
        find: /^@astryxdesign\/core\/(.+)$/,
        replacement: path.resolve(repoRoot, 'packages/core/dist/$1/index.js'),
      },
      // Core root import
      {
        find: '@astryxdesign/core',
        replacement: path.resolve(repoRoot, 'packages/core/dist/index.js'),
      },
      // Theme: resolve to source (no StyleX usage, just defineTheme + icons).
      {
        find: '@astryxdesign/theme-neutral',
        replacement: path.resolve(
          repoRoot,
          'packages/themes/neutral/src/source.ts',
        ),
      },
      {
        find: '@astryxdesign/theme/neutral',
        replacement: path.resolve(
          repoRoot,
          'packages/themes/neutral/src/source.ts',
        ),
      },
    ],
  },
  server: {port: 5174, strictPort: true},
});
