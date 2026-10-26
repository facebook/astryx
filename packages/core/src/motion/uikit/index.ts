// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input The domain files of the UIKit constants table
 * @output Re-exports `springs`, `scroll`, `timing`, the gesture thresholds
 *   (`UIKIT_GESTURES` and the haptic tables) and the component domains
 *   (`navigation`, `switchControl`, the button's and the list cells' values:
 *   `button`, `list`)
 * @position Entry of the UIKit constants table (motion/uikit). Internal to
 *   core: not exported from the package entry point
 *
 * THE table (`spec:AST-094` FR1, FR2): every spring, duration, deceleration rate, rubber-band
 * constant, timing curve and gesture threshold a touch presentation uses
 * comes from here, with its source next to it. Components never carry their
 * own numbers.
 *
 * SYNC: When a domain file is added, re-export it here and list it in
 * /packages/core/src/motion/README.md.
 */

export {
  HAPTIC_FEEDBACK_KINDS,
  HAPTIC_VIBRATION_PATTERNS,
  UIKIT_GESTURES,
  type GestureConstant,
  type GestureConstantUnit,
  type HapticFeedbackKind,
} from './gestures';
export {button} from './button';
export {list, registerListTable} from './list';
export {navigation, registerNavigationTable} from './navigation';
export {registerScrollTable, scroll} from './scroll';
export {registerSpringsTable, springs} from './springs';
export {registerSwitchTable, switchControl} from './switch';
export {registerTimingTable, timing} from './timing';
