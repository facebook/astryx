/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Pagination',
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
        'Total number of items. Used to calculate page count when totalPages is not provided.',
    },
    {
      name: 'totalPages',
      type: 'number',
      description:
        'Total number of pages. Takes precedence over totalItems if both are provided.',
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
  ],
  theming: {
    targets: [
      {className: 'xds-pagination', visualProps: ['size', 'variant']},
      {className: 'xds-pagination-dot', visualProps: ['size'], states: ['active']},
    ],
  },
  usage: {
    description:
      'Pagination provides controls for navigating through pages of content. Use it to break large data sets into manageable pages, supporting multiple display variants for different density needs.',
    bestPractices: [
      { guidance: true, description: 'Choose the variant that best matches the information density of your layout — page numbers for precise navigation, dots for carousels.' },
      { guidance: true, description: 'Provide totalItems or totalPages when the total is known so users can see how much content remains.' },
      { guidance: false, description: 'Show Pagination when all items fit on a single page.' },
      { guidance: false, description: 'Mix different Pagination variants within the same view.' },
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Pagination',
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
        '总项目数。未提供 totalPages 时用于计算页数。',
    },
    {
      name: 'totalPages',
      type: 'number',
      description:
        '总页数。同时提供时优先于 totalItems。',
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
  ],
  theming: {
    targets: [
      {className: 'xds-pagination', visualProps: ['size', 'variant']},
      {className: 'xds-pagination-dot', visualProps: ['size'], states: ['active']},
    ],
  },
  usage: {
    description:
      'Pagination provides controls for navigating through pages of content. Use it to break large data sets into manageable pages, supporting multiple display variants for different density needs.',
    bestPractices: [
      { guidance: true, description: 'Choose the variant that best matches the information density of your layout — page numbers for precise navigation, dots for carousels.' },
      { guidance: true, description: 'Provide totalItems or totalPages when the total is known so users can see how much content remains.' },
      { guidance: false, description: 'Show Pagination when all items fit on a single page.' },
      { guidance: false, description: 'Mix different Pagination variants within the same view.' },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Standalone pagination controls for navigating content pages. Supports multiple display variants + works w/ known totals or cursor-based pagination.',
  usage: {
    description:
      'Pagination provides controls for navigating through pages of content. Use it to break large data sets into manageable pages, supporting multiple display variants for different density needs.',
    bestPractices: [
      { guidance: true, description: 'Choose the variant that best matches the information density of your layout — page numbers for precise navigation, dots for carousels.' },
      { guidance: true, description: 'Provide totalItems or totalPages when the total is known so users can see how much content remains.' },
      { guidance: false, description: 'Show Pagination when all items fit on a single page.' },
      { guidance: false, description: 'Mix different Pagination variants within the same view.' },
    ],
  },
  propDescriptions: {
    page: 'Current page number (1-based).',
    onChange: 'Called on page change.',
    onChangeAction:
      'Async action on page change. Fires after onChange; uses React transitions for loading.',
    totalItems: 'Total items. Calculates page count when totalPages is not provided.',
    totalPages: 'Total pages. Takes precedence over totalItems if both provided.',
    hasMore: 'More pages exist after current. For cursor-based pagination.',
    pageSize: 'Items per page.',
    pageSizeOptions: 'Page size options. Shows selector dropdown when provided.',
    onPageSizeChange: 'Called on page size change. Auto resets to page 1.',
    variant: 'Display between prev/next buttons.',
    siblingCount: "Page buttons each side of current; only variant='pages'.",
    size: 'Control size.',
    isDisabled: 'Component disabled.',
    label: 'Accessible label for nav landmark.',
  },
};
