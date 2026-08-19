// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file v0.1.5 transform manifest
 *
 * Lists all codemods for the v0.1.5 release in the order they should run.
 */

import renameSwitchLabelSpacingDefaultToHug, {
  meta as renameSwitchLabelSpacingDefaultToHugMeta,
} from './rename-switch-label-spacing-default-to-hug.mjs';

export default [
  {
    name: 'rename-switch-label-spacing-default-to-hug',
    transform: renameSwitchLabelSpacingDefaultToHug,
    meta: renameSwitchLabelSpacingDefaultToHugMeta,
  },
];
