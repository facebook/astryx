/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'EmptyState',
  description:
    'An empty state placeholder for content areas with no data. Displays an icon or illustration, title, optional description, and action buttons.',
  showcase: {
    aspectRatio: 4 / 3,
    code: '<XDSEmptyState title="No results" />',
  },
  keywords: ["emptystate","empty","placeholder","nodata","blank","noresults","illustration","blankslate"],
  features: [
    'Uses role="status" so screen readers announce the empty state automatically',
    'Icon slot renders as decorative (aria-hidden="true") — no extra labeling needed',
    'Title renders as a heading element (h1-h6, default h3) for correct document outline',
    'Actions are laid out horizontally by default and stack vertically in compact mode',
    'Compact variant reduces spacing for constrained content areas',
    'Accepts xstyle, className, and style props for custom container adjustments',
    'Forwarded ref lands on the root <div> container',
  ],
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
  accessibility: [
    'Container uses role="status" to announce the empty state content to screen readers.',
    'Icon wrapper has aria-hidden="true" so decorative icons are ignored by assistive technology.',
    'Title renders as a heading element (h1-h6 via headingLevel prop, default h3), keeping it in the document heading outline.',
  ],
  usage: {
    summary: 'Provides guidance and context when there is no data to display.',
    content: `## When to use

- Null states when no content exists yet.
- Failed loading states.
- When search or filter results return nothing.

## Best practices

- Do: Be clear and direct with messaging.
- Do: Use simple language and provide context.
- Do: Offer a next step so users know how to proceed.`,
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
  description:
    '用于无数据内容区域的空状态占位组件。显示图标或插图、标题、可选描述和操作按钮。',
  features: [
    '使用 role="status"，屏幕阅读器会自动播报空状态内容',
    '图标插槽渲染为装饰性元素（aria-hidden="true"），无需额外标注',
    '标题渲染为标题元素（h1-h6，默认 h3），保持正确的文档大纲',
    '操作按钮默认水平排列，紧凑模式下垂直堆叠',
    '紧凑变体减少间距，适用于空间受限的内容区域',
    '接受 xstyle、className 和 style 属性用于自定义容器调整',
    '转发的 ref 指向根 <div> 容器',
  ],
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
  accessibility: [
    '容器使用 role="status" 向屏幕阅读器播报空状态内容。',
    '图标包装器具有 aria-hidden="true"，使装饰性图标被辅助技术忽略。',
    '标题渲染为标题元素（通过 headingLevel 属性设置 h1-h6，默认 h3），保持在文档标题大纲中。',
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Empty state placeholder for content areas w/ no data. Displays icon/illustration, title, optional description + action buttons.',
  features: [
    'role="status" so screen readers auto-announce empty state',
    'Icon slot renders decorative (aria-hidden="true"); no extra labeling needed',
    'Title renders as heading (h1-h6, default h3) for correct document outline',
    'Actions horizontal by default; stack vertically in compact mode',
    'Compact variant reduces spacing for constrained areas',
    'Accepts xstyle, className, style for container adjustments',
    'Forwarded ref on root <div> container',
  ],
  accessibility: [
    'Container uses role="status" to announce empty state to screen readers.',
    'Icon wrapper has aria-hidden="true"; decorative icons ignored by assistive tech.',
    'Title renders as heading (h1-h6 via headingLevel, default h3) in document outline.',
  ],
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
