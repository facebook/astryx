// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useTouchLayer.ts
 * @input A ref to the element a touch layer drives, and the layer's setup
 * @output useTouchLayer: runs a one-element touch layer's setup while the
 *   primary pointer is coarse, and its cleanup
 * @position Internal to touch-support: the lifecycle a component's touch glue
 *   uses (architecture:react-component-runtime INV13).
 *
 * The ref must be on an element this component renders: the layer follows
 * the element after each of this component's renders, so an element a child
 * replaces through its own state needs the hook in that child.
 *
 * `setup(element)` runs in a layout effect while the primary pointer
 * is coarse and the element is mounted, and its returned cleanup runs when
 * the layer detaches (the pointer turns fine, the element goes). It runs
 * again only when that answer or the element changes, and never on the
 * server or under a fine primary pointer, where the component keeps its plain
 * behavior and attaches no input listener (`spec:AST-094` FR19). `setup`
 * reads changing values through refs: a new `setup` function alone does not
 * run it again. The setup imports the touch modules it uses itself
 * (statically): the layer gives it only the element.
 *
 * SYNC: When modified, update useTouchLayer.test.tsx.
 */

import {useRef, useSyncExternalStore, type RefObject} from 'react';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import {
  isTouchLayerActive,
  isTouchLayerActiveOnServer,
  subscribeTouchLayer,
} from './touchSupportRegistry';

/** The layer as attached: the element it set up, and its cleanup. */
interface Attached {
  readonly element: Element;
  readonly cleanup: () => void;
}

/**
 * Runs `setup(element)` while the primary pointer is coarse and `ref`'s
 * element is mounted, and the cleanup it returns when either goes away or
 * changes.
 */
export function useTouchLayer(
  ref: RefObject<Element | null>,
  setup: (element: Element) => () => void,
): void {
  const isActive = useSyncExternalStore(
    subscribeTouchLayer,
    isTouchLayerActive,
    isTouchLayerActiveOnServer,
  );
  const setupRef = useRef(setup);
  const attachedRef = useRef<Attached | null>(null);

  useIsomorphicLayoutEffect(() => {
    setupRef.current = setup;
  });

  // After every render: attach, detach, or move to a new element. Comparing
  // the element keeps a re-render from setting up again.
  useIsomorphicLayoutEffect(() => {
    // The pointer now, not at render: a layer rendered hidden (an Activity)
    // under a coarse pointer and shown after it turned fine sets nothing up.
    const live = isActive && isTouchLayerActive();
    const element = live ? ref.current : null;
    const attached = attachedRef.current;
    if (attached?.element === element) {
      return;
    }
    attached?.cleanup();
    attachedRef.current =
      element !== null ? {element, cleanup: setupRef.current(element)} : null;
  });

  useIsomorphicLayoutEffect(
    () => () => {
      attachedRef.current?.cleanup();
      attachedRef.current = null;
    },
    [],
  );
}
