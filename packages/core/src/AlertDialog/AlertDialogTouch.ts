// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file AlertDialogTouch.ts
 * @input useActionGroupTracking, useAlertMotion and the alert entries of the
 *   UIKit constants table (motion/uikit/alert.ts)
 * @output useAlertDialogTouch: everything AlertDialog does only under a
 *   finger or a pen
 * @position AlertDialog's touch layer, imported once, by AlertDialog.tsx
 *
 * Under a touch presentation (a coarse primary pointer, after hydration;
 * where it is fine nothing attaches: `spec:AST-094` FR13, FR19), a finger or
 * a pen tracks the two actions as one group, the way
 * UIKit tracks an alert's actions: the touched action highlights in the
 * touch-down frame, the highlight follows the finger from one action to the
 * other, and the lift runs the action under it (none off both). A touch that
 * lands on the message can slide onto an action; the backdrop, where a touch
 * targets the dialog itself, is not part of the group. Under a finger the
 * alert also appears and leaves the way UIKit's alert does (useAlertMotion),
 * and a touch during either transition reaches nothing. A mouse, the
 * keyboard and assistive technology keep each button's own click and the
 * theme's motion, so a build for pointers alone can replace this module
 * with one that does nothing.
 *
 * SYNC: When modified, update AlertDialog.tsx and AlertDialog.test.tsx
 */

import type {RefObject} from 'react';
import {useActionGroupTracking} from '../hooks/useActionGroupTracking';
import {useIsScrollable} from '../hooks/useIsScrollable';
import {alertController} from '../motion/uikit/alert';
import {useAlertMotion, type AlertMotion} from './useAlertMotion';

export interface AlertDialogTouchOptions {
  /** The caller's open state. */
  isOpen: boolean;
  /** The inline preview: nothing is tracked and nothing moves. */
  isInline: boolean;
  /**
   * The touch presentation (a coarse primary pointer, after hydration):
   * UIKit's motion and the action-group tracking; without it nothing
   * attaches (`spec:AST-094` FR13, FR19).
   */
  isTouch: boolean;
  /** Selects the actions the tracking hit-tests. */
  itemSelector: string;
  /** The content's scroller (the title and the message). */
  bodyRef: RefObject<HTMLElement | null>;
}

export interface AlertDialogTouch {
  /** The actions are tracked as one group: each opts out of its own press. */
  isTracking: boolean;
  /**
   * The content overflows its scroller (a long alert): a finger pans it
   * there, and the press yields to that pan. Anywhere else on the surface
   * the browser may not pan (it would cancel the touch the group holds).
   */
  isBodyScrollable: boolean;
  /** The alert's presentation under a finger (useAlertMotion). */
  motion: AlertMotion;
}

/** AlertDialog's touch layer: the action-group tracking and the motion. */
export function useAlertDialogTouch(
  surfaceRef: RefObject<HTMLDialogElement | null>,
  {isOpen, isInline, isTouch, itemSelector, bodyRef}: AlertDialogTouchOptions,
): AlertDialogTouch {
  const isDriving = isTouch && !isInline;
  const motion = useAlertMotion({isOpen, isEnabled: isDriving});
  // Tracked while presented under a touch presentation, leaving included.
  // During either transition the presentation hold (useAlertMotion) keeps
  // every touch from the group and from the buttons under it.
  const isTracking = isDriving && motion.isPresented;
  const isBodyScrollable = useIsScrollable(bodyRef, isTracking);
  useActionGroupTracking(surfaceRef, {
    itemSelector,
    highlightOnsetMs: alertController.actions.highlightOnsetMs,
    highlightExpansion: alertController.actions.highlightExpansion,
    shouldTrack: target => target !== surfaceRef.current,
    isEnabled: isTracking,
    // A mouse keeps selecting the alert's text: the host's permanent
    // long-press styles stay off. A held finger selects nothing, since the
    // group's hold does something (`spec:AST-094` FR41).
    manageStyle: false,
  });
  return {isTracking, isBodyScrollable, motion};
}
