// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'ChatMessageMetadata',
  subComponentOf: 'Chat',
  displayName: 'Chat Message Metadata',
  description: 'Composable metadata row for chat messages. Renders timestamp, footer content, and delivery status in a single row. Direction reverses for user sender. Renders nothing if all props are empty.',
  usage: {
    description:
      'Use ChatMessageMetadata beneath a message for its timestamp, supporting footer content, and visible delivery status.',
    accessibility: [
      {name: 'Visible status text', description: 'Delivery status includes a visible localized label, so measure that label against the actual message parent at 4.5:1 for every status. The repeated icon is redundant when the label remains visible.'},
      {name: 'Accessible status', description: 'Keep the localized status in the metadata accessible name; the icon alone must not be the only programmatic status cue.'},
      {name: 'Message surfaces', description: 'Measure user and assistant compositions separately because metadata can inherit different parent backgrounds and foreground overrides.'},
      {name: 'Sending motion', description: 'The sending pulse is supplemental. The visible label and icon must remain understandable with reduced motion enabled.'},
    ],
  },
  props: [
    {
      name: 'timestamp',
      type: 'ReactNode',
      description: 'Timestamp content: a string or Timestamp component.',
      slotElements: [
        {
          __element: 'Text',
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
          __element: 'Text',
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
    timestamp: '时间戳内容，字符串或 Timestamp 组件。',
    footer: '页脚内容：模型信息、反应按钮、复制按钮。',
    status: '消息发送状态。显示图标和标签。',
  },
};

export const docsDense = {
  name: 'ChatMessageMetadata',
  displayName: 'Chat Message Metadata',
  description: 'composable metadata row; renders timestamp · footer · status; reverses for user sender',
  propDescriptions: {
    timestamp: 'timestamp content; string or Timestamp',
    footer: 'footer content; model info, reaction btns, copy btn',
    status: 'delivery status; shows icon+label',
  },
};
