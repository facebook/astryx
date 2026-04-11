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
 * Distinguishes user-initiated scrolls (wheel, touch, keyboard) from
 * programmatic scrolls (our scrollToBottom calls) using a flag that's
 * set before programmatic scrolls and cleared on the next frame.
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
   * Distance from bottom (in px) within which the user is considered
   * "at the bottom" for re-locking auto-scroll.
   * @default 20
   */
  bottomThreshold?: number;

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
  bottomThreshold = 20,
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
  // Flag to distinguish programmatic scrolls from user scrolls
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
    // Clear programmatic flag after the scroll event fires
    requestAnimationFrame(() => {
      isProgrammaticRef.current = false;
    });
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const distanceFromBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight;

    // Update button visibility
    setIsScrolledUp(distanceFromBottom > scrollUpThreshold);

    // Only user-initiated scrolls affect the lock
    if (isProgrammaticRef.current) return;

    if (distanceFromBottom <= bottomThreshold) {
      // User scrolled to bottom — re-lock
      lockedRef.current = true;
      setHasNewMessages(false);
    } else {
      // User scrolled up — unlock
      lockedRef.current = false;
    }
  }, [bottomThreshold, scrollUpThreshold]);

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
    scrollToBottomIfLocked,
  };
}
