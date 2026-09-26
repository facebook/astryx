// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file v0.1.8 transform manifest
 *
 * Lists all codemods for the v0.1.8 release in the order they should run.
 */

import renameAvatarSizeScale, {
  meta as renameAvatarSizeScaleMeta,
} from './rename-avatar-size-scale.mjs';

export default [
  {
    name: 'rename-avatar-size-scale',
    transform: renameAvatarSizeScale,
    meta: renameAvatarSizeScaleMeta,
  },
];
