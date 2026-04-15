/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Breadcrumbs',
  description: 'A navigation breadcrumb trail with semantic HTML.',
  showcase: {
    aspectRatio: 16 / 4,
    code: '<XDSBreadcrumbs items={[{label: "Home"}, {label: "Settings"}]} />',
  },
  keywords: ["breadcrumbs","breadcrumb","navigation","nav","crumbs","trail","path","hierarchy","wayfinding","steps"],
  features: [
    'Renders a <nav> landmark with an ordered list of breadcrumb items',
    'Configurable separator between items (defaults to /)',
    'Two visual variants: default and supporting (smaller, secondary text)',
    'Current page item is marked with aria-current="page"',
    'Separators are hidden from assistive technology via aria-hidden',
    'Supports icons before item labels via startIcon',
    'Auto-detects the last child as the current page when no isCurrent is set',
  ],
  theming: {
    targets: [
      {className: 'xds-breadcrumb-item'},
      {className: 'xds-breadcrumbs', visualProps: ['variant']},
    ],
  },
  accessibility: [
    'Container renders as a <nav aria-label> landmark; the label defaults to "Breadcrumb" and is customizable via the label prop',
    'Items are placed inside an <ol> with individual <li> wrappers for correct list semantics',
    'The current page item receives aria-current="page"',
    'Separators are rendered with aria-hidden="true" so screen readers skip them',
    'Auto-detects the last child as the current item when no isCurrent prop is explicitly set',
  ],
  components: [
    {
      name: 'XDSBreadcrumbs',
      description:
        'Navigation container that renders a <nav> with an ordered list of breadcrumb items.',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description:
            'XDSBreadcrumbItem elements to render inside the breadcrumb trail.',
          required: true,
        },
        {
          name: 'separator',
          type: 'ReactNode',
          description: 'Separator rendered between breadcrumb items.',
          default: "'/'",
        },
        {
          name: 'variant',
          type: "'default' | 'supporting'",
          description:
            'Visual variant — supporting is smaller with secondary text styling.',
          default: "'default'",
        },
        {
          name: 'label',
          type: 'string',
          description: 'Accessible label for the nav landmark (aria-label).',
          default: "'Breadcrumb'",
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value — not an inline style object like style={{}}.',
        },
      ],    },
    {
      name: 'XDSBreadcrumbItem',
      description:
        'Individual breadcrumb item that renders as a link when href is provided, or as plain text for the current page.',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Label content for the breadcrumb item.',
          required: true,
        },
        {
          name: 'href',
          type: 'string',
          description:
            'URL the breadcrumb links to; omit for non-navigable items.',
        },
        {
          name: 'onClick',
          type: '(e: MouseEvent) => void',
          description: 'Click handler for the breadcrumb item.',
        },
        {
          name: 'isCurrent',
          type: 'boolean',
          description:
            'Marks this item as the current page, applying aria-current="page".',
          default: 'false',
        },
        {
          name: 'startIcon',
          type: 'ReactNode',
          description: 'Icon rendered before the item label.',
        },
        {
          name: 'as',
          type: 'XDSLinkComponentType',
          description:
            'Custom link component to render instead of <a>. Overrides the provider-level default from XDSLinkProvider. Only applies to non-current items.',
        },
      ],
    },
  ],
  usage: {
    summary: 'A secondary form of navigation that orients the user within a hierarchy.',
    content: `## When to use

- To show the user's position relative to the product architecture.
- To enable quick back-and-forth navigation.
- To organize content hierarchy of 2 or more levels.`,
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Breadcrumbs',
  description: '带语义化 HTML 的导航面包屑路径。',
  features: [
    '渲染包含有序面包屑项列表的 <nav> 地标元素',
    '可配置项目间的分隔符（默认为 /）',
    '两种视觉变体：default 和 supporting（更小，次要文本样式）',
    '当前页面项标记为 aria-current="page"',
    '分隔符通过 aria-hidden 对辅助技术隐藏',
    '通过 startIcon 支持在项目标签前显示图标',
    '未设置 isCurrent 时自动检测最后一个子元素为当前页面',
  ],
  theming: {
    targets: [
      {className: 'xds-breadcrumb-item'},
      {className: 'xds-breadcrumbs', visualProps: ['variant']},
    ],
  },
  accessibility: [
    '容器渲染为 <nav aria-label> 地标元素；标签默认为 "Breadcrumb"，可通过 label 属性自定义',
    '项目放置在 <ol> 内，每个项目用 <li> 包裹以确保正确的列表语义',
    '当前页面项接收 aria-current="page"',
    '分隔符使用 aria-hidden="true" 渲染，屏幕阅读器会跳过它们',
    '未显式设置 isCurrent 属性时，自动检测最后一个子元素为当前项',
  ],
  components: [
    {
      name: 'XDSBreadcrumbs',
      description:
        '导航容器，渲染包含有序面包屑项列表的 <nav> 元素。',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description:
            '在面包屑路径内渲染的 XDSBreadcrumbItem 元素。',
          required: true,
        },
        {
          name: 'separator',
          type: 'ReactNode',
          description: '面包屑项之间渲染的分隔符。',
          default: "'/'",
        },
        {
          name: 'variant',
          type: "'default' | 'supporting'",
          description:
            '视觉变体——supporting 更小，使用次要文本样式。',
          default: "'default'",
        },
        {
          name: 'label',
          type: 'string',
          description: 'nav 地标的无障碍标签（aria-label）。',
          default: "'Breadcrumb'",
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            '用于布局自定义的 StyleX 样式（外边距、定位、尺寸）。必须是 stylex.create() 的值，而非内联样式对象如 style={{}}。',
        },
      ],
    },
    {
      name: 'XDSBreadcrumbItem',
      description:
        '单个面包屑项，提供 href 时渲染为链接，当前页面渲染为纯文本。',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description: '面包屑项的标签内容。',
          required: true,
        },
        {
          name: 'href',
          type: 'string',
          description:
            '面包屑链接的 URL；不可导航的项目请省略。',
        },
        {
          name: 'onClick',
          type: '(e: MouseEvent) => void',
          description: '面包屑项的点击处理函数。',
        },
        {
          name: 'isCurrent',
          type: 'boolean',
          description:
            '将此项标记为当前页面，应用 aria-current="page"。',
          default: 'false',
        },
        {
          name: 'startIcon',
          type: 'ReactNode',
          description: '在项目标签前渲染的图标。',
        },
        {
          name: 'as',
          type: 'XDSLinkComponentType',
          description:
            '自定义链接组件，代替 <a> 渲染。覆盖 XDSLinkProvider 设置的默认值。仅适用于非当前项。',
        },
      ],
    },
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'navigation breadcrumb trail w/ semantic HTML',
  features: [
    'renders <nav> landmark w/ ordered breadcrumb list',
    'configurable separator between items (default /)',
    'two variants: default + supporting (smaller, secondary text)',
    'current page marked w/ aria-current="page"',
    'separators hidden from assistive tech via aria-hidden',
    'startIcon before item labels',
    'auto-detects last child as current page w/o isCurrent',
  ],
  accessibility: [
    '<nav aria-label> landmark; label defaults to "Breadcrumb", customizable via label prop',
    'items in <ol> w/ <li> wrappers for list semantics',
    'current page gets aria-current="page"',
    'separators aria-hidden="true" so screen readers skip',
    'auto-detects last child as current w/o isCurrent set',
  ],
  components: [
    {
      name: 'XDSBreadcrumbs',
      description: 'nav container rendering <nav> w/ ordered breadcrumb list',
      propDescriptions: {
        children: 'XDSBreadcrumbItem elements in breadcrumb trail',
        separator: 'separator between items',
        variant: 'supporting=smaller w/ secondary text styling',
        label: 'nav landmark aria-label',
        xstyle: 'StyleX layout customization via stylex.create()',
      },
    },
    {
      name: 'XDSBreadcrumbItem',
      description: 'individual breadcrumb; link w/ href, plain text for current page',
      propDescriptions: {
        children: 'label content',
        href: 'link URL; omit for non-navigable items',
        onClick: 'click handler',
        isCurrent: 'marks current page w/ aria-current="page"',
        startIcon: 'icon before label',
        as: 'custom link component; overrides XDSLinkProvider default',
      },
    },
  ],
};
