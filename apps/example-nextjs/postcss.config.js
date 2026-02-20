/* global module */
const babelConfig = require('./babel.config');

module.exports = {
  plugins: {
    '@stylexjs/postcss-plugin': {
      include: [
        'src/**/*.{js,jsx,ts,tsx}',
        'node_modules/@xds/core/**/*.{ts,tsx}',
        '../../packages/theme/src/**/*.{ts,tsx}',
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
