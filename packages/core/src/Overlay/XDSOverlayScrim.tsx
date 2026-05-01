'use client';

/**
 * @file XDSOverlayScrim.tsx
 * @input Uses React, stylex, XDSMediaTheme, overlay markers, overlay context
 * @output Exports XDSOverlayScrim component
 * @position Overlay system scrim layer; renders inside any positioned container
 *
 * The scrim is the visual overlay layer — a semi-transparent background
 * with content rendered inside a media theme context. It uses
 * stylex.when.ancestor() with the overlay marker for CSS-driven
 * hover/focus visibility, avoiding React state for the common case.
 *
 * Touch behavior (provided by XDSOverlay or useXDSOverlay via context):
 * - Strip overlays (bottom/top) are always visible on touch
 * - Full overlays (fill) use tap-to-toggle from the container
 *
 * Must be placed inside an XDSOverlay wrapper or a container using useXDSOverlay.
 */

import {type ReactNode, type Ref} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {colorVars, durationVars, easeVars} from '../theme/tokens.stylex';
import {XDSMediaTheme} from '../theme/XDSMediaTheme';
import {xdsClassName, mergeProps} from '../utils';
import {overlayScope} from './overlay.markers.stylex';
import {useOverlayContext} from './OverlayContext';

// =============================================================================
// Types
// =============================================================================

export type OverlayScrimMode = 'dark' | 'light' | false;
export type OverlayPosition = 'fill' | 'bottom' | 'top';
export type OverlayAlign = 'start' | 'center' | 'end';
export type OverlayShowOn = 'hover' | 'always' | 'focus' | 'hover-or-focus';

export interface XDSOverlayScrimProps {
  /** Ref forwarded to the scrim root element. */
  ref?: Ref<HTMLDivElement>;

  /**
   * Scrim background mode.
   * - `"dark"` — dark overlay background + dark media theme for children
   * - `"light"` — light overlay background + light media theme for children
   * - `false` — no background, no theme wrapper (content-only overlay)
   * @default "dark"
   */
  scrim?: OverlayScrimMode;

  /**
   * Scrim placement within the container.
   * - `"fill"` — covers the entire container
   * - `"bottom"` — anchored to the bottom edge
   * - `"top"` — anchored to the top edge
   * @default "fill"
   */
  position?: OverlayPosition;

  /**
   * Content alignment within the scrim (flex alignment).
   * @default "end"
   */
  align?: OverlayAlign;

  /**
   * CSS-driven visibility trigger.
   *
   * - `"always"` — scrim is always visible
   * - `"hover"` — visible on hover + focus-within (accessible default).
   *   Hover is guarded by @media (hover: hover). On touch: strip overlays
   *   are always visible; full overlays use tap-to-toggle from the container.
   * - `"focus"` — visible on container :focus-within only
   * - `"hover-or-focus"` — alias for "hover" (hover already includes focus)
   * @default "always"
   */
  showOn?: OverlayShowOn;

  /**
   * JS-controlled visibility override. When provided, takes precedence
   * over showOn and touch toggle.
   */
  isOpen?: boolean;

  /** Content rendered inside the scrim (buttons, text, icons, etc.) */
  children?: ReactNode;

  /** StyleX style overrides on the scrim element. */
  xstyle?: StyleXStyles;
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

  // Position variants
  fill: {inset: 0},
  bottom: {insetInline: 0, bottom: 0},
  top: {insetInline: 0, top: 0},

  // Alignment
  alignStart: {alignItems: 'flex-start', justifyContent: 'flex-start'},
  alignCenter: {alignItems: 'center', justifyContent: 'center'},
  alignEnd: {alignItems: 'flex-end', justifyContent: 'flex-start'},

  // Scrim backgrounds
  scrimDark: {backgroundColor: colorVars['--color-overlay']},
  // TODO: Replace with --color-overlay-light token when added
  scrimLight: {backgroundColor: 'color-mix(in srgb, white 60%, transparent)'},

  // JS-controlled / touch-toggled states
  hidden: {opacity: 0, visibility: 'hidden'},
  visible: {opacity: 1, visibility: 'visible', pointerEvents: 'auto'},

  // CSS-driven: ancestor hover + focus (accessible default for showOn="hover")
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

  // Strip overlays on touch: always visible when hover is not available
  touchAlwaysVisible: {
    '@media (hover: none)': {
      opacity: 1,
      visibility: 'visible',
      pointerEvents: 'auto',
    },
  },

  // CSS-driven: focus-within only
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
// Component
// =============================================================================

/**
 * Overlay scrim layer — renders a semi-transparent background with
 * content in a media theme context, positioned absolutely over its container.
 *
 * Must be inside an XDSOverlay wrapper or a container using useXDSOverlay.
 *
 * @compositionHint Place as a sibling of the base content (image, card body)
 * inside a positioned container. Use showOn="hover" for CSS-only hover reveals.
 *
 * @example
 * ```
 * <XDSOverlay>
 *   <img src="hero.jpg" />
 *   <XDSOverlayScrim showOn="hover" align="center">
 *     <XDSButton label="Quick view" variant="ghost" />
 *   </XDSOverlayScrim>
 * </XDSOverlay>
 * ```
 */
export function XDSOverlayScrim({
  scrim = 'dark',
  position = 'fill',
  align = 'end',
  showOn = 'always',
  isOpen,
  children,
  xstyle,
  ref,
}: XDSOverlayScrimProps) {
  const isHoverMode = showOn === 'hover' || showOn === 'hover-or-focus';
  const isStrip = position === 'bottom' || position === 'top';

  // Touch context from XDSOverlay or useXDSOverlay
  const {touchOpen} = useOverlayContext();

  // Resolve effective visibility:
  // 1. isOpen prop takes precedence (fully JS-controlled)
  // 2. Touch toggle for full-cover hover scrims
  // 3. CSS handles the rest
  const effectiveIsOpen =
    isOpen !== undefined
      ? isOpen
      : touchOpen !== undefined && isHoverMode && !isStrip
        ? touchOpen
        : undefined;
  const isControlled = effectiveIsOpen !== undefined;

  // Media theme wrapping
  const themeMode =
    scrim === 'dark' ? 'dark' : scrim === 'light' ? 'light' : null;

  const content = themeMode ? (
    <XDSMediaTheme mode={themeMode}>{children}</XDSMediaTheme>
  ) : (
    children
  );

  return (
    <div
      ref={ref}
      {...mergeProps(
        xdsClassName('overlay-scrim', {position}),
        stylex.props(
          styles.base,
          positionMap[position],
          alignMap[align],
          scrim === 'dark' && styles.scrimDark,
          scrim === 'light' && styles.scrimLight,
          // Visibility
          isControlled && effectiveIsOpen && styles.visible,
          isControlled && !effectiveIsOpen && styles.hidden,
          !isControlled && showOn === 'always' && styles.visible,
          !isControlled && isHoverMode && styles.hoverReveal,
          !isControlled && showOn === 'focus' && styles.focusReveal,
          // Touch: strips always visible
          !isControlled && isHoverMode && isStrip && styles.touchAlwaysVisible,
          xstyle,
        ),
      )}
      data-position={position}
      inert={isControlled && !effectiveIsOpen ? true : undefined}>
      {content}
    </div>
  );
}

XDSOverlayScrim.displayName = 'XDSOverlayScrim';
