/**
 * @file vite.config.ts
 * @input Uses vite, @vitejs/plugin-react, babel config
 * @output Vite configuration with React/StyleX via Babel
 * @position Build config; used by Storybook's Vite integration
 *
 * SYNC: When modified, update this header and /apps/storybook/README.md
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const babelrc = require('./.babelrc.cjs');

const coreRoot = path.resolve(__dirname, '../../packages/core/src');

export default defineConfig({
  plugins: [
    react({
      babel: babelrc,
    }),
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
