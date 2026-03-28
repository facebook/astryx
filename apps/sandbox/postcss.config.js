/* global module, __dirname */
const path = require('path');
const babelConfig = require('./babel.config');

const rootDir = path.resolve(__dirname, '../..');

module.exports = {
  plugins: {
    '@stylexjs/postcss-plugin': {
      // Only compile StyleX in sandbox page files.
      // @xds/core and theme packages use pre-built dist CSS
      // (imported in layout.tsx via @layer xds.base / xds.theme).
      include: ['src/**/*.{js,jsx,ts,tsx}'],
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
      // Don't use CSS layers for sandbox page styles — they should be
      // unlayered (highest priority), same as consumer styles would be.
      useCSSLayers: false,
    },
  },
};
