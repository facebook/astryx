// Copyright (c) Meta Platforms, Inc. and affiliates.

import * as stylex from '@stylexjs/stylex';

/**
 * Scoped marker for AnchorHeading hover selectors. Reveals the copy-link
 * affordance only when its own heading row is hovered/focused, so the button
 * never leaks in from unrelated ancestors.
 */
export const anchorHeadingScope = stylex.defineMarker();
