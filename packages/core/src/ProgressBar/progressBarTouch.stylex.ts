// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file progressBarTouch.stylex.ts
 * @input StyleX constant definitions
 * @output progressBarTouchConsts (the touch presentation's whole-track
 *   duration, the indeterminate sweep and Reduce Motion pulse, and their
 *   curve) for ProgressBar's StyleX transition and animation
 * @position The CSS side of ProgressBar's touch timing: the values
 *   motion/uikit `progressBar.progressView` and
 *   `progressBar.indeterminateWebProgress` measure
 *
 * Constants, not theme variables: the progress table lists no motion role,
 * so its values are internal and no theme retunes them (`spec:AST-094` FR4,
 * DEC-11). They equal `progressBar.progressView.wholeTrackMs`,
 * `indeterminateWebProgress.sweepMs` and `.reducedMotionPulseMs`, and their
 * linear curve, which ProgressBar.test.tsx checks.
 *
 * SYNC: When modified, update /packages/core/src/motion/uikit/progressBar.ts
 * and /packages/core/src/ProgressBar/ProgressBar.test.tsx.
 */

import * as stylex from '@stylexjs/stylex';

export const progressBarTouchConsts = stylex.defineConsts({
  /**
   * UIProgressView's setProgress(_:animated: true) duration for a change of
   * the whole track; a smaller change takes its share of it.
   */
  wholeTrack: '1000ms',
  /** iOS Safari's indeterminate segment: one sweep of the track. */
  sweep: '1000ms',
  /** Under Reduce Motion, each direction of Safari's pulse instead. */
  reducedMotionPulse: '1000ms',
  /** The curve of all three: linear. */
  easing: 'linear',
});
