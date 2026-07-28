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

function keyEvent(key: string) {
  const preventDefault = vi.fn();
  return {key, preventDefault} as unknown as React.KeyboardEvent;
}

function makeTarget(): HTMLElement {
  const el = document.createElement('div');
  el.setAttribute('data-astryx-sheet', '');
  el.setPointerCapture = vi.fn();
  el.releasePointerCapture = vi.fn();
  el.getBoundingClientRect = () =>
    ({height: SHEET_HEIGHT}) as DOMRect;
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
  const onSnapChange = vi.fn();
  const hook = renderHook(
    (props: UseSheetGesturesOptions) => useSheetGestures(props),
    {
      initialProps: {
        isOpen: true,
        onDismiss,
        onSnapChange,
        ...options,
      } as UseSheetGesturesOptions,
    },
  );
  return {hook, onDismiss, onSnapChange};
}

describe('useSheetGestures', () => {
  it('dismisses when dragged past the distance threshold (slow drag)', () => {
    const {hook, onDismiss} = setup();
    const target = makeTarget();
    const {handleProps} = hook.result.current;
    act(() => {
      handleProps.onPointerDown?.(pointerEvent(0, 0, target));
    });
    // Drag down slowly, well past 25% of 400px, low velocity.
    act(() => {
      handleProps.onPointerMove?.(pointerEvent(60, 200, target));
      handleProps.onPointerMove?.(pointerEvent(140, 600, target));
    });
    act(() => {
      handleProps.onPointerUp?.(pointerEvent(140, 620, target));
    });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('dismisses on a fast flick even below the distance threshold', () => {
    const {hook, onDismiss} = setup();
    const target = makeTarget();
    const {handleProps} = hook.result.current;
    act(() => {
      handleProps.onPointerDown?.(pointerEvent(0, 0, target));
    });
    // Small distance (30px < 100px) but very fast (30px / 10ms = 3px/ms).
    act(() => {
      handleProps.onPointerMove?.(pointerEvent(30, 10, target));
    });
    act(() => {
      handleProps.onPointerUp?.(pointerEvent(30, 12, target));
    });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('springs back (no dismiss) below the threshold', () => {
    const {hook, onDismiss} = setup();
    const target = makeTarget();
    const {handleProps} = hook.result.current;
    act(() => {
      handleProps.onPointerDown?.(pointerEvent(0, 0, target));
    });
    act(() => {
      handleProps.onPointerMove?.(pointerEvent(20, 300, target));
    });
    act(() => {
      handleProps.onPointerUp?.(pointerEvent(20, 620, target));
    });
    expect(onDismiss).not.toHaveBeenCalled();
    expect(hook.result.current.dragOffset).toBe(0);
    expect(hook.result.current.isDragging).toBe(false);
  });

  it('settles to the nearest snap point on release', () => {
    const {hook, onSnapChange} = setup({snapPoints: [0.5, 1]});
    const target = makeTarget();
    // Starts at fully-open (index 1). Drag down ~180px -> absolute ~180,
    // nearest to the 0.5 detent (offset 200) -> index 0.
    const {handleProps} = hook.result.current;
    act(() => {
      handleProps.onPointerDown?.(pointerEvent(0, 0, target));
    });
    act(() => {
      handleProps.onPointerMove?.(pointerEvent(180, 400, target));
    });
    act(() => {
      handleProps.onPointerUp?.(pointerEvent(180, 700, target));
    });
    expect(onSnapChange).toHaveBeenCalledWith(0);
    expect(hook.result.current.activeSnapIndex).toBe(0);
  });

  it('is inert when enabled=false (no pointer handlers)', () => {
    const {hook, onDismiss} = setup({enabled: false});
    const {handleProps, contentProps} = hook.result.current;
    expect(handleProps.onPointerDown).toBeUndefined();
    expect(handleProps.onKeyDown).toBeUndefined();
    expect(contentProps.style.transform).toBeUndefined();
    // Handle still exposes a11y attributes.
    expect(handleProps.role).toBe('separator');
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('moves between snap points via Arrow keys', () => {
    const {hook, onSnapChange} = setup({snapPoints: [0.3, 0.6, 1]});
    // Fully open = index 2. ArrowDown collapses -> index 1.
    act(() => {
      hook.result.current.handleProps.onKeyDown?.(keyEvent('ArrowDown'));
    });
    expect(onSnapChange).toHaveBeenLastCalledWith(1);
    expect(hook.result.current.activeSnapIndex).toBe(1);
    // ArrowUp expands back -> index 2.
    act(() => {
      hook.result.current.handleProps.onKeyDown?.(keyEvent('ArrowUp'));
    });
    expect(onSnapChange).toHaveBeenLastCalledWith(2);
    expect(hook.result.current.activeSnapIndex).toBe(2);
  });

  it('exposes valuemin/max/now on the handle when snap points exist', () => {
    const {hook} = setup({snapPoints: [0.3, 0.6, 1]});
    const {handleProps} = hook.result.current;
    expect(handleProps['aria-valuemin']).toBe(0);
    expect(handleProps['aria-valuemax']).toBe(2);
    expect(handleProps['aria-valuenow']).toBe(2);
  });
});
