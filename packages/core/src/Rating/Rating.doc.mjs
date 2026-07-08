// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */
export const docs = {
  name: 'Rating',
  displayName: 'Rating',
  category: 'Data Input',
  keywords: [
    'rating',
    'star',
    'stars',
    'score',
    'review',
    'feedback',
    'rank',
    'grade',
    'vote',
  ],
  props: [
    {
      name: 'label',
      type: 'string',
      description: 'Accessible label. Rendered as visible text unless hidden.',
      required: true,
    },
    {
      name: 'value',
      type: 'number',
      description:
        'Controlled value. Fractional values render partial icons (e.g. 3.5).',
    },
    {
      name: 'defaultValue',
      type: 'number',
      description: 'Uncontrolled initial value.',
      default: '0',
    },
    {
      name: 'max',
      type: 'number',
      description: 'Number of icons to render.',
      default: '5',
    },
    {
      name: 'hasHalfIcons',
      type: 'boolean',
      description: 'Allow selecting half-icon increments when interactive.',
      default: 'false',
    },
    {
      name: 'isReadOnly',
      type: 'boolean',
      description: 'Read-only display: renders the value without interaction.',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Disabled state: grays out and blocks interaction.',
      default: 'false',
    },
    {
      name: 'isClearable',
      type: 'boolean',
      description:
        'Allow clearing back to 0 by selecting the current value again.',
      default: 'true',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: 'Icon size.',
      default: "'md'",
    },
    {
      name: 'color',
      type: "'warning' | 'accent' | 'neutral'",
      description: 'Color of the filled icons.',
      default: "'warning'",
    },
    {
      name: 'icon',
      type: 'IconType',
      description:
        'Custom SVG icon component for filled (and empty) layers. Defaults to a star.',
    },
    {
      name: 'emptyIcon',
      type: 'IconType',
      description: 'Custom SVG icon component for the empty layer only.',
    },
    {
      name: 'hasValueLabel',
      type: 'boolean',
      description: 'Show a text label of the current value next to the icons.',
      default: 'false',
    },
    {
      name: 'formatValueLabel',
      type: '(value: number, max: number) => string',
      description:
        'Custom formatter for the value label and aria-valuetext. Defaults to "{value} of {max}".',
    },
    {
      name: 'onChange',
      type: '(value: number) => void',
      description: 'Called when the value changes.',
    },
    {
      name: 'htmlName',
      type: 'string',
      description:
        'HTML name for the underlying hidden input, for native form submission.',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value, not an inline style object like style={{}}.',
    },
  ],
  theming: {
    targets: [
      {
        className: 'astryx-rating',
        visualProps: ['size', 'color'],
        states: ['readonly', 'disabled'],
      },
    ],
  },
  usage: {
    description:
      'A star rating control for capturing or displaying a score. Supports controlled and uncontrolled use, half-icon precision, a read-only display mode, and custom icons. Interactive ratings expose the WAI-ARIA slider role with full keyboard support.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Always provide a label, even if hidden; screen readers need it to announce what is being rated.',
      },
      {
        guidance: true,
        description:
          'Use isReadOnly to display an aggregate score (like an average review), and hasHalfIcons so partial values read accurately.',
      },
      {
        guidance: true,
        description:
          'Keep max small (typically 5) so each step is meaningful and easy to target.',
      },
      {
        guidance: false,
        description:
          'Use a rating for binary yes/no feedback; use a Switch or a thumbs-up control instead.',
      },
      {
        guidance: false,
        description:
          'Rely on color alone to convey the score; the icon count and value text carry the meaning.',
      },
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Rating',
  displayName: '评分',
  props: [
    {
      name: 'label',
      type: 'string',
      description: '无障碍标签（必填）。除非隐藏，否则显示为可见文本。',
      required: true,
    },
    {
      name: 'value',
      type: 'number',
      description: '受控值。小数值会渲染部分图标（例如 3.5）。',
    },
    {
      name: 'defaultValue',
      type: 'number',
      description: '非受控的初始值。',
      default: '0',
    },
    {
      name: 'max',
      type: 'number',
      description: '要渲染的图标数量。',
      default: '5',
    },
    {
      name: 'hasHalfIcons',
      type: 'boolean',
      description: '交互时允许选择半个图标的增量。',
      default: 'false',
    },
    {
      name: 'isReadOnly',
      type: 'boolean',
      description: '只读展示：渲染值但不可交互。',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '禁用状态：置灰并阻止交互。',
      default: 'false',
    },
    {
      name: 'isClearable',
      type: 'boolean',
      description: '允许再次选择当前值以清零。',
      default: 'true',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: '图标尺寸。',
      default: "'md'",
    },
    {
      name: 'color',
      type: "'warning' | 'accent' | 'neutral'",
      description: '已填充图标的颜色。',
      default: "'warning'",
    },
    {
      name: 'hasValueLabel',
      type: 'boolean',
      description: '在图标旁显示当前值的文本标签。',
      default: 'false',
    },
    {
      name: 'onChange',
      type: '(value: number) => void',
      description: '值变化时调用。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式（边距、定位、尺寸）。必须是 stylex.create() 的值，而非内联样式对象如 style={{}}。',
    },
  ],
  theming: {
    targets: [
      {
        className: 'astryx-rating',
        visualProps: ['size', 'color'],
        states: ['readonly', 'disabled'],
      },
    ],
  },
  usage: {
    description:
      'A star rating control for capturing or displaying a score. Supports controlled and uncontrolled use, half-icon precision, a read-only display mode, and custom icons. Interactive ratings expose the WAI-ARIA slider role with full keyboard support.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Always provide a label, even if hidden; screen readers need it to announce what is being rated.',
      },
      {
        guidance: true,
        description:
          'Use isReadOnly to display an aggregate score (like an average review), and hasHalfIcons so partial values read accurately.',
      },
      {
        guidance: false,
        description:
          'Rely on color alone to convey the score; the icon count and value text carry the meaning.',
      },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Star rating control for capturing or displaying a score, with half-icon precision and a read-only mode.',
  usage: {
    description:
      'A star rating control for capturing or displaying a score. Supports controlled and uncontrolled use, half-icon precision, a read-only display mode, and custom icons. Interactive ratings expose the WAI-ARIA slider role with full keyboard support.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Always provide a label, even if hidden; screen readers need it to announce what is being rated.',
      },
      {
        guidance: true,
        description:
          'Use isReadOnly with hasHalfIcons to display an aggregate score accurately.',
      },
      {
        guidance: false,
        description:
          'Rely on color alone to convey the score; icon count and value text carry the meaning.',
      },
    ],
  },
  propDescriptions: {
    label: 'Accessible label (required).',
    value: 'Controlled value; fractional values render partial icons.',
    defaultValue: 'Uncontrolled initial value.',
    max: 'Number of icons.',
    hasHalfIcons: 'Allow half-icon increments when interactive.',
    isReadOnly: 'Read-only display without interaction.',
    isDisabled: 'Disabled: grays out and blocks interaction.',
    isClearable: 'Selecting the current value again clears to 0.',
    size: 'Icon size.',
    color: 'Color of the filled icons.',
    icon: 'Custom filled/empty SVG icon. Defaults to a star.',
    emptyIcon: 'Custom SVG icon for the empty layer only.',
    hasValueLabel: 'Show the current value as text next to the icons.',
    formatValueLabel: 'Custom value label / aria-valuetext formatter.',
    onChange: 'Called when the value changes.',
    htmlName: 'Name for the hidden form input.',
    xstyle: 'StyleX styles for layout customization. Must be stylex.create() value.',
  },
};
