/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Breadcrumbs',
  keywords: ["breadcrumbs","breadcrumb","navigation","nav","crumbs","trail","path","hierarchy","wayfinding","steps"],
  usage: {
    description:
      'Breadcrumbs display a secondary navigation trail that shows the user\'s position within a content hierarchy. Use to orient users and enable quick back-and-forth navigation across nested pages.',
    bestPractices: [
      {guidance: true, description: 'Place breadcrumbs near the top of the page, above the main heading, to establish hierarchy context.'},
      {guidance: true, description: 'Keep breadcrumb labels short and match the titles of the pages they link to.'},
      {guidance: false, description: 'Use breadcrumbs as the primary navigation — they supplement, not replace, a main nav.'},
    ],
  },
  theming: {
    targets: [
      {className: 'xds-breadcrumb-item'},
      {className: 'xds-breadcrumbs', visualProps: ['variant']},
    ],
  },
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
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Breadcrumbs',
  usage: {
    description:
      'Breadcrumbs display a secondary navigation trail that shows the user\'s position within a content hierarchy. Use to orient users and enable quick back-and-forth navigation across nested pages.',
    bestPractices: [
      {guidance: true, description: 'Place breadcrumbs near the top of the page, above the main heading, to establish hierarchy context.'},
      {guidance: true, description: 'Keep breadcrumb labels short and match the titles of the pages they link to.'},
      {guidance: false, description: 'Use breadcrumbs as the primary navigation — they supplement, not replace, a main nav.'},
    ],
  },
  theming: {
    targets: [
      {className: 'xds-breadcrumb-item'},
      {
        className: 'xds-breadcrumbs',
        visualProps: [
          'variant',
        ],
      },
    ],
  },
  components: [
    {
      name: 'XDSBreadcrumbs',
      description: '导航容器，渲染包含有序面包屑项列表的 <nav> 元素。',
      props: [
        {name: 'children', type: 'ReactNode', description: '在面包屑路径内渲染的 XDSBreadcrumbItem 元素。', required: true},
        {name: 'separator', type: 'ReactNode', description: '面包屑项之间渲染的分隔符。', default: "'/'"},
        {name: 'variant', type: "'default' | 'supporting'", description: '视觉变体——supporting 更小，使用次要文本样式。', default: "'default'"},
        {name: 'label', type: 'string', description: 'nav 地标的无障碍标签（aria-label）。', default: "'Breadcrumb'"},
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
      description: '单个面包屑项，提供 href 时渲染为链接，当前页面渲染为纯文本。',
      props: [
        {name: 'children', type: 'ReactNode', description: '面包屑项的标签内容。', required: true},
        {name: 'href', type: 'string', description: '面包屑链接的 URL；不可导航的项目请省略。'},
        {name: 'onClick', type: '(e: MouseEvent) => void', description: '面包屑项的点击处理函数。'},
        {name: 'isCurrent', type: 'boolean', description: '将此项标记为当前页面，应用 aria-current="page"。', default: 'false'},
        {name: 'startIcon', type: 'ReactNode', description: '在项目标签前渲染的图标。'},
        {name: 'as', type: 'XDSLinkComponentType', description: '自定义链接组件，代替 <a> 渲染。覆盖 XDSLinkProvider 设置的默认值。仅适用于非当前项。'},
      ],
    },
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'navigation breadcrumb trail w/ semantic HTML',
  usage: {
    description:
      'Breadcrumbs display a secondary navigation trail that shows the user\'s position within a content hierarchy. Use to orient users and enable quick back-and-forth navigation across nested pages.',
    bestPractices: [
      {guidance: true, description: 'Place breadcrumbs near the top of the page, above the main heading, to establish hierarchy context.'},
      {guidance: true, description: 'Keep breadcrumb labels short and match the titles of the pages they link to.'},
      {guidance: false, description: 'Use breadcrumbs as the primary navigation — they supplement, not replace, a main nav.'},
    ],
  },
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
