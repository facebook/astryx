import path from 'path';
import {fileURLToPath} from 'url';
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import stylex from '@stylexjs/unplugin';
import {viteSingleFile} from 'vite-plugin-singlefile';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../..');

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
  build: {
    // Don't use lightningcss for minification — it lowers light-dark()
    // into --lightningcss-light/--lightningcss-dark polyfill variables
    // which breaks theming. The StyleX plugin handles its own CSS.
    cssMinify: false,
  },
  plugins: [
    stylex.vite({
      dev: process.env.NODE_ENV === 'development',
      runtimeInjection: false,
      treeshakeCompensation: true,
      unstable_moduleResolution: {
        type: 'commonJS',
        rootDir: repoRoot,
      },
      aliases: {
        '@xds/core/theme/tokens.stylex': path.resolve(
          repoRoot,
          'packages/core/src/theme/tokens.stylex.ts',
        ),
      },
      lightningcssOptions: {
        targets: lightningcssTargets,
      },
    }),
    react(),
    viteSingleFile(),
  ],
  resolve: {
    alias: {
      '@xds/core/theme/tokens.stylex': path.resolve(
        repoRoot,
        'packages/core/src/theme/tokens.stylex.ts',
      ),
      '@xds/core': path.resolve(repoRoot, 'packages/core/src'),
      '@xds/theme-default': path.resolve(
        repoRoot,
        'packages/themes/default/src',
      ),
      '@xds/theme/default': path.resolve(
        repoRoot,
        'packages/themes/default/src',
      ),
      '@xds/theme-neutral': path.resolve(
        repoRoot,
        'packages/themes/neutral/src',
      ),
      '@xds/theme/neutral': path.resolve(
        repoRoot,
        'packages/themes/neutral/src',
      ),
    },
  },
  server: {port: 5173, strictPort: true},
});
