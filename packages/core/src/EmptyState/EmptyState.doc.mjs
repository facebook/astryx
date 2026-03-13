/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'EmptyState',
  description:
    'An empty state placeholder for content areas with no data. Displays an icon or illustration, title, optional description, and action buttons.',
  features: [
    'Uses role="status" so screen readers announce the empty state automatically',
    'Icon slot renders as decorative (aria-hidden="true") — no extra labeling needed',
    'Title renders as an <h3> heading element for correct document outline',
    'Actions are laid out horizontally by default and stack vertically in compact mode',
    'Compact variant reduces spacing for constrained content areas',
    'Accepts xstyle, className, and style props for custom container adjustments',
    'Forwarded ref lands on the root <div> container',
  ],
  examples: [
    {
      label: 'Minimal',
      code: '<XDSEmptyState title="No results found" />',
    },
    {
      label: 'With description',
      code: `<XDSEmptyState
  title="No results found"
  description="Try adjusting your search or filters."
/>`,
    },
    {
      label: 'Full example with icon and action',
      code: `<XDSEmptyState
  icon={<XDSIcon icon={InboxIcon} size="lg" />}
  title="No messages"
  description="You're all caught up!"
  actions={<XDSButton label="Compose" variant="primary" />}
/>`,
    },
    {
      label: 'Compact variant',
      code: `<XDSEmptyState
  title="No items"
  description="Nothing to show here."
  isCompact
/>`,
    },
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
    'Title renders as an <h3> element, keeping it in the document heading outline.',
  ],
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'EmptyState',
  description:
    '用于无数据内容区域的空状态占位组件。显示图标或插图、标题、可选描述和操作按钮。',
  features: [
    '使用 role="status"，屏幕阅读器会自动播报空状态内容',
    '图标插槽渲染为装饰性元素（aria-hidden="true"），无需额外标注',
    '标题渲染为 <h3> 标题元素，保持正确的文档大纲',
    '操作按钮默认水平排列，紧凑模式下垂直堆叠',
    '紧凑变体减少间距，适用于空间受限的内容区域',
    '接受 xstyle、className 和 style 属性用于自定义容器调整',
    '转发的 ref 指向根 <div> 容器',
  ],
  examples: [
    {
      label: '最简用法',
      code: '<XDSEmptyState title="No results found" />',
    },
    {
      label: '带描述',
      code: `<XDSEmptyState
  title="No results found"
  description="Try adjusting your search or filters."
/>`,
    },
    {
      label: '带图标和操作的完整示例',
      code: `<XDSEmptyState
  icon={<XDSIcon icon={InboxIcon} size="lg" />}
  title="No messages"
  description="You're all caught up!"
  actions={<XDSButton label="Compose" variant="primary" />}
/>`,
    },
    {
      label: '紧凑变体',
      code: `<XDSEmptyState
  title="No items"
  description="Nothing to show here."
  isCompact
/>`,
    },
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
    '标题渲染为 <h3> 元素，保持在文档标题大纲中。',
  ],
};

/** @type {string} */
export const docsDense = `TODO: apply dense protocol`;
