// Copyright (c) Meta Platforms, Inc. and affiliates.

import * as stylex from '@stylexjs/stylex';

/**
 * Scoped marker for Overlay ancestor hover selectors.
 * When applied to a container, enables OverlayScrim's
 * CSS-driven showOn="hover" / "focus" / "hover-or-focus" behavior.
 */
export const overlayScope: ReturnType<typeof stylex.defineMarker> =
  stylex.defineMarker();

/**
 * Marks an OverlayRegion so its Overlay container can isolate stacking only
 * when it holds a region.
 */
export const overlayRegionMarker: ReturnType<typeof stylex.defineMarker> =
  stylex.defineMarker();

/**
 * Container styles that pair with overlayScope.
 * Sets position: relative + overflow: clip so the scrim
 * can use position: absolute + inset: 0 correctly.
 *
 * Override individual properties by applying your own styles after:
 * stylex.props(overlayContainerStyles.root, myStyles.sticky)
 */
export const overlayContainerStyles = stylex.create({
  root: {
    position: 'relative',
    overflow: 'clip',
    // The surface owns the isolation boundary for a region's local paint
    // order (spec:AST-027 FR2). Only a container that holds a region
    // isolates, so overlays without regions stack exactly as before.
    isolation: {
      default: null,
      [stylex.when.descendant(':is(*)', overlayRegionMarker)]: 'isolate',
    },
  },
});
