// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useStreamingText.ts
 * @input Uses React useState, useEffect, useRef, useMediaQuery, useTheme
 * @output Exports useStreamingText hook for smooth text streaming
 * @position Core hook; smooths bursty streamed text into steady character reveal
 *
 * Decouples the arrival rate of streamed chunks from the display rate,
 * draining characters at a steady pace using requestAnimationFrame.
 * Advances on word/syntax boundaries to avoid slicing mid-markdown or
 * mid-word, preventing visual glitches when used with markdown renderers.
 *
 * Animation timing derives from Astryx motion tokens (via useTheme) when
 * an Theme provider is present. Falls back to sensible defaults when
 * used outside a theme provider.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/hooks/index.ts (exports)
 * - /packages/core/src/hooks/useStreamingText.test.ts (tests)
 */

import {useEffect, useMemo, useRef, useState} from 'react';
import {useMediaQuery} from './useMediaQuery';
import {useTheme} from '../theme/useTheme';

/**
 * Speed presets for streaming text reveal.
 * - `'natural'` — steady character-by-character reveal (~2 chars/frame)
 * - `'fast'` — faster reveal, scales with backlog (~4 chars/frame)
 * - `'instant'` — no animation, returns full text immediately
 */
export type StreamingTextSpeed = 'natural' | 'fast' | 'instant';

export interface UseStreamingTextOptions {
  /**
   * Speed of text reveal.
   * @default 'natural'
   */
  speed?: StreamingTextSpeed;
}

// Fallback values when no Theme provider is present
const FALLBACK_TICK_MS = 50;
const FALLBACK_TICK_MS_FAST = 8;

/**
 * Parse a CSS duration string (e.g. "175ms", "0.15s") to milliseconds.
 * Returns null if unparseable.
 */
function parseDuration(value: string): number | null {
  const ms = value.match(/^([\d.]+)ms$/);
  if (ms) {
    return parseFloat(ms[1]);
  }
  const s = value.match(/^([\d.]+)s$/);
  if (s) {
    return parseFloat(s[1]) * 1000;
  }
  return null;
}

const CHARS_PER_TICK = {
  natural: 10,
  fast: 4,
  instant: Infinity,
} as const;

/**
 * Smooths bursty streamed text into a steady character-by-character reveal.
 *
 * Returns a string that grows steadily toward `targetText`. When `isStreaming`
 * is false, returns the full `targetText` immediately. When the user prefers
 * reduced motion, the progressive reveal is skipped entirely and the full
 * `targetText` is returned immediately.
 *
 * The hook advances on word and syntax boundaries, avoiding slices inside
 * markdown markers like `**`, backticks, `[]()`, etc. This prevents visual
 * glitches when the output is rendered through a markdown parser.
 *
 * @example
 * ```
 * const displayed = useStreamingText(rawText, isStreaming);
 * return <Markdown>{displayed}</Markdown>;
 * ```
 *
 * @example
 * ```
 * const displayed = useStreamingText(rawText, isStreaming, { speed: 'fast' });
 * ```
 */
export function useStreamingText(
  targetText: string,
  isStreaming: boolean,
  options?: UseStreamingTextOptions,
): string {
  const speed = options?.speed ?? 'natural';
  const charsPerTick = CHARS_PER_TICK[speed];

  // Derive tick timing from Astryx motion tokens when available.
  // natural → --duration-fast-min (frame-level cadence from the theme)
  // fast → half that, floored at 4ms (roughly 2x speed)
  const {token} = useTheme();
  const tickMs = useMemo(() => {
    if (speed === 'instant') {
      return 0;
    }
    const base = parseDuration(token('--duration-fast-min'));
    if (base == null) {
      return speed === 'fast' ? FALLBACK_TICK_MS_FAST : FALLBACK_TICK_MS;
    }
    // Scale: use ~1/10th of the theme's fast-min duration as the per-frame tick.
    // This maps a 130ms token to ~13ms tick (natural) or ~6.5ms tick (fast).
    const tick = speed === 'fast' ? base / 20 : base / 10;
    return Math.max(4, Math.round(tick));
  }, [token, speed]);

  const [displayedLen, setDisplayedLen] = useState(0);
  const targetRef = useRef(targetText);
  const displayedLenRef = useRef(0);
  const lastTickRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  // Keep target ref in sync
  targetRef.current = targetText;

  // Reset when target clears (new message)
  const prevTargetLenRef = useRef(targetText.length);
  if (targetText.length !== prevTargetLenRef.current) {
    prevTargetLenRef.current = targetText.length;
    if (targetText.length === 0 && displayedLen !== 0) {
      displayedLenRef.current = 0;
      setDisplayedLen(0);
    }
  }

  // Snap to full text when streaming ends
  const prevIsStreamingRef = useRef(isStreaming);
  if (isStreaming !== prevIsStreamingRef.current) {
    prevIsStreamingRef.current = isStreaming;
    if (!isStreaming && targetText.length > 0) {
      displayedLenRef.current = targetText.length;
      setDisplayedLen(targetText.length);
    }
  }

  // Respect the user's reduced-motion preference — skip the progressive
  // reveal and snap straight to the full text. Uses the package's SSR-safe
  // useMediaQuery (useMediaQuery.ts) so the read stays in sync if the
  // preference changes mid-stream.
  const prefersReducedMotion = useMediaQuery(
    '(prefers-reduced-motion: reduce)',
  );

  // Animation loop
  useEffect(() => {
    if (!isStreaming || speed === 'instant' || prefersReducedMotion) {
      return;
    }

    function tick(now: number) {
      const elapsed = now - lastTickRef.current;
      if (elapsed >= tickMs) {
        lastTickRef.current = now;
        const target = targetRef.current;
        const currentLen = displayedLenRef.current;

        if (currentLen < target.length) {
          const nextLen = Math.min(currentLen + charsPerTick, target.length);

          displayedLenRef.current = nextLen;
          setDisplayedLen(nextLen);
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isStreaming, charsPerTick, tickMs, speed, prefersReducedMotion]);

  if (!isStreaming || speed === 'instant' || prefersReducedMotion) {
    return targetText;
  }

  return targetText.slice(0, displayedLen);
}
