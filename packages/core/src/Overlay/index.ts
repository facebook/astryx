// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @position Overlay barrel export
 */

export {Overlay} from './Overlay';
export type {OverlayProps} from './Overlay';

export {useOverlay} from './useOverlay';
export type {
  UseOverlayOptions,
  UseOverlayResult,
  OverlayContainerProps,
} from './useOverlay';

export type {
  OverlayScrimMode,
  OverlayPosition,
  OverlayAlign,
  OverlayShowOn,
} from './OverlayScrim';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  Overlay as XDSOverlay,
  useOverlay as useXDSOverlay,
} from '.';
export type {
  OverlayAlign as XDSOverlayAlign,
  OverlayContainerProps as XDSOverlayContainerProps,
  OverlayPosition as XDSOverlayPosition,
  OverlayProps as XDSOverlayProps,
  OverlayScrimMode as XDSOverlayScrimMode,
  OverlayShowOn as XDSOverlayShowOn,
  UseOverlayOptions as XDSUseOverlayOptions,
  UseOverlayResult as XDSUseOverlayResult,
} from '.';
// <compat-aliases:end>
