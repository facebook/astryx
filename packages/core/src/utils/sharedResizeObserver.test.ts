import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';

// We need to test the module in isolation, so we re-import fresh each test.
// The module has module-level state (the singleton observer).

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

    global.ResizeObserver = vi.fn((cb: ResizeObserverCallback) => {
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
    const {observeResize, unobserveResize} = await import(
      './sharedResizeObserver'
    );

    const el1 = document.createElement('div');
    const el2 = document.createElement('div');
    const cb1 = vi.fn();
    const cb2 = vi.fn();

    observeResize(el1, cb1);
    observeResize(el2, cb2);

    // Only one ResizeObserver created
    expect(constructorCalls).toBe(1);
    // Both elements observed
    expect(mockObserve).toHaveBeenCalledTimes(2);
    expect(mockObserve).toHaveBeenCalledWith(el1);
    expect(mockObserve).toHaveBeenCalledWith(el2);

    unobserveResize(el1);
    unobserveResize(el2);
  });

  it('dispatches entries to the correct callbacks', async () => {
    const {observeResize, unobserveResize} = await import(
      './sharedResizeObserver'
    );

    const el1 = document.createElement('div');
    const el2 = document.createElement('div');
    const cb1 = vi.fn();
    const cb2 = vi.fn();

    observeResize(el1, cb1);
    observeResize(el2, cb2);

    // Simulate observer firing for el1 only
    const fakeEntry1 = {target: el1} as ResizeObserverEntry;
    capturedCallback([fakeEntry1], {} as ResizeObserver);

    expect(cb1).toHaveBeenCalledTimes(1);
    expect(cb1).toHaveBeenCalledWith(fakeEntry1);
    expect(cb2).not.toHaveBeenCalled();

    // Simulate observer firing for el2
    const fakeEntry2 = {target: el2} as ResizeObserverEntry;
    capturedCallback([fakeEntry2], {} as ResizeObserver);

    expect(cb2).toHaveBeenCalledTimes(1);
    expect(cb2).toHaveBeenCalledWith(fakeEntry2);

    unobserveResize(el1);
    unobserveResize(el2);
  });

  it('destroys the observer when the last element is unobserved', async () => {
    const {observeResize, unobserveResize} = await import(
      './sharedResizeObserver'
    );

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
    const {observeResize, unobserveResize} = await import(
      './sharedResizeObserver'
    );

    const el1 = document.createElement('div');
    observeResize(el1, vi.fn());
    unobserveResize(el1);
    expect(constructorCalls).toBe(1);

    // New observation after teardown → new observer
    const el2 = document.createElement('div');
    observeResize(el2, vi.fn());
    expect(constructorCalls).toBe(2);

    unobserveResize(el2);
  });

  it('replaces callback when same element is observed twice', async () => {
    const {observeResize, unobserveResize} = await import(
      './sharedResizeObserver'
    );

    const el = document.createElement('div');
    const cb1 = vi.fn();
    const cb2 = vi.fn();

    observeResize(el, cb1);
    observeResize(el, cb2);

    const fakeEntry = {target: el} as ResizeObserverEntry;
    capturedCallback([fakeEntry], {} as ResizeObserver);

    // Only the latest callback fires
    expect(cb1).not.toHaveBeenCalled();
    expect(cb2).toHaveBeenCalledTimes(1);

    unobserveResize(el);
  });
});
