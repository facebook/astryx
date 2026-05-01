/* global module, require */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const babelConfig = require('./babel.config');

module.exports = {
  plugins: {
    '@stylexjs/postcss-plugin': {
      include: ['src/**/*.{js,jsx,ts,tsx}'],
      babelConfig: {
        babelrc: false,
        parserOpts: {
          plugins: ['typescript', 'jsx'],
        },
        plugins: babelConfig.plugins,
      },
      useCSSLayers: {
        before: ['reset', 'xds-base', 'xds-theme'],
      },
    },
    autoprefixer: {},
  },
};
