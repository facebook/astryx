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
const FOCUS_OUTLINE = `${FOCUS_OUTLINE_WIDTH} solid ${FOCUS_OUTLINE_COLOR}`;

export const focusOutlineStyles = stylex.create({
  focusVisible: {
    outline: {
      default: 'none',
      ':focus-visible': FOCUS_OUTLINE,
    },
    outlineOffset: {
      default: '0',
      ':focus-visible': FOCUS_OUTLINE_OFFSET,
    },
  },
  focusWithin: {
    outline: {
      default: 'none',
      ':has(:focus-visible)': FOCUS_OUTLINE,
    },
    outlineOffset: {
      default: '0',
      ':has(:focus-visible)': FOCUS_OUTLINE_OFFSET,
    },
  },
  publishFocusVisibleVars: {
    '--_focus-outline': {
      default: 'none',
      ':focus-visible': FOCUS_OUTLINE,
    },
    '--_focus-outline-offset': {
      default: '0',
      ':focus-visible': FOCUS_OUTLINE_OFFSET,
    },
  },
  focusWithinOrPublished: {
    outline: {
      default: 'var(--_focus-outline, none)',
      ':has(:focus-visible)': FOCUS_OUTLINE,
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
    // The focus style goes LAST. StyleX is last-wins, and a component's own
    // base style very often carries `outline: 'none'` — put the ring first and
    // that reset silently deletes it, leaving a control with no visible focus
    // (WCAG 2.4.7) and no error anywhere. TreeList hit exactly this.
    //
    // Callers therefore cannot clobber the ring by accident; one that means to
    // override it can still do so by spreading its own style after this call.
    stylex.props(...(styles as never[]), style as never);
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
