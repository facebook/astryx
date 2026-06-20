// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'CircularProgress',
  displayName: 'Circular Progress',
  category: 'Feedback & Status',
  keywords: ["circular","progress","radial","ring","arc","determinate","indeterminate","gauge","meter","donut"],
  props: [
    {
      name: 'value',
      type: 'number',
      description: 'Current value. When omitted, renders an indeterminate spinning animation.',
    },
    {
      name: 'max',
      type: 'number',
      description: 'Maximum value.',
      default: '100',
    },
    {
      name: 'label',
      type: 'string',
      description: 'Accessible label for screen readers (required).',
      required: true,
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description: 'Visually hide the label (remains accessible). Defaults to true since circular progress typically shows center content instead.',
      default: 'true',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Content displayed in the center of the ring: percentage, icon, or custom content.',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: 'Diameter of the progress ring (32px, 48px, 64px).',
      default: "'md'",
    },
    {
      name: 'variant',
      type: "'accent' | 'success' | 'warning' | 'error' | 'neutral'",
      description: 'Semantic color variant for the progress fill.',
      default: "'accent'",
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization (margins, positioning). Must be a stylex.create() value.',
    },
  ],
  theming: {
    targets: [
      {className: 'xds-circular-progress', visualProps: ['variant', 'size']},
      {className: 'xds-circular-progress-track'},
      {className: 'xds-circular-progress-fill', visualProps: ['variant']},
    ],
  },
  usage: {
    description:
      'A circular progress indicator that shows completion as a ring or arc. Use it for upload progress, score displays, dashboard gauges, or compact progress where horizontal space is limited. Complements ProgressBar for radial layouts.',
    bestPractices: [
      { guidance: true, description: 'Pass a value for determinate progress; omit value for an indeterminate spinner.' },
      { guidance: true, description: 'Provide center content (children) to give context: a percentage, icon, or short label.' },
      { guidance: true, description: 'Always provide a label, even though it is visually hidden by default; screen readers need it.' },
      { guidance: false, description: 'Use circular progress for long text labels; use ProgressBar instead, which has more room for label and value display.' },
      { guidance: false, description: 'Stack multiple circular progress indicators for the same operation; use one with a value label.' },
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'CircularProgress',
  displayName: 'Circular Progress',
  props: [
    {
      name: 'value',
      type: 'number',
      description: '当前值。省略时渲染不确定旋转动画。',
    },
    {
      name: 'max',
      type: 'number',
      description: '最大值。',
      default: '100',
    },
    {
      name: 'label',
      type: 'string',
      description: '屏幕阅读器的无障碍标签（必填）。',
      required: true,
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description: '视觉上隐藏标签（仍保持无障碍可访问性）。默认为 true，因为圆形进度条通常显示中心内容。',
      default: 'true',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: '在环形中心显示的内容：百分比、图标或自定义内容。',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: '进度环的直径（32px、48px、64px）。',
      default: "'md'",
    },
    {
      name: 'variant',
      type: "'accent' | 'success' | 'warning' | 'error' | 'neutral'",
      description: '进度填充的语义颜色变体。',
      default: "'accent'",
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: '用于布局自定义的 StyleX 样式。必须是 stylex.create() 的值。',
    },
  ],
  theming: {
    targets: [
      {className: 'xds-circular-progress', visualProps: ['variant', 'size']},
      {className: 'xds-circular-progress-track'},
      {className: 'xds-circular-progress-fill', visualProps: ['variant']},
    ],
  },
  usage: {
    description:
      'A circular progress indicator that shows completion as a ring or arc. Use it for upload progress, score displays, dashboard gauges, or compact progress where horizontal space is limited. Complements ProgressBar for radial layouts.',
    bestPractices: [
      { guidance: true, description: 'Pass a value for determinate progress; omit value for an indeterminate spinner.' },
      { guidance: true, description: 'Provide center content (children) to give context: a percentage, icon, or short label.' },
      { guidance: true, description: 'Always provide a label, even though it is visually hidden by default; screen readers need it.' },
      { guidance: false, description: 'Use circular progress for long text labels; use ProgressBar instead, which has more room for label and value display.' },
      { guidance: false, description: 'Stack multiple circular progress indicators for the same operation; use one with a value label.' },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Circular/radial progress indicator showing completion as a ring arc.',
  usage: {
    description:
      'A circular progress indicator that shows completion as a ring or arc. Use it for upload progress, score displays, dashboard gauges, or compact progress where horizontal space is limited. Complements ProgressBar for radial layouts.',
    bestPractices: [
      { guidance: true, description: 'Pass a value for determinate progress; omit value for an indeterminate spinner.' },
      { guidance: true, description: 'Provide center content (children) to give context: a percentage, icon, or short label.' },
      { guidance: true, description: 'Always provide a label, even though it is visually hidden by default; screen readers need it.' },
      { guidance: false, description: 'Use circular progress for long text labels; use ProgressBar instead, which has more room for label and value display.' },
      { guidance: false, description: 'Stack multiple circular progress indicators for the same operation; use one with a value label.' },
    ],
  },
  propDescriptions: {
    value: 'Current value. Omit for indeterminate spinning animation.',
    max: 'Maximum value.',
    label: 'Accessible label for screen readers (required).',
    isLabelHidden: 'Visually hide label (remains accessible). Defaults to true.',
    children: 'Center content: percentage, icon, or custom.',
    size: 'Ring diameter (32px, 48px, 64px).',
    variant: 'Semantic color variant for the fill.',
    xstyle: 'StyleX styles for layout customization. Must be stylex.create() value.',
  },
};
