// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @position Overlay barrel export
 */

export {Overlay} from './Overlay';
export type {OverlayProps} from './Overlay';

export {OverlayRegion} from './OverlayRegion';
export type {
  OverlayRegionProps,
  OverlayRegionPosition,
  OverlayRegionPreset,
  OverlayRegionPlacement,
} from './OverlayRegion';

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
