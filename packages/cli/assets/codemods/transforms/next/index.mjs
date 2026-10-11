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
import migrateFieldInputStyling, {
  meta as migrateFieldInputStylingMeta,
} from './migrate-field-input-styling.mjs';
import validateDataTokenOwnership, {
  meta as validateDataTokenOwnershipMeta,
} from './validate-data-token-ownership.mjs';

export default [
  {
    name: 'migrate-deprecated-theme-surface',
    transform: migrateDeprecatedThemeSurface,
    meta: migrateDeprecatedThemeSurfaceMeta,
  },
  {
    name: 'validate-data-token-ownership',
    transform: validateDataTokenOwnership,
    meta: validateDataTokenOwnershipMeta,
  },
  {
    name: 'migrate-field-input-styling',
    transform: migrateFieldInputStyling,
    meta: migrateFieldInputStylingMeta,
  },
];
