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
import babelrc from './.babelrc.cjs';

export default defineConfig({
  plugins: [
    react({
      babel: babelrc,
    }),
  ],
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
});
