'use client';

import {createContext, useContext} from 'react';

export type TopNavSlot = 'start' | 'center' | 'end';

export const TopNavSlotContext = createContext<TopNavSlot>('start');

export function useTopNavSlot(): TopNavSlot {
  return useContext(TopNavSlotContext);
}
