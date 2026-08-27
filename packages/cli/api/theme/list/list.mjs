// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx theme list` leaf — projects the bundled-theme manifest into the
 * `theme.list` envelope. Data source: ../_adapter.mjs (listThemes).
 */

import {listThemes} from '../_adapter.mjs';

/**
 * List the themes bundled with this CLI build (the ones `theme add` can
 * scaffold). Pure projection of the manifest; no I/O beyond the adapter read.
 * @returns {import('../theme.type.mjs').ThemeListResponse}
 */
export function themeList() {
  return {
    type: 'theme.list',
    data: listThemes().map(t => ({
      slug: t.slug,
      displayName: t.displayName,
      description: t.description,
      maintained: t.maintained,
    })),
  };
}
