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

export {useXDSOverlay} from './useXDSOverlay';
export type {UseXDSOverlayOptions, UseXDSOverlayResult} from './useXDSOverlay';

export {OverlayContext} from './OverlayContext';
export type {OverlayContextValue} from './OverlayContext';
