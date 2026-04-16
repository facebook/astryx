/* global module, require */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const babelConfig = require('./babel.config');

module.exports = {
  plugins: {
    '@xds/postcss-plugin': {
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
    },
    autoprefixer: {},
  },
};
