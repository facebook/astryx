import path from 'path';
import {fileURLToPath} from 'url';
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import stylex from '@stylexjs/unplugin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../..');

export default defineConfig({
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
        '@xds/core/theme/tokens.stylex': path.resolve(repoRoot, 'packages/core/src/theme/tokens.stylex.ts'),
      },
    }),
    react(),
  ],
  resolve: {
    alias: {
      '@xds/core/theme/tokens.stylex': path.resolve(repoRoot, 'packages/core/src/theme/tokens.stylex.ts'),
      '@xds/core': path.resolve(repoRoot, 'packages/core/src'),
      '@xds/theme/default': path.resolve(repoRoot, 'packages/theme/src/default'),
      '@xds/theme/neutral': path.resolve(repoRoot, 'packages/theme/src/neutral'),
      '@xds/theme': path.resolve(repoRoot, 'packages/theme/src'),
    },
  },
  server: {port: 5173, strictPort: true},
});
