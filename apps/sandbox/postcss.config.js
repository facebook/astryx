// Copyright (c) Meta Platforms, Inc. and affiliates.

/* global module, __dirname */
const path = require('node:path');
const {postcss} = require('@astryxdesign/build');

const rootDir = path.resolve(__dirname, '../..');

// Use 'p' prefix for product-level StyleX classes. Library styles come from
// the pre-built @astryxdesign/core/astryx.css (which uses 'x' prefix), so the PostCSS
// plugin only needs to handle product code here.
module.exports = postcss(rootDir, {
  appDir: path.relative(rootDir, path.resolve(__dirname, 'src')),
  extraInclude: ['packages/cli/templates/**/*.{ts,tsx}'],
  classNamePrefix: 'p',
});
