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
  playground: {
    defaults: {
      label: 'Badge',
      variant: 'neutral',
    },
  },
  theming: {
    targets: [
      {className: 'xds-badge', visualProps: ['variant']},
    ],
  },
  usage: {
    description:
      'Badge shows a short label like a status, count, or category. Use it in table rows, list items, navigation, and anywhere you need to call out a state or group at a glance.',
    bestPractices: [
      {guidance: true, description: 'Use success, warning, and error variants for system status like "Active", "Pending", or "Failed". Use color variants like blue, purple, or teal for categories and tags.'},
      {guidance: true, description: 'Keep labels to one or two words. If you need more detail, put it in surrounding text instead of the badge.'},
      {guidance: true, description: 'Add an icon when it helps identify the badge type quickly, but always include a text label alongside it.'},
      {guidance: false, description: 'Make badges clickable — they are read-only indicators. Use a button or link if the user needs to take action.'},
    ],
    anatomy: [
      {name: 'Icon', required: false, description: 'An optional leading icon that helps identify the badge type at a glance.'},
      {name: 'Label', required: true, description: 'The text or number shown inside the badge.'},
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Badge',
  usage: {
    description:
      'Badge shows a short label like a status, count, or category. Use it in table rows, list items, navigation, and anywhere you need to call out a state or group at a glance.',
    bestPractices: [
      {guidance: true, description: 'Use success, warning, and error variants for system status like "Active", "Pending", or "Failed". Use color variants like blue, purple, or teal for categories and tags.'},
      {guidance: true, description: 'Keep labels to one or two words. If you need more detail, put it in surrounding text instead of the badge.'},
      {guidance: true, description: 'Add an icon when it helps identify the badge type quickly, but always include a text label alongside it.'},
      {guidance: false, description: 'Make badges clickable — they are read-only indicators. Use a button or link if the user needs to take action.'},
    ],
    anatomy: [
      {name: 'Icon', required: false, description: 'An optional leading icon that helps identify the badge type at a glance.'},
      {name: 'Label', required: true, description: 'The text or number shown inside the badge.'},
    ],
  },
  props: [
    {
      name: 'variant',
      type:
        "'neutral' | 'info' | 'success' | 'warning' | 'error' | 'blue' | 'cyan' | 'green' | 'orange' | 'pink' | 'purple' | 'red' | 'teal' | 'yellow'",
      description: '视觉样式变体。语义变体使用实色背景，非语义颜色变体使用浅色背景配彩色文字。',
      default: "'neutral'",
    },
    {name: 'label', type: 'ReactNode', description: '徽章文本内容。'},
    {name: 'icon', type: 'ReactNode', description: '可选的前置图标。'},
  ],
  theming: {
    targets: [
      {
        className: 'xds-badge',
        visualProps: [
          'variant',
        ],
      },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'short label for status, counts, or categories',
  usage: {
    description:
      'Badge shows a short label like a status, count, or category. Use in table rows, list items, navigation, or anywhere you need to call out a state or group.',
    bestPractices: [
      {guidance: true, description: 'Use success/warning/error for system status. Use color variants for categories and tags.'},
      {guidance: true, description: 'Keep labels to one or two words. Add an icon only when it helps identify the badge type.'},
      {guidance: false, description: 'Make badges clickable — they are read-only. Use a button or link for actions.'},
    ],
    anatomy: [
      {name: 'Icon', required: false, description: 'Optional leading icon.'},
      {name: 'Label', required: true, description: 'Text or number shown inside the badge.'},
    ],
  },
  propDescriptions: {
    variant: 'visual style variant',
    label: 'badge text content',
    icon: 'optional leading icon',
  },
};
