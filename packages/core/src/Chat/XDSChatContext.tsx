'use client';

/**
 * @file XDSChatContext.tsx
 * @input Uses React createContext
 * @output Exports XDSChatMessageContext for sharing sender/density between Chat components
 * @position Internal context; consumed by XDSChatMessage and XDSChatMessageBubble
 */

import {createContext, useContext} from 'react';

export type XDSChatMessageSender = 'user' | 'assistant' | 'system';
export type XDSChatDensity = 'compact' | 'balanced' | 'spacious';

export interface XDSChatMessageContextValue {
  sender: XDSChatMessageSender;
  density: XDSChatDensity;
}

export const XDSChatMessageContext =
  createContext<XDSChatMessageContextValue | null>(null);

export function useXDSChatMessageContext(): XDSChatMessageContextValue | null {
  return useContext(XDSChatMessageContext);
}

export interface XDSChatListContextValue {
  density: XDSChatDensity;
}

export const XDSChatListContext = createContext<XDSChatListContextValue | null>(
  null,
);

export function useXDSChatListContext(): XDSChatListContextValue | null {
  return useContext(XDSChatListContext);
}
