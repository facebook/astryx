// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file next transform manifest
 *
 * Staged codemods for the next release. The Version Packages PR promotes
 * this file into the resolved version folder.
 */

import renameDropdownMenuRadioDotTarget, {
  meta as renameDropdownMenuRadioDotTargetMeta,
} from './rename-dropdown-menu-radio-dot-target.mjs';
import migrateTableRowExpansionToTree, {
  meta as migrateTableRowExpansionToTreeMeta,
} from './migrate-table-rowexpansion-to-tree.mjs';
import renameMenuDividerDataTypes, {
  meta as renameMenuDividerDataTypesMeta,
} from './rename-menu-divider-data-types.mjs';

export default [
  {
    name: 'rename-dropdown-menu-radio-dot-target',
    transform: renameDropdownMenuRadioDotTarget,
    meta: renameDropdownMenuRadioDotTargetMeta,
  },
  {
    name: 'migrate-table-rowexpansion-to-tree',
    transform: migrateTableRowExpansionToTree,
    meta: migrateTableRowExpansionToTreeMeta,
  },
  {
    name: 'rename-menu-divider-data-types',
    transform: renameMenuDividerDataTypes,
    meta: renameMenuDividerDataTypesMeta,
  },
];
