// Copyright (c) Meta Platforms, Inc. and affiliates.

import {defineConfig} from 'tsup';

export default defineConfig({
  entry: ['src/source.ts', 'src/icons.tsx'],
  format: ['cjs', 'esm'],
  dts: false,
  clean: false,
  external: ['@xds/core', 'react', 'lucide-react'],
});
