// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file XDSInputGroupContext.ts
 * @input None (pure context definition)
 * @output Exports InputGroup context and useXDSInputGroup hook
 * @position Shared context; consumed by input components for group-aware styling
 */

import {createContext, useContext} from 'react';

export interface XDSInputGroupContextValue {
  isInGroup: true;
}

export const XDSInputGroupContext =
  createContext<XDSInputGroupContextValue | null>(null);

/**
 * Hook for input components to detect when inside an InputGroup.
 * Returns null when used outside a group.
 */
export function useXDSInputGroup(): XDSInputGroupContextValue | null {
  return useContext(XDSInputGroupContext);
}
