import path from 'path';
import {fileURLToPath} from 'url';
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {viteSingleFile} from 'vite-plugin-singlefile';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../..');

/**
 * Vite config for building reports ONLY — no StyleX plugin required.
 *
 * Reports use pre-compiled CSS from @xds/core/dist/xds.css and
 * @xds/theme-default/dist/theme.css. XDS component JS is loaded from
 * the built dist (which has stylex.create already compiled away by tsup).
 * Report-specific styles live in plain CSS (report.css).
 *
 * This makes report builds fast and removes the StyleX build-time dependency.
 * The full vite.config.ts (with StyleX) is still used for preview builds.
 */

/**
 * Browser targets for lightningcss.
 * Prevents lowering native light-dark() into --lightningcss-light/--lightningcss-dark
 * polyfill variables. XDS tokens use native light-dark() which is baseline 2024:
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
        find: 'xds-css',
        replacement: path.resolve(repoRoot, 'packages/core/dist/xds.css'),
      },
      {
        find: 'xds-theme-css',
        replacement: path.resolve(
          repoRoot,
          'packages/themes/default/dist/theme.css',
        ),
      },
      // Core CSS files live in src/
      {
        find: /^@xds\/core\/(.+\.css)$/,
        replacement: path.resolve(repoRoot, 'packages/core/src/$1'),
      },
      // Core subpath imports → dist (bypasses "source" condition in exports map)
      {
        find: /^@xds\/core\/(.+)$/,
        replacement: path.resolve(repoRoot, 'packages/core/dist/$1/index.mjs'),
      },
      // Core root import
      {
        find: '@xds/core',
        replacement: path.resolve(repoRoot, 'packages/core/dist/index.mjs'),
      },
      // Theme: resolve to source (no StyleX usage, just defineTheme + icons).
      {
        find: '@xds/theme-default',
        replacement: path.resolve(repoRoot, 'packages/themes/default/src'),
      },
      {
        find: '@xds/theme/default',
        replacement: path.resolve(repoRoot, 'packages/themes/default/src'),
      },
    ],
  },
  server: {port: 5174, strictPort: true},
});
