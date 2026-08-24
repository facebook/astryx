// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useCallback, useRef} from 'react';
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
import type {ToastType, ToastDismissReason} from './types';
import {themeProps} from '../utils/themeProps';
import {useTranslator} from '../i18n';
import {useToastTimer} from './useToastTimer';

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

export interface ToastProps {
  type: ToastType;
  body: ReactNode;
  endContent?: ReactNode;
  isAutoHide: boolean;
  autoHideDuration: number;
  isExiting?: boolean;
  onDismiss: (reason: ToastDismissReason) => void;
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
}: ToastProps) {
  const t = useTranslator();
  // Read onDismiss through a ref so the timer callback never restarts on an
  // unrelated viewport render.
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  // The auto-hide lifetime is the toast's transport, shared with the viewport
  // so a `renderToast` surface keeps it (see useToastTimer).
  const timerHandlers = useToastTimer(isAutoHide, autoHideDuration, () =>
    onDismissRef.current('auto'),
  );

  const handleDismiss = useCallback(() => {
    onDismiss('manual');
  }, [onDismiss]);

  const isError = type === 'error';
  // The surface is *usually* dark in light mode and light in dark mode, but a
  // theme can define --color-background-inverted as anything — so the mode is
  // measured, not assumed. This is only the pre-measurement fallback.
  const {mode} = useTheme();
  const fallbackMediaMode = isError || mode === 'light' ? 'dark' : 'light';

  return (
    <div
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? 'assertive' : 'polite'}
      aria-atomic="true"
      {...timerHandlers}
      {...mergeProps(
        themeProps('toast', {type}),
        stylex.props(
          styles.root,
          isError ? styles.variantError : styles.variantDefault,
          isExiting && styles.exiting,
        ),
      )}>
      <MediaTheme mode="auto" fallback={fallbackMediaMode}>
        <div {...stylex.props(styles.inner)}>
          <div {...stylex.props(styles.content)}>{body}</div>

          <div {...stylex.props(styles.endContent)}>
            {endContent}
            <Button
              variant="ghost"
              size="sm"
              icon={<Icon icon="close" size="sm" color="inherit" />}
              label={t('@astryx.toast.dismiss')}
              onClick={handleDismiss}
              isIconOnly
            />
          </div>
        </div>
      </MediaTheme>
    </div>
  );
}

Toast.displayName = 'Toast';
