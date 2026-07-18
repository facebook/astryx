// Copyright (c) Meta Platforms, Inc. and affiliates.

/* global module, require */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const babelConfig = require('./babel.config');

module.exports = {
  plugins: {
    '@stylexjs/postcss-plugin': {
      // The docsite renders CLI page templates directly, so extract their
      // StyleX too — otherwise template-only classes ship without CSS.
      include: [
        'src/**/*.{js,jsx,ts,tsx}',
        '../../packages/core/templates/**/*.{js,jsx,ts,tsx}',
        '../../packages/charts/templates/**/*.{js,jsx,ts,tsx}',
        '../../packages/lab/templates/**/*.{js,jsx,ts,tsx}',
      ],
      babelConfig: {
        babelrc: false,
        parserOpts: {
          plugins: ['typescript', 'jsx'],
        },
        plugins: babelConfig.plugins,
      },
      useCSSLayers: {
        before: ['reset', 'astryx-base', 'astryx-theme'],
      },
    },
    autoprefixer: {},
  },
};
