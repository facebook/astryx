// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file emulateIosIdiom.ts
 * @input vitest's global stubs; the touch presentation resolver's queries
 * @output emulateIosIdiom — jsdom answers as WebKit on iOS under a finger
 *   (`-webkit-touch-callout` supported, `(pointer: coarse)` matching), so
 *   useTouchIdiom() reads `ios`. Undo with `vi.unstubAllGlobals()`.
 * @position Test helper for the swipe-action unit tests (Item, List)
 */

import {vi} from 'vitest';
import {IOS_SUPPORTS_QUERY, TOUCH_QUERY} from '../../utils/touchPresentation';

/** Answer as WebKit on iOS or iPadOS under a finger, until the globals are unstubbed. */
export function emulateIosIdiom(): void {
  const matchMedia = window.matchMedia.bind(window);
  vi.stubGlobal('CSS', {
    ...globalThis.CSS,
    supports: (condition: string) => condition === IOS_SUPPORTS_QUERY,
  });
  vi.stubGlobal('matchMedia', (query: string) => {
    const list = matchMedia(query);
    return query === TOUCH_QUERY ? {...list, matches: true} : list;
  });
}
