// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file v0.2.0 transform manifest
 *
 * Lists all codemods for the v0.2.0 release in the order they should run.
 */

import removeTabListOrientation, {
  meta as removeTabListOrientationMeta,
} from './remove-tablist-orientation.mjs';

export default [
  {
    name: 'remove-tablist-orientation',
    transform: removeTabListOrientation,
    meta: removeTabListOrientationMeta,
  },
];
