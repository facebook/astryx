// Copyright (c) Meta Platforms, Inc. and affiliates.

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
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {xdsClassName, mergeProps, mergeRefs} from '../utils';
import {useXDSOverlay} from './useXDSOverlay';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import {overlayScope, overlayContainerStyles} from './overlay.markers.stylex';
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
  /** @default "always" */
  showOn?: OverlayShowOn;
  /** JS-controlled visibility override. */
  isOpen?: boolean;
  /** @default "dark" */
  scrim?: OverlayScrimMode;
  /** @default "fill" */
  position?: OverlayPosition;
  /** @default "end" */
  align?: OverlayAlign;
  /**
   * StyleX styles for layout customization (margins, positioning, sizing).
   * Must be a `stylex.create()` value — not an inline style object.
   *
   * @example
   * ```
   * const styles = stylex.create({ wrapper: { marginTop: 8 } });
   * <XDSOverlay xstyle={styles.wrapper} />
   * ```
   */
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
 * `children` = base content, `content` = what appears on top.
 *
 * @compositionHint Wrap images, video, or media content.
 *
 * @example
 * ```
 * <XDSOverlay
 *   showOn="hover"
 *   content={<XDSButton label="Quick view" variant="ghost" />}>
 *   <XDSAspectRatio ratio={16/9}>
 *     <img src="hero.jpg" style={{objectFit: 'cover', width: '100%', height: '100%'}} />
 *   </XDSAspectRatio>
 * </XDSOverlay>
 * ```
 */
export function XDSOverlay({
  children,
  content,
  showOn,
  isOpen,
  scrim,
  position,
  align,
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

  // Border radius: mirror first child's radius onto the wrapper.
  // Only the component needs this — hook consumers have their own radius.
  useIsomorphicLayoutEffect(() => {
    const el = overlay.containerRef.current;
    if (!el) {
      return;
    }
    const firstChild = el.firstElementChild as HTMLElement | null;
    if (!firstChild) {
      return;
    }
    const radius = getComputedStyle(firstChild).borderRadius;
    if (radius && radius !== '0px') {
      // eslint-disable-next-line react-compiler/react-compiler -- imperative DOM: syncing border-radius from child
      el.style.borderRadius = radius;
    }
  }, []);

  return (
    <div
      ref={mergeRefs(ref, overlay.containerRef)}
      {...mergeProps(
        xdsClassName('overlay'),
        stylex.props(overlayScope, overlayContainerStyles.root, xstyle),
        className,
        style,
      )}
      onClick={overlay.containerProps.onClick}
      onMouseUp={overlay.containerProps.onMouseUp}>
      {children}
      {overlay.element}
    </div>
  );
}

XDSOverlay.displayName = 'XDSOverlay';
