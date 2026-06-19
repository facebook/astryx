// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {createContext, use} from 'react';

export type TopNavSlot = 'start' | 'center' | 'end';


export const TopNavSlotContext = createContext<TopNavSlot>('start');
TopNavSlotContext.displayName = 'TopNavSlotContext';


export function useTopNavSlot(): TopNavSlot {
  return use(TopNavSlotContext);
}
