// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file PopoverTouch.ts
 * @input usePopoverSurfaceMotion.ts (UIKit's present and dismiss on the
 *   animator)
 * @output Popover's touch layer: usePopoverSurfaceMotion
 * @position The one module Popover imports touch-only code through, and its
 *   only import site is Popover.tsx. The mouse paths stay outside it.
 *
 * Touch-only code a pointer page carries (architecture:component-style-authoring
 * INV6): components use the global touch module once it is installed
 * (`TouchSupport.install()`, proposed in #8464), so per-component lazy swaps
 * are paused, and this module's cost is carried in every Popover import
 * until the touch module lands.
 *
 * SYNC: When modified, keep every touch-only import of Popover.tsx here.
 */

export {usePopoverSurfaceMotion} from './usePopoverSurfaceMotion';
