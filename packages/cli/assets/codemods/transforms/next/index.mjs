// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file next transform manifest
 *
 * Staged codemods for the next release. The Version Packages PR promotes
 * this file into the resolved version folder.
 */

import preserveBottomSheetContentPadding, {
  meta as preserveBottomSheetContentPaddingMeta,
} from './preserve-bottom-sheet-content-padding.mjs';

export default [
  {
    name: 'preserve-bottom-sheet-content-padding',
    transform: preserveBottomSheetContentPadding,
    meta: preserveBottomSheetContentPaddingMeta,
  },
];
