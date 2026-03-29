/* global module */
const babelConfig = require('./babel.config');

module.exports = {
  plugins: {
    '@stylexjs/postcss-plugin': {
      include: [
        'src/**/*.{js,jsx,ts,tsx}',
        'node_modules/@xds/core/**/*.{ts,tsx}',
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
      useCSSLayers: {
        before: ['reset'],
        after: ['xds-theme'],
        prefix: 'xds-base',
      },
    },
  },
};
