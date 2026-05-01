'use client';

/**
 * @file XDSOverlay.tsx
 * @input Uses React, stylex, useXDSOverlay
 * @output Exports XDSOverlay convenience wrapper
 * @position Overlay system container; thin wrapper over useXDSOverlay
 *
 * Convenience wrapper that provides the overlay container with marker,
 * positioning, touch toggle, and border-radius detection. Uses
 * useXDSOverlay internally.
 *
 * For applying overlay behavior to an existing container (like XDSCard),
 * use the useXDSOverlay hook directly instead.
 */

import {type ReactNode, type Ref} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {xdsClassName, mergeProps} from '../utils';
import {useXDSOverlay} from './useXDSOverlay';
import {OverlayContext} from './OverlayContext';

export interface XDSOverlayProps {
  /** Ref forwarded to the container element. */
  ref?: Ref<HTMLDivElement>;
  /** Base content + XDSOverlayScrim children. */
  children?: ReactNode;
  /** StyleX style overrides on the container. */
  xstyle?: StyleXStyles;
  /** CSS class name(s) appended to the root element. */
  className?: string;
  /** Inline styles. */
  style?: React.CSSProperties;
}

/**
 * Overlay container — provides the positioned ancestor, hover marker,
 * touch toggle, and border-radius detection for XDSOverlayScrim children.
 *
 * For raw media (images, video), wrap with XDSOverlay.
 * For existing containers (XDSCard), use useXDSOverlay hook instead.
 *
 * @compositionHint Wrap images, video, or any media content. Place
 * XDSOverlayScrim as a sibling of the media inside this container.
 *
 * @example
 * ```
 * <XDSOverlay>
 *   <XDSAspectRatio ratio={16/9}>
 *     <img src="hero.jpg" style={{objectFit: 'cover', width: '100%', height: '100%'}} />
 *   </XDSAspectRatio>
 *   <XDSOverlayScrim showOn="hover" align="center">
 *     <XDSButton label="Quick view" variant="ghost" />
 *   </XDSOverlayScrim>
 * </XDSOverlay>
 * ```
 */
export function XDSOverlay({
  children,
  xstyle,
  className,
  style,
  ref,
}: XDSOverlayProps) {
  const overlay = useXDSOverlay();

  // Merge xstyle on top of hook's container styles
  const xstyleResolved = xstyle ? stylex.props(xstyle) : undefined;
  const mergedClassName =
    [overlay.containerProps.className, xstyleResolved?.className, className]
      .filter(Boolean)
      .join(' ') || undefined;
  const mergedStyle = {
    ...overlay.containerProps.style,
    ...xstyleResolved?.style,
    ...style,
  };

  return (
    <OverlayContext value={overlay.contextValue}>
      <div
        ref={(node: HTMLDivElement | null) => {
          (
            overlay.containerRef as React.MutableRefObject<HTMLElement | null>
          ).current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref != null)
            (ref as React.MutableRefObject<HTMLDivElement | null>).current =
              node;
        }}
        className={mergedClassName}
        style={Object.keys(mergedStyle).length > 0 ? mergedStyle : undefined}
        data-xds="overlay"
        onClick={overlay.containerProps.onClick}
        onMouseUp={overlay.containerProps.onMouseUp}>
        {children}
      </div>
    </OverlayContext>
  );
}

XDSOverlay.displayName = 'XDSOverlay';
