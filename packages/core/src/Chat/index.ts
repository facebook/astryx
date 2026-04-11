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

export {XDSChatComposerAttachments} from './XDSChatComposerAttachments';
export type {XDSChatComposerAttachmentsProps} from './XDSChatComposerAttachments';

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
export type {UseXDSChatStreamScrollOptions, UseXDSChatStreamScrollReturn} from './useXDSChatStreamScroll';
export {useXDSChatNewMessages} from './useXDSChatNewMessages';
export type {UseXDSChatNewMessagesOptions, UseXDSChatNewMessagesReturn} from './useXDSChatNewMessages';

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
