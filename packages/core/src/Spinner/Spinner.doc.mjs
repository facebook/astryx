// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Spinner',
  displayName: 'Spinner',
  category: 'Performance',
  keywords: ["spinner","loader","loading","circular","progress","spin","activity","busy","indeterminate"],
  props: [
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: 'Spinner size (10px, 14px, 18px).',
      default: "'md'",
    },
    {
      name: 'shade',
      type: "'default' | 'onMedia'",
      description: 'Color shade for light or dark backgrounds.',
      default: "'default'",
    },
    {
      name: 'label',
      type: 'ReactNode',
      description:
        'Visible content below the spinner. String labels auto-set aria-label.',
    },
    {
      name: 'aria-label',
      type: 'string',
      description:
        'Accessible name for screen readers. Defaults to label (if string) or "Loading".',
      default: "'Loading'",
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value — not an inline style object like style={{}}.',
    },
  ],  theming: {
    targets: [
      {className: 'xds-spinner', visualProps: ['size', 'shade']},
    ],
  },
  usage: {
    description:
      'An animated loading indicator for processes with unknown duration, such as data fetching or form submission. Supports visible labels, multiple sizes, and a dark background variant. For content with known dimensions, use Skeleton instead.',
    bestPractices: [
      {guidance: true, description: 'Provide a meaningful label to describe what is loading for screen reader users.'},
      {guidance: true, description: 'Use the "onMedia" shade when placed on dark or accent-colored backgrounds.'},
      {guidance: false, description: 'Use for content areas with known dimensions — use Skeleton to preserve layout instead.'},
      {guidance: false, description: 'Stack multiple spinners in the same view — use one to represent the overall loading state.'},
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Spinner',
  displayName: 'Spinner',
  props: [
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: '旋转器尺寸（10px、14px、18px）。',
      default: "'md'",
    },
    {
      name: 'shade',
      type: "'default' | 'onMedia'",
      description: '浅色或深色背景的颜色色调。',
      default: "'default'",
    },
    {
      name: 'label',
      type: 'ReactNode',
      description: '旋转器下方的可见内容。字符串标签自动设置 aria-label。',
    },
    {
      name: 'aria-label',
      type: 'string',
      description: '屏幕阅读器的无障碍名称。默认为 label（如果是字符串）或 "Loading"。',
      default: "'Loading'",
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX 样式，用于布局自定义（边距、定位、尺寸）。必须是 stylex.create() 的值，而非内联样式对象如 style={{}}。',
    },
  ],
  theming: {
    targets: [
      {className: 'xds-spinner', visualProps: ['size', 'shade']},
    ],
  },
  usage: {
    description:
      'An animated loading indicator for processes with unknown duration, such as data fetching or form submission. Supports visible labels, multiple sizes, and a dark background variant. For content with known dimensions, use Skeleton instead.',
    bestPractices: [
      {guidance: true, description: 'Provide a meaningful label to describe what is loading for screen reader users.'},
      {guidance: true, description: 'Use the "onMedia" shade when placed on dark or accent-colored backgrounds.'},
      {guidance: false, description: 'Use for content areas with known dimensions — use Skeleton to preserve layout instead.'},
      {guidance: false, description: 'Stack multiple spinners in the same view — use one to represent the overall loading state.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  usage: {
    description:
      'An animated loading indicator for processes with unknown duration, such as data fetching or form submission. Supports visible labels, multiple sizes, and a dark background variant. For content with known dimensions, use Skeleton instead.',
    bestPractices: [
      {guidance: true, description: 'Provide a meaningful label to describe what is loading for screen reader users.'},
      {guidance: true, description: 'Use the "onMedia" shade when placed on dark or accent-colored backgrounds.'},
      {guidance: false, description: 'Use for content areas with known dimensions — use Skeleton to preserve layout instead.'},
      {guidance: false, description: 'Stack multiple spinners in the same view — use one to represent the overall loading state.'},
    ],
  },
  propDescriptions: {
    size: 'Spinner size (10px, 14px, 18px).',
    shade: 'Color shade for light or dark backgrounds.',
    label: 'Visible content below spinner. String auto-sets aria-label.',
    'aria-label': 'A11y name for screen readers. Defaults to label or "Loading".',
    xstyle: 'StyleX styles for layout customization. Must be stylex.create() value, not inline style.',
  },
};