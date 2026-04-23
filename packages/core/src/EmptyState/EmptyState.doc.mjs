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
    description: 'EmptyState shows a placeholder when a content area has no data. Use it for empty lists, zero search results, first-time setups, or cleared inboxes. Always include a title and a next step so the user is not stuck.',
    bestPractices: [
      { guidance: true, description: 'Include a clear title and a call-to-action button so users know how to proceed.' },
      { guidance: true, description: 'Use an illustration or icon that reinforces the context of the empty state.' },
      { guidance: true, description: 'Use the compact variant inside cards or sidebars where space is limited.' },
      { guidance: false, description: 'Leave an empty state without guidance — always explain what happened and what the user can do next.' },
      { guidance: false, description: 'Use a generic message like "No data" — be specific about what is empty and why.' },
      { guidance: false, description: 'Use an EmptyState for error messages that require immediate action — use a Banner instead.' },
    ],
    anatomy: [
      {name: 'Icon', required: false, description: 'A visual cue above the title that reinforces the context, like a search icon for no results.'},
      {name: 'Title', required: true, description: 'Primary message explaining what is empty — "No projects yet" not "No data".'},
      {name: 'Description', required: false, description: 'Additional context explaining why it is empty or what the user can do.'},
      {name: 'Actions', required: false, description: 'One or two buttons guiding the user to a next step, like "Create project" or "Clear filters".'},
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
    description: 'EmptyState shows a placeholder when a content area has no data. Use it for empty lists, zero search results, first-time setups, or cleared inboxes. Always include a title and a next step so the user is not stuck.',
    bestPractices: [
      { guidance: true, description: 'Include a clear title and a call-to-action button so users know how to proceed.' },
      { guidance: true, description: 'Use an illustration or icon that reinforces the context of the empty state.' },
      { guidance: true, description: 'Use the compact variant inside cards or sidebars where space is limited.' },
      { guidance: false, description: 'Leave an empty state without guidance — always explain what happened and what the user can do next.' },
      { guidance: false, description: 'Use a generic message like "No data" — be specific about what is empty and why.' },
      { guidance: false, description: 'Use an EmptyState for error messages that require immediate action — use a Banner instead.' },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'placeholder when a content area has no data — icon, title, description, action buttons',
  usage: {
    description: 'EmptyState shows a placeholder for empty lists, zero search results, first-time setups. Always include a title and next step.',
    bestPractices: [
      { guidance: true, description: 'Clear title + CTA button. Icon for context. Compact variant in tight spaces.' },
      { guidance: false, description: 'No generic "No data" — be specific. Not for errors — use Banner.' },
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
