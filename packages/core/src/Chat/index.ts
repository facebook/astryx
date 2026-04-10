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

export {XDSChatMessageTokenizedText} from './XDSChatMessageTokenizedText';
export type {
  XDSChatMessageTokenizedTextProps,
  XDSChatMessageTokenConfig,
} from './XDSChatMessageTokenizedText';

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

export {useAutoScroll} from './useAutoScroll';
export type {UseAutoScrollOptions, UseAutoScrollReturn} from './useAutoScroll';

export type {XDSChatMessageSender, XDSChatDensity} from './XDSChatContext';

export {XDSChatToolCalls} from './XDSChatToolCalls';
export type {
  XDSChatToolCallsProps,
  XDSChatToolCallItem,
  XDSChatToolCallStatus,
} from './XDSChatToolCalls';
