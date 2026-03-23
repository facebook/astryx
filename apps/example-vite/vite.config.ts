import path from 'path';
import {fileURLToPath} from 'url';
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import stylex from '@stylexjs/unplugin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // Declare CSS layer order so theme overrides beat component base styles.
    // Without this, layers are ordered by first appearance — and the StyleX
    // priority layers (component styles) would come after xds.theme,
    // preventing theme overrides from taking effect.
    {
      name: 'xds-css-layer-order',
      transformIndexHtml() {
        return [
          {
            tag: 'style',
            children:
              '@layer reset, priority1, priority2, priority3, priority4, priority5, priority6, priority7, priority8, priority9, xds.theme;',
            injectTo: 'head-prepend',
          },
        ];
      },
    },
    stylex.vite({
      dev: process.env.NODE_ENV === 'development',
      runtimeInjection: false,
      treeshakeCompensation: true,
      useCSSLayers: true,
      unstable_moduleResolution: {
        type: 'commonJS',
        rootDir: __dirname,
      },
      lightningcssOptions: {
        targets: lightningcssTargets,
      },
    }),
    react(),
  ],
  resolve: {
    alias: {
      // Alias @xds/core subpaths to source files so Vite compiles them
      // from TypeScript source rather than requiring a pre-built dist/.
      '@xds/core/theme/tokens.stylex': path.resolve(
        __dirname,
        'node_modules/@xds/core/src/theme/tokens.stylex.ts',
      ),
      '@xds/core': path.resolve(__dirname, 'node_modules/@xds/core/src'),
    },
  },
  // Prevent Vite from pre-bundling XDS with esbuild. XDS ships as source
  // that must be compiled by the StyleX plugin — pre-bundling strips the
  // stylex.create/defineVars calls and causes a runtime error.
  optimizeDeps: {
    exclude: ['@xds/core', '@xds/theme-default'],
  },
});
