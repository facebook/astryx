/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'StatusDot',
  description:
    'A small colored dot indicator for status display (online/offline, severity, etc).',
  showcase: {
    aspectRatio: 1,
    code: '<XDSStatusDot variant="positive" label="Online" />',
  },
  keywords: ["statusdot","dot","indicator","status","signal","presence","availability","online","pip"],
  features: [
    'Five semantic color variants: positive, warning, negative, info, neutral',
    'Single size: 8px',
    'Optional pulse animation that respects prefers-reduced-motion',
    'Accessible — renders as <span role="img" aria-label={label}> for screen reader support',
    'Not focusable (decorative indicator)',
  ],
  props: [
    {
      name: 'variant',
      type: "'positive' | 'warning' | 'negative' | 'info' | 'neutral'",
      description: 'Semantic color variant.',
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description: 'Accessible label surfaced via aria-label.',
      required: true,
    },
    {
      name: 'isPulsing',
      type: 'boolean',
      description:
        'Enables a pulse animation; respects prefers-reduced-motion: reduce.',
      default: 'false',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value — not an inline style object like style={{}}.',
    },
  ],  theming: {
    targets: [
      {className: 'xds-statusdot', visualProps: ['variant']},
    ],
  },
  accessibility: [
    'Renders as <span role="img" aria-label={label}> for screen reader support.',
    'Not focusable — intended as a decorative indicator only.',
    'isPulsing animation respects prefers-reduced-motion: reduce.',
  ],
  usage: {
    summary: 'A small dot indicating status through semantic colors, often paired with a text label.',
    content: `## When to use

- Indicating status with semantic colors (e.g. active, inactive, warning, error).
- Pairing with text labels to provide visual status cues.

## Best practices

- Do: Pair with a text label to ensure the status is accessible and clear.
- Don't: Rely on color alone \u2014 always provide a text label for context.`,
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'StatusDot',
  description:
    '用于状态展示的小型彩色圆点指示器（在线/离线、严重程度等）。',
  features: [
    '五种语义颜色变体：positive（正面）、warning（警告）、negative（负面）、info（信息）、neutral（中性）',
    '两种尺寸：sm（8px）和 md（10px）',
    '可选的脉冲动画，尊重 prefers-reduced-motion 设置',
    '无障碍支持 — 渲染为 <span role="img" aria-label={label}> 以支持屏幕阅读器',
    '不可聚焦（装饰性指示器）',
  ],
  props: [
    {
      name: 'variant',
      type: "'positive' | 'warning' | 'negative' | 'info' | 'neutral'",
      description: '语义颜色变体。',
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description: '通过 aria-label 暴露的无障碍标签。',
      required: true,
    },
    {
      name: 'isPulsing',
      type: 'boolean',
      description:
        '启用脉冲动画；尊重 prefers-reduced-motion: reduce 设置。',
      default: 'false',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式（外边距、定位、尺寸）。必须是 stylex.create() 的值，而非内联样式对象如 style={{}}。',
    },
  ],
  theming: {
    targets: [
      {className: 'xds-statusdot', visualProps: ['variant']},
    ],
  },
  accessibility: [
    '渲染为 <span role="img" aria-label={label}> 以支持屏幕阅读器。',
    '不可聚焦 — 仅作为装饰性指示器使用。',
    'isPulsing 动画尊重 prefers-reduced-motion: reduce 设置。',
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'Small colored dot indicator for status display (online/offline, severity, etc).',
  features: [
    'Five semantic color variants: positive, warning, negative, info, neutral',
    'Single size: 8px',
    'Optional pulse animation respecting prefers-reduced-motion',
    'Accessible: <span role="img" aria-label={label}> for screen readers',
    'Not focusable (decorative indicator)',
  ],
  accessibility: [
    'Renders <span role="img" aria-label={label}> for screen readers.',
    'Not focusable; decorative indicator only.',
    'isPulsing animation respects prefers-reduced-motion: reduce.',
  ],
  propDescriptions: {
    variant: 'Semantic color variant.',
    label: 'Accessible label via aria-label.',
    isPulsing: 'Pulse animation; respects prefers-reduced-motion: reduce.',
    xstyle: 'StyleX layout styles; must be stylex.create() value.',
  },
};