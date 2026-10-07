// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file next transform manifest
 *
 * Staged codemods for the next release. The Version Packages PR promotes
 * this file into the resolved version folder.
 */

import validateDataTokenOwnership, {
  meta as validateDataTokenOwnershipMeta,
} from './validate-data-token-ownership.mjs';

export default [
  {
    name: 'validate-data-token-ownership',
    transform: validateDataTokenOwnership,
    meta: validateDataTokenOwnershipMeta,
  },
];
