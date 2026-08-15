// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file next transform manifest
 *
 * Staged codemods for the next release. The Version Packages PR promotes
 * this file into the resolved version folder.
 */

import migrateLabBottomSheetImports, {
  meta as migrateLabBottomSheetImportsMeta,
} from './migrate-lab-bottom-sheet-imports.mjs';

export default [
  {
    name: 'migrate-lab-bottom-sheet-imports',
    transform: migrateLabBottomSheetImports,
    meta: migrateLabBottomSheetImportsMeta,
  },
];
