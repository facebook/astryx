'use client';

/**
 * @file XDSOverlayScrim.tsx
 * @input Uses React, stylex, XDSMediaTheme, overlay markers
 * @output Exports XDSOverlayScrim component
 * @position Overlay system scrim layer; renders inside any positioned container
 *
 * The scrim is the visual overlay layer — a semi-transparent background
 * with content rendered inside a media theme context. It uses
 * stylex.when.ancestor() with the overlay marker for CSS-driven
 * hover/focus visibility, avoiding React state for the common case.
 *
 * Must be placed inside an element that has the overlayScope marker
 * applied (either via XDSOverlay wrapper or manually via xstyle/className).
 */

import {type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {colorVars, durationVars, easeVars} from '../theme/tokens.stylex';
import {XDSMediaTheme} from '../theme/XDSMediaTheme';
import {xdsClassName, mergeProps} from '../utils';
import {overlayScope} from './overlay.markers.stylex';

// =============================================================================
// Types
// =============================================================================

export type OverlayScrimMode = 'dark' | 'light' | false;
export type OverlayPosition = 'fill' | 'bottom' | 'top';
export type OverlayAlign = 'start' | 'center' | 'end';
export type OverlayShowOn = 'hover' | 'always' | 'focus' | 'hover-or-focus';

export interface XDSOverlayScrimProps {
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
   * CSS-driven visibility trigger. Uses stylex.when.ancestor() with
   * the overlay marker — pure CSS, no React state, no re-renders.
   *
   * - `"always"` — scrim is always visible
   * - `"hover"` — visible on container hover (guarded by @media (hover: hover))
   * - `"focus"` — visible on container :focus-within
   * - `"hover-or-focus"` — visible on either hover or focus
   * @default "always"
   */
  showOn?: OverlayShowOn;

  /**
   * JS-controlled visibility override. When provided, takes precedence
   * over showOn for cases where CSS selectors can't express the trigger
   * (drag-and-drop, intersection observer, programmatic toggle, etc.).
   */
  isOpen?: boolean;

  /**
   * Callback when visibility changes. Only meaningful in JS-controlled mode.
   */
  onOpenChange?: (open: boolean) => void;

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
  scrimLight: {backgroundColor: 'color-mix(in srgb, white 60%, transparent)'},

  // JS-controlled states
  hidden: {opacity: 0, visibility: 'hidden'},
  visible: {opacity: 1, visibility: 'visible', pointerEvents: 'auto'},

  // CSS-driven: ancestor hover
  hoverReveal: {
    opacity: {
      default: 0,
      [stylex.when.ancestor(':hover', overlayScope)]: {
        '@media (hover: hover)': 1,
      },
    },
    visibility: {
      default: 'hidden',
      [stylex.when.ancestor(':hover', overlayScope)]: {
        '@media (hover: hover)': 'visible',
      },
    },
    pointerEvents: {
      default: 'none',
      [stylex.when.ancestor(':hover', overlayScope)]: {
        '@media (hover: hover)': 'auto',
      },
    },
  },

  // CSS-driven: ancestor focus-within
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

  // CSS-driven: hover OR focus (combined)
  hoverOrFocusReveal: {
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
 * Place inside an element with the `overlayScope` marker applied
 * (via XDSOverlay wrapper, `xstyle={overlayScope}`, or className).
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
}: XDSOverlayScrimProps) {
  const isJSControlled = isOpen !== undefined;

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
      {...mergeProps(
        xdsClassName('overlay-scrim', {position}),
        stylex.props(
          styles.base,
          positionMap[position],
          alignMap[align],
          scrim === 'dark' && styles.scrimDark,
          scrim === 'light' && styles.scrimLight,
          // Visibility
          isJSControlled && isOpen && styles.visible,
          isJSControlled && !isOpen && styles.hidden,
          !isJSControlled && showOn === 'always' && styles.visible,
          !isJSControlled && showOn === 'hover' && styles.hoverReveal,
          !isJSControlled && showOn === 'focus' && styles.focusReveal,
          !isJSControlled &&
            showOn === 'hover-or-focus' &&
            styles.hoverOrFocusReveal,
          xstyle,
        ),
      )}
      data-position={position}
      {...(isJSControlled && !isOpen ? {inert: '' as unknown as boolean} : {})}>
      {content}
    </div>
  );
}

XDSOverlayScrim.displayName = 'XDSOverlayScrim';
