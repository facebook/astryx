// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @position Overlay barrel export
 */

export {XDSOverlay} from './XDSOverlay';
export type {XDSOverlayProps} from './XDSOverlay';

export {useXDSOverlay} from './useXDSOverlay';
export type {UseXDSOverlayOptions, UseXDSOverlayResult} from './useXDSOverlay';

export type {
  OverlayScrimMode,
  OverlayPosition,
  OverlayAlign,
  OverlayShowOn,
} from './OverlayScrim';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSOverlay as Overlay,
  useXDSOverlay as useOverlay,
} from '.';
export type {
  XDSOverlayProps as OverlayProps,
} from '.';
// <compat-aliases:end>
