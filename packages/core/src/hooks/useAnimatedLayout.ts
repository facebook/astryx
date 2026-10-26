// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useAnimatedLayout.ts
 * @input React (useLayoutEffect), motion/animatedLayout.ts
 * @output Exports `useAnimatedLayout`: marks a container as the area in which
 *   size changes animate
 * @position Public hook over the one layout-change module
 *   (`architecture:react-component-runtime` INV12)
 *
 * SYNC: When modified, update /packages/core/src/motion/animatedLayout.ts
 */

import {useLayoutEffect, type RefObject} from 'react';
import {registerLayoutArea} from '../motion/animatedLayout';

/**
 * When something inside this area changes size, the changed element and the
 * content after it animate together on one shared motion token instead of
 * jumping. Fixed and sticky elements stay put, Reduce Motion is respected,
 * ScrollableArea applies it automatically, and nesting stops at the nearest
 * area, so nothing animates twice.
 *
 * @example
 * ```
 * const panelRef = useRef<HTMLDivElement>(null);
 * useAnimatedLayout(panelRef);
 * return (
 *   <div ref={panelRef}>
 *     <TreeList items={items} />
 *     <p>Notes</p>
 *   </div>
 * );
 * ```
 */
export function useAnimatedLayout(ref: RefObject<HTMLElement | null>): void {
  useLayoutEffect(() => {
    const element = ref.current;
    if (element == null) {
      return undefined;
    }
    return registerLayoutArea(element);
  }, [ref]);
}
