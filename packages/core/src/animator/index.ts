// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input animator/createAnimator.ts
 * @output The public animator (spec:AST-107 FR3, FR6): `createAnimator` and
 *   its types
 * @position Public entry point, re-exported from the package root
 */

export {
  createAnimator,
  type Animator,
  type AnimatorAnimateOptions,
  type AnimatorChannel,
  type AnimatorDecayVelocity,
  type AnimatorHandle,
  type AnimatorSnapshot,
  type AnimatorValues,
} from './createAnimator';
