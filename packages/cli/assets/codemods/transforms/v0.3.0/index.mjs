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
];
