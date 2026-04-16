/* global module, require */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const babelConfig = require('./babel.config');

module.exports = {
  plugins: {
    './stylex-split-layers': {
      include: [
        'src/**/*.{js,jsx,ts,tsx}',
        'node_modules/@xds/core/**/*.{ts,tsx}',
      ],
      babelConfig: {
        babelrc: false,
        parserOpts: {
          plugins: ['typescript', 'jsx'],
        },
        plugins: babelConfig.plugins,
      },
      libraryPattern: 'node_modules/@xds/',
      layers: {
        library: 'xds-base',
        product: 'product',
        order: ['reset', 'xds-base', 'xds-theme', 'product'],
      },
    },
    autoprefixer: {},
  },
};
