// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file next transform manifest
 *
 * Staged codemods for the next release. The Version Packages PR promotes
 * this file into the resolved version folder.
 */

import migrateDeprecatedThemeSurface, {
  meta as migrateDeprecatedThemeSurfaceMeta,
} from './migrate-deprecated-theme-surface.mjs';

export default [
  {
    name: 'migrate-deprecated-theme-surface',
    transform: migrateDeprecatedThemeSurface,
    meta: migrateDeprecatedThemeSurfaceMeta,
  },
];
