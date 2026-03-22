/**
 * @file tsup.config.ts
 * @input Uses tsup
 * @output Bundle configuration for CJS/ESM outputs with TypeScript declarations
 * @position Build config; defines entry points and output formats for @xds/core
 *
 * SYNC: When modified, update this header and /packages/core/README.md
 */

import {defineConfig} from 'tsup';
import babel from 'esbuild-plugin-babel';

export default defineConfig({
  entry: ['src/index.ts', 'src/*/index.ts', 'src/theme/tokens.stylex.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
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
