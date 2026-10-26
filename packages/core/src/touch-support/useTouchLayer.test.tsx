// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useTouchLayer.test.tsx
 * @input useTouchLayer, the touch-support registry, a stand-in for the touch
 *   media query, and React's client and server renderers
 * @output Proves the one-element layer lifecycle: no setup under a fine
 *   primary pointer, and no input listener; setup once under a coarse one
 *   with the module and the element; setup when the pointer turns coarse
 *   after the first render, with no remount, and cleanup when it turns fine;
 *   a re-render does not set up again; a new element moves the layer; cleanup
 *   on unmount; balanced under StrictMode; nothing on the server
 * @position Unit tests of packages/core/src/touch-support/useTouchLayer.ts
 */

import {StrictMode, useRef} from 'react';
import {act, render, screen} from '@testing-library/react';
import {renderToString} from 'react-dom/server';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {touchModule} from './touchModule';
import {resetTouchSupportForTests} from './touchSupportRegistry';
import {useTouchLayer} from './useTouchLayer';

/** Stands in for `matchMedia('(pointer: coarse)')`; returns the switch. */
function primaryPointer(initiallyCoarse: boolean): (isCoarse: boolean) => void {
  let matches = initiallyCoarse;
  const listeners = new Set<() => void>();
  vi.stubGlobal(
    'matchMedia',
    vi.fn((media: string) => ({
      media,
      get matches() {
        return media === '(pointer: coarse)' && matches;
      },
      addEventListener: (_type: string, listener: () => void) => {
        listeners.add(listener);
      },
      removeEventListener: (_type: string, listener: () => void) => {
        listeners.delete(listener);
      },
    })),
  );
  resetTouchSupportForTests();
  return isCoarse => {
    matches = isCoarse;
    for (const listener of [...listeners]) {
      listener();
    }
  };
}

/** A layer that records each setup and cleanup. */
function recorder() {
  const cleanup = vi.fn();
  const setup = vi.fn(() => cleanup);
  function Layer({tag = 'div'}: {tag?: 'div' | 'span'}) {
    const ref = useRef<HTMLElement>(null);
    useTouchLayer(ref, setup);
    const Tag = tag;
    return <Tag ref={ref as never} data-testid="layer" />;
  }
  return {setup, cleanup, Layer};
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  resetTouchSupportForTests();
});

describe('useTouchLayer', () => {
  it('sets nothing up under a fine primary pointer, and attaches no input listener', () => {
    primaryPointer(false);
    const onWindow = vi.spyOn(window, 'addEventListener');
    const onDocument = vi.spyOn(document, 'addEventListener');
    const {setup, Layer} = recorder();
    const view = render(<Layer />);
    view.rerender(<Layer />);
    expect(setup).not.toHaveBeenCalled();
    const input = /^(touch|pointer|mouse|click)/;
    expect(onWindow.mock.calls.filter(([type]) => input.test(type))).toEqual(
      [],
    );
    expect(onDocument.mock.calls.filter(([type]) => input.test(type))).toEqual(
      [],
    );
  });

  it('sets up once under a coarse pointer with the module and the element, and cleans up on unmount', () => {
    primaryPointer(true);
    const {setup, cleanup, Layer} = recorder();
    const view = render(<Layer />);
    expect(setup).toHaveBeenCalledTimes(1);
    expect(setup).toHaveBeenCalledWith(
      touchModule,
      screen.getByTestId('layer'),
    );
    view.rerender(<Layer />);
    expect(setup).toHaveBeenCalledTimes(1);
    expect(cleanup).not.toHaveBeenCalled();
    view.unmount();
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('sets up when the pointer turns coarse after the first render, with no remount, and cleans up when it turns fine', () => {
    const turn = primaryPointer(false);
    const {setup, cleanup, Layer} = recorder();
    render(<Layer />);
    const element = screen.getByTestId('layer');
    expect(setup).not.toHaveBeenCalled();
    act(() => {
      turn(true);
    });
    expect(screen.getByTestId('layer')).toBe(element);
    expect(setup).toHaveBeenCalledTimes(1);
    expect(setup).toHaveBeenCalledWith(touchModule, element);
    act(() => {
      turn(false);
    });
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('reads the pointer afresh for a layer mounted after the last one left', () => {
    const turn = primaryPointer(true);
    const first = recorder();
    render(<first.Layer />).unmount();
    expect(first.setup).toHaveBeenCalledTimes(1);
    // Nothing follows the pointer while no layer is mounted.
    turn(false);
    const second = recorder();
    render(<second.Layer />);
    expect(second.setup).not.toHaveBeenCalled();
  });

  it('moves to a new element: the old one cleans up, the new one sets up', () => {
    primaryPointer(true);
    const {setup, cleanup, Layer} = recorder();
    const view = render(<Layer tag="div" />);
    view.rerender(<Layer tag="span" />);
    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(setup).toHaveBeenCalledTimes(2);
    expect(setup).toHaveBeenLastCalledWith(
      touchModule,
      screen.getByTestId('layer'),
    );
  });

  it('keeps one layer attached under StrictMode', () => {
    primaryPointer(true);
    const {setup, cleanup, Layer} = recorder();
    const view = render(
      <StrictMode>
        <Layer />
      </StrictMode>,
    );
    expect(setup.mock.calls.length - cleanup.mock.calls.length).toBe(1);
    view.unmount();
    expect(setup.mock.calls.length).toBe(cleanup.mock.calls.length);
  });

  it('runs nothing on the server', () => {
    primaryPointer(true);
    const {setup, Layer} = recorder();
    expect(renderToString(<Layer />)).toContain('data-testid="layer"');
    expect(setup).not.toHaveBeenCalled();
  });
});
