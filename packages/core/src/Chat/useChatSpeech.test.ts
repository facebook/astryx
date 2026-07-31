// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {renderHook, act} from '@testing-library/react';
import {useChatSpeech} from './useChatSpeech';

// =============================================================================
// Mock SpeechSynthesis + SpeechSynthesisUtterance
// =============================================================================

class MockUtterance {
  text: string;
  voice: unknown = null;
  rate = 1;
  pitch = 1;
  volume = 1;
  lang = '';
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onerror: ((event: unknown) => void) | null = null;
  onpause: (() => void) | null = null;
  onresume: (() => void) | null = null;

  constructor(text = '') {
    this.text = text;
  }
}

const mockVoices = [
  {
    name: 'Alex',
    lang: 'en-US',
    default: true,
    localService: true,
    voiceURI: 'Alex',
  },
  {
    name: 'Zira',
    lang: 'en-GB',
    default: false,
    localService: true,
    voiceURI: 'Zira',
  },
] as unknown as SpeechSynthesisVoice[];

let lastUtterance: MockUtterance | null = null;
let voicesChangedHandler: (() => void) | null = null;

const mockSynth = {
  speaking: false,
  paused: false,
  getVoices: vi.fn(() => mockVoices),
  speak: vi.fn((u: MockUtterance) => {
    lastUtterance = u;
    mockSynth.speaking = true;
    u.onstart?.();
  }),
  cancel: vi.fn(() => {
    mockSynth.speaking = false;
    mockSynth.paused = false;
  }),
  pause: vi.fn(() => {
    mockSynth.paused = true;
    lastUtterance?.onpause?.();
  }),
  resume: vi.fn(() => {
    mockSynth.paused = false;
    lastUtterance?.onresume?.();
  }),
  addEventListener: vi.fn((type: string, cb: () => void) => {
    if (type === 'voiceschanged') {
      voicesChangedHandler = cb;
    }
  }),
  removeEventListener: vi.fn(),
};

let originalSynth: unknown;
let originalUtterance: unknown;

beforeEach(() => {
  lastUtterance = null;
  voicesChangedHandler = null;
  mockSynth.speaking = false;
  mockSynth.paused = false;
  mockSynth.speak.mockClear();
  mockSynth.cancel.mockClear();
  mockSynth.pause.mockClear();
  mockSynth.resume.mockClear();

  const win = window as unknown as Record<string, unknown>;
  originalSynth = win.speechSynthesis;
  originalUtterance = win.SpeechSynthesisUtterance;
  win.speechSynthesis = mockSynth;
  win.SpeechSynthesisUtterance = MockUtterance;
});

afterEach(() => {
  const win = window as unknown as Record<string, unknown>;
  if (originalSynth === undefined) {
    delete win.speechSynthesis;
  } else {
    win.speechSynthesis = originalSynth;
  }
  if (originalUtterance === undefined) {
    delete win.SpeechSynthesisUtterance;
  } else {
    win.SpeechSynthesisUtterance = originalUtterance;
  }
});

// =============================================================================
// useChatSpeech
// =============================================================================

describe('useChatSpeech', () => {
  it('reports isSupported as false when SpeechSynthesis is unavailable', () => {
    const win = window as unknown as Record<string, unknown>;
    delete win.speechSynthesis;
    delete win.SpeechSynthesisUtterance;

    const {result} = renderHook(() => useChatSpeech());
    expect(result.current.isSupported).toBe(false);
    expect(result.current.isSpeaking).toBe(false);
  });

  it('reports isSupported as true when SpeechSynthesis is available', () => {
    const {result} = renderHook(() => useChatSpeech());
    expect(result.current.isSupported).toBe(true);
  });

  it('loads available voices', () => {
    const {result} = renderHook(() => useChatSpeech());
    expect(result.current.voices).toHaveLength(2);
    expect(result.current.voices[0].name).toBe('Alex');
  });

  it('updates voices when voiceschanged fires', () => {
    const {result} = renderHook(() => useChatSpeech());
    act(() => {
      voicesChangedHandler?.();
    });
    expect(mockSynth.getVoices).toHaveBeenCalled();
    expect(result.current.voices).toHaveLength(2);
  });

  it('speak sets isSpeaking and calls synthesis.speak', () => {
    const {result} = renderHook(() => useChatSpeech());

    act(() => {
      result.current.speak('hello world');
    });

    expect(mockSynth.speak).toHaveBeenCalledOnce();
    expect(result.current.isSpeaking).toBe(true);
    expect(lastUtterance?.text).toBe('hello world');
  });

  it('does nothing when speaking empty text', () => {
    const {result} = renderHook(() => useChatSpeech());

    act(() => {
      result.current.speak('');
    });

    expect(mockSynth.speak).not.toHaveBeenCalled();
    expect(result.current.isSpeaking).toBe(false);
  });

  it('stop cancels speech and clears isSpeaking', () => {
    const {result} = renderHook(() => useChatSpeech());

    act(() => {
      result.current.speak('hello');
    });
    expect(result.current.isSpeaking).toBe(true);

    act(() => {
      result.current.stop();
    });
    expect(mockSynth.cancel).toHaveBeenCalled();
    expect(result.current.isSpeaking).toBe(false);
  });

  it('clears isSpeaking when the utterance ends naturally', () => {
    const {result} = renderHook(() => useChatSpeech());

    act(() => {
      result.current.speak('hello');
    });
    expect(result.current.isSpeaking).toBe(true);

    act(() => {
      lastUtterance?.onend?.();
    });
    expect(result.current.isSpeaking).toBe(false);
  });

  it('forwards onStart and onEnd callbacks', () => {
    const onStart = vi.fn();
    const onEnd = vi.fn();

    const {result} = renderHook(() => useChatSpeech({onStart, onEnd}));

    act(() => {
      result.current.speak('hi');
    });
    expect(onStart).toHaveBeenCalledOnce();

    act(() => {
      lastUtterance?.onend?.();
    });
    expect(onEnd).toHaveBeenCalledOnce();
  });

  it('forwards onError and clears speaking state on error', () => {
    const onError = vi.fn();
    const {result} = renderHook(() => useChatSpeech({onError}));

    act(() => {
      result.current.speak('hi');
    });
    act(() => {
      lastUtterance?.onerror?.({error: 'synthesis-failed'});
    });

    expect(onError).toHaveBeenCalledWith({error: 'synthesis-failed'});
    expect(result.current.isSpeaking).toBe(false);
  });

  it('applies rate, pitch, volume, and matched voice to the utterance', () => {
    const {result} = renderHook(() =>
      useChatSpeech({rate: 1.5, pitch: 0.8, volume: 0.5, voice: 'Zira'}),
    );

    act(() => {
      result.current.speak('configured');
    });

    expect(lastUtterance?.rate).toBe(1.5);
    expect(lastUtterance?.pitch).toBe(0.8);
    expect(lastUtterance?.volume).toBe(0.5);
    expect((lastUtterance?.voice as SpeechSynthesisVoice)?.name).toBe('Zira');
  });

  it('pause and resume toggle isPaused', () => {
    const {result} = renderHook(() => useChatSpeech());

    act(() => {
      result.current.speak('hi');
    });
    act(() => {
      result.current.pause();
    });
    expect(mockSynth.pause).toHaveBeenCalled();
    expect(result.current.isPaused).toBe(true);

    act(() => {
      result.current.resume();
    });
    expect(mockSynth.resume).toHaveBeenCalled();
    expect(result.current.isPaused).toBe(false);
  });

  it('cancels speech on unmount', () => {
    const {result, unmount} = renderHook(() => useChatSpeech());

    act(() => {
      result.current.speak('hi');
    });

    unmount();
    expect(mockSynth.cancel).toHaveBeenCalled();
  });
});
