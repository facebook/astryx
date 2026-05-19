// Copyright (c) Meta Platforms, Inc. and affiliates.
'use client';

/**
 * @file XDSAvatarGroupContext.ts
 * @input None (pure context definition)
 * @output Exports AvatarGroup context and useXDSAvatarGroup hook
 * @position Shared context; consumed by children for group-aware styling
 */

import {createContext, useContext} from 'react';
import type {XDSAvatarSize} from '../Avatar';

export interface XDSAvatarGroupContextValue {
  size: XDSAvatarSize;
  overlap: number;
  numericSize: number;
}

export const XDSAvatarGroupContext =
  createContext<XDSAvatarGroupContextValue | null>(null);

export function useXDSAvatarGroup(): XDSAvatarGroupContextValue | null {
  return useContext(XDSAvatarGroupContext);
}
