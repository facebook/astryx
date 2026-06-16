// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Chat component barrel export
 *
 * SYNC: When modified, update /packages/core/src/index.ts
 */

export {XDSChatComposer} from './XDSChatComposer';
export type {
  XDSChatComposerProps,
  XDSChatComposerStatus,
  XDSChatComposerDensity,
} from './XDSChatComposer';

export {XDSChatSendButton} from './XDSChatSendButton';
export type {XDSChatSendButtonProps} from './XDSChatSendButton';

export {XDSChatComposerDrawer} from './XDSChatComposerDrawer';
export type {XDSChatComposerDrawerProps} from './XDSChatComposerDrawer';

export {
  XDSChatComposerInput,
  XDSChatComposerTokenElement,
} from './XDSChatComposerInput';
export type {
  XDSChatComposerInputProps,
  XDSChatComposerInputHandle,
  XDSChatComposerToken,
  XDSChatComposerTrigger,
  XDSChatComposerTriggerItem,
} from './XDSChatComposerInput';

export {XDSChatTokenizedText} from './XDSChatTokenizedText';
export type {XDSChatTokenizedTextProps} from './XDSChatTokenizedText';

export {XDSChatMessageList} from './XDSChatMessageList';
export type {XDSChatMessageListProps} from './XDSChatMessageList';

export {XDSChatMessage} from './XDSChatMessage';
export type {XDSChatMessageProps} from './XDSChatMessage';

export {XDSChatMessageBubble} from './XDSChatMessageBubble';
export type {
  XDSChatMessageBubbleProps,
  XDSChatMessageBubbleVariant,
} from './XDSChatMessageBubble';

export {XDSChatMessageMetadata} from './XDSChatMessageMetadata';
export type {
  XDSChatMessageMetadataProps,
  XDSChatMessageStatus,
} from './XDSChatMessageMetadata';

export {XDSChatSystemMessage} from './XDSChatSystemMessage';
export type {
  XDSChatSystemMessageProps,
  XDSChatSystemMessageVariant,
} from './XDSChatSystemMessage';

export {useXDSChatStreamScroll} from './useXDSChatStreamScroll';
export type {
  UseXDSChatStreamScrollOptions,
  UseXDSChatStreamScrollReturn,
} from './useXDSChatStreamScroll';
export {useXDSChatNewMessages} from './useXDSChatNewMessages';
export type {
  UseXDSChatNewMessagesOptions,
  UseXDSChatNewMessagesReturn,
} from './useXDSChatNewMessages';

export {useXDSChatPasteAsToken} from './useXDSChatPasteAsToken';
export type {
  UseXDSChatPasteAsTokenOptions,
  UseXDSChatPasteAsTokenReturn,
} from './useXDSChatPasteAsToken';
export {useXDSChatComposerTokens} from './useXDSChatComposerTokens';
export type {
  UseXDSChatComposerTokensOptions,
  UseXDSChatComposerTokensReturn,
  TokenPortal,
} from './useXDSChatComposerTokens';
export type {XDSChatMessageSender, XDSChatDensity} from './XDSChatContext';
export {useXDSChatLayoutContext} from './XDSChatContext';

export {XDSChatToolCalls} from './XDSChatToolCalls';
export type {
  XDSChatToolCallsProps,
  XDSChatToolCallItem,
  XDSChatToolCallStatus,
} from './XDSChatToolCalls';

export {XDSChatLayout} from './XDSChatLayout';
export {XDSChatLayoutScrollButton} from './XDSChatLayoutScrollButton';
export type {XDSChatLayoutScrollButtonProps} from './XDSChatLayoutScrollButton';
export type {XDSChatLayoutProps} from './XDSChatLayout';

export {useSpeechRecognition} from './useSpeechRecognition';
export type {
  UseSpeechRecognitionOptions,
  UseSpeechRecognitionReturn,
} from './useSpeechRecognition';

export {useXDSChatDictation} from './useXDSChatDictation';
export type {
  UseXDSChatDictationOptions,
  UseXDSChatDictationReturn,
} from './useXDSChatDictation';

export {XDSChatDictationButton} from './XDSChatDictationButton';
export type {XDSChatDictationButtonProps} from './XDSChatDictationButton';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSChatComposer as ChatComposer,
  XDSChatComposerDrawer as ChatComposerDrawer,
  XDSChatComposerInput as ChatComposerInput,
  XDSChatComposerTokenElement as ChatComposerTokenElement,
  XDSChatDictationButton as ChatDictationButton,
  XDSChatLayout as ChatLayout,
  XDSChatLayoutScrollButton as ChatLayoutScrollButton,
  XDSChatMessage as ChatMessage,
  XDSChatMessageBubble as ChatMessageBubble,
  XDSChatMessageList as ChatMessageList,
  XDSChatMessageMetadata as ChatMessageMetadata,
  XDSChatSendButton as ChatSendButton,
  XDSChatSystemMessage as ChatSystemMessage,
  XDSChatTokenizedText as ChatTokenizedText,
  XDSChatToolCalls as ChatToolCalls,
  useXDSChatComposerTokens as useChatComposerTokens,
  useXDSChatDictation as useChatDictation,
  useXDSChatLayoutContext as useChatLayoutContext,
  useXDSChatNewMessages as useChatNewMessages,
  useXDSChatPasteAsToken as useChatPasteAsToken,
  useXDSChatStreamScroll as useChatStreamScroll,
} from '.';
export type {
  XDSChatComposerDensity as ChatComposerDensity,
  XDSChatComposerDrawerProps as ChatComposerDrawerProps,
  XDSChatComposerInputHandle as ChatComposerInputHandle,
  XDSChatComposerInputProps as ChatComposerInputProps,
  XDSChatComposerProps as ChatComposerProps,
  XDSChatComposerStatus as ChatComposerStatus,
  XDSChatComposerToken as ChatComposerToken,
  XDSChatComposerTrigger as ChatComposerTrigger,
  XDSChatComposerTriggerItem as ChatComposerTriggerItem,
  XDSChatDensity as ChatDensity,
  XDSChatDictationButtonProps as ChatDictationButtonProps,
  XDSChatLayoutProps as ChatLayoutProps,
  XDSChatLayoutScrollButtonProps as ChatLayoutScrollButtonProps,
  XDSChatMessageBubbleProps as ChatMessageBubbleProps,
  XDSChatMessageBubbleVariant as ChatMessageBubbleVariant,
  XDSChatMessageListProps as ChatMessageListProps,
  XDSChatMessageMetadataProps as ChatMessageMetadataProps,
  XDSChatMessageProps as ChatMessageProps,
  XDSChatMessageSender as ChatMessageSender,
  XDSChatMessageStatus as ChatMessageStatus,
  XDSChatSendButtonProps as ChatSendButtonProps,
  XDSChatSystemMessageProps as ChatSystemMessageProps,
  XDSChatSystemMessageVariant as ChatSystemMessageVariant,
  XDSChatTokenizedTextProps as ChatTokenizedTextProps,
  XDSChatToolCallItem as ChatToolCallItem,
  XDSChatToolCallStatus as ChatToolCallStatus,
  XDSChatToolCallsProps as ChatToolCallsProps,
} from '.';
// <compat-aliases:end>
