// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file next transform manifest
 *
 * Staged codemods for the next release. The Version Packages PR promotes
 * this file into the resolved version folder.
 */

import migrateInternationalizationContext, {
  meta as migrateInternationalizationContextMeta,
} from './migrate-internationalization-context.mjs';

export default [
  {
    name: 'migrate-internationalization-context',
    transform: migrateInternationalizationContext,
    meta: migrateInternationalizationContextMeta,
  },
];
