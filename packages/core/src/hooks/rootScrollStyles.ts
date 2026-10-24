// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file rootScrollStyles.ts
 * @input The root element's inline style
 * @output claimRootScrollStyle, the one owner of the root's `overflow` and
 *   `overscroll-behavior-y`; isScrollLockActive / subscribeScrollLock, which
 *   report whether a scroll lock holds the page
 * @position Internal hook utility. Everything that changes how the page itself
 *   scrolls (a modal's scroll lock, a drawer's lock, a control that turns the
 *   page's top-edge bounce off) claims the root's styles here, so no caller
 *   overwrites a value another one still needs.
 *
 * Lab components reach claimRootScrollStyle, isScrollLockActive and
 * subscribeScrollLock through `@astryxdesign/core/gestures/experimental`.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/hooks/useScrollLock.ts
 * - /packages/core/src/gestures/experimental.ts (exports it)
 */

/**
 * The root scroll styles a caller can hold.
 * @experimental
 */
export interface RootScrollStyle {
  /** `hidden` or `clip` stops wheel, keyboard and scrollbar scrolling of the page. */
  overflow?: 'hidden' | 'clip';
  /** `none` turns the page's own bounce off at both vertical edges. */
  overscrollBehaviorY?: 'none' | 'contain';
}

type RootScrollProperty = keyof RootScrollStyle;

const PROPERTIES: ReadonlyArray<RootScrollProperty> = [
  'overflow',
  'overscrollBehaviorY',
];

interface Claim {
  readonly id: number;
  readonly value: string;
}

const claims: Record<RootScrollProperty, Claim[]> = {
  overflow: [],
  overscrollBehaviorY: [],
};

/** The page's own inline value, saved when the first claim on a property arrives. */
const pageValues = new Map<RootScrollProperty, string>();

let nextClaimId = 0;

function applyTopClaim(property: RootScrollProperty): void {
  const {style} = document.documentElement;
  const stack = claims[property];
  const top = stack[stack.length - 1];
  if (top != null) {
    style[property] = top.value;
    return;
  }
  style[property] = pageValues.get(property) ?? '';
  pageValues.delete(property);
}

/**
 * Sets the root's `overflow` and/or `overscroll-behavior-y` until the returned
 * release runs. Claims stack per property: the latest claim wins, releasing a
 * claim restores the one beneath it whatever the release order, and the page's
 * own inline value comes back once the last claim on a property is released.
 * Releasing twice does nothing.
 *
 * @example
 * ```
 * const release = claimRootScrollStyle({overflow: 'hidden'});
 * // later
 * release();
 * ```
 * @experimental
 */
export function claimRootScrollStyle(claim: RootScrollStyle): () => void {
  if (typeof document === 'undefined') {
    return () => {};
  }
  nextClaimId += 1;
  const id = nextClaimId;
  const claimed: RootScrollProperty[] = [];
  for (const property of PROPERTIES) {
    const value = claim[property];
    if (value == null) {
      continue;
    }
    if (claims[property].length === 0) {
      pageValues.set(property, document.documentElement.style[property]);
    }
    claims[property].push({id, value});
    claimed.push(property);
    applyTopClaim(property);
  }

  let released = false;
  return () => {
    if (released) {
      return;
    }
    released = true;
    for (const property of claimed) {
      const stack = claims[property];
      const index = stack.findIndex(entry => entry.id === id);
      if (index !== -1) {
        stack.splice(index, 1);
      }
      applyTopClaim(property);
    }
  };
}

let lockCount = 0;
const lockListeners = new Set<(isActive: boolean) => void>();

/**
 * Whether a scroll lock (useScrollLock) currently holds the page.
 * @experimental
 */
export function isScrollLockActive(): boolean {
  return lockCount > 0;
}

/**
 * Calls `listener` with the new state each time the page becomes locked or
 * free; a second lock taken while one holds is not a change. Returns the
 * unsubscribe function.
 * @experimental
 */
export function subscribeScrollLock(
  listener: (isActive: boolean) => void,
): () => void {
  lockListeners.add(listener);
  return () => {
    lockListeners.delete(listener);
  };
}

/** For scroll locks: one lock taken (`1`) or released (`-1`). */
export function reportScrollLock(delta: 1 | -1): void {
  const wasActive = lockCount > 0;
  lockCount = Math.max(0, lockCount + delta);
  const isActive = lockCount > 0;
  if (isActive === wasActive) {
    return;
  }
  for (const listener of [...lockListeners]) {
    listener(isActive);
  }
}
