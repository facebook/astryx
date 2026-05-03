'use client';

/**
 * @file useXDSChatNewMessages.ts
 * @input Uses React refs, state, ResizeObserver
 * @output Exports useXDSChatNewMessages hook for detecting new chat messages
 * @position Utility hook — used by XDSChatLayout, also usable standalone
 *
 * Observes a content element via ResizeObserver and tracks the last
 * .xds-chat-message element. When a new message appears (last element
 * changes), flags hasNewMessages if the scroll is unlocked.
 *
 * Also calls onResize on every content height change so the scroll
 * hook can follow growing content (streaming).
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Chat/index.ts (exports)
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import {observeResize, unobserveResize} from '../utils/sharedResizeObserver';

// =============================================================================
// Types
// =============================================================================

export interface UseXDSChatNewMessagesOptions {
  /**
   * Ref to the content element to observe (message list inner div).
   * Can be a callback ref or a regular ref.
   */
  contentRef: React.RefObject<HTMLElement | null>;

  /**
   * Whether the scroll is currently locked (following content).
   * When locked, new messages don't flag — the user is already at the bottom.
   */
  isLocked: boolean;

  /**
   * Called on every content height change (new message or streaming growth).
   * Use to trigger scroll-if-locked in the scroll hook.
   */
  onResize?: () => void;
}

export interface UseXDSChatNewMessagesReturn {
  /** Whether new messages arrived while the scroll was unlocked. */
  hasNewMessages: boolean;

  /** Dismiss the new messages flag. */
  dismiss: () => void;
}

// =============================================================================
// Hook
// =============================================================================

export function useXDSChatNewMessages({
  contentRef,
  isLocked,
  onResize,
}: UseXDSChatNewMessagesOptions): UseXDSChatNewMessagesReturn {
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const lastMessageRef = useRef<Element | null>(null);
  const isLockedRef = useRef(isLocked);
  isLockedRef.current = isLocked;

  const onResizeRef = useRef(onResize);
  onResizeRef.current = onResize;

  // Observe content for height changes
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    observeResize(el, () => {
      // Notify scroll hook of any height change
      onResizeRef.current?.();

      // Check if a new message was appended
      const messages = el.getElementsByClassName('xds-chat-message');
      const last =
        messages.length > 0 ? messages[messages.length - 1] : null;

      if (last && last !== lastMessageRef.current) {
        lastMessageRef.current = last;
        // Only flag if unlocked — user is scrolled up
        if (!isLockedRef.current) {
          setHasNewMessages(true);
        }
      }
    });

    return () => unobserveResize(el);
  }, [contentRef]);

  const dismiss = useCallback(() => {
    setHasNewMessages(false);
  }, []);

  return {hasNewMessages, dismiss};
}
