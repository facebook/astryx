import {defineConfig} from 'tsup';
import babel from 'esbuild-plugin-babel';
import path from 'path';

export default defineConfig({
  entry: ['src/default/index.ts', 'src/neutral/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: true,
  clean: true,
  external: ['react', 'react-dom', '@stylexjs/stylex', '@xds/core'],
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
                rootDir: path.resolve(__dirname, '../..'),
              },
            },
          ],
        ],
      },
    }),
  ],
});
