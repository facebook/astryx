'use client';

/**
 * @file OverlayScrim.tsx
 * @input Scrim props (mode, position, align, visibility)
 * @output Renders the scrim div with background, media theme, transitions
 * @position Internal rendering primitive; used by XDSOverlay and useXDSOverlay
 *
 * Not exported directly — consumers use XDSOverlay (component) or
 * useXDSOverlay (hook), both of which render this internally.
 */

import {type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars, durationVars, easeVars} from '../theme/tokens.stylex';
import {XDSMediaTheme} from '../theme/XDSMediaTheme';
import {xdsClassName, mergeProps} from '../utils';
import {overlayScope} from './overlay.markers.stylex';

// =============================================================================
// Types (re-exported from index.ts for consumers)
// =============================================================================

export type OverlayScrimMode = 'dark' | 'light' | false;
export type OverlayPosition = 'fill' | 'bottom' | 'top';
export type OverlayAlign = 'start' | 'center' | 'end';
export type OverlayShowOn = 'hover' | 'always' | 'focus' | 'hover-or-focus';

export interface OverlayScrimProps {
  scrim: OverlayScrimMode;
  position: OverlayPosition;
  align: OverlayAlign;
  showOn: OverlayShowOn;
  isOpen: boolean | undefined;
  children: ReactNode;
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  base: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    padding: 12,
    pointerEvents: 'none',
    transitionProperty: 'opacity, visibility',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
  },

  fill: {inset: 0},
  bottom: {insetInline: 0, bottom: 0},
  top: {insetInline: 0, top: 0},

  alignStart: {alignItems: 'flex-start', justifyContent: 'flex-start'},
  alignCenter: {alignItems: 'center', justifyContent: 'center'},
  alignEnd: {alignItems: 'flex-end', justifyContent: 'flex-start'},

  scrimDark: {backgroundColor: colorVars['--color-overlay']},
  // TODO: Replace with --color-overlay-light token when added
  scrimLight: {backgroundColor: 'color-mix(in srgb, white 60%, transparent)'},

  hidden: {opacity: 0, visibility: 'hidden'},
  visible: {opacity: 1, visibility: 'visible', pointerEvents: 'auto'},

  // CSS-driven: ancestor hover + focus (accessible default)
  hoverReveal: {
    opacity: {
      default: 0,
      [stylex.when.ancestor(':hover', overlayScope)]: {
        '@media (hover: hover)': 1,
      },
      [stylex.when.ancestor(':focus-within', overlayScope)]: 1,
    },
    visibility: {
      default: 'hidden',
      [stylex.when.ancestor(':hover', overlayScope)]: {
        '@media (hover: hover)': 'visible',
      },
      [stylex.when.ancestor(':focus-within', overlayScope)]: 'visible',
    },
    pointerEvents: {
      default: 'none',
      [stylex.when.ancestor(':hover', overlayScope)]: {
        '@media (hover: hover)': 'auto',
      },
      [stylex.when.ancestor(':focus-within', overlayScope)]: 'auto',
    },
  },

  // Touch: strip overlays always visible when hover unavailable
  touchAlwaysVisible: {
    '@media (hover: none)': {
      opacity: 1,
      visibility: 'visible',
      pointerEvents: 'auto',
    },
  },

  focusReveal: {
    opacity: {
      default: 0,
      [stylex.when.ancestor(':focus-within', overlayScope)]: 1,
    },
    visibility: {
      default: 'hidden',
      [stylex.when.ancestor(':focus-within', overlayScope)]: 'visible',
    },
    pointerEvents: {
      default: 'none',
      [stylex.when.ancestor(':focus-within', overlayScope)]: 'auto',
    },
  },
});

const alignMap = {
  start: styles.alignStart,
  center: styles.alignCenter,
  end: styles.alignEnd,
} as const;

const positionMap = {
  fill: styles.fill,
  bottom: styles.bottom,
  top: styles.top,
} as const;

// =============================================================================
// Component (internal)
// =============================================================================

export function OverlayScrim({
  scrim,
  position,
  align,
  showOn,
  isOpen,
  children,
}: OverlayScrimProps) {
  const isHoverMode = showOn === 'hover' || showOn === 'hover-or-focus';
  const isStrip = position === 'bottom' || position === 'top';
  const isControlled = isOpen !== undefined;

  const themeMode =
    scrim === 'dark' ? 'dark' : scrim === 'light' ? 'light' : null;

  const content = themeMode ? (
    <XDSMediaTheme mode={themeMode}>{children}</XDSMediaTheme>
  ) : (
    children
  );

  return (
    <div
      {...mergeProps(
        xdsClassName('overlay-scrim', {position}),
        stylex.props(
          styles.base,
          positionMap[position],
          alignMap[align],
          scrim === 'dark' && styles.scrimDark,
          scrim === 'light' && styles.scrimLight,
          isControlled && isOpen && styles.visible,
          isControlled && !isOpen && styles.hidden,
          !isControlled && showOn === 'always' && styles.visible,
          !isControlled && isHoverMode && styles.hoverReveal,
          !isControlled && showOn === 'focus' && styles.focusReveal,
          !isControlled && isHoverMode && isStrip && styles.touchAlwaysVisible,
        ),
      )}
      data-position={position}
      inert={isControlled && !isOpen ? true : undefined}>
      {content}
    </div>
  );
}
