'use client';

/**
 * @file XDSOverlay.tsx
 * @input Uses React, stylex, overlay markers
 * @output Exports XDSOverlay convenience wrapper
 * @position Overlay system container; applies marker + positioning
 *
 * Convenience wrapper that bundles the overlay marker, position: relative,
 * and overflow: clip on a container div. Use for raw media (images, video)
 * where there's no existing positioned container.
 *
 * For XDSCard and other components that already have position: relative
 * and overflow: clip, apply overlayScope via xstyle instead.
 */

import {type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {xdsClassName, mergeProps} from '../utils';
import {overlayScope, overlayContainerStyles} from './overlay.markers.stylex';

export interface XDSOverlayProps {
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
 * Overlay container — provides the positioned ancestor and hover marker
 * for XDSOverlayScrim children.
 *
 * Bundles overlayScope (marker) + position: relative + overflow: clip.
 * Use for raw media. For XDSCard, apply overlayScope via xstyle instead.
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
}: XDSOverlayProps) {
  return (
    <div
      {...mergeProps(
        xdsClassName('overlay'),
        stylex.props(overlayScope, overlayContainerStyles.root, xstyle),
        className,
        style,
      )}>
      {children}
    </div>
  );
}

XDSOverlay.displayName = 'XDSOverlay';
