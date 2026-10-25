// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file RefreshControl.tsx
 * @input Uses React, StyleX, Astryx core theme tokens and utilities,
 *   useRefreshControl
 * @output Exports RefreshControl and RefreshControlProps
 * @position Lab implementation; consumed by packages/lab/src/index.ts
 *
 * Pull to refresh for the content it wraps, inside a ScrollableArea (or any
 * scroll container) or on the page. The content itself is pulled; the
 * indicator stays at the top of the scroll view in the gap a pull opens, as
 * UIRefreshControl does, and the content's edge covers it on the way back.
 * The title (optional) sits under the indicator.
 *
 * The indicator is UIRefreshControl's replicator, drawn from the refresh
 * table: eight capsule spokes revealed one after another by the pull (a CSS
 * custom property the pull writes) and, once the refresh starts, a gradient
 * that springs in and steps round clockwise every eighth of a second. Each
 * spoke is its own layer holding its capsule already drawn at its angle, so
 * nothing is resampled at rest, and the spin is opacity steps keyed on the
 * indicator's `data-refresh-spinning` attribute: compositor animations that
 * keep turning while a script runs. The gradient's spring is the hook's: it
 * cross-fades the two spoke layers (`revealLayerRef`, `spinLayerRef`) on the
 * animator, so a theme that retunes `refreshControl.triggerGradientSpring`
 * retunes it; Reduce Motion leaves the fade as it is (nothing travels).
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/RefreshControl/RefreshControl.doc.mjs
 * - /packages/lab/src/RefreshControl/RefreshControl.test.tsx
 * - /packages/lab/src/RefreshControl/index.ts
 * - /apps/storybook/stories/RefreshControl.stories.tsx
 */

import type {ReactNode, Ref} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {BaseProps} from '@astryxdesign/core';
import {useMergedRefs} from '@astryxdesign/core/hooks';
import {refreshControl} from '@astryxdesign/core/motion/uikit/refresh';
import {
  colorVars,
  spacingVars,
  typeScaleVars,
} from '@astryxdesign/core/theme/tokens.stylex';
import {mergeProps, themeProps} from '@astryxdesign/core/utils';
import {refreshIndicatorScope} from './refreshControl.markers.stylex';
import {REFRESH_HEIGHT} from './refreshPull';
import {
  REFRESH_REVEAL_VAR,
  useRefreshControl,
  type UseRefreshControlOptions,
} from './useRefreshControl';

const SPOKES = refreshControl.indicatorSpokes;
const REVEAL = `var(${REFRESH_REVEAL_VAR}, 0)`;
/** The indicator's side: the spokes reach `spokeOuterRadiusPt` from its center. */
const GLYPH = 2 * refreshControl.spokeOuterRadiusPt;

/**
 * A spoke's opacity while the pull reveals it, as UIKit's replicator draws
 * it: the layer's opacity is the reveal, and each spoke is fainter than the
 * one before by the alpha offset (reveal − 1), so the spokes fill in one
 * after another. At the trigger every spoke is at full alpha.
 */
function revealOpacity(index: number): string {
  return `calc(${REVEAL} * clamp(0, 1 + ${index} * (${REVEAL} - 1), 1))`;
}

// While refreshing, UIKit's replicator turns its instances by one spoke every
// eighth of `spinMs`, each instance `spinInstanceAlphaOffset` more opaque
// than the one before it (the first at `spinFirstInstanceAlpha`). With eight
// spokes at eight angles that is each spoke stepping its own opacity through
// the instances that pass it, so every step is drawn at its own angle and
// nothing is resampled: spoke p holds instance (p − s) mod 8 at step s. Holds
// joined by 0.1 ms ramps under linear timing, never steps(), so every engine
// runs them on the compositor. Each spoke's phase is in its keyframes, not an
// animation-delay, and one iteration holds eight turns (8 × `spinMs`): a CSS
// animation asks the main thread for a frame at every iteration (its
// animationiteration event), and a frame per turn repainted the page while
// the content settled; this way the eight share one boundary every 8 s.
// SYNC: RefreshControl.test.tsx checks every step against refresh.ts.
const spinSpoke0 = stylex.keyframes({
  '0%, 1.56125%, 12.5%, 14.06125%, 25%, 26.56125%, 37.5%, 39.06125%, 50%, 51.56125%, 62.5%, 64.06125%, 75%, 76.56125%, 87.5%, 89.06125%':
    {opacity: 0},
  '10.9375%, 12.49875%, 23.4375%, 24.99875%, 35.9375%, 37.49875%, 48.4375%, 49.99875%, 60.9375%, 62.49875%, 73.4375%, 74.99875%, 85.9375%, 87.49875%, 98.4375%, 100%':
    {opacity: 0.08},
  '9.375%, 10.93625%, 21.875%, 23.43625%, 34.375%, 35.93625%, 46.875%, 48.43625%, 59.375%, 60.93625%, 71.875%, 73.43625%, 84.375%, 85.93625%, 96.875%, 98.43625%':
    {opacity: 0.16},
  '7.8125%, 9.37375%, 20.3125%, 21.87375%, 32.8125%, 34.37375%, 45.3125%, 46.87375%, 57.8125%, 59.37375%, 70.3125%, 71.87375%, 82.8125%, 84.37375%, 95.3125%, 96.87375%':
    {opacity: 0.24},
  '6.25%, 7.81125%, 18.75%, 20.31125%, 31.25%, 32.81125%, 43.75%, 45.31125%, 56.25%, 57.81125%, 68.75%, 70.31125%, 81.25%, 82.81125%, 93.75%, 95.31125%':
    {opacity: 0.32},
  '4.6875%, 6.24875%, 17.1875%, 18.74875%, 29.6875%, 31.24875%, 42.1875%, 43.74875%, 54.6875%, 56.24875%, 67.1875%, 68.74875%, 79.6875%, 81.24875%, 92.1875%, 93.74875%':
    {opacity: 0.4},
  '3.125%, 4.68625%, 15.625%, 17.18625%, 28.125%, 29.68625%, 40.625%, 42.18625%, 53.125%, 54.68625%, 65.625%, 67.18625%, 78.125%, 79.68625%, 90.625%, 92.18625%':
    {opacity: 0.48},
  '1.5625%, 3.12375%, 14.0625%, 15.62375%, 26.5625%, 28.12375%, 39.0625%, 40.62375%, 51.5625%, 53.12375%, 64.0625%, 65.62375%, 76.5625%, 78.12375%, 89.0625%, 90.62375%':
    {opacity: 0.56},
});
const spinSpoke1 = stylex.keyframes({
  '1.5625%, 3.12375%, 14.0625%, 15.62375%, 26.5625%, 28.12375%, 39.0625%, 40.62375%, 51.5625%, 53.12375%, 64.0625%, 65.62375%, 76.5625%, 78.12375%, 89.0625%, 90.62375%':
    {opacity: 0},
  '0%, 1.56125%, 12.5%, 14.06125%, 25%, 26.56125%, 37.5%, 39.06125%, 50%, 51.56125%, 62.5%, 64.06125%, 75%, 76.56125%, 87.5%, 89.06125%':
    {opacity: 0.08},
  '10.9375%, 12.49875%, 23.4375%, 24.99875%, 35.9375%, 37.49875%, 48.4375%, 49.99875%, 60.9375%, 62.49875%, 73.4375%, 74.99875%, 85.9375%, 87.49875%, 98.4375%, 100%':
    {opacity: 0.16},
  '9.375%, 10.93625%, 21.875%, 23.43625%, 34.375%, 35.93625%, 46.875%, 48.43625%, 59.375%, 60.93625%, 71.875%, 73.43625%, 84.375%, 85.93625%, 96.875%, 98.43625%':
    {opacity: 0.24},
  '7.8125%, 9.37375%, 20.3125%, 21.87375%, 32.8125%, 34.37375%, 45.3125%, 46.87375%, 57.8125%, 59.37375%, 70.3125%, 71.87375%, 82.8125%, 84.37375%, 95.3125%, 96.87375%':
    {opacity: 0.32},
  '6.25%, 7.81125%, 18.75%, 20.31125%, 31.25%, 32.81125%, 43.75%, 45.31125%, 56.25%, 57.81125%, 68.75%, 70.31125%, 81.25%, 82.81125%, 93.75%, 95.31125%':
    {opacity: 0.4},
  '4.6875%, 6.24875%, 17.1875%, 18.74875%, 29.6875%, 31.24875%, 42.1875%, 43.74875%, 54.6875%, 56.24875%, 67.1875%, 68.74875%, 79.6875%, 81.24875%, 92.1875%, 93.74875%':
    {opacity: 0.48},
  '3.125%, 4.68625%, 15.625%, 17.18625%, 28.125%, 29.68625%, 40.625%, 42.18625%, 53.125%, 54.68625%, 65.625%, 67.18625%, 78.125%, 79.68625%, 90.625%, 92.18625%':
    {opacity: 0.56},
});
const spinSpoke2 = stylex.keyframes({
  '3.125%, 4.68625%, 15.625%, 17.18625%, 28.125%, 29.68625%, 40.625%, 42.18625%, 53.125%, 54.68625%, 65.625%, 67.18625%, 78.125%, 79.68625%, 90.625%, 92.18625%':
    {opacity: 0},
  '1.5625%, 3.12375%, 14.0625%, 15.62375%, 26.5625%, 28.12375%, 39.0625%, 40.62375%, 51.5625%, 53.12375%, 64.0625%, 65.62375%, 76.5625%, 78.12375%, 89.0625%, 90.62375%':
    {opacity: 0.08},
  '0%, 1.56125%, 12.5%, 14.06125%, 25%, 26.56125%, 37.5%, 39.06125%, 50%, 51.56125%, 62.5%, 64.06125%, 75%, 76.56125%, 87.5%, 89.06125%':
    {opacity: 0.16},
  '10.9375%, 12.49875%, 23.4375%, 24.99875%, 35.9375%, 37.49875%, 48.4375%, 49.99875%, 60.9375%, 62.49875%, 73.4375%, 74.99875%, 85.9375%, 87.49875%, 98.4375%, 100%':
    {opacity: 0.24},
  '9.375%, 10.93625%, 21.875%, 23.43625%, 34.375%, 35.93625%, 46.875%, 48.43625%, 59.375%, 60.93625%, 71.875%, 73.43625%, 84.375%, 85.93625%, 96.875%, 98.43625%':
    {opacity: 0.32},
  '7.8125%, 9.37375%, 20.3125%, 21.87375%, 32.8125%, 34.37375%, 45.3125%, 46.87375%, 57.8125%, 59.37375%, 70.3125%, 71.87375%, 82.8125%, 84.37375%, 95.3125%, 96.87375%':
    {opacity: 0.4},
  '6.25%, 7.81125%, 18.75%, 20.31125%, 31.25%, 32.81125%, 43.75%, 45.31125%, 56.25%, 57.81125%, 68.75%, 70.31125%, 81.25%, 82.81125%, 93.75%, 95.31125%':
    {opacity: 0.48},
  '4.6875%, 6.24875%, 17.1875%, 18.74875%, 29.6875%, 31.24875%, 42.1875%, 43.74875%, 54.6875%, 56.24875%, 67.1875%, 68.74875%, 79.6875%, 81.24875%, 92.1875%, 93.74875%':
    {opacity: 0.56},
});
const spinSpoke3 = stylex.keyframes({
  '4.6875%, 6.24875%, 17.1875%, 18.74875%, 29.6875%, 31.24875%, 42.1875%, 43.74875%, 54.6875%, 56.24875%, 67.1875%, 68.74875%, 79.6875%, 81.24875%, 92.1875%, 93.74875%':
    {opacity: 0},
  '3.125%, 4.68625%, 15.625%, 17.18625%, 28.125%, 29.68625%, 40.625%, 42.18625%, 53.125%, 54.68625%, 65.625%, 67.18625%, 78.125%, 79.68625%, 90.625%, 92.18625%':
    {opacity: 0.08},
  '1.5625%, 3.12375%, 14.0625%, 15.62375%, 26.5625%, 28.12375%, 39.0625%, 40.62375%, 51.5625%, 53.12375%, 64.0625%, 65.62375%, 76.5625%, 78.12375%, 89.0625%, 90.62375%':
    {opacity: 0.16},
  '0%, 1.56125%, 12.5%, 14.06125%, 25%, 26.56125%, 37.5%, 39.06125%, 50%, 51.56125%, 62.5%, 64.06125%, 75%, 76.56125%, 87.5%, 89.06125%':
    {opacity: 0.24},
  '10.9375%, 12.49875%, 23.4375%, 24.99875%, 35.9375%, 37.49875%, 48.4375%, 49.99875%, 60.9375%, 62.49875%, 73.4375%, 74.99875%, 85.9375%, 87.49875%, 98.4375%, 100%':
    {opacity: 0.32},
  '9.375%, 10.93625%, 21.875%, 23.43625%, 34.375%, 35.93625%, 46.875%, 48.43625%, 59.375%, 60.93625%, 71.875%, 73.43625%, 84.375%, 85.93625%, 96.875%, 98.43625%':
    {opacity: 0.4},
  '7.8125%, 9.37375%, 20.3125%, 21.87375%, 32.8125%, 34.37375%, 45.3125%, 46.87375%, 57.8125%, 59.37375%, 70.3125%, 71.87375%, 82.8125%, 84.37375%, 95.3125%, 96.87375%':
    {opacity: 0.48},
  '6.25%, 7.81125%, 18.75%, 20.31125%, 31.25%, 32.81125%, 43.75%, 45.31125%, 56.25%, 57.81125%, 68.75%, 70.31125%, 81.25%, 82.81125%, 93.75%, 95.31125%':
    {opacity: 0.56},
});
const spinSpoke4 = stylex.keyframes({
  '6.25%, 7.81125%, 18.75%, 20.31125%, 31.25%, 32.81125%, 43.75%, 45.31125%, 56.25%, 57.81125%, 68.75%, 70.31125%, 81.25%, 82.81125%, 93.75%, 95.31125%':
    {opacity: 0},
  '4.6875%, 6.24875%, 17.1875%, 18.74875%, 29.6875%, 31.24875%, 42.1875%, 43.74875%, 54.6875%, 56.24875%, 67.1875%, 68.74875%, 79.6875%, 81.24875%, 92.1875%, 93.74875%':
    {opacity: 0.08},
  '3.125%, 4.68625%, 15.625%, 17.18625%, 28.125%, 29.68625%, 40.625%, 42.18625%, 53.125%, 54.68625%, 65.625%, 67.18625%, 78.125%, 79.68625%, 90.625%, 92.18625%':
    {opacity: 0.16},
  '1.5625%, 3.12375%, 14.0625%, 15.62375%, 26.5625%, 28.12375%, 39.0625%, 40.62375%, 51.5625%, 53.12375%, 64.0625%, 65.62375%, 76.5625%, 78.12375%, 89.0625%, 90.62375%':
    {opacity: 0.24},
  '0%, 1.56125%, 12.5%, 14.06125%, 25%, 26.56125%, 37.5%, 39.06125%, 50%, 51.56125%, 62.5%, 64.06125%, 75%, 76.56125%, 87.5%, 89.06125%':
    {opacity: 0.32},
  '10.9375%, 12.49875%, 23.4375%, 24.99875%, 35.9375%, 37.49875%, 48.4375%, 49.99875%, 60.9375%, 62.49875%, 73.4375%, 74.99875%, 85.9375%, 87.49875%, 98.4375%, 100%':
    {opacity: 0.4},
  '9.375%, 10.93625%, 21.875%, 23.43625%, 34.375%, 35.93625%, 46.875%, 48.43625%, 59.375%, 60.93625%, 71.875%, 73.43625%, 84.375%, 85.93625%, 96.875%, 98.43625%':
    {opacity: 0.48},
  '7.8125%, 9.37375%, 20.3125%, 21.87375%, 32.8125%, 34.37375%, 45.3125%, 46.87375%, 57.8125%, 59.37375%, 70.3125%, 71.87375%, 82.8125%, 84.37375%, 95.3125%, 96.87375%':
    {opacity: 0.56},
});
const spinSpoke5 = stylex.keyframes({
  '7.8125%, 9.37375%, 20.3125%, 21.87375%, 32.8125%, 34.37375%, 45.3125%, 46.87375%, 57.8125%, 59.37375%, 70.3125%, 71.87375%, 82.8125%, 84.37375%, 95.3125%, 96.87375%':
    {opacity: 0},
  '6.25%, 7.81125%, 18.75%, 20.31125%, 31.25%, 32.81125%, 43.75%, 45.31125%, 56.25%, 57.81125%, 68.75%, 70.31125%, 81.25%, 82.81125%, 93.75%, 95.31125%':
    {opacity: 0.08},
  '4.6875%, 6.24875%, 17.1875%, 18.74875%, 29.6875%, 31.24875%, 42.1875%, 43.74875%, 54.6875%, 56.24875%, 67.1875%, 68.74875%, 79.6875%, 81.24875%, 92.1875%, 93.74875%':
    {opacity: 0.16},
  '3.125%, 4.68625%, 15.625%, 17.18625%, 28.125%, 29.68625%, 40.625%, 42.18625%, 53.125%, 54.68625%, 65.625%, 67.18625%, 78.125%, 79.68625%, 90.625%, 92.18625%':
    {opacity: 0.24},
  '1.5625%, 3.12375%, 14.0625%, 15.62375%, 26.5625%, 28.12375%, 39.0625%, 40.62375%, 51.5625%, 53.12375%, 64.0625%, 65.62375%, 76.5625%, 78.12375%, 89.0625%, 90.62375%':
    {opacity: 0.32},
  '0%, 1.56125%, 12.5%, 14.06125%, 25%, 26.56125%, 37.5%, 39.06125%, 50%, 51.56125%, 62.5%, 64.06125%, 75%, 76.56125%, 87.5%, 89.06125%':
    {opacity: 0.4},
  '10.9375%, 12.49875%, 23.4375%, 24.99875%, 35.9375%, 37.49875%, 48.4375%, 49.99875%, 60.9375%, 62.49875%, 73.4375%, 74.99875%, 85.9375%, 87.49875%, 98.4375%, 100%':
    {opacity: 0.48},
  '9.375%, 10.93625%, 21.875%, 23.43625%, 34.375%, 35.93625%, 46.875%, 48.43625%, 59.375%, 60.93625%, 71.875%, 73.43625%, 84.375%, 85.93625%, 96.875%, 98.43625%':
    {opacity: 0.56},
});
const spinSpoke6 = stylex.keyframes({
  '9.375%, 10.93625%, 21.875%, 23.43625%, 34.375%, 35.93625%, 46.875%, 48.43625%, 59.375%, 60.93625%, 71.875%, 73.43625%, 84.375%, 85.93625%, 96.875%, 98.43625%':
    {opacity: 0},
  '7.8125%, 9.37375%, 20.3125%, 21.87375%, 32.8125%, 34.37375%, 45.3125%, 46.87375%, 57.8125%, 59.37375%, 70.3125%, 71.87375%, 82.8125%, 84.37375%, 95.3125%, 96.87375%':
    {opacity: 0.08},
  '6.25%, 7.81125%, 18.75%, 20.31125%, 31.25%, 32.81125%, 43.75%, 45.31125%, 56.25%, 57.81125%, 68.75%, 70.31125%, 81.25%, 82.81125%, 93.75%, 95.31125%':
    {opacity: 0.16},
  '4.6875%, 6.24875%, 17.1875%, 18.74875%, 29.6875%, 31.24875%, 42.1875%, 43.74875%, 54.6875%, 56.24875%, 67.1875%, 68.74875%, 79.6875%, 81.24875%, 92.1875%, 93.74875%':
    {opacity: 0.24},
  '3.125%, 4.68625%, 15.625%, 17.18625%, 28.125%, 29.68625%, 40.625%, 42.18625%, 53.125%, 54.68625%, 65.625%, 67.18625%, 78.125%, 79.68625%, 90.625%, 92.18625%':
    {opacity: 0.32},
  '1.5625%, 3.12375%, 14.0625%, 15.62375%, 26.5625%, 28.12375%, 39.0625%, 40.62375%, 51.5625%, 53.12375%, 64.0625%, 65.62375%, 76.5625%, 78.12375%, 89.0625%, 90.62375%':
    {opacity: 0.4},
  '0%, 1.56125%, 12.5%, 14.06125%, 25%, 26.56125%, 37.5%, 39.06125%, 50%, 51.56125%, 62.5%, 64.06125%, 75%, 76.56125%, 87.5%, 89.06125%':
    {opacity: 0.48},
  '10.9375%, 12.49875%, 23.4375%, 24.99875%, 35.9375%, 37.49875%, 48.4375%, 49.99875%, 60.9375%, 62.49875%, 73.4375%, 74.99875%, 85.9375%, 87.49875%, 98.4375%, 100%':
    {opacity: 0.56},
});
const spinSpoke7 = stylex.keyframes({
  '10.9375%, 12.49875%, 23.4375%, 24.99875%, 35.9375%, 37.49875%, 48.4375%, 49.99875%, 60.9375%, 62.49875%, 73.4375%, 74.99875%, 85.9375%, 87.49875%, 98.4375%, 100%':
    {opacity: 0},
  '9.375%, 10.93625%, 21.875%, 23.43625%, 34.375%, 35.93625%, 46.875%, 48.43625%, 59.375%, 60.93625%, 71.875%, 73.43625%, 84.375%, 85.93625%, 96.875%, 98.43625%':
    {opacity: 0.08},
  '7.8125%, 9.37375%, 20.3125%, 21.87375%, 32.8125%, 34.37375%, 45.3125%, 46.87375%, 57.8125%, 59.37375%, 70.3125%, 71.87375%, 82.8125%, 84.37375%, 95.3125%, 96.87375%':
    {opacity: 0.16},
  '6.25%, 7.81125%, 18.75%, 20.31125%, 31.25%, 32.81125%, 43.75%, 45.31125%, 56.25%, 57.81125%, 68.75%, 70.31125%, 81.25%, 82.81125%, 93.75%, 95.31125%':
    {opacity: 0.24},
  '4.6875%, 6.24875%, 17.1875%, 18.74875%, 29.6875%, 31.24875%, 42.1875%, 43.74875%, 54.6875%, 56.24875%, 67.1875%, 68.74875%, 79.6875%, 81.24875%, 92.1875%, 93.74875%':
    {opacity: 0.32},
  '3.125%, 4.68625%, 15.625%, 17.18625%, 28.125%, 29.68625%, 40.625%, 42.18625%, 53.125%, 54.68625%, 65.625%, 67.18625%, 78.125%, 79.68625%, 90.625%, 92.18625%':
    {opacity: 0.4},
  '1.5625%, 3.12375%, 14.0625%, 15.62375%, 26.5625%, 28.12375%, 39.0625%, 40.62375%, 51.5625%, 53.12375%, 64.0625%, 65.62375%, 76.5625%, 78.12375%, 89.0625%, 90.62375%':
    {opacity: 0.48},
  '0%, 1.56125%, 12.5%, 14.06125%, 25%, 26.56125%, 37.5%, 39.06125%, 50%, 51.56125%, 62.5%, 64.06125%, 75%, 76.56125%, 87.5%, 89.06125%':
    {opacity: 0.56},
});

const styles = stylex.create({
  root: {
    position: 'relative',
  },
  // Rides on the content's top edge and clips the indicator to the gap above
  // it: the content's edge covers the pinned indicator as it comes back.
  indicatorClip: {
    position: 'absolute',
    insetInline: 0,
    bottom: '100%',
    // Taller than any pull: the indicator stays inside it.
    height: '100lvh',
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  indicator: {
    position: 'absolute',
    insetInline: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacingVars['--spacing-1'],
    pointerEvents: 'none',
  },
  // UIRefreshControl's band, at the bottom of the clip: the hook moves it
  // against the content so it stays at the top of the scroll view.
  indicatorBand: (height: number) => ({
    bottom: 0,
    height,
  }),
  // The indicator: the spokes reach 15 pt from its center (30 pt across,
  // `GLYPH`; StyleX needs the literal). `isolation` keeps the spin's
  // `plus-lighter` sum inside it. The spin keys on the indicator's
  // `data-refresh-spinning` (SYNC: REFRESH_SPINNING_ATTRIBUTE in
  // useRefreshControl.ts).
  glyph: {
    position: 'relative',
    flexShrink: 0,
    width: 30,
    height: 30,
    isolation: 'isolate',
  },
  spokeSet: {
    position: 'absolute',
    inset: 0,
  },
  // The spokes the pull reveals. At the trigger the hook fades this layer
  // out on the gradient spring as it fades the stepping layer in
  // (`revealLayerRef`, `spinLayerRef`); UIKit's per-spoke alpha is
  // (1 − g) + g × the stepping alpha, g the spring's progress, and
  // `plus-lighter` sums the two layers exactly.
  uniformSet: {
    opacity: 1,
    willChange: 'opacity',
  },
  gradientSet: {
    opacity: 0,
    mixBlendMode: 'plus-lighter',
    willChange: 'opacity',
  },
  // Each stepping spoke runs its own phase of the gradient while spinning,
  // eight turns per iteration: eight times the `refreshControl.spinMs`
  // motion role (a theme that sets it writes the variable; otherwise the
  // table's 1 s).
  spin0: {
    animationName: {
      default: 'none',
      [stylex.when.ancestor('[data-refresh-spinning]', refreshIndicatorScope)]:
        spinSpoke0,
    },
  },
  spin1: {
    animationName: {
      default: 'none',
      [stylex.when.ancestor('[data-refresh-spinning]', refreshIndicatorScope)]:
        spinSpoke1,
    },
  },
  spin2: {
    animationName: {
      default: 'none',
      [stylex.when.ancestor('[data-refresh-spinning]', refreshIndicatorScope)]:
        spinSpoke2,
    },
  },
  spin3: {
    animationName: {
      default: 'none',
      [stylex.when.ancestor('[data-refresh-spinning]', refreshIndicatorScope)]:
        spinSpoke3,
    },
  },
  spin4: {
    animationName: {
      default: 'none',
      [stylex.when.ancestor('[data-refresh-spinning]', refreshIndicatorScope)]:
        spinSpoke4,
    },
  },
  spin5: {
    animationName: {
      default: 'none',
      [stylex.when.ancestor('[data-refresh-spinning]', refreshIndicatorScope)]:
        spinSpoke5,
    },
  },
  spin6: {
    animationName: {
      default: 'none',
      [stylex.when.ancestor('[data-refresh-spinning]', refreshIndicatorScope)]:
        spinSpoke6,
    },
  },
  spin7: {
    animationName: {
      default: 'none',
      [stylex.when.ancestor('[data-refresh-spinning]', refreshIndicatorScope)]:
        spinSpoke7,
    },
  },
  spinTiming: {
    willChange: 'opacity',
    animationDuration:
      'calc(8 * var(--motion-refresh-control-spin-ms, 1000ms))',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'linear',
  },
  spoke: {
    position: 'absolute',
    inset: 0,
  },
  spokeOpacity: (opacity: string) => ({
    opacity,
    // Each spoke is its own compositor layer: the pull changes its opacity
    // every move (through the reveal), and a composited opacity changes
    // without a repaint.
    willChange: 'opacity',
  }),
  spokeShape: {
    display: 'block',
    fill: colorVars['--color-text-secondary'],
  },
  title: {
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    color: colorVars['--color-text-secondary'],
    textAlign: 'center',
    // SYNC: REFRESH_REVEAL_VAR in useRefreshControl.ts
    opacity: 'var(--astryx-refresh-reveal, 0)',
    // Composited, as the spokes: the reveal changes it every move.
    willChange: 'opacity',
  },
});

export interface RefreshControlProps
  extends BaseProps<HTMLElement>, UseRefreshControlOptions {
  /** Ref forwarded to the root element (the pulled content). */
  ref?: Ref<HTMLDivElement>;
  /** The scrolled content (a List, a feed). */
  children: ReactNode;
  /** Text under the indicator, such as when the content was last updated. */
  title?: ReactNode;
}

/** Each stepping spoke's phase of the spin, in spoke order. */
const SPIN = [
  styles.spin0,
  styles.spin1,
  styles.spin2,
  styles.spin3,
  styles.spin4,
  styles.spin5,
  styles.spin6,
  styles.spin7,
];

/**
 * Pull to refresh, as UIRefreshControl: pulling the content down past the
 * top reveals the indicator; pulling past the trigger starts a refresh with
 * the finger still down; letting go settles the content onto the refreshing
 * inset until the refresh ends.
 *
 * Under a finger (a coarse primary pointer, on iOS and Android alike); on
 * the page it replaces the browser's own pull to refresh near the top. A
 * mouse or trackpad has no pull. Always give people
 * another way to refresh (a button that calls `onRefresh` and sets
 * `isRefreshing`), since a pull has no keyboard or assistive-technology
 * equivalent.
 *
 * @example
 * ```
 * <ScrollableArea label="Inbox" height="100%">
 *   <RefreshControl onRefresh={() => reload()} title="Updated just now">
 *     <List>…</List>
 *   </RefreshControl>
 * </ScrollableArea>
 * ```
 */
export function RefreshControl({
  children,
  title,
  onRefresh,
  isRefreshing,
  isDisabled,
  xstyle,
  className,
  style,
  ref,
  ...props
}: RefreshControlProps) {
  const control = useRefreshControl({onRefresh, isRefreshing, isDisabled});
  const rootRef = useMergedRefs(ref, control.contentRef);
  const center = GLYPH / 2;
  const width = refreshControl.spokeWidthPt;
  // One spoke's capsule drawn at its angle, in a layer of its own.
  const capsule = (index: number) => (
    <svg
      width={GLYPH}
      height={GLYPH}
      viewBox={`0 0 ${GLYPH} ${GLYPH}`}
      {...stylex.props(styles.spokeShape)}>
      <rect
        x={center - width / 2}
        y={center - refreshControl.spokeOuterRadiusPt}
        width={width}
        height={
          refreshControl.spokeOuterRadiusPt - refreshControl.spokeInnerRadiusPt
        }
        rx={refreshControl.spokeCornerRadiusPt}
        transform={`rotate(${(index * 360) / SPOKES} ${center} ${center})`}
      />
    </svg>
  );
  const revealed = [];
  const spinning = [];
  for (let index = 0; index < SPOKES; index++) {
    revealed.push(
      <span
        key={index}
        {...stylex.props(
          styles.spoke,
          styles.spokeOpacity(revealOpacity(index)),
        )}>
        {capsule(index)}
      </span>,
    );
    spinning.push(
      <span
        key={index}
        {...stylex.props(styles.spoke, SPIN[index], styles.spinTiming)}>
        {capsule(index)}
      </span>,
    );
  }
  return (
    <div
      ref={rootRef}
      aria-busy={control.isRefreshing || undefined}
      {...mergeProps(
        themeProps('refresh-control'),
        stylex.props(styles.root, xstyle),
        className,
        style,
      )}
      {...props}>
      {children}
      {/* After the content: a spinning indicator painted before the rows would
          have WebKit give every row after it a layer of its own. */}
      <div aria-hidden {...stylex.props(styles.indicatorClip)}>
        <div
          ref={control.indicatorRef}
          {...stylex.props(
            styles.indicator,
            styles.indicatorBand(REFRESH_HEIGHT),
            refreshIndicatorScope,
          )}>
          <span ref={control.spinnerRef} {...stylex.props(styles.glyph)}>
            <span
              ref={control.revealLayerRef}
              {...stylex.props(styles.spokeSet, styles.uniformSet)}>
              {revealed}
            </span>
            <span
              ref={control.spinLayerRef}
              {...stylex.props(styles.spokeSet, styles.gradientSet)}>
              {spinning}
            </span>
          </span>
          {title != null ? (
            <span ref={control.titleRef} {...stylex.props(styles.title)}>
              {title}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
