'use client';

/**
 * @file useStreamingText.ts
 * @input Uses React useState, useEffect, useRef
 * @output Exports useStreamingText hook for smooth text streaming
 * @position Core hook; smooths bursty streamed text into steady character reveal
 *
 * Decouples the arrival rate of streamed chunks from the display rate,
 * draining characters at a steady pace using requestAnimationFrame.
 * Advances on word/syntax boundaries to avoid slicing mid-markdown or
 * mid-word, preventing visual glitches when used with markdown renderers.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/hooks/index.ts (exports)
 * - /packages/core/src/hooks/useStreamingText.test.ts (tests)
 */

import {useEffect, useRef, useState} from 'react';

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

// Characters that are safe word/syntax boundaries for slicing
const BOUNDARY_PATTERN = /[\s,.;:!?)\]}>]/;

// Markdown syntax markers to avoid slicing inside.
const PARTIAL_SYNTAX_PATTERNS = [
  /\*{1,2}$/, // partial bold/italic: * or **
  /_{1,2}$/, // partial bold/italic: _ or __
  /~{1,2}$/, // partial strikethrough: ~ or ~~
  /`{1,3}$/, // partial inline code or fence
  /\[(?:[^\]]*)$/, // unclosed link text: [text
  /!\[(?:[^\]]*)$/, // unclosed image alt: ![alt
  /\]\([^)]*$/, // unclosed link url: ](url
];

const SPEED_CONFIG = {
  natural: {charsPerTick: 2, tickMs: 12},
  fast: {charsPerTick: 4, tickMs: 8},
  instant: {charsPerTick: Infinity, tickMs: 0},
} as const;

/**
 * Smooths bursty streamed text into a steady character-by-character reveal.
 *
 * Returns a string that grows steadily toward `targetText`. When `isStreaming`
 * is false, returns the full `targetText` immediately.
 *
 * The hook advances on word and syntax boundaries, avoiding slices inside
 * markdown markers like `**`, backticks, `[]()`, etc. This prevents visual
 * glitches when the output is rendered through a markdown parser.
 *
 * @example
 * ```
 * const displayed = useStreamingText(rawText, isStreaming);
 * return <XDSMarkdown>{displayed}</XDSMarkdown>;
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
  const {charsPerTick, tickMs} = SPEED_CONFIG[speed];

  const [displayedLen, setDisplayedLen] = useState(0);
  const targetRef = useRef(targetText);
  const displayedLenRef = useRef(0);
  const lastTickRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  // Keep target ref in sync
  useEffect(() => {
    targetRef.current = targetText;
  }, [targetText]);

  // Reset when target clears (new message)
  const targetLen = targetText.length;
  useEffect(() => {
    if (targetLen === 0) {
      displayedLenRef.current = 0;
      setDisplayedLen(0);
    }
  }, [targetLen]);

  // Animation loop
  useEffect(() => {
    if (!isStreaming || speed === 'instant') return;

    function tick(now: number) {
      const elapsed = now - lastTickRef.current;
      if (elapsed >= tickMs) {
        lastTickRef.current = now;
        const target = targetRef.current;
        const currentLen = displayedLenRef.current;

        if (currentLen < target.length) {
          // Scale chars with backlog to avoid falling behind
          const backlog = target.length - currentLen;
          const scaledChars =
            backlog > 200
              ? Math.max(charsPerTick, Math.ceil(backlog * 0.15))
              : backlog > 80
                ? Math.max(charsPerTick, Math.ceil(backlog * 0.08))
                : charsPerTick;

          let nextLen = Math.min(currentLen + scaledChars, target.length);

          // Snap to a word/punctuation boundary
          if (nextLen < target.length) {
            const searchWindow = target.slice(nextLen, nextLen + 12);
            const boundaryOffset = searchWindow.search(BOUNDARY_PATTERN);
            if (boundaryOffset >= 0 && boundaryOffset <= 8) {
              nextLen = nextLen + boundaryOffset + 1;
            }
          }

          nextLen = Math.min(nextLen, target.length);

          // Back up if we'd slice inside a markdown syntax marker
          const candidate = target.slice(0, nextLen);
          for (const pattern of PARTIAL_SYNTAX_PATTERNS) {
            const match = candidate.match(pattern);
            if (match && match.index != null) {
              nextLen = match.index;
              break;
            }
          }

          // Never go backwards
          nextLen = Math.max(nextLen, currentLen);

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
  }, [isStreaming, charsPerTick, tickMs, speed]);

  // Snap to full text when streaming ends
  useEffect(() => {
    if (!isStreaming && targetText.length > 0) {
      displayedLenRef.current = targetText.length;
      setDisplayedLen(targetText.length);
    }
  }, [isStreaming, targetText.length]);

  if (!isStreaming || speed === 'instant') {
    return targetText;
  }

  return targetText.slice(0, displayedLen);
}
