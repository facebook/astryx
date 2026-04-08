/**
 * @file tsup.config.ts
 * @input Uses tsup
 * @output Bundle configuration for CJS/ESM outputs with TypeScript declarations
 * @position Build config; defines entry points and output formats for @xds/vega
 *
 * SYNC: When modified, update this header and /packages/vega/README.md
 */

import {defineConfig} from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: true,
  clean: true,
  external: ['react', 'react-dom', 'vega', 'vega-lite'],
});
