// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {createContext, use} from 'react';

export type XDSTopNavSlot = 'start' | 'center' | 'end';

/**
 * @deprecated Use XDSTopNavSlotContext instead.
 */
export type TopNavSlot = XDSTopNavSlot;

export const XDSTopNavSlotContext = createContext<XDSTopNavSlot>('start');
XDSTopNavSlotContext.displayName = 'XDSTopNavSlotContext';

/**
 * @deprecated Use XDSTopNavSlotContext instead.
 */
export const TopNavSlotContext = XDSTopNavSlotContext;

export function useTopNavSlot(): XDSTopNavSlot {
  return use(XDSTopNavSlotContext);
}
