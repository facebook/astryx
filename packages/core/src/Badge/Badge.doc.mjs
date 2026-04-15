/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Badge',
  keywords: ["badge","tag","chip","label","status","indicator","count","counter","pill","notification","marker"],
  props: [
    {
      name: 'variant',
      type: "'neutral' | 'info' | 'success' | 'warning' | 'error' | 'blue' | 'cyan' | 'green' | 'orange' | 'pink' | 'purple' | 'red' | 'teal' | 'yellow'",
      description:
        'Visual style variant. Semantic variants (neutral, info, success, warning, error) use solid backgrounds. Non-semantic color variants use tinted backgrounds with colored text for categorization and tagging.',
      default: "'neutral'",
    },
    {
      name: 'label',
      type: 'ReactNode',
      description: 'Badge text content.',
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description: 'Optional leading icon.',
    },
  ],
  theming: {
    targets: [
      {className: 'xds-badge', visualProps: ['variant']},
    ],
  },
  usage: {
    description:
      'Badges display system or categorical information such as status indicators, counts, or labels. Use semantic color variants (neutral, info, success, warning, error) for system status and non-semantic colors for categorization. Always pair icons with labels and keep labels concise.',
    anatomy: [
      {name: 'Icon', required: false, description: 'A visual indicator that helps users identify the type of badge.'},
      {name: 'Label', required: true, description: 'A text or numerical label that provides additional context.'},
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Badge',
  description:
    '用于显示状态指示器、计数或标签的徽章组件。',
  props: [
    {
      name: 'variant',
      type: "'neutral' | 'info' | 'success' | 'warning' | 'error' | 'blue' | 'cyan' | 'green' | 'orange' | 'pink' | 'purple' | 'red' | 'teal' | 'yellow'",
      description: '视觉样式变体。语义变体使用实色背景，非语义颜色变体使用浅色背景配彩色文字。',
      default: "'neutral'",
    },
    {
      name: 'label',
      type: 'ReactNode',
      description: '徽章文本内容。',
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description: '可选的前置图标。',
    },
  ],
  theming: {
    targets: [
      {className: 'xds-badge', visualProps: ['variant']},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'badge for status indicators, counts, or labels',
  propDescriptions: {
    variant: 'visual style variant',
    label: 'badge text content',
    icon: 'optional leading icon',
  },
};
