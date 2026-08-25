// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useCallback, useEffect, useRef} from 'react';
import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {Button} from '../Button';
import {Icon} from '../Icon';
import {
  colorVars,
  spacingVars,
  radiusVars,
  durationVars,
  easeVars,
  shadowVars,
  typographyVars,
  typeScaleDefaults,
} from '../theme/tokens.stylex';
import {mergeProps} from '../utils';
import {useTheme} from '../theme';
import {MediaTheme} from '../theme/MediaTheme';
import type {
  ToastType,
  ToastDismissReason,
  ToastContentRenderFn,
} from './types';
import {themeProps} from '../utils/themeProps';
import {useTranslator} from '../i18n';
import {devWarn} from '../utils/devWarning';

const styles = stylex.create({
  root: {
    paddingBlock: spacingVars['--spacing-4'],
    paddingInline: spacingVars['--spacing-4'],
    borderRadius: radiusVars['--radius-container'],
    width: 400,
    maxWidth: 'min(100%, calc(100vw - 32px))',
    boxShadow: shadowVars['--shadow-med'],
    opacity: 1,
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleDefaults['--text-body-size'],
    lineHeight: typeScaleDefaults['--text-body-leading'],
    transform: 'translateY(0)',
    transitionProperty: 'opacity, transform',
    transitionDuration: {
      default: durationVars['--duration-fast'],
      '@media (prefers-reduced-motion: reduce)': '0.01ms',
    },
    transitionTimingFunction: easeVars['--ease-standard'],
    '@starting-style': {
      opacity: 0,
      transform: 'translateY(8px)',
    },
  },
  variantDefault: {
    backgroundColor: colorVars['--color-background-inverted'],
  },
  layout: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: spacingVars['--spacing-3'],
    width: '100%',
  },
  variantError: {
    backgroundColor: colorVars['--color-background-error-inverted'],
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  exiting: {
    opacity: 0,
    transform: 'translateY(-8px)',
  },
  endContent: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    marginBlock: `calc(${spacingVars['--spacing-1']} * -1)`,
    marginInlineEnd: `calc(${spacingVars['--spacing-1']} * -1)`,
  },
});

export interface ToastProps {
  type: ToastType;
  body: ReactNode;
  endContent?: ReactNode;
  isAutoHide: boolean;
  autoHideDuration: number;
  isExiting?: boolean;
  onDismiss: (reason: ToastDismissReason) => void;
  /**
   * Replaces the content of the toast's card — see `ToastViewport`'s
   * `renderContent`, which is where an app normally sets this.
   */
  renderContent?: ToastContentRenderFn;
}

/**
 * Individual toast notification.
 *
 * Renders with inverted surface colors for the default variant,
 * and error-inverted for the error variant. Applies MediaTheme for that
 * surface, unless the painted colors make the chosen side unreadable —
 * a theme is free to define an "inverted" background that is not.
 * Pauses auto-dismiss on hover and focus.
 *
 * @example
 * ```
 * <Toast
 *   type="info"
 *   body="Saved successfully"
 *   isAutoHide={true}
 *   autoHideDuration={5000}
 *   onDismiss={(reason) => removeToast(id, reason)}
 * />
 * ```
 */
export function Toast({
  type,
  body,
  endContent,
  isAutoHide,
  autoHideDuration,
  isExiting = false,
  onDismiss,
  renderContent,
}: ToastProps) {
  const t = useTranslator();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPausedRef = useRef(false);
  const remainingRef = useRef(autoHideDuration);
  // Will be initialized by startTimer when actually used
  const startTimeRef = useRef<number | null>(null);

  // Read onDismiss through a ref: the viewport re-creates it on every render
  // (another toast arriving/exiting), and a startTimer that depends on it
  // would restart — and un-pause — this toast's timer on unrelated renders.
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  const startTimer = useCallback(() => {
    if (!isAutoHide || isPausedRef.current) {
      return;
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      onDismissRef.current('auto');
    }, remainingRef.current);
  }, [isAutoHide]);

  const pauseTimer = useCallback(() => {
    if (!isAutoHide || isPausedRef.current) {
      return;
    }
    isPausedRef.current = true;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (startTimeRef.current != null) {
      const elapsed = Date.now() - startTimeRef.current;
      remainingRef.current = Math.max(remainingRef.current - elapsed, 1000);
    }
  }, [isAutoHide]);

  const resumeTimer = useCallback(() => {
    if (!isAutoHide || !isPausedRef.current) {
      return;
    }
    isPausedRef.current = false;
    startTimer();
  }, [isAutoHide, startTimer]);

  useEffect(() => {
    remainingRef.current = autoHideDuration;
    startTimer();
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
    // startTimer's identity is stable per isAutoHide, so this runs on mount
    // and on a genuine duration change — not on unrelated viewport renders.
  }, [autoHideDuration, startTimer]);

  // Pause the auto-hide timer while the window is not focused, so a toast
  // doesn't silently expire while the user is in another window or tab.
  useEffect(() => {
    if (!isAutoHide) {
      return;
    }
    window.addEventListener('blur', pauseTimer);
    window.addEventListener('focus', resumeTimer);
    return () => {
      window.removeEventListener('blur', pauseTimer);
      window.removeEventListener('focus', resumeTimer);
    };
  }, [isAutoHide, pauseTimer, resumeTimer]);

  const handleDismiss = useCallback(() => {
    onDismiss('manual');
  }, [onDismiss]);

  // Built here rather than inside the default layout so `renderContent` can be
  // handed the very same control: a custom layout gets Astryx's close, with
  // its translated label and its `astryx-button` theming, instead of having
  // to rebuild one and get those right itself.
  const dismissButton = (
    <Button
      variant="ghost"
      size="sm"
      icon={<Icon icon="close" size="sm" color="inherit" />}
      label={t('@astryx.toast.dismiss')}
      onClick={handleDismiss}
      isIconOnly
      // Marks the control so the dev check below can tell whether a custom
      // layout actually placed it. Not a theming target — `astryx-button`
      // already is one.
      data-astryx-toast-dismiss=""
    />
  );

  // A toast that does not auto-hide has exactly one exit, and `renderContent`
  // is free to drop it on the floor. Warn rather than police it: per the API
  // conventions a component renders what it is given, and an auto-hiding toast
  // without a close is a legitimate choice. This is only the case that traps
  // someone — the toast stays on screen, announced, with no way out.
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (renderContent == null || isAutoHide) {
      return;
    }
    if (rootRef.current?.querySelector('[data-astryx-toast-dismiss]') == null) {
      devWarn(
        'Toast',
        'renderContent did not render `dismissButton`, and this toast does ' +
          'not auto-hide — it cannot be dismissed. Place `dismissButton` ' +
          'somewhere in your layout, or set `isAutoHide`.',
      );
    }
  }, [renderContent, isAutoHide]);

  const isError = type === 'error';
  // The surface is *usually* dark in light mode and light in dark mode, but a
  // theme can define --color-background-inverted as anything — so the mode is
  // measured, not assumed. This is only the pre-measurement fallback.
  const {mode} = useTheme();
  const fallbackMediaMode = isError || mode === 'light' ? 'dark' : 'light';

  return (
    <div
      ref={rootRef}
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? 'assertive' : 'polite'}
      aria-atomic="true"
      onMouseEnter={pauseTimer}
      onMouseLeave={resumeTimer}
      onFocusCapture={pauseTimer}
      onBlurCapture={resumeTimer}
      {...mergeProps(
        themeProps('toast', {type}),
        stylex.props(
          styles.root,
          isError ? styles.variantError : styles.variantDefault,
          isExiting && styles.exiting,
        ),
      )}>
      <MediaTheme mode="auto" fallback={fallbackMediaMode}>
        {renderContent ? (
          renderContent({
            body,
            endContent,
            dismissButton,
            type,
            isAutoHide,
            autoHideDuration,
            dismiss: handleDismiss,
          })
        ) : (
          <div {...stylex.props(styles.layout)}>
            <div {...stylex.props(styles.content)}>{body}</div>

            <div {...stylex.props(styles.endContent)}>
              {endContent}
              {dismissButton}
            </div>
          </div>
        )}
      </MediaTheme>
    </div>
  );
}

Toast.displayName = 'Toast';
