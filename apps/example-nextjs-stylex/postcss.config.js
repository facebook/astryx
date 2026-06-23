// Copyright (c) Meta Platforms, Inc. and affiliates.

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
        // Declare XDS dist layers before StyleX app layers so
        // product styles always win over component defaults.
        before: ['reset', 'astryx-base', 'astryx-theme'],
      },
    },
    autoprefixer: {},
  },
};
