/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'EmptyState',
  keywords: ["emptystate","empty","placeholder","nodata","blank","noresults","illustration","blankslate"],
  props: [
    {
      name: 'title',
      type: 'string',
      description:
        'Primary message rendered as an <h3> heading inside the empty state.',
      required: true,
    },
    {
      name: 'description',
      type: 'string',
      description:
        'Optional secondary text providing additional context below the title.',
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description:
        'Optional icon or illustration displayed above the title; rendered as decorative (aria-hidden="true").',
    },
    {
      name: 'actions',
      type: 'ReactNode',
      description:
        'Optional action buttons displayed below the description, laid out horizontally by default and stacked vertically when isCompact is true.',
    },
    {
      name: 'headingLevel',
      type: '1 | 2 | 3 | 4 | 5 | 6',
      description:
        'Controls the rendered HTML heading tag (h1-h6) to fit the document outline.',
      default: '3',
    },
    {
      name: 'isCompact',
      type: 'boolean',
      description:
        'Enables the compact variant with reduced spacing for constrained content areas.',
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
      {className: 'xds-emptystate'},
    ],
  },
  usage: {
    description: 'An empty state placeholder that provides guidance when there is no data to display. Use for null states, failed loading states, or when search and filter results return nothing. Always include a clear message and a call to action so users know how to proceed.',
    bestPractices: [
      { guidance: true, description: 'Include a clear title and a call-to-action button so users know how to proceed.' },
      { guidance: true, description: 'Use an illustration or icon that reinforces the context of the empty state.' },
      { guidance: false, description: 'Leave an empty state without guidance — always explain what happened and what the user can do next.' },
      { guidance: false, description: 'Use an EmptyState for error messages that require immediate action — use an alert instead.' },
    ],
    anatomy: [
      {name: 'Illustration', required: false, description: 'Visual cue that reinforces the empty state context.'},
      {name: 'Title', required: true, description: 'Primary message explaining the empty state.'},
      {name: 'Subtitle', required: false, description: 'Additional context or explanation.'},
      {name: 'Call to action', required: false, description: 'Buttons guiding the user to a next step.'},
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'EmptyState',
  props: [
    {
      name: 'title',
      type: 'string',
      description:
        '在空状态内部渲染为 <h3> 标题的主要信息。',
      required: true,
    },
    {
      name: 'description',
      type: 'string',
      description:
        '可选的辅助文本，在标题下方提供额外上下文。',
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description:
        '可选的图标或插图，显示在标题上方；渲染为装饰性元素（aria-hidden="true"）。',
    },
    {
      name: 'actions',
      type: 'ReactNode',
      description:
        '可选的操作按钮，显示在描述下方，默认水平排列，isCompact 为 true 时垂直堆叠。',
    },
    {
      name: 'headingLevel',
      type: '1 | 2 | 3 | 4 | 5 | 6',
      description:
        '控制渲染的 HTML 标题标签（h1-h6），以适配文档大纲。',
      default: '3',
    },
    {
      name: 'isCompact',
      type: 'boolean',
      description:
        '启用紧凑变体，减少间距，适用于空间受限的内容区域。',
      default: 'false',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义（外边距、定位、尺寸）的 StyleX 样式。必须是 stylex.create() 的值，而非内联样式对象如 style={{}}。',
    },
  ],
  theming: {
    targets: [
      {className: 'xds-emptystate'},
    ],
  },
  usage: {
    description: 'An empty state placeholder that provides guidance when there is no data to display. Use for null states, failed loading states, or when search and filter results return nothing. Always include a clear message and a call to action so users know how to proceed.',
    bestPractices: [
      { guidance: true, description: 'Include a clear title and a call-to-action button so users know how to proceed.' },
      { guidance: true, description: 'Use an illustration or icon that reinforces the context of the empty state.' },
      { guidance: false, description: 'Leave an empty state without guidance — always explain what happened and what the user can do next.' },
      { guidance: false, description: 'Use an EmptyState for error messages that require immediate action — use an alert instead.' },
    ],
    anatomy: [
      {name: 'Illustration', required: false, description: 'Visual cue that reinforces the empty state context.'},
      {name: 'Title', required: true, description: 'Primary message explaining the empty state.'},
      {name: 'Subtitle', required: false, description: 'Additional context or explanation.'},
      {name: 'Call to action', required: false, description: 'Buttons guiding the user to a next step.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Empty state placeholder for content areas w/ no data. Displays icon/illustration, title, optional description + action buttons.',
  usage: {
    description: 'An empty state placeholder that provides guidance when there is no data to display. Use for null states, failed loading states, or when search and filter results return nothing. Always include a clear message and a call to action so users know how to proceed.',
    bestPractices: [
      { guidance: true, description: 'Include a clear title and a call-to-action button so users know how to proceed.' },
      { guidance: true, description: 'Use an illustration or icon that reinforces the context of the empty state.' },
      { guidance: false, description: 'Leave an empty state without guidance — always explain what happened and what the user can do next.' },
      { guidance: false, description: 'Use an EmptyState for error messages that require immediate action — use an alert instead.' },
    ],
    anatomy: [
      {name: 'Illustration', required: false, description: 'Visual cue that reinforces the empty state context.'},
      {name: 'Title', required: true, description: 'Primary message explaining the empty state.'},
      {name: 'Subtitle', required: false, description: 'Additional context or explanation.'},
      {name: 'Call to action', required: false, description: 'Buttons guiding the user to a next step.'},
    ],
  },
  propDescriptions: {
    title: 'Primary msg rendered as heading (h1-h6) inside empty state.',
    headingLevel: 'Controls HTML heading tag (h1-h6) for document outline.',
    description: 'Optional secondary text w/ additional context below title.',
    icon: 'Optional icon/illustration above title; rendered decorative (aria-hidden="true").',
    actions: 'Optional action buttons below description; horizontal by default, vertical when isCompact.',
    isCompact: 'Enables compact variant w/ reduced spacing for constrained areas.',
    xstyle: 'StyleX styles for layout customization. Must be stylex.create() value.',
  },
};
