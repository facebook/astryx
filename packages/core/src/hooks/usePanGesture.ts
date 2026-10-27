// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file usePanGesture.ts
 * @input An element ref and pan options
 * @output Exports usePanGesture: the React layer of createPanGesture
 *   (spec:AST-107 FR1, FR6)
 * @position Public hook in packages/core/src/hooks. It delegates entirely to
 *   createPanGesture: it creates one pan for the element behind `ref`,
 *   re-creates it when the node or the axis changes, and destroys it at
 *   unmount. `onPan` is read through a ref, so a new function each render
 *   re-creates nothing and a drag costs no React render.
 * SYNC: When modified, update usePanGesture.doc.mjs and
 * ../gestures/__tests__/createPanGesture.test.tsx.
 */

import {useRef, type RefObject} from 'react';
import {
  createPanGesture,
  type PanGesture,
  type PanGestureOptions,
} from '../gestures/createPanGesture';
import {useIsomorphicLayoutEffect} from './useIsomorphicLayoutEffect';

interface Attached {
  readonly element: Element;
  readonly axis: PanGestureOptions['axis'];
  readonly gesture: PanGesture;
}

/**
 * Report drags on the element behind `ref` as values.
 * @example
 * ```
 * const ref = useRef<HTMLDivElement>(null);
 * usePanGesture(ref, {
 *   axis: 'x',
 *   onPan: ({state, translation}) => {
 *     ref.current!.style.translate =
 *       state === 'changed' ? `${translation.x}px` : '';
 *   },
 * });
 * ```
 */
export function usePanGesture(
  ref: RefObject<Element | null>,
  options: PanGestureOptions,
): void {
  const {axis, onPan} = options;
  const onPanRef = useRef(onPan);
  const attachedRef = useRef<Attached | null>(null);
  // The latest listener, for the next event.
  useIsomorphicLayoutEffect(() => {
    onPanRef.current = onPan;
  });
  // One pan for the node behind `ref` with this axis: re-created when either
  // changes, after a commit that replaced the node.
  useIsomorphicLayoutEffect(() => {
    const element = ref.current;
    const attached = attachedRef.current;
    if (attached?.element === element && attached?.axis === axis) {
      return;
    }
    attached?.gesture.destroy();
    attachedRef.current =
      element == null
        ? null
        : {
            element,
            axis,
            gesture: createPanGesture(element, {
              axis,
              onPan: event => onPanRef.current(event),
            }),
          };
  });
  // Destroyed at unmount.
  useIsomorphicLayoutEffect(
    () => () => {
      attachedRef.current?.gesture.destroy();
      attachedRef.current = null;
    },
    [],
  );
}
