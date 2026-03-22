'use client';

/**
 * @file useTruncation.ts
 * @input Uses React hooks, ResizeObserver
 * @output Exports useTruncation hook for detecting text overflow
 * @position Hook; consumed by XDSText.tsx, XDSHeading.tsx
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Text/Text.doc.mjs
 */


import {useCallback, useRef, useState, type RefCallback} from 'react';

export interface UseTruncationOptions {
  /**
   * Maximum number of lines before truncation.
   * 0 = no truncation, hook returns isTruncated: false
   */
  maxLines: number;
}

export interface UseTruncationReturn {
  /**
   * Ref callback to attach to the text element
   */
  ref: RefCallback<HTMLElement>;

  /**
   * Whether the text is currently truncated (overflowing)
   */
  isTruncated: boolean;

  /**
   * Full text content for tooltip display
   */
  fullText: string;
}

/**
 * Hook for detecting text overflow/truncation.
 *
 * Uses ResizeObserver for efficient detection when content or container changes.
 * - Single-line: compares scrollWidth > offsetWidth
 * - Multi-line: compares scrollHeight > offsetHeight
 *
 * @example
 * ```
 * const truncation = useTruncation({ maxLines: 2 });
 *
 * <div ref={truncation.ref} style={{ WebkitLineClamp: 2 }}>
 *   {text}
 * </div>
 *
 * {truncation.isTruncated && <Tooltip>{truncation.fullText}</Tooltip>}
 * ```
 */
export function useTruncation(
  options: UseTruncationOptions,
): UseTruncationReturn {
  const {maxLines} = options;
  const [isTruncated, setIsTruncated] = useState(false);
  const [fullText, setFullText] = useState('');
  const elementRef = useRef<HTMLElement | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);

  const checkTruncation = useCallback(
    (element: HTMLElement) => {
      if (maxLines === 0) {
        setIsTruncated(false);
        return;
      }

      // Capture full text content
      setFullText(element.textContent ?? '');

      // Check for overflow
      if (maxLines === 1) {
        // Single-line: check horizontal overflow
        setIsTruncated(element.scrollWidth > element.offsetWidth);
      } else {
        // Multi-line: check vertical overflow
        setIsTruncated(element.scrollHeight > element.offsetHeight);
      }
    },
    [maxLines],
  );

  const ref: RefCallback<HTMLElement> = useCallback(
    (element: HTMLElement | null) => {
      // Cleanup previous observer
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      elementRef.current = element;

      if (element && maxLines > 0) {
        // Initial check
        checkTruncation(element);

        // Setup ResizeObserver for dynamic updates (if available)
        if (typeof ResizeObserver !== 'undefined') {
          observerRef.current = new ResizeObserver(() => {
            checkTruncation(element);
          });
          observerRef.current.observe(element);
        }
      } else {
        setIsTruncated(false);
        setFullText('');
      }
    },
    [maxLines, checkTruncation],
  );

  return {
    ref,
    isTruncated,
    fullText,
  };
}
