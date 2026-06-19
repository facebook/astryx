// Copyright (c) Meta Platforms, Inc. and affiliates.
'use client';

/**
 * @file AvatarGroupContext.ts
 * @input None (pure context definition)
 * @output Exports AvatarGroup context and useAvatarGroup hook
 * @position Shared context; consumed by children for group-aware styling
 */

import {createContext, use} from 'react';
import type {AvatarSize} from '../Avatar';

export interface AvatarGroupContextValue {
  size: AvatarSize;
  overlap: number;
  numericSize: number;
}

export const AvatarGroupContext =
  createContext<AvatarGroupContextValue | null>(null);
AvatarGroupContext.displayName = 'AvatarGroupContext';

export function useAvatarGroup(): AvatarGroupContextValue | null {
  return use(AvatarGroupContext);
}
