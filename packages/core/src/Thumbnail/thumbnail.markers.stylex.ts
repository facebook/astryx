// Copyright (c) Meta Platforms, Inc. and affiliates.

import * as stylex from '@stylexjs/stylex';

/**
 * Scoped marker for Thumbnail ancestor selectors. Applied to the image
 * container so the remove button's hover/focus reveal (`showRemoveOn="hover"`)
 * responds only to this thumbnail — not to hover/focus state from an outer
 * container the thumbnail happens to sit inside.
 */
export const thumbnailScope: ReturnType<typeof stylex.defineMarker> =
  stylex.defineMarker();
