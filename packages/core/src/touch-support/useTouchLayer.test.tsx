// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useTouchLayer.test.tsx
 * @input useTouchLayer, the touch-support registry, and React's client and
 *   server renderers
 * @output Proves the one-element layer lifecycle: no setup without the module;
 *   setup once with the module and the element; setup after an install that
 *   comes after the first render, with no remount; a re-render does not set up
 *   again; a new element moves the layer; cleanup on unmount; balanced under
 *   StrictMode; nothing on the server
 * @position Unit tests of packages/core/src/touch-support/useTouchLayer.ts
 */

import {StrictMode, useRef} from 'react';
import {act, render, screen} from '@testing-library/react';
import {renderToString} from 'react-dom/server';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {touchModule} from './touchModule';
import {
  installTouchModule,
  resetTouchSupportForTests,
} from './touchSupportRegistry';
import {useTouchLayer} from './useTouchLayer';

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
  resetTouchSupportForTests();
});

describe('useTouchLayer', () => {
  it('sets nothing up without the module', () => {
    const {setup, Layer} = recorder();
    const view = render(<Layer />);
    view.rerender(<Layer />);
    expect(setup).not.toHaveBeenCalled();
  });

  it('sets up once with the module and the element, and cleans up on unmount', () => {
    installTouchModule(touchModule);
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

  it('sets up after an install that comes after the first render, with no remount', () => {
    const {setup, Layer} = recorder();
    render(<Layer />);
    const element = screen.getByTestId('layer');
    expect(setup).not.toHaveBeenCalled();
    act(() => {
      installTouchModule(touchModule);
    });
    expect(screen.getByTestId('layer')).toBe(element);
    expect(setup).toHaveBeenCalledTimes(1);
    expect(setup).toHaveBeenCalledWith(touchModule, element);
  });

  it('moves to a new element: the old one cleans up, the new one sets up', () => {
    installTouchModule(touchModule);
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
    installTouchModule(touchModule);
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
    installTouchModule(touchModule);
    const {setup, Layer} = recorder();
    expect(renderToString(<Layer />)).toContain('data-testid="layer"');
    expect(setup).not.toHaveBeenCalled();
  });
});
