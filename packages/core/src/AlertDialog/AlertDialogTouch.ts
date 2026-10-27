// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file AlertDialogTouch.ts
 * @input useAlertMotion
 * @output useAlertDialogTouch: what AlertDialog does only under a finger or a
 *   pen
 * @position AlertDialog's touch layer, imported once, by AlertDialog.tsx
 *
 * Under a touch presentation (a coarse primary pointer, after hydration;
 * where it is fine nothing attaches: `spec:AST-094` FR13, FR19), the alert
 * appears and leaves the way UIKit's alert does (useAlertMotion), and a touch
 * during either transition reaches nothing. The action-group tracking is not
 * here: it serves every pointer (`family:action-groups`), so AlertDialog runs
 * it itself. A mouse, the keyboard and assistive technology keep the theme's
 * motion, so a build for pointers alone can replace this module with one that
 * does nothing.
 *
 * SYNC: When modified, update AlertDialog.tsx and AlertDialog.test.tsx
 */

import {useAlertMotion, type AlertMotion} from './useAlertMotion';

export interface AlertDialogTouchOptions {
  /** The caller's open state. */
  isOpen: boolean;
  /** The inline preview: nothing moves. */
  isInline: boolean;
  /**
   * The touch presentation (a coarse primary pointer, after hydration):
   * UIKit's motion; without it nothing attaches (`spec:AST-094` FR13, FR19).
   */
  isTouch: boolean;
}

export interface AlertDialogTouch {
  /** The alert's presentation under a finger (useAlertMotion). */
  motion: AlertMotion;
}

/** AlertDialog's touch layer: the motion. */
export function useAlertDialogTouch({
  isOpen,
  isInline,
  isTouch,
}: AlertDialogTouchOptions): AlertDialogTouch {
  const motion = useAlertMotion({isOpen, isEnabled: isTouch && !isInline});
  return {motion};
}
