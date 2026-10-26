// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file touchModule.ts
 * @input The gesture core: the arena, the recognizers, and their geometry
 * @output touchModule, the touch and gesture module's primitives, and its type
 *   TouchModule
 * @position Internal. Core components import it directly, and Lab components
 *   through `@astryxdesign/core/internal/touch`; a bundler keeps one copy per
 *   page (architecture:react-component-runtime INV13).
 *
 * The one place the module's primitives are gathered. Importing it attaches
 * no listeners: a recognizer listens only once a component starts it under a
 * coarse pointer (`spec:AST-094` FR19, FR24). The animator joins the gesture
 * core here.
 *
 * SYNC: When modified, update scripts/touch-support-bundle.test.mjs.
 */

import {browserClock, GestureArena} from '../gestures/GestureArena';
import {
  ALL_NATIVE_TOUCH,
  GestureRecognizer,
  isActive,
  isTerminal,
  isTransitionAllowed,
  MANIPULATION,
} from '../gestures/GestureRecognizer';
import {
  angleBetween,
  centroid,
  distance,
  travel,
  unwrapAngle,
} from '../gestures/geometry';
import {LongPressGestureRecognizer} from '../gestures/LongPressGestureRecognizer';
import {TapGestureRecognizer} from '../gestures/TapGestureRecognizer';
import {DEFAULT_ENVIRONMENT} from '../gestures/types';

/** The module's primitives, as components import them. */
export const touchModule = Object.freeze({
  GestureArena,
  GestureRecognizer,
  TapGestureRecognizer,
  LongPressGestureRecognizer,
  browserClock,
  DEFAULT_ENVIRONMENT,
  ALL_NATIVE_TOUCH,
  MANIPULATION,
  isActive,
  isTerminal,
  isTransitionAllowed,
  angleBetween,
  centroid,
  distance,
  travel,
  unwrapAngle,
});

export type TouchModule = typeof touchModule;
