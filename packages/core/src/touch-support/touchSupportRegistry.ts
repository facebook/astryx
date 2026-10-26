// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file touchSupportRegistry.ts
 * @input The touch module and the touch media query
 * @output getTouchModule, getServerTouchModule and subscribeTouchModule: the
 *   touch module while the primary pointer is coarse, null otherwise; and
 *   resetTouchSupportForTests
 * @position Internal to touch-support. useTouchLayer reads it
 *   (architecture:react-component-runtime INV13).
 *
 * Nothing installs the module: components import it statically, and this
 * only says whether a touch layer runs now. Under a fine primary pointer the
 * answer is null, so a component keeps its plain behavior and attaches no
 * input listener (`spec:AST-094` FR19). The media query is read when first
 * asked and followed only while a reader subscribes. On the server the
 * answer is always null.
 */

import {TOUCH_QUERY} from '../utils/touchPresentation';
import {touchModule, type TouchModule} from './touchModule';

let isCoarse: boolean | null = null;
let query: MediaQueryList | null = null;
const listeners = new Set<() => void>();

function notify(): void {
  for (const listener of [...listeners]) {
    listener();
  }
}

const onChange = (): void => {
  isCoarse = query?.matches ?? false;
  notify();
};

/** Follows the media query while a reader subscribes. */
function follow(): void {
  query?.addEventListener('change', onChange);
}

function readPointer(): boolean {
  if (isCoarse === null) {
    query =
      typeof window === 'undefined' || typeof window.matchMedia !== 'function'
        ? null
        : window.matchMedia(TOUCH_QUERY);
    isCoarse = query?.matches ?? false;
  }
  return isCoarse;
}

/** The touch module while the primary pointer is coarse, else null. */
export function getTouchModule(): TouchModule | null {
  return readPointer() ? touchModule : null;
}

/** The server's answer: no touch layer runs while rendering on the server. */
export function getServerTouchModule(): null {
  return null;
}

/**
 * Calls `listener` when the answer changes (the primary pointer turns coarse
 * or fine); returns the unsubscribe.
 */
export function subscribeTouchModule(listener: () => void): () => void {
  readPointer();
  if (listeners.size === 0) {
    follow();
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      query?.removeEventListener('change', onChange);
    }
  };
}

/**
 * Forgets the pointer read, as on a fresh page, and tells every reader to
 * read again. For tests only.
 */
export function resetTouchSupportForTests(): void {
  query?.removeEventListener('change', onChange);
  query = null;
  isCoarse = null;
  if (listeners.size > 0) {
    readPointer();
    follow();
  }
  notify();
}
