// Copyright (c) Meta Platforms, Inc. and affiliates.

/* global module, __dirname */
const path = require('node:path');
const {babel} = require('@astryxdesign/build');

// Use the dist build pattern: library files keep default 'x' prefix (matching
// the pre-built astryx.css), product files use 'p' prefix to avoid collisions.
module.exports = babel(path.resolve(__dirname, '../..'), {
  libraryPrefix: 'x',
  classNamePrefix: 'p',
});
