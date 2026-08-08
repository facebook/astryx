// Copyright (c) Meta Platforms, Inc. and affiliates.

import {defineConfig} from 'tsup';

export default defineConfig({
  entry: ['src/source.ts', 'src/icons.tsx'],
  format: ['cjs', 'esm'],
  dts: false,
  clean: true, // tsup runs first — theme build adds its outputs to dist/ after
  external: ['@astryxdesign/core', 'react', 'lucide-react'],
});
