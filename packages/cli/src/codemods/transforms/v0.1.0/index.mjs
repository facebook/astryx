// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file v0.1.0 transform manifest
 *
 * Lists all codemods for the v0.1.0 release in the order they should run.
 */

import migrateXdsConfigSurfaces, {
  meta as migrateXdsConfigSurfacesMeta,
} from './migrate-xds-config-surfaces.mjs';

import migrateXdsModuleSpecifiers, {
  meta as migrateXdsModuleSpecifiersMeta,
} from './migrate-xds-module-specifiers.mjs';

export default [
  {
    name: 'migrate-xds-config-surfaces',
    transform: migrateXdsConfigSurfaces,
    meta: migrateXdsConfigSurfacesMeta,
  },
  {
    name: 'migrate-xds-module-specifiers',
    transform: migrateXdsModuleSpecifiers,
    meta: migrateXdsModuleSpecifiersMeta,
  },
];
