// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file selectorMotion.stylex.ts
 * @input Uses StyleX plus shared motion and spacing tokens
 * @output Exports pointer-popover open and close transitions for Selector
 * @position Selector-owned motion policy; consumed by Selector.tsx
 */

import * as stylex from '@stylexjs/stylex';
import {durationVars, easeVars, spacingVars} from '../theme/tokens.stylex';

/**
 * Selector keeps keyboard-triggered disclosure instant by setting this private
 * duration override to `0s` for that interaction. Pointer disclosure falls back
 * to the shared motion tokens below.
 */
export const SELECTOR_MOTION_DURATION = '--_selector-motion-duration';

const transitionDuration = {
  default: `var(${SELECTOR_MOTION_DURATION}, ${durationVars['--duration-fast']})`,
  ':popover-open': `var(${SELECTOR_MOTION_DURATION}, ${durationVars['--duration-fast-max']})`,
  '@media (prefers-reduced-motion: reduce)': `var(${SELECTOR_MOTION_DURATION}, ${durationVars['--duration-fast-min']})`,
} as const;

const transitionBase = {
  opacity: {
    default: 0,
    ':popover-open': 1,
    '@starting-style': {
      ':popover-open': 0,
    },
  },
  transitionBehavior: 'allow-discrete' as const,
  transitionDuration,
  transitionProperty: 'opacity, transform, display, overlay',
  transitionTimingFunction: easeVars['--ease-standard'],
};

const belowTransform = `translateY(calc(-1 * ${spacingVars['--spacing-2']})) scale(0.97)`;
const aboveTransform = `translateY(${spacingVars['--spacing-2']}) scale(0.97)`;
const endTransform = `translateX(calc(-1 * ${spacingVars['--spacing-2']})) scale(0.97)`;
const startTransform = `translateX(${spacingVars['--spacing-2']}) scale(0.97)`;

export const selectorMotionStyles = stylex.create({
  below: {
    ...transitionBase,
    transform: {
      default: belowTransform,
      ':popover-open': 'translateY(0) scale(1)',
      '@starting-style': {
        ':popover-open': belowTransform,
      },
      '@media (prefers-reduced-motion: reduce)': {
        default: 'none',
        ':popover-open': 'none',
        '@starting-style': {
          ':popover-open': 'none',
        },
      },
    },
    transformOrigin: {
      default: 'top left',
      ':is([dir="rtl"] *)': 'top right',
    },
  },
  above: {
    ...transitionBase,
    transform: {
      default: aboveTransform,
      ':popover-open': 'translateY(0) scale(1)',
      '@starting-style': {
        ':popover-open': aboveTransform,
      },
      '@media (prefers-reduced-motion: reduce)': {
        default: 'none',
        ':popover-open': 'none',
        '@starting-style': {
          ':popover-open': 'none',
        },
      },
    },
    transformOrigin: {
      default: 'bottom left',
      ':is([dir="rtl"] *)': 'bottom right',
    },
  },
  end: {
    ...transitionBase,
    transform: {
      default: endTransform,
      ':popover-open': 'translateX(0) scale(1)',
      ':is([dir="rtl"] *)': startTransform,
      '@starting-style': {
        ':popover-open': endTransform,
        ':is([dir="rtl"] *)': startTransform,
      },
      '@media (prefers-reduced-motion: reduce)': {
        default: 'none',
        ':popover-open': 'none',
        ':is([dir="rtl"] *)': 'none',
        '@starting-style': {
          ':popover-open': 'none',
          ':is([dir="rtl"] *)': 'none',
        },
      },
    },
    transformOrigin: {
      default: 'center left',
      ':is([dir="rtl"] *)': 'center right',
    },
  },
  start: {
    ...transitionBase,
    transform: {
      default: startTransform,
      ':popover-open': 'translateX(0) scale(1)',
      ':is([dir="rtl"] *)': endTransform,
      '@starting-style': {
        ':popover-open': startTransform,
        ':is([dir="rtl"] *)': endTransform,
      },
      '@media (prefers-reduced-motion: reduce)': {
        default: 'none',
        ':popover-open': 'none',
        ':is([dir="rtl"] *)': 'none',
        '@starting-style': {
          ':popover-open': 'none',
          ':is([dir="rtl"] *)': 'none',
        },
      },
    },
    transformOrigin: {
      default: 'center right',
      ':is([dir="rtl"] *)': 'center left',
    },
  },
});
