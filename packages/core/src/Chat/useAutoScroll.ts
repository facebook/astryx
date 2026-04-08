'use client';

/**
 * @file useAutoScroll.ts
 * @input Uses React refs, state, and effects
 * @output Exports useAutoScroll hook for scroll-pinning behavior
 * @position Utility hook — used by XDSChatMessageList, also usable standalone
 */

import {useCallback, useEffect, useRef, useState} from 'react';

export interface UseAutoScrollOptions {
  /**
   * Whether auto-scroll is enabled.
   * @default true
   */
  enabled?: boolean;

  /**
   * Distance from bottom (in px) within which new content triggers auto-scroll.
   * @default 12
   */
  threshold?: number;
}

export interface UseAutoScrollReturn {
  /** Ref to attach to the scrollable container element. */
  scrollRef: React.RefObject<HTMLDivElement | null>;

  /** Whether the "new messages" indicator should be shown. */
  showNewMessages: boolean;

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
 * Pins to the bottom when the user is near the end. Shows a "new messages"
 * indicator when new content arrives while scrolled up.
 *
 * @example
 * ```
 * const {scrollRef, showNewMessages, handleScroll, dismissNewMessages} = useAutoScroll();
 *
 * return (
 *   <div ref={scrollRef} onScroll={handleScroll}>
 *     {messages}
 *     {showNewMessages && <button onClick={dismissNewMessages}>New messages</button>}
 *   </div>
 * );
 * ```
 */
export function useAutoScroll({
  enabled = true,
  threshold = 12,
}: UseAutoScrollOptions = {}): UseAutoScrollReturn {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [showNewMessages, setShowNewMessages] = useState(false);
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

  const checkNearBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return true;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    return distanceFromBottom <= threshold;
  }, [threshold]);

  const handleScroll = useCallback(() => {
    const nearBottom = checkNearBottom();
    isNearBottomRef.current = nearBottom;
    if (nearBottom) {
      setShowNewMessages(false);
    }
  }, [checkNearBottom]);

  const onContentChange = useCallback(() => {
    if (!enabled) return;
    if (isNearBottomRef.current) {
      scrollToBottom(true);
    } else {
      setShowNewMessages(true);
    }
  }, [enabled, scrollToBottom]);

  const dismissNewMessages = useCallback(() => {
    scrollToBottom();
    setShowNewMessages(false);
  }, [scrollToBottom]);

  // Scroll to bottom on mount
  useEffect(() => {
    scrollToBottom(false);
  }, []);

  return {
    scrollRef,
    showNewMessages,
    handleScroll,
    scrollToBottom,
    dismissNewMessages,
    onContentChange,
  };
}
