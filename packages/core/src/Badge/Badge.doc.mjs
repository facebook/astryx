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
      name: 'label',
      type: 'ReactNode',
      description: 'Badge text content. When both label and children are omitted, renders as a dot indicator.',
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description: 'Optional leading icon.',
    },
    {
      name: 'shape',
      type: "'pill' | 'dot'",
      description: "Visual shape. 'pill' is the default rounded pill for text/icon content. 'dot' renders a small circular indicator with no visible content (label becomes visually hidden for screen readers).",
      default: "'pill'",
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
      label: 'Dot indicator',
      code: '<XDSBadge variant="error" shape="dot" label="Unread" />',
    },
  ],
  theming: {
    targets: [
      {className: 'xds-badge', visualProps: ['variant', 'shape']},
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
      name: 'label',
      type: 'ReactNode',
      description: '徽章文本内容。当 label 和 children 都省略时，渲染为圆点指示器。',
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description: '可选的前置图标。',
    },
    {
      name: 'shape',
      type: "'pill' | 'dot'",
      description: "视觉形状。'pill' 是文本/图标内容的默认圆角药丸形状。'dot' 渲染一个无可见内容的小圆形指示器（label 变为屏幕阅读器专用的隐藏文本）。",
      default: "'pill'",
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
      label: '圆点指示器',
      code: '<XDSBadge variant="error" shape="dot" label="Unread" />',
    },
  ],
  theming: {
    targets: [
      {className: 'xds-badge', visualProps: ['variant', 'shape']},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'badge for status indicators, counts, or labels',
  propDescriptions: {
    variant: 'visual style variant',
    label: 'badge text; omit with children for dot indicator',
    children: 'badge content; omit for dot indicator',
    icon: 'optional leading icon',
    shape: "visual shape: 'pill' (default rounded) or 'dot' (small circular, label visually hidden)",
  },
};
