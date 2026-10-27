// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file motion.ts
 * @input The animator and its React hook, the bezier and spring math, the
 *   rubber band, the UIKit tuning tables (motion/), and the scroll edge
 *   effect (hooks/useScrollEdgeEffect)
 * @output `@astryxdesign/core/internal/motion`: the motion Lab components
 *   build on, named re-exports only
 * @position An internal entry reserved for Astryx's own packages:
 *   undocumented, outside the public API and its compatibility promise,
 *   versioned in lockstep with Core, and allowed by lint only in Core and Lab
 *   (architecture:react-component-runtime INV13). Named re-exports keep a
 *   tuning table's rows to the components that read them
 *   (architecture:component-style-authoring INV6).
 *
 * SYNC: When a motion module a Lab component uses lands in Core, re-export it
 * here and add it to scripts/core-internal-entries.test.mjs; when modified,
 * update scripts/touch-support-bundle.test.mjs.
 */

export {
  createAnimator,
  END_HOLD_MS,
  SETTLE_THRESHOLD,
} from '../motion/animator';
export type {
  AnimateOptions,
  Animator,
  AnimatorOptions,
  MotionCurve,
  MotionHandle,
  MotionProperty,
  MotionValues,
  SpringTransition,
} from '../motion/animator';
export {useAnimator} from '../motion/useAnimator';
export type {UseAnimatorResult} from '../motion/useAnimator';
export {cubicBezier} from '../motion/bezier';
export type {BezierPoints} from '../motion/bezier';
export {resolveMotion} from '../motion/resolveMotion';
export {
  absoluteVelocity,
  dampingRatioOf,
  durationBounceOf,
  naturalFrequency,
  relativeVelocity,
  responseDampingOf,
  responseOf,
  SETTLING_EPSILON,
  settlingDuration,
  solveSpring,
  solveSpringTowardRamp,
  springFromDurationBounce,
  springFromPhysics,
  springFromResponse,
  springFromUIKitDampingDuration,
  toSpring,
} from '../motion/spring';
export type {
  DurationBounce,
  ResponseDamping,
  Spring,
  SpringCurve,
  SpringDescription,
  SpringRampCurve,
} from '../motion/spring';
export {
  rubberBand,
  rubberBandClamp,
  rubberBandInverse,
  rubberBandSlope,
  rubberBandUnclamp,
} from '../motion/rubberBand';
export {
  ACTION_SHEET_DISMISS_SPRING,
  ACTION_SHEET_PRESENT_SPRING,
  ALERT_DISMISS_SPRING,
  ALERT_PRESENT_SPRING,
  BANNER_SPRING,
  bars,
  CONTEXT_MENU_DISMISS_SPRING,
  CONTEXT_MENU_LIFT_SPRING,
  DIRECT_CHANGE_SPRING,
  EMPHASIS_SPRING,
  FINGER_TRACKING_SPRING,
  HAPTIC_FEEDBACK_KINDS,
  HAPTIC_VIBRATION_PATTERNS,
  KEYBOARD_SPRING,
  list,
  MENU_CLOSE_SPRING,
  MENU_OPEN_SPRING,
  MENU_REDUCED_MOTION_SPRING,
  navigation,
  NAVIGATION_BAR_ELEMENTS_SPRING,
  NAVIGATION_INTERACTIVE_POP_FINISH_SPRING,
  NAVIGATION_POP_SPRING,
  NAVIGATION_PUSH_SPRING,
  QUICK_CHANGE_SPRING,
  registerBarsTable,
  registerNavigationTable,
  registerScrollTable,
  registerSpringsTable,
  registerTimingTable,
  scroll,
  search,
  SEGMENTED_THUMB_SPRING,
  SETTLE_SPRING,
  SHEET_DETENT_SPRING,
  SHEET_DISMISS_SPRING,
  SHEET_DISMISS_SWIPE_SPRING,
  SHEET_PRESENT_SPRING,
  SHEET_RELEASE_FAST_SPRING,
  springs,
  STATE_CHANGE_SPRING,
  SUB_MENU_BACK_SPRING,
  SUB_MENU_OPEN_SPRING,
  SWITCH_THUMB_MOVE_SPRING,
  SWITCH_THUMB_STRETCH_SPRING,
  TIMED_CHANGE_SPRING,
  timing,
  UIKIT_CLICK,
  UIKIT_CONTROL,
  UIKIT_GESTURES,
  UIKIT_LONG_PRESS,
  UIKIT_PAN,
  UIKIT_PINCH,
  UIKIT_PRESS,
  UIKIT_ROTATION,
  UIKIT_SCREEN_EDGE_PAN,
  UIKIT_SWIPE,
  UIKIT_TAP,
  UIKIT_VELOCITY,
  VIEW_CHANGE_SPRING,
} from '../motion/uikit';
export type {
  GestureConstant,
  GestureConstantUnit,
  HapticFeedbackKind,
} from '../motion/uikit';
export {useScrollEdgeEffect} from '../hooks/useScrollEdgeEffect';
export type {
  UseScrollEdgeEffectOptions,
  UseScrollEdgeEffectResult,
} from '../hooks/useScrollEdgeEffect';
