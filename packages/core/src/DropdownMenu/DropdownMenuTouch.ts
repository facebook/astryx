// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file DropdownMenuTouch.ts
 * @input menuSurfaceMotion.ts (UIMenu's grow and collapse on the animator),
 *   the menu and springs tables' register functions
 * @output DropdownMenu's touch layer: createMenuSurfaceMotion and its type
 * @position The one module DropdownMenu imports touch-only code through, and
 *   its only import site is DropdownMenu.tsx. The mouse paths stay outside
 *   it, so a desktop build can swap it for a no-op (AST-080 FR8).
 *
 * The motion tables register here, before the first animation: nothing
 * registers on import.
 *
 * SYNC: When modified, keep every touch-only import of DropdownMenu.tsx here.
 */

import {registerMenuTable} from '../motion/uikit/menu';
import {registerSpringsTable} from '../motion/uikit/springs';
import {
  createMenuSurfaceMotion as createSurfaceMotion,
  type MenuSurfaceMotion,
} from './menuSurfaceMotion';

export type {MenuSurfaceMotion};

/**
 * UIMenu's grow and collapse for a menu surface. Registers the tables it
 * animates with (the springs and the menu's) with the theme first;
 * registering again is a no-op.
 */
export function createMenuSurfaceMotion(
  ...args: Parameters<typeof createSurfaceMotion>
): MenuSurfaceMotion {
  registerSpringsTable();
  registerMenuTable();
  return createSurfaceMotion(...args);
}
