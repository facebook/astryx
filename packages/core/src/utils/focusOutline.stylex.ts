// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file focusOutline.stylex.ts
 * @input Uses StyleX and theme color tokens
 * @output Exports shared focus-outline prop builders
 * @position Internal utility for consistent keyboard focus outlines across core components
 *
 * Centralizes the standard Astryx focus outline, shown only for keyboard focus.
 * Components apply these props directly so the shared focus treatment stays
 * a single theme target (`astryx-focus-outline`). Future theming can attach to
 * this class-shaped abstraction instead of re-plumbing per-component outline
 * values.
 */

import * as stylex from '@stylexjs/stylex';
import {colorVars} from '../theme/tokens.stylex';
import {mergeProps} from './mergeProps';
import {themeProps} from './themeProps';

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
    mergeProps(
      themeProps('focus-outline'),
      stylex.props(style as never, ...(styles as never[])),
    );
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
