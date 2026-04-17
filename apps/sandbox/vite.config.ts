import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import stylex from '@stylexjs/unplugin';
import path from 'path';

const rootDir = path.resolve(__dirname, '../..');
const coreRoot = path.resolve(rootDir, 'packages/core/src');

export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [
    stylex.vite({
      dev: false,
      useCSSLayers: true,
      styleResolution: 'application-order',
      aliases: {
        '@xds/core/*': [path.join(rootDir, 'packages/core/src/*')],
        '@xds/core': [path.join(rootDir, 'packages/core/src')],
      },
      unstable_moduleResolution: {
        type: 'commonJS',
        rootDir,
      },
    }),
    react(),
  ],
  resolve: {
    alias: [
      {find: '@', replacement: path.resolve(__dirname, 'src')},
      // Resolve @xds/core JS imports to source, but let CSS imports
      // fall through to normal resolution (dist/ via package.json exports)
      {
        find: /^@xds\/core(?!\/)$/,
        replacement: coreRoot,
      },
      {
        find: /^@xds\/core\/(?!.*\.css$)(.*)/,
        replacement: path.join(coreRoot, '$1'),
      },
    ],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router'],
  },
});
