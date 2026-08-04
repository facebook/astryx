// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file v0.1.2 transform manifest
 *
 * Lists all codemods for the v0.1.2 release in the order they should run.
 */

import renameTextColorActiveToAccent, {
  meta as renameTextColorActiveToAccentMeta,
} from './rename-text-color-active-to-accent.mjs';

export default [
  {
    name: 'rename-text-color-active-to-accent',
    transform: renameTextColorActiveToAccent,
    meta: renameTextColorActiveToAccentMeta,
  },
];
