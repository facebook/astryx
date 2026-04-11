'use client';

/**
 * @file useAutoScroll.ts
 * @input Uses React refs, state, and effects
 * @output Exports useAutoScroll hook for scroll-pinning behavior
 * @position Utility hook — used by XDSChatLayout, also usable standalone
 *
 * Scroll-lock model:
 * - **Locked** (default): content changes auto-scroll to bottom
 * - **Unlocked**: user manually scrolled, auto-scroll stops
 * - **Re-locked**: user clicks scroll-to-bottom button
 *
 * Uses `scrollend` to distinguish user scrolls from programmatic ones.
 * Programmatic scrolls (scrollToBottom) set a flag before scrolling;
 * when `scrollend` fires without that flag, it was a user scroll → unlock.
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

  /** Scroll handler — attach to onScroll. */
  handleScroll: () => void;

  /** Scrollend handler — attach to scrollend. */
  handleScrollEnd: () => void;

  /** Scroll to the bottom of the container. */
  scrollToBottom: (smooth?: boolean) => void;

  /** Dismiss the new messages indicator, re-lock, and scroll to bottom. */
  dismissNewMessages: () => void;

  /** New message appended — flag "new messages" if unlocked. */
  onContentChange: () => void;

  /** Content grew — auto-scroll if locked, no flag. */
  scrollToBottomIfLocked: () => void;
}

/**
 * Hook that manages scroll-lock auto-scroll behavior.
 *
 * Starts locked (pinned to bottom). User scrolling unlocks (detected
 * via `scrollend` without the programmatic flag). Clicking the
 * scroll-to-bottom button re-locks.
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
  // Flag set before programmatic scrolls, cleared on scrollend
  const isProgrammaticRef = useRef(false);

  const scrollToBottom = useCallback((smooth = true) => {
    const el = scrollRef.current;
    if (!el) return;
    isProgrammaticRef.current = true;
    if (typeof el.scrollTo === 'function') {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: smooth ? 'smooth' : 'instant',
      });
    } else {
      el.scrollTop = el.scrollHeight;
    }
  }, []);

  // On scroll: unlock if user scrolled past threshold
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const distanceFromBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight;
    setIsScrolledUp(distanceFromBottom > scrollUpThreshold);

    if (!isProgrammaticRef.current && distanceFromBottom > scrollUpThreshold) {
      lockedRef.current = false;
    }
  }, [scrollUpThreshold]);

  // On scroll end: lock if at bottom, clear programmatic flag
  const handleScrollEnd = useCallback(() => {
    isProgrammaticRef.current = false;

    const el = scrollRef.current;
    if (!el) return;
    const distanceFromBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distanceFromBottom <= scrollUpThreshold) {
      lockedRef.current = true;
      setHasNewMessages(false);
    }
  }, [scrollUpThreshold]);

  const onContentChange = useCallback(() => {
    if (!enabled) return;
    if (!lockedRef.current) {
      setHasNewMessages(true);
    }
  }, [enabled]);

  const scrollToBottomIfLocked = useCallback(() => {
    if (!enabled) return;
    if (lockedRef.current) {
      scrollToBottom(true);
    }
  }, [enabled, scrollToBottom]);

  const dismissNewMessages = useCallback(() => {
    lockedRef.current = true;
    isProgrammaticRef.current = true;
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
    handleScrollEnd,
    scrollToBottom,
    dismissNewMessages,
    onContentChange,
    scrollToBottomIfLocked,
  };
}
