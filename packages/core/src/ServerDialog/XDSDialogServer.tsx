// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import type {XDSDialogProps} from '../Dialog/XDSDialog';
import {XDSDialog} from '../Dialog/XDSDialog';
import type {MaybeClientProp} from './ClientProp';
import {useMaybeClientProp} from './ClientProp';

export interface XDSDialogServerProps extends Omit<
  XDSDialogProps,
  'onOpenChange'
> {
  onOpenChange?: MaybeClientProp<XDSDialogProps['onOpenChange']>;
}

export function XDSDialogServer({
  onOpenChange,
  ...props
}: XDSDialogServerProps) {
  const resolvedOnOpenChange = useMaybeClientProp(onOpenChange);
  return (
    <XDSDialog onOpenChange={resolvedOnOpenChange ?? (() => {})} {...props} />
  );
}

XDSDialogServer.displayName = 'XDSDialogServer';
