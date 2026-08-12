// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file containerReveal.stylex.ts
 * @input Uses StyleX, theme tokens
 * @output The container style that publishes the reveal state, and the four
 *   content style blocks (reveal / conceal, each with a layout-preserved
 *   variant) that read it.
 * @position Internal to useContainerReveal.
 *
 * HOW THE SCOPING WORKS: the container declares its own reveal state as
 * inherited custom properties on itself, and content reads them. Because a
 * nested container re-declares the same properties on itself, its subtree sees
 * the inner value and never the ancestor's — nesting isolation falls out of the
 * cascade, with one static style block for any number of containers.
 *
 * SYNC: When the block shape changes, update useContainerReveal.ts.
 */

import * as stylex from '@stylexjs/stylex';
import {durationVars, easeVars} from '../theme/tokens.stylex';

const REST_DELAY = '0s, ' + durationVars['--duration-fast'];

export const styles = stylex.create({
  container: {
    '--_reveal-opacity': {
      default: 0,
      ':hover': {'@media (hover: hover)': 1},
      ':focus-within': 1,
      '@media (any-pointer: coarse)': 1,
    },
    '--_reveal-position': {
      default: 'absolute',
      ':hover': {'@media (hover: hover)': 'static'},
      ':focus-within': 'static',
      '@media (any-pointer: coarse)': 'static',
    },
    // The position flip is discrete, so it transitions with allow-discrete and
    // a state-conditional delay: 0 on entry (flips into flow immediately, then
    // fades in) and the fade duration on exit (stays in flow until the fade
    // finishes, then snaps out) — without this the exit would snap out of flow
    // at full opacity and flicker.
    '--_reveal-delay': {
      default: REST_DELAY,
      ':hover': {'@media (hover: hover)': '0s, 0s'},
      ':focus-within': '0s, 0s',
      '@media (any-pointer: coarse)': '0s, 0s',
    },
    // Conceal is a mouse-only visual swap, so it reads hover alone: no
    // :focus-within (a keyboard user must never watch content vanish) and no
    // coarse-pointer branch (it stays visible on touch).
    '--_conceal-opacity': {
      default: 1,
      ':hover': {'@media (hover: hover)': 0},
    },
  },
  // The fallbacks make content spread outside a reveal container fail visible
  // rather than invisible.
  reveal: {
    transitionProperty: 'opacity, position',
    transitionDuration: {
      default: durationVars['--duration-fast'] + ', 0s',
      '@media (prefers-reduced-motion: reduce)': '0s, 0s',
    },
    transitionTimingFunction: easeVars['--ease-standard'],
    transitionBehavior: 'allow-discrete',
    transitionDelay: {
      default: 'var(--_reveal-delay, 0s, 0s)',
      '@media (prefers-reduced-motion: reduce)': '0s, 0s',
    },
    opacity: 'var(--_reveal-opacity, 1)',
    position: 'var(--_reveal-position, static)',
  },
  revealLayoutPreserved: {
    transitionProperty: 'opacity',
    transitionDuration: {
      default: durationVars['--duration-fast'],
      '@media (prefers-reduced-motion: reduce)': '0s',
    },
    transitionTimingFunction: easeVars['--ease-standard'],
    opacity: 'var(--_reveal-opacity, 1)',
  },
  conceal: {
    transitionProperty: 'opacity',
    transitionDuration: {
      default: durationVars['--duration-fast'],
      '@media (prefers-reduced-motion: reduce)': '0s',
    },
    transitionTimingFunction: easeVars['--ease-standard'],
    opacity: 'var(--_conceal-opacity, 1)',
  },
  concealLayoutPreserved: {
    transitionProperty: 'opacity',
    transitionDuration: {
      default: durationVars['--duration-fast'],
      '@media (prefers-reduced-motion: reduce)': '0s',
    },
    transitionTimingFunction: easeVars['--ease-standard'],
    opacity: 'var(--_conceal-opacity, 1)',
  },
});
