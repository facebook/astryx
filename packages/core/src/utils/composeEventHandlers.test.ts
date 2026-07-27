// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it, vi} from 'vitest';
import type {SyntheticEvent} from 'react';
import {composeEventHandlers} from './composeEventHandlers';

function fakeEvent(): SyntheticEvent {
  const event = {
    defaultPrevented: false,
    preventDefault() {
      event.defaultPrevented = true;
    },
  };
  return event as unknown as SyntheticEvent;
}

describe('composeEventHandlers', () => {
  it('calls every handler in argument order', () => {
    const calls: string[] = [];
    const composed = composeEventHandlers(
      () => calls.push('first'),
      () => calls.push('second'),
    );
    composed(fakeEvent());
    expect(calls).toEqual(['first', 'second']);
  });

  it('skips undefined handlers', () => {
    const handler = vi.fn();
    const composed = composeEventHandlers(undefined, handler, undefined);
    composed(fakeEvent());
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('passes the same event to each handler', () => {
    const event = fakeEvent();
    const a = vi.fn();
    const b = vi.fn();
    composeEventHandlers(a, b)(event);
    expect(a).toHaveBeenCalledWith(event);
    expect(b).toHaveBeenCalledWith(event);
  });

  it('stops after a handler prevents default', () => {
    const first = vi.fn((e: SyntheticEvent) => e.preventDefault());
    const second = vi.fn();
    composeEventHandlers(first, second)(fakeEvent());
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).not.toHaveBeenCalled();
  });

  it('lets a consumer handler opt out of later behavior (consumer-first order)', () => {
    const consumer = vi.fn((e: SyntheticEvent) => e.preventDefault());
    const ownBehavior = vi.fn();
    composeEventHandlers(consumer, ownBehavior)(fakeEvent());
    expect(ownBehavior).not.toHaveBeenCalled();
  });

  it('runs later handlers when default is not prevented', () => {
    const consumer = vi.fn();
    const ownBehavior = vi.fn();
    composeEventHandlers(consumer, ownBehavior)(fakeEvent());
    expect(ownBehavior).toHaveBeenCalledTimes(1);
  });

  it('returns a no-op-safe function when all handlers are undefined', () => {
    expect(() =>
      composeEventHandlers(undefined, undefined)(fakeEvent()),
    ).not.toThrow();
  });
});
