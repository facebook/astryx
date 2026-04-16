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
        presets: [
          ['@babel/preset-react', {runtime: 'automatic'}],
          '@babel/preset-typescript',
        ],
        plugins: babelConfig.plugins,
      },
      useCSSLayers: {
        // Declare XDS dist layers before StyleX app layers so
        // product styles always win over component defaults.
        before: ['reset', 'xds-base', 'xds-theme'],
      },
    },
  },
};
