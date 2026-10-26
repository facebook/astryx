// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file touch.ts
 * @input The gathered touch and gesture module (touch-support/touchModule),
 *   the pan recognizer, the gesture types, and the touch presentation queries
 * @output `@astryxdesign/core/internal/touch`: what Lab components build touch
 *   behavior from, named re-exports only
 * @position An internal entry reserved for Astryx's own packages:
 *   undocumented, outside the public API and its compatibility promise,
 *   versioned in lockstep with Core, and allowed by lint only in Core and Lab
 *   (architecture:react-component-runtime INV13). Core components import the
 *   same modules by relative path; a bundler keeps one copy per page either
 *   way, and a component bundles only what it imports.
 *
 * SYNC: When a touch module a Lab component uses lands in Core, re-export it
 * here and add it to scripts/core-internal-entries.test.mjs; when modified,
 * update scripts/touch-support-bundle.test.mjs.
 */

export {touchModule} from '../touch-support/touchModule';
export type {TouchModule} from '../touch-support/touchModule';
export {PanGestureRecognizer} from '../gestures/PanGestureRecognizer';
export type {
  PanDirection,
  PanGestureRecognizerOptions,
} from '../gestures/PanGestureRecognizer';
export {DEFAULT_ENVIRONMENT} from '../gestures/types';
export type {
  GestureEnvironment,
  GestureEventContext,
  GestureState,
  GestureTouch,
  NativeScrollProbe,
  Point,
  PointerKind,
  TouchBeganInput,
  TouchConsumer,
  TouchInput,
  TouchPhase,
  TouchSample,
} from '../gestures/types';
export {
  COMPACT_QUERY,
  COMPACT_TOUCH_QUERY,
  IOS_SUPPORTS_QUERY,
  IOS_TOUCH_STYLE_KEYS,
  readTouchPresentation,
  TOUCH_QUERY,
  useCompactDefinition,
  useTouchPresentation,
} from '../utils/touchPresentation';
export type {TouchPresentation} from '../utils/touchPresentation';
