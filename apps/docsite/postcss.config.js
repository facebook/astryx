// Copyright (c) Meta Platforms, Inc. and affiliates.

/* global module, require */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const babelConfig = require('./babel.config');

module.exports = {
  plugins: {
    '@stylexjs/postcss-plugin': {
      // Scan the docsite's own source plus the CLI page templates — the docsite
      // renders those template page.tsx files directly (gallery + preview), so
      // their stylex.create() styles must be extracted into CSS here. Without
      // this, template-only classes (e.g. order-summary thumbnail sizing) ship
      // in the JS with no matching CSS rule and render unstyled.
      include: [
        'src/**/*.{js,jsx,ts,tsx}',
        '../../packages/cli/templates/**/*.{js,jsx,ts,tsx}',
      ],
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
