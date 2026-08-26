// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {
  isValidElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {spacingVars, durationVars, easeVars} from '../theme/tokens.stylex';
import {mergeProps} from '../utils';
import {INTERACTIVE_SELECTORS} from '../hooks/useClickableContainer';
import {useAnnounce} from '../hooks/useAnnounce';
import {Toast} from './Toast';
import {ToastContext, type ToastContextValue} from './ToastContext';
import type {ToastEntry, ToastPosition, ToastDismissReason} from './types';
import {useTranslator} from '../i18n';

const styles = stylex.create({
  viewport: {
    position: 'fixed',
    zIndex: 500,
    display: 'flex',
    flexDirection: 'column',
    // The edge gutter has to clear the device's safe area — a notch, a home
    // indicator, or a rounded corner — not just the 16px design gutter.
    // env() insets are PHYSICAL, so the inline axis cannot just pair
    // inline-start with inset-left: under `dir="rtl"` inline-start is the
    // right edge and the gutter would be reserved on the wrong side. The
    // property stays logical; the inset it reads is what swaps.
    paddingBlockStart: `max(${spacingVars['--spacing-4']}, env(safe-area-inset-top, 0px))`,
    paddingBlockEnd: `max(${spacingVars['--spacing-4']}, env(safe-area-inset-bottom, 0px))`,
    paddingInlineStart: {
      default: `max(${spacingVars['--spacing-4']}, env(safe-area-inset-left, 0px))`,
      ':is([dir="rtl"] *)': `max(${spacingVars['--spacing-4']}, env(safe-area-inset-right, 0px))`,
    },
    paddingInlineEnd: {
      default: `max(${spacingVars['--spacing-4']}, env(safe-area-inset-right, 0px))`,
      ':is([dir="rtl"] *)': `max(${spacingVars['--spacing-4']}, env(safe-area-inset-left, 0px))`,
    },
    // Never wider than the screen, gutters included, so the toasts inside get
    // a content box they can size themselves against (Toast: max-width: 100%).
    // Stated rather than inherited: core's reset is :where()-scoped, so a
    // consumer without it would otherwise get content-box here.
    boxSizing: 'border-box',
    maxInlineSize: '100%',
    pointerEvents: 'none',
    // Reset popover styles — the popover attribute puts us in the top
    // layer (above dialogs), but we don't want its default styles.
    // UA stylesheet applies background-color: Canvas, margin: auto, etc.
    inset: 'unset',
    margin: 0,
    border: 'none',
    background: 'none',
    backgroundColor: 'transparent',
    overflow: 'visible',
  },
  // Which way a toast slides on enter and exit: towards the edge the stack is
  // pinned to, so a top stack drops in from the top and a bottom stack rises
  // from the bottom. Read by Toast's @starting-style and exiting styles.
  slideFromBottom: {'--_toast-slide-y': spacingVars['--spacing-2']},
  slideFromTop: {
    '--_toast-slide-y': `calc(${spacingVars['--spacing-2']} * -1)`,
  },
  bottomEnd: {bottom: 0, insetInlineEnd: 0, alignItems: 'flex-end'},
  bottomStart: {bottom: 0, insetInlineStart: 0, alignItems: 'flex-start'},
  topEnd: {
    top: 0,
    insetInlineEnd: 0,
    alignItems: 'flex-end',
    flexDirection: 'column-reverse',
  },
  topStart: {
    top: 0,
    insetInlineStart: 0,
    alignItems: 'flex-start',
    flexDirection: 'column-reverse',
  },
  toastWrapper: {
    pointerEvents: 'auto',
    display: 'grid',
    gridTemplateRows: '1fr',
    transitionProperty: 'grid-template-rows, padding',
    transitionDuration: {
      default: durationVars['--duration-fast'],
      '@media (prefers-reduced-motion: reduce)': '0.01ms',
    },
    transitionTimingFunction: easeVars['--ease-standard'],
    '@starting-style': {
      gridTemplateRows: '0fr',
      paddingBlockEnd: 0,
    },
  },
  // The inter-toast gap is padding on each toast rather than `gap` on the
  // viewport so it can animate alongside gridTemplateRows on entry and exit.
  // That makes it the toast's own trailing space, so the toast at the visual
  // bottom of the stack has to give it up — otherwise it stacks on top of the
  // viewport's own padding. Which child that is flips with the flex direction
  // the position sets.
  toastWrapperGap: {
    paddingBlockEnd: {default: spacingVars['--spacing-2'], ':last-child': 0},
  },
  toastWrapperGapReversed: {
    paddingBlockEnd: {default: spacingVars['--spacing-2'], ':first-child': 0},
  },
  toastWrapperExiting: {
    gridTemplateRows: '0fr',
    paddingBlockEnd: 0,
  },
  toastWrapperInner: {
    overflow: 'hidden',
  },
});

// Flatten a toast's rendered content (title, description, etc.) to the plain
// text that should be spoken by a screen reader. Only text is announced —
// interactive endContent is deliberately excluded (it is reachable via F6).
function getNodeText(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') {
    return '';
  }
  if (typeof node === 'string') {
    return node;
  }
  if (typeof node === 'number') {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(getNodeText).filter(Boolean).join(' ');
  }
  if (isValidElement(node)) {
    const {children} = node.props as {children?: ReactNode};
    return getNodeText(children);
  }
  return '';
}

export interface ToastViewportProps {
  position?: ToastPosition;
  maxVisible?: number;
  inset?: {top?: number; bottom?: number; start?: number; end?: number};
  /**
   * Promote viewport to CSS top layer via popover="manual".
   * Set to false when inside a dialog or other top-layer element.
   * @default true
   */
  isTopLayer?: boolean;
  children?: React.ReactNode;
}

/**
 * Container that renders and manages toast notifications. Place at the root
 * of your app to enable useToast(). Toasts stack with enter/exit
 * animations and auto-promote to the CSS top layer.
 *
 * The stack's edge gutter clears the device safe area, and toasts slide in
 * from — and back out towards — the edge `position` pins them to. The
 * "Notifications" landmark is published only while a toast is on screen.
 *
 * @example
 * ```
 * <ToastViewport position="bottomEnd" maxVisible={3}>
 *   <App />
 * </ToastViewport>
 * ```
 */
export function ToastViewport({
  position = 'bottomEnd',
  maxVisible = 5,
  inset,
  isTopLayer = true,
  children,
}: ToastViewportProps) {
  const t = useTranslator();
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const [exitingIds, setExitingIds] = useState<Set<string>>(new Set());
  const toastsRef = useRef(toasts);
  toastsRef.current = toasts;

  // Show the popover on mount so it enters the top layer.
  const viewportRef = useRef<HTMLDivElement>(null);
  // Toast ids whose exit has begun — guards onHide from double-firing (see
  // removeToast). Mirrors exitingIds state, readable synchronously.
  const exitingIdsRef = useRef<Set<string>>(new Set());
  // The element that was focused before the user jumped into the viewport
  // (via F6). Used to restore focus once all toasts are dismissed so focus
  // never falls to <body>.
  const prevFocusRef = useRef<HTMLElement | null>(null);
  // When a toast is dismissed while focus lives inside it, we need to move
  // focus to a sensible neighbor after that toast unmounts. This holds the
  // id of the toast whose removal should trigger a focus handoff.
  const focusHandoffIdRef = useRef<string | null>(null);
  // The next toast id that should receive focus once the dismissed toast has
  // unmounted, or 'restore' to fall back to the previously-focused element.
  const pendingFocusRef = useRef<string | 'restore' | null>(null);

  // Collect a focusable control within a toast node, if any.
  // Reuses the canonical INTERACTIVE_SELECTORS list (native controls plus
  // role-based interactive elements) instead of a hand-rolled subset, then
  // narrows to the first candidate that can actually receive focus —
  // excluding elements opted out with `tabindex="-1"` and disabled controls.
  const getFocusable = useCallback(
    (container: HTMLElement | null): HTMLElement | null => {
      if (!container) {
        return null;
      }
      const candidates = container.querySelectorAll<HTMLElement>(
        INTERACTIVE_SELECTORS,
      );
      for (const candidate of candidates) {
        if (
          candidate.getAttribute('tabindex') === '-1' ||
          candidate.hasAttribute('disabled') ||
          candidate.getAttribute('aria-disabled') === 'true'
        ) {
          continue;
        }
        return candidate;
      }
      return null;
    },
    [],
  );

  // Announce toasts through the persistent singleton live regions. Each
  // <Toast> also renders its own role="status"/"alert" region, but that region
  // is "born with content" — mounted together with its text — which many
  // screen readers do not announce (see useAnnounce.ts); the singleton regions
  // are mounted empty and only mutated afterwards, so they are what actually
  // guarantees the announcement (the per-toast markup is kept for browse-mode
  // discoverability). The announcement happens in addToast — the imperative
  // dispatch path invoked once per useToast() call from an event handler,
  // never from render — so each toast is announced exactly once by
  // construction, independent of the React render lifecycle (StrictMode
  // double-render/double-effect, viewport remounts, and unrelated list
  // re-renders never re-announce). It is client-only (addToast never runs
  // during SSR), so it is SSR-safe.
  const announce = useAnnounce();

  const addToast = useCallback(
    (entry: ToastEntry) => {
      const {uniqueID, collisionBehavior = 'overwrite'} = entry.options;
      // Resolve an ignored collision synchronously against the committed list
      // so a suppressed toast is neither shown nor announced. The remaining
      // announce + setToasts run outside the setToasts updater, which React may
      // invoke more than once — keeping the announcement exactly-once.
      if (
        uniqueID &&
        collisionBehavior === 'ignore' &&
        toastsRef.current.some(t => t.options.uniqueID === uniqueID)
      ) {
        return;
      }
      const text = getNodeText(entry.options.body);
      if (text) {
        // Error toasts map to the assertive region (role="alert"); everything
        // else to the polite region (role="status") — mirrors Toast.tsx.
        announce(text, entry.options.type === 'error' ? 'assertive' : 'polite');
      }
      setToasts(prev => {
        if (uniqueID) {
          const existing = prev.find(t => t.options.uniqueID === uniqueID);
          if (existing) {
            // An ignored collision already returned above; overwrite in place.
            return prev.map(t => (t.options.uniqueID === uniqueID ? entry : t));
          }
        }
        return [...prev, entry];
      });
    },
    [announce],
  );

  const removeToast = useCallback((id: string, reason: ToastDismissReason) => {
    // An exiting toast stays in toastsRef until its exit transition ends, so
    // a second dismissal inside that window (double-click, auto-timer plus
    // manual dismiss()) would re-fire onHide. Track exiting ids in a ref —
    // the exitingIds state dedupe below runs too late to protect onHide.
    if (exitingIdsRef.current.has(id)) {
      return;
    }
    exitingIdsRef.current.add(id);
    const entry = toastsRef.current.find(t => t.id === id);
    if (entry) {
      entry.options.onHide?.(reason);
    }
    // If focus currently lives inside the toast being dismissed, remember
    // that its removal must hand focus off to a neighbor (or the element
    // focused before the user entered the viewport) rather than <body>.
    const el = viewportRef.current;
    const active = document.activeElement;
    const dismissedNode =
      el?.querySelector<HTMLElement>(`[data-toast-id="${id}"]`) ?? null;
    if (
      dismissedNode &&
      active instanceof Node &&
      dismissedNode.contains(active)
    ) {
      focusHandoffIdRef.current = id;
      // Pick the neighbor to receive focus while the DOM is still intact:
      // prefer the next toast, then the previous, else restore.
      const remaining = toastsRef.current.filter(t => t.id !== id);
      if (remaining.length > 0) {
        const dismissedIndex = toastsRef.current.findIndex(t => t.id === id);
        const next =
          toastsRef.current[dismissedIndex + 1] ??
          toastsRef.current[dismissedIndex - 1];
        pendingFocusRef.current = next ? next.id : 'restore';
      } else {
        pendingFocusRef.current = 'restore';
      }
    }
    setExitingIds(prev => {
      if (prev.has(id)) {
        return prev;
      }
      return new Set(prev).add(id);
    });
  }, []);

  const handleExited = useCallback((id: string) => {
    exitingIdsRef.current.delete(id);
    setExitingIds(prev => {
      if (!prev.has(id)) {
        return prev;
      }
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // After a dismissed toast unmounts, hand focus off so it never falls to
  // <body>. Runs in a layout effect once the toast list no longer contains
  // the dismissed toast.
  useLayoutEffect(() => {
    const handoffId = focusHandoffIdRef.current;
    const target = pendingFocusRef.current;
    if (handoffId == null || target == null) {
      return;
    }
    // Wait until the dismissed toast is actually gone from the list.
    if (toasts.some(t => t.id === handoffId)) {
      return;
    }
    focusHandoffIdRef.current = null;
    pendingFocusRef.current = null;
    const el = viewportRef.current;
    if (target !== 'restore' && el) {
      const nextNode = el.querySelector<HTMLElement>(
        `[data-toast-id="${target}"]`,
      );
      // A queued toast is rendered but collapsed and inert — it cannot take
      // focus, so fall through to restoring the previously-focused element.
      const candidate = nextNode?.hasAttribute('inert') ? null : nextNode;
      const focusable = getFocusable(candidate) ?? candidate;
      if (focusable) {
        focusable.focus();
        return;
      }
    }
    // No remaining toast to receive focus — restore the previously-focused
    // element if it's still connected, else fall back to the container.
    const prev = prevFocusRef.current;
    prevFocusRef.current = null;
    if (prev && prev.isConnected) {
      prev.focus();
    } else if (el) {
      el.focus();
    }
  }, [toasts, getFocusable]);

  const findByUniqueID = useCallback((uid: string) => {
    return toastsRef.current.find(t => t.options.uniqueID === uid);
  }, []);

  const contextValue = useMemo<ToastContextValue>(
    () => ({addToast, removeToast, findByUniqueID}),
    [addToast, removeToast, findByUniqueID],
  );

  // Render one toast past the window. A toast pushed out by a newer one then
  // collapses the way a dismissed one does, instead of blinking out and
  // snapping the whole stack down by its height; by the time an even newer
  // toast retires it from the DOM it is already at zero height, so that
  // removal is invisible. It never leaves `toasts`, so a queued toast still
  // comes back when room opens up — now by expanding rather than popping in.
  const renderedToasts = toasts.slice(-(maxVisible + 1));
  const queuedCount = Math.max(renderedToasts.length - maxVisible, 0);
  const insetStyle: React.CSSProperties = {};
  if (inset?.top) {
    insetStyle.top = inset.top;
  }
  if (inset?.bottom) {
    insetStyle.bottom = inset.bottom;
  }
  if (inset?.start) {
    insetStyle.insetInlineStart = inset.start;
  }
  if (inset?.end) {
    insetStyle.insetInlineEnd = inset.end;
  }

  // Show the popover on mount so it enters the top layer
  useEffect(() => {
    if (!isTopLayer) {
      return;
    }
    const el = viewportRef.current;
    if (el && typeof el.showPopover === 'function') {
      try {
        el.showPopover();
      } catch {
        /* already showing */
      }
    }
  }, [isTopLayer]);

  // F6 jumps focus into the toast viewport — the standard "go to
  // notifications" affordance. Focus the first control in the newest toast,
  // or the viewport container if none. Toasts are non-modal, so this only
  // moves focus in; Shift+Tab / Escape let focus leave naturally.
  const hasToasts = toasts.length > 0;
  useEffect(() => {
    if (!hasToasts) {
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'F6') {
        return;
      }
      const el = viewportRef.current;
      if (!el) {
        return;
      }
      // Already inside the viewport — nothing to do.
      const active = document.activeElement;
      if (active instanceof Node && el.contains(active)) {
        return;
      }
      e.preventDefault();
      // Remember where focus was so it can be restored on dismiss.
      if (active instanceof HTMLElement) {
        prevFocusRef.current = active;
      }
      // Newest toast is the last one rendered in the DOM.
      const toastNodes = el.querySelectorAll<HTMLElement>('[data-toast-id]');
      const newest = toastNodes[toastNodes.length - 1] ?? null;
      const focusable = getFocusable(newest) ?? newest ?? el;
      focusable.focus();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [hasToasts, getFocusable]);

  const posStyle =
    position === 'topEnd'
      ? styles.topEnd
      : position === 'topStart'
        ? styles.topStart
        : position === 'bottomStart'
          ? styles.bottomStart
          : styles.bottomEnd;
  const isReversed = position === 'topEnd' || position === 'topStart';
  const gapStyle = isReversed
    ? styles.toastWrapperGapReversed
    : styles.toastWrapperGap;
  const slideStyle = isReversed ? styles.slideFromTop : styles.slideFromBottom;

  return (
    <ToastContext value={contextValue}>
      {children}
      <div
        ref={viewportRef}
        // Only a viewport that is actually holding a toast is a landmark. An
        // empty one would put a permanent, empty "Notifications" region in
        // every screen reader's landmark list — and since a nested viewport
        // shadows the outer one's context for its subtree (the outer can then
        // never receive a toast), it is also what stopped nested providers
        // from advertising the same landmark twice.
        role={hasToasts ? 'region' : undefined}
        aria-label={hasToasts ? t('@astryx.toast.viewport') : undefined}
        tabIndex={-1}
        // popover="manual" promotes to the top layer (above dialogs).
        // Omitted inside dialogs where the viewport is already in a top layer.
        popover={isTopLayer ? 'manual' : undefined}
        {...mergeProps(stylex.props(styles.viewport, posStyle, slideStyle), {
          style: Object.keys(insetStyle).length > 0 ? insetStyle : undefined,
        })}>
        {renderedToasts.map((entry, index) => {
          const o = entry.options;
          const type = o.type ?? 'info';
          // Beyond the visible window: collapsed to nothing and waiting for
          // room. Its auto-hide timer must not burn down while it is unseen,
          // which is what unmounting used to take care of.
          const isQueued = index < queuedCount;
          const isAutoHide = isQueued
            ? false
            : (o.isAutoHide ?? (type === 'error' ? false : true));
          const dur = o.autoHideDuration ?? 5000;
          const isDismissing = exitingIds.has(entry.id);
          const isExiting = isDismissing || isQueued;
          return (
            <div
              key={entry.id}
              data-toast-id={entry.id}
              // Collapsed to zero height but still in the DOM — keep it out of
              // the tab order and the accessibility tree until it is shown.
              inert={isQueued ? true : undefined}
              {...stylex.props(
                styles.toastWrapper,
                gapStyle,
                isExiting && styles.toastWrapperExiting,
              )}
              onTransitionEnd={
                // Only a *dismissed* toast unmounts when its collapse ends; a
                // queued one has to stay mounted so it can expand again.
                isDismissing
                  ? (e: React.TransitionEvent) => {
                      if (e.propertyName === 'grid-template-rows') {
                        handleExited(entry.id);
                      }
                    }
                  : undefined
              }>
              <div {...stylex.props(styles.toastWrapperInner)}>
                <Toast
                  type={type}
                  body={o.body}
                  endContent={o.endContent}
                  isAutoHide={isAutoHide}
                  autoHideDuration={dur}
                  isExiting={isExiting}
                  onDismiss={reason => removeToast(entry.id, reason)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext>
  );
}
ToastViewport.displayName = 'ToastViewport';
