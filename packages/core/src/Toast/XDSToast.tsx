'use client';

import {useCallback, useEffect, useRef} from 'react';
import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSButton} from '../Button';
import {XDSIcon} from '../Icon';
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
import {xdsClassName, mergeProps} from '../utils';
import {useXDSTheme} from '../theme';
import {XDSMediaTheme} from '../theme/XDSMediaTheme';
import type {XDSToastType, XDSToastDismissReason} from './types';

const styles = stylex.create({
  root: {
    paddingBlock: spacingVars['--spacing-4'],
    paddingInline: spacingVars['--spacing-4'],
    borderRadius: radiusVars['--radius-container'],
    width: 400,
    maxWidth: 'calc(100vw - 32px)',
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
  inner: {
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

export interface XDSToastProps {
  type: XDSToastType;
  body: ReactNode;
  endContent?: ReactNode;
  isAutoHide: boolean;
  autoHideDuration: number;
  isExiting?: boolean;
  onDismiss: (reason: XDSToastDismissReason) => void;
}

/**
 * Individual toast notification.
 *
 * Renders with inverted surface colors for the default variant,
 * and error-inverted for the error variant. Uses XDSMediaTheme
 * to set the correct token context for children. Pauses auto-dismiss
 * on hover and focus.
 *
 * @example
 * ```
 * <XDSToast
 *   type="info"
 *   body="Saved successfully"
 *   isAutoHide={true}
 *   autoHideDuration={5000}
 *   onDismiss={(reason) => removeToast(id, reason)}
 * />
 * ```
 */
export function XDSToast({
  type,
  body,
  endContent,
  isAutoHide,
  autoHideDuration,
  isExiting = false,
  onDismiss,
}: XDSToastProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPausedRef = useRef(false);
  const remainingRef = useRef(autoHideDuration);
  const startTimeRef = useRef(Date.now());

  const startTimer = useCallback(() => {
    if (!isAutoHide) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      onDismiss('auto');
    }, remainingRef.current);
  }, [isAutoHide, onDismiss]);

  const pauseTimer = useCallback(() => {
    if (!isAutoHide || isPausedRef.current) return;
    isPausedRef.current = true;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const elapsed = Date.now() - startTimeRef.current;
    remainingRef.current = Math.max(remainingRef.current - elapsed, 1000);
  }, [isAutoHide]);

  const resumeTimer = useCallback(() => {
    if (!isAutoHide || !isPausedRef.current) return;
    isPausedRef.current = false;
    startTimer();
  }, [isAutoHide, startTimer]);

  useEffect(() => {
    remainingRef.current = autoHideDuration;
    startTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [autoHideDuration, startTimer]);

  const handleDismiss = useCallback(() => {
    onDismiss('manual');
  }, [onDismiss]);

  const isError = type === 'error';
  // Determine media mode: inverted surface is always dark in light mode,
  // always light in dark mode. Error toast is always on a dark surface.
  const {mode} = useXDSTheme();
  const mediaMode = isError || mode === 'light' ? 'dark' : 'light';

  return (
    <div
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? 'assertive' : 'polite'}
      aria-atomic="true"
      onMouseEnter={pauseTimer}
      onMouseLeave={resumeTimer}
      onFocusCapture={pauseTimer}
      onBlurCapture={resumeTimer}
      {...mergeProps(
        xdsClassName('toast', {type}),
        stylex.props(
          styles.root,
          isError ? styles.variantError : styles.variantDefault,
          isExiting && styles.exiting,
        ),
      )}>
      <XDSMediaTheme mode={mediaMode}>
        <div {...stylex.props(styles.inner)}>
          <div {...stylex.props(styles.content)}>{body}</div>

          <div {...stylex.props(styles.endContent)}>
            {endContent}
            <XDSButton
              variant="ghost"
              size="sm"
              icon={<XDSIcon icon="close" size="sm" color="inherit" />}
              label="Dismiss notification"
              onClick={handleDismiss}
              isIconOnly
            />
          </div>
        </div>
      </XDSMediaTheme>
    </div>
  );
}

XDSToast.displayName = 'XDSToast';
