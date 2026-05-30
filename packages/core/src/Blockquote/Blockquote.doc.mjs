// Copyright (c) Meta Platforms, Inc. and affiliates.



/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Blockquote',
  displayName: 'Blockquote',
  category: 'Communications',
  keywords: ["blockquote","quote","citation","pullquote","quotation","cite","excerpt"],
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Content of the blockquote.',
      required: true,
    },
    {
      name: 'cite',
      type: 'ReactNode',
      description: 'Optional attribution for the quote. Rendered in a <footer> with <cite>.',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value — not an inline style object like style={{}}.',
    },
  ],
  theming: {
    targets: [
      {className: 'xds-blockquote', visualProps: []},
    ],
  },
  usage: {
    description: 'A styled quotation block with an accent-colored left border and secondary text color. Use to highlight quoted content, testimonials, or excerpts.',
    bestPractices: [
      { guidance: true, description: 'Use for quoted text, testimonials, or highlighted excerpts from external sources.' },
      { guidance: true, description: 'Provide a cite prop when the source of the quote is known.' },
      { guidance: false, description: 'Use for callout boxes or informational notes — use XDSBanner for those.' },
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Blockquote',
  displayName: 'Blockquote',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: '引用块的内容。',
      required: true,
    },
    {
      name: 'cite',
      type: 'ReactNode',
      description: '引用的可选出处。在 <footer> 中以 <cite> 渲染。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式（边距、定位、尺寸）。必须是 stylex.create() 的值 — 不能是 style={{}} 这样的内联样式对象。',
    },
  ],
  theming: {
    targets: [
      {className: 'xds-blockquote', visualProps: []},
    ],
  },
  usage: {
    description: '带有强调色左边框和次要文本颜色的引用块。用于突出显示引用内容、推荐语或摘录。',
    bestPractices: [
      { guidance: true, description: '用于引用文本、推荐语或来自外部来源的高亮摘录。' },
      { guidance: true, description: '当引用来源已知时，提供 cite 属性。' },
      { guidance: false, description: '用于提示框或信息说明 — 应使用 XDSBanner。' },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'styled quotation block w/ accent left border, secondary text, optional citation',
  usage: {
    description: 'A styled quotation block with an accent-colored left border and secondary text color. Use to highlight quoted content, testimonials, or excerpts.',
    bestPractices: [
      { guidance: true, description: 'Use for quoted text, testimonials, or highlighted excerpts.' },
      { guidance: true, description: 'Provide cite when source is known.' },
      { guidance: false, description: 'Use for callouts/notes — use XDSBanner instead.' },
    ],
  },
  propDescriptions: {
    children: 'blockquote content',
    cite: 'optional attribution rendered in <footer><cite>',
    xstyle: 'StyleX styles for layout; must be stylex.create() value',
  },
};
