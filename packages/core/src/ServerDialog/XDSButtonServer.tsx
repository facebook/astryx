// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import type {XDSButtonProps} from '../Button/XDSButton';
import {XDSButton} from '../Button/XDSButton';
import type {MaybeClientProp} from './ClientProp';
import {useMaybeClientProp} from './ClientProp';

export interface XDSButtonServerProps extends Omit<XDSButtonProps, 'onClick'> {
  onClick?: MaybeClientProp<XDSButtonProps['onClick']>;
}

export function XDSButtonServer({onClick, ...props}: XDSButtonServerProps) {
  const resolvedOnClick = useMaybeClientProp(onClick);
  return <XDSButton onClick={resolvedOnClick ?? undefined} {...props} />;
}

XDSButtonServer.displayName = 'XDSButtonServer';
