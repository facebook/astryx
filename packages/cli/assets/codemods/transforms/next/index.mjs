// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file next transform manifest
 *
 * Staged codemods for the next release. The Version Packages PR promotes
 * this file into the resolved version folder.
 */

import bannerCollapsibleContent, {
  meta as bannerCollapsibleContentMeta,
} from './banner-collapsible-content.mjs';

export default [
  {
    name: 'banner-collapsible-content',
    transform: bannerCollapsibleContent,
    meta: bannerCollapsibleContentMeta,
  },
];
