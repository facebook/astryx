// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

export {useXDSServerDialog} from './useXDSServerDialog';
export type {ShowDialogFn, PreloadDialogFn} from './useXDSServerDialog';

export {XDSDialogServer} from './XDSDialogServer';
export type {XDSDialogServerProps} from './XDSDialogServer';

export {XDSButtonServer} from './XDSButtonServer';
export type {XDSButtonServerProps} from './XDSButtonServer';

export {XDSDialogCloseButton} from './XDSDialogCloseButton';
export type {XDSDialogCloseButtonProps} from './XDSDialogCloseButton';

export {
  createClientPropMarker,
  isClientProp,
  useClientProp,
  useMaybeClientProp,
} from './ClientProp';
export type {
  ClientProp,
  MaybeClientProp,
  ClientPropKeys,
  ExtractServerProps,
  ExtractClientProps,
} from './ClientProp';
