// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file v0.3.0 transform manifest
 *
 * Lists all codemods for the v0.3.0 release in the order they should run.
 * `unwrap-authoring-factories` runs first (it removes the `create*` value
 * imports), then `migrate-authoring-imports` repoints the surviving type
 * imports to `@astryxdesign/cli/authoring`.
 */

import unwrapAuthoringFactories, {
  meta as unwrapAuthoringFactoriesMeta,
} from './unwrap-authoring-factories.mjs';
import migrateAuthoringImports, {
  meta as migrateAuthoringImportsMeta,
} from './migrate-authoring-imports.mjs';

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
];
