// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'CommandPaletteFooter',
  subComponentOf: 'CommandPalette',
  displayName: 'Command Palette Footer',
  isHiddenFromOverview: true,
  description: 'Footer showing keyboard navigation hints. Renders default arrow/Enter/Escape hints when no children are provided.',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Custom footer content. When omitted, renders default keyboard hints via XDSKbd.',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: 'StyleX styles for layout customization. Must be a stylex.create() value.',
    },
  ],
};

export const docsZh = {
  name: 'CommandPaletteFooter',
  isHiddenFromOverview: true,
  displayName: 'Command Palette Footer',
  description: '显示键盘导航提示的页脚。未提供子元素时渲染默认方向键/Enter/Escape 提示。',
  propDescriptions: {
    children: '自定义页脚内容。省略时通过 XDSKbd 渲染默认键盘提示。',
    xstyle: 'StyleX 布局自定义样式。必须是 stylex.create() 的值。',
  },
};

export const docsDense = {
  name: 'CommandPaletteFooter',
  isHiddenFromOverview: true,
  displayName: 'Command Palette Footer',
  description: 'footer w/ kbd hints; default=arrow/Enter/Escape hints via XDSKbd',
  propDescriptions: {
    children: 'custom content; default renders kbd hints',
    xstyle: 'StyleX layout styles; must be stylex.create() value',
  },
};
