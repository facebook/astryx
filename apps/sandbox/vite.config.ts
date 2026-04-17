import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const rootDir = path.resolve(__dirname, '../..');

export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [
    react({
      babel: {
        plugins: [
          [
            '@stylexjs/babel-plugin',
            {
              dev: false,
              runtimeInjection: false,
              genConditionalClasses: true,
              treeshakeCompensation: true,
              unstable_moduleResolution: {
                type: 'commonJS',
                rootDir,
              },
            },
          ],
        ],
      },
    }),
  ],
  resolve: {
    alias: [
      {find: '@', replacement: path.resolve(__dirname, 'src')},
    ],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router'],
  },
});
