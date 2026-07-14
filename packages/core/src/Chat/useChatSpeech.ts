// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useChatSpeech.ts
 * @input Uses React hooks, browser SpeechSynthesis API
 * @output Exports useChatSpeech hook — pure utility for text-to-speech playback
 * @position Utility hook — framework-agnostic SpeechSynthesis wrapper
 *
 * Wraps the browser SpeechSynthesis API in a headless React hook, providing
 * speak/stop/pause/resume controls, speaking/paused state, and the list of
 * available voices. This is the voice-output counterpart to
 * useSpeechRecognition (voice input), completing a hands-free chat loop:
 * dictate -> LLM responds -> response spoken aloud.
 *
 * SpeechSynthesis has broader browser support than SpeechRecognition — it
 * works in Chrome, Edge, Safari, and Firefox with no flags.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Chat/index.ts (exports)
 */

import {useState, useCallback, useEffect, useMemo, useRef} from 'react';

// =============================================================================
// Types
// =============================================================================

export interface UseChatSpeechOptions {
  /** Preferred voice — matched against voice name or lang. @default system default */
  voice?: string;
  /** Speech rate, 0.5 to 2. @default 1 */
  rate?: number;
  /** Speech pitch, 0 to 2. @default 1 */
  pitch?: number;
  /** Playback volume, 0 to 1. @default 1 */
  volume?: number;
  /** Called when speech starts. */
  onStart?: () => void;
  /** Called when speech ends (naturally or via stop). */
  onEnd?: () => void;
  /** Called when synthesis errors. */
  onError?: (error: SpeechSynthesisErrorEvent) => void;
}

export interface UseChatSpeechReturn {
  /** Whether the browser supports SpeechSynthesis. */
  isSupported: boolean;
  /** Whether speech is currently playing. */
  isSpeaking: boolean;
  /** Whether speech is currently paused. */
  isPaused: boolean;
  /** Available voices (varies by OS/browser; may populate asynchronously). */
  voices: SpeechSynthesisVoice[];
  /** Speak text. Queues behind any in-progress utterance. */
  speak: (text: string) => void;
  /** Stop speaking immediately and clear the queue. */
  stop: () => void;
  /** Pause the current utterance. */
  pause: () => void;
  /** Resume a paused utterance. */
  resume: () => void;
}

// =============================================================================
// SpeechSynthesis access
// =============================================================================

type SpeechSynthesisUtteranceConstructor = new (
  text?: string,
) => SpeechSynthesisUtterance;

function getSynthesis(): SpeechSynthesis | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.speechSynthesis ?? null;
}

function getUtteranceCtor(): SpeechSynthesisUtteranceConstructor | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return (
    (
      window as unknown as {
        SpeechSynthesisUtterance?: SpeechSynthesisUtteranceConstructor;
      }
    ).SpeechSynthesisUtterance ?? null
  );
}

// =============================================================================
// Hook
// =============================================================================

export function useChatSpeech(
  options: UseChatSpeechOptions = {},
): UseChatSpeechReturn {
  const {
    voice,
    rate = 1,
    pitch = 1,
    volume = 1,
    onStart,
    onEnd,
    onError,
  } = options;

  const isSupported = useMemo(
    () => getSynthesis() != null && getUtteranceCtor() != null,
    [],
  );

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  // Read any voices already available at mount (some browsers populate
  // synchronously); the voiceschanged listener below fills in the rest.
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(
    () => getSynthesis()?.getVoices() ?? [],
  );

  const voicesRef = useRef<SpeechSynthesisVoice[]>(voices);
  voicesRef.current = voices;

  const callbacksRef = useRef({onStart, onEnd, onError});
  callbacksRef.current = {onStart, onEnd, onError};

  // Voices often arrive asynchronously — subscribe to voiceschanged.
  useEffect(() => {
    const synth = getSynthesis();
    if (!synth) {
      return;
    }
    const updateVoices = () => {
      setVoices(synth.getVoices());
    };
    synth.addEventListener?.('voiceschanged', updateVoices);
    return () => {
      synth.removeEventListener?.('voiceschanged', updateVoices);
    };
  }, []);

  // Cancel any in-flight speech on unmount.
  useEffect(() => {
    return () => {
      getSynthesis()?.cancel();
    };
  }, []);

  const speak = useCallback(
    (text: string) => {
      const synth = getSynthesis();
      const Utterance = getUtteranceCtor();
      if (!synth || !Utterance || !text) {
        return;
      }

      const utterance = new Utterance(text);
      const matchedVoice = voice
        ? voicesRef.current.find(v => v.name === voice || v.lang === voice)
        : undefined;
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
        callbacksRef.current.onStart?.();
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        callbacksRef.current.onEnd?.();
      };
      utterance.onerror = event => {
        setIsSpeaking(false);
        setIsPaused(false);
        callbacksRef.current.onError?.(event);
      };
      utterance.onpause = () => {
        setIsPaused(true);
      };
      utterance.onresume = () => {
        setIsPaused(false);
      };

      synth.speak(utterance);
    },
    [voice, rate, pitch, volume],
  );

  const stop = useCallback(() => {
    getSynthesis()?.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  const pause = useCallback(() => {
    const synth = getSynthesis();
    if (!synth) {
      return;
    }
    synth.pause();
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    const synth = getSynthesis();
    if (!synth) {
      return;
    }
    synth.resume();
    setIsPaused(false);
  }, []);

  return {
    isSupported,
    isSpeaking,
    isPaused,
    voices,
    speak,
    stop,
    pause,
    resume,
  };
}
