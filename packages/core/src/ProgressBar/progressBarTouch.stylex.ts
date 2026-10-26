// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file progressBarTouch.stylex.ts
 * @input StyleX constant definitions
 * @output progressBarTouchConsts (the touch presentation's whole-track
 *   duration and curve) for ProgressBar's StyleX transition
 * @position The CSS side of ProgressBar's touch timing: the values
 *   motion/uikit `progressBar.progressView` measures
 *
 * Constants, not theme variables: the progress table lists no motion role,
 * so its values are internal and no theme retunes them (`spec:AST-094` FR4,
 * DEC-11). They equal `progressBar.progressView.wholeTrackMs` and its linear
 * curve, which ProgressBar.test.tsx checks.
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
  /** That animation's curve: linear. */
  easing: 'linear',
});
