// Copyright (c) Meta Platforms, Inc. and affiliates.

import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {astryxStylex} from '@astryxdesign/build/vite';

export default defineConfig({
  plugins: [...astryxStylex(), react()],
  // Templates that show imagery point at /template-assets/*, which the docsite
  // serves from its own public dir. Reuse it so previews here match.
  publicDir: '../docsite/public',
  // Templates live outside this app's root (packages/cli/assets/templates).
  server: {fs: {allow: ['../..']}},
});
