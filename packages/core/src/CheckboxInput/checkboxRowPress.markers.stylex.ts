// Copyright (c) Meta Platforms, Inc. and affiliates.

import * as stylex from '@stylexjs/stylex';

/**
 * Marks a row that owns its checkbox's press (CheckboxRowPressContext), so
 * the layer over the checkbox box can read the row's touch press attribute
 * and run its own compositor release on the row's clock. The row's paint
 * can't reach the box here: a row with its own press layer releases by that
 * layer's opacity and declares no strength to inherit. Hover is not routed
 * through it, so the box's hover tint stays its own control's.
 */
export const checkboxRowPressScope: ReturnType<typeof stylex.defineMarker> =
  stylex.defineMarker();
