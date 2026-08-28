// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useMergedRefs.ts
 * @input React refs to combine into one stable callback ref
 * @output Exports useMergedRefs
 * @position Core hook; use when one element must receive multiple refs
 *
 * SYNC: When modified, update:
 * - /packages/core/src/hooks/index.ts
 * - /packages/core/src/hooks/useMergedRefs.doc.mjs
 * - /packages/core/src/hooks/useMergedRefs.test.tsx
 */

import {useMemo, type Ref, type RefCallback} from 'react';
import {mergeRefs} from '../utils/mergeRefs';

/**
 * Combine up to six refs into a callback ref whose identity changes only when
 * one of the input refs changes.
 */
export function useMergedRefs<T>(
  refA?: Ref<T>,
  refB?: Ref<T>,
  refC?: Ref<T>,
  refD?: Ref<T>,
  refE?: Ref<T>,
  refF?: Ref<T>,
): RefCallback<T> {
  return useMemo(
    () => mergeRefs(refA, refB, refC, refD, refE, refF),
    [refA, refB, refC, refD, refE, refF],
  );
}
