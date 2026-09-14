// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Toast.tsx
 * @input Uses React timers, touch/pen gesture events, Toast options, Button/Icon,
 *   MediaTheme, tokens, and placement motion inherited from ToastViewport
 * @output Exports the rendered Toast surface and its pause/swipe/dismiss behavior;
 *   the card reflects `type` and the resolved Theme mode (`themeMode`) as
 *   theming targets
 * @position Core implementation; rendered by ToastViewport and documented by Toast.doc.mjs
 *
 * SYNC: When Toast layout, timer pause, media theme, theming reflection, or
 *   dismissal behavior changes, update these files to stay in sync:
 * - /packages/core/src/Toast/ToastViewport.test.tsx
 * - /packages/core/src/Toast/Toast.test.tsx (themeMode reflection)
 * - /packages/core/src/Toast/Toast.doc.mjs
 * - /apps/storybook/stories/Toast.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/Toast/ (showcase blocks)
 */

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
import {INTERACTIVE_SELECTORS} from '../hooks/useClickableContainer';
import {useTheme} from '../theme';
import {MediaTheme} from '../theme/MediaTheme';
import type {
  ToastType,
  ToastDismissReason,
  ToastContentRenderFn,
} from './types';
import {themeProps} from '../utils/themeProps';
import {useTranslator} from '../i18n';
import {useToastGesture, type ToastGestureDirection} from './useToastGesture';

const SWIPE_INTERACTIVE_TARGET_SELECTOR = `${INTERACTIVE_SELECTORS},[tabindex],[contenteditable]:not([contenteditable="false"])`;

function isInteractiveTarget(
  target: EventTarget | null,
  root: HTMLElement,
): boolean {
  if (!(target instanceof Element)) {
    return false;
  }
  let current: Element | null = target;
  while (current != null && current !== root && current !== document.body) {
    if (current.matches(SWIPE_INTERACTIVE_TARGET_SELECTOR)) {
      return true;
    }
    current = current.parentElement;
  }
  return false;
}

const TOAST_EDGE_DRIFT = spacingVars['--spacing-2'];
const styles = stylex.create({
  root: {
    paddingBlock: spacingVars['--spacing-4'],
    paddingInline: spacingVars['--spacing-4'],
    borderRadius: radiusVars['--radius-container'],
    boxSizing: 'border-box',
    width: 400,
    maxWidth: '100%',
    boxShadow: shadowVars['--shadow-med'],
    opacity: 'var(--_toast-swipe-opacity, 1)',
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleDefaults['--text-body-size'],
    lineHeight: typeScaleDefaults['--text-body-leading'],
    transform:
      'translateY(var(--_toast-swipe-y, 0px)) scale(var(--_toast-swipe-scale, 1))',
    transitionProperty: 'opacity, transform',
    transitionDuration: {
      default: durationVars['--duration-fast'],
      '@media (prefers-reduced-motion: reduce)': '0.01ms',
    },
    transitionTimingFunction: easeVars['--ease-standard'],
    '@starting-style': {
      opacity: 0,
      transform: `translateY(var(--_toast-slide-y, ${TOAST_EDGE_DRIFT}))`,
    },
  },
  variantDefault: {
    backgroundColor: colorVars['--color-background-inverted'],
  },

  inner: {
    display: 'flex',
    alignItems: 'flex-start',
    flexWrap: 'nowrap',
    gap: spacingVars['--spacing-3'],
    width: '100%',
  },
  variantError: {
    backgroundColor: colorVars['--color-background-error-inverted'],
  },
  content: {
    flex: 1,
    minWidth: 0,
    overflowWrap: 'anywhere',
  },
  exiting: {
    opacity: 0,
    transform: `translateY(var(--_toast-swipe-exit-y, var(--_toast-swipe-y, var(--_toast-slide-y, ${TOAST_EDGE_DRIFT})))) scale(var(--_toast-swipe-scale, 1))`,
  },
  endContent: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    // Keep every trailing control centered on the first 20px body line, even
    // when the body wraps or a consumer supplies a control taller than the
    // built-in 28px dismiss button. The action label should still stay short;
    // the wrappers above let it break rather than widen the Toast.
    blockSize: `calc(${typeScaleDefaults['--text-body-size']} * ${typeScaleDefaults['--text-body-leading']})`,
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
   * Replaces the content of this toast's card with your own layout. Direct
   * `Toast` renders use the same contract as `ToastOptions.renderContent`;
   * apps normally set it per toast in the options passed to `useToast()`.
   */
  renderContent?: ToastContentRenderFn;
}

interface ToastSurfaceProps extends ToastProps {
  gestureDirection: ToastGestureDirection;
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
export function Toast(props: ToastProps) {
  return <ToastSurface {...props} gestureDirection={1} />;
}

export function ToastSurface({
  type,
  body,
  endContent,
  isAutoHide,
  autoHideDuration,
  isExiting = false,
  onDismiss,
  renderContent,
  gestureDirection,
}: ToastSurfaceProps) {
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

  const isTimerPaused = useCallback(() => isPausedRef.current, []);
  const dismissFromGesture = useCallback(() => {
    onDismissRef.current('manual');
  }, []);
  const {rootRef, bindings: gestureBindings} = useToastGesture({
    direction: gestureDirection,
    enabled: !isExiting,
    canPauseTimer: isAutoHide,
    isTimerPaused,
    pauseTimer,
    resumeTimer,
    dismiss: dismissFromGesture,
    shouldIgnoreTarget: isInteractiveTarget,
  });

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
      ref={rootRef}
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? 'assertive' : 'polite'}
      aria-atomic="true"
      onMouseEnter={pauseTimer}
      onMouseLeave={resumeTimer}
      onFocusCapture={pauseTimer}
      onBlurCapture={resumeTimer}
      {...gestureBindings}
      {...mergeProps(
        // `themeMode` reflects the resolved Theme mode: the MediaTheme below
        // makes every light-dark() token follow the painted surface, so
        // nothing else in the card can say which app mode it is in. Both
        // values are closed vocabularies: the card already renders anything
        // but "error" as info, so the reflection says so too. (#5503)
        themeProps('toast', {
          type: isError ? 'error' : 'info',
          themeMode: mode,
        }),
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
            type,
            isAutoHide,
            autoHideDuration,
            dismiss: handleDismiss,
          })
        ) : (
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
        )}
      </MediaTheme>
    </div>
  );
}

Toast.displayName = 'Toast';
ToastSurface.displayName = 'ToastSurface';
