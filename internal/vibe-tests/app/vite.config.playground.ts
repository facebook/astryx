// Copyright (c) Meta Platforms, Inc. and affiliates.

import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import stylex from '@stylexjs/unplugin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../..');

const lightningcssTargets = {
  chrome: 123 << 16,
  firefox: 120 << 16,
  safari: (17 << 16) | (5 << 8),
};

/**
 * Vite config for the interactive playground (mode=playground).
 *
 * Resolves the constant Astryx design system PLUS all four form frameworks and
 * their equal-effort adapters, so the frozen generated solutions render live
 * with the real packages a consumer would install.
 */
export default defineConfig({
  root: __dirname,
  build: {cssMinify: false},
  plugins: [
    stylex.vite({
      dev: process.env.NODE_ENV === 'development',
      runtimeInjection: false,
      treeshakeCompensation: true,
      unstable_moduleResolution: {type: 'commonJS', rootDir: repoRoot},
      aliases: {
        '@astryxdesign/core/theme/tokens.stylex': path.resolve(
          repoRoot,
          'packages/core/src/theme/tokens.stylex.ts',
        ),
      },
      lightningcssOptions: {targets: lightningcssTargets},
    }),
    react(),
  ],
  resolve: {
    // Deduplicate React so the frameworks and Astryx share one instance.
    dedupe: ['react', 'react-dom'],
    alias: {
      '@astryxdesign/core/theme/tokens.stylex': path.resolve(
        repoRoot,
        'packages/core/src/theme/tokens.stylex.ts',
      ),
      '@astryxdesign/core': path.resolve(repoRoot, 'packages/core/src'),
      '@astryxdesign/theme-neutral': path.resolve(
        repoRoot,
        'packages/themes/neutral/src/source.ts',
      ),
      '@astryxdesign/theme/neutral': path.resolve(
        repoRoot,
        'packages/themes/neutral/src/source.ts',
      ),
      // Form concept + equal-effort adapters (resolve to source).
      '@astryxdesign/formentor': path.resolve(
        repoRoot,
        'packages/formentor/src',
      ),
      '@astryxdesign/astryx-formisch': path.resolve(
        repoRoot,
        'packages/astryx-formisch/src',
      ),
      '@astryxdesign/astryx-tanstack': path.resolve(
        repoRoot,
        'packages/astryx-tanstack/src',
      ),
      '@astryxdesign/astryx-rhf': path.resolve(
        repoRoot,
        'packages/astryx-rhf/src',
      ),
    },
  },
  // The frameworks (@formisch/react, @tanstack/react-form, react-hook-form,
  // @hookform/resolvers, valibot, zod) resolve from the repo-root node_modules;
  // the rhf adapter needs its local zod v3.
  optimizeDeps: {
    include: [
      '@formisch/react',
      '@tanstack/react-form',
      'react-hook-form',
      'valibot',
    ],
  },
  server: {port: 5176, strictPort: true, host: true},
});
