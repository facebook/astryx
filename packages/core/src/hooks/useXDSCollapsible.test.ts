/**
 * @file useXDSCollapsible.test.ts
 * @input Uses vitest, @testing-library/react, useXDSCollapsible
 * @output Unit tests for useXDSCollapsible hook
 * @position Testing; validates useXDSCollapsible.ts implementation
 *
 * SYNC: When useXDSCollapsible.ts changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {renderHook, act} from '@testing-library/react';
import {useXDSCollapsible} from './useXDSCollapsible';
import type {XDSCollapsibleConfig} from './useXDSCollapsible';

describe('useXDSCollapsible', () => {
  it('returns isOpen: false by default', () => {
    const {result} = renderHook(() => useXDSCollapsible());
    expect(result.current.isOpen).toBe(false);
    expect(result.current.onOpenChange).toBeInstanceOf(Function);
  });

  it('returns isOpen: false when called with empty options', () => {
    const {result} = renderHook(() => useXDSCollapsible({}));
    expect(result.current.isOpen).toBe(false);
  });

  it('initialIsOpen sets initial state', () => {
    const {result} = renderHook(() => useXDSCollapsible({initialIsOpen: true}));
    expect(result.current.isOpen).toBe(true);
  });

  it('initialIsOpen: false starts closed', () => {
    const {result} = renderHook(() =>
      useXDSCollapsible({initialIsOpen: false}),
    );
    expect(result.current.isOpen).toBe(false);
  });

  it('toggles state in uncontrolled mode', () => {
    const {result} = renderHook(() => useXDSCollapsible());

    act(() => {
      result.current.onOpenChange?.(true);
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.onOpenChange?.(false);
    });
    expect(result.current.isOpen).toBe(false);
  });

  it('onOpenChange fires when toggled in uncontrolled mode', () => {
    const onOpenChange = vi.fn();
    const {result} = renderHook(() => useXDSCollapsible({onOpenChange}));

    act(() => {
      result.current.onOpenChange?.(true);
    });

    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(onOpenChange).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.onOpenChange?.(false);
    });

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onOpenChange).toHaveBeenCalledTimes(2);
  });

  it('controlled mode uses isOpen prop', () => {
    const {result, rerender} = renderHook(
      ({isOpen}: {isOpen: boolean}) => useXDSCollapsible({isOpen}),
      {initialProps: {isOpen: false}},
    );

    expect(result.current.isOpen).toBe(false);

    rerender({isOpen: true});
    expect(result.current.isOpen).toBe(true);

    rerender({isOpen: false});
    expect(result.current.isOpen).toBe(false);
  });

  it('controlled mode does not update internal state', () => {
    const onOpenChange = vi.fn();
    const {result} = renderHook(() =>
      useXDSCollapsible({isOpen: false, onOpenChange}),
    );

    // Calling onOpenChange should fire the callback but not change isOpen
    // (since it's controlled externally)
    act(() => {
      result.current.onOpenChange?.(true);
    });

    expect(onOpenChange).toHaveBeenCalledWith(true);
    // isOpen should still be false because the controlled prop hasn't changed
    expect(result.current.isOpen).toBe(false);
  });

  it('controlled mode fires onOpenChange callback', () => {
    const onOpenChange = vi.fn();
    const {result} = renderHook(() =>
      useXDSCollapsible({isOpen: true, onOpenChange}),
    );

    act(() => {
      result.current.onOpenChange?.(false);
    });

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('config object is constructable manually (just a plain object)', () => {
    const config: XDSCollapsibleConfig = {
      isOpen: true,
      onOpenChange: vi.fn(),
    };

    expect(config.isOpen).toBe(true);
    config.onOpenChange?.(false);
    expect(config.onOpenChange).toHaveBeenCalledWith(false);
  });

  it('config object works with trigger', () => {
    const config: XDSCollapsibleConfig = {
      isOpen: false,
      trigger: 'Click me',
    };

    expect(config.isOpen).toBe(false);
    expect(config.trigger).toBe('Click me');
  });

  it('config object works with minimal fields', () => {
    const config: XDSCollapsibleConfig = {
      isOpen: false,
    };

    expect(config.isOpen).toBe(false);
    expect(config.onOpenChange).toBeUndefined();
    expect(config.trigger).toBeUndefined();
  });
});
