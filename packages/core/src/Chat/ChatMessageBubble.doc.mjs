// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'ChatMessageBubble',
  subComponentOf: 'Chat',
  displayName: 'Chat Message Bubble',
  isHiddenFromOverview: true,
  description: 'Styled content container — the chat “bubble.” Reads sender from parent XDSChatMessage context to auto-style the background. Use filled for standard messages and ghost when content needs alignment without a visible boundary. Supports name/metadata slots aligned with bubble padding, and multi-bubble grouping via the group prop for consecutive messages from the same sender.',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Bubble content — text, XDSMarkdown, or any ReactNode.',
      required: true,
    },
    {
      name: 'variant',
      type: "'filled' | 'ghost'",
      description: "Visual variant. 'filled' renders sender-colored background (default). 'ghost' renders transparent background but keeps padding for alignment.",
      default: "'filled'",
    },
    {
      name: 'name',
      type: 'ReactNode',
      description: "Sender name rendered above the bubble, aligned with bubble text padding. Use on the first bubble in a message. If the first content is raw (no bubble), use XDSChatMessage's `name` prop instead.",
    },
    {
      name: 'metadata',
      type: 'ReactNode',
      description: "Metadata content rendered below the bubble, aligned with bubble text padding. Use on the last bubble in a message. If the last content is raw (no bubble), use XDSChatMessage's `metadata` prop instead.",
      slotElements: [
        {
          __element: 'XDSText',
          props: {
            type: 'body',
          },
          children: 'Metadata',
        },
      ],
    },
    {
      name: 'group',
      type: "'first' | 'middle' | 'last'",
      description: 'Position within a multi-bubble group. Controls corner radius reduction on the sender side. Leave unset for standalone bubbles (full radius).',
    },
  ],
};

export const docsZh = {
  name: 'ChatMessageBubble',
  isHiddenFromOverview: true,
  displayName: 'Chat Message Bubble',
  description: '样式化的气泡容器，从父上下文读取发送者信息进行自动样式化。支持 name/metadata 插槽、多气泡分组和透明变体。',
  propDescriptions: {
    children: '气泡内容：文本、XDSMarkdown 或任何 ReactNode。',
    variant: "视觉变体。'filled' 渲染发送者颜色背景，'ghost' 渲染透明背景但保持填充对齐。",
    name: '气泡上方渲染的发送者名称，与气泡文本内边距对齐。用于消息中的第一个气泡。',
    metadata: '气泡下方渲染的元数据内容，与气泡文本内边距对齐。用于消息中的最后一个气泡。',
    group: '多气泡组中的位置。控制发送者侧的圆角缩减。',
  },
};

export const docsDense = {
  name: 'ChatMessageBubble',
  isHiddenFromOverview: true,
  displayName: 'Chat Message Bubble',
  description: 'styled bubble container; reads sender from context; supports name/metadata slots, group corners, ghost variant',
  propDescriptions: {
    children: 'bubble content: text, XDSMarkdown, any ReactNode',
    variant: 'filled (sender bg) or ghost (transparent, keeps padding)',
    name: 'sender name above bubble, aligned w/ bubble padding',
    displayName: 'sender name above bubble, aligned w/ bubble padding',
    metadata: 'metadata below bubble, aligned w/ bubble padding',
    group: 'position in multi-bubble group; controls corner radius reduction',
  },
};
