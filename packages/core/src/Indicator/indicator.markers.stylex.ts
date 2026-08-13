// Copyright (c) Meta Platforms, Inc. and affiliates.

import * as stylex from '@stylexjs/stylex';

/**
 * Scoped marker for indicator ancestor selectors.
 *
 * An owner (CheckboxInput's row, RadioListItem's row) applies this marker to
 * the element whose hover and focus should drive the indicator's appearance.
 * The indicator reads it through `stylex.when.ancestor()`, so interaction
 * state stays in CSS instead of being threaded through React props — and
 * owners that should *not* tint their indicator on hover (decorative menu
 * markers, listbox options) simply don't apply the marker.
 *
 * Owners apply it only while enabled, so disabled controls get no hover
 * feedback.
 */
export const indicatorScope: ReturnType<typeof stylex.defineMarker> =
  stylex.defineMarker();
