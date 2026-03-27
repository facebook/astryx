/**
 * @file layerAnimations.stylex.ts
 * @input Uses StyleX, theme duration/easing tokens
 * @output Exports shared entry animation styles for layer-based components
 * @position Shared animation primitives; consumed by DropdownMenu, Popover,
 *   HoverCard, Tooltip, Selector, and any component using useXDSLayer
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
import {durationVars, easeVars} from '../theme/tokens.stylex';

const SLIDE_DISTANCE = '8px';

const enterBelow = stylex.keyframes({
  from: {opacity: 0, transform: `translateY(-${SLIDE_DISTANCE}) scale(0.95)`},
  to: {opacity: 1, transform: 'translateY(0) scale(1)'},
});

const enterAbove = stylex.keyframes({
  from: {opacity: 0, transform: `translateY(${SLIDE_DISTANCE}) scale(0.95)`},
  to: {opacity: 1, transform: 'translateY(0) scale(1)'},
});

const enterEnd = stylex.keyframes({
  from: {opacity: 0, transform: `translateX(-${SLIDE_DISTANCE}) scale(0.95)`},
  to: {opacity: 1, transform: 'translateX(0) scale(1)'},
});

const enterStart = stylex.keyframes({
  from: {opacity: 0, transform: `translateX(${SLIDE_DISTANCE}) scale(0.95)`},
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
 */
export const layerAnimations = stylex.create({
  below: {
    animationName: enterBelow,
    ...animationBase,
  },
  above: {
    animationName: enterAbove,
    ...animationBase,
  },
  end: {
    animationName: enterEnd,
    ...animationBase,
  },
  start: {
    animationName: enterStart,
    ...animationBase,
  },
});
