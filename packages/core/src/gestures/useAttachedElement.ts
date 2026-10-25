// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useAttachedElement.ts
 * @input An element ref, an attach function and its dependencies
 * @output Exports useAttachedElement and useIsUnmountedRef
 * @position Internal React helpers shared by useGestureRecognizer and
 *   usePressTracker, so each hook imports only what it uses
 *
 * SYNC: When modified, update useGestureRecognizer.test.tsx.
 */

import {useRef, type RefObject} from 'react';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';

/**
 * A flag that turns true when the component unmounts, before the cleanups of
 * the effects declared after it run, so nothing reports from those cleanups.
 */
export function useIsUnmountedRef(): {readonly current: boolean} {
  const isUnmountedRef = useRef(false);
  useIsomorphicLayoutEffect(() => {
    isUnmountedRef.current = false;
    return () => {
      isUnmountedRef.current = true;
    };
  }, []);
  return isUnmountedRef;
}

/**
 * Keeps one attachment for the element behind `ref`, re-made on any commit
 * that finds another element there (or the dependencies changed), and
 * released on unmount.
 */
export function useAttachedElement(
  ref: RefObject<Element | null>,
  attach: (element: Element) => () => void,
  dependencies: ReadonlyArray<unknown>,
): void {
  const attachedRef = useRef<{
    element: Element;
    dependencies: ReadonlyArray<unknown>;
    detach: () => void;
  } | null>(null);
  useIsomorphicLayoutEffect(() => {
    const element = ref.current;
    const attached = attachedRef.current;
    if (
      attached != null &&
      attached.element === element &&
      attached.dependencies.length === dependencies.length &&
      attached.dependencies.every((value, i) =>
        Object.is(value, dependencies[i]),
      )
    ) {
      return;
    }
    attached?.detach();
    attachedRef.current =
      element == null ? null : {element, dependencies, detach: attach(element)};
  });
  useIsomorphicLayoutEffect(
    () => () => {
      attachedRef.current?.detach();
      attachedRef.current = null;
    },
    [],
  );
}
