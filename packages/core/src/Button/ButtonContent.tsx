// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ButtonContent.tsx
 * @input Uses StyleX, VisuallyHidden, IconSizeScope
 * @output Exports ButtonContent: the inside of a Button (pending overlay, icon,
 *   label, end content and the loading live region)
 * @position Server-safe half of Button: rendered by the client Button
 *   (Button.tsx) and by the server shell (ButtonShell.tsx), so both render the
 *   same content. The Spinner and the localized loading text are passed in by
 *   the client Button; the server shell never renders a pending Button.
 *
 * SYNC: When modified, update Button.tsx and ButtonShell.tsx.
 */

import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {VisuallyHidden} from '../VisuallyHidden';
import {IconSizeScope} from '../Icon/IconSizeScope';
import {iconBoxSizeStyles, type IconSize} from '../Icon/IconSize.stylex';
import {durationVars} from '../theme/tokens.stylex';

const styles = stylex.create({
  endContentWrapper: {
    display: 'inline-flex',
    alignItems: 'center',
    color: 'inherit',
  },
  iconWrapper: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  contentWrapper: {
    display: 'contents',
  },
  labelText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minWidth: 0,
  },
});

const spinnerReveal = stylex.keyframes({
  from: {opacity: 0},
  to: {opacity: 1},
});

const contentHide = stylex.keyframes({
  from: {color: 'inherit'},
  to: {color: 'transparent'},
});

// Hold the loading swap for a short delay so a fast action (e.g. clickAction)
// that settles within the delay never flashes a spinner. The spinner fade-in
// and the content hide share the same delay so the button never shows an empty
// frame in between. Reduced motion is instant.
const SPINNER_DELAY = durationVars['--duration-medium-min'];

const loadingStyles = stylex.create({
  // Hide the button's own content while the spinner overlay is shown. Applied
  // to the content wrapper (not the button) so the button keeps its variant
  // foreground color, which the spinner inherits via shade="inherit" (#2717).
  hiddenContent: {
    color: 'transparent',
  },
  // Delayed variant: keep content visible, then hide it in lockstep with the
  // spinner reveal once the delay elapses.
  hiddenContentDelayed: {
    animationName: contentHide,
    animationDuration: '1ms',
    animationFillMode: 'forwards',
    animationDelay: {
      default: SPINNER_DELAY,
      '@media (prefers-reduced-motion: reduce)': '0s',
    },
  },
  spinnerOverlay: {
    position: 'absolute',
    top: 0,
    insetInlineStart: 0,
    insetInlineEnd: 0,
    bottom: 0,
    display: 'grid',
    placeItems: 'center',
  },
  spinnerDelayed: {
    animationName: spinnerReveal,
    animationDuration: durationVars['--duration-fast'],
    animationFillMode: 'backwards',
    animationDelay: {
      default: SPINNER_DELAY,
      '@media (prefers-reduced-motion: reduce)': '0s',
    },
  },
});

export interface ButtonContentProps {
  icon: ReactNode;
  iconSize: IconSize;
  isIconOnly: boolean;
  label: string;
  children: ReactNode;
  endContent: ReactNode;
  isLoading: boolean;
  /** Hold the content hide and the Spinner reveal for the motion delay. */
  isSpinnerDelayed: boolean;
  /** The Spinner shown while loading. */
  spinner: ReactNode;
  /** The live region's text: the localized loading string, or empty. */
  liveText: string;
}

/** The inside of a Button: what it shows, and what it announces. */
export function ButtonContent({
  icon,
  iconSize,
  isIconOnly,
  label,
  children,
  endContent,
  isLoading,
  isSpinnerDelayed,
  spinner,
  liveText,
}: ButtonContentProps) {
  return (
    <>
      {isLoading && (
        <span
          {...stylex.props(
            loadingStyles.spinnerOverlay,
            isSpinnerDelayed && loadingStyles.spinnerDelayed,
          )}
          aria-hidden="true">
          {spinner}
        </span>
      )}
      <span
        {...stylex.props(
          styles.contentWrapper,
          isLoading &&
            (isSpinnerDelayed
              ? loadingStyles.hiddenContentDelayed
              : loadingStyles.hiddenContent),
        )}
        aria-hidden={isLoading || undefined}>
        {icon && (
          <span
            {...stylex.props(styles.iconWrapper, iconBoxSizeStyles[iconSize])}>
            <IconSizeScope size={iconSize}>{icon}</IconSizeScope>
          </span>
        )}
        {isIconOnly ? null : (
          <span {...stylex.props(styles.labelText)}>{children ?? label}</span>
        )}
        {!isIconOnly && endContent && (
          <span {...stylex.props(styles.endContentWrapper)}>{endContent}</span>
        )}
      </span>
      {/* Live region for loading state announcements */}
      <VisuallyHidden role="status" aria-live="polite">
        {liveText}
      </VisuallyHidden>
    </>
  );
}
