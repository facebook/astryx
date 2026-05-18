// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file XDSButtonGroupContext.ts
 * @input None (pure context definition)
 * @output Exports ButtonGroup context and useXDSButtonGroup hook
 * @position Shared context; consumed by XDSButton for group-aware styling
 */

import {createContext, useContext} from 'react';

export type XDSButtonGroupOrientation = 'horizontal' | 'vertical';

export interface XDSButtonGroupContextValue {
  orientation: XDSButtonGroupOrientation;
  isDisabled: boolean;
}

export const XDSButtonGroupContext =
  createContext<XDSButtonGroupContextValue | null>(null);

/**
 * Hook for XDSButton to detect when it's inside a ButtonGroup.
 * Returns null when used outside a group.
 */
export function useXDSButtonGroup(): XDSButtonGroupContextValue | null {
  return useContext(XDSButtonGroupContext);
}
