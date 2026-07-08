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
    'reviews',
    'feedback',
    'rank',
    'grade',
    'vote',
    'heart',
  ],
  props: [
    {
      name: 'label',
      type: 'string',
      description: 'Accessible label. Shown per labelPlacement unless hidden.',
      required: true,
    },
    {
      name: 'mode',
      type: "'interactive' | 'display'",
      description:
        'interactive: users can select (slider role). display: read-only (img role).',
      default: "'interactive'",
    },
    {
      name: 'value',
      type: 'number',
      description: 'Controlled value. Fractional values render partial icons.',
    },
    {
      name: 'defaultValue',
      type: 'number',
      description: 'Uncontrolled initial value.',
      default: '0',
    },
    {name: 'max', type: 'number', description: 'Number of icons.', default: '5'},
    {
      name: 'precision',
      type: 'number',
      description: 'Smallest increment: 1, 0.5, 0.25, 0.1, …',
      default: '1',
    },
    {
      name: 'onChange',
      type: '(value: number) => void',
      description: 'Called when the value changes.',
    },
    {
      name: 'onHoverChange',
      type: '(value: number | null) => void',
      description: 'Called as the hover preview changes; null on leave.',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Disabled: grays out and blocks interaction.',
      default: 'false',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description: 'Renders a skeleton placeholder.',
      default: 'false',
    },
    {
      name: 'isClearable',
      type: 'boolean',
      description: 'Selecting the current value again clears to 0.',
      default: 'true',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: 'Icon size.',
      default: "'md'",
    },
    {
      name: 'density',
      type: "'compact' | 'comfortable' | 'spacious'",
      description: 'Spacing between icons.',
      default: "'comfortable'",
    },
    {
      name: 'color',
      type: "'gold' | 'brand' | 'warning' | 'positive' | 'neutral' | (string & {})",
      description: 'Semantic preset or any CSS color string.',
      default: "'gold'",
    },
    {
      name: 'icons',
      type: '{ filled: Component; empty?: Component; partial?: Component }',
      description:
        'Icon set from the project icon system — a solid filled variant and an outline empty variant. Defaults to a star.',
    },
    {
      name: 'animation',
      type: "'none' | 'fill' | 'scale' | 'bounce'",
      description: 'Micro-interaction on hover/press (motion-safe).',
      default: "'none'",
    },
    {
      name: 'labelPlacement',
      type: "'top' | 'bottom' | 'left' | 'right' | 'hidden'",
      description: 'Where the label sits relative to the icons.',
      default: "'top'",
    },
    {
      name: 'hasValueText',
      type: 'boolean',
      description: 'Show the numeric value next to the icons.',
      default: 'false',
    },
    {
      name: 'formatValue',
      type: '(value: number, max: number) => string',
      description: 'Format the numeric value / aria-valuetext.',
    },
    {
      name: 'reviewCount',
      type: 'number',
      description: 'Show a review count, e.g. "(2,341 reviews)".',
    },
    {
      name: 'formatReviewCount',
      type: '(count: number) => string',
      description: 'Format the review count text.',
    },
    {
      name: 'descriptiveLabels',
      type: 'string[] | ((value: number) => string)',
      description: 'Descriptive labels per value (e.g. Poor…Excellent).',
    },
    {
      name: 'hasHoverPreview',
      type: 'boolean',
      description: 'Show hover preview before clicking (interactive).',
      default: 'true',
    },
    {
      name: 'tooltip',
      type: "'none' | 'value' | 'label'",
      description: 'Tooltip content on hover/focus.',
      default: "'none'",
    },
    {
      name: 'htmlName',
      type: 'string',
      description: 'Name for the hidden form input.',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization. Must be a stylex.create() value, not an inline style object like style={{}}.',
    },
  ],
  theming: {
    targets: [
      {
        className: 'astryx-rating',
        visualProps: ['size', 'density'],
        states: ['mode', 'disabled', 'loading'],
      },
    ],
  },
  usage: {
    description:
      'An enterprise-grade rating control — a single source of truth for scores across products. Two modes (interactive/display), configurable max and precision, stars or any icon from the project icon system, semantic and custom colors, flexible label placement, review counts, descriptive labels, tooltips, density and animation options, RTL, loading skeletons, and full keyboard + screen-reader accessibility.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Always provide a label, even when hidden; screen readers need it to announce what is being rated.',
      },
      {
        guidance: true,
        description:
          'Use mode="display" with precision and hasValueText/reviewCount to present aggregate scores (e.g. "4.6 (2,341 reviews)").',
      },
      {
        guidance: true,
        description:
          'Add descriptiveLabels (Poor…Excellent) so the score has meaning beyond the icon count.',
      },
      {
        guidance: true,
        description:
          'Drive size, spacing, and color from tokens/props rather than forking the component per product.',
      },
      {
        guidance: false,
        description:
          'Rely on color alone to convey the score; icon count and value text carry the meaning.',
      },
      {
        guidance: false,
        description:
          'Use a rating for binary yes/no feedback; use a Switch or thumbs control instead.',
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
      description: '无障碍标签（必填）。除非隐藏，否则按 labelPlacement 显示。',
      required: true,
    },
    {
      name: 'mode',
      type: "'interactive' | 'display'",
      description: 'interactive：可选择（slider）。display：只读（img）。',
      default: "'interactive'",
    },
    {
      name: 'value',
      type: 'number',
      description: '受控值。小数值渲染部分图标。',
    },
    {
      name: 'max',
      type: 'number',
      description: '图标数量。',
      default: '5',
    },
    {
      name: 'precision',
      type: 'number',
      description: '最小增量：1、0.5、0.25、0.1…',
      default: '1',
    },
    {
      name: 'color',
      type: "'gold' | 'brand' | 'warning' | 'positive' | 'neutral' | (string & {})",
      description: '语义预设或任意 CSS 颜色。',
      default: "'gold'",
    },
    {
      name: 'icons',
      type: '{ filled?; empty?; partial? }',
      description: '自定义图标集（心形、火焰、奖杯…）。',
    },
    {
      name: 'labelPlacement',
      type: "'top' | 'bottom' | 'left' | 'right' | 'hidden'",
      description: '标签相对图标的位置。',
      default: "'top'",
    },
    {
      name: 'reviewCount',
      type: 'number',
      description: '显示评价数量，如“(2,341 reviews)”。',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description: '渲染骨架占位。',
      default: 'false',
    },
  ],
  theming: {
    targets: [
      {
        className: 'astryx-rating',
        visualProps: ['size', 'density'],
        states: ['mode', 'disabled', 'loading'],
      },
    ],
  },
  usage: {
    description:
      'An enterprise-grade rating control — a single source of truth for scores across products.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Always provide a label, even when hidden; screen readers need it.',
      },
      {
        guidance: true,
        description:
          'Use mode="display" with hasValueText/reviewCount for aggregate scores.',
      },
      {
        guidance: false,
        description: 'Rely on color alone to convey the score.',
      },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Enterprise rating control: interactive/display modes, configurable max & precision, stars or any project icon, semantic/custom colors, labels, review counts, tooltips, density, animation, RTL, loading, full a11y.',
  usage: {
    description:
      'An enterprise-grade rating control — a single source of truth for scores across products.',
    bestPractices: [
      {
        guidance: true,
        description: 'Always provide a label, even when hidden.',
      },
      {
        guidance: true,
        description:
          'Use mode="display" with precision + hasValueText/reviewCount for aggregate scores.',
      },
      {
        guidance: false,
        description: 'Rely on color alone to convey the score.',
      },
    ],
  },
  propDescriptions: {
    label: 'Accessible label (required).',
    mode: 'interactive (slider) or display (read-only img).',
    value: 'Controlled value; fractions render partial icons.',
    defaultValue: 'Uncontrolled initial value.',
    max: 'Number of icons.',
    precision: 'Smallest increment (1, 0.5, 0.25, 0.1).',
    onChange: 'Called when the value changes.',
    onHoverChange: 'Called as hover preview changes.',
    isDisabled: 'Disabled: grays out, blocks interaction.',
    isLoading: 'Skeleton placeholder.',
    isClearable: 'Reselecting current value clears to 0.',
    size: 'Icon size.',
    density: 'Spacing between icons.',
    color: 'Semantic preset or any CSS color.',
    icons: 'Icon set from the project icon system { filled, empty, partial }.',
    animation: 'Hover/press micro-interaction.',
    labelPlacement: 'top | bottom | left | right | hidden.',
    hasValueText: 'Show numeric value.',
    formatValue: 'Format value / aria-valuetext.',
    reviewCount: 'Show a review count.',
    formatReviewCount: 'Format the review count text.',
    descriptiveLabels: 'Labels per value (Poor…Excellent).',
    hasHoverPreview: 'Hover preview before clicking.',
    tooltip: 'Tooltip content: none | value | label.',
    htmlName: 'Name for the hidden form input.',
    xstyle: 'StyleX styles for layout. Must be stylex.create() value.',
  },
};
