'use client';

/**
 * @file useAutoScroll.ts
 * @input Uses React refs, state, and effects
 * @output Exports useAutoScroll hook for scroll-pinning behavior
 * @position Utility hook — used by XDSChatLayout, also usable standalone
 *
 * Uses a scroll-lock model instead of distance thresholds:
 * - **Locked** (default): new content auto-scrolls to bottom
 * - **Unlocked**: user scrolled up, auto-scroll stops
 * - **Re-locked**: user scrolls back to bottom
 *
 * scrollToBottom re-locks automatically by scrolling to the bottom,
 * which triggers handleScroll → distance is 0 → re-lock.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Chat/index.ts (exports)
 * - /packages/core/src/Chat/XDSChatLayout.tsx (consumer)
 */

import {useCallback, useEffect, useRef, useState} from 'react';

export interface UseAutoScrollOptions {
  /**
   * Whether auto-scroll behavior is enabled.
   * @default true
   */
  enabled?: boolean;

  /**
   * Distance from bottom (in px) beyond which the scroll-to-bottom
   * button becomes visible.
   * @default 100
   */
  scrollUpThreshold?: number;

  /**
   * External scroll container ref. When provided, scroll logic targets
   * this element instead of creating its own.
   */
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
}

export interface UseAutoScrollReturn {
  /** Ref to attach to the scrollable container element. */
  scrollRef: React.RefObject<HTMLDivElement | null>;

  /** Whether the user has scrolled up (shows scroll-to-bottom button). */
  isScrolledUp: boolean;

  /** Whether new content arrived while unlocked. */
  hasNewMessages: boolean;

  /** Scroll handler — attach to onScroll on the scrollable element. */
  handleScroll: () => void;

  /** User scroll handler — attach to wheel/touchmove to unlock auto-scroll. */
  handleUserScroll: () => void;

  /** Scroll to the bottom of the container. */
  scrollToBottom: (smooth?: boolean) => void;

  /** Dismiss the new messages indicator and scroll to bottom. */
  dismissNewMessages: () => void;

  /** New message appended — auto-scroll if locked, flag if unlocked. */
  onContentChange: () => void;

  /** Content grew (streaming) — auto-scroll if locked, no flag. */
  scrollToBottomIfLocked: () => void;
}

/**
 * Hook that manages scroll-lock auto-scroll behavior.
 *
 * Starts locked (pinned to bottom). User scrolling up unlocks.
 * User scrolling back to bottom re-locks. Programmatic scrolls
 * (from this hook) don't affect the lock state.
 */
export function useAutoScroll({
  enabled = true,
  scrollUpThreshold = 100,
  scrollContainerRef,
}: UseAutoScrollOptions = {}): UseAutoScrollReturn {
  const internalRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = (scrollContainerRef ??
    internalRef) as React.RefObject<HTMLDivElement | null>;

  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [isScrolledUp, setIsScrolledUp] = useState(false);

  // Scroll lock: true = auto-scroll follows content
  const lockedRef = useRef(true);

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

  // Track user intent to scroll — wheel up or touch sets a flag,
  // then handleScroll checks if they've actually moved away from bottom.
  const userScrollingRef = useRef(false);

  const handleUserScroll = useCallback((e: Event) => {
    if (e instanceof WheelEvent && e.deltaY < 0) {
      userScrollingRef.current = true;
    } else if (e.type === 'touchmove') {
      userScrollingRef.current = true;
    }
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const distanceFromBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight;

    setIsScrolledUp(distanceFromBottom > scrollUpThreshold);

    // Only unlock when the user has actively scrolled away from bottom
    if (userScrollingRef.current && distanceFromBottom > scrollUpThreshold) {
      lockedRef.current = false;
    }
    userScrollingRef.current = false;
  }, [scrollUpThreshold]);

  const onContentChange = useCallback(() => {
    if (!enabled) return;
    if (lockedRef.current) {
      scrollToBottom(true);
    } else {
      setHasNewMessages(true);
    }
  }, [enabled, scrollToBottom]);

  const scrollToBottomIfLocked = useCallback(() => {
    if (!enabled) return;
    if (lockedRef.current) {
      scrollToBottom(true);
    }
  }, [enabled, scrollToBottom]);

  const dismissNewMessages = useCallback(() => {
    lockedRef.current = true;
    setIsScrolledUp(false);
    setHasNewMessages(false);
    scrollToBottom();
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
    handleUserScroll,
    scrollToBottom,
    dismissNewMessages,
    onContentChange,
    scrollToBottomIfLocked,
  };
}
