// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file v0.1.0 transform manifest
 *
 * Lists all codemods for the v0.1.0 release in the order they should run.
 */

import migrateXdsModuleSpecifiers, {
  meta as migrateXdsModuleSpecifiersMeta,
} from './migrate-xds-module-specifiers.mjs';

export default [
  {
    name: 'migrate-xds-module-specifiers',
    transform: migrateXdsModuleSpecifiers,
    meta: migrateXdsModuleSpecifiersMeta,
  },
];
