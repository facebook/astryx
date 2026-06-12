// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'CommandPaletteInput',
  subComponentOf: 'CommandPalette',
  displayName: 'Command Palette Input',
  isHiddenFromOverview: true,
  description: 'Search input slot. Auto-focuses on mount. Wires to command palette context when used inside XDSCommandPalette.',
  props: [
    {
      name: 'placeholder',
      type: 'string',
      description: 'Placeholder text for the input.',
      default: "'Search...'",
    },
    {
      name: 'hasAutoFocus',
      type: 'boolean',
      description: 'Auto-focus the input when mounted. Automatically disabled when inside an inline command palette.',
      default: 'true',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description: 'Content rendered at the trailing end of the input, after the spinner. Use for clear buttons or keyboard shortcut hints.',
      slotElements: [
        {
          __element: 'XDSIcon',
          props: {
            icon: 'chevronDown',
            size: 'sm',
          },
        },
        {
          __element: 'XDSBadge',
          props: {
            label: '3',
          },
        },
      ],
    },
    {
      name: 'value',
      type: 'string',
      description: 'Search value. When omitted inside XDSCommandPalette, reads from context.',
    },
    {
      name: 'onValueChange',
      type: '(value: string) => void',
      description: 'Called when search value changes. When omitted inside XDSCommandPalette, writes to context.',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: 'StyleX styles for layout customization. Must be a stylex.create() value.',
    },
  ],
};

export const docsZh = {
  name: 'CommandPaletteInput',
  isHiddenFromOverview: true,
  displayName: 'Command Palette Input',
  description: '搜索输入插槽。挂载时自动聚焦。在 XDSCommandPalette 内使用时连接到上下文。',
  propDescriptions: {
    placeholder: '输入框的占位文本。',
    hasAutoFocus: '挂载时自动聚焦输入框。内联命令面板中自动禁用。',
    endContent: '渲染在输入框末尾的内容，位于加载指示器之后。',
    value: '搜索值。在 XDSCommandPalette 内省略时从上下文读取。',
    onValueChange: '搜索值变化时调用。在 XDSCommandPalette 内省略时写入上下文。',
    xstyle: 'StyleX 布局自定义样式。必须是 stylex.create() 的值。',
  },
};

export const docsDense = {
  name: 'CommandPaletteInput',
  isHiddenFromOverview: true,
  displayName: 'Command Palette Input',
  description: 'search input; auto-focus on mount; wires to context inside XDSCommandPalette',
  propDescriptions: {
    placeholder: 'input placeholder text',
    hasAutoFocus: 'auto-focus on mount; auto-disabled in inline mode',
    endContent: 'trailing content after spinner',
    value: 'search value; reads context when omitted inside palette',
    onValueChange: 'called on change; writes context when omitted inside palette',
    xstyle: 'StyleX layout styles; must be stylex.create() value',
  },
};
