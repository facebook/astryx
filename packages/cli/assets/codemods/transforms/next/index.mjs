// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file next transform manifest
 *
 * Staged codemods for the next release. The Version Packages PR promotes
 * this file into the resolved version folder.
 */

import migrateLabDrawerImports, {
  meta as migrateLabDrawerImportsMeta,
} from './migrate-lab-drawer-imports.mjs';

export default [
  {
    name: 'migrate-lab-drawer-imports',
    transform: migrateLabDrawerImports,
    meta: migrateLabDrawerImportsMeta,
  },
];
