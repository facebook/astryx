// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file v0.0.13 transform manifest
 *
 * Lists all codemods for the v0.0.13 release in the order they should run.
 */

import toolbarDensityToSize, {
  meta as toolbarDensityToSizeMeta,
} from './toolbar-density-to-size.mjs';

import iconNameDeprecations, {
  meta as iconNameDeprecationsMeta,
} from './icon-name-deprecations.mjs';

import renameAttachmentsToDrawer, {
  meta as renameAttachmentsToDrawerMeta,
} from './rename-attachments-to-drawer.mjs';

export default [
  {
    name: 'toolbar-density-to-size',
    transform: toolbarDensityToSize,
    meta: toolbarDensityToSizeMeta,
  },
  {
    name: 'icon-name-deprecations',
    transform: iconNameDeprecations,
    meta: iconNameDeprecationsMeta,
  },
  {
    name: 'rename-attachments-to-drawer',
    transform: renameAttachmentsToDrawer,
    meta: renameAttachmentsToDrawerMeta,
  },
];
