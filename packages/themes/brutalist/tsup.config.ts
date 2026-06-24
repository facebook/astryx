// Copyright (c) Meta Platforms, Inc. and affiliates.

import {defineConfig} from 'tsup';

export default defineConfig({
  entry: ['src/source.ts'],
  format: ['cjs', 'esm'],
  dts: false,
  clean: false, // Don't clean — astryx theme build already put theme files in dist/
  external: ['@astryxdesign/core', 'react'],
});
