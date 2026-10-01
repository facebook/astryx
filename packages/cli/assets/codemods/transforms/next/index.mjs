// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file next transform manifest
 *
 * Staged codemods for the next release. The Version Packages PR promotes
 * this file into the resolved version folder.
 */

import migrateThemeCatalogToDescriptors, {
  meta as migrateThemeCatalogToDescriptorsMeta,
} from './migrate-theme-catalog-to-descriptors.mjs';
import migrateNativePickerToPresentation, {
  meta as migrateNativePickerToPresentationMeta,
} from './migrate-native-picker-to-presentation.mjs';
import validateDataTokenOwnership, {
  meta as validateDataTokenOwnershipMeta,
} from './validate-data-token-ownership.mjs';

export default [
  {
    name: 'validate-data-token-ownership',
    transform: validateDataTokenOwnership,
    meta: validateDataTokenOwnershipMeta,
  },
  {
    name: 'migrate-theme-catalog-to-descriptors',
    transform: migrateThemeCatalogToDescriptors,
    meta: migrateThemeCatalogToDescriptorsMeta,
  },
  {
    name: 'migrate-native-picker-to-presentation',
    transform: migrateNativePickerToPresentation,
    meta: migrateNativePickerToPresentationMeta,
  },
];
