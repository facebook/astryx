// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file circleCheck.stylex.ts
 * @input Uses StyleX and the theme's duration and easing tokens
 * @output Exports `circleCheckConsts` (the build-time mirror of the UIKit
 *   constants table's `selection.mark.changeMs` and
 *   `selection.multiselectCircle`, read at test time from
 *   `@astryxdesign/core/motion/experimental`) and the styles that read it:
 *   `circleCheckMotionStyles` (the mark's colour transition) and
 *   `circleCheckSizeStyles` (the circle, its stroke, its checkmark and its
 *   bar at each size)
 * @position Internal to CircleCheckIndicator, which composes these styles
 *
 * StyleX evaluates a style at build time and cannot read the constants
 * table, so the values are mirrored here as constants, and
 * circleCheck.test.tsx fails if they drift. The styles that read them live
 * beside them on purpose: StyleX inlines a `defineConsts` value it reads in
 * the same file.
 *
 * Sizes: `md` is UIKit's circle at the Large (default) text size, `sm` at
 * xSmall. Two values are derived rather than measured at xSmall, each from
 * its Large proportion (the test holds the derivation): the checkmark's
 * stroke and its offset below centre. The partial state's bar has no UIKit
 * counterpart (the multiselect circle has no partial state); it takes the
 * checkmark's width and stroke.
 *
 * SYNC: When modified, update circleCheck.test.tsx.
 */

import * as stylex from '@stylexjs/stylex';
import {durationVars, easeVars} from '@astryxdesign/core/theme/tokens.stylex';

export const circleCheckConsts = stylex.defineConsts({
  /**
   * `selection.mark.changeMs`: how long a selection mark takes to change
   * under a finger. UIKit changes every measured selection mark in one
   * frame, the collection list's multiselect circle included.
   */
  markChangeMs: '0ms',
  /** `multiselectCircle.large.diameter`. */
  mdDiameter: '21.8px',
  /** `multiselectCircle.large.stroke`. */
  mdStroke: '1.54px',
  /** `multiselectCircle.large.checkSize`. */
  mdCheckSize: '9px',
  /** `multiselectCircle.large.checkStroke`. */
  mdCheckStroke: '1.35px',
  /** `multiselectCircle.large.checkOffsetY`. */
  mdCheckOffsetY: '1px',
  /** `multiselectCircle.xSmall.diameter`. */
  smDiameter: '18px',
  /** `multiselectCircle.xSmall.stroke`. */
  smStroke: '1.27px',
  /** `multiselectCircle.xSmall.checkSize`. */
  smCheckSize: '8px',
  /** Derived: the Large check stroke, scaled by the check size (9 → 8). */
  smCheckStroke: '1.2px',
  /** Derived: the Large offset, scaled by the diameter (21.8 → 18). */
  smCheckOffsetY: '0.83px',
});

export const circleCheckMotionStyles = stylex.create({
  mark: {
    transitionProperty: 'background-color, box-shadow',
    transitionDuration: {
      default: durationVars['--duration-fast'],
      // Under a finger the mark changes in the frame the selection lands, as
      // iOS's selection marks do; a mouse keeps the theme's duration.
      '@media (pointer: coarse)': circleCheckConsts.markChangeMs,
      '@media (prefers-reduced-motion: reduce)': '0s',
    },
    transitionTimingFunction: easeVars['--ease-standard'],
  },
});

export const circleCheckSizeStyles = stylex.create({
  // The ring is an inset shadow of the stroke's width rather than a border:
  // engines draw a border in whole device pixels (1.54 px becomes 1.33 px at
  // 3×), a shadow at its exact width, antialiased like UIKit's symbol.
  mdCircle: {
    width: circleCheckConsts.mdDiameter,
    height: circleCheckConsts.mdDiameter,
    '--_circle-stroke': circleCheckConsts.mdStroke,
  },
  smCircle: {
    width: circleCheckConsts.smDiameter,
    height: circleCheckConsts.smDiameter,
    '--_circle-stroke': circleCheckConsts.smStroke,
  },
  mdCheck: {
    width: circleCheckConsts.mdCheckSize,
    height: circleCheckConsts.mdCheckSize,
    translate: `0 ${circleCheckConsts.mdCheckOffsetY}`,
  },
  smCheck: {
    width: circleCheckConsts.smCheckSize,
    height: circleCheckConsts.smCheckSize,
    translate: `0 ${circleCheckConsts.smCheckOffsetY}`,
  },
  mdBar: {
    width: circleCheckConsts.mdCheckSize,
    height: circleCheckConsts.mdCheckStroke,
  },
  smBar: {
    width: circleCheckConsts.smCheckSize,
    height: circleCheckConsts.smCheckStroke,
  },
});
