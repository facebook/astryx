// Copyright (c) Meta Platforms, Inc. and affiliates.

/* global module, require, __dirname */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const stylexConfig = require('./stylex.config');
const {astryxSourceExcludes, productSourceGlob, stylexPlugin} = stylexConfig;

module.exports = {
  plugins: {
    '@stylexjs/postcss-plugin': {
      cwd: __dirname,
      include: [productSourceGlob],
      exclude: astryxSourceExcludes,
      importSources: ['@stylexjs/stylex'],
      babelConfig: {
        babelrc: false,
        configFile: false,
        parserOpts: {
          plugins: ['typescript', 'jsx'],
        },
        plugins: [stylexPlugin],
      },
      useCSSLayers: {
        before: ['reset', 'astryx-base', 'astryx-theme'],
        prefix: 'product',
      },
    },
    autoprefixer: {},
  },
};
