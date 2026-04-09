'use client';
/**
 * @file useEntryAnimation.ts
 * @input Uses React, StyleX, theme tokens
 * @output Exports useEntryAnimation hook for mount-only entry animations
 * @position Hook utility; consumed by XDSFieldStatus and available to consumers
 *
 * Provides entry animations for conditionally rendered elements.
 * Only animates when the element is dynamically mounted after the initial
 * page paint — statically rendered elements on page load are not animated.
 */

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {durationVars, easeVars, spacingVars} from '../theme/tokens.stylex';

// Track whether the initial page paint has completed.
// Elements rendered on page load should not animate;
// only dynamically inserted ones should.
//
// NOTE: This module is marked 'use client' so it never runs on the server.
// If the directive is removed, this flag will always be false during SSR,
// and useState(() => initialPaintComplete) will capture false — meaning
// animations won't run after hydration. Keep 'use client' or add an
// effect-based fallback if SSR support is needed.
let initialPaintComplete = false;
if (typeof window !== 'undefined') {
  requestAnimationFrame(() => {
    initialPaintComplete = true;
  });
}

const slideDown = stylex.keyframes({
  from: {
    opacity: 0,
    transform: `translateY(calc(-1 * ${spacingVars['--spacing-2']}))`,
  },
  to: {opacity: 1, transform: 'translateY(0)'},
});

const slideUp = stylex.keyframes({
  from: {
    opacity: 0,
    transform: `translateY(${spacingVars['--spacing-2']})`,
  },
  to: {opacity: 1, transform: 'translateY(0)'},
});

const fadeIn = stylex.keyframes({
  from: {opacity: 0},
  to: {opacity: 1},
});

const scaleIn = stylex.keyframes({
  from: {opacity: 0, transform: 'scale(0.95)'},
  to: {opacity: 1, transform: 'scale(1)'},
});

const styles = stylex.create({
  slideDown: {
    animationName: slideDown,
    animationDuration: durationVars['--duration-fast-max'],
    animationTimingFunction: easeVars['--ease-standard'],
    animationFillMode: 'backwards',
  },
  slideUp: {
    animationName: slideUp,
    animationDuration: durationVars['--duration-fast-max'],
    animationTimingFunction: easeVars['--ease-standard'],
    animationFillMode: 'backwards',
  },
  fadeIn: {
    animationName: fadeIn,
    animationDuration: durationVars['--duration-fast-max'],
    animationTimingFunction: easeVars['--ease-standard'],
    animationFillMode: 'backwards',
  },
  scaleIn: {
    animationName: scaleIn,
    animationDuration: durationVars['--duration-fast-max'],
    animationTimingFunction: easeVars['--ease-standard'],
    animationFillMode: 'backwards',
  },
});

export type EntryAnimationPreset =
  | 'slideDown'
  | 'slideUp'
  | 'fadeIn'
  | 'scaleIn';

/**
 * Returns a StyleX style for animating an element on mount.
 *
 * Only animates when the element is dynamically inserted after the initial
 * page paint. Elements rendered on page load are not animated.
 *
 * @example
 * ```
 * const entryStyle = useEntryAnimation('slideDown');
 * <div {...stylex.props(entryStyle)}>Animated content</div>
 * ```
 */
export function useEntryAnimation(
  preset: EntryAnimationPreset = 'slideDown',
): StyleXStyles | null {
  const [animate] = useState(() => initialPaintComplete);
  return animate ? styles[preset] : null;
}
