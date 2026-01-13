import { defineConfig } from 'tsup';
import babel from 'esbuild-plugin-babel';

export default defineConfig({
  entry: ['src/index.ts', 'src/Button/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: true,
  clean: true,
  external: ['react', 'react-dom'],
  esbuildPlugins: [
    babel({
      filter: /\.[jt]sx?$/,
      config: {
        presets: [
          ['@babel/preset-react', { runtime: 'automatic' }],
          '@babel/preset-typescript',
        ],
        plugins: [
          [
            '@stylexjs/babel-plugin',
            {
              dev: false,
              runtimeInjection: true,
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
