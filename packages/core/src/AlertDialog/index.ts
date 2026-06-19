// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

export {AlertDialog} from './AlertDialog';
export type {AlertDialogProps} from './AlertDialog';

export {useImperativeAlertDialog} from './useImperativeAlertDialog';
export type {ImperativeAlertDialogReturn} from './useImperativeAlertDialog';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  AlertDialog as XDSAlertDialog,
  useImperativeAlertDialog as useXDSImperativeAlertDialog,
} from '.';
export type {
  AlertDialogProps as XDSAlertDialogProps,
  ImperativeAlertDialogReturn as XDSImperativeAlertDialogReturn,
} from '.';
// <compat-aliases:end>
