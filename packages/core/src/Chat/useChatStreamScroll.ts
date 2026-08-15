// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useChatStreamScroll.ts
 * @input Uses React refs, state, callbacks, useMediaQuery
 * @output Exports useChatStreamScroll hook for AI chat scroll behavior
 * @position Utility hook — used by ChatLayout, also usable standalone
 *
 * Spring-based scroll-to-bottom with lock/unlock:
 * - Locked (default): content growth auto-scrolls to bottom via rAF spring
 * - Scrolling up (any source): unlocks immediately
 * - Scrolling settles at bottom: re-locks on scrollend
 * - The first fill positions instantly (whether content is present at
 *   mount or arrives async); only subsequent growth springs
 * - `scrollToBottom({behavior: 'instant'})` jumps in one frame, no animation
 * - Under `prefers-reduced-motion`, every spring path falls back to the
 *   same instant jump — following still works, it just doesn't animate
 *
 * Uses scroll direction (lastScrollTop comparison) to detect user
 * intent — works for wheel, touch, scrollbar drag, keyboard, everything.
 * Tracks scrollHeight/offsetHeight changes to ignore Chrome synthetic
 * scroll events caused by content resize.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Chat/index.ts (exports)
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import {useMediaQuery} from '../hooks/useMediaQuery';

// =============================================================================
// Types
// =============================================================================

export interface ChatScrollToBottomOptions {
  /**
   * `'instant'` jumps to the bottom in a single frame instead of running
   * the spring animation. Use for programmatic positioning (opening a
   * conversation, restoring a session) — keep the default `'spring'` for
   * user-initiated scrolls like the scroll-to-bottom button. Mirrors the
   * DOM's `scrollTo({behavior})`. When the user prefers reduced motion,
   * `'spring'` also jumps instantly.
   * @default 'spring'
   */
  behavior?: 'instant' | 'spring';
}

export interface UseChatStreamScrollOptions {
  /**
   * Ref to the scrollable container element.
   */
  scrollRef: React.RefObject<HTMLElement | null>;

  /**
   * Whether scroll behavior is enabled.
   * @default true
   */
  enabled?: boolean;

  /**
   * Distance from bottom (in px) within which scrollend re-locks.
   * Keep small so users aren't yanked back from a slight scroll.
   * @default 10
   */
  lockThreshold?: number;

  /**
   * Distance from bottom (in px) beyond which the scroll-to-bottom
   * button becomes visible.
   * @default 100
   */
  buttonThreshold?: number;

  /**
   * Spring damping — how quickly the animation settles.
   * @default 0.7
   */
  damping?: number;

  /**
   * Spring stiffness — how fast the animation accelerates.
   * @default 0.05
   */
  stiffness?: number;

  /**
   * Spring mass — higher = slower animation.
   * @default 1.25
   */
  mass?: number;
}

export interface UseChatStreamScrollReturn {
  /** Whether the user has scrolled up past buttonThreshold. */
  isScrolledUp: boolean;

  /** Whether auto-scroll is locked (following content). */
  isLocked: boolean;

  /** Scroll to the bottom of the container and re-lock. */
  scrollToBottom: (options?: ChatScrollToBottomOptions) => void;

  /** Scroll so a specific element is at the top of the visible area. No lock change. */
  scrollToMessage: (el: HTMLElement) => void;

  /** Lock auto-scroll and scroll to bottom. */
  lock: () => void;

  /** Unlock auto-scroll. */
  unlock: () => void;

  /** Scroll to bottom if currently locked. Call on content resize. */
  scrollIfLocked: () => void;

  /** Scroll to the last message in the container. */
  scrollToLastMessage: () => void;
}

// =============================================================================
// Hook
// =============================================================================

const SIXTY_FPS_MS = 1000 / 60;

export function useChatStreamScroll({
  scrollRef,
  enabled = true,
  lockThreshold = 10,
  buttonThreshold = 100,
  damping = 0.7,
  stiffness = 0.05,
  mass = 1.25,
}: UseChatStreamScrollOptions): UseChatStreamScrollReturn {
  const [isScrolledUp, setIsScrolledUp] = useState(false);
  const [isLocked, setIsLocked] = useState(true);

  const lockedRef = useRef(true);
  // True until the initial fill has been positioned — consumed by the first
  // scrollIfLocked that sees scrollable content.
  const initialFillPendingRef = useRef(true);
  const velocityRef = useRef(0);
  const animatingRef = useRef(false);
  const lastTickRef = useRef<number | undefined>(undefined);

  // For scroll direction detection
  const lastScrollTopRef = useRef(0);
  // For synthetic scroll detection
  const lastScrollHeightRef = useRef(0);
  const lastOffsetHeightRef = useRef(0);

  // --- Spring animation ---

  const animate = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !lockedRef.current) {
      animatingRef.current = false;
      lastTickRef.current = undefined;
      velocityRef.current = 0;
      return;
    }

    if (el.scrollHeight <= el.clientHeight) {
      animatingRef.current = false;
      lastTickRef.current = undefined;
      velocityRef.current = 0;
      return;
    }

    const target = el.scrollHeight - el.clientHeight;
    const diff = target - el.scrollTop;

    if (Math.abs(diff) < 0.5 && Math.abs(velocityRef.current) < 0.1) {
      // eslint-disable-next-line react-compiler/react-compiler -- imperative DOM: scrollTop assignment
      el.scrollTop = target;
      animatingRef.current = false;
      lastTickRef.current = undefined;
      velocityRef.current = 0;
      return;
    }

    const now = performance.now();
    const tickDelta = lastTickRef.current
      ? (now - lastTickRef.current) / SIXTY_FPS_MS
      : 1;
    lastTickRef.current = now;

    velocityRef.current =
      (damping * velocityRef.current + stiffness * diff) / mass;
    el.scrollTop += velocityRef.current * tickDelta;

    requestAnimationFrame(animate);
  }, [scrollRef, damping, stiffness, mass]);

  // Jump to the bottom in a single frame — cancels any in-flight spring so
  // a later animation tick can't fight the assignment.
  const jumpToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }
    animatingRef.current = false;
    velocityRef.current = 0;
    lastTickRef.current = undefined;
    el.scrollTop = el.scrollHeight - el.clientHeight;
    lastScrollTopRef.current = el.scrollTop;
  }, [scrollRef]);

  const prefersReducedMotion = useMediaQuery(
    '(prefers-reduced-motion: reduce)',
  );

  // Every spring entry point (scrollToBottom, lock, scrollIfLocked growth
  // follow) funnels through here, so this one branch covers them all.
  const startAnimation = useCallback(() => {
    if (!lockedRef.current) {
      return;
    }
    if (prefersReducedMotion) {
      jumpToBottom();
      return;
    }
    if (!animatingRef.current) {
      animatingRef.current = true;
      lastTickRef.current = undefined;
      requestAnimationFrame(animate);
    }
  }, [animate, jumpToBottom, prefersReducedMotion]);

  // --- Public API ---

  const scrollToBottom = useCallback(
    (options?: ChatScrollToBottomOptions) => {
      lockedRef.current = true;
      setIsLocked(true);
      setIsScrolledUp(false);
      initialFillPendingRef.current = false;
      if (options?.behavior === 'instant') {
        jumpToBottom();
        return;
      }
      startAnimation();
    },
    [startAnimation, jumpToBottom],
  );

  const scrollToMessage = useCallback(
    (el: HTMLElement) => {
      const container = scrollRef.current;
      if (!container) {
        return;
      }
      const containerRect = container.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const offset = elRect.top - containerRect.top + container.scrollTop;
      container.scrollTo({top: offset, behavior: 'instant'});
      lastScrollTopRef.current = container.scrollTop;
    },
    [scrollRef],
  );

  const scrollToLastMessage = useCallback(() => {
    const container = scrollRef.current;
    if (!container) {
      return;
    }
    const messages = container.getElementsByClassName('astryx-chat-message');
    const last = messages[messages.length - 1];
    if (last instanceof HTMLElement) {
      scrollToMessage(last);
    }
  }, [scrollRef, scrollToMessage]);

  const lock = useCallback(() => {
    lockedRef.current = true;
    setIsLocked(true);
    setIsScrolledUp(false);
    startAnimation();
  }, [startAnimation]);

  const unlock = useCallback(() => {
    lockedRef.current = false;
    animatingRef.current = false;
    setIsLocked(false);
  }, []);

  const scrollIfLocked = useCallback(() => {
    if (!enabled) {
      return;
    }
    if (!lockedRef.current) {
      return;
    }
    // Initial fill: content appearing for the first time (e.g. an
    // async-loaded conversation) positions in one frame instead of
    // spring-flying from the top. Stays pending through empty/loading
    // resizes until the container is actually scrollable.
    const el = scrollRef.current;
    if (
      initialFillPendingRef.current &&
      el &&
      el.scrollHeight > el.clientHeight
    ) {
      initialFillPendingRef.current = false;
      jumpToBottom();
      return;
    }
    startAnimation();
  }, [enabled, startAnimation, jumpToBottom, scrollRef]);

  // --- Event listeners ---

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !enabled) {
      return;
    }

    // Initialize tracking values
    lastScrollTopRef.current = el.scrollTop;
    lastScrollHeightRef.current = el.scrollHeight;
    lastOffsetHeightRef.current = el.offsetHeight;

    const onScroll = () => {
      const {scrollTop, scrollHeight, offsetHeight} = el;
      const dist = scrollHeight - scrollTop - offsetHeight;

      // Button visibility
      setIsScrolledUp(dist > buttonThreshold);

      // Detect synthetic scroll — Chrome fires scroll events when
      // scrollHeight or offsetHeight changes (content resize, keyboard).
      const scrollHeightChanged = scrollHeight !== lastScrollHeightRef.current;
      const offsetHeightChanged = offsetHeight !== lastOffsetHeightRef.current;
      lastScrollHeightRef.current = scrollHeight;
      lastOffsetHeightRef.current = offsetHeight;

      if (scrollHeightChanged || offsetHeightChanged) {
        // Synthetic scroll from resize — don't change lock state
        lastScrollTopRef.current = scrollTop;
        return;
      }

      // Scroll direction — unlock on scroll up
      const isScrollingUp = scrollTop < lastScrollTopRef.current;
      lastScrollTopRef.current = scrollTop;

      if (isScrollingUp && lockedRef.current) {
        lockedRef.current = false;
        animatingRef.current = false;
        setIsLocked(false);
      }
    };

    const onScrollEnd = () => {
      const dist = el.scrollHeight - el.scrollTop - el.offsetHeight;
      if (dist <= lockThreshold) {
        lockedRef.current = true;
        setIsLocked(true);
      }
    };

    // Wheel up while animating — interrupt immediately.
    // onScroll direction detection covers most cases, but wheel fires
    // before the scroll position updates so we can react faster.
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY < 0 && animatingRef.current) {
        lockedRef.current = false;
        animatingRef.current = false;
        setIsLocked(false);
      }
    };

    // Touch move — user is dragging, take control
    const onTouchMove = () => {
      if (animatingRef.current) {
        lockedRef.current = false;
        animatingRef.current = false;
        setIsLocked(false);
      }
    };

    el.addEventListener('scroll', onScroll, {passive: true});
    el.addEventListener('scrollend', onScrollEnd);
    el.addEventListener('wheel', onWheel, {passive: true});
    el.addEventListener('touchmove', onTouchMove, {passive: true});

    // Initial scroll to bottom — content already present at mount.
    requestAnimationFrame(() => {
      if (el.scrollHeight > el.clientHeight) {
        el.scrollTop = el.scrollHeight - el.clientHeight;
        lastScrollTopRef.current = el.scrollTop;
        initialFillPendingRef.current = false;
      }
    });

    return () => {
      el.removeEventListener('scroll', onScroll);
      el.removeEventListener('scrollend', onScrollEnd);
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('touchmove', onTouchMove);
    };
  }, [scrollRef, enabled, lockThreshold, buttonThreshold]);

  return {
    isScrolledUp,
    isLocked,
    scrollToBottom,
    scrollToMessage,
    lock,
    unlock,
    scrollIfLocked,
    scrollToLastMessage,
  };
}
