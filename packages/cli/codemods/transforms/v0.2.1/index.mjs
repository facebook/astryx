// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file v0.2.1 transform manifest
 *
 * Lists all codemods for the v0.2.1 release in the order they should run.
 */

import migrateDialogPositionToLogical, {
  meta as migrateDialogPositionToLogicalMeta,
} from './migrate-dialog-position-to-logical.mjs';

export default [
  {
    name: 'migrate-dialog-position-to-logical',
    transform: migrateDialogPositionToLogical,
    meta: migrateDialogPositionToLogicalMeta,
  },
];
