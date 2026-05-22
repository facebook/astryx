// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {renderHook, act} from '@testing-library/react';
import {useXDSStreamingText} from './useXDSStreamingText';

describe('useXDSStreamingText', () => {
  let rafCallbacks: Array<(time: number) => void>;
  let originalRAF: typeof requestAnimationFrame;
  let originalCAF: typeof cancelAnimationFrame;

  beforeEach(() => {
    rafCallbacks = [];
    originalRAF = globalThis.requestAnimationFrame;
    originalCAF = globalThis.cancelAnimationFrame;
    globalThis.requestAnimationFrame = vi.fn(cb => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    }) as unknown as typeof requestAnimationFrame;
    globalThis.cancelAnimationFrame = vi.fn();

    // Mock matchMedia for useXDSTheme → useMediaQuery
    if (!window.matchMedia) {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });
    }
  });

  afterEach(() => {
    globalThis.requestAnimationFrame = originalRAF;
    globalThis.cancelAnimationFrame = originalCAF;
  });

  it('returns full text when not streaming', () => {
    const {result} = renderHook(() =>
      useXDSStreamingText('Hello world', false),
    );
    expect(result.current.text).toBe('Hello world');
  });

  it('returns full text with instant speed', () => {
    const {result} = renderHook(() =>
      useXDSStreamingText('Hello world', true, {speed: 'instant'}),
    );
    expect(result.current.text).toBe('Hello world');
  });

  it('starts with empty string when streaming', () => {
    const {result} = renderHook(() => useXDSStreamingText('Hello world', true));
    expect(result.current.text).toBe('');
  });

  it('snaps to full text when streaming ends', () => {
    const {result, rerender} = renderHook(
      ({text, streaming}) => useXDSStreamingText(text, streaming),
      {initialProps: {text: 'Hello world', streaming: true}},
    );

    expect(result.current.text).toBe('');

    // Stop streaming
    rerender({text: 'Hello world', streaming: false});
    expect(result.current.text).toBe('Hello world');
  });

  it('resets when target text clears', () => {
    const {result, rerender} = renderHook(
      ({text, streaming}) => useXDSStreamingText(text, streaming),
      {initialProps: {text: 'Hello', streaming: false}},
    );

    expect(result.current.text).toBe('Hello');

    // Clear text (new message)
    rerender({text: '', streaming: true});
    expect(result.current.text).toBe('');
  });

  it('progressively reveals text through animation frames', () => {
    const {result} = renderHook(() =>
      useXDSStreamingText('Hello, world! This is a test.', true),
    );

    expect(result.current.text).toBe('');

    // Fire animation frames
    let lastLen = 0;
    for (let i = 0; i < 20; i++) {
      if (rafCallbacks.length > 0) {
        const cb = rafCallbacks.pop()!;
        act(() => cb(performance.now() + i * 20));
      }
      expect(result.current.text.length).toBeGreaterThanOrEqual(lastLen);
      lastLen = result.current.text.length;
    }

    expect(result.current.text.length).toBeGreaterThan(0);
  });

  it('advances monotonically without stalls or backwards jumps', () => {
    const targetText =
      'Hello **world**, this is `code` and [a link](http://example.com).';
    const {result} = renderHook(() => useXDSStreamingText(targetText, true));

    expect(result.current.text).toBe('');

    // Fire many animation frames — the revealed length should only increase
    const lengths: number[] = [0];
    for (let i = 0; i < 50; i++) {
      if (rafCallbacks.length > 0) {
        const cb = rafCallbacks.pop()!;
        act(() => cb(performance.now() + i * 20));
      }
      const len = result.current.text.length;
      expect(len).toBeGreaterThanOrEqual(lengths[lengths.length - 1]);
      lengths.push(len);
    }

    // Should have made progress (not stuck at 0)
    expect(lengths[lengths.length - 1]).toBeGreaterThan(0);

    // Should never have gone backwards
    for (let i = 1; i < lengths.length; i++) {
      expect(lengths[i]).toBeGreaterThanOrEqual(lengths[i - 1]);
    }
  });

  it('does not stall on markdown syntax characters', () => {
    // Text with lots of markdown syntax that previously caused stalls
    const targetText =
      '- **bold** and *italic* with `code` and [link](url) and ~~strike~~';
    const {result} = renderHook(() => useXDSStreamingText(targetText, true));

    // Fire enough frames to drain the entire text
    for (let i = 0; i < 100; i++) {
      if (rafCallbacks.length > 0) {
        const cb = rafCallbacks.pop()!;
        act(() => cb(performance.now() + i * 60));
      }
    }

    // With enough frames and time elapsed, should have revealed everything
    // (or close to it — the hook drains charsPerTick per tickMs)
    expect(result.current.text.length).toBeGreaterThan(targetText.length * 0.5);
  });

  it('returns boundary that lags behind displayed text', () => {
    const {result} = renderHook(() =>
      useXDSStreamingText('Hello, world! This is a test.', true),
    );

    expect(result.current.text).toBe('');
    expect(result.current.boundary).toBe(0);

    // Fire animation frames — boundary should always be < text.length
    // (meaning there IS new content to animate) until text stops growing.
    let sawNewContent = false;
    for (let i = 0; i < 20; i++) {
      if (rafCallbacks.length > 0) {
        const cb = rafCallbacks.pop()!;
        act(() => cb(performance.now() + i * 60));
      }
      const {text, boundary} = result.current;
      // Boundary must never exceed text length
      expect(boundary).toBeLessThanOrEqual(text.length);
      // Boundary must be >= 0
      expect(boundary).toBeGreaterThanOrEqual(0);
      if (text.length > 0 && boundary < text.length) {
        sawNewContent = true;
      }
    }
    // At some point we should have seen boundary < text (new content exists)
    expect(sawNewContent).toBe(true);
  });

  it('boundary equals text length when not streaming', () => {
    const {result} = renderHook(() =>
      useXDSStreamingText('Hello world', false),
    );
    expect(result.current.boundary).toBe(result.current.text.length);
  });
});
