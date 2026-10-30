// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file AlertDialogTouch.ts
 * @input useAlertMotion and useAlertActionLayout
 * @output useAlertDialogTouch: what AlertDialog does only under a finger or a
 *   pen
 * @position AlertDialog's touch layer, imported once, by AlertDialog.tsx
 *
 * Under a touch presentation (a coarse primary pointer, after hydration;
 * where it is fine nothing attaches: `spec:AST-094` FR13, FR19), the alert
 * appears and leaves the way UIKit's alert does (useAlertMotion), and a touch
 * during either transition reaches nothing. On a compact screen its two
 * actions share a row, Cancel leading, when each label fits its half
 * (useAlertActionLayout), as UIKit lays them out. The action-group tracking
 * is not here: it serves every pointer (`family:action-groups`), so
 * AlertDialog runs it itself. A mouse, the keyboard and assistive technology
 * keep the theme's motion and layout, so a build for pointers alone can
 * replace this module with one that does nothing.
 *
 * SYNC: When modified, update AlertDialog.tsx and AlertDialog.test.tsx
 */

import type {RefObject} from 'react';
import {
  useAlertActionLayout,
  type AlertActionLayout,
} from './useAlertActionLayout';
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
  /** Both a coarse pointer and a compact viewport: UIKit's action layout. */
  isCompactTouch: boolean;
  /** Selects the actions the layout measures. */
  itemSelector: string;
  /** The element that holds the actions in a row or a stack. */
  actionRowRef: RefObject<HTMLElement | null>;
  /** The actions' labels; a change re-measures the layout. */
  labels: ReadonlyArray<string>;
}

export interface AlertDialogTouch {
  /** The alert's presentation under a finger (useAlertMotion). */
  motion: AlertMotion;
  /** UIKit's layout of the actions under a finger on a compact screen. */
  actionLayout: AlertActionLayout;
}

/** AlertDialog's touch layer: the motion and UIKit's action layout. */
export function useAlertDialogTouch({
  isOpen,
  isInline,
  isTouch,
  isCompactTouch,
  itemSelector,
  actionRowRef,
  labels,
}: AlertDialogTouchOptions): AlertDialogTouch {
  const motion = useAlertMotion({isOpen, isEnabled: isTouch && !isInline});
  const actionLayout = useAlertActionLayout(actionRowRef, {
    isCompact: isCompactTouch,
    itemSelector,
    labels,
  });
  return {motion, actionLayout};
}
