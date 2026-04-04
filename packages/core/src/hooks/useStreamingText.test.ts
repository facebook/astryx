import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {renderHook, act} from '@testing-library/react';
import {useStreamingText} from './useStreamingText';

describe('useStreamingText', () => {
  let rafCallbacks: Array<(time: number) => void>;
  let originalRAF: typeof requestAnimationFrame;
  let originalCAF: typeof cancelAnimationFrame;

  beforeEach(() => {
    rafCallbacks = [];
    originalRAF = globalThis.requestAnimationFrame;
    originalCAF = globalThis.cancelAnimationFrame;
    globalThis.requestAnimationFrame = vi.fn((cb) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    }) as any;
    globalThis.cancelAnimationFrame = vi.fn();
  });

  afterEach(() => {
    globalThis.requestAnimationFrame = originalRAF;
    globalThis.cancelAnimationFrame = originalCAF;
  });

  it('returns full text when not streaming', () => {
    const {result} = renderHook(() =>
      useStreamingText('Hello world', false),
    );
    expect(result.current).toBe('Hello world');
  });

  it('returns full text with instant speed', () => {
    const {result} = renderHook(() =>
      useStreamingText('Hello world', true, {speed: 'instant'}),
    );
    expect(result.current).toBe('Hello world');
  });

  it('starts with empty string when streaming', () => {
    const {result} = renderHook(() =>
      useStreamingText('Hello world', true),
    );
    expect(result.current).toBe('');
  });

  it('snaps to full text when streaming ends', () => {
    const {result, rerender} = renderHook(
      ({text, streaming}) => useStreamingText(text, streaming),
      {initialProps: {text: 'Hello world', streaming: true}},
    );

    expect(result.current).toBe('');

    // Stop streaming
    rerender({text: 'Hello world', streaming: false});
    expect(result.current).toBe('Hello world');
  });

  it('resets when target text clears', () => {
    const {result, rerender} = renderHook(
      ({text, streaming}) => useStreamingText(text, streaming),
      {initialProps: {text: 'Hello', streaming: false}},
    );

    expect(result.current).toBe('Hello');

    // Clear text (new message)
    rerender({text: '', streaming: true});
    expect(result.current).toBe('');
  });

  it('progressively reveals text through animation frames', () => {
    const {result} = renderHook(() =>
      useStreamingText('Hello, world! This is a test.', true),
    );

    expect(result.current).toBe('');

    // Fire animation frames
    let lastLen = 0;
    for (let i = 0; i < 20; i++) {
      if (rafCallbacks.length > 0) {
        const cb = rafCallbacks.pop()!;
        act(() => cb(performance.now() + i * 20));
      }
      expect(result.current.length).toBeGreaterThanOrEqual(lastLen);
      lastLen = result.current.length;
    }

    expect(result.current.length).toBeGreaterThan(0);
  });
});
