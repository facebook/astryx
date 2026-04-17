import path from 'path';
import {fileURLToPath} from 'url';
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {xdsStylex} from '@xds/vite-plugin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Browser targets for lightningcss.
 * Prevents lowering native light-dark() into polyfill variables.
 */
const lightningcssTargets = {
  chrome: 123 << 16,
  firefox: 120 << 16,
  safari: (17 << 16) | (5 << 8),
};

export default defineConfig({
  plugins: [
    ...xdsStylex({
      stylexOptions: {
        dev: process.env.NODE_ENV === 'development',
        runtimeInjection: false,
        treeshakeCompensation: true,
        unstable_moduleResolution: {
          type: 'commonJS',
          rootDir: __dirname,
        },
        lightningcssOptions: {
          targets: lightningcssTargets,
        },
      },
    }),
    react(),
  ],
  resolve: {
    alias: {
      '@xds/core/theme/tokens.stylex': path.resolve(
        __dirname,
        'node_modules/@xds/core/src/theme/tokens.stylex.ts',
      ),
      '@xds/core': path.resolve(__dirname, 'node_modules/@xds/core/src'),
    },
  },
  optimizeDeps: {
    exclude: ['@xds/core', '@xds/theme-default'],
  },
});
