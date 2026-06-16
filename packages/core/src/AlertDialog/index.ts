// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

export {XDSAlertDialog} from './XDSAlertDialog';
export type {XDSAlertDialogProps} from './XDSAlertDialog';

export {useXDSImperativeAlertDialog} from './useXDSImperativeAlertDialog';
export type {XDSImperativeAlertDialogReturn} from './useXDSImperativeAlertDialog';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSAlertDialog as AlertDialog,
  useXDSImperativeAlertDialog as useImperativeAlertDialog,
} from '.';
export type {
  XDSAlertDialogProps as AlertDialogProps,
  XDSImperativeAlertDialogReturn as ImperativeAlertDialogReturn,
} from '.';
// <compat-aliases:end>
