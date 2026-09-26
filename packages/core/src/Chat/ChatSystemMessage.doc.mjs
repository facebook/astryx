// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'ChatSystemMessage',
  subComponentOf: 'Chat',
  displayName: 'Chat System Message',
  isHiddenFromOverview: true,
  description:
    'Centered system message for non-sender content like date separators, membership changes, and status notices. It is not a chat bubble; it has no avatar, no alignment, and no sender context. Use the divider variant for temporal breaks and default for inline status updates.',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description:
        'System message content: a short, factual string like a date, a join/leave notice, or a status change.',
      required: true,
    },
    {
      name: 'variant',
      type: "'default' | 'divider'",
      description:
        "Visual variant. 'default' renders centered text. 'divider' adds horizontal lines on each side via Divider: use for date separators and section breaks.",
      default: "'default'",
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description:
        'Leading icon that reinforces the message type. Wrap in Icon for consistent sizing. Use for membership changes, encryption notices, or AI activity.',
      slotElements: [
        {
          __element: 'Icon',
          props: {
            icon: 'check',
            size: 'sm',
          },
        },
      ],
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization. Must be a stylex.create() value: not an inline style object like style={{}}.',
    },
  ],
  theming: {
    targets: [
      {className: 'astryx-chat-system-message', visualProps: ['variant']},
    ],
  },
  usage: {
    description:
      'Use ChatSystemMessage for concise, non-sender content inside a chat transcript. Choose the default variant for factual status notices and the divider variant for date or section breaks. The component exposes status semantics and the divider branch includes a named separator.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Keep the visible message concise and self-contained so it remains understandable without an icon.',
      },
      {
        guidance: true,
        description:
          'Use the divider variant for temporal or section boundaries and the default variant for factual status notices.',
      },
      {
        guidance: false,
        description:
          'Use ChatSystemMessage for sender-authored content; use ChatMessage and ChatMessageBubble instead.',
      },
      {
        guidance: false,
        description:
          'Use caller-provided icon artwork as the only source of meaning; the visible message must carry the same information.',
      },
    ],
    anatomy: [
      {
        name: 'System message',
        required: true,
        description:
          'The noninteractive status row that carries the chat-system-message theme target.',
      },
      {
        name: 'Content',
        required: true,
        description: 'The concise caller-provided message or divider label.',
      },
      {
        name: 'Leading icon',
        required: false,
        description:
          'Optional caller-provided content rendered before the message in the default variant.',
      },
      {
        name: 'Divider',
        required: false,
        description:
          'A labelled horizontal Divider rendered by the divider variant.',
      },
    ],
  },
};

export const docsZh = {
  name: 'ChatSystemMessage',
  isHiddenFromOverview: true,
  displayName: 'Chat System Message',
  description:
    '居中的系统消息，用于日期分隔、成员变更和状态通知等非发送者内容。没有头像、对齐或气泡。使用 divider 变体做时间分隔，default 做内联状态更新。',
  propDescriptions: {
    children:
      '系统消息内容，简短的事实性文本，如日期、加入/离开通知或状态变更。',
    variant:
      "视觉变体。'default' 渲染居中文本。'divider' 通过 Divider 在两侧添加水平线，用于日期分隔和段落分隔。",
    icon: '增强消息类型辨识度的前置图标。使用 Icon 包裹以获得一致的尺寸。',
    xstyle: '用于布局自定义的 StyleX 样式。',
  },
  theming: {
    targets: [
      {className: 'astryx-chat-system-message', visualProps: ['variant']},
    ],
  },
};

export const docsDense = {
  name: 'ChatSystemMessage',
  isHiddenFromOverview: true,
  displayName: 'Chat System Message',
  description:
    'centered non-sender msg; divider variant for date breaks, default for status notices; supports leading icon',
  usage: {
    description:
      'Use for concise non-sender content in chat. Default is a factual status row; divider is a labelled date/section break.',
    bestPractices: [
      {
        guidance: true,
        description: 'Keep visible content concise and self-contained.',
      },
      {
        guidance: true,
        description:
          'Use divider for temporal/section boundaries and default for factual notices.',
      },
      {
        guidance: false,
        description:
          'Use for sender-authored content; use ChatMessage and ChatMessageBubble.',
      },
      {
        guidance: false,
        description: 'Rely on icon artwork as the only source of meaning.',
      },
    ],
  },
  propDescriptions: {
    children: 'short factual text: date, join/leave, status change',
    variant:
      'default=centered text, divider=horizontal lines via Divider for date/section breaks',
    icon: 'leading icon reinforcing msg type; wrap in Icon',
    xstyle: 'additional StyleX layout styles',
  },
};
