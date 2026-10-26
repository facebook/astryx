// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file touchModule.ts
 * @input The gesture core (the arena, the recognizers, velocity tracking and
 *   their geometry), the motion math (springs, decay, projection, rubber
 *   banding) and the motion roles; no UIKit table, since a component imports
 *   only the rows it uses (architecture:component-style-authoring INV6)
 * @output touchModule, the touch and gesture module's primitives, and its type
 *   TouchModule
 * @position Internal. Core components import it directly (or through
 *   useTouchLayer), and Lab components through
 *   `@astryxdesign/core/internal/touch`; a bundler keeps one copy per page
 *   (architecture:react-component-runtime INV13).
 *
 * The one place the module's primitives are gathered. Importing it attaches
 * no listeners: a recognizer listens only once a component starts it under a
<<<<<<< 48c89c7ee05c7abc274c4518d702279de578b3aa
 * coarse pointer (`spec:AST-094` FR19, FR24). Every member is a plain value,
 * never a hook.
=======
 * coarse pointer (`spec:AST-094` FR19, FR24).
>>>>>>> ee91c19ef8758ee5d3024c0ec2985f22e0bece68
 *
 * SYNC: When modified, update scripts/touch-support-bundle.test.mjs.
 */

import * as decay from '../motion/decay';
import * as projection from '../motion/projection';
import {
  formatMotionRoleValue,
  isMotionRoleId,
  listMotionRoles,
  motionRole,
  motionRoleIn,
  motionRoleOf,
  motionRoleVariable,
  parseMotionRoleValue,
  registerMotionTable,
} from '../motion/roles';
import * as rubberBand from '../motion/rubberBand';
import * as spring from '../motion/spring';
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
import {PanGestureRecognizer} from '../gestures/PanGestureRecognizer';
import {TapGestureRecognizer} from '../gestures/TapGestureRecognizer';
import {DEFAULT_ENVIRONMENT} from '../gestures/types';
import {VelocityTracker} from '../gestures/VelocityTracker';

/** The module's primitives, as components import them. */
export const touchModule = Object.freeze({
  // The gesture core.
  GestureArena,
  GestureRecognizer,
  TapGestureRecognizer,
  LongPressGestureRecognizer,
  PanGestureRecognizer,
  VelocityTracker,
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
  // The motion math: springs, decay, projection and rubber banding.
  ...spring,
  ...decay,
  ...projection,
  ...rubberBand,
  // The motion roles (spec:AST-094 FR4), read when a motion starts.
  registerMotionTable,
  motionRole,
  motionRoleOf,
  motionRoleIn,
  listMotionRoles,
  motionRoleVariable,
  isMotionRoleId,
  formatMotionRoleValue,
  parseMotionRoleValue,
});

export type TouchModule = typeof touchModule;
