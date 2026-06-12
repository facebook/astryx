// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'ChatMessage',
  subComponentOf: 'Chat',
  displayName: 'Chat Message',
  description: 'Sender context wrapper — handles avatar, name, metadata, and alignment based on sender role.',
  props: [
    {
      name: 'sender',
      type: "'user' | 'assistant' | 'system'",
      description: 'Who sent this message — controls alignment and layout.',
      required: true,
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Free-form content: bubbles, asset lists, tool calls, images.',
      required: true,
    },
    {
      name: 'avatar',
      type: 'ReactNode',
      description: 'Avatar element rendered beside the message. Typically XDSAvatar.',
      slotElements: [
        {
          __element: 'XDSAvatar',
          props: {
            name: 'User',
            size: 'sm',
          },
        },
      ],
    },
    {
      name: 'name',
      type: 'ReactNode',
      description: "Sender name rendered above the message body. Use when the first child is raw content (not a bubble). If the first child is a bubble, put the name on the bubble's `name` prop instead.",
    },
    {
      name: 'metadata',
      type: 'ReactNode',
      description: "Metadata rendered below the message body. Use when the last child is raw content (not a bubble). If the last child is a bubble, put metadata on the bubble's `metadata` prop instead.",
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
      name: 'density',
      type: "'compact' | 'balanced' | 'spacious'",
      description: 'Visual density. Inherited from list context if not set.',
    },
  ],
};

export const docsZh = {
  name: 'ChatMessage',
  displayName: 'Chat Message',
  description: '发送者上下文包装器，根据发送者角色处理头像、名称、元数据和对齐方式。',
  propDescriptions: {
    sender: '消息发送者，控制对齐和布局。',
    children: '自由内容：气泡、资源列表、工具调用、图片。',
    avatar: '消息旁边渲染的头像元素。通常是 XDSAvatar。',
    name: '消息正文上方渲染的发送者名称。当第一个子元素不是气泡时使用。',
    metadata: '消息正文下方渲染的元数据。当最后一个子元素不是气泡时使用。',
    density: '视觉密度。未设置时从列表上下文继承。',
  },
};

export const docsDense = {
  name: 'ChatMessage',
  displayName: 'Chat Message',
  description: 'sender context wrapper; handles avatar+name+metadata+alignment by sender role',
  propDescriptions: {
    sender: 'who sent; controls alignment+layout',
    children: 'free-form: bubbles, assets, tool calls, images',
    avatar: 'avatar element beside msg; typically XDSAvatar',
    name: 'sender name above body; use when first child is raw (not bubble)',
    displayName: 'sender name above body; use when first child is raw (not bubble)',
    metadata: 'metadata below body; use when last child is raw (not bubble)',
    density: 'visual density; inherited from list context if unset',
  },
};
