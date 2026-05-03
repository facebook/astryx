'use client';

/**
 * @file useTruncation.ts
 * @input Uses React hooks, sharedResizeObserver
 * @output Exports useTruncation hook for detecting text overflow
 * @position Hook; consumed by XDSText.tsx, XDSHeading.tsx
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Text/Text.doc.mjs
 */

import {useCallback, useRef, useState, type RefCallback} from 'react';
import {observeResize, unobserveResize} from '../utils/sharedResizeObserver';

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
 * Uses a shared ResizeObserver singleton (via observeResize/unobserveResize)
 * for efficient detection when content or container changes. A single
 * ResizeObserver instance is shared across all mounted useTruncation hooks,
 * so even hundreds of table cells only create one observer.
 *
 * - Single-line: compares scrollWidth > offsetWidth
 * - Multi-line: uses Range.getBoundingClientRect() to measure actual content
 *   height, bypassing -webkit-line-clamp's clamped scrollHeight
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
        // Multi-line: use Range to measure actual content height.
        // When -webkit-line-clamp is active, browsers may report
        // scrollHeight === offsetHeight (the clamped size), so the
        // naive scrollHeight check fails. Range.getBoundingClientRect()
        // measures the real text content regardless of clamping.
        let contentHeight = element.scrollHeight;
        try {
          const range = document.createRange();
          range.selectNodeContents(element);
          contentHeight = range.getBoundingClientRect().height;
          range.detach();
        } catch {
          // Fallback to scrollHeight (e.g. jsdom in tests)
        }
        setIsTruncated(contentHeight > element.offsetHeight);
      }
    },
    [maxLines],
  );

  const ref: RefCallback<HTMLElement> = useCallback(
    (element: HTMLElement | null) => {
      // Cleanup previous observation
      if (elementRef.current) {
        unobserveResize(elementRef.current);
      }

      elementRef.current = element;

      if (element && maxLines > 0) {
        // Observe via shared singleton (if available).
        // observeResize fires the callback once on registration,
        // so no separate initial check is needed.
        if (typeof ResizeObserver !== 'undefined') {
          observeResize(element, () => {
            checkTruncation(element);
          });
        } else {
          checkTruncation(element);
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
