// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file v0.3.0 transform manifest
 *
 * Lists all codemods for the v0.3.0 release in the order they should run.
 * `unwrap-authoring-factories` runs first (it removes the `create*` value
 * imports), then `migrate-authoring-imports` repoints the surviving type
 * imports to `@astryxdesign/cli/authoring`, then `rename-authoring-doctypes`
 * renames the doc field types to their explicit domain-prefixed names.
 * `rename-radiogroup-arialabel-to-label` is independent of the authoring
 * codemods — it renames `aria-label` to the new required `label` prop on the
 * RadioGroup menu components.
 */

import unwrapAuthoringFactories, {
  meta as unwrapAuthoringFactoriesMeta,
} from './unwrap-authoring-factories.mjs';
import migrateAuthoringImports, {
  meta as migrateAuthoringImportsMeta,
} from './migrate-authoring-imports.mjs';
import renameAuthoringDoctypes, {
  meta as renameAuthoringDoctypesMeta,
} from './rename-authoring-doctypes.mjs';
import renameRadioGroupAriaLabelToLabel, {
  meta as renameRadioGroupAriaLabelToLabelMeta,
} from './rename-radiogroup-arialabel-to-label.mjs';
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
    name: 'unwrap-authoring-factories',
    transform: unwrapAuthoringFactories,
    meta: unwrapAuthoringFactoriesMeta,
  },
  {
    name: 'migrate-authoring-imports',
    transform: migrateAuthoringImports,
    meta: migrateAuthoringImportsMeta,
  },
  {
    name: 'rename-authoring-doctypes',
    transform: renameAuthoringDoctypes,
    meta: renameAuthoringDoctypesMeta,
  },
  {
    name: 'rename-radiogroup-arialabel-to-label',
    transform: renameRadioGroupAriaLabelToLabel,
    meta: renameRadioGroupAriaLabelToLabelMeta,
  },
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
