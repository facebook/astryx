'use client';

import {useCallback, useMemo, useRef, useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {spacingVars} from '../theme/tokens.stylex';
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
    gap: spacingVars['--spacing-3'],
    padding: spacingVars['--spacing-4'],
    pointerEvents: 'none',
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
  toastWrapper: {pointerEvents: 'auto'},
});

export interface XDSToastViewportProps {
  position?: XDSToastPosition;
  maxVisible?: number;
  inset?: {top?: number; bottom?: number; start?: number; end?: number};
  children?: React.ReactNode;
}

export function XDSToastViewport({
  position = 'bottomEnd',
  maxVisible = 5,
  inset,
  children,
}: XDSToastViewportProps) {
  const [toasts, setToasts] = useState<XDSToastEntry[]>([]);
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
      setToasts(prev => {
        const entry = prev.find(t => t.id === id);
        if (entry) entry.options.onHide?.(reason);
        return prev.filter(t => t.id !== id);
      });
    },
    [],
  );

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
        role="region"
        aria-label="Notifications"
        {...stylex.props(styles.viewport, posStyle)}
        style={Object.keys(insetStyle).length > 0 ? insetStyle : undefined}>
        {visibleToasts.map(entry => {
          const o = entry.options;
          const type = o.type ?? 'info';
          const isAutoHide = o.isAutoHide ?? (type === 'error' ? false : true);
          const dur = o.autoHideDuration ?? 5000;
          return (
            <div key={entry.id} {...stylex.props(styles.toastWrapper)}>
              <XDSToast
                type={type}
                title={o.title}
                body={o.body}
                icon={o.icon}
                endContent={o.endContent}
                isAutoHide={isAutoHide}
                autoHideDuration={dur}
                onDismiss={reason => removeToast(entry.id, reason)}
              />
            </div>
          );
        })}
      </div>
    </XDSToastContext.Provider>
  );
}
XDSToastViewport.displayName = 'XDSToastViewport';
