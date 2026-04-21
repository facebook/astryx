/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'StatusDot',
  keywords: ["statusdot","dot","indicator","status","signal","presence","availability","online","pip"],
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
  ],
  theming: {
    targets: [
      {className: 'xds-statusdot', visualProps: ['variant']},
    ],
  },
  usage: {
    description:
      'A small colored dot that communicates status like online/offline presence or severity levels. Supports five semantic variants and an optional pulse animation. Always pair with a visible text label, as color alone should not carry meaning.',
    bestPractices: [
      { guidance: true, description: 'Always pair with a visible text label so status is not conveyed by color alone.' },
      { guidance: true, description: 'Provide a descriptive `label` prop for screen reader accessibility.' },
      { guidance: false, description: 'Use the pulse animation for purely decorative purposes — reserve it for states that require immediate attention.' },
      { guidance: false, description: 'Rely on color alone to communicate status — always include text.' },
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'StatusDot',
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
  usage: {
    description:
      'A small colored dot that communicates status like online/offline presence or severity levels. Supports five semantic variants and an optional pulse animation. Always pair with a visible text label, as color alone should not carry meaning.',
    bestPractices: [
      { guidance: true, description: 'Always pair with a visible text label so status is not conveyed by color alone.' },
      { guidance: true, description: 'Provide a descriptive `label` prop for screen reader accessibility.' },
      { guidance: false, description: 'Use the pulse animation for purely decorative purposes — reserve it for states that require immediate attention.' },
      { guidance: false, description: 'Rely on color alone to communicate status — always include text.' },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'Small colored dot indicator for status display (online/offline, severity, etc).',
  usage: {
    description:
      'A small colored dot that communicates status like online/offline presence or severity levels. Supports five semantic variants and an optional pulse animation. Always pair with a visible text label, as color alone should not carry meaning.',
    bestPractices: [
      { guidance: true, description: 'Always pair with a visible text label so status is not conveyed by color alone.' },
      { guidance: true, description: 'Provide a descriptive `label` prop for screen reader accessibility.' },
      { guidance: false, description: 'Use the pulse animation for purely decorative purposes — reserve it for states that require immediate attention.' },
      { guidance: false, description: 'Rely on color alone to communicate status — always include text.' },
    ],
  },
  propDescriptions: {
    variant: 'Semantic color variant.',
    label: 'Accessible label via aria-label.',
    isPulsing: 'Pulse animation; respects prefers-reduced-motion: reduce.',
    xstyle: 'StyleX layout styles; must be stylex.create() value.',
  },
};