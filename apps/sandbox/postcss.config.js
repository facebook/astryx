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
        path.join(rootDir, 'packages/themes/default/src/**/*.{ts,tsx}'),
        path.join(rootDir, 'packages/themes/neutral/src/**/*.{ts,tsx}'),
      ],
      babelConfig: {
        babelrc: false,
        parserOpts: {
          plugins: ['typescript', 'jsx'],
        },
        presets: [
          ['@babel/preset-react', {runtime: 'automatic'}],
          // Must come after preset-react (runs first due to reverse order)
          // to strip TypeScript type assertions before StyleX evaluates them.
          '@babel/preset-typescript',
        ],
        plugins: babelConfig.plugins,
      },
      useCSSLayers: true,
    },
  },
};
