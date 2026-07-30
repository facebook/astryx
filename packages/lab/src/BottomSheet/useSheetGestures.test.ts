// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useSheetGestures.test.ts
 * @input Uses vitest, @testing-library/react renderHook, useSheetGestures
 * @output Unit tests for useSheetGestures behavior
 * @position Testing; validates useSheetGestures.ts implementation
 *
 * SYNC: When useSheetGestures.ts changes, update tests to match new behavior
 */

import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {act, renderHook} from '@testing-library/react';
import {
  useSheetGestures,
  type UseSheetGesturesOptions,
} from './useSheetGestures';

const SHEET_HEIGHT = 400;

// A fake pointer event object good enough for the handlers, which only read
// pointerId, clientY, timeStamp, and currentTarget's capture + measure APIs.
function pointerEvent(
  clientY: number,
  timeStamp: number,
  target: HTMLElement,
  pointerId = 1,
) {
  return {
    pointerId,
    clientY,
    timeStamp,
    currentTarget: target,
  } as unknown as React.PointerEvent;
}

function makeTarget(): HTMLElement {
  const el = document.createElement('div');
  el.setAttribute('data-astryx-sheet', '');
  el.setPointerCapture = vi.fn();
  el.releasePointerCapture = vi.fn();
  el.getBoundingClientRect = () => ({height: SHEET_HEIGHT}) as DOMRect;
  return el;
}

beforeEach(() => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function setup(options: Partial<UseSheetGesturesOptions> = {}) {
  const onDismiss = vi.fn();
  const hook = renderHook(
    (props: UseSheetGesturesOptions) => useSheetGestures(props),
    {
      initialProps: {
        isOpen: true,
        onDismiss,
        ...options,
      } as UseSheetGesturesOptions,
    },
  );
  return {hook, onDismiss};
}

describe('useSheetGestures', () => {
  it('dismisses when dragged past the distance threshold (slow drag)', () => {
    const {hook, onDismiss} = setup();
    const target = makeTarget();
    const {handleProps} = hook.result.current;
    act(() => {
      handleProps.onPointerDown(pointerEvent(0, 0, target));
    });
    // Drag down slowly, well past 25% of 400px, low velocity.
    act(() => {
      handleProps.onPointerMove(pointerEvent(60, 200, target));
      handleProps.onPointerMove(pointerEvent(140, 600, target));
    });
    act(() => {
      handleProps.onPointerUp(pointerEvent(140, 620, target));
    });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('dismisses on a fast flick even below the distance threshold', () => {
    const {hook, onDismiss} = setup();
    const target = makeTarget();
    const {handleProps} = hook.result.current;
    act(() => {
      handleProps.onPointerDown(pointerEvent(0, 0, target));
    });
    // Small distance (30px < 100px) but very fast (30px / 10ms = 3px/ms).
    act(() => {
      handleProps.onPointerMove(pointerEvent(30, 10, target));
    });
    act(() => {
      handleProps.onPointerUp(pointerEvent(30, 12, target));
    });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('springs back (no dismiss) below the threshold', () => {
    const {hook, onDismiss} = setup();
    const target = makeTarget();
    const {handleProps} = hook.result.current;
    act(() => {
      handleProps.onPointerDown(pointerEvent(0, 0, target));
    });
    act(() => {
      handleProps.onPointerMove(pointerEvent(20, 300, target));
    });
    act(() => {
      handleProps.onPointerUp(pointerEvent(20, 620, target));
    });
    expect(onDismiss).not.toHaveBeenCalled();
    expect(hook.result.current.dragOffset).toBe(0);
    expect(hook.result.current.isDragging).toBe(false);
  });

  it('translates the surface live during a drag', () => {
    const {hook} = setup();
    const target = makeTarget();
    const {handleProps} = hook.result.current;
    act(() => {
      handleProps.onPointerDown(pointerEvent(0, 0, target));
    });
    act(() => {
      handleProps.onPointerMove(pointerEvent(50, 100, target));
    });
    expect(hook.result.current.dragOffset).toBe(50);
    expect(hook.result.current.isDragging).toBe(true);
    expect(hook.result.current.contentProps.style.transform).toBe(
      'translateY(50px)',
    );
  });

  it('ignores upward drag past the fully-open position', () => {
    const {hook} = setup();
    const target = makeTarget();
    const {handleProps} = hook.result.current;
    act(() => {
      handleProps.onPointerDown(pointerEvent(100, 0, target));
    });
    // Drag UP (clientY decreasing) — no rubber-band overscroll.
    act(() => {
      handleProps.onPointerMove(pointerEvent(20, 100, target));
    });
    expect(hook.result.current.dragOffset).toBe(0);
  });
});
