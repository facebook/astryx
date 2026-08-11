// Copyright (c) Meta Platforms, Inc. and affiliates.

import type React from 'react';
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
 * Marks an indicator as drawing its own focus ring, so the owning control
 * stops drawing one. Set by {@link indicatorFocusRingProps}; the owner reads
 * it through `:has()`.
 */
const OWNS_FOCUS_ATTR = 'data-indicator-focus';

/**
 * The focus ring the OWNING control draws around its indicator. Apply it to
 * the element that owns the (visually hidden) native input, alongside a
 * `borderRadius` for the built-in indicator's shape.
 *
 * This is the floor, not the ceiling. An indicator supplied by a theme is
 * third-party code, and the control's real input is `opacity: 0` — so if
 * drawing the ring were purely the indicator's job, a replacement that simply
 * doesn't would ship a control with no visible focus at all (WCAG 2.4.7).
 * Passing the style down as a prop is no safer: a replacement that
 * destructures `{state, size, isDisabled}` drops it, which is exactly what a
 * theme author plausibly writes.
 *
 * So the owner guarantees a ring, and any indicator that wants a different one
 * takes over explicitly with {@link indicatorFocusRingProps} — which suppresses
 * this rule through the `:has()` condition below. Forgetting to take over
 * leaves the owner's ring in place; there is no way to end up with none.
 */
export const indicatorOwnerFocusRing: StyleXStyles = stylex.create({
  ring: {
    outline: {
      default: 'none',
      ':has(:focus-visible)': `2px solid ${colorVars['--color-accent']}`,
      // Two `:has()` out-specify one, so this wins wherever both match.
      [`:has([${OWNS_FOCUS_ATTR}]):has(:focus-visible)`]: 'none',
    },
    outlineOffset: {
      default: '0',
      ':has(:focus-visible)': '2px',
    },
  },
}).ring;

const ownFocusRing = stylex.create({
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

/**
 * Props an indicator spreads to draw its OWN focus ring instead of the owning
 * control's.
 *
 * Use this when the indicator's shape differs from the control's default —
 * `outline` follows the element's own `border-radius`, so a circle rings as a
 * circle and a rounded square as a rounded square, with neither having to
 * describe itself.
 *
 * The ring and the attribute that suppresses the owner's ship as one spread on
 * purpose: setting the attribute without drawing a ring would leave the
 * control with none, so it must not be possible to do one without the other.
 *
 * It keys off {@link indicatorScope}, not `:focus-visible`, because the native
 * input is a visually hidden *sibling* of the indicator — nothing inside the
 * indicator ever receives focus.
 *
 * ```tsx
 * <span {...mergeProps(stylex.props(styles.box), indicatorFocusRingProps())} />
 * ```
 */
export function indicatorFocusRingProps(): {
  className?: string;
  style?: React.CSSProperties;
} & Record<typeof OWNS_FOCUS_ATTR, string> {
  return {
    [OWNS_FOCUS_ATTR]: '',
    ...stylex.props(ownFocusRing.ring),
  };
}
