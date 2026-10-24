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

/**
 * Marks a theme indicator that paints its own press layer, for a shape the
 * owner's rounded-square layer would tint past (a circle).
 *
 * The indicator applies this marker together with
 * `data-astryx-indicator-press="self"` and paints the press itself from what
 * the owner hands down as inherited private properties (CheckboxInput:
 * `--_indicator-press-fill` for a mouse press, `--_press-paint-image` for a
 * touch press, `--_indicator-hover` for hover). The owner finds it with
 * `stylex.when.descendant()` and leaves its own layer off.
 */
export const indicatorPressScope: ReturnType<typeof stylex.defineMarker> =
  stylex.defineMarker();
