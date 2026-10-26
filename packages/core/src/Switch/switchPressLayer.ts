// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file switchPressLayer.ts
 * @input StyleX and the touch press strength (`pressVars`,
 *   interactionOverlay.stylex.ts)
 * @output `switchPressLayerStyles.pressedAlphaLayered`: the press strength's
 *   hold for Switch, whose press paint the track's own `::before` layer
 *   releases (Switch.tsx)
 * @position Internal to Switch: core's `exports` list only Switch's index
 *   (`architecture:public-component-api` INV12). Switch is its only user.
 */

import * as stylex from '@stylexjs/stylex';
import {pressVars} from '../utils/interactionOverlay.stylex';

const PRESS_ALPHA = pressVars['--astryx-press-alpha'];

/**
 * The overlay's strength release (interactionOverlay.stylex.ts), restated so
 * a fine pointer keeps it: the same keyframes, so the same animation.
 */
const pressRelease = stylex.keyframes({
  from: {[PRESS_ALPHA]: 1},
  to: {[PRESS_ALPHA]: 0},
});

export const switchPressLayerStyles = stylex.create({
  /**
   * Composed after `interactionOverlayStyles.pressedAlpha`. The track's
   * `::before` fades the press paint's opacity on the control clock, so
   * under a coarse primary pointer the strength holds through the release
   * instead of animating on the main thread, and the layer's opacity is the
   * one fade. With any other pointer it is `pressedAlpha` exactly (the
   * desktop rule, `spec:AST-017` FR59/DEC-25).
   */
  pressedAlphaLayered: {
    animationName: {
      default: null,
      '[data-astryx-press="fading"]': {
        default: pressRelease,
        '@media (prefers-reduced-motion: reduce) and (not (pointer: coarse))':
          'none',
        '@media (pointer: coarse)': 'none',
      },
    },
  },
});
