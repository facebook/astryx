/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Badge',
  description:
    'A badge component for displaying status indicators, counts, or labels.',
  props: [
    {
      name: 'variant',
      type: "'neutral' | 'info' | 'success' | 'warning' | 'error'",
      description: 'Visual style variant.',
      default: "'neutral'",
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Badge content. Omit for dot indicator.',
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
      code: '<XDSBadge>Default</XDSBadge>',
    },
    {
      label: 'Status variants',
      code: `<XDSBadge variant="success">Active</XDSBadge>
<XDSBadge variant="error">Failed</XDSBadge>
<XDSBadge variant="warning">Pending</XDSBadge>`,
    },
    {
      label: 'Count badge',
      code: '<XDSBadge variant="info">42</XDSBadge>',
    },
    {
      label: 'Dot indicator (no children)',
      code: '<XDSBadge variant="success" />',
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
      type: "'neutral' | 'info' | 'success' | 'warning' | 'error'",
      description: '视觉样式变体。',
      default: "'neutral'",
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: '徽章内容。省略则显示圆点指示器。',
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
      code: '<XDSBadge>Default</XDSBadge>',
    },
    {
      label: '状态变体',
      code: `<XDSBadge variant="success">Active</XDSBadge>
<XDSBadge variant="error">Failed</XDSBadge>
<XDSBadge variant="warning">Pending</XDSBadge>`,
    },
    {
      label: '计数徽章',
      code: '<XDSBadge variant="info">42</XDSBadge>',
    },
    {
      label: '圆点指示器（无子元素）',
      code: '<XDSBadge variant="success" />',
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
    children: 'badge content; omit for dot indicator',
    icon: 'optional leading icon',
  },
};
