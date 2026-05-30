// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Breadcrumbs',
  displayName: 'Breadcrumbs',
  group: 'Breadcrumbs',
  category: 'Navigation',
  keywords: ["breadcrumbs","breadcrumb","navigation","nav","crumbs","trail","path","hierarchy","wayfinding","steps"],
  usage: {
    description:
      'Breadcrumbs show a trail of links from the root to the current page. Use them at the top of detail pages, settings panels, or anywhere the user needs to see where they are and navigate back up.',
    bestPractices: [
      {guidance: true, description: 'Place breadcrumbs above the page heading so the user sees their location before reading the content.'},
      {guidance: true, description: 'Keep labels short and match the page titles they link to — "Settings" not "Application Settings Page".'},
      {guidance: true, description: 'Use the supporting variant in dense UIs like admin panels or sidebars where the breadcrumb should be subtle.'},
      {guidance: true, description: 'Make the last item plain text, not a link — it represents the current page. The component does this automatically when you set isCurrent.'},
      {guidance: false, description: 'Use breadcrumbs as the primary navigation — they supplement a sidebar or top nav, not replace it.'},
      {guidance: false, description: 'Show breadcrumbs on top-level pages that have no parent — they add clutter without helping the user.'},
      {guidance: false, description: 'Let the trail grow beyond 5 levels — if you need more, consider simplifying the page hierarchy instead.'},
    ],
    anatomy: [
      {name: 'Trail', required: true, description: 'The ordered list of links from root to current page.'},
      {name: 'Item', required: true, description: 'A single step in the trail. Renders as a link or plain text for the current page.'},
      {name: 'Separator', required: true, description: 'The character between items. Defaults to "/" but can be customized.'},
      {name: 'Icon', required: false, description: 'An optional icon before an item label, like a home icon on the first item.'},
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
      displayName: 'Breadcrumbs',
      description:
        'Navigation container that renders a <nav> with an ordered list of breadcrumb items.',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description:
            'XDSBreadcrumbItem elements to render inside the breadcrumb trail.',
          slotElements: [{__element: 'XDSBreadcrumbItem', props: {href: '#'}, children: 'Page'}],
          required: true,
        },
        {
          name: 'separator',
          type: 'ReactNode',
          description: 'Separator rendered between breadcrumb items.',
          default: "'/'",
          slotElements: [{__element: 'XDSIcon', props: {icon: 'chevronRight', size: 'sm'}}],
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
      displayName: 'Breadcrumb Item',
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
          slotElements: [{__element: 'XDSIcon', props: {icon: 'check', size: 'sm'}}],
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
  displayName: 'Breadcrumbs',
  group: 'Breadcrumbs',
  usage: {
    description:
      'Breadcrumbs show a trail of links from the root to the current page. Use them at the top of detail pages, settings panels, or anywhere the user needs to see where they are and navigate back up.',
    bestPractices: [
      {guidance: true, description: 'Place breadcrumbs above the page heading so the user sees their location before reading the content.'},
      {guidance: true, description: 'Keep labels short and match the page titles they link to — "Settings" not "Application Settings Page".'},
      {guidance: true, description: 'Use the supporting variant in dense UIs like admin panels or sidebars where the breadcrumb should be subtle.'},
      {guidance: true, description: 'Make the last item plain text, not a link — it represents the current page. The component does this automatically when you set isCurrent.'},
      {guidance: false, description: 'Use breadcrumbs as the primary navigation — they supplement a sidebar or top nav, not replace it.'},
      {guidance: false, description: 'Show breadcrumbs on top-level pages that have no parent — they add clutter without helping the user.'},
      {guidance: false, description: 'Let the trail grow beyond 5 levels — if you need more, consider simplifying the page hierarchy instead.'},
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
      displayName: 'Breadcrumbs',
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
      displayName: 'Breadcrumb Item',
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
  description: 'link trail from root to current page for wayfinding',
  usage: {
    description:
      'Breadcrumbs show a trail of links from root to current page. Use at the top of detail pages, settings, or nested content.',
    bestPractices: [
      {guidance: true, description: 'Place above the page heading. Keep labels short and matching page titles.'},
      {guidance: true, description: 'Use supporting variant in dense UIs where the breadcrumb should be subtle.'},
      {guidance: true, description: 'Last item should be plain text (isCurrent), not a link.'},
      {guidance: false, description: 'Use as primary navigation — breadcrumbs supplement, not replace, a main nav.'},
      {guidance: false, description: 'Show on top-level pages with no parent.'},
      {guidance: false, description: 'Let the trail exceed 5 levels — simplify the hierarchy instead.'},
    ],
  },
  components: [
    {
      name: 'XDSBreadcrumbs',
      displayName: 'Breadcrumbs',
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
      displayName: 'Breadcrumb Item',
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
