'use client';

/**
 * @file XDSOverlay.tsx
 * @input Uses React, useXDSOverlay
 * @output Exports XDSOverlay component
 * @position Overlay system component; thin wrapper over useXDSOverlay
 *
 * Wraps content with an overlay scrim. Same pattern as XDSTooltip:
 * `children` is the base content, `content` is what appears on top.
 *
 * For applying overlay behavior to an existing container (XDSCard),
 * use the useXDSOverlay hook directly.
 */

import {type ReactNode, type Ref} from 'react';
import type {StyleXStyles} from '@stylexjs/stylex';
import * as stylex from '@stylexjs/stylex';
import {xdsClassName} from '../utils';
import {useXDSOverlay} from './useXDSOverlay';
import type {
  OverlayScrimMode,
  OverlayPosition,
  OverlayAlign,
  OverlayShowOn,
} from './OverlayScrim';

export interface XDSOverlayProps {
  /** Ref forwarded to the container element. */
  ref?: Ref<HTMLDivElement>;
  /** Base content (image, card, video, etc.). */
  children?: ReactNode;
  /** Content rendered inside the overlay scrim. */
  content: ReactNode;

  /**
   * CSS-driven visibility trigger.
   * - `"always"` — always visible
   * - `"hover"` — hover + focus (accessible default)
   * - `"focus"` — focus-within only
   * - `"hover-or-focus"` — alias for "hover"
   * @default "always"
   */
  showOn?: OverlayShowOn;

  /**
   * JS-controlled visibility override.
   */
  isOpen?: boolean;

  /**
   * Scrim background mode.
   * @default "dark"
   */
  scrim?: OverlayScrimMode;

  /**
   * Scrim placement.
   * @default "fill"
   */
  position?: OverlayPosition;

  /**
   * Content alignment within the scrim.
   * @default "end"
   */
  align?: OverlayAlign;

  /** StyleX style overrides on the container. */
  xstyle?: StyleXStyles;
  /** CSS class name(s) appended to the root element. */
  className?: string;
  /** Inline styles. */
  style?: React.CSSProperties;
}

/**
 * Overlay — renders content on top of media with a scrim background
 * and automatic theme inversion.
 *
 * `children` is the base content, `content` is what appears on top.
 * Same pattern as XDSTooltip.
 *
 * For existing containers (XDSCard), use useXDSOverlay hook instead.
 *
 * @compositionHint Wrap images, video, or media content.
 *
 * @example
 * ```
 * <XDSOverlay
 *   showOn="hover"
 *   content={<XDSButton label="Quick view" variant="ghost" />}
 * >
 *   <XDSAspectRatio ratio={16/9}>
 *     <img src="hero.jpg" style={{objectFit: 'cover', width: '100%', height: '100%'}} />
 *   </XDSAspectRatio>
 * </XDSOverlay>
 * ```
 */
export function XDSOverlay({
  children,
  content,
  showOn = 'always',
  isOpen,
  scrim = 'dark',
  position = 'fill',
  align = 'end',
  xstyle,
  className,
  style,
  ref,
}: XDSOverlayProps) {
  const overlay = useXDSOverlay({
    content,
    showOn,
    isOpen,
    scrim,
    position,
    align,
  });

  // Merge xstyle + className + style on top of hook's container props
  const xstyleResolved = xstyle ? stylex.props(xstyle) : undefined;
  const mergedClassName =
    [
      overlay.containerProps.className as string,
      xstyleResolved?.className,
      className,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

  const mergedStyle = {
    ...(overlay.containerProps.style as React.CSSProperties),
    ...xstyleResolved?.style,
    ...style,
  };

  return (
    <div
      ref={(node: HTMLDivElement | null) => {
        (
          overlay.containerRef as React.MutableRefObject<HTMLElement | null>
        ).current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref != null)
          (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      className={mergedClassName}
      style={Object.keys(mergedStyle).length > 0 ? mergedStyle : undefined}
      data-xds="overlay"
      onClick={
        overlay.containerProps.onClick as
          | React.MouseEventHandler<HTMLDivElement>
          | undefined
      }
      onMouseUp={
        overlay.containerProps.onMouseUp as
          | React.MouseEventHandler<HTMLDivElement>
          | undefined
      }>
      {children}
      {overlay.element}
    </div>
  );
}

XDSOverlay.displayName = 'XDSOverlay';
