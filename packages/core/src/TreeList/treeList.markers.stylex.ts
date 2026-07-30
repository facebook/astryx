// Copyright (c) Meta Platforms, Inc. and affiliates.

import * as stylex from '@stylexjs/stylex';

/**
 * Scoped marker for TreeList row ancestor selectors. Applied to each
 * treeitem's content row so the row's `endContent` hover/focus reveal
 * (`endContentReveal="hover"`) responds only to that row — not to hover/focus
 * state from an outer container the tree happens to sit inside, nor from a
 * parent row when the tree is nested.
 */
export const treeItemScope: ReturnType<typeof stylex.defineMarker> =
  stylex.defineMarker();
