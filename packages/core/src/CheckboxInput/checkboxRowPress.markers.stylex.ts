// Copyright (c) Meta Platforms, Inc. and affiliates.

import * as stylex from '@stylexjs/stylex';

/**
 * Marks a row that owns its checkbox's press (CheckboxRowPressContext): the
 * row carries the press marker, and the overlay over the checkbox box reads
 * the touch press off this marker the way it reads its own control's press
 * off `indicatorScope`. Hover is not routed through it, so the box's hover
 * tint stays its own control's.
 */
export const checkboxRowPressScope: ReturnType<typeof stylex.defineMarker> =
  stylex.defineMarker();
