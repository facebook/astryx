// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useTouchLayer.ts
 * @input A ref to the element a touch layer drives, and the layer's setup
 * @output useTouchLayer: runs a one-element touch layer's setup with the
 *   touch module while the primary pointer is coarse, and its cleanup
 * @position Internal to touch-support: the lifecycle a component's touch glue
 *   uses (architecture:react-component-runtime INV13).
 *
 * The ref must be on an element this component renders: the layer follows
 * the element after each of this component's renders, so an element a child
 * replaces through its own state needs the hook in that child.
 *
 * `setup(touch, element)` runs in a layout effect while the primary pointer
 * is coarse and the element is mounted, and its returned cleanup runs when
 * the layer detaches (the pointer turns fine, the element goes). It runs
 * again only when that answer or the element changes, and never on the
 * server or under a fine primary pointer, where the component keeps its plain
 * behavior and attaches no input listener (`spec:AST-094` FR19). `setup`
 * reads changing values through refs: a new `setup` function alone does not
 * run it again.
 *
 * SYNC: When modified, update useTouchLayer.test.tsx.
 */

import {useRef, useSyncExternalStore, type RefObject} from 'react';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import type {TouchModule} from './touchModule';
import {
  getServerTouchModule,
  getTouchModule,
  subscribeTouchModule,
} from './touchSupportRegistry';

/** The layer as attached: the module and element it set up, and its cleanup. */
interface Attached {
  readonly touch: TouchModule;
  readonly element: Element;
  readonly cleanup: () => void;
}

/**
 * Runs `setup(touch, element)` while the primary pointer is coarse and `ref`'s
 * element is mounted, and the cleanup it returns when either goes away or
 * changes.
 */
export function useTouchLayer(
  ref: RefObject<Element | null>,
  setup: (touch: TouchModule, element: Element) => () => void,
): void {
  const touch = useSyncExternalStore(
    subscribeTouchModule,
    getTouchModule,
    getServerTouchModule,
  );
  const setupRef = useRef(setup);
  const attachedRef = useRef<Attached | null>(null);

  useIsomorphicLayoutEffect(() => {
    setupRef.current = setup;
  });

  // After every render: attach, detach, or move to a new element. Comparing
  // the module and the element keeps a re-render from setting up again.
  useIsomorphicLayoutEffect(() => {
    const element = ref.current;
    const attached = attachedRef.current;
    if (attached?.touch === touch && attached.element === element) {
      return;
    }
    attached?.cleanup();
    attachedRef.current =
      touch !== null && element !== null
        ? {touch, element, cleanup: setupRef.current(touch, element)}
        : null;
  });

  useIsomorphicLayoutEffect(
    () => () => {
      attachedRef.current?.cleanup();
      attachedRef.current = null;
    },
    [],
  );
}
