'use client';

import {createContext, useContext} from 'react';

export type XDSTopNavSlot = 'start' | 'center' | 'end';

/**
 * @deprecated Use XDSTopNavSlotContext instead.
 */
export type TopNavSlot = XDSTopNavSlot;

export const XDSTopNavSlotContext = createContext<XDSTopNavSlot>('start');

/**
 * @deprecated Use XDSTopNavSlotContext instead.
 */
export const TopNavSlotContext = XDSTopNavSlotContext;

export function useTopNavSlot(): XDSTopNavSlot {
  return useContext(XDSTopNavSlotContext);
}
