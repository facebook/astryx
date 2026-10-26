// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useTouchLayer.ts
 * @input A ref to the element a touch layer drives, and the layer's setup
 * @output useTouchLayer: runs a one-element touch layer's setup with the
 *   installed touch module, and its cleanup
 * @position Internal to touch-support, beside useTouchSupport: the lifecycle a
 *   component's touch glue uses (architecture:react-component-runtime INV13).
 *   A layer over several elements reads useTouchSupport itself.
 *
 * `setup(touch, element)` runs in a layout effect once the module is installed
 * and the element is mounted, and its returned cleanup runs when the layer
 * detaches. It runs again only when the module or the element changes, never
 * on the server, and never without the module, so the component keeps its
 * plain behavior until an app installs TouchSupport. `setup` reads changing
 * values through refs: a new `setup` function alone does not run it again.
 *
 * SYNC: When modified, update useTouchLayer.test.tsx.
 */

import {useRef, type RefObject} from 'react';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import type {TouchModule} from './touchModule';
import {useTouchSupport} from './useTouchSupport';

/** The layer as attached: the module and element it set up, and its cleanup. */
interface Attached {
  readonly touch: TouchModule;
  readonly element: Element;
  readonly cleanup: () => void;
}

/**
 * Runs `setup(touch, element)` while the touch module is installed and `ref`'s
 * element is mounted, and the cleanup it returns when either goes away or
 * changes.
 */
export function useTouchLayer(
  ref: RefObject<Element | null>,
  setup: (touch: TouchModule, element: Element) => () => void,
): void {
  const touch = useTouchSupport();
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
