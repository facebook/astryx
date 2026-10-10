// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file next transform manifest
 *
 * Staged codemods for the next release. The Version Packages PR promotes
 * this file into the resolved version folder.
 */

import renameEmptySearchResultsText, {
  meta as renameEmptySearchResultsTextMeta,
} from './rename-empty-search-results-text.mjs';

export default [
  {
    name: 'rename-empty-search-results-text',
    transform: renameEmptySearchResultsText,
    meta: renameEmptySearchResultsTextMeta,
  },
];
