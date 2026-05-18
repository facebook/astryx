// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {renderHook, act} from '@testing-library/react';
import {useSpeechRecognition} from './useSpeechRecognition';
import {useXDSChatDictation} from './useXDSChatDictation';

// =============================================================================
// Mock SpeechRecognition
// =============================================================================

class MockSpeechRecognition {
  lang = '';
  continuous = false;
  interimResults = false;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onresult: ((event: unknown) => void) | null = null;
  onspeechstart: (() => void) | null = null;
  onspeechend: (() => void) | null = null;
  onerror: ((event: unknown) => void) | null = null;
  onnomatch: (() => void) | null = null;

  start = vi.fn(() => {
    this.onstart?.();
  });

  stop = vi.fn(() => {
    this.onend?.();
  });

  abort = vi.fn(() => {
    this.onend?.();
  });
}

let lastInstance: MockSpeechRecognition | null = null;

function MockSRConstructor() {
  const instance = new MockSpeechRecognition();
  lastInstance = instance;
  return instance;
}

// =============================================================================
// Setup / Teardown
// =============================================================================

let originalSR: unknown;

beforeEach(() => {
  lastInstance = null;
  originalSR = (window as unknown as Record<string, unknown>)
    .SpeechRecognition;
  (window as unknown as Record<string, unknown>).SpeechRecognition =
    MockSRConstructor;
});

afterEach(() => {
  if (originalSR === undefined) {
    delete (window as unknown as Record<string, unknown>).SpeechRecognition;
  } else {
    (window as unknown as Record<string, unknown>).SpeechRecognition =
      originalSR;
  }
});

// =============================================================================
// useSpeechRecognition
// =============================================================================

describe('useSpeechRecognition', () => {
  it('reports isSupported as false when SpeechRecognition is unavailable', () => {
    delete (window as unknown as Record<string, unknown>).SpeechRecognition;
    delete (window as unknown as Record<string, unknown>)
      .webkitSpeechRecognition;

    const {result} = renderHook(() => useSpeechRecognition());
    expect(result.current.isSupported).toBe(false);
    expect(result.current.isListening).toBe(false);
  });

  it('reports isSupported as true when SpeechRecognition is available', () => {
    const {result} = renderHook(() => useSpeechRecognition());
    expect(result.current.isSupported).toBe(true);
  });

  it('starts and sets isListening', () => {
    const {result} = renderHook(() => useSpeechRecognition());

    act(() => {
      result.current.start();
    });

    expect(result.current.isListening).toBe(true);
    expect(lastInstance?.start).toHaveBeenCalled();
  });

  it('stops and clears isListening', () => {
    const {result} = renderHook(() => useSpeechRecognition());

    act(() => {
      result.current.start();
    });
    expect(result.current.isListening).toBe(true);

    act(() => {
      result.current.stop();
    });
    expect(result.current.isListening).toBe(false);
  });

  it('toggle starts when not listening and stops when listening', () => {
    const {result} = renderHook(() => useSpeechRecognition());

    // Toggle on
    act(() => {
      result.current.toggle();
    });
    expect(result.current.isListening).toBe(true);

    // Toggle off
    act(() => {
      result.current.toggle();
    });
    expect(result.current.isListening).toBe(false);
  });

  it('abort immediately stops recognition', () => {
    const {result} = renderHook(() => useSpeechRecognition());

    act(() => {
      result.current.start();
    });
    expect(result.current.isListening).toBe(true);

    act(() => {
      result.current.abort();
    });
    expect(result.current.isListening).toBe(false);
    expect(lastInstance?.abort).toHaveBeenCalled();
  });

  it('calls onStart and onEnd callbacks', () => {
    const onStart = vi.fn();
    const onEnd = vi.fn();

    const {result} = renderHook(() =>
      useSpeechRecognition({onStart, onEnd}),
    );

    act(() => {
      result.current.start();
    });
    expect(onStart).toHaveBeenCalledOnce();

    act(() => {
      result.current.stop();
    });
    expect(onEnd).toHaveBeenCalledOnce();
  });

  it('handles result events with final transcript', () => {
    const onResult = vi.fn();
    const onTranscript = vi.fn();

    const {result} = renderHook(() =>
      useSpeechRecognition({onResult, onTranscript}),
    );

    act(() => {
      result.current.start();
    });

    // Simulate a final result
    act(() => {
      lastInstance?.onresult?.({
        resultIndex: 0,
        results: {
          length: 1,
          0: {
            isFinal: true,
            length: 1,
            0: {transcript: 'hello world'},
          },
        },
      });
    });

    expect(onResult).toHaveBeenCalledWith('hello world');
    expect(onTranscript).toHaveBeenCalledWith('hello world', true);
  });

  it('handles interim results and updates interimTranscript', () => {
    const onTranscript = vi.fn();

    const {result} = renderHook(() =>
      useSpeechRecognition({onTranscript}),
    );

    act(() => {
      result.current.start();
    });

    // Simulate an interim result
    act(() => {
      lastInstance?.onresult?.({
        resultIndex: 0,
        results: {
          length: 1,
          0: {
            isFinal: false,
            length: 1,
            0: {transcript: 'hel'},
          },
        },
      });
    });

    expect(result.current.interimTranscript).toBe('hel');
    expect(onTranscript).toHaveBeenCalledWith('hel', false);
  });

  it('cleans up recognition on unmount', () => {
    const {result, unmount} = renderHook(() => useSpeechRecognition());

    act(() => {
      result.current.start();
    });

    const instance = lastInstance;
    unmount();

    expect(instance?.abort).toHaveBeenCalled();
  });
});

// =============================================================================
// useXDSChatDictation
// =============================================================================

describe('useXDSChatDictation', () => {
  it('reports isSupported from speech recognition', () => {
    const {result} = renderHook(() => useXDSChatDictation());
    expect(result.current.isSupported).toBe(true);
  });

  it('includes volume, bands, rawBands in return', () => {
    const {result} = renderHook(() => useXDSChatDictation());
    expect(result.current.volume).toBe(0);
    expect(result.current.bands).toEqual([0, 0, 0, 0, 0]);
    expect(result.current.rawBands).toEqual([0, 0, 0, 0, 0]);
  });

  it('starts and sets isListening', () => {
    const {result} = renderHook(() => useXDSChatDictation());

    act(() => {
      result.current.start();
    });

    expect(result.current.isListening).toBe(true);
  });

  it('stops and clears isListening', () => {
    const {result} = renderHook(() => useXDSChatDictation());

    act(() => {
      result.current.start();
    });
    expect(result.current.isListening).toBe(true);

    act(() => {
      result.current.stop();
    });
    expect(result.current.isListening).toBe(false);
  });

  it('toggle starts and stops', () => {
    const {result} = renderHook(() => useXDSChatDictation());

    act(() => {
      result.current.toggle();
    });
    expect(result.current.isListening).toBe(true);

    act(() => {
      result.current.toggle();
    });
    expect(result.current.isListening).toBe(false);
  });

  it('forwards onStart and onEnd callbacks', () => {
    const onStart = vi.fn();
    const onEnd = vi.fn();

    const {result} = renderHook(() =>
      useXDSChatDictation({onStart, onEnd}),
    );

    act(() => {
      result.current.start();
    });
    expect(onStart).toHaveBeenCalledOnce();

    act(() => {
      result.current.stop();
    });
    expect(onEnd).toHaveBeenCalledOnce();
  });

  it('handles final transcript via onResult', () => {
    const onResult = vi.fn();

    const {result} = renderHook(() =>
      useXDSChatDictation({onResult}),
    );

    act(() => {
      result.current.start();
    });

    act(() => {
      lastInstance?.onresult?.({
        resultIndex: 0,
        results: {
          length: 1,
          0: {
            isFinal: true,
            length: 1,
            0: {transcript: 'hello world'},
          },
        },
      });
    });

    expect(onResult).toHaveBeenCalledWith('hello world');
  });

  it('abort immediately stops recognition', () => {
    const {result} = renderHook(() => useXDSChatDictation());

    act(() => {
      result.current.start();
    });

    act(() => {
      result.current.abort();
    });

    expect(result.current.isListening).toBe(false);
    expect(lastInstance?.abort).toHaveBeenCalled();
  });
});
