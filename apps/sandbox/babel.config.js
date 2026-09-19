// Copyright (c) Meta Platforms, Inc. and affiliates.

/* global module, __dirname */
const path = require('node:path');
const {babel} = require('@astryxdesign/build');

// Use the dist build pattern: library files keep default 'x' prefix (matching
// the pre-built astryx.css), product files use 'p' prefix to avoid collisions.
const config = babel(path.resolve(__dirname, '../..'), {
  libraryPrefix: 'x',
  classNamePrefix: 'p',
});

// Template source stays portable with /template-assets/* URLs. Hosted sandbox
// builds rewrite only executable string literals to their deployed asset path;
// sourceRegistry's embedded code samples remain unchanged.
config.plugins.push([
  path.resolve(__dirname, 'scripts/rewrite-template-asset-paths.cjs'),
  {basePath: process.env.SANDBOX_TEMPLATE_ASSETS_BASE_PATH || ''},
]);

module.exports = config;
