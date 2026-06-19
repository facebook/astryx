// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Chat component barrel export
 *
 * SYNC: When modified, update /packages/core/src/index.ts
 */

export {ChatComposer} from './ChatComposer';
export type {
  ChatComposerProps,
  ChatComposerStatus,
  ChatComposerDensity,
} from './ChatComposer';

export {ChatSendButton} from './ChatSendButton';
export type {ChatSendButtonProps} from './ChatSendButton';

export {ChatComposerDrawer} from './ChatComposerDrawer';
export type {ChatComposerDrawerProps} from './ChatComposerDrawer';

export {
  ChatComposerInput,
  ChatComposerTokenElement,
} from './ChatComposerInput';
export type {
  ChatComposerInputProps,
  ChatComposerInputHandle,
  ChatComposerToken,
  ChatComposerTrigger,
  ChatComposerTriggerItem,
} from './ChatComposerInput';

export {ChatTokenizedText} from './ChatTokenizedText';
export type {ChatTokenizedTextProps} from './ChatTokenizedText';

export {ChatMessageList} from './ChatMessageList';
export type {ChatMessageListProps} from './ChatMessageList';

export {ChatMessage} from './ChatMessage';
export type {ChatMessageProps} from './ChatMessage';

export {ChatMessageBubble} from './ChatMessageBubble';
export type {
  ChatMessageBubbleProps,
  ChatMessageBubbleVariant,
} from './ChatMessageBubble';

export {ChatMessageMetadata} from './ChatMessageMetadata';
export type {
  ChatMessageMetadataProps,
  ChatMessageStatus,
} from './ChatMessageMetadata';

export {ChatSystemMessage} from './ChatSystemMessage';
export type {
  ChatSystemMessageProps,
  ChatSystemMessageVariant,
} from './ChatSystemMessage';

export {useChatStreamScroll} from './useChatStreamScroll';
export type {
  UseXDSChatStreamScrollOptions,
  UseXDSChatStreamScrollReturn,
} from './useChatStreamScroll';
export {useChatNewMessages} from './useChatNewMessages';
export type {
  UseXDSChatNewMessagesOptions,
  UseXDSChatNewMessagesReturn,
} from './useChatNewMessages';

export {useChatPasteAsToken} from './useChatPasteAsToken';
export type {
  UseXDSChatPasteAsTokenOptions,
  UseXDSChatPasteAsTokenReturn,
} from './useChatPasteAsToken';
export {useChatComposerTokens} from './useChatComposerTokens';
export type {
  UseXDSChatComposerTokensOptions,
  UseXDSChatComposerTokensReturn,
  TokenPortal,
} from './useChatComposerTokens';
export type {ChatMessageSender, ChatDensity} from './ChatContext';
export {useChatLayoutContext} from './ChatContext';

export {ChatToolCalls} from './ChatToolCalls';
export type {
  ChatToolCallsProps,
  ChatToolCallItem,
  ChatToolCallStatus,
} from './ChatToolCalls';

export {ChatLayout} from './ChatLayout';
export {ChatLayoutScrollButton} from './ChatLayoutScrollButton';
export type {ChatLayoutScrollButtonProps} from './ChatLayoutScrollButton';
export type {ChatLayoutProps} from './ChatLayout';

export {useSpeechRecognition} from './useSpeechRecognition';
export type {
  UseSpeechRecognitionOptions,
  UseSpeechRecognitionReturn,
} from './useSpeechRecognition';

export {useChatDictation} from './useChatDictation';
export type {
  UseXDSChatDictationOptions,
  UseXDSChatDictationReturn,
} from './useChatDictation';

export {ChatDictationButton} from './ChatDictationButton';
export type {ChatDictationButtonProps} from './ChatDictationButton';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  ChatComposer as XDSChatComposer,
  ChatComposerDrawer as XDSChatComposerDrawer,
  ChatComposerInput as XDSChatComposerInput,
  ChatComposerTokenElement as XDSChatComposerTokenElement,
  ChatDictationButton as XDSChatDictationButton,
  ChatLayout as XDSChatLayout,
  ChatLayoutScrollButton as XDSChatLayoutScrollButton,
  ChatMessage as XDSChatMessage,
  ChatMessageBubble as XDSChatMessageBubble,
  ChatMessageList as XDSChatMessageList,
  ChatMessageMetadata as XDSChatMessageMetadata,
  ChatSendButton as XDSChatSendButton,
  ChatSystemMessage as XDSChatSystemMessage,
  ChatTokenizedText as XDSChatTokenizedText,
  ChatToolCalls as XDSChatToolCalls,
  useChatComposerTokens as useXDSChatComposerTokens,
  useChatDictation as useXDSChatDictation,
  useChatLayoutContext as useXDSChatLayoutContext,
  useChatNewMessages as useXDSChatNewMessages,
  useChatPasteAsToken as useXDSChatPasteAsToken,
  useChatStreamScroll as useXDSChatStreamScroll,
  useSpeechRecognition as useXDSSpeechRecognition,
} from '.';
export type {
  ChatComposerDensity as XDSChatComposerDensity,
  ChatComposerDrawerProps as XDSChatComposerDrawerProps,
  ChatComposerInputHandle as XDSChatComposerInputHandle,
  ChatComposerInputProps as XDSChatComposerInputProps,
  ChatComposerProps as XDSChatComposerProps,
  ChatComposerStatus as XDSChatComposerStatus,
  ChatComposerToken as XDSChatComposerToken,
  ChatComposerTrigger as XDSChatComposerTrigger,
  ChatComposerTriggerItem as XDSChatComposerTriggerItem,
  ChatDensity as XDSChatDensity,
  ChatDictationButtonProps as XDSChatDictationButtonProps,
  ChatLayoutProps as XDSChatLayoutProps,
  ChatLayoutScrollButtonProps as XDSChatLayoutScrollButtonProps,
  ChatMessageBubbleProps as XDSChatMessageBubbleProps,
  ChatMessageBubbleVariant as XDSChatMessageBubbleVariant,
  ChatMessageListProps as XDSChatMessageListProps,
  ChatMessageMetadataProps as XDSChatMessageMetadataProps,
  ChatMessageProps as XDSChatMessageProps,
  ChatMessageSender as XDSChatMessageSender,
  ChatMessageStatus as XDSChatMessageStatus,
  ChatSendButtonProps as XDSChatSendButtonProps,
  ChatSystemMessageProps as XDSChatSystemMessageProps,
  ChatSystemMessageVariant as XDSChatSystemMessageVariant,
  ChatTokenizedTextProps as XDSChatTokenizedTextProps,
  ChatToolCallItem as XDSChatToolCallItem,
  ChatToolCallStatus as XDSChatToolCallStatus,
  ChatToolCallsProps as XDSChatToolCallsProps,
  TokenPortal as XDSTokenPortal,
  UseSpeechRecognitionOptions as XDSUseSpeechRecognitionOptions,
  UseSpeechRecognitionReturn as XDSUseSpeechRecognitionReturn,
  UseXDSChatComposerTokensOptions as XDSUseXDSChatComposerTokensOptions,
  UseXDSChatComposerTokensReturn as XDSUseXDSChatComposerTokensReturn,
  UseXDSChatDictationOptions as XDSUseXDSChatDictationOptions,
  UseXDSChatDictationReturn as XDSUseXDSChatDictationReturn,
  UseXDSChatNewMessagesOptions as XDSUseXDSChatNewMessagesOptions,
  UseXDSChatNewMessagesReturn as XDSUseXDSChatNewMessagesReturn,
  UseXDSChatPasteAsTokenOptions as XDSUseXDSChatPasteAsTokenOptions,
  UseXDSChatPasteAsTokenReturn as XDSUseXDSChatPasteAsTokenReturn,
  UseXDSChatStreamScrollOptions as XDSUseXDSChatStreamScrollOptions,
  UseXDSChatStreamScrollReturn as XDSUseXDSChatStreamScrollReturn,
} from '.';
// <compat-aliases:end>
