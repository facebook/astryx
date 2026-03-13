/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'StatusDot',
  description:
    'A small colored dot indicator for status display (online/offline, severity, etc).',
  features: [
    'Five semantic color variants: positive, warning, negative, info, neutral',
    'Two sizes: sm (8px) and md (10px)',
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
      name: 'size',
      type: "'sm' | 'md'",
      description: 'Dot size: sm=8px, md=10px.',
      default: "'md'",
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
  ],
  examples: [
    {
      label: 'Basic status indicators',
      code: `<XDSStatusDot variant="positive" label="Online" />
<XDSStatusDot variant="negative" label="Offline" />
<XDSStatusDot variant="warning" label="Away" />`,
    },
    {
      label: 'Small size',
      code: `<XDSStatusDot variant="positive" label="Active" size="sm" />`,
    },
    {
      label: 'Pulsing animation',
      code: `<XDSStatusDot variant="positive" label="Live" isPulsing />`,
    },
  ],
  theming: {
    targets: [
      {className: 'xds-statusdot', visualProps: ['size', 'variant']},
    ],
  },
  accessibility: [
    'Renders as <span role="img" aria-label={label}> for screen reader support.',
    'Not focusable — intended as a decorative indicator only.',
    'isPulsing animation respects prefers-reduced-motion: reduce.',
  ],
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
      name: 'size',
      type: "'sm' | 'md'",
      description: '圆点尺寸：sm=8px，md=10px。',
      default: "'md'",
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
  examples: [
    {
      label: '基础状态指示器',
      code: `<XDSStatusDot variant="positive" label="Online" />
<XDSStatusDot variant="negative" label="Offline" />
<XDSStatusDot variant="warning" label="Away" />`,
    },
    {
      label: '小尺寸',
      code: `<XDSStatusDot variant="positive" label="Active" size="sm" />`,
    },
    {
      label: '脉冲动画',
      code: `<XDSStatusDot variant="positive" label="Live" isPulsing />`,
    },
  ],
  theming: {
    targets: [
      {className: 'xds-statusdot', visualProps: ['size', 'variant']},
    ],
  },
  accessibility: [
    '渲染为 <span role="img" aria-label={label}> 以支持屏幕阅读器。',
    '不可聚焦 — 仅作为装饰性指示器使用。',
    'isPulsing 动画尊重 prefers-reduced-motion: reduce 设置。',
  ],
};

/** @type {string} */
export const docsDense = `import{XDSStatusDot}from'@xds/core/StatusDot' //colored dot status indicator
P variant:'positive' | 'warning' | 'negative' | 'info' | 'neutral'! semantic color | label:string! a11y label via aria-label | size:'sm' | 'md'='md' sm=8px, md=10px | isPulsing:boolean='false' pulse animation, respects prefers-reduced-motion | xstyle:StyleXStyles layout styles, must be stylex.create() value
X <XDSStatusDot variant="positive" label="Online" />\\n<XDSStatusDot variant="negative" label="Offline" />\\n<XDSStatusDot variant="warning" label="Away" /> | <XDSStatusDot variant="positive" label="Active" size="sm" /> | <XDSStatusDot variant="positive" label="Live" isPulsing />
A renders <span role="img" aria-label={label}> for screen readers|not focusable, decorative indicator only|isPulsing animation respects prefers-reduced-motion: reduce`;
