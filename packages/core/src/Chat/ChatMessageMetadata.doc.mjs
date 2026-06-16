// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'ChatMessageMetadata',
  subComponentOf: 'Chat',
  displayName: 'Chat Message Metadata',
  description: 'Composable metadata row for chat messages. Renders timestamp, footer content, and delivery status in a single row. Direction reverses for user sender. Renders nothing if all props are empty.',
  props: [
    {
      name: 'timestamp',
      type: 'ReactNode',
      description: 'Timestamp content: a string or XDSTimestamp component.',
      slotElements: [
        {
          __element: 'XDSText',
          props: {
            type: 'body',
          },
          children: 'Just now',
        },
      ],
    },
    {
      name: 'footer',
      type: 'ReactNode',
      description: 'Footer content: model info, reaction buttons, copy button.',
      slotElements: [
        {
          __element: 'XDSText',
          props: {
            type: 'body',
          },
          children: 'Footer content',
        },
      ],
    },
    {
      name: 'status',
      type: "'sending' | 'sent' | 'delivered' | 'read' | 'error'",
      description: 'Message delivery status. Shows icon + label.',
    },
  ],
};

export const docsZh = {
  name: 'ChatMessageMetadata',
  displayName: 'Chat Message Metadata',
  description: '可组合的消息元数据行。渲染时间戳、页脚内容和发送状态。用户消息方向反转。',
  propDescriptions: {
    timestamp: '时间戳内容 — 字符串或 XDSTimestamp 组件。',
    footer: '页脚内容 — 模型信息、反应按钮、复制按钮。',
    status: '消息发送状态。显示图标和标签。',
  },
};

export const docsDense = {
  name: 'ChatMessageMetadata',
  displayName: 'Chat Message Metadata',
  description: 'composable metadata row; renders timestamp · footer · status; reverses for user sender',
  propDescriptions: {
    timestamp: 'timestamp content; string or XDSTimestamp',
    footer: 'footer content; model info, reaction btns, copy btn',
    status: 'delivery status; shows icon+label',
  },
};
