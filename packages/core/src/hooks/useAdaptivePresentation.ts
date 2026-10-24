// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useAdaptivePresentation.ts
 * @input Uses React's external-store subscription over window.matchMedia
 * @output Resolves popover/bottom-sheet presentation policy
 * @position Internal overlay policy shared across component families
 */

import {useCallback, useSyncExternalStore} from 'react';

export type AdaptivePresentation = 'popover' | 'bottom-sheet' | 'adaptive';
export type ResolvedAdaptivePresentation = Exclude<
  AdaptivePresentation,
  'adaptive'
>;

// Width keeps desktop-class tablets and large touch displays anchored by
// default. Pointer capability, rather than `hover: none`, avoids excluding
// touch browsers that also report hover capability.
export const COMPACT_TOUCH_PRESENTATION_QUERY =
  '(max-width: 768px) and (pointer: coarse)';

const noSubscription = () => () => {};
const notCompact = () => false;

/**
 * Resolve `adaptive` against the compact-touch query. Only an `adaptive`
 * presentation subscribes to `matchMedia`; a fixed presentation never reads
 * the query, so it holds no listener for it
 * (`architecture:react-component-runtime` INV5). SSR-safe: the server
 * snapshot is "not compact", as `useMediaQuery`'s default is.
 */
export function useAdaptivePresentation(
  presentation: AdaptivePresentation,
): ResolvedAdaptivePresentation {
  const isAdaptive = presentation === 'adaptive';
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!isAdaptive) {
        return noSubscription();
      }
      const mql = window.matchMedia(COMPACT_TOUCH_PRESENTATION_QUERY);
      mql.addEventListener('change', onStoreChange);
      return () => mql.removeEventListener('change', onStoreChange);
    },
    [isAdaptive],
  );
  const getSnapshot = useCallback(
    () =>
      isAdaptive
        ? window.matchMedia(COMPACT_TOUCH_PRESENTATION_QUERY).matches
        : false,
    [isAdaptive],
  );
  const isCompactTouch = useSyncExternalStore(
    subscribe,
    getSnapshot,
    notCompact,
  );
  return isAdaptive
    ? isCompactTouch
      ? 'bottom-sheet'
      : 'popover'
    : presentation;
}
