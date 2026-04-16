/* global module, require */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const babelConfig = require('./babel.config');

module.exports = {
  plugins: {
    '@xds/postcss-plugin': {
      appDir: 'src',
      babelPlugins: babelConfig.plugins,
    },
    autoprefixer: {},
  },
};
