/**
 * @file index.ts
 * @position Overlay barrel export
 */

export {XDSOverlay} from './XDSOverlay';
export type {XDSOverlayProps} from './XDSOverlay';

export {XDSOverlayScrim} from './XDSOverlayScrim';
export type {
  XDSOverlayScrimProps,
  OverlayScrimMode,
  OverlayPosition,
  OverlayAlign,
  OverlayShowOn,
} from './XDSOverlayScrim';

export {overlayScope, overlayContainerStyles} from './overlay.markers.stylex';

// Pre-computed className for non-StyleX consumers.
// stylex.props() is compiled to static strings by the babel plugin at build time.
import * as stylex from '@stylexjs/stylex';
import {overlayScope, overlayContainerStyles} from './overlay.markers.stylex';

const _resolved = stylex.props(overlayScope, overlayContainerStyles.root);

/**
 * Pre-computed CSS class name that includes the overlay marker,
 * position: relative, and overflow: clip. For consumers not using
 * StyleX who just need a className string.
 *
 * @example
 * ```
 * <div className={overlayContainerClass}>
 *   <img src="hero.jpg" />
 *   <XDSOverlayScrim showOn="hover">
 *     <XDSButton label="Quick view" />
 *   </XDSOverlayScrim>
 * </div>
 * ```
 */
export const overlayContainerClass: string = _resolved.className ?? '';
