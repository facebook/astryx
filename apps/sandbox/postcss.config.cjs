/* eslint-disable @typescript-eslint/no-require-imports, no-undef */
const path = require('path');

const rootDir = path.resolve(__dirname, '../..');

module.exports = {
  plugins: {
    '@stylexjs/postcss-plugin': {
      include: [
        'src/**/*.{js,jsx,ts,tsx}',
        path.join(rootDir, 'packages/cli/templates/**/*.{ts,tsx}'),
      ],
      babelConfig: {
        babelrc: false,
        parserOpts: {
          plugins: ['typescript', 'jsx'],
        },
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
                rootDir,
              },
            },
          ],
        ],
      },
      useCSSLayers: false,
    },
  },
};
