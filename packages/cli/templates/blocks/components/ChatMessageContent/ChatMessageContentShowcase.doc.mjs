// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../../../../../core/src/docs-types').TemplateDoc} */
export const doc = {
  type: 'block',
  exampleFor: 'ChatMessageContent',
  name: 'ChatMessageContent — Showcase',
  displayName: 'ChatMessageContent — Showcase',
  description: 'Custom in-message content aligned to the bubble text column. An artifact card and a standalone metadata row are wrapped in ChatMessageContent so their left edge matches the bubble text instead of the message edge.',
  isReady: true,
  aspectRatio: 4 / 3,
  componentsUsed: ['Chat', 'ChatMessage', 'ChatMessageBubble', 'ChatMessageContent', 'ChatMessageMetadata', 'ClickableCard', 'Text', 'Timestamp'],
};
