import path from 'path';
import {fileURLToPath} from 'url';
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import stylex from '@stylexjs/unplugin';
import {viteSingleFile} from 'vite-plugin-singlefile';

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
        '@xds/core/theme/tokens.stylex': path.resolve(
          repoRoot,
          'packages/core/src/theme/tokens.stylex.ts',
        ),
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
