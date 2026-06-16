// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports XDSDialog component and types from XDSDialog.tsx
 * @output Exports XDSDialog, XDSDialogHeader, and related types
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/Dialog/Dialog.doc.mjs
 */

export {XDSDialog} from './XDSDialog';
export type {
  XDSDialogProps,
  XDSDialogVariant,
  XDSDialogVariantMap,
  XDSDialogPurpose,
  XDSDialogPosition,
} from './XDSDialog';

export {XDSDialogHeader} from './XDSDialogHeader';
export type {XDSDialogHeaderProps} from './XDSDialogHeader';

export {useXDSImperativeDialog} from './useXDSImperativeDialog';
export type {XDSImperativeDialogReturn} from './useXDSImperativeDialog';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSDialog as Dialog,
  XDSDialogHeader as DialogHeader,
  useXDSImperativeDialog as useImperativeDialog,
} from '.';
export type {
  XDSDialogHeaderProps as DialogHeaderProps,
  XDSDialogPosition as DialogPosition,
  XDSDialogProps as DialogProps,
  XDSDialogPurpose as DialogPurpose,
  XDSDialogVariant as DialogVariant,
  XDSDialogVariantMap as DialogVariantMap,
  XDSImperativeDialogReturn as ImperativeDialogReturn,
} from '.';
// <compat-aliases:end>
