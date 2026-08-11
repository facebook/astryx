// Copyright (c) Meta Platforms, Inc. and affiliates.

import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {colorVars} from '../theme/tokens.stylex';

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
 * The focus ring for a control whose indicator is themeable. Apply it to the
 * element that owns the (visually hidden) native input, together with a
 * `borderRadius` matching the indicator's shape.
 *
 * **The owner draws this, not the indicator.** That reads backwards — only the
 * indicator knows its own shape — but the alternative fails worse. An
 * indicator supplied by a theme is third-party code: if drawing the ring were
 * its job, a replacement that simply doesn't ships a control with *no visible
 * focus at all* (WCAG 2.4.7), because the real input is `opacity: 0`. Passing
 * the style down as a prop is no better — a replacement that destructures
 * `{state, size, isDisabled}` drops it just as easily, which is exactly what
 * the sample replacement in our own Storybook does.
 *
 * So the guarantee lives where a replacement cannot reach. The cost is that a
 * replacement whose shape differs from the built-in gets a ring of the built-in
 * shape — visibly correct, geometrically approximate. That is the right way
 * round: a slightly-wrong ring is a cosmetic bug, a missing one is an
 * accessibility failure.
 */
export const indicatorOwnerFocusRing: StyleXStyles = stylex.create({
  ring: {
    outline: {
      default: 'none',
      ':has(:focus-visible)': `2px solid ${colorVars['--color-accent']}`,
    },
    outlineOffset: {
      default: '0',
      ':has(:focus-visible)': '2px',
    },
  },
}).ring;
