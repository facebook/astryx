// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file next transform manifest
 *
 * Staged codemods for the next release. The Version Packages PR promotes this
 * file into the resolved version folder.
 */

import renameTopNavHeadingHrefToHeadingHref, {
  meta as renameTopNavHeadingHrefToHeadingHrefMeta,
} from './rename-topnavheading-href-to-headinghref.mjs';
import migrateGridMinChildWidthToColumns, {
  meta as migrateGridMinChildWidthToColumnsMeta,
} from './migrate-grid-minchildwidth-to-columns.mjs';
import migrateNavMenuItemToNavHeadingMenuItem, {
  meta as migrateNavMenuItemToNavHeadingMenuItemMeta,
} from './migrate-navmenuitem-to-navheadingmenuitem.mjs';
import migrateLabCodeBlockImports, {
  meta as migrateLabCodeBlockImportsMeta,
} from './migrate-lab-codeblock-imports.mjs';
import removeThemeTransitionTokenImports, {
  meta as removeThemeTransitionTokenImportsMeta,
} from './remove-theme-transition-token-imports.mjs';

export default [
  {
    name: 'rename-topnavheading-href-to-headinghref',
    transform: renameTopNavHeadingHrefToHeadingHref,
    meta: renameTopNavHeadingHrefToHeadingHrefMeta,
  },
  {
    name: 'migrate-grid-minchildwidth-to-columns',
    transform: migrateGridMinChildWidthToColumns,
    meta: migrateGridMinChildWidthToColumnsMeta,
  },
  {
    name: 'migrate-navmenuitem-to-navheadingmenuitem',
    transform: migrateNavMenuItemToNavHeadingMenuItem,
    meta: migrateNavMenuItemToNavHeadingMenuItemMeta,
  },
  {
    name: 'migrate-lab-codeblock-imports',
    transform: migrateLabCodeBlockImports,
    meta: migrateLabCodeBlockImportsMeta,
  },
  {
    name: 'remove-theme-transition-token-imports',
    transform: removeThemeTransitionTokenImports,
    meta: removeThemeTransitionTokenImportsMeta,
  },
];
