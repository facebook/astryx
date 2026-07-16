// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';

describe('sharedResizeObserver', () => {
  let mockObserve: ReturnType<typeof vi.fn>;
  let mockUnobserve: ReturnType<typeof vi.fn>;
  let mockDisconnect: ReturnType<typeof vi.fn>;
  let capturedCallback: ResizeObserverCallback;
  let constructorCalls: number;

  beforeEach(() => {
    mockObserve = vi.fn();
    mockUnobserve = vi.fn();
    mockDisconnect = vi.fn();
    constructorCalls = 0;

    global.ResizeObserver = vi.fn(function (cb: ResizeObserverCallback) {
      constructorCalls++;
      capturedCallback = cb;
      return {
        observe: mockObserve,
        unobserve: mockUnobserve,
        disconnect: mockDisconnect,
      };
    }) as unknown as typeof ResizeObserver;
  });

  afterEach(() => {
    vi.resetModules();
  });

  it('creates a single ResizeObserver for multiple elements', async () => {
    const {observeResize, unobserveResize} =
      await import('./sharedResizeObserver');

    const el1 = document.createElement('div');
    const el2 = document.createElement('div');

    observeResize(el1, vi.fn());
    observeResize(el2, vi.fn());

    expect(constructorCalls).toBe(1);
    expect(mockObserve).toHaveBeenCalledTimes(2);
    expect(mockObserve).toHaveBeenCalledWith(el1);
    expect(mockObserve).toHaveBeenCalledWith(el2);

    unobserveResize(el1);
    unobserveResize(el2);
  });

  it('fires callback synchronously on registration', async () => {
    const {observeResize, unobserveResize} =
      await import('./sharedResizeObserver');

    const el = document.createElement('div');
    const cb = vi.fn();

    observeResize(el, cb);

    // Callback should have fired once immediately with a synthetic entry
    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenCalledWith(expect.objectContaining({target: el}));

    unobserveResize(el);
  });

  it('dispatches resize entries to the correct callbacks', async () => {
    const {observeResize, unobserveResize} =
      await import('./sharedResizeObserver');

    const el1 = document.createElement('div');
    const el2 = document.createElement('div');
    const cb1 = vi.fn();
    const cb2 = vi.fn();

    observeResize(el1, cb1);
    observeResize(el2, cb2);

    // Reset counts from the initial synchronous fire
    cb1.mockClear();
    cb2.mockClear();

    // Simulate observer firing for el1 only
    capturedCallback(
      [{target: el1} as unknown as ResizeObserverEntry],
      {} as ResizeObserver,
    );

    expect(cb1).toHaveBeenCalledTimes(1);
    expect(cb2).not.toHaveBeenCalled();

    // Simulate observer firing for el2
    capturedCallback(
      [{target: el2} as unknown as ResizeObserverEntry],
      {} as ResizeObserver,
    );

    expect(cb2).toHaveBeenCalledTimes(1);

    unobserveResize(el1);
    unobserveResize(el2);
  });

  it('destroys the observer when the last element is unobserved', async () => {
    const {observeResize, unobserveResize} =
      await import('./sharedResizeObserver');

    const el1 = document.createElement('div');
    const el2 = document.createElement('div');

    observeResize(el1, vi.fn());
    observeResize(el2, vi.fn());

    unobserveResize(el1);
    expect(mockDisconnect).not.toHaveBeenCalled();

    unobserveResize(el2);
    expect(mockDisconnect).toHaveBeenCalledTimes(1);
  });

  it('recreates observer after full teardown', async () => {
    const {observeResize, unobserveResize} =
      await import('./sharedResizeObserver');

    const el1 = document.createElement('div');
    observeResize(el1, vi.fn());
    unobserveResize(el1);
    expect(constructorCalls).toBe(1);

    const el2 = document.createElement('div');
    observeResize(el2, vi.fn());
    expect(constructorCalls).toBe(2);

    unobserveResize(el2);
  });

  it('replaces callback when same element is observed twice', async () => {
    const {observeResize, unobserveResize} =
      await import('./sharedResizeObserver');

    const el = document.createElement('div');
    const cb1 = vi.fn();
    const cb2 = vi.fn();

    observeResize(el, cb1);
    cb1.mockClear();

    observeResize(el, cb2);

    capturedCallback(
      [{target: el} as unknown as ResizeObserverEntry],
      {} as ResizeObserver,
    );

    // Only the latest callback fires for subsequent resizes
    expect(cb1).not.toHaveBeenCalled();
    // cb2: initial fire (1) + observer fire (1) = but we only check the observer fire
    // cb2 was called once on registration, then once from capturedCallback
    expect(cb2).toHaveBeenCalledTimes(2);

    unobserveResize(el);
  });
});
