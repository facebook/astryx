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
 * The factory attaches when the element mounts and is destroyed when it
 * unmounts or when `axis`, `snapPoints` or `flickThreshold` change. The
 * latest `onSettle` is the one called, so it may be a new function on every
 * render, and `settleTo` is the same function on every render.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/hooks/useDragToSnapPoints.test.tsx
 * - /packages/core/src/hooks/useDragToSnapPoints.doc.mjs
 */

import {useEffect, useLayoutEffect, useRef, useState} from 'react';
import type {RefObject} from 'react';
import {
  createDragToSnapPoints,
  type DragToSnapPoints,
  type DragToSnapPointsOptions,
} from '../dragToSnapPoints/createDragToSnapPoints';

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
  useLayoutEffect(() => {
    onSettleRef.current = options.onSettle;
  });
  const snapRef = useRef<DragToSnapPoints | null>(null);
  // The snap points as a value, so a new array with the same points keeps
  // the drag (an empty list stays empty).
  const points = JSON.stringify(snapPoints);
  useEffect(() => {
    const element = ref.current;
    if (element == null) {
      return undefined;
    }
    const created = createDragToSnapPoints(element, {
      axis,
      snapPoints: JSON.parse(points) as number[],
      flickThreshold,
      onSettle: index => onSettleRef.current(index),
    });
    snapRef.current = created;
    return () => {
      created.destroy();
      if (snapRef.current === created) {
        snapRef.current = null;
      }
    };
  }, [ref, axis, points, flickThreshold]);
  const [result] = useState<UseDragToSnapPointsResult>(() => ({
    settleTo: index => snapRef.current?.settleTo(index),
  }));
  return result;
}
