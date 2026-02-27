/**
 * @file tsup.config.ts
 * @input src/index.ts
 * @output Bundle configuration for CJS/ESM outputs with TypeScript declarations
 * @position Build config for @xds/data
 */

import {defineConfig} from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: true,
  clean: true,
});
