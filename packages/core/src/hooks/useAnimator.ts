// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useAnimator.ts
 * @input React (useState), the public animator factory
 *   (animator/createAnimator.ts)
 * @output Exports `useAnimator`: the public animator for one element and the
 *   callback ref that attaches it (`spec:AST-107` FR3)
 * @position Public hook, exported from `@astryxdesign/core/hooks`. A thin
 *   wrapper over `createAnimator` with no behavior of its own (FR6).
 *
 * The animator lives outside React's render cycle: the hook makes it once,
 * returns the same object on every render, and nothing it does sets state,
 * so animating never re-renders the component. The ref attaches the element
 * when it mounts and lets it go when it unmounts (running motion stops, the
 * values stay); a remount resumes from them. While no element is attached,
 * every call does nothing, and `animate` and `decay` resolve at once.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/hooks/useAnimator.test.tsx
 * - /packages/core/src/hooks/useAnimator.doc.mjs
 */

import {useState} from 'react';
import {
  createAttachableAnimator,
  type AnimatorHandle,
} from '../animator/createAnimator';

export interface UseAnimatorResult {
  /** Callback ref for the element to animate; stable. */
  readonly ref: (element: HTMLElement | null) => void;
  /** The element's animator; the same object on every render. */
  readonly animator: AnimatorHandle;
}

/**
 * Animates one element with the motion Core uses: pass `ref` to the element,
 * then call `animator.animate`, `decay`, `set`, `get`, `getVelocity` or
 * `stop` from event handlers and effects.
 *
 * @example
 * ```
 * const {ref, animator} = useAnimator();
 * return (
 *   <div ref={ref} onClick={() => animator.animate({scale: 1.2})}>
 *     Card
 *   </div>
 * );
 * ```
 */
export function useAnimator(): UseAnimatorResult {
  const [result] = useState<UseAnimatorResult>(() => {
    const {animator, attach} = createAttachableAnimator();
    return {ref: attach, animator};
  });
  return result;
}
