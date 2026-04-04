/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Badge',
  description:
    'A badge component for displaying status indicators, counts, or labels.',
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
  examples: [
    {
      label: 'Text badge',
      code: '<XDSBadge label="Default" />',
    },
    {
      label: 'Status variants',
      code: `<XDSBadge variant="success" label="Active" />
<XDSBadge variant="error" label="Failed" />
<XDSBadge variant="warning" label="Pending" />`,
    },
    {
      label: 'Count badge',
      code: '<XDSBadge variant="info" label={42} />',
    },
    {
      label: 'Non-semantic color variants',
      code: `<XDSBadge variant="blue" label="Design" />
<XDSBadge variant="purple" label="Engineering" />
<XDSBadge variant="teal" label="Research" />
<XDSBadge variant="orange" label="Urgent" />`,
    },
  ],
  theming: {
    targets: [
      {className: 'xds-badge', visualProps: ['variant']},
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
  examples: [
    {
      label: '文本徽章',
      code: '<XDSBadge label="Default" />',
    },
    {
      label: '状态变体',
      code: `<XDSBadge variant="success" label="Active" />
<XDSBadge variant="error" label="Failed" />
<XDSBadge variant="warning" label="Pending" />`,
    },
    {
      label: '计数徽章',
      code: '<XDSBadge variant="info" label={42} />',
    },
    {
      label: '非语义颜色变体',
      code: `<XDSBadge variant="blue" label="Design" />
<XDSBadge variant="purple" label="Engineering" />
<XDSBadge variant="teal" label="Research" />
<XDSBadge variant="orange" label="Urgent" />`,
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
