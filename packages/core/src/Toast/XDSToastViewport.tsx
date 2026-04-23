'use client';

import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {spacingVars, durationVars, easeVars} from '../theme/tokens.stylex';
import {mergeProps} from '../utils';
import {XDSToast} from './XDSToast';
import {XDSToastContext, type XDSToastContextValue} from './XDSToastContext';
import type {
  XDSToastEntry,
  XDSToastPosition,
  XDSToastDismissReason,
} from './types';

const styles = stylex.create({
  viewport: {
    position: 'fixed',
    zIndex: 500,
    display: 'flex',
    flexDirection: 'column',
    padding: spacingVars['--spacing-4'],
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
    paddingBlockEnd: spacingVars['--spacing-3'],
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
  toastWrapperExiting: {
    gridTemplateRows: '0fr',
    paddingBlockEnd: 0,
  },
  toastWrapperInner: {
    overflow: 'hidden',
  },
});

export interface XDSToastViewportProps {
  position?: XDSToastPosition;
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
 * of your app to enable useXDSToast(). Toasts stack with enter/exit
 * animations and auto-promote to the CSS top layer.
 *
 * @example
 * ```
 * <XDSToastViewport position="bottomEnd" maxVisible={3}>
 *   <App />
 * </XDSToastViewport>
 * ```
 */
export function XDSToastViewport({
  position = 'bottomEnd',
  maxVisible = 5,
  inset,
  isTopLayer = true,
  children,
}: XDSToastViewportProps) {
  const [toasts, setToasts] = useState<XDSToastEntry[]>([]);
  const [exitingIds, setExitingIds] = useState<Set<string>>(new Set());
  const toastsRef = useRef(toasts);
  toastsRef.current = toasts;

  const addToast = useCallback((entry: XDSToastEntry) => {
    setToasts(prev => {
      const {uniqueID, collisionBehavior = 'overwrite'} = entry.options;
      if (uniqueID) {
        const existing = prev.find(t => t.options.uniqueID === uniqueID);
        if (existing) {
          if (collisionBehavior === 'ignore') return prev;
          return prev.map(t => (t.options.uniqueID === uniqueID ? entry : t));
        }
      }
      return [...prev, entry];
    });
  }, []);

  const removeToast = useCallback(
    (id: string, reason: XDSToastDismissReason) => {
      const entry = toastsRef.current.find(t => t.id === id);
      if (entry) entry.options.onHide?.(reason);
      setExitingIds(prev => {
        if (prev.has(id)) return prev;
        return new Set(prev).add(id);
      });
    },
    [],
  );

  const handleExited = useCallback((id: string) => {
    setExitingIds(prev => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const findByUniqueID = useCallback((uid: string) => {
    return toastsRef.current.find(t => t.options.uniqueID === uid);
  }, []);

  const contextValue = useMemo<XDSToastContextValue>(
    () => ({addToast, removeToast, findByUniqueID}),
    [addToast, removeToast, findByUniqueID],
  );

  const visibleToasts = toasts.slice(-maxVisible);
  const insetStyle: React.CSSProperties = {};
  if (inset?.top) insetStyle.top = inset.top;
  if (inset?.bottom) insetStyle.bottom = inset.bottom;
  if (inset?.start) insetStyle.insetInlineStart = inset.start;
  if (inset?.end) insetStyle.insetInlineEnd = inset.end;

  // Show the popover on mount so it enters the top layer
  const viewportRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isTopLayer) return;
    const el = viewportRef.current;
    if (el && typeof el.showPopover === 'function') {
      try {
        el.showPopover();
      } catch {
        /* already showing */
      }
    }
  }, [isTopLayer]);

  const posStyle =
    position === 'topEnd'
      ? styles.topEnd
      : position === 'topStart'
        ? styles.topStart
        : position === 'bottomStart'
          ? styles.bottomStart
          : styles.bottomEnd;

  return (
    <XDSToastContext.Provider value={contextValue}>
      {children}
      <div
        ref={viewportRef}
        role="region"
        aria-label="Notifications"
        // popover="manual" promotes to the top layer (above dialogs).
        // Omitted inside dialogs where the viewport is already in a top layer.
        popover={isTopLayer ? 'manual' : undefined}
        {...mergeProps(stylex.props(styles.viewport, posStyle), {
          style: Object.keys(insetStyle).length > 0 ? insetStyle : undefined,
        })}>
        {visibleToasts.map(entry => {
          const o = entry.options;
          const type = o.type ?? 'info';
          const isAutoHide = o.isAutoHide ?? (type === 'error' ? false : true);
          const dur = o.autoHideDuration ?? 5000;
          const isExiting = exitingIds.has(entry.id);
          return (
            <div
              key={entry.id}
              {...stylex.props(
                styles.toastWrapper,
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
                <XDSToast
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
    </XDSToastContext.Provider>
  );
}
XDSToastViewport.displayName = 'XDSToastViewport';
