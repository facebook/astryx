// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file DropdownMenuTouch.ts
 * @input menuSurfaceMotion.ts (UIMenu's grow and collapse on the animator),
 *   menuDrillInMotion.ts (UIMenu's in-place sub-menu), MenuActionSheetCard.tsx
 *   (iOS 26's alert-style action sheet), and the register functions of the
 *   menu springs and the sub-menu springs
 * @output DropdownMenu's touch layer: createMenuSurfaceMotion and its type,
 *   createMenuDrillInMotion, MenuActionSheetCard and isActionSheetCardEligible
 * @position The one module DropdownMenu imports touch-only code through, and
 *   its only import site is DropdownMenu.tsx. The mouse paths stay outside
 *   it, so a desktop build can swap it for a no-op (AST-080 FR8).
 *
 * UIKit's two menu springs register here as their roles before the grow's
 * first animation, and its two sub-menu springs before the in-place
 * sub-menu's; the action-sheet card plays the alert's two springs through
 * useAlertMotion. Nothing registers on import, and no other spring ships with
 * it.
 *
 * SYNC: When modified, keep every touch-only import of DropdownMenu.tsx here.
 */

import {
  registerMenuSprings,
  registerSubMenuSprings,
} from '../motion/uikit/springs';
import {createMenuDrillInMotion as createDrillInMotion} from './menuDrillInMotion';
import {
  createMenuSurfaceMotion as createSurfaceMotion,
  type MenuSurfaceMotion,
} from './menuSurfaceMotion';

export type {MenuSurfaceMotion};

/**
 * UIMenu's grow and collapse for a menu surface. Registers UIKit's two menu
 * springs first, the internal motion roles the motion reads
 * (`springs.menuOpen`, `springs.menuClose`, `spec:AST-094` FR4);
 * registering again is a no-op. The menu table's values are constants, read
 * directly.
 */
export function createMenuSurfaceMotion(
  ...args: Parameters<typeof createSurfaceMotion>
): MenuSurfaceMotion {
  registerMenuSprings();
  return createSurfaceMotion(...args);
}

/**
 * The in-place sub-menu's motion (menuDrillInMotion.ts). Registers UIKit's
 * two sub-menu springs first, the internal motion roles it reads
 * (`springs.subMenuOpen`, `springs.subMenuBack`, `spec:AST-094` FR4);
 * registering again is a no-op. The menu table's values are constants, read
 * directly.
 */
export function createMenuDrillInMotion(
  ...args: Parameters<typeof createDrillInMotion>
): ReturnType<typeof createDrillInMotion> {
  registerSubMenuSprings();
  return createDrillInMotion(...args);
}
export {
  MenuActionSheetCard,
  isActionSheetCardEligible,
} from './MenuActionSheetCard';
