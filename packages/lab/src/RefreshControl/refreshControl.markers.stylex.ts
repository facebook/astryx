// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file refreshControl.markers.stylex.ts
 * @input StyleX's defineMarker
 * @output Exports refreshIndicatorScope, the marker RefreshControl puts on
 *   its indicator
 * @position Styling support for RefreshControl.tsx; no runtime code
 */

import * as stylex from '@stylexjs/stylex';

/**
 * Scoped marker for the refresh indicator. RefreshControl applies it to the
 * indicator, whose `data-refresh-spinning` attribute (set and removed by
 * useRefreshControl) the spokes read through `stylex.when.ancestor()`, so the
 * spin starts and stops in CSS, on the compositor, with no React render.
 */
export const refreshIndicatorScope: ReturnType<typeof stylex.defineMarker> =
  stylex.defineMarker();
