// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useDragToSnapPoints.ts
 * @input React, the public snap-point drag factory
 *   (dragToSnapPoints/createDragToSnapPoints.ts)
 * @output Exports `useDragToSnapPoints`: a drag that settles the element `ref`
 *   points at on snap points (`spec:AST-107` FR2)
 * @position Public hook, exported from `@astryxdesign/core/hooks`. A thin
 *   wrapper over `createDragToSnapPoints` with no behavior of its own (FR6).
 *
 * The factory attaches to the element behind `ref` after each commit that
 * mounts or replaces it (`architecture:react-component-runtime` INV6), and
 * is destroyed when it unmounts. Any option change creates the drag again,
 * starting where the element is drawn, and the hook uses only the drag's
 * public `settleTo` to carry a settle in flight on to its point, or move a
 * resting element whose point is gone to the nearest new one. The latest
 * `onSettle` is the one called, so it may be a new function on every render,
 * and `settleTo` is the same function on every render.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/hooks/useDragToSnapPoints.test.tsx
 * - /packages/core/src/hooks/useDragToSnapPoints.doc.mjs
 */

import {useRef, useState} from 'react';
import type {RefObject} from 'react';
import {
  createDragToSnapPoints,
  drawnOffset,
  nearestSnapPoint,
  snapOffsets,
  type DragToSnapPoints,
  type DragToSnapPointsOptions,
} from '../dragToSnapPoints/createDragToSnapPoints';
import {useIsomorphicLayoutEffect} from './useIsomorphicLayoutEffect';

interface Attached {
  readonly element: HTMLElement;
  readonly axis: DragToSnapPointsOptions['axis'];
  readonly points: string;
  readonly flickThreshold: number | undefined;
  /** The drag's snap points as it uses them, for its indices. */
  readonly offsets: ReadonlyArray<number>;
  readonly snap: DragToSnapPoints;
}

/** Where the element rests, or heads through this hook's `settleTo`. */
interface Aim {
  readonly offset: number;
  readonly moving: boolean;
}

/** Within half a pixel: the same place on screen. */
const near = (a: number, b: number) => Math.abs(a - b) < 0.5;

export interface UseDragToSnapPointsResult {
  /**
   * Settles the element on the snap point at `index` without a drag: the
   * keyboard path. The same function on every render.
   */
  readonly settleTo: (index: number) => void;
}

/**
 * Lets a drag move the element along `axis` and settles it on `snapPoints`
 * at the release.
 *
 * @example
 * ```
 * const ref = useRef<HTMLDivElement>(null);
 * const {settleTo} = useDragToSnapPoints(ref, {
 *   axis: 'y',
 *   snapPoints: [0, 240, 480],
 *   onSettle: setIndex,
 * });
 * ```
 */
export function useDragToSnapPoints(
  ref: RefObject<HTMLElement | null>,
  options: DragToSnapPointsOptions,
): UseDragToSnapPointsResult {
  const {axis, snapPoints, flickThreshold} = options;
  const onSettleRef = useRef(options.onSettle);
  useIsomorphicLayoutEffect(() => {
    onSettleRef.current = options.onSettle;
  });
  const attachedRef = useRef<Attached | null>(null);
  const aimRef = useRef<Aim | null>(null);
  // The snap points as a value, so a new array with the same points keeps
  // the drag (an empty list stays empty).
  const points = JSON.stringify(snapPoints);
  // One drag for the node behind `ref`, checked after every commit: a node
  // mounted or replaced later is driven too (INV6), and any option change
  // creates the drag again through the factory (spec:AST-107 FR6). The new
  // drag starts where the element is drawn, and through its public
  // `settleTo` a settle in flight carries on to its point and a resting
  // element whose point is gone moves to the nearest new one, as a UIKit sheet
  // whose detents change moves to a valid one.
  useIsomorphicLayoutEffect(() => {
    const element = ref.current;
    const attached = attachedRef.current;
    if (
      attached?.element === element &&
      attached.axis === axis &&
      attached.points === points &&
      attached.flickThreshold === flickThreshold
    ) {
      return;
    }
    const sameDrag = attached?.element === element && attached?.axis === axis;
    attached?.snap.destroy();
    if (!sameDrag) {
      aimRef.current = null;
    }
    if (element == null) {
      attachedRef.current = null;
      return;
    }
    const list = JSON.parse(points) as number[];
    const offsets = snapOffsets(list);
    const snap = createDragToSnapPoints(element, {
      axis,
      snapPoints: list,
      flickThreshold,
      onSettle: index => {
        aimRef.current = {offset: offsets[index], moving: false};
        onSettleRef.current(index);
      },
    });
    attachedRef.current = {
      element,
      axis,
      points,
      flickThreshold,
      offsets,
      snap,
    };
    if (!sameDrag) {
      return;
    }
    // Where it was going: the point a settle in flight heads for, else where
    // it rests, else, moved since (a drag or its settle), where it is now.
    const aim = aimRef.current;
    const drawn = drawnOffset(element, axis);
    const goal = aim?.moving
      ? aim.offset
      : aim != null && near(drawn, aim.offset)
        ? aim.offset
        : drawn;
    const nearest = nearestSnapPoint(offsets, goal);
    if (
      nearest != null &&
      (aim?.moving === true || !near(nearest.offset, goal))
    ) {
      aimRef.current = {offset: nearest.offset, moving: true};
      snap.settleTo(nearest.index);
    }
  });
  // Destroyed at unmount.
  useIsomorphicLayoutEffect(
    () => () => {
      attachedRef.current?.snap.destroy();
      attachedRef.current = null;
    },
    [],
  );
  const [result] = useState<UseDragToSnapPointsResult>(() => ({
    settleTo: index => {
      const attached = attachedRef.current;
      if (attached == null) {
        return;
      }
      if (
        Number.isInteger(index) &&
        index >= 0 &&
        index < attached.offsets.length
      ) {
        aimRef.current = {offset: attached.offsets[index], moving: true};
      }
      attached.snap.settleTo(index);
    },
  }));
  return result;
}
