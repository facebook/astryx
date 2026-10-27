// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file touch.ts
 * @input The gesture core: the arena, the recognizers and their geometry,
 *   the pan recognizer, the gesture types, the touch presentation queries,
 *   the coarse-pointer query, and the element-direction read
 * @output `@astryxdesign/core/internal/touch`: the gesture core's primitives
 *   and the touch queries for Lab components, re-exported by name
 * @position An internal entry reserved for Astryx's own packages:
 *   undocumented, outside the public API and its compatibility promise
 *   (spec:AST-017 FR21), versioned in lockstep with Core, and allowed only in
 *   Core and Lab by the `@astryx/no-core-internal-import` lint rule
 *   (architecture:react-component-runtime INV13). Core components import the
 *   same modules by relative path. Named re-exports only, never a gathering
 *   object: a bundler keeps one copy per page and only what a component uses
 *   (architecture:component-style-authoring INV6). Importing it attaches no
 *   listeners: a recognizer listens only once a component starts it under a
 *   coarse pointer (`spec:AST-094` FR19, FR24).
 *
 * SYNC: When modified, update scripts/touch-support-bundle.test.mjs,
 * scripts/core-internal-entries.test.mjs and touch.test.ts.
 */

export {browserClock, GestureArena} from '../gestures/GestureArena';
export {
  ALL_NATIVE_TOUCH,
  GestureRecognizer,
  isActive,
  isTerminal,
  isTransitionAllowed,
  MANIPULATION,
} from '../gestures/GestureRecognizer';
export {
  angleBetween,
  centroid,
  distance,
  travel,
  unwrapAngle,
} from '../gestures/geometry';
export {LongPressGestureRecognizer} from '../gestures/LongPressGestureRecognizer';
export {TapGestureRecognizer} from '../gestures/TapGestureRecognizer';
export {DEFAULT_ENVIRONMENT} from '../gestures/types';
export {PanGestureRecognizer} from '../gestures/PanGestureRecognizer';
export type {
  PanDirection,
  PanGestureRecognizerOptions,
} from '../gestures/PanGestureRecognizer';
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
export {isRtlElement} from '../hooks/isRtlElement';
export {COARSE_POINTER_QUERY} from '../utils/coarsePointer';
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
