// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file touchLayers.test.ts
 * @input Uses vitest, React Testing Library and a matchMedia stub for a phone
 * @output The touch-layers flag: on unless the app defines `__ASTRYX_TOUCH__`
 *   as false; a build without touch layers presents no touch, from the hook
 *   and from the one-moment read, while compact still follows the size
 * @position Unit tests of packages/core/src/utils/touchLayers.ts and its use
 *   in touchPresentation.ts
 */

import {renderHook} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {DEFAULT_COMPACT_DEFINITION} from '../theme/themeAdaptations';

/**
 * The flag and the resolver as a build with this define evaluates them: the
 * modules load fresh, after the define is in place.
 */
async function load(define: boolean | undefined) {
  vi.resetModules();
  globalThis.__ASTRYX_TOUCH__ = define;
  const {TOUCH_LAYERS} = await import('./touchLayers');
  const {readTouchPresentation, useTouchPresentation} =
    await import('./touchPresentation');
  return {TOUCH_LAYERS, readTouchPresentation, useTouchPresentation};
}

beforeEach(() => {
  // A phone: the primary pointer is coarse and the viewport is compact, so
  // every query the resolver asks matches.
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: true,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    })),
  );
});

afterEach(() => {
  globalThis.__ASTRYX_TOUCH__ = undefined;
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe('touch layers', () => {
  it('are in the build unless the app defines __ASTRYX_TOUCH__ as false', async () => {
    expect((await load(undefined)).TOUCH_LAYERS).toBe(true);
    expect((await load(true)).TOUCH_LAYERS).toBe(true);
    expect((await load(false)).TOUCH_LAYERS).toBe(false);
  });

  it('leave a phone presenting the touch way in a build that has them', async () => {
    const {readTouchPresentation, useTouchPresentation} = await load(undefined);
    const {result} = renderHook(() => useTouchPresentation());
    expect(result.current).toEqual({isTouch: true, isCompact: true});
    expect(readTouchPresentation(window, DEFAULT_COMPACT_DEFINITION)).toEqual({
      isTouch: true,
      isCompact: true,
    });
  });

  it('present no touch in a build without them, while compact follows the size', async () => {
    const {readTouchPresentation, useTouchPresentation} = await load(false);
    const {result} = renderHook(() =>
      useTouchPresentation({isTouch: true, isCompact: true}),
    );
    expect(result.current).toEqual({isTouch: false, isCompact: true});
    expect(readTouchPresentation(window, DEFAULT_COMPACT_DEFINITION)).toEqual({
      isTouch: false,
      isCompact: true,
    });
  });
});
