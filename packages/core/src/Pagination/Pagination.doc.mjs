/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Pagination',
  description:
    'Standalone pagination controls for navigating through pages of content. Supports multiple display variants and works with known totals or cursor-based pagination.',
  showcase: {
    aspectRatio: 16 / 4,
    code: '<XDSPagination totalPages={10} currentPage={1} onPageChange={() => {}} />',
  },
  keywords: ["pagination","pager","paginator","pagenavigation","paging","paginate","pages","pagecontrol"],
  props: [
    {
      name: 'page',
      type: 'number',
      description: 'Current page number (1-based). Page 1 is the first page.',
      required: true,
    },
    {
      name: 'onChange',
      type: '(page: number) => void',
      description: 'Called when the page changes.',
      required: true,
    },
    {
      name: 'onChangeAction',
      type: '(page: number) => void | Promise<void>',
      description:
        'Async action on page change. Fires after onChange and uses React transitions for built-in loading state.',
    },
    {
      name: 'totalItems',
      type: 'number',
      description:
        'Total number of items. Used to calculate page count. Takes precedence over totalPages if both provided.',
    },
    {
      name: 'totalPages',
      type: 'number',
      description:
        'Total number of pages. Use when you know page count but not item count.',
    },
    {
      name: 'hasMore',
      type: 'boolean',
      description:
        'Whether more pages exist after the current one. Use for cursor-based pagination where total is unknown.',
    },
    {
      name: 'pageSize',
      type: 'number',
      description: 'Number of items per page.',
      default: '10',
    },
    {
      name: 'pageSizeOptions',
      type: 'number[]',
      description:
        'Available page size options. Shows a page size selector dropdown when provided.',
    },
    {
      name: 'onPageSizeChange',
      type: '(pageSize: number) => void',
      description:
        'Called when the page size changes. Automatically resets to page 1.',
    },
    {
      name: 'variant',
      type: "'pages' | 'count' | 'compact' | 'dots' | 'none'",
      description:
        "Visual variant controlling what appears between prev/next buttons. 'pages' shows page number buttons with ellipsis, 'count' shows 'X-Y of Z' text, 'compact' shows 'Page X of Y', 'dots' shows dot indicators, 'none' shows just prev/next buttons.",
      default: "'pages'",
    },
    {
      name: 'siblingCount',
      type: 'number',
      description:
        "Number of page buttons to show on each side of the current page. Only applies when variant='pages'.",
      default: '1',
    },
    {
      name: 'size',
      type: "'sm' | 'md'",
      description: 'Size of the pagination controls.',
      default: "'md'",
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Whether the component is disabled.',
      default: 'false',
    },
    {
      name: 'label',
      type: 'string',
      description: 'Accessible label for the navigation landmark.',
      default: "'Pagination'",
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value — not an inline style object like style={{}}.',
    },
  ],
  features: [
    "Five display variants: 'pages', 'count', 'compact', 'dots', 'none'",
    'Offset and cursor-based pagination: provide totalItems/totalPages for known totals, or hasMore for cursor-based',
    'Page size selector: shows a dropdown when pageSizeOptions is provided',
    'Ellipsis truncation for page numbers via generatePageRange utility',
    'React transitions: onChangeAction uses useTransition for built-in loading state',
    "Sizes: 'sm' and 'md'",
  ],
  accessibility: [
    'Root is <nav> with configurable aria-label.',
    'Current page button has aria-current="page".',
    'Prev/next buttons have descriptive aria-label.',
    'Ellipsis elements are aria-hidden.',
    'All interactive elements are keyboard accessible.',
  ],
  theming: {
    targets: [
      {className: 'xds-pagination', visualProps: ['size', 'variant']},
      {className: 'xds-pagination-dot', visualProps: ['size'], states: ['active']},
    ],
  },
  notes: [
    "Page number buttons use XDSButton (variant='ghost' for inactive, variant='primary' for active) for theming and swizzle compatibility.",
    "Prev/next buttons use XDSButton with variant='ghost' and icon-only mode.",
    'Dot indicators use xds-pagination-dot className with size and active state classes for theme targeting.',
    'Returns null when totalItems <= 0 or totalPages <= 0.',
    'Also exports generatePageRange utility for computing visible page numbers with ellipsis.',
  ],
  usage: {
    summary: 'Communicates the number of elements that can be loaded within a given context.',
    content: `## When to use

- Showing current position within a paginated set.
- Accessing previous and next items.
- Selecting a specific page from a range.`,
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Pagination',
  description:
    '用于在内容页面之间导航的独立分页控件。支持多种显示变体，适用于已知总数或基于游标的分页。',
  props: [
    {
      name: 'page',
      type: 'number',
      description: '当前页码（从 1 开始）。第 1 页为首页。',
      required: true,
    },
    {
      name: 'onChange',
      type: '(page: number) => void',
      description: '页码变化时调用。',
      required: true,
    },
    {
      name: 'onChangeAction',
      type: '(page: number) => void | Promise<void>',
      description:
        '页码变化时的异步操作。在 onChange 之后触发，使用 React transitions 实现内置加载状态。',
    },
    {
      name: 'totalItems',
      type: 'number',
      description:
        '总项目数。用于计算页数。同时提供时优先于 totalPages。',
    },
    {
      name: 'totalPages',
      type: 'number',
      description:
        '总页数。当你知道页数但不知道项目数时使用。',
    },
    {
      name: 'hasMore',
      type: 'boolean',
      description:
        '当前页之后是否还有更多页。用于总数未知的游标分页。',
    },
    {
      name: 'pageSize',
      type: 'number',
      description: '每页项目数。',
      default: '10',
    },
    {
      name: 'pageSizeOptions',
      type: 'number[]',
      description:
        '可用的每页大小选项。提供时显示每页大小选择器下拉菜单。',
    },
    {
      name: 'onPageSizeChange',
      type: '(pageSize: number) => void',
      description:
        '每页大小变化时调用。自动重置到第 1 页。',
    },
    {
      name: 'variant',
      type: "'pages' | 'count' | 'compact' | 'dots' | 'none'",
      description:
        "控制上一页/下一页按钮之间显示内容的视觉变体。'pages' 显示带省略号的页码按钮，'count' 显示 'X-Y of Z' 文本，'compact' 显示 'Page X of Y'，'dots' 显示点指示器，'none' 仅显示上一页/下一页按钮。",
      default: "'pages'",
    },
    {
      name: 'siblingCount',
      type: 'number',
      description:
        "当前页两侧显示的页码按钮数量。仅在 variant='pages' 时生效。",
      default: '1',
    },
    {
      name: 'size',
      type: "'sm' | 'md'",
      description: '分页控件的尺寸。',
      default: "'md'",
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '组件是否禁用。',
      default: 'false',
    },
    {
      name: 'label',
      type: 'string',
      description: '导航地标的无障碍标签。',
      default: "'Pagination'",
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义（外边距、定位、尺寸）的 StyleX 样式。必须是 stylex.create() 的值，而非内联样式对象如 style={{}}。',
    },
  ],
  features: [
    "五种显示变体：'pages'、'count'、'compact'、'dots'、'none'",
    '偏移量和游标分页：提供 totalItems/totalPages 用于已知总数，或 hasMore 用于游标分页',
    '每页大小选择器：提供 pageSizeOptions 时显示下拉菜单',
    '通过 generatePageRange 工具函数实现页码省略号截断',
    'React transitions：onChangeAction 使用 useTransition 实现内置加载状态',
    "尺寸：'sm' 和 'md'",
  ],
  accessibility: [
    '根元素为 <nav>，带可配置的 aria-label。',
    '当前页按钮具有 aria-current="page"。',
    '上一页/下一页按钮具有描述性的 aria-label。',
    '省略号元素为 aria-hidden。',
    '所有交互元素均支持键盘访问。',
  ],
  theming: {
    targets: [
      {className: 'xds-pagination', visualProps: ['size', 'variant']},
      {className: 'xds-pagination-dot', visualProps: ['size'], states: ['active']},
    ],
  },
  notes: [
    "页码按钮使用 XDSButton（非活动状态 variant='ghost'，活动状态 variant='primary'）以兼容主题和 swizzle。",
    "上一页/下一页按钮使用 XDSButton，variant='ghost' 且仅图标模式。",
    '点指示器使用 xds-pagination-dot 类名，带有 size 和 active 状态类以支持主题定位。',
    '当 totalItems <= 0 或 totalPages <= 0 时返回 null。',
    '还导出 generatePageRange 工具函数，用于计算带省略号的可见页码。',
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Standalone pagination controls for navigating content pages. Supports multiple display variants + works w/ known totals or cursor-based pagination.',
  features: [
    "Five display variants: 'pages', 'count', 'compact', 'dots', 'none'",
    'Offset + cursor-based pagination: totalItems/totalPages for known totals, hasMore for cursor-based',
    'Page size selector: shows dropdown when pageSizeOptions provided',
    'Ellipsis truncation for page numbers via generatePageRange utility',
    'React transitions: onChangeAction uses useTransition for built-in loading state',
    "Sizes: 'sm' and 'md'",
  ],
  accessibility: [
    'Root is <nav> w/ configurable aria-label.',
    'Current page button has aria-current="page".',
    'Prev/next buttons have descriptive aria-label.',
    'Ellipsis elements are aria-hidden.',
    'All interactive elements keyboard accessible.',
  ],
  notes: [
    "Page number buttons use XDSButton (variant='ghost' inactive, variant='primary' active) for theming + swizzle compatibility.",
    "Prev/next buttons use XDSButton w/ variant='ghost' + icon-only mode.",
    'Dot indicators use xds-pagination-dot className w/ size + active state classes for theme targeting.',
    'Returns null when totalItems <= 0 or totalPages <= 0.',
    'Exports generatePageRange utility for computing visible page numbers w/ ellipsis.',
  ],
  propDescriptions: {
    page: 'Current page number (1-based).',
    onChange: 'Called on page change.',
    onChangeAction:
      'Async action on page change. Fires after onChange; uses React transitions for loading.',
    totalItems: 'Total items. Calculates page count. Precedence over totalPages.',
    totalPages: 'Total pages. Use when page count known but not item count.',
    hasMore: 'More pages exist after current. For cursor-based pagination.',
    pageSize: 'Items per page.',
    pageSizeOptions: 'Page size options. Shows selector dropdown when provided.',
    onPageSizeChange: 'Called on page size change. Auto resets to page 1.',
    variant: 'Display between prev/next buttons.',
    siblingCount: "Page buttons each side of current; only variant='pages'.",
    size: 'Control size.',
    isDisabled: 'Component disabled.',
    label: 'Accessible label for nav landmark.',
    xstyle:
      'StyleX styles for layout customization (margins, positioning, sizing). Must be stylex.create() value.',
  },
};
