// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports Dialog component and types from Dialog.tsx
 * @output Exports Dialog, DialogHeader, and related types
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/Dialog/Dialog.doc.mjs
 */

export {Dialog} from './Dialog';
export type {
  DialogProps,
  DialogVariant,
  DialogVariantMap,
  DialogPurpose,
  DialogPosition,
} from './Dialog';

export {DialogHeader} from './DialogHeader';
export type {DialogHeaderProps} from './DialogHeader';

export {useImperativeDialog} from './useImperativeDialog';
export type {ImperativeDialogReturn} from './useImperativeDialog';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  Dialog as XDSDialog,
  DialogHeader as XDSDialogHeader,
  useImperativeDialog as useXDSImperativeDialog,
} from '.';
export type {
  DialogHeaderProps as XDSDialogHeaderProps,
  DialogPosition as XDSDialogPosition,
  DialogProps as XDSDialogProps,
  DialogPurpose as XDSDialogPurpose,
  DialogVariant as XDSDialogVariant,
  DialogVariantMap as XDSDialogVariantMap,
  ImperativeDialogReturn as XDSImperativeDialogReturn,
} from '.';
// <compat-aliases:end>
