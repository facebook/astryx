import {defineConfig} from 'tsup';

export default defineConfig({
  entry: ['src/source.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: false, // Don't clean — xds theme build already put theme files in dist/
  external: ['@xds/core', 'react'],
});
