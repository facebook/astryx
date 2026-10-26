// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useAnimatedLayout.ts
 * @input React (useMemo, useRef), motion/animatedLayout.ts
 * @output Exports `useAnimatedLayout` and the opaque `AnimatedLayout` handle
 *   type
 * @position Public hook over the one layout-change module
 *   (`architecture:react-component-runtime` INV12)
 *
 * SYNC: When modified, update /packages/core/src/motion/animatedLayout.ts
 */

import {useMemo, useRef, type RefObject} from 'react';
import {
  createAnimatedLayout,
  type AnimatedLayout,
} from '../motion/animatedLayout';

export type {AnimatedLayout} from '../motion/animatedLayout';

export interface UseAnimatedLayoutOptions {
  /** The container whose content glides: a scroll container or a panel. */
  containerRef: RefObject<HTMLElement | null>;
}

/**
 * A handle for animating size changes inside a container. Pass it to a
 * component's `animatedLayout` prop: when that component changes size, the
 * changed element and the content after it, up to the container, animate
 * together on one shared motion token instead of jumping. Fixed and stuck
 * sticky elements stay put and Reduce Motion is respected. Without a handle
 * a component keeps today's behavior.
 *
 * @example
 * ```
 * const containerRef = useRef<HTMLDivElement>(null);
 * const animatedLayout = useAnimatedLayout({containerRef});
 * return (
 *   <div ref={containerRef}>
 *     <TreeList items={items} animatedLayout={animatedLayout} />
 *     <p>Notes</p>
 *   </div>
 * );
 * ```
 */
export function useAnimatedLayout({
  containerRef,
}: UseAnimatedLayoutOptions): AnimatedLayout {
  // The container is read when a change runs, so the handle stays stable
  // across renders and a later ref assignment is still seen.
  const refHolder = useRef(containerRef);
  refHolder.current = containerRef;
  return useMemo(
    () => createAnimatedLayout(() => refHolder.current.current),
    [],
  );
}
