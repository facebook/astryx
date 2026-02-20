/* global module, __dirname */
const path = require('path');
const babelConfig = require('./babel.config');

const rootDir = path.resolve(__dirname, '../..');

module.exports = {
  plugins: {
    '@stylexjs/postcss-plugin': {
      include: [
        'src/**/*.{js,jsx,ts,tsx}',
        path.join(rootDir, 'packages/core/src/**/*.{ts,tsx}'),
        path.join(rootDir, 'packages/theme/src/**/*.{ts,tsx}'),
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
        plugins: babelConfig.plugins,
      },
      useCSSLayers: true,
    },
  },
};
