// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

export {useXDSToast} from './useXDSToast';

export type {
  XDSToastType,
  XDSToastPosition,
  XDSToastCollisionBehavior,
  XDSToastDismissReason,
  XDSToastOptions,
  XDSToastDismissFn,
  XDSShowToastFn,
} from './types';

// Exported for XDSLayerProvider integration
export {XDSToastViewport} from './XDSToastViewport';
export type {XDSToastViewportProps} from './XDSToastViewport';

// Exported for inline rendering in previews and documentation
export {XDSToast} from './XDSToast';
export type {XDSToastProps} from './XDSToast';
