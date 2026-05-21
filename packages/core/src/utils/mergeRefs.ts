// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file mergeRefs.ts
 * @input Multiple React refs (callback, object, or undefined)
 * @output A single callback ref that forwards to all inputs
 * @position Utility; used by components that need to merge an external ref
 *   with an internal ref (e.g., popover trigger + consumer ref).
 */

import type {Ref, RefCallback} from 'react';

export function mergeRefs<T>(...refs: (Ref<T> | undefined)[]): RefCallback<T> {
  return (value: T | null) => {
    const cleanups: (() => void)[] = [];
    for (const ref of refs) {
      if (typeof ref === 'function') {
        const cleanup = ref(value);
        if (typeof cleanup === 'function') {
          cleanups.push(cleanup);
        }
      } else if (ref != null) {
        (ref as {current: T | null}).current = value;
      }
    }
    if (cleanups.length > 0) {
      return () => {
        for (const cleanup of cleanups) {cleanup();}
      };
    }
  };
}
