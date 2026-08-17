// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useSheetGestures.ts
 * @input Uses React (useCallback, useEffect, useMemo, useRef, useState)
 * @output Exports useSheetGestures hook and its option/result types
 * @position Internal to BottomSheet; not exported from the lab entry point
 *
 * Drag + snap machinery for the bottom sheet. Tracks a pointer drag down the
 * block axis, translates the sliding surface live, and on release either
 * settles to the nearest snap detent (a slow drag) or dismisses (a fast flick
 * down). A fast flick up expands to the tallest detent. This is the core
 * behavior split the sheet needs: DRAG places, SWIPE closes.
 *
 * A settled detent is split across two properties: `settledLayoutOffset` is
 * the part the scrolling area gives up as layout height, and the remainder is
 * a transform. Gestures and snaps only ever move the transform, so they stay
 * on the compositor; layout height changes at rest, in one transition-free
 * render whose visible geometry is identical. The peek detent keeps the full
 * height and slides below the viewport instead of reflowing to a sliver.
 *
 * Kept private to BottomSheet: a dismiss edge + detents on a bottom-anchored
 * surface are inherently sheet concepts. It is not a general primitive and is
 * intentionally not exported.
 *
 * SSR-safe: no window/document access at module scope; all measurement
 * happens inside handlers. Respects prefers-reduced-motion by skipping the
 * settle transition.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/BottomSheet/useSheetGestures.doc.mjs
 * - /packages/lab/src/BottomSheet/useSheetGestures.test.ts
 */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type UIEvent as ReactUIEvent,
} from 'react';
import {
  computeDetentOffsets,
  isPeekOffset,
  resolveSettleOffset,
  scrimOpacityForOffset,
} from './snapOffsets';

// A flick (fast throw) dismisses (down) or expands (up) regardless of where
// it ends. Requires both a speed and a distance floor so a small nudge
// doesn't trigger it.
const FLICK_VELOCITY = 1.2; // px/ms
const FLICK_MIN_DISTANCE = 48; // px traveled during the gesture
// On a slow drag below the shortest detent, dismiss once dragged past it by
// more than this fraction of that detent's height; otherwise snap back to it.
const DISMISS_OVERSHOOT_RATIO = 0.4;
// Within this many px of a detent, the live drag is magnetically eased toward
// it so it "clicks" into place instead of hovering just off the mark.
const MAGNET_RANGE = 40;
// Rubber-band factor for dragging up past fully-open, capped at OVERSCROLL_MAX
// (the sheet reserves that much bottom padding for the lift to reveal).
const OVERSCROLL_RESISTANCE = 0.35;
// SYNC: must match OVERSCROLL_PADDING in BottomSheetPanel.tsx (the reserved
// bottom padding the lift reveals). Kept as a local const rather than a shared
// import so it can be used inside stylex.create there.
const OVERSCROLL_MAX = 48;

// Short haptic tick on detent settle where supported. iOS Safari doesn't
// expose navigator.vibrate, so this is a no-op there; skipped under
// reduced-motion.
function hapticTick(): void {
  if (
    typeof navigator === 'undefined' ||
    typeof navigator.vibrate !== 'function'
  ) {
    return;
  }
  if (prefersReducedMotion()) {
    return;
  }
  navigator.vibrate(8);
}

// Pull a value toward the nearest of `targets` when within MAGNET_RANGE, easing
// the last stretch so the surface settles crisply onto a detent while dragging.
function magnetize(value: number, targets: number[]): number {
  let nearestTarget = targets[0];
  let nearestDist = Math.abs(value - nearestTarget);
  for (const t of targets) {
    const d = Math.abs(value - t);
    if (d < nearestDist) {
      nearestDist = d;
      nearestTarget = t;
    }
  }
  if (nearestDist >= MAGNET_RANGE) {
    return value;
  }
  // Ease-in over the range: pull grows as you approach (t^2), so the click
  // feels magnetic near the detent but doesn't fight a deliberate drag-through.
  const t = nearestDist / MAGNET_RANGE;
  const pull = 1 - t * t;
  return value + (nearestTarget - value) * pull;
}

function preservationInsetForOffset(
  baseOffset: number,
  targetOffset: number,
  naturalEndGap: number,
): number {
  return Math.max(0, baseOffset - targetOffset - naturalEndGap);
}

function renderedBlockEndPadding(element: HTMLElement): number {
  const value = Number.parseFloat(getComputedStyle(element).paddingBlockEnd);
  return Number.isFinite(value) ? value : 0;
}

function visibleHeightForOffset(
  sheetHeight: number,
  offset: number,
  offscreenBlockEndInset: number,
): number {
  return Math.max(0, sheetHeight - offscreenBlockEndInset - offset);
}

export interface UseSheetGesturesOptions {
  /** Whether the owning sheet is open. Drag state resets when it closes. */
  isOpen: boolean;
  /**
   * Whether a downward swipe may dismiss the sheet. When false, a gesture
   * past the dismiss threshold settles at the shortest detent instead.
   * @default true
   */
  canDismiss?: boolean;
  /**
   * Portion of the measured sheet border box reserved below the viewport.
   * Excluded from detent heights so a 50vh snap has 50vh of visible sheet.
   * @default 0
   */
  offscreenBlockEndInset?: number;
  /** Called on a swipe-to-close (fast downward flick, or drag past the floor). */
  onDismiss: () => void;
  /**
   * Resolver for candidate visible detent heights in px below the fully open
   * visible height. Called lazily at the start of each drag so the values stay
   * current (e.g. after rotation or virtual-keyboard opening) without a
   * persistent resize listener. The fully open height is always the tallest
   * detent. Omit for a single-height sheet (a drag then only dismisses or
   * springs back).
   */
  snapHeights?: () => number[];
  /** Notified when the settled visible detent height (px) changes. */
  onSnap?: (heightPx: number) => void;
  /**
   * Called with the scrim opacity the sheet should show (1 = fully visible,
   * 0 = hidden) as the drag moves and on settle. Full while the sheet is at
   * or above its mid detent, fading to 0 as it collapses onto the shortest
   * "peek" detent — thinning to a faint glance state without fully clearing — and
   * on the dismiss overshoot. Lets the owner mirror it onto the scrim.
   */
  onScrimOpacity?: (opacity: number) => void;
}

export interface SheetContentProps {
  style: CSSProperties;
}

export interface SheetHandleProps {
  style: CSSProperties;
  onContextMenu: (event: ReactMouseEvent) => void;
  onLostPointerCapture: (event: ReactPointerEvent) => void;
  onPointerDown: (event: ReactPointerEvent) => void;
  onPointerMove: (event: ReactPointerEvent) => void;
  onPointerUp: (event: ReactPointerEvent) => void;
  onPointerCancel: (event: ReactPointerEvent) => void;
}

export interface SheetBodyProps {
  ref: (node: HTMLElement | null) => void;
  onContextMenu: (event: ReactMouseEvent) => void;
  onLostPointerCapture: (event: ReactPointerEvent) => void;
  onPointerDown: (event: ReactPointerEvent) => void;
  onPointerMove: (event: ReactPointerEvent) => void;
  onPointerUp: (event: ReactPointerEvent) => void;
  onPointerCancel: (event: ReactPointerEvent) => void;
  onScroll: (event: ReactUIEvent<HTMLElement>) => void;
}

export interface UseSheetGesturesResult {
  /**
   * Callback ref for the sheet surface. The hook observes it (ResizeObserver)
   * to keep the fully-open height current, so detents stay correct across
   * rotation / viewport changes without re-measuring mid-drag.
   */
  sheetRef: (node: HTMLElement | null) => void;
  /** Spread on the sliding surface: live translate + touch-action guard. */
  contentProps: SheetContentProps;
  /** Spread on the grab-handle element: pointer drag handlers. */
  handleProps: SheetHandleProps;
  /**
   * Spread on the scrollable body. An overscroll-at-top pull-down starts a
   * sheet drag (a larger, more forgiving target when the content isn't itself
   * scrolling); normal scrolling passes through untouched.
   */
  bodyProps: SheetBodyProps;
  /** Current live drag translate in px (0 = fully expanded, larger = collapsed). */
  dragOffset: number;
  /** Translate of the resting detent in px (0 = tallest detent). */
  settledOffset: number;
  /** Whether a drag is currently in progress. */
  isDragging: boolean;
  /** Measured height of the fully expanded sheet. */
  sheetHeight: number;
  /** End padding that preserves the scroll position across height changes. */
  scrollPreservationInset: number;
  /** Layout offset retained until the transform-only snap finishes. */
  settlingLayoutOffset: number | null;
  /**
   * Reconciles the final layout once the transform-only snap finishes. The
   * panel decides WHEN a snap is over (it owns the element and its computed
   * transition), so completion cannot be driven from a `transitionend`
   * listener alone: with transitions disabled — inline `transition: none`, a
   * `0s` duration token, a test harness turning animation off — no event ever
   * arrives and the scroll area would keep its full height forever.
   */
  completeScrollAreaSettle: () => void;
  /**
   * How much of `settledOffset` is expressed as layout height rather than as a
   * transform. Equals `settledOffset` at the resizing detents; 0 at fully open
   * and at the peek, which keep the sheet's full height (see isPeekOffset).
   */
  settledLayoutOffset: number;
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Drag + snap machinery for the bottom sheet. Returns props to spread on the
 * grab handle and the sliding surface, plus live drag state. A slow drag
 * settles to the nearest detent; a fast downward flick dismisses; a fast
 * upward flick expands to the tallest detent.
 *
 * @example
 * ```
 * const {contentProps, handleProps} = useSheetGestures({
 *   isOpen,
 *   onDismiss: () => onOpenChange(false),
 *   snapHeights: () => [240, 0.5 * (window.visualViewport?.height ?? 0)],
 * });
 * <div {...contentProps}>
 *   <div {...handleProps} />
 *   {children}
 * </div>
 * ```
 */
export function useSheetGestures({
  isOpen,
  canDismiss = true,
  offscreenBlockEndInset = 0,
  onDismiss,
  snapHeights,
  onSnap,
  onScrimOpacity,
}: UseSheetGesturesOptions): UseSheetGesturesResult {
  const [dragOffset, setDragOffset] = useState(0);
  const [settledOffset, setSettledOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [sheetHeight, setSheetHeight] = useState(0);
  const [scrollPreservationInset, setScrollPreservationInset] = useState(0);
  // How much of the settled travel is expressed as layout height. Equal to
  // settledOffset for the resizing detents, and 0 at fully open and at the
  // peek (see isPeekOffset), which keep the full height and use a transform.
  const [settledLayoutOffset, setSettledLayoutOffset] = useState(0);
  const settledLayoutOffsetRef = useRef(0);
  const [settlingLayoutOffset, setSettlingLayoutOffset] = useState<
    number | null
  >(null);
  const [isScrollAreaReconciling, setIsScrollAreaReconciling] = useState(false);
  const scrollPreservationInsetRef = useRef(0);
  const settlingLayoutOffsetRef = useRef<number | null>(null);
  const pendingScrollPreservationInsetRef = useRef<number | null>(null);
  const offscreenBlockEndInsetRef = useRef(offscreenBlockEndInset);
  offscreenBlockEndInsetRef.current = Math.max(0, offscreenBlockEndInset);
  const recordSettledLayoutOffset = useCallback((offset: number) => {
    const normalizedOffset = Math.max(0, offset);
    settledLayoutOffsetRef.current = normalizedOffset;
    setSettledLayoutOffset(normalizedOffset);
  }, []);
  const updateScrollPreservationInset = useCallback((nextInset: number) => {
    const normalizedInset = Math.max(0, nextInset);
    const hasChanged =
      Math.abs(normalizedInset - scrollPreservationInsetRef.current) > 0.5;
    if (!hasChanged) {
      return;
    }
    scrollPreservationInsetRef.current = normalizedInset;
    setScrollPreservationInset(normalizedInset);
  }, []);
  const completeScrollAreaSettle = useCallback(() => {
    // Resetting the transform at the same time as the final height swap must
    // not start a second transition. The layouts have identical visible
    // geometry, so reconcile them with transitions disabled for one frame.
    setIsScrollAreaReconciling(true);
    settlingLayoutOffsetRef.current = null;
    setSettlingLayoutOffset(null);
    const pendingInset = pendingScrollPreservationInsetRef.current;
    pendingScrollPreservationInsetRef.current = null;
    if (pendingInset != null) {
      updateScrollPreservationInset(pendingInset);
    }
  }, [updateScrollPreservationInset]);
  const prepareScrollAreaSettle = useCallback(
    (
      baseLayoutOffset: number,
      targetOffset: number,
      targetLayoutOffset: number,
      renderedOffset: number,
      layoutOffset: number,
      naturalEndGap: number,
      shouldAnimate: boolean,
    ) => {
      const targetInset = preservationInsetForOffset(
        baseLayoutOffset,
        targetLayoutOffset,
        naturalEndGap,
      );
      if (
        shouldAnimate &&
        Math.abs(renderedOffset - targetOffset) > 0.5 &&
        !prefersReducedMotion()
      ) {
        pendingScrollPreservationInsetRef.current = targetInset;
        settlingLayoutOffsetRef.current = layoutOffset;
        setSettlingLayoutOffset(layoutOffset);
        return;
      }
      pendingScrollPreservationInsetRef.current = null;
      settlingLayoutOffsetRef.current = null;
      setSettlingLayoutOffset(null);
      // Released on the detent, so there is no travel left to animate — but
      // the layout split may still differ from the one the drag rendered
      // with (magnetize() lands a slow drag exactly on a detent). Swapping
      // height for transform is only invisible while transitions are off:
      // with them live, the composited transform would animate the whole
      // swap while the layout height jumped, throwing the sheet the wrong
      // way. Reconcile in one transition-free frame instead.
      setIsScrollAreaReconciling(
        Math.abs(layoutOffset - targetLayoutOffset) > 0.5,
      );
      updateScrollPreservationInset(targetInset);
    },
    [updateScrollPreservationInset],
  );
  const activeOffsetRef = useRef(0);
  activeOffsetRef.current = isDragging ? dragOffset : settledOffset;
  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;

  const onDismissRef = useRef(onDismiss);
  const canDismissRef = useRef(canDismiss);
  const onSnapRef = useRef(onSnap);
  const onScrimOpacityRef = useRef(onScrimOpacity);
  const snapHeightsRef = useRef(snapHeights);
  useEffect(() => {
    onDismissRef.current = onDismiss;
    canDismissRef.current = canDismiss;
    onSnapRef.current = onSnap;
    onScrimOpacityRef.current = onScrimOpacity;
    snapHeightsRef.current = snapHeights;
  });

  // Live drag bookkeeping (refs so pointermove doesn't churn renders).
  const dragStateRef = useRef<{
    pointerId: number;
    startCoord: number;
    lastCoord: number;
    lastTime: number;
    velocity: number;
    height: number;
    baseOffset: number;
    baseLayoutOffset: number;
    renderedOffset: number;
    layoutOffset: number;
    naturalEndGap: number;
  } | null>(null);

  // Fully-open height, tracked by a ResizeObserver (see sheetRef) so detents
  // stay correct across rotation / viewport changes without re-measuring.
  const sheetHeightRef = useRef(0);
  const sheetElRef = useRef<HTMLElement | null>(null);
  const bodyNodeRef = useRef<HTMLElement | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);
  useLayoutEffect(() => {
    if (!isScrollAreaReconciling) {
      return;
    }
    // Force the transition-free transform reset to resolve before transitions
    // are restored. Otherwise both DOM updates can be coalesced and the reset
    // becomes an unintended fly-in animation from the bottom.
    void sheetElRef.current?.offsetHeight;
    const frame = requestAnimationFrame(() => {
      setIsScrollAreaReconciling(false);
    });
    return () => cancelAnimationFrame(frame);
  }, [isScrollAreaReconciling]);
  const recordSheetHeight = useCallback((renderedHeight: number) => {
    if (renderedHeight <= 0) {
      return;
    }
    // A resized or closing panel's observer reports intermediate heights
    // throughout its animation. Keep the last fully-expanded measurement
    // instead of feeding those transient values back into the rendered height.
    if (!isOpenRef.current || activeOffsetRef.current > 0) {
      return;
    }
    sheetHeightRef.current = renderedHeight;
    setSheetHeight(previousHeight =>
      previousHeight === renderedHeight ? previousHeight : renderedHeight,
    );
  }, []);
  const sheetRef = useCallback(
    (node: HTMLElement | null) => {
      observerRef.current?.disconnect();
      observerRef.current = null;
      sheetElRef.current = node;
      if (!node || typeof ResizeObserver === 'undefined') {
        if (node) {
          recordSheetHeight(node.getBoundingClientRect().height);
        }
        return;
      }
      recordSheetHeight(node.getBoundingClientRect().height);
      const ro = new ResizeObserver(entries => {
        const entry = entries[0];
        if (entry) {
          // Keep this measurement in the same border-box coordinate space as
          // getBoundingClientRect(). contentRect excludes the sheet's reserved
          // bottom padding and would make the first resized drag jump shorter.
          const borderBoxHeight = entry.borderBoxSize?.[0]?.blockSize;
          recordSheetHeight(
            borderBoxHeight ?? entry.target.getBoundingClientRect().height,
          );
        }
      });
      ro.observe(node);
      observerRef.current = ro;
    },
    [recordSheetHeight],
  );
  useEffect(() => () => observerRef.current?.disconnect(), []);

  // Reset to the tallest detent each time the sheet re-opens.
  useEffect(() => {
    if (isOpen) {
      setDragOffset(0);
      setSettledOffset(0);
      setIsDragging(false);
      setIsScrollAreaReconciling(false);
      recordSettledLayoutOffset(0);
      scrollPreservationInsetRef.current = 0;
      settlingLayoutOffsetRef.current = null;
      pendingScrollPreservationInsetRef.current = null;
      setScrollPreservationInset(0);
      setSettlingLayoutOffset(null);
    }
  }, [isOpen, recordSettledLayoutOffset]);

  // The fully-open height for detent math. Prefer the ResizeObserver-locked
  // value; fall back to a live measure of the tracked sheet element if the
  // observer hasn't reported yet.
  const measureHeight = useCallback((): number => {
    if (sheetHeightRef.current > 0) {
      return sheetHeightRef.current;
    }
    return sheetElRef.current?.getBoundingClientRect().height ?? 0;
  }, []);

  // Detent translate offsets (px) from the tallest detent, ascending. Exclude
  // the border-box portion reserved below the viewport before comparing the
  // candidate visible heights; otherwise every snap point lands that many px
  // too low. Snap heights are resolved lazily so they track the viewport.
  const detentOffsets = useCallback((height: number): number[] => {
    const visibleSheetHeight = visibleHeightForOffset(
      height,
      0,
      offscreenBlockEndInsetRef.current,
    );
    return computeDetentOffsets(
      visibleSheetHeight,
      snapHeightsRef.current?.() ?? [],
    );
  }, []);

  const cancelDrag = useCallback(
    (target?: HTMLElement) => {
      const state = dragStateRef.current;
      if (state == null) {
        return;
      }

      // Clear first: releasePointerCapture() may synchronously dispatch
      // lostpointercapture, which must observe that this drag is already done.
      dragStateRef.current = null;
      if (target?.hasPointerCapture?.(state.pointerId)) {
        target.releasePointerCapture(state.pointerId);
      }
      setDragOffset(state.baseOffset);
      setIsDragging(false);
      prepareScrollAreaSettle(
        state.baseLayoutOffset,
        state.baseOffset,
        state.baseLayoutOffset,
        state.renderedOffset,
        state.layoutOffset,
        state.naturalEndGap,
        true,
      );

      // An interrupted drag returns to its previous resting detent. Restore
      // the matching scrim opacity as well so the modal shell cannot remain
      // dimmed with its sheet translated out of view.
      const offsets = detentOffsets(state.height);
      const maxOffset = offsets[offsets.length - 1];
      const shortestDetentHeight = visibleHeightForOffset(
        state.height,
        maxOffset,
        offscreenBlockEndInsetRef.current,
      );
      const dismissOffset =
        maxOffset + shortestDetentHeight * DISMISS_OVERSHOOT_RATIO;
      onScrimOpacityRef.current?.(
        scrimOpacityForOffset(state.baseOffset, offsets, dismissOffset),
      );
    },
    [detentOffsets, prepareScrollAreaSettle],
  );

  useEffect(() => {
    const handleWindowBlur = () => cancelDrag();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        cancelDrag();
      }
    };
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [cancelDrag]);

  const settleFromDrag = useCallback(
    (
      offset: number,
      velocity: number,
      height: number,
      dir: number,
      travel: number,
      baseOffset: number,
      baseLayoutOffset: number,
      renderedOffset: number,
      layoutOffset: number,
      naturalEndGap: number,
    ) => {
      const offsets = detentOffsets(height);
      const maxOffset = offsets[offsets.length - 1];
      const shortestDetentHeight = visibleHeightForOffset(
        height,
        maxOffset,
        offscreenBlockEndInsetRef.current,
      );
      const speed = Math.abs(velocity);
      const isFlick = speed > FLICK_VELOCITY && travel > FLICK_MIN_DISTANCE;
      const settleAt = (target: number) => {
        // A peek keeps the full layout height and slides below the viewport;
        // every taller detent resizes the scrolling area to what it shows.
        const targetLayoutOffset = isPeekOffset(target, offsets) ? 0 : target;
        prepareScrollAreaSettle(
          baseLayoutOffset,
          target,
          targetLayoutOffset,
          renderedOffset,
          layoutOffset,
          naturalEndGap,
          true,
        );
        recordSettledLayoutOffset(targetLayoutOffset);
        setSettledOffset(target);
        onSnapRef.current?.(
          visibleHeightForOffset(
            height,
            target,
            offscreenBlockEndInsetRef.current,
          ),
        );
        const dismissOffset =
          maxOffset + shortestDetentHeight * DISMISS_OVERSHOOT_RATIO;
        onScrimOpacityRef.current?.(
          scrimOpacityForOffset(target, offsets, dismissOffset),
        );
        if (target !== baseOffset) {
          hapticTick();
        }
      };

      if (dir > 0 && isFlick) {
        if (canDismissRef.current) {
          prepareScrollAreaSettle(
            baseLayoutOffset,
            baseOffset,
            baseLayoutOffset,
            baseLayoutOffset,
            baseLayoutOffset,
            naturalEndGap,
            false,
          );
          onDismissRef.current();
        } else {
          settleAt(maxOffset);
        }
        return;
      }
      // Fast upward flick = expand to the tallest detent (the sheet's full
      // provided height).
      if (dir < 0 && isFlick) {
        prepareScrollAreaSettle(
          baseLayoutOffset,
          0,
          0,
          renderedOffset,
          layoutOffset,
          naturalEndGap,
          true,
        );
        recordSettledLayoutOffset(0);
        setDragOffset(0);
        setSettledOffset(0);
        onSnapRef.current?.(
          visibleHeightForOffset(height, 0, offscreenBlockEndInsetRef.current),
        );
        onScrimOpacityRef.current?.(1);
        hapticTick();
        return;
      }
      if (offset > maxOffset + shortestDetentHeight * DISMISS_OVERSHOOT_RATIO) {
        if (canDismissRef.current) {
          prepareScrollAreaSettle(
            baseLayoutOffset,
            baseOffset,
            baseLayoutOffset,
            baseLayoutOffset,
            baseLayoutOffset,
            naturalEndGap,
            false,
          );
          onDismissRef.current();
        } else {
          settleAt(maxOffset);
        }
        return;
      }
      // Settle to the nearest detent in the drag direction (never back past
      // the starting detent), de-duped and direction-clamped by the util.
      const target = resolveSettleOffset(offset, offsets, dir, baseOffset);
      settleAt(target);
    },
    [detentOffsets, prepareScrollAreaSettle, recordSettledLayoutOffset],
  );

  const beginDrag = useCallback(
    (event: ReactPointerEvent, sheetHeight: number, startCoord?: number) => {
      const target = event.currentTarget as HTMLElement;
      target.setPointerCapture?.(event.pointerId);
      // `startCoord` lets a body-overscroll drag anchor at the original
      // pointer-down position (not the promotion point), so the first frame's
      // delta reflects the full pull distance.
      const start = startCoord ?? event.clientY;
      const body = bodyNodeRef.current;
      const renderedInset = body ? renderedBlockEndPadding(body) : 0;
      const naturalMaxScrollTop = body
        ? Math.max(0, body.scrollHeight - body.clientHeight - renderedInset)
        : 0;
      const naturalEndGap = body ? naturalMaxScrollTop - body.scrollTop : 0;
      const baseLayoutOffset = settledLayoutOffsetRef.current;
      dragStateRef.current = {
        pointerId: event.pointerId,
        startCoord: start,
        lastCoord: event.clientY,
        lastTime: event.timeStamp,
        velocity: 0,
        height: sheetHeight,
        baseOffset: settledOffset,
        baseLayoutOffset,
        renderedOffset: settledOffset,
        layoutOffset: baseLayoutOffset,
        naturalEndGap,
      };
      updateScrollPreservationInset(
        preservationInsetForOffset(
          baseLayoutOffset,
          baseLayoutOffset,
          naturalEndGap,
        ),
      );
      // Seed dragOffset at the resting detent so flipping isDragging doesn't
      // jump the sheet to fully-open for one frame.
      setDragOffset(settledOffset);
      setIsDragging(true);
    },
    [settledOffset, updateScrollPreservationInset],
  );

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent) => {
      if (event.button !== 0 || !event.isPrimary) {
        return;
      }
      // The handle has no native focus action. Prevent pointer-down from
      // moving focus off a form control on a tap; once the pointer actually
      // moves, BottomSheet dismisses the keyboard as sheet travel begins.
      event.preventDefault();
      beginDrag(event, measureHeight());
    },
    [beginDrag, measureHeight],
  );

  const handleContextMenu = useCallback(
    (event: ReactMouseEvent) => {
      if (dragStateRef.current == null) {
        return;
      }
      event.preventDefault();
      cancelDrag(event.currentTarget as HTMLElement);
    },
    [cancelDrag],
  );

  const handleLostPointerCapture = useCallback(
    (event: ReactPointerEvent) => {
      if (dragStateRef.current?.pointerId === event.pointerId) {
        cancelDrag();
      }
    },
    [cancelDrag],
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent) => {
      const state = dragStateRef.current;
      if (!state || state.pointerId !== event.pointerId) {
        return;
      }
      const delta = event.clientY - state.startCoord;
      const dt = event.timeStamp - state.lastTime;
      if (dt > 0) {
        state.velocity = (event.clientY - state.lastCoord) / dt;
        state.lastCoord = event.clientY;
        state.lastTime = event.timeStamp;
      }
      const offsets = detentOffsets(state.height);

      const raw = state.baseOffset + delta;
      const maxDetentOffset = offsets[offsets.length - 1];
      let next: number;
      if (raw < 0) {
        // Up past fully-open: damped + capped rubber-band; springs back on release.
        next = Math.max(-OVERSCROLL_MAX, raw * OVERSCROLL_RESISTANCE);
      } else if (raw > maxDetentOffset) {
        // In the dismiss zone: no magnet, so it doesn't fight a drag-to-close.
        next = raw;
      } else {
        // Between detents: magnetically ease toward a nearby one.
        next = magnetize(raw, offsets);
      }
      // Dragging above the base restores the full layout height below the
      // viewport; otherwise keep whatever layout the base detent settled with
      // (0 at a peek, so a peek drag stays transform-only).
      const layoutOffset = next < state.baseOffset ? 0 : state.baseLayoutOffset;
      state.renderedOffset = next;
      state.layoutOffset = layoutOffset;
      setDragOffset(next);
      updateScrollPreservationInset(
        preservationInsetForOffset(
          state.baseLayoutOffset,
          layoutOffset,
          state.naturalEndGap,
        ),
      );

      // Mirror the scrim to the live drag: full at/above the mid detent,
      // fading to hidden as it collapses onto the peek detent and through the
      // dismiss overshoot.
      const floorOffset = offsets[offsets.length - 1];
      const shortestDetentHeight = visibleHeightForOffset(
        state.height,
        floorOffset,
        offscreenBlockEndInsetRef.current,
      );
      const dismissOffset =
        floorOffset + shortestDetentHeight * DISMISS_OVERSHOOT_RATIO;
      onScrimOpacityRef.current?.(
        scrimOpacityForOffset(next, offsets, dismissOffset),
      );
    },
    [detentOffsets, updateScrollPreservationInset],
  );

  const endDrag = useCallback(
    (event: ReactPointerEvent) => {
      const state = dragStateRef.current;
      if (!state || state.pointerId !== event.pointerId) {
        return;
      }
      const target = event.currentTarget as HTMLElement;
      const delta = event.clientY - state.startCoord;
      const offset = Math.max(0, state.baseOffset + delta);
      const dir = delta === 0 ? 0 : delta > 0 ? 1 : -1;
      dragStateRef.current = null;
      target.releasePointerCapture?.(event.pointerId);
      setIsDragging(false);
      settleFromDrag(
        offset,
        state.velocity,
        state.height || 1,
        dir,
        Math.abs(delta),
        state.baseOffset,
        state.baseLayoutOffset,
        state.renderedOffset,
        state.layoutOffset,
        state.naturalEndGap,
      );
    },
    [settleFromDrag],
  );

  // Pointer path for the body at-top pull-down (desktop / mouse). Touch uses
  // the non-passive listener below, since pointer events are cancelled once a
  // native pan starts.
  const armedBodyRef = useRef<{
    pointerId: number;
    startCoord: number;
    scroller: HTMLElement;
  } | null>(null);

  const handleBodyPointerDown = useCallback((event: ReactPointerEvent) => {
    if (event.button !== 0 || !event.isPrimary) {
      return;
    }
    const scroller = event.currentTarget as HTMLElement;
    if (scroller.scrollTop > 0) {
      armedBodyRef.current = null;
      return;
    }
    armedBodyRef.current = {
      pointerId: event.pointerId,
      startCoord: event.clientY,
      scroller,
    };
  }, []);

  const handleBodyPointerMove = useCallback(
    (event: ReactPointerEvent) => {
      if (dragStateRef.current) {
        handlePointerMove(event);
        return;
      }
      const armed = armedBodyRef.current;
      if (!armed || armed.pointerId !== event.pointerId) {
        return;
      }
      const delta = event.clientY - armed.startCoord;
      if (delta > 0 && armed.scroller.scrollTop <= 0) {
        // Downward pull at the top: promote to a sheet drag, anchored at the
        // original pointer-down position so the pull distance carries over.
        armedBodyRef.current = null;
        beginDrag(event, measureHeight(), armed.startCoord);
        handlePointerMove(event);
      } else if (delta < 0) {
        // Upward move = the user is scrolling; disarm so we don't hijack it.
        armedBodyRef.current = null;
      }
    },
    [beginDrag, handlePointerMove, measureHeight],
  );

  const handleBodyEnd = useCallback(
    (event: ReactPointerEvent) => {
      armedBodyRef.current = null;
      if (dragStateRef.current) {
        endDrag(event);
      }
    },
    [endDrag],
  );

  // Non-passive touchmove is the reliable scroll<->drag handoff on touch:
  // preventDefault() at a scroll edge stops the native scroll and drives the
  // sheet drag through the pointer math (Touch adapted to the fields it reads).
  const touchDragRef = useRef<{
    id: number;
    startY: number;
    top: boolean;
    bottom: boolean;
  } | null>(null);
  const previousTouchHandlersRef = useRef<{
    start: (e: TouchEvent) => void;
    move: (e: TouchEvent) => void;
    end: (e: TouchEvent) => void;
  } | null>(null);

  const beginDragRef = useRef(beginDrag);
  const cancelDragRef = useRef(cancelDrag);
  const pointerMoveRef = useRef(handlePointerMove);
  const endDragRef = useRef(endDrag);
  const measureHeightRef = useRef(measureHeight);
  useEffect(() => {
    beginDragRef.current = beginDrag;
    cancelDragRef.current = cancelDrag;
    pointerMoveRef.current = handlePointerMove;
    endDragRef.current = endDrag;
    measureHeightRef.current = measureHeight;
  });

  const bodyRef = useCallback((node: HTMLElement | null) => {
    const asPointer = (touch: Touch, target: HTMLElement) =>
      ({
        pointerId: touch.identifier,
        clientY: touch.clientY,
        timeStamp: Date.now(),
        currentTarget: target,
        setPointerCapture: () => {},
        releasePointerCapture: () => {},
      }) as unknown as ReactPointerEvent;

    const atTop = (el: HTMLElement) => el.scrollTop <= 0;
    const atBottom = (el: HTMLElement) =>
      el.scrollTop + el.clientHeight >= el.scrollHeight - 1;

    const onTouchStart = (event: TouchEvent) => {
      const scroller = event.currentTarget as HTMLElement;
      const touch = event.changedTouches[0];
      // Arm only at a scroll edge; from mid-content this is an ordinary scroll.
      // At the top, a pull DOWN hands off (collapse); at the bottom, a pull UP
      // hands off (expand). Record the edge so the move handler matches it.
      if (!touch) {
        touchDragRef.current = null;
        return;
      }
      const top = atTop(scroller);
      const bottom = atBottom(scroller);
      if (!top && !bottom) {
        touchDragRef.current = null;
        return;
      }
      touchDragRef.current = {
        id: touch.identifier,
        startY: touch.clientY,
        top,
        bottom,
      };
    };

    const onTouchMove = (event: TouchEvent) => {
      const scroller = event.currentTarget as HTMLElement;
      if (dragStateRef.current) {
        const t = [...event.changedTouches].find(
          x => x.identifier === dragStateRef.current?.pointerId,
        );
        if (t) {
          event.preventDefault();
          pointerMoveRef.current(asPointer(t, scroller));
        }
        return;
      }
      const armed = touchDragRef.current;
      if (!armed) {
        return;
      }
      const t = [...event.changedTouches].find(x => x.identifier === armed.id);
      if (!t) {
        return;
      }
      const delta = t.clientY - armed.startY;
      // Promote to a sheet drag on a pull that opposes the armed edge and can
      // no longer scroll that way: at the top, a downward pull (delta > 0)
      // collapses; at the bottom, an upward pull (delta < 0) expands. The
      // opposite direction is a real scroll, so disarm and let it through.
      const pullDownAtTop = armed.top && delta > 0 && atTop(scroller);
      const pullUpAtBottom = armed.bottom && delta < 0 && atBottom(scroller);
      if (pullDownAtTop || pullUpAtBottom) {
        event.preventDefault();
        touchDragRef.current = null;
        beginDragRef.current(
          asPointer(t, scroller),
          measureHeightRef.current(),
          armed.startY,
        );
        pointerMoveRef.current(asPointer(t, scroller));
      } else if ((armed.top && delta < 0) || (armed.bottom && delta > 0)) {
        // Scrolling away from the armed edge; hand back to native scroll.
        touchDragRef.current = null;
      }
    };

    const onTouchEnd = (event: TouchEvent) => {
      touchDragRef.current = null;
      const pointerId = dragStateRef.current?.pointerId;
      if (pointerId == null) {
        return;
      }
      const t = [...event.changedTouches].find(
        touch => touch.identifier === pointerId,
      );
      const target = event.currentTarget as HTMLElement;
      if (t) {
        endDragRef.current(asPointer(t, target));
      } else if (event.touches.length === 0) {
        // Some interrupted multi-touch sequences omit the active touch from
        // changedTouches. If no fingers remain, the drag cannot finish later.
        cancelDragRef.current(target);
      }
    };

    const prev = bodyNodeRef.current;
    if (prev && previousTouchHandlersRef.current) {
      const h = previousTouchHandlersRef.current;
      prev.removeEventListener('touchstart', h.start);
      prev.removeEventListener('touchmove', h.move);
      prev.removeEventListener('touchend', h.end);
      prev.removeEventListener('touchcancel', h.end);
    }
    bodyNodeRef.current = node;
    if (node) {
      node.addEventListener('touchstart', onTouchStart, {passive: true});
      node.addEventListener('touchmove', onTouchMove, {passive: false});
      node.addEventListener('touchend', onTouchEnd, {passive: true});
      node.addEventListener('touchcancel', onTouchEnd, {passive: true});
      previousTouchHandlersRef.current = {
        start: onTouchStart,
        move: onTouchMove,
        end: onTouchEnd,
      };
    } else {
      previousTouchHandlersRef.current = null;
    }
  }, []);

  const reducedMotion = useMemo(() => prefersReducedMotion(), [isOpen]);

  const reconcileScrollPreservationInset = useCallback(
    (body: HTMLElement) => {
      if (scrollPreservationInsetRef.current <= 0) {
        return;
      }
      const renderedInset = renderedBlockEndPadding(body);
      const naturalMaxScrollTop = Math.max(
        0,
        body.scrollHeight - body.clientHeight - renderedInset,
      );
      const requiredInset = Math.max(0, body.scrollTop - naturalMaxScrollTop);
      if (requiredInset < scrollPreservationInsetRef.current - 0.5) {
        updateScrollPreservationInset(requiredInset);
      }
    },
    [updateScrollPreservationInset],
  );

  const handleBodyScroll = useCallback(
    (event: ReactUIEvent<HTMLElement>) => {
      if (
        dragStateRef.current != null ||
        settlingLayoutOffsetRef.current != null
      ) {
        return;
      }
      reconcileScrollPreservationInset(event.currentTarget);
    },
    [reconcileScrollPreservationInset],
  );

  // While dragging, follow the finger; otherwise rest at the settled detent.
  const activeOffset = isDragging ? dragOffset : settledOffset;

  const contentProps = useMemo<SheetContentProps>(
    () => ({
      style: {
        transform:
          activeOffset !== 0 ? `translateY(${activeOffset}px)` : undefined,
        transition:
          isDragging || isScrollAreaReconciling || reducedMotion
            ? 'none'
            : undefined,
        touchAction: 'none',
        overscrollBehavior: 'contain',
      },
    }),
    [activeOffset, isDragging, isScrollAreaReconciling, reducedMotion],
  );

  const handleProps = useMemo<SheetHandleProps>(
    () => ({
      style: {touchAction: 'none', cursor: 'grab'},
      onContextMenu: handleContextMenu,
      onLostPointerCapture: handleLostPointerCapture,
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
    }),
    [
      endDrag,
      handleContextMenu,
      handleLostPointerCapture,
      handlePointerDown,
      handlePointerMove,
    ],
  );

  const bodyProps = useMemo<SheetBodyProps>(
    () => ({
      ref: bodyRef,
      onContextMenu: handleContextMenu,
      onLostPointerCapture: handleLostPointerCapture,
      onPointerDown: handleBodyPointerDown,
      onPointerMove: handleBodyPointerMove,
      onPointerUp: handleBodyEnd,
      onPointerCancel: handleBodyEnd,
      onScroll: handleBodyScroll,
    }),
    [
      bodyRef,
      handleBodyEnd,
      handleBodyPointerDown,
      handleBodyPointerMove,
      handleBodyScroll,
      handleContextMenu,
      handleLostPointerCapture,
    ],
  );

  return {
    sheetRef,
    contentProps,
    handleProps,
    bodyProps,
    dragOffset,
    settledOffset,
    isDragging,
    sheetHeight,
    scrollPreservationInset,
    settlingLayoutOffset,
    settledLayoutOffset,
    completeScrollAreaSettle,
  };
}
