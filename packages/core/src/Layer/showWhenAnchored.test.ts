// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {showWhenAnchored} from './showWhenAnchored';

// A controllable fake — unlike the global jsdom polyfill (internal/test-utils),
// this one does NOT fire on observe(). Tests trigger it explicitly, so the
// "waits for a box" behavior can be distinguished from "shows immediately".
class ControllableResizeObserver {
  static instances: ControllableResizeObserver[] = [];
  callback: ResizeObserverCallback;
  observed: Element | null = null;
  isDisconnected = false;
  disconnect = vi.fn(() => {
    this.isDisconnected = true;
  });

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    ControllableResizeObserver.instances.push(this);
  }

  observe(target: Element) {
    this.observed = target;
  }

  unobserve = vi.fn();

  fire(width: number, height: number) {
    if (this.isDisconnected) {
      return;
    }
    this.callback(
      [
        {
          target: this.observed,
          contentRect: {width, height} as DOMRectReadOnly,
        } as ResizeObserverEntry,
      ],
      this,
    );
  }
}

let originalResizeObserver: typeof ResizeObserver;

beforeEach(() => {
  originalResizeObserver = window.ResizeObserver;
  ControllableResizeObserver.instances = [];
  vi.stubGlobal('ResizeObserver', ControllableResizeObserver);
});

afterEach(() => {
  window.ResizeObserver = originalResizeObserver;
});

/** A jsdom element whose getBoundingClientRect() is stubbed to a fixed size. */
function elementWithRect(width: number, height: number): HTMLElement {
  const el = document.createElement('button');
  el.getBoundingClientRect = () => ({width, height}) as unknown as DOMRect;
  return el;
}

describe('showWhenAnchored', () => {
  it('shows immediately when the anchor already has a layout box', () => {
    const show = vi.fn();
    const cleanup = showWhenAnchored(elementWithRect(44, 20), show);
    expect(show).toHaveBeenCalledTimes(1);
    expect(ControllableResizeObserver.instances).toHaveLength(0);
    cleanup();
  });

  it('shows immediately when null is passed (no anchor to wait on)', () => {
    const show = vi.fn();
    const cleanup = showWhenAnchored(null, show);
    expect(show).toHaveBeenCalledTimes(1);
    cleanup();
  });

  it('waits for the anchor to get a box before showing, when it has none', () => {
    const show = vi.fn();
    const anchor = elementWithRect(0, 0);
    const cleanup = showWhenAnchored(anchor, show);

    // Not shown yet — the trigger inside a <dialog> that hasn't gone modal
    // has no box, and is not a valid CSS anchor.
    expect(show).not.toHaveBeenCalled();
    expect(ControllableResizeObserver.instances).toHaveLength(1);

    // The dialog opens; the trigger gets a real box.
    ControllableResizeObserver.instances[0].fire(120, 32);

    expect(show).toHaveBeenCalledTimes(1);
    cleanup();
  });

  it('disconnects the observer once it has fired, so it does not fire again', () => {
    const show = vi.fn();
    const anchor = elementWithRect(0, 0);
    showWhenAnchored(anchor, show);
    const observer = ControllableResizeObserver.instances[0];

    observer.fire(120, 32);
    expect(observer.disconnect).toHaveBeenCalledTimes(1);

    // A later resize (e.g. the layout settling further) must not re-show.
    observer.fire(140, 32);
    expect(show).toHaveBeenCalledTimes(1);
  });

  it('ignores a resize entry that is still 0×0', () => {
    const show = vi.fn();
    const anchor = elementWithRect(0, 0);
    showWhenAnchored(anchor, show);
    const observer = ControllableResizeObserver.instances[0];

    observer.fire(0, 0);
    expect(show).not.toHaveBeenCalled();

    observer.fire(0, 20);
    expect(show).toHaveBeenCalledTimes(1);
  });

  it('the cleanup function disconnects a still-pending observer', () => {
    const show = vi.fn();
    const anchor = elementWithRect(0, 0);
    const cleanup = showWhenAnchored(anchor, show);
    const observer = ControllableResizeObserver.instances[0];

    cleanup();
    expect(observer.disconnect).toHaveBeenCalledTimes(1);

    // Firing after cleanup (e.g. a stale callback) must not call show.
    observer.fire(120, 32);
    expect(show).not.toHaveBeenCalled();
  });
});
