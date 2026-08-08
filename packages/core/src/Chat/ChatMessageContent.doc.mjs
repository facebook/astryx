// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'ChatMessageContent',
  subComponentOf: 'Chat',
  displayName: 'Chat Message Content',
  description: 'Text-column wrapper for custom in-message content. Insets cards, attachments, citations, or a standalone ChatMessageMetadata to the same inline padding as the sibling bubble text and its name/metadata slots. Density aware via the parent ChatMessage, and stretches to the full message column so children can use its full width.',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Custom message content: cards, attachment chips, inline citations, or any ReactNode that should align with the bubble text column.',
      required: true,
    },
  ],
};

export const docsZh = {
  name: 'ChatMessageContent',
  displayName: 'Chat Message Content',
  description: '自定义消息内容的文本列包装器。将卡片、附件、引用等内容缩进到与同级气泡文本相同的内边距，随父级 ChatMessage 的密度自动调整，并撑满消息列宽度。',
  propDescriptions: {
    children: '自定义消息内容：卡片、附件、内联引用，或任何需要与气泡文本列对齐的 ReactNode。',
  },
};

export const docsDense = {
  name: 'ChatMessageContent',
  displayName: 'Chat Message Content',
  description: 'text-column wrapper for custom in-message content; insets cards/attachments to bubble text padding (density-aware) + stretches to full message column',
  propDescriptions: {
    children: 'custom content: cards, attachments, citations; aligns with bubble text column',
  },
};
