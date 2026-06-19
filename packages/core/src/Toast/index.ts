// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

export {useToast} from './useToast';

export type {
  ToastType,
  ToastPosition,
  ToastCollisionBehavior,
  ToastDismissReason,
  ToastOptions,
  ToastDismissFn,
  ShowToastFn,
} from './types';

// Exported for LayerProvider integration
export {ToastViewport} from './ToastViewport';
export type {ToastViewportProps} from './ToastViewport';

// Exported for inline rendering in previews and documentation
export {Toast} from './Toast';
export type {ToastProps} from './Toast';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  Toast as XDSToast,
  ToastViewport as XDSToastViewport,
  useToast as useXDSToast,
} from '.';
export type {
  ShowToastFn as XDSShowToastFn,
  ToastCollisionBehavior as XDSToastCollisionBehavior,
  ToastDismissFn as XDSToastDismissFn,
  ToastDismissReason as XDSToastDismissReason,
  ToastOptions as XDSToastOptions,
  ToastPosition as XDSToastPosition,
  ToastProps as XDSToastProps,
  ToastType as XDSToastType,
  ToastViewportProps as XDSToastViewportProps,
} from '.';
// <compat-aliases:end>
