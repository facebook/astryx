// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file DropdownMenuTouch.ts
 * @input menuSurfaceMotion.ts (UIMenu's grow and collapse on the animator),
 *   menuTouchPlacement.ts (the menu over its trigger on a compact touch
 *   screen), menuDrillInMotion.ts (UIMenu's in-place sub-menu), and the
 *   springs table's register function
 * @output DropdownMenu's touch layer: createMenuSurfaceMotion and its type,
 *   COVER_TRIGGER_STYLE, placeOverTrigger and createMenuDrillInMotion
 * @position The one module DropdownMenu imports touch-only code through, and
 *   its only import site is DropdownMenu.tsx. The mouse paths stay outside
 *   it, so a desktop build can swap it for a no-op (AST-080 FR8).
 *
 * The springs table registers here, before the first animation: nothing
 * registers on import.
 *
 * SYNC: When modified, keep every touch-only import of DropdownMenu.tsx here.
 */

import {registerSpringsTable} from '../motion/uikit/springs';
import {createMenuDrillInMotion as createDrillInMotion} from './menuDrillInMotion';
import {
  createMenuSurfaceMotion as createSurfaceMotion,
  type MenuSurfaceMotion,
} from './menuSurfaceMotion';

export type {MenuSurfaceMotion};

/**
 * UIMenu's grow and collapse for a menu surface. Registers the springs table
 * first, whose internal motion roles the motion reads (`springs.menuOpen`,
 * `springs.menuClose`, `spec:AST-094` FR4); registering again is a no-op.
 * The menu table's values are constants, read directly.
 */
export function createMenuSurfaceMotion(
  ...args: Parameters<typeof createSurfaceMotion>
): MenuSurfaceMotion {
  registerSpringsTable();
  return createSurfaceMotion(...args);
}

export {COVER_TRIGGER_STYLE, placeOverTrigger} from './menuTouchPlacement';
/**
 * The in-place sub-menu's motion (menuDrillInMotion.ts), with the springs
 * table registered first, whose internal motion roles it reads
 * (`springs.subMenuOpen`, `springs.subMenuBack`, `spec:AST-094` FR4); the
 * menu table's values are constants, read directly.
 */
export function createMenuDrillInMotion(
  ...args: Parameters<typeof createDrillInMotion>
): ReturnType<typeof createDrillInMotion> {
  registerSpringsTable();
  return createDrillInMotion(...args);
}
