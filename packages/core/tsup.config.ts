/**
 * @file tsup.config.ts
 * @input Uses tsup
 * @output Bundle configuration for CJS/ESM outputs with TypeScript declarations
 * @position Build config; defines entry points and output formats for @xds/core
 *
 * SYNC: When modified, update this header and /packages/core/README.md
 */

import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/Button/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: true,
  clean: true,
  external: ['react', 'react-dom'],
});
