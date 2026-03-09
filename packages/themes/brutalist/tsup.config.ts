import {defineConfig} from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: false, // Don't clean — xds build-theme already put theme.css in dist/
  external: ['@xds/core', 'react'],
});
