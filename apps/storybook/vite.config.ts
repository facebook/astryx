/**
 * @file vite.config.ts
 * @input Uses vite, @vitejs/plugin-react, path
 * @output Vite configuration with React plugin and @xds/core alias
 * @position Build config; used by Storybook's Vite integration
 *
 * SYNC: When modified, update this header and /apps/storybook/README.md
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@xds/core': resolve(__dirname, '../../packages/core/src'),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
});
