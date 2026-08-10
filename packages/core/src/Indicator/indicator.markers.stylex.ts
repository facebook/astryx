// Copyright (c) Meta Platforms, Inc. and affiliates.

import * as stylex from '@stylexjs/stylex';
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
 * The focus ring for a control indicator. Apply it to the indicator's root.
 *
 * Every indicator uses this same style, and so should every replacement —
 * there is nothing per-indicator in it. `outline` follows the element's own
 * `border-radius`, so one shape-agnostic rule draws a rounded-square ring on a
 * checkbox and a circular one on a radio, with no indicator having to describe
 * its own shape.
 *
 * It keys off {@link indicatorScope} rather than a plain `:focus-visible`
 * because the control's native input is a visually hidden *sibling* of the
 * indicator, not a descendant — nothing inside the indicator ever receives
 * focus, so only an ancestor selector can see it.
 *
 * This is why the ring belongs on the indicator at all: on the owner's wrapper
 * it would have to hardcode the shape of whatever indicator it happens to
 * host, which is exactly what broke when a replacement changed that shape.
 *
 * ```tsx
 * <span {...stylex.props(indicatorFocusRing, myStyles.box)} aria-hidden="true" />
 * ```
 */
const focusRingStyles = stylex.create({
  ring: {
    outline: {
      default: 'none',
      [stylex.when.ancestor(':has(:focus-visible)', indicatorScope)]:
        `2px solid ${colorVars['--color-accent']}`,
    },
    outlineOffset: {
      default: null,
      [stylex.when.ancestor(':has(:focus-visible)', indicatorScope)]: '2px',
    },
  },
});

export const indicatorFocusRing = focusRingStyles.ring;
