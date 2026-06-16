// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'ChatComposer',
  subComponentOf: 'Chat',
  displayName: 'Chat Composer',
  description: 'Layout shell for a chat composer. Arranges named slots (drawer, header, input, footer, send) with page-radius container, hover/focus shadows, and concentric inner radius for child elements.',
  props: [
    {
      name: 'onSubmit',
      type: '(value: string) => void',
      description: 'Called when the user submits a message.',
      required: true,
    },
    {
      name: 'onStop',
      type: '() => void',
      description: 'Called when the user requests to stop generation.',
    },
    {
      name: 'isStopShown',
      type: 'boolean',
      description: 'Whether the stop button is shown instead of the send button.',
      default: 'false',
    },
    {
      name: 'value',
      type: 'string',
      description: 'Controlled input value.',
    },
    {
      name: 'onChange',
      type: '(value: string) => void',
      description: 'Change handler for controlled mode.',
    },
    {
      name: 'placeholder',
      type: 'string',
      description: 'Placeholder text shown when the input is empty.',
      default: "'Type a message...'",
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Disables the composer.',
      default: 'false',
    },
    {
      name: 'density',
      type: "'compact' | 'balanced' | 'spacious'",
      description: 'Visual density.',
      default: "'balanced'",
    },
    {
      name: 'drawer',
      type: 'ReactNode',
      description: 'Slot: collapsible drawer above the input: attachments, context chips, etc. Use XDSChatComposerDrawer.',
      slotElements: [
        {
          __element: 'XDSText',
          props: {
            type: 'body',
          },
          children: 'Drawer content',
        },
      ],
    },
    {
      name: 'headerActions',
      type: 'ReactNode',
      description: 'Slot: left-aligned header actions (attach, mention buttons). Use icon-only size="sm" buttons.',
      slotElements: [
        {
          __element: 'XDSButton',
          props: {
            label: 'Action',
            variant: 'ghost',
            size: 'sm',
          },
        },
      ],
    },
    {
      name: 'headerContext',
      type: 'ReactNode',
      description: 'Slot: right-aligned contextual info in the header (context window usage, XDSProgressBar, supporting text).',
      slotElements: [
        {
          __element: 'XDSText',
          props: {
            type: 'body',
          },
          children: 'Context',
        },
      ],
    },
    {
      name: 'input',
      type: 'ReactNode',
      description: 'Slot: custom input element. Replaces the default textarea. Use XDSChatComposerInput for trigger menus.',
      slotElements: [
        {
          __element: 'XDSTextInput',
          props: {
            label: 'Input',
            placeholder: 'Type here...',
          },
        },
      ],
    },
    {
      name: 'footerActions',
      type: 'ReactNode',
      description: 'Slot: left-aligned footer actions (model selector, etc).',
      slotElements: [
        {
          __element: 'XDSButton',
          props: {
            label: 'Action',
            variant: 'ghost',
            size: 'sm',
          },
        },
      ],
    },
    {
      name: 'sendActions',
      type: 'ReactNode',
      description: 'Slot: actions to the left of the send button.',
      slotElements: [
        {
          __element: 'XDSButton',
          props: {
            label: 'Action',
            variant: 'ghost',
            size: 'sm',
          },
        },
      ],
    },
    {
      name: 'sendButton',
      type: 'ReactNode',
      description: 'Slot: custom send button. Replaces the default send/stop button.',
      slotElements: [
        {
          __element: 'XDSButton',
          props: {
            label: 'Action',
            variant: 'ghost',
            size: 'sm',
          },
        },
      ],
    },
    {
      name: 'status',
      type: "{ type: 'error' | 'warning'; message?: string }",
      description: 'Status message rendered below (or above) the composer.',
    },
    {
      name: 'statusPosition',
      type: "'top' | 'bottom'",
      description: 'Where to render the status.',
      default: "'bottom'",
    },
  ],
};

export const docsZh = {
  name: 'ChatComposer',
  displayName: 'Chat Composer',
  description: '聊天编写器布局外壳。排列命名插槽（附件、标题栏、输入、页脚、发送），带有页面圆角容器和同心内圆角。',
  propDescriptions: {
    onSubmit: '用户提交消息时调用。',
    onStop: '用户请求停止生成时调用。',
    isStopShown: '是否显示停止按钮。',
    value: '受控输入值。',
    onChange: '受控模式的输入值变更时调用。序列化字符串包含标记占位符。',
    placeholder: '输入为空时显示的占位文本。',
    isDisabled: '禁用编写器。',
    density: '视觉密度。',
    drawer: '插槽：输入上方的可折叠抽屉——附件、上下文标签等。使用 XDSChatComposerDrawer。',
    headerActions: '插槽：标题左侧操作按钮（附件、提及按钮）。使用仅图标 size="sm" 按钮。',
    headerContext: '插槽：标题右侧上下文信息（上下文窗口使用情况、XDSProgressBar、辅助文本）。',
    input: '插槽：自定义输入元素。替换默认文本区域。使用 XDSChatComposerInput 实现触发菜单。',
    footerActions: '插槽：左对齐的页脚操作（模型选择器等）。',
    sendActions: '插槽：发送按钮左侧的操作。',
    sendButton: '插槽：自定义发送按钮。替换默认的发送/停止按钮。',
    status: '编写器下方（或上方）的状态消息。',
    statusPosition: '状态渲染位置。',
  },
};

export const docsDense = {
  name: 'ChatComposer',
  displayName: 'Chat Composer',
  description: 'composer layout shell; named slots (drawer/header/input/footer/send) w/ page-radius + concentric inner radius',
  propDescriptions: {
    onSubmit: 'submit msg handler',
    onStop: 'stop generation handler',
    isStopShown: 'whether the stop button is shown',
    value: 'controlled input value',
    onChange: 'controlled change handler',
    placeholder: 'placeholder when empty',
    isDisabled: 'disabled; use during streaming or unmet prereqs',
    density: 'visual density',
    drawer: 'slot: collapsible drawer above input: attachments, context chips, etc.; use XDSChatComposerDrawer',
    headerActions: 'slot: left header actions (attach, mention); icon-only sm buttons',
    headerContext: 'slot: right header context info (window usage, XDSProgressBar, text)',
    input: 'slot: custom input; replaces default textarea; use XDSChatComposerInput for triggers',
    footerActions: 'slot: left footer actions (model selector etc)',
    sendActions: 'slot: actions left of send btn',
    sendButton: 'slot: custom send btn; replaces default',
    status: 'status msg below/above composer',
    statusPosition: 'status render position',
  },
};
