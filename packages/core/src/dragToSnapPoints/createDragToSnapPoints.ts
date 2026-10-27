// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file createDragToSnapPoints.ts
 * @input An element; the public pan (gestures/createPanGesture.ts) and the
 *   motion animator with the `springs.settle` role
 * @output The public snap-point drag (`spec:AST-107` FR2, FR6):
 *   `createDragToSnapPoints`, its options and handle, and
 *   `snapPointAfterRelease`, the release rule
 * @position Public entry point, re-exported from the package root. The
 *   `useDragToSnapPoints` hook (hooks/useDragToSnapPoints.ts) is a thin
 *   wrapper over it.
 *
 * A drag moves the element along one axis; at the release it settles on a
 * snap point (offsets in px from the element's resting position, ascending):
 * the nearest one to where it is, except that a release faster than
 * `flickThreshold` carries to the next one in its direction, and a release
 * moving back toward where the drag started returns to the snap point it
 * started from (`spec:AST-094` FR37). The settle plays the `springs.settle`
 * motion role from the release velocity (FR38); under Reduce Motion a touch
 * drag's release cross-fades and a mouse or pen drag's lands at once
 * (`design:reduced-motion` DR2, DR3). `settleTo(index)` settles without a drag: the keyboard path.
 * Importing this module does no DOM work.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/dragToSnapPoints/createDragToSnapPoints.test.ts
 * - /packages/core/src/dragToSnapPoints/createDragToSnapPoints.doc.mjs
 * - /packages/core/src/hooks/useDragToSnapPoints.ts
 */

import {
  createPanGesture,
  type PanGestureEvent,
} from '../gestures/createPanGesture';
import {createMotionAnimator} from '../motion/animator';
import {registerSpringsTable, springs} from '../motion/uikit/springs';

/**
 * The release speed, in px/s, above which a drag carries to the next snap
 * point: the flick speed measured for UIKit's sheet on iOS 26.2.
 */
export const DEFAULT_FLICK_THRESHOLD = 1008;

/** Options of `createDragToSnapPoints`. */
export interface DragToSnapPointsOptions {
  /** The axis the element moves along. */
  axis: 'x' | 'y';
  /**
   * Offsets in px along `axis` from the element's resting position, in
   * ascending order. Not viewport fractions, unlike BottomSheet's
   * `snapPoints`.
   */
  snapPoints: ReadonlyArray<number>;
  /**
   * A release faster than this, in px/s, carries to the next snap point in
   * its direction. Default 1008.
   */
  flickThreshold?: number;
  /** Called with the snap point's index once the element settles on it. */
  onSettle: (index: number) => void;
}

/** What `createDragToSnapPoints` returns. */
export interface DragToSnapPoints {
  /**
   * Settles the element on the snap point at `index` without a drag (the
   * keyboard path), then calls `onSettle`. An index past either end is
   * clamped.
   */
  settleTo(index: number): void;
  /** Removes every listener and stops the element where it is. */
  destroy(): void;
}

/** A speed below this, in px/s, has no direction: numerical noise only. */
const STILL = 1;

/** The index of the snap point nearest `offset` (the lower one on a tie). */
function nearestIndex(snapPoints: ReadonlyArray<number>, offset: number) {
  let best = 0;
  for (let i = 1; i < snapPoints.length; i++) {
    if (
      Math.abs(snapPoints[i] - offset) < Math.abs(snapPoints[best] - offset)
    ) {
      best = i;
    }
  }
  return best;
}

/**
 * Where a release settles (FR2): back on the snap point the drag started
 * from when its velocity points back toward the start (`spec:AST-094` FR37);
 * otherwise, faster than `flickThreshold`, the next snap point past the
 * element in the velocity's direction; otherwise the nearest one.
 */
export function snapPointAfterRelease({
  snapPoints,
  offset,
  velocity,
  startIndex,
  flickThreshold = DEFAULT_FLICK_THRESHOLD,
}: {
  snapPoints: ReadonlyArray<number>;
  offset: number;
  velocity: number;
  startIndex: number;
  flickThreshold?: number;
}): number {
  const direction = Math.abs(velocity) < STILL ? 0 : Math.sign(velocity);
  const towardStart = Math.sign(snapPoints[startIndex] - offset);
  if (direction !== 0 && direction === towardStart) {
    return startIndex;
  }
  if (direction !== 0 && Math.abs(velocity) > flickThreshold) {
    if (direction > 0) {
      const next = snapPoints.findIndex(point => point > offset);
      return next === -1 ? snapPoints.length - 1 : next;
    }
    for (let i = snapPoints.length - 1; i >= 0; i--) {
      if (snapPoints[i] < offset) {
        return i;
      }
    }
    return 0;
  }
  return nearestIndex(snapPoints, offset);
}

function checkSnapPoints(snapPoints: ReadonlyArray<number>) {
  if (snapPoints.length === 0) {
    throw new Error('createDragToSnapPoints: snapPoints needs at least one.');
  }
  for (let i = 0; i < snapPoints.length; i++) {
    if (!Number.isFinite(snapPoints[i])) {
      throw new Error('createDragToSnapPoints: snapPoints must be numbers.');
    }
    if (i > 0 && snapPoints[i] <= snapPoints[i - 1]) {
      throw new Error(
        'createDragToSnapPoints: snapPoints must be in ascending order.',
      );
    }
  }
}

/**
 * Lets a drag move `element` along `axis` and settles it on `snapPoints` at
 * the release, then calls `onSettle(index)`.
 *
 * @example
 * ```
 * const snap = createDragToSnapPoints(drawer, {
 *   axis: 'y',
 *   snapPoints: [0, 240, 480],
 *   onSettle: index => console.log('settled on', index),
 * });
 * button.addEventListener('click', () => snap.settleTo(0));
 * // Later:
 * snap.destroy();
 * ```
 */
export function createDragToSnapPoints(
  element: HTMLElement,
  options: DragToSnapPointsOptions,
): DragToSnapPoints {
  const {
    axis,
    snapPoints,
    flickThreshold = DEFAULT_FLICK_THRESHOLD,
    onSettle,
  } = options;
  checkSnapPoints(snapPoints);
  const animator = createMotionAnimator(element);
  // The snap point the element rests on, or is settling toward.
  let index = nearestIndex(snapPoints, 0);
  // Each settle and each drag takes a turn; only the latest settle reports.
  let turn = 0;
  let drag: {startOffset: number; startIndex: number} | null = null;
  let destroyed = false;

  const settle = (
    target: number,
    velocity: number,
    touchRelease: boolean,
  ): void => {
    registerSpringsTable();
    index = target;
    const mine = ++turn;
    const handle = animator.animate(
      {[axis]: snapPoints[target]},
      {
        spring: springs.settle,
        ...(velocity !== 0 ? {velocity: {[axis]: velocity}} : {}),
      },
      {touchRelease},
    );
    void handle.finished.then(arrived => {
      if (arrived && mine === turn && !destroyed) {
        onSettle(target);
      }
    });
  };

  const pan = createPanGesture(element, {
    axis,
    onPan: ({state, translation, velocity, pointerType}: PanGestureEvent) => {
      if (destroyed) {
        return;
      }
      if (state === 'began') {
        // Catch a settle in flight where it is on screen.
        turn += 1;
        animator.stop();
        drag = {startOffset: animator.get(axis), startIndex: index};
      }
      if (drag == null) {
        return;
      }
      const offset = drag.startOffset + translation[axis];
      if (state === 'began' || state === 'changed') {
        animator.set({[axis]: offset});
        return;
      }
      const {startIndex} = drag;
      drag = null;
      // Only a touch drag's release cross-fades under Reduce Motion; a mouse
      // or pen drag's lands at once (design:reduced-motion DR2, DR3).
      const touchRelease = pointerType === 'touch';
      if (state === 'cancelled') {
        settle(startIndex, 0, touchRelease);
        return;
      }
      const release = velocity[axis];
      settle(
        snapPointAfterRelease({
          snapPoints,
          offset,
          velocity: release,
          startIndex,
          flickThreshold,
        }),
        release,
        touchRelease,
      );
    },
  });

  return {
    settleTo(target) {
      if (destroyed) {
        return;
      }
      const clamped = Math.min(
        snapPoints.length - 1,
        Math.max(0, Math.round(target)),
      );
      drag = null;
      settle(clamped, 0, false);
    },
    destroy() {
      if (destroyed) {
        return;
      }
      destroyed = true;
      pan.destroy();
      animator.dispose();
    },
  };
}
