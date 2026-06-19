// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Code',
  subComponentOf: 'CodeBlock',
  displayName: 'Code',
  description: 'Inline code element. Renders a styled <code> with monospace font and muted background. For fenced blocks, use XDSCodeBlock.',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Code content.',
      required: true,
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: 'StyleX styles for layout customization. Must be a stylex.create() value.',
    },
    {
      name: 'className',
      type: 'string',
      description: 'CSS class name for the root element. Prefer xstyle for styling.',
    },
    {
      name: 'style',
      type: 'CSSProperties',
      description: 'Inline styles. Prefer xstyle for StyleX-optimized styling.',
    },
    {
      name: 'data-testid',
      type: 'string',
      description: 'Test selector for automated testing frameworks.',
    },
  ],
};

export const docsZh = {
  name: 'Code',
  displayName: 'Code',
  description: '内联代码元素。渲染带等宽字体和低调背景的 <code>。如需围栏代码块，请使用 XDSCodeBlock。',
  propDescriptions: {
    children: '代码内容。',
    xstyle: 'StyleX 布局自定义样式。必须是 stylex.create() 的值。',
    className: '根元素的 CSS 类名。优先使用 xstyle。',
    style: '内联样式。优先使用 xstyle。',
    "data-testid": '自动化测试框架的测试选择器。',
  },
};

export const docsDense = {
  name: 'Code',
  displayName: 'Code',
  description: 'inline code element; styled <code> w/ monospace+muted bg; for prose',
  propDescriptions: {
    children: 'code content',
    xstyle: 'StyleX layout styles; must be stylex.create() value',
    className: 'CSS class for root; prefer xstyle',
    style: 'inline styles; prefer xstyle',
    "data-testid": 'test selector',
  },
};
