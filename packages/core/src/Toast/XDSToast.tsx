'use client';

import {useCallback, useEffect, useRef} from 'react';
import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSButton} from '../Button';
import {XDSIcon, type XDSIconName} from '../Icon';
import {
  colorVars,
  spacingVars,
  radiusVars,
  durationVars,
  easeVars,
  shadowVars,
  fontWeightVars,
} from '../theme/tokens.stylex';
import {xdsClassName, mergeProps} from '../utils';
import type {XDSToastType, XDSToastDismissReason} from './types';

const TYPE_ICONS: Record<XDSToastType, XDSIconName> = {
  info: 'info',
  success: 'checkCircle',
  warning: 'warning',
  error: 'xCircle',
};

const styles = stylex.create({
  root: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: spacingVars['--spacing-3'],
    paddingBlock: spacingVars['--spacing-3'],
    paddingInline: spacingVars['--spacing-4'],
    borderRadius: radiusVars['--radius-element'],
    width: 400,
    maxWidth: 'calc(100vw - 32px)',
    boxShadow: shadowVars['--shadow-med'],
    opacity: 1,
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
    backgroundColor: colorVars['--color-surface-inverted'],
    color: colorVars['--color-background-surface'],
  },
  variantError: {
    backgroundColor: colorVars['--color-error-inverted'],
    color: colorVars['--color-on-error'],
  },
  iconArea: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    paddingBlockStart: spacingVars['--spacing-0-5'],
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontWeight: fontWeightVars['--font-weight-semibold'],
  },
  body: {
    marginBlockStart: spacingVars['--spacing-1'],
    opacity: 0.9,
  },
  endArea: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
  },
});

export interface XDSToastProps {
  type: XDSToastType;
  title: ReactNode;
  body?: ReactNode;
  icon?: ReactNode;
  endContent?: ReactNode;
  isAutoHide: boolean;
  autoHideDuration: number;
  onDismiss: (reason: XDSToastDismissReason) => void;
}

/**
 * Individual toast notification.
 *
 * Renders with inverted surface colors for the default variant,
 * and error-inverted for the error variant. Pauses auto-dismiss
 * on hover and focus.
 *
 * @example
 * ```
 * <XDSToast
 *   type="success"
 *   title="Saved successfully"
 *   isAutoHide={true}
 *   autoHideDuration={5000}
 *   onDismiss={(reason) => removeToast(id, reason)}
 * />
 * ```
 */
export function XDSToast({
  type,
  title,
  body,
  icon,
  endContent,
  isAutoHide,
  autoHideDuration,
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
  const iconName = TYPE_ICONS[type];

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
        ),
      )}>
      <div {...stylex.props(styles.iconArea)}>
        {icon ?? <XDSIcon icon={iconName} size="md" color="inherit" />}
      </div>

      <div {...stylex.props(styles.content)}>
        <div {...stylex.props(styles.title)}>{title}</div>
        {body != null && <div {...stylex.props(styles.body)}>{body}</div>}
      </div>

      <div {...stylex.props(styles.endArea)}>
        {endContent}
        <XDSButton
          variant="ghost"
          size="sm"
          icon={<XDSIcon icon="close" size="sm" color="inherit" />}
          label="Dismiss notification"
          onClick={handleDismiss}
        />
      </div>
    </div>
  );
}

XDSToast.displayName = 'XDSToast';
