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

// =============================================================================
// Composer context — shared state between XDSChatComposer and XDSChatComposerInput
// =============================================================================

export interface XDSChatComposerContextValue {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  placeholder: string;
  isDisabled: boolean;
}

export const XDSChatComposerContext =
  createContext<XDSChatComposerContextValue | null>(null);

export function useXDSChatComposerContext(): XDSChatComposerContextValue | null {
  return useContext(XDSChatComposerContext);
}

// =============================================================================
// Layout context — shared between XDSChatLayout and XDSChatMessageList
// =============================================================================

export interface XDSChatLayoutContextValue {
  /** Ref to the scrollable container element that wraps the message area. */
  scrollContainerRef: React.RefObject<HTMLElement | null>;
  /** Callback ref for the message list content element — layout observes it for size changes. */
  contentRef: (el: HTMLElement | null) => void;
}

export const XDSChatLayoutContext =
  createContext<XDSChatLayoutContextValue | null>(null);

export function useXDSChatLayoutContext(): XDSChatLayoutContextValue | null {
  return useContext(XDSChatLayoutContext);
}
