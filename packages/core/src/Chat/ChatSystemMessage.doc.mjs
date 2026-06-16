// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'ChatSystemMessage',
  subComponentOf: 'Chat',
  displayName: 'Chat System Message',
  description: 'Centered system message for non-sender content like date separators, membership changes, and status notices. It is not a chat bubble; it has no avatar, no alignment, and no sender context. Use the divider variant for temporal breaks and default for inline status updates.',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: 'System message content: a short, factual string like a date, a join/leave notice, or a status change.',
      required: true,
    },
    {
      name: 'variant',
      type: "'default' | 'divider'",
      description: "Visual variant. 'default' renders centered text. 'divider' adds horizontal lines on each side via XDSDivider: use for date separators and section breaks.",
      default: "'default'",
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description: 'Leading icon that reinforces the message type. Wrap in XDSIcon for consistent sizing. Use for membership changes, encryption notices, or AI activity.',
      slotElements: [
        {
          __element: 'XDSIcon',
          props: {
            icon: 'check',
            size: 'sm',
          },
        },
      ],
    },
  ],
};

export const docsZh = {
  name: 'ChatSystemMessage',
  displayName: 'Chat System Message',
  description: '居中的系统消息，用于日期分隔、成员变更和状态通知等非发送者内容。没有头像、对齐或气泡。使用 divider 变体做时间分隔，default 做内联状态更新。',
  propDescriptions: {
    children: '系统消息内容 — 简短的事实性文本，如日期、加入/离开通知或状态变更。',
    variant: "视觉变体。'default' 渲染居中文本。'divider' 通过 XDSDivider 在两侧添加水平线 — 用于日期分隔和段落分隔。",
    icon: '增强消息类型辨识度的前置图标。使用 XDSIcon 包裹以获得一致的尺寸。',
  },
};

export const docsDense = {
  name: 'ChatSystemMessage',
  displayName: 'Chat System Message',
  description: 'centered non-sender msg; divider variant for date breaks, default for status notices; supports leading icon',
  propDescriptions: {
    children: 'short factual text: date, join/leave, status change',
    variant: 'default=centered text, divider=horizontal lines via XDSDivider for date/section breaks',
    icon: 'leading icon reinforcing msg type; wrap in XDSIcon',
  },
};
