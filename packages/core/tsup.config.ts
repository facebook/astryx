/**
 * @file tsup.config.ts
 * @input Uses tsup
 * @output Bundle configuration for CJS/ESM outputs (no DTS — see build script)
 * @position Build config; defines entry points and output formats for @xds/core
 *
 * DTS generation is handled separately by `tsc --project tsconfig.build.json`
 * to avoid tsup's per-entry-point TypeScript program instantiation, which
 * consumes excessive memory (~2-4GB) with 60+ entry points.
 *
 * SYNC: When modified, update this header and /packages/core/README.md
 */

import {defineConfig} from 'tsup';
import babel from 'esbuild-plugin-babel';

export default defineConfig({
  entry: ['src/index.ts', 'src/*/index.ts', 'src/theme/tokens.stylex.ts'],
  format: ['cjs', 'esm'],
  dts: false,
  splitting: true,
  clean: true,
  external: ['react', 'react-dom'],
  noExternal: ['@stylexjs/stylex', 'styleq'],
  esbuildPlugins: [
    babel({
      filter: /\.[jt]sx?$/,
      config: {
        presets: [
          ['@babel/preset-react', {runtime: 'automatic'}],
          '@babel/preset-typescript',
        ],
        plugins: [
          [
            '@stylexjs/babel-plugin',
            {
              dev: false,
              runtimeInjection: false,
              genConditionalClasses: true,
              treeshakeCompensation: true,
              unstable_moduleResolution: {
                type: 'commonJS',
                rootDir: '.',
              },
            },
          ],
        ],
      },
    }),
  ],
});
