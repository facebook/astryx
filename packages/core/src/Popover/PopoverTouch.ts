// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file PopoverTouch.ts
 * @input usePopoverSurfaceMotion.ts (UIKit's present and dismiss on the
 *   animator)
 * @output Popover's touch layer: usePopoverSurfaceMotion
 * @position The one module Popover imports touch-only code through, and its
 *   only import site is Popover.tsx. The mouse paths stay outside it, so a
 *   desktop build can swap it for a no-op (AST-080 FR8).
 *
 * SYNC: When modified, keep every touch-only import of Popover.tsx here.
 */

export {usePopoverSurfaceMotion} from './usePopoverSurfaceMotion';
