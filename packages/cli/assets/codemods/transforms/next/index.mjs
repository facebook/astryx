// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file next transform manifest
 *
 * Staged codemods for the next release. The Version Packages PR promotes
 * this file into the resolved version folder.
 */

import moveImeHelperImport, {
  meta as moveImeHelperImportMeta,
} from './move-ime-helper-import.mjs';
import removeFocusIsrtlOption, {
  meta as removeFocusIsrtlOptionMeta,
} from './remove-focus-isrtl-option.mjs';
import renameResizablePixelBounds, {
  meta as renameResizablePixelBoundsMeta,
} from './rename-resizable-pixel-bounds.mjs';
import migrateLabDrawerImports, {
  meta as migrateLabDrawerImportsMeta,
} from './migrate-lab-drawer-imports.mjs';

export default [
  {
    name: 'move-ime-helper-import',
    transform: moveImeHelperImport,
    meta: moveImeHelperImportMeta,
  },
  {
    name: 'remove-focus-isrtl-option',
    transform: removeFocusIsrtlOption,
    meta: removeFocusIsrtlOptionMeta,
  },
  {
    name: 'rename-resizable-pixel-bounds',
    transform: renameResizablePixelBounds,
    meta: renameResizablePixelBoundsMeta,
  },
  {
    name: 'migrate-lab-drawer-imports',
    transform: migrateLabDrawerImports,
    meta: migrateLabDrawerImportsMeta,
  },
];
