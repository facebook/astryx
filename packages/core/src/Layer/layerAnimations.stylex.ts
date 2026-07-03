// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file layerAnimations.stylex.ts
 * @input Uses StyleX, theme duration/easing tokens
 * @output Exports shared entry animation styles for layer-based components
 * @position Shared animation primitives; consumed by DropdownMenu, Popover,
 *   HoverCard, Tooltip, Selector, and any component using useLayer
 *
 * Provides opt-in entry animations for popover/layer components.
 * Components apply these via the `xstyle` prop on `layer.render()`.
 *
 * @example
 * ```
 * import {layerAnimations} from '../Layer/layerAnimations.stylex';
 *
 * // Direction-aware (for components that know placement):
 * layer.render(<Content />, {
 *   xstyle: layerAnimations[placement],
 * });
 *
 * // Fixed direction:
 * layer.render(<Content />, {
 *   xstyle: layerAnimations.below,
 * });
 * ```
 */

import * as stylex from '@stylexjs/stylex';
import {durationVars, easeVars, spacingVars} from '../theme/tokens.stylex';

const enterBelow = stylex.keyframes({
  from: {
    opacity: 0,
    transform: `translateY(calc(-1 * ${spacingVars['--spacing-2']})) scale(0.95)`,
  },
  to: {opacity: 1, transform: 'translateY(0) scale(1)'},
});

const enterAbove = stylex.keyframes({
  from: {
    opacity: 0,
    transform: `translateY(${spacingVars['--spacing-2']}) scale(0.95)`,
  },
  to: {opacity: 1, transform: 'translateY(0) scale(1)'},
});

const enterEnd = stylex.keyframes({
  from: {
    opacity: 0,
    transform: `translateX(calc(-1 * ${spacingVars['--spacing-2']})) scale(0.95)`,
  },
  to: {opacity: 1, transform: 'translateX(0) scale(1)'},
});

const enterStart = stylex.keyframes({
  from: {
    opacity: 0,
    transform: `translateX(${spacingVars['--spacing-2']}) scale(0.95)`,
  },
  to: {opacity: 1, transform: 'translateX(0) scale(1)'},
});

const animationBase = {
  animationDuration: durationVars['--duration-fast-max'],
  animationTimingFunction: easeVars['--ease-standard'],
  animationFillMode: 'backwards' as const,
};

/**
 * Shared entry animation styles for layer-based components.
 *
 * Keyed by LayerPlacement ('above' | 'below' | 'start' | 'end')
 * for easy lookup: `layerAnimations[placement]`.
 *
 * Each entry disables its keyframe animation under
 * `prefers-reduced-motion: reduce` so the layer appears instantly instead of
 * translating/scaling in (infra-6).
 */
export const layerAnimations = stylex.create({
  below: {
    animationName: {
      default: enterBelow,
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    ...animationBase,
  },
  above: {
    animationName: {
      default: enterAbove,
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    ...animationBase,
  },
  end: {
    animationName: {
      default: enterEnd,
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    ...animationBase,
  },
  start: {
    animationName: {
      default: enterStart,
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    ...animationBase,
  },
});
