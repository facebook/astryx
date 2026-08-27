// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ToastViewport.tsx
 * @input Uses React state/effects, ToastContext, useAnnounce, viewport tokens,
 *   and placement-derived motion variables
 * @output Exports the ToastViewport provider, stack, live announcement dispatch,
 *   focus handoff, safe-area-aware edge gutters, and motion context
 * @position Core provider/imperative viewport for useToast()
 *
 * SYNC: When placement, stacking, focus, announcement, or safe-area behavior
 *   changes, update ToastViewport.test.tsx, Toast.doc.mjs, and Toast.stories.tsx.
 */

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

const SAFE_AREA_INLINE_START = `max(${spacingVars['--spacing-4']}, env(safe-area-inset-left, 0px))`;
const SAFE_AREA_INLINE_END = `max(${spacingVars['--spacing-4']}, env(safe-area-inset-right, 0px))`;
const SAFE_AREA_BLOCK_START = `max(${spacingVars['--spacing-4']}, env(safe-area-inset-top, 0px))`;
const SAFE_AREA_BLOCK_END = `max(${spacingVars['--spacing-4']}, env(safe-area-inset-bottom, 0px))`;
const TOAST_EDGE_DRIFT = spacingVars['--spacing-2'];
const TOAST_EDGE_DRIFT_NEGATIVE = `calc(-1 * ${TOAST_EDGE_DRIFT})`;

const styles = stylex.create({
  viewport: {
    position: 'fixed',
    zIndex: 500,
    display: 'flex',
    boxSizing: 'border-box',
    flexDirection: 'column',
    paddingBlockStart: SAFE_AREA_BLOCK_START,
    paddingBlockEnd: SAFE_AREA_BLOCK_END,
    paddingInlineStart: {
      default: SAFE_AREA_INLINE_START,
      ':is([dir="rtl"] *)': SAFE_AREA_INLINE_END,
    },
    paddingInlineEnd: {
      default: SAFE_AREA_INLINE_END,
      ':is([dir="rtl"] *)': SAFE_AREA_INLINE_START,
    },
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
  viewportInlineSpan: {
    insetInlineStart: 0,
    insetInlineEnd: 0,
  },
  bottomEnd: {bottom: 0, alignItems: 'flex-end'},
  bottomStart: {bottom: 0, alignItems: 'flex-start'},
  topEnd: {
    top: 0,
    alignItems: 'flex-end',
    flexDirection: 'column-reverse',
  },
  topStart: {
    top: 0,
    alignItems: 'flex-start',
    flexDirection: 'column-reverse',
  },
  toastWrapper: {
    pointerEvents: 'auto',
    display: 'grid',
    width: '100%',
    maxWidth: 400,
    minWidth: 0,
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
  toastWrapperFromBottom: {
    '--_toast-slide-y': TOAST_EDGE_DRIFT,
  },
  toastWrapperFromTop: {
    '--_toast-slide-y': TOAST_EDGE_DRIFT_NEGATIVE,
  },
  // The inter-toast gap is padding on each wrapper so it collapses with the
  // grid track. The wrapper nearest the viewport edge drops that padding; the
  // child flips because top stacks use column-reverse.
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
    width: '100%',
    maxWidth: '100%',
    minWidth: 0,
    minHeight: 0,
    // Required for the 1fr -> 0fr exit collapse to hide the shrinking Toast.
    // This preserves main's paint containment; browser-chrome behavior is not
    // changed or claimed by this responsive-layout fix.
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
  /** Maximum number of visible toasts. @default 5 */
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
      const focusable = getFocusable(nextNode) ?? nextNode;
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

  const visibleToasts = toasts.slice(-maxVisible);

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
  const toastWrapperPositionStyle = isReversed
    ? styles.toastWrapperFromTop
    : styles.toastWrapperFromBottom;
  const gapStyle = isReversed
    ? styles.toastWrapperGapReversed
    : styles.toastWrapperGap;

  return (
    <ToastContext value={contextValue}>
      {children}
      <div
        ref={viewportRef}
        role={hasToasts ? 'region' : undefined}
        aria-label={hasToasts ? t('@astryx.toast.viewport') : undefined}
        tabIndex={hasToasts ? -1 : undefined}
        // popover="manual" promotes to the top layer (above dialogs).
        // Omitted inside dialogs where the viewport is already in a top layer.
        popover={isTopLayer ? 'manual' : undefined}
        {...mergeProps(
          stylex.props(styles.viewport, styles.viewportInlineSpan, posStyle),
          {
            style: Object.keys(insetStyle).length > 0 ? insetStyle : undefined,
          },
        )}>
        {visibleToasts.map(entry => {
          const o = entry.options;
          const type = o.type ?? 'info';
          const isAutoHide = o.isAutoHide ?? (type === 'error' ? false : true);
          const dur = o.autoHideDuration ?? 5000;
          const isExiting = exitingIds.has(entry.id);
          return (
            <div
              key={entry.id}
              data-toast-id={entry.id}
              {...stylex.props(
                styles.toastWrapper,
                toastWrapperPositionStyle,
                gapStyle,
                isExiting && styles.toastWrapperExiting,
              )}
              onTransitionEnd={
                isExiting
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
