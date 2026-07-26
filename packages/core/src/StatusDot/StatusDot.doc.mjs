// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'StatusDot',
  displayName: 'Status Dot',
  category: 'Feedback & Status',
  keywords: ["statusdot","dot","indicator","status","signal","presence","availability","online","pip"],
  props: [
    {
      name: 'variant',
      type: "'success' | 'warning' | 'error' | 'accent' | 'neutral'",
      description:
        'Semantic variant pairing colour with a distinct built-in shape (WCAG 1.4.1): success = filled dot, neutral = ring, error = minus bar, warning = bang, accent = plus. Shared statuses match AvatarStatusDot.',
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description:
        'Accessible label surfaced via aria-label, so the status reaches screen readers without hover.',
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
      name: 'tooltip',
      type: 'string',
      description:
        'Tooltip text shown on hover to explain the status meaning.',
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
      {className: 'astryx-statusdot', visualProps: ['variant']},
      {className: 'astryx-statusdot-glyph', visualProps: ['shape']},
    ],
  },
  usage: {
    description:
      'A small dot that communicates status like online/offline presence or severity levels. Each of the five semantic variants pairs its colour with a distinct built-in shape (filled, ring, minus, bang, plus) so status is never conveyed by color alone. Supports an optional pulse animation. Still pair with a visible text label where space allows.',
    bestPractices: [
      { guidance: true, description: 'Use StatusDot as a binary present/absent signal; avoid encoding many distinct states in a single dot, since color and size alone cannot reliably distinguish them.' },
      { guidance: true, description: 'Always pair with a visible text label so status is not conveyed by color alone.' },
      { guidance: true, description: 'Provide a descriptive `label` prop for screen reader accessibility.' },
      { guidance: true, description: 'Pair the dot with an icon that carries the status as a distinct shape when it must stand on its own without adjacent text, so meaning survives without color.' },
      { guidance: true, description: 'If you can\'t add a label or an icon, make sure the status is conveyed elsewhere accessibly (e.g. adjacent text, a table column, or a live region).' },
      { guidance: false, description: 'Rely on color alone to communicate status; StatusDot is not fully accessible in isolation, so the builder must make the status distinguishable in context via a label, an icon, or an accessible alternative.' },
      { guidance: false, description: 'Use the pulse animation for purely decorative purposes; reserve it for states that require immediate attention.' },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docsZh = {
  name: 'StatusDot',
  displayName: 'Status Dot',
  props: [
    {
      name: 'variant',
      type: "'success' | 'warning' | 'error' | 'accent' | 'neutral'",
      description:
        '语义变体，颜色与独特内置形状配对（WCAG 1.4.1）：success = 实心点，neutral = 圆环，error = 横杠，warning = 竖杠，accent = 加号。共有状态与 AvatarStatusDot 一致。',
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
      {className: 'astryx-statusdot', visualProps: ['variant']},
      {className: 'astryx-statusdot-glyph', visualProps: ['shape']},
    ],
  },
  usage: {
    description:
      'A small dot that communicates status like online/offline presence or severity levels. Each of the five semantic variants pairs its colour with a distinct built-in shape (filled, ring, minus, bang, plus) so status is never conveyed by color alone. Supports an optional pulse animation. Still pair with a visible text label where space allows.',
    bestPractices: [
      { guidance: true, description: 'Use StatusDot as a binary present/absent signal; avoid encoding many distinct states in a single dot, since color and size alone cannot reliably distinguish them.' },
      { guidance: true, description: 'Always pair with a visible text label so status is not conveyed by color alone.' },
      { guidance: true, description: 'Provide a descriptive `label` prop for screen reader accessibility.' },
      { guidance: true, description: 'Pair the dot with an icon that carries the status as a distinct shape when it must stand on its own without adjacent text, so meaning survives without color.' },
      { guidance: true, description: 'If you can\'t add a label or an icon, make sure the status is conveyed elsewhere accessibly (e.g. adjacent text, a table column, or a live region).' },
      { guidance: false, description: 'Rely on color alone to communicate status; StatusDot is not fully accessible in isolation, so the builder must make the status distinguishable in context via a label, an icon, or an accessible alternative.' },
      { guidance: false, description: 'Use the pulse animation for purely decorative purposes; reserve it for states that require immediate attention.' },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description: 'Small dot indicator for status display (online/offline, severity, etc); variants pair colour with shape (filled/ring/minus/bang/plus) per WCAG 1.4.1.',
  usage: {
    description:
      'A small dot that communicates status like online/offline presence or severity levels. Each of the five semantic variants pairs its colour with a distinct built-in shape (filled, ring, minus, bang, plus) so status is never conveyed by color alone. Supports an optional pulse animation. Still pair with a visible text label where space allows.',
    bestPractices: [
      { guidance: true, description: 'Use StatusDot as a binary present/absent signal; avoid encoding many distinct states in a single dot, since color and size alone cannot reliably distinguish them.' },
      { guidance: true, description: 'Always pair with a visible text label so status is not conveyed by color alone.' },
      { guidance: true, description: 'Provide a descriptive `label` prop for screen reader accessibility.' },
      { guidance: true, description: 'Pair the dot with an icon that carries the status as a distinct shape when it must stand on its own without adjacent text, so meaning survives without color.' },
      { guidance: true, description: 'If you can\'t add a label or an icon, make sure the status is conveyed elsewhere accessibly (e.g. adjacent text, a table column, or a live region).' },
      { guidance: false, description: 'Rely on color alone to communicate status; StatusDot is not fully accessible in isolation, so the builder must make the status distinguishable in context via a label, an icon, or an accessible alternative.' },
      { guidance: false, description: 'Use the pulse animation for purely decorative purposes; reserve it for states that require immediate attention.' },
    ],
  },
  propDescriptions: {
    variant:
      'Colour + shape variant: success filled, neutral ring, error minus, warning bang, accent plus.',
    label: 'Accessible label via aria-label.',
    isPulsing: 'Pulse animation; respects prefers-reduced-motion: reduce.',
    tooltip: 'Tooltip text on hover to explain status meaning.',
    xstyle: 'StyleX layout styles; must be stylex.create() value.',
  },
};