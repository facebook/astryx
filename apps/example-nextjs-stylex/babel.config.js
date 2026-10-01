// Copyright (c) Meta Platforms, Inc. and affiliates.

/* global module, require */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const {stylexPlugin} = require('./stylex.config');

module.exports = {
  presets: ['next/babel'],
  plugins: [stylexPlugin],
};
