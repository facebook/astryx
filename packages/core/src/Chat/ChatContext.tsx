// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ChatContext.tsx
 * @input Uses React createContext
 * @output Exports ChatMessageContext for sharing sender/density between Chat components
 * @position Internal context; consumed by ChatMessage and ChatMessageBubble
 */

import {createContext, use} from 'react';

export type ChatMessageSender = 'user' | 'assistant' | 'system';
export type ChatDensity = 'compact' | 'balanced' | 'spacious';

export interface ChatMessageContextValue {
  sender: ChatMessageSender;
  density: ChatDensity;
}

export const ChatMessageContext =
  createContext<ChatMessageContextValue | null>(null);
ChatMessageContext.displayName = 'ChatMessageContext';

export function useChatMessageContext(): ChatMessageContextValue | null {
  return use(ChatMessageContext);
}

export interface ChatListContextValue {
  density: ChatDensity;
}

export const ChatListContext = createContext<ChatListContextValue | null>(
  null,
);
ChatListContext.displayName = 'ChatListContext';

export function useChatListContext(): ChatListContextValue | null {
  return use(ChatListContext);
}

// =============================================================================
// Composer context — shared state between ChatComposer and ChatComposerInput
// =============================================================================

export interface ChatComposerContextValue {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  placeholder: string;
  isDisabled: boolean;
  isStopShown: boolean;
  canSend: boolean;
  onStop?: () => void;
}

export const ChatComposerContext =
  createContext<ChatComposerContextValue | null>(null);
ChatComposerContext.displayName = 'ChatComposerContext';

export function useChatComposerContext(): ChatComposerContextValue | null {
  return use(ChatComposerContext);
}

// =============================================================================
// Layout context — shared between ChatLayout and ChatMessageList
// =============================================================================

export interface ChatLayoutContextValue {
  /** Ref to the scrollable container element that wraps the message area. */
  scrollContainerRef: React.RefObject<HTMLElement | null>;
  /** Callback ref for the message list content element — layout observes it for size changes. */
  contentRef: (el: HTMLElement | null) => void;
}

export const ChatLayoutContext =
  createContext<ChatLayoutContextValue | null>(null);
ChatLayoutContext.displayName = 'ChatLayoutContext';

export function useChatLayoutContext(): ChatLayoutContextValue | null {
  return use(ChatLayoutContext);
}
