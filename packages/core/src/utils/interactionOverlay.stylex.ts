// Copyright (c) Meta Platforms, Inc. and affiliates.

/* eslint-disable @astryx/no-hover-on-disabled -- Every hover branch is
 * nested beneath ENABLED below. Keeping that shared guard outside the media
 * branch is what gives hover and active matching generated specificity. */

/**
 * @file Shared hover and pressed overlay states
 * @input Uses StyleX and the semantic interaction-overlay color tokens
 * @output Exports reusable background-color and background-image state styles
 * @position Internal styling utility for interactive core surfaces
 *
 * Every surface that paints a press composes one of these (or carries its own
 * `:active` rule in the same shape), so a change to how the system answers a
 * press is made here once. `pressedBackgroundColor` is the press without the
 * hover, for controls whose hover is a colour or nothing.
 *
 * Keep the enabled guard outside the individual states. StyleX assigns an
 * extra priority bucket (and generated selector specificity) to media-nested
 * rules. Repeating `:active` inside the hover-capable branch gives hover and
 * press the same generated specificity; StyleX's native pseudo-state ordering
 * then emits `:active` last.
 *
 * TWO POINTERS, TWO PRESS MODELS. A mouse keeps `:active`. A finger does not:
 * on iOS Safari `:active` paints on the touch itself and can outlive the start
 * of a scroll, so under `@media (pointer: coarse)` the bare `:active` arm is
 * dropped and the press is written by the touch press controller
 * (`utils/pressFeedback.ts`) as `data-pressed="on"` once the press is
 * believed (150 ms, no travel, no scroll) and `data-pressed="fading"` for the
 * 200 ms release. The two arms below paint those:
 *
 *  - `[data-pressed="on"]` is the full pressed overlay, on the first frame.
 *    It is painted as a background IMAGE as well as a colour, because an
 *    image change is discrete (no transition can delay it) while a composer
 *    may transition its background colour, which would fade the press in
 *    over the length of a tap.
 *  - `[data-pressed="fading"]` steps the overlay down to the hover strength
 *    for the release; a composer that transitions its background colour fades
 *    through it, one that does not steps through it, and either way the
 *    attribute is gone 200 ms later.
 *
 * Composers of the colour variant must not set `backgroundImage` of their own
 * (none do): the on-arm owns it.
 */

import * as stylex from '@stylexjs/stylex';
import {colorVars} from '../theme/tokens.stylex';

const ENABLED = ':where(:not(:disabled,[aria-disabled="true"]))';
const HOVER_HOVER = '@media (hover: hover)';
const COARSE = '@media (pointer: coarse)';
/** Written by the touch press controller while a press is believed. */
const PRESSED_ON = '[data-pressed="on"]';
/** Written by the touch press controller for the release's exit. */
const PRESSED_FADING = '[data-pressed="fading"]';

const hoverImage = `linear-gradient(${colorVars['--color-overlay-hover']}, ${colorVars['--color-overlay-hover']})`;
const pressedImage = `linear-gradient(${colorVars['--color-overlay-pressed']}, ${colorVars['--color-overlay-pressed']})`;
const neutralImage = `linear-gradient(${colorVars['--color-neutral']}, ${colorVars['--color-neutral']})`;

export const interactionOverlayStyles = stylex.create({
  backgroundColor: {
    backgroundColor: {
      default: 'transparent',
      [ENABLED]: {
        default: null,
        ':active': {
          default: colorVars['--color-overlay-pressed'],
          [COARSE]: 'transparent',
        },
        [HOVER_HOVER]: {
          default: null,
          ':hover': colorVars['--color-overlay-hover'],
          ':active': colorVars['--color-overlay-pressed'],
        },
        [PRESSED_ON]: colorVars['--color-overlay-pressed'],
        [PRESSED_FADING]: colorVars['--color-overlay-hover'],
      },
    },
    backgroundImage: {
      default: null,
      [ENABLED]: {
        default: null,
        [PRESSED_ON]: pressedImage,
      },
    },
  },
  backgroundImage: {
    backgroundImage: {
      default: null,
      [ENABLED]: {
        default: null,
        ':active': {
          default: pressedImage,
          [COARSE]: 'none',
        },
        [HOVER_HOVER]: {
          default: null,
          ':hover': hoverImage,
          ':active': pressedImage,
        },
        [PRESSED_ON]: pressedImage,
        [PRESSED_FADING]: hoverImage,
      },
    },
  },
  backgroundImageOnNeutral: {
    backgroundImage: {
      default: neutralImage,
      [ENABLED]: {
        default: null,
        ':active': {
          default: `${pressedImage}, ${neutralImage}`,
          [COARSE]: neutralImage,
        },
        [HOVER_HOVER]: {
          default: null,
          ':hover': `${hoverImage}, ${neutralImage}`,
          ':active': `${pressedImage}, ${neutralImage}`,
        },
        [PRESSED_ON]: `${pressedImage}, ${neutralImage}`,
        [PRESSED_FADING]: `${hoverImage}, ${neutralImage}`,
      },
    },
  },
  /**
   * The pressed arm alone, for a control whose hover answer is its own — a
   * text link changes colour, a disclosure row has none — so a press paints
   * the system's pressed overlay without adding a hover surface the control
   * never had. Same enabled guard and the same two pointers as above, and the
   * same release step through the hover strength, which here is the only
   * moment that strength ever paints.
   */
  pressedBackgroundColor: {
    backgroundColor: {
      default: null,
      [ENABLED]: {
        default: null,
        ':active': {
          default: colorVars['--color-overlay-pressed'],
          [COARSE]: 'transparent',
        },
        [PRESSED_ON]: colorVars['--color-overlay-pressed'],
        [PRESSED_FADING]: colorVars['--color-overlay-hover'],
      },
    },
    backgroundImage: {
      default: null,
      [ENABLED]: {
        default: null,
        [PRESSED_ON]: pressedImage,
      },
    },
  },
});
