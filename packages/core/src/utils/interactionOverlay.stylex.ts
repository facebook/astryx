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
 * Keep the enabled guard outside the individual states. StyleX assigns an
 * extra priority bucket (and generated selector specificity) to media-nested
 * rules. Repeating `:active` inside the hover-capable branch gives hover and
 * press the same generated specificity; StyleX's native pseudo-state ordering
 * then emits `:active` last. The bare `:active` branch remains the touch
 * fallback, where `(hover: hover)` does not match.
 */

import * as stylex from '@stylexjs/stylex';
import {colorVars} from '../theme/tokens.stylex';

const ENABLED = ':where(:not(:disabled,[aria-disabled="true"]))';
const HOVER_HOVER = '@media (hover: hover)';

const hoverImage = `linear-gradient(${colorVars['--color-overlay-hover']}, ${colorVars['--color-overlay-hover']})`;
const pressedImage = `linear-gradient(${colorVars['--color-overlay-pressed']}, ${colorVars['--color-overlay-pressed']})`;
const neutralImage = `linear-gradient(${colorVars['--color-neutral']}, ${colorVars['--color-neutral']})`;

export const interactionOverlayStyles = stylex.create({
  backgroundColor: {
    backgroundColor: {
      default: 'transparent',
      [ENABLED]: {
        default: null,
        ':active': colorVars['--color-overlay-pressed'],
        [HOVER_HOVER]: {
          default: null,
          ':hover': colorVars['--color-overlay-hover'],
          ':active': colorVars['--color-overlay-pressed'],
        },
      },
    },
  },
  backgroundImage: {
    backgroundImage: {
      default: null,
      [ENABLED]: {
        default: null,
        ':active': pressedImage,
        [HOVER_HOVER]: {
          default: null,
          ':hover': hoverImage,
          ':active': pressedImage,
        },
      },
    },
  },
  backgroundImageOnNeutral: {
    backgroundImage: {
      default: neutralImage,
      [ENABLED]: {
        default: null,
        ':active': `${pressedImage}, ${neutralImage}`,
        [HOVER_HOVER]: {
          default: null,
          ':hover': `${hoverImage}, ${neutralImage}`,
          ':active': `${pressedImage}, ${neutralImage}`,
        },
      },
    },
  },
});
