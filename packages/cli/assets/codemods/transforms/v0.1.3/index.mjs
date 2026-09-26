// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file v0.1.3 transform manifest
 *
 * Lists all codemods for the v0.1.3 release in the order they should run.
 */

import migrateLayoutComponentsToExperimental, {
  meta as migrateLayoutComponentsToExperimentalMeta,
} from './migrate-layout-components-to-experimental.mjs';

export default [
  {
    name: 'migrate-layout-components-to-experimental',
    transform: migrateLayoutComponentsToExperimental,
    meta: migrateLayoutComponentsToExperimentalMeta,
  },
];
