// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file focusOwner.ts
 * @input focus ring tokens
 * @output FOCUS_OWNER_ATTRIBUTE and focusOwnerProps, the ring a wrapper paints
 *   only for its marked primary control
 * @position Internal to Core: not part of any published entry point, so the
 *   owner marker and its ring stay a component-local detail of Item and Token
 *   (`architecture:public-component-api` INV12)
 */

import * as stylex from '@stylexjs/stylex';
import type {StyleXPropsArg} from '@stylexjs/stylex';
import {focusVars} from '../theme/tokens.stylex';

/** Marks the direct child a focus-owner wrapper rings for. */
export const FOCUS_OWNER_ATTRIBUTE = 'data-astryx-focus-owner';

// Rings only for the direct child marked with FOCUS_OWNER_ATTRIBUTE, wherever
// it sits among its siblings, so every other control inside rings itself
// (`architecture:interaction-modality` INV3). Only a direct child counts, so a
// nested component's own owner never rings this wrapper. Written as
// longhands, like focusOutlineStyles.
const styles = stylex.create({
  focusWithinOwner: {
    outlineWidth: {
      default: '0',
      ':has(> [data-astryx-focus-owner]:focus-visible)':
        focusVars['--focus-outline-width'],
    },
    outlineStyle: {
      default: 'none',
      ':has(> [data-astryx-focus-owner]:focus-visible)':
        focusVars['--focus-outline-style'],
    },
    outlineColor: {
      default: null,
      ':has(> [data-astryx-focus-owner]:focus-visible)':
        focusVars['--focus-outline-color'],
    },
    outlineOffset: {
      default: '0',
      ':has(> [data-astryx-focus-owner]:focus-visible)':
        focusVars['--focus-outline-offset'],
    },
  },
});

/** The owner ring, with caller styles last (as focusOutlineProps does). */
export function focusWithinOwnerProps(...extra: StyleXPropsArg[]) {
  return stylex.props(styles.focusWithinOwner as never, ...(extra as never[]));
}
