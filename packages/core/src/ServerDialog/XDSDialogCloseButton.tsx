// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useContext} from 'react';
import type {XDSButtonProps} from '../Button/XDSButton';
import {XDSButton} from '../Button/XDSButton';
import {ClientPropContext} from './ClientProp';

export type XDSDialogCloseButtonProps = Omit<XDSButtonProps, 'onClick'>;

export function XDSDialogCloseButton(props: XDSDialogCloseButtonProps) {
  const clientProps = useContext(ClientPropContext);
  const onOpenChange = clientProps.onOpenChange as
    | ((isOpen: boolean) => void)
    | null;

  return <XDSButton onClick={() => onOpenChange?.(false)} {...props} />;
}

XDSDialogCloseButton.displayName = 'XDSDialogCloseButton';
