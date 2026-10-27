// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file resolveMotion.ts
 * @input A motion role: a spring or curve of a registered motion table, or a
 *   table group and the key of one of its values; the element the motion
 *   plays on, for its theme's motion knobs (themeKnobs.ts)
 * @output resolveMotion: the role's value at the theme's knobs
 * @position Motion foundation; the animator resolves every spring and curve
 *   it is handed with it, and components resolve the durations they time
 *   with it
 *
 * Every touch motion passes through here, so the role a value plays is named
 * in one place. A role plays its table value, moved by the knobs of the theme
 * the element is in (`spec:AST-108` FR3): `tempo` scales a spring's duration
 * and a role's duration, and `character` moves a spring's bounce by its
 * role's weight (1 for entrances and presentations, 0.5 for state changes, 0
 * for exits, which never overshoot). The theme's `MotionScaleConfig` alone
 * leaves the springs at tempo 1 (FR5). Finger-following motion never follows
 * the knobs (FR4), and a curve plays as measured: the theme's character
 * reaches CSS curves through its easing tokens. With Astryx's own knobs every
 * role plays exactly its table value. The per-role values stay internal
 * (`spec:AST-094` DEC-11, `spec:AST-108` DEC-1): no CSS variable retunes a
 * role. Nothing here reads style or layout (the theme is found by DOM
 * attribute), listens or observes, imports a table, or runs on import or on
 * the server.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/motion/resolveMotion.test.ts
 * - /packages/core/src/motion/animator.ts (resolves each role it plays)
 */

import {motionRoleIn, motionRoleOf} from './roles';
import {isSpring} from './roleValue';
import type {MotionCurvePoints} from './roles';
import {
  durationBounceOf,
  toSpring,
  type DurationBounce,
  type SpringDescription,
} from './spring';
import {themeMotionKnobs} from './themeKnobs';

/**
 * How far `character` moves the bounce of a role of weight 1: down for
 * `'crisp'`, up for `'expressive'`, between SwiftUI's `.smooth` and
 * `.bouncy` presets.
 */
export const CHARACTER_BOUNCE_STEP = 0.1;

/** Roles that never follow the knobs: finger-following motion (FR4). */
const FIXED_ROLES = new Set(['springs.fingerTracking']);

/**
 * Each role's weight for `character`: 1 for entrances and presentations,
 * 0.5 for state changes, 0 for exits and full-screen moves. A role not named
 * here takes its weight from its name, and otherwise 0.5.
 */
const ROLE_WEIGHTS: Readonly<Record<string, number>> = {
  'springs.emphasis': 1,
  'springs.menuOpen': 1,
  'springs.subMenuOpen': 1,
  'springs.settle': 0.5,
  'springs.quickChange': 0.5,
  'springs.viewChange': 0.5,
  'springs.timedChange': 0.5,
  'springs.stateChange': 0.5,
  'springs.directChange': 0.5,
  'springs.menuClose': 0,
  'springs.subMenuBack': 0,
};

/** A role's weight for `character`. */
export function motionRoleWeight(id: string): number {
  const named = ROLE_WEIGHTS[id];
  if (named != null) {
    return named;
  }
  const name = id.slice(id.lastIndexOf('.') + 1);
  if (/(Dismiss|Close|Back|Pop|Exit|exit)/.test(name)) {
    return 0;
  }
  if (/(Present|Open|Lift|Enter|entrance)/.test(name)) {
    return 1;
  }
  return 0.5;
}

/** A spring at a tempo and bounce shift, the same object for the same pair. */
const derivedSprings = new WeakMap<object, Map<string, DurationBounce>>();

function springAt(
  spring: SpringDescription,
  tempo: number,
  bounceShift: number,
): DurationBounce {
  const key = `${tempo}:${bounceShift}`;
  let byKnobs = derivedSprings.get(spring);
  if (byKnobs == null) {
    byKnobs = new Map();
    derivedSprings.set(spring, byKnobs);
  }
  let derived = byKnobs.get(key);
  if (derived == null) {
    const {duration, bounce} = durationBounceOf(toSpring(spring));
    derived = {
      duration: duration * tempo,
      bounce: Math.min(0.9, Math.max(-0.9, bounce + bounceShift)),
    };
    byKnobs.set(key, derived);
  }
  return derived;
}

/**
 * A motion role's value at the knobs of the theme `element` is in. Hand it a
 * spring or curve of a motion table, or a table group and a key (the way to
 * name a duration, which is a bare number):
 *
 * @example
 * ```
 * const spring = resolveMotion(sheet, springs.settle);
 * const fadeMs = resolveMotion(row, timing, 'stateChangeMs');
 * ```
 *
 * Anything that is not a role comes back unchanged, so a spring written
 * inline at a call site keeps working.
 */
export function resolveMotion<T extends SpringDescription>(
  element: Element | null | undefined,
  spring: T,
): T | SpringDescription;
export function resolveMotion(
  element: Element | null | undefined,
  curve: MotionCurvePoints,
): MotionCurvePoints;
export function resolveMotion<G extends object, K extends keyof G & string>(
  element: Element | null | undefined,
  group: G,
  key: K,
): G[K] extends number
  ? number
  : G[K] extends MotionCurvePoints
    ? MotionCurvePoints
    : G[K] | SpringDescription;
export function resolveMotion(
  element: Element | null | undefined,
  leafOrGroup: object,
  key?: string,
): unknown {
  const value =
    key === undefined
      ? leafOrGroup
      : (leafOrGroup as Record<string, unknown>)[key];
  const role =
    key === undefined
      ? motionRoleOf(leafOrGroup)
      : motionRoleIn(leafOrGroup, key);
  if (role == null || FIXED_ROLES.has(role.id)) {
    return value;
  }
  const knobs = themeMotionKnobs(element);
  // A MotionScaleConfig alone implies no tempo for the springs (FR5).
  const tempo = knobs.tempoIsSet ? knobs.tempo : 1;
  const direction =
    knobs.character === 'crisp' ? -1 : knobs.character === 'expressive' ? 1 : 0;
  if (typeof value === 'number') {
    return tempo === 1 ? value : value * tempo;
  }
  if (isSpring(value)) {
    const bounceShift =
      direction * CHARACTER_BOUNCE_STEP * motionRoleWeight(role.id);
    return tempo === 1 && bounceShift === 0
      ? value
      : springAt(value, tempo, bounceShift);
  }
  return value;
}
