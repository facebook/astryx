// Copyright (c) Meta Platforms, Inc. and affiliates.

/* global module, __dirname */
const path = require('path');
const {babel} = require('@xds/build');
module.exports = babel(path.resolve(__dirname, '../..'));
