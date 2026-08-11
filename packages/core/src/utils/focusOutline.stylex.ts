// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file focusOutline.stylex.ts
 * @input Uses StyleX and theme color tokens
 * @output Exports shared focus-outline prop builders
 * @position Internal utility for consistent keyboard focus outlines across core components
 *
 * Centralizes the standard Astryx focus outline, shown only for keyboard focus.
 * Every focusable surface drew the same 2px accent ring at 2px offset already;
 * writing it per component meant five identical definitions to keep in step.
 *
 * These are utility styles, deliberately NOT a theme target. A shared
 * `astryx-focus-outline` class was tried and pulled: a theme can only override
 * the ring unconditionally through it (`generateThemeRules` mangles
 * `:focus-visible` into `.focus-visible` and truncates `:has(:focus-visible)`
 * at the paren), so the one thing such a target exists for — restyling a
 * STATE — is exactly what it cannot express. Making focus outlines themeable
 * is worth doing on top of this consolidation, once that is fixed.
 */

import * as stylex from '@stylexjs/stylex';
import {colorVars} from '../theme/tokens.stylex';

const FOCUS_OUTLINE_WIDTH = '2px';
const FOCUS_OUTLINE_OFFSET = '2px';
const FOCUS_OUTLINE_COLOR = colorVars['--color-accent'];

/**
 * Written as longhands rather than the `outline` shorthand.
 *
 * A shorthand resets every longhand it covers, so `outline: 2px solid accent`
 * would clobber a later `outlineColor` no matter the order — which is how
 * destructive buttons silently lost their red ring. With longhands, a variant
 * can re-color the ring and inherit width, style and offset.
 */
const focusOutlineLonghands = {
  outlineWidth: FOCUS_OUTLINE_WIDTH,
  outlineStyle: 'solid',
  outlineColor: FOCUS_OUTLINE_COLOR,
} as const;

export const focusOutlineStyles = stylex.create({
  focusVisible: {
    outlineWidth: {
      default: '0',
      ':focus-visible': focusOutlineLonghands.outlineWidth,
    },
    outlineStyle: {
      default: 'none',
      ':focus-visible': focusOutlineLonghands.outlineStyle,
    },
    outlineColor: {
      default: null,
      ':focus-visible': focusOutlineLonghands.outlineColor,
    },
    outlineOffset: {default: '0', ':focus-visible': FOCUS_OUTLINE_OFFSET},
  },
  focusWithin: {
    outlineWidth: {
      default: '0',
      ':has(:focus-visible)': focusOutlineLonghands.outlineWidth,
    },
    outlineStyle: {
      default: 'none',
      ':has(:focus-visible)': focusOutlineLonghands.outlineStyle,
    },
    outlineColor: {
      default: null,
      ':has(:focus-visible)': focusOutlineLonghands.outlineColor,
    },
    outlineOffset: {default: '0', ':has(:focus-visible)': FOCUS_OUTLINE_OFFSET},
  },
  publishFocusVisibleVars: {
    '--_focus-outline': {
      default: 'none',
      ':focus-visible': `${FOCUS_OUTLINE_WIDTH} solid ${FOCUS_OUTLINE_COLOR}`,
    },
    '--_focus-outline-offset': {
      default: '0',
      ':focus-visible': FOCUS_OUTLINE_OFFSET,
    },
  },
  focusWithinOrPublished: {
    outline: {
      default: 'var(--_focus-outline, none)',
      ':has(:focus-visible)': `${FOCUS_OUTLINE_WIDTH} solid ${FOCUS_OUTLINE_COLOR}`,
    },
    outlineOffset: {
      default: 'var(--_focus-outline-offset, 0)',
      ':has(:focus-visible)': FOCUS_OUTLINE_OFFSET,
    },
  },
});

// StyleX does not expose a stable public input type for stylex.props();
// keep this helper permissive so it mirrors stylex.props() itself.
type StyleXPropsArg = unknown;

function makeFocusOutlineProps(style: StyleXPropsArg) {
  return (...styles: StyleXPropsArg[]) =>
    // Caller styles LAST, so a component can deliberately re-color its ring —
    // destructive buttons ring in error red, not accent. StyleX is last-wins,
    // and reversing this to protect the ring silently ate that override.
    //
    // The hazard in this direction is the opposite one: a caller whose base
    // style carries `outline: 'none'` wipes the ring out entirely (TreeList
    // did, and shipped a focusable row with no visible focus). Two things
    // guard it — this file states the rule, and the ring is written as
    // LONGHANDS, so an override has to name `outlineStyle`/`outlineWidth`
    // explicitly rather than erasing them through the `outline` shorthand.
    stylex.props(style as never, ...(styles as never[]));
}

export const focusOutlineProps = {
  focusVisible: makeFocusOutlineProps(focusOutlineStyles.focusVisible),
  focusWithin: makeFocusOutlineProps(focusOutlineStyles.focusWithin),
  publishFocusVisibleVars: makeFocusOutlineProps(
    focusOutlineStyles.publishFocusVisibleVars,
  ),
  focusWithinOrPublished: makeFocusOutlineProps(
    focusOutlineStyles.focusWithinOrPublished,
  ),
} as const;
