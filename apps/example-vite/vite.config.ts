import path from 'path';
import {fileURLToPath} from 'url';
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import stylex from '@stylexjs/unplugin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    stylex.vite({
      dev: process.env.NODE_ENV === 'development',
      runtimeInjection: false,
      treeshakeCompensation: true,
      unstable_moduleResolution: {
        type: 'commonJS',
        rootDir: __dirname,
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
        '../../packages/core/src/theme/tokens.stylex.ts',
      ),
      '@xds/core': path.resolve(__dirname, '../../packages/core/src'),
    },
  },
});
