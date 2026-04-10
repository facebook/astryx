import {defineConfig} from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/source.ts', 'src/icons.tsx'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: false, // Don't clean — xds theme build already put theme.css in dist/
  external: ['@xds/core', 'react', '@heroicons/react'],
});
