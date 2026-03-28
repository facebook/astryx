/**
 * @file vite.config.ts
 * @input Uses vite, @vitejs/plugin-react, @stylexjs/unplugin
 * @output Vite configuration with React and StyleX via unplugin
 * @position Build config; used by Storybook's Vite integration
 *
 * SYNC: When modified, update this header and /apps/storybook/README.md
 */

import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import stylex from '@stylexjs/unplugin';
import path from 'path';

const rootDir = path.resolve(__dirname, '../..');
const coreRoot = path.resolve(__dirname, '../../packages/core/src');

export default defineConfig({
  plugins: [
    stylex.vite({
      // Use production mode with CSS extraction
      dev: false,
      // useCSSLayers with before/after/prefix (StyleX 0.18.2+)
      // Emits: @layer reset, xds-base.priority1-9, xds-theme;
      useCSSLayers: {
        before: ['reset'],
        after: ['xds-theme'],
        prefix: 'xds-base',
      },
      styleResolution: 'application-order',
      aliases: {
        '@xds/core/*': [path.join(rootDir, 'packages/core/src/*')],
        '@xds/core': [path.join(rootDir, 'packages/core/src')],
      },
      unstable_moduleResolution: {
        type: 'commonJS',
        rootDir: rootDir,
      },
    }),
    react(),
  ],
  resolve: {
    alias: {
      // Map @xds/core to source for StyleX compilation
      '@xds/core': coreRoot,
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
});
