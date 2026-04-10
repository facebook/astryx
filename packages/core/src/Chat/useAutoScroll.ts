'use client';

/**
 * @file useAutoScroll.ts
 * @input Uses React refs, state, and effects
 * @output Exports useAutoScroll hook for scroll-pinning behavior
 * @position Utility hook — used by XDSChatMessageList, also usable standalone
 *
 * Exposes two scroll states:
 * - `isScrolledUp` — true when the user has scrolled away from the bottom
 *   (beyond `scrollUpThreshold`), regardless of whether new content arrived.
 *   Drives a scroll-to-bottom affordance.
 * - `hasNewMessages` — true when new content arrived while scrolled up.
 *   Layers on top of isScrolledUp to add a "new messages" notification.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Chat/index.ts (exports)
 * - /packages/core/src/Chat/XDSChatMessageList.tsx (consumer)
 */

import {useCallback, useEffect, useRef, useState} from 'react';

export interface UseAutoScrollOptions {
  /**
   * Whether auto-scroll behavior is enabled.
   * @default true
   */
  enabled?: boolean;

  /**
   * Distance from bottom (in px) within which new content triggers auto-scroll.
   * @default 12
   */
  threshold?: number;

  /**
   * Distance from bottom (in px) beyond which `isScrolledUp` becomes true.
   * Controls when the scroll-to-bottom button appears.
   * @default 100
   */
  scrollUpThreshold?: number;

  /**
   * External scroll container ref. When provided, scroll logic targets
   * this element instead of creating its own. Use when the message list
   * is in page flow (e.g. inside XDSChatLayout) and the scrollable
   * ancestor is a parent element or the viewport.
   */
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
}

export interface UseAutoScrollReturn {
  /** Ref to attach to the scrollable container element. */
  scrollRef: React.RefObject<HTMLDivElement | null>;

  /** Whether the user has scrolled up beyond `scrollUpThreshold`. */
  isScrolledUp: boolean;

  /** Whether new content arrived while the user is scrolled up. */
  hasNewMessages: boolean;

  /** Scroll handler — attach to onScroll on the scrollable element. */
  handleScroll: () => void;

  /** Scroll to the bottom of the container. */
  scrollToBottom: (smooth?: boolean) => void;

  /** Dismiss the new messages indicator and scroll to bottom. */
  dismissNewMessages: () => void;

  /** Notify the hook that content changed (triggers auto-scroll check). */
  onContentChange: () => void;
}

/**
 * Hook that manages auto-scroll behavior for scrollable containers.
 *
 * Pins to the bottom when the user is near the end. Tracks two
 * orthogonal states: whether the user has scrolled up (for a
 * scroll-to-bottom affordance) and whether new content arrived
 * while scrolled up (for a "new messages" notification).
 *
 * @example
 * ```
 * const {scrollRef, isScrolledUp, hasNewMessages, handleScroll, scrollToBottom, dismissNewMessages} = useAutoScroll();
 *
 * return (
 *   <div ref={scrollRef} onScroll={handleScroll}>
 *     {messages}
 *     {isScrolledUp && <button onClick={scrollToBottom}>↓</button>}
 *     {hasNewMessages && <button onClick={dismissNewMessages}>New messages</button>}
 *   </div>
 * );
 * ```
 */
export function useAutoScroll({
  enabled = true,
  threshold = 12,
  scrollUpThreshold = 100,
  scrollContainerRef,
}: UseAutoScrollOptions = {}): UseAutoScrollReturn {
  const internalRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = (scrollContainerRef ??
    internalRef) as React.RefObject<HTMLDivElement | null>;
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [isScrolledUp, setIsScrolledUp] = useState(false);
  const isNearBottomRef = useRef(true);

  const scrollToBottom = useCallback((smooth = true) => {
    const el = scrollRef.current;
    if (!el) return;
    if (typeof el.scrollTo === 'function') {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: smooth ? 'smooth' : 'instant',
      });
    } else {
      el.scrollTop = el.scrollHeight;
    }
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const nearBottom = distanceFromBottom <= threshold;
    isNearBottomRef.current = nearBottom;

    // Track whether user is scrolled up beyond the visible threshold
    setIsScrolledUp(distanceFromBottom > scrollUpThreshold);

    if (nearBottom) {
      setHasNewMessages(false);
    }
  }, [threshold, scrollUpThreshold]);

  const onContentChange = useCallback(() => {
    if (!enabled) return;
    if (isNearBottomRef.current) {
      scrollToBottom(true);
    } else {
      setHasNewMessages(true);
    }
  }, [enabled, scrollToBottom]);

  const dismissNewMessages = useCallback(() => {
    scrollToBottom();
    setHasNewMessages(false);
  }, [scrollToBottom]);

  // Scroll to bottom on mount
  useEffect(() => {
    scrollToBottom(false);
  }, []);

  return {
    scrollRef,
    isScrolledUp,
    hasNewMessages,
    handleScroll,
    scrollToBottom,
    dismissNewMessages,
    onContentChange,
  };
}
