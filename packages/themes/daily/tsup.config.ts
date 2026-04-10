import {defineConfig} from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/icons.tsx'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: false, // Don't clean — xds theme build already put theme files in dist/
  external: ['@xds/core', 'react', 'lucide-react'],
  esbuildPlugins: [
    {
      // Rewrite ../dist/daily → ./daily.js so the built theme module
      // (produced by xds theme build) is referenced as a sibling in dist/.
      // .js extension ensures Node ESM resolution works.
      name: 'rewrite-built-theme',
      setup(build) {
        build.onResolve({filter: /\.\.\/dist\/daily$/}, () => ({
          path: './daily',
          external: true,
        }));
      },
    },
  ],
});
