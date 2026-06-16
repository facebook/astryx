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


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSToast as Toast,
  XDSToastViewport as ToastViewport,
  useXDSToast as useToast,
} from '.';
export type {
  XDSShowToastFn as ShowToastFn,
  XDSToastCollisionBehavior as ToastCollisionBehavior,
  XDSToastDismissFn as ToastDismissFn,
  XDSToastDismissReason as ToastDismissReason,
  XDSToastOptions as ToastOptions,
  XDSToastPosition as ToastPosition,
  XDSToastProps as ToastProps,
  XDSToastType as ToastType,
  XDSToastViewportProps as ToastViewportProps,
} from '.';
// <compat-aliases:end>
