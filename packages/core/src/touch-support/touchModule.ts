// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file touchModule.ts
 * @input The gesture core (the arena, the recognizers, velocity tracking and
 *   their geometry), the motion math (springs, decay, projection, rubber
 *   banding), the motion roles, and the shared UIKit tables
 * @output touchModule, the global touch and gesture module's primitives, and
 *   its type TouchModule
 * @position Internal to touch-support. `TouchSupport.install()` registers it,
 *   and components reach it only through useTouchSupport or useTouchLayer
 *   (architecture:react-component-runtime INV13).
 *
 * The one place the module's primitives are gathered. Only the
 * `@astryxdesign/core/touch-support` entry imports this file, so a bundle
 * that never installs TouchSupport carries none of it. Every member is a plain
 * value, never a hook: a component reads the module after it renders (null
 * first, the module once installed), so a hook on it would change the
 * component's hook count. The animator joins the gesture core here.
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
import * as uikit from '../motion/uikit';
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

/** The global touch and gesture module, as `TouchSupport.install()` registers it. */
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
  // The shared UIKit tables: the gesture groups, the spring rows, timing,
  // scroll and navigation.
  ...uikit,
});

export type TouchModule = typeof touchModule;
