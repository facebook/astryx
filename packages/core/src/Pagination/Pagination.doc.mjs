/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Pagination',
  description:
    'Standalone pagination controls for navigating through pages of content. Supports multiple display variants and works with known totals or cursor-based pagination.',
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
  ],
  examples: [
    {
      label: 'Page number buttons (default)',
      code: `<XDSPagination
  page={page}
  onChange={setPage}
  totalItems={200}
  pageSize={20}
/>`,
    },
    {
      label: 'Count display with page size selector',
      code: `<XDSPagination
  page={page}
  onChange={setPage}
  totalItems={200}
  variant="count"
  pageSizeOptions={[10, 20, 50]}
  onPageSizeChange={setPageSize}
/>`,
    },
    {
      label: 'Cursor-based (no total known)',
      code: `<XDSPagination
  page={page}
  onChange={setPage}
  hasMore={data.hasNextPage}
/>`,
    },
    {
      label: 'Carousel dots',
      code: `<XDSPagination
  page={slideIndex}
  onChange={setSlideIndex}
  totalPages={slides.length}
  variant="dots"
/>`,
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
    componentKey: 'pagination',
    surfaces: [
      {name: 'root', description: 'Root nav container styles'},
    ],
  },
  notes: [
    "Page number buttons use XDSButton (variant='ghost' for inactive, variant='primary' for active) for theming and swizzle compatibility.",
    "Prev/next buttons use XDSButton with variant='ghost' and icon-only mode.",
    'Dot indicators remain custom elements (intentionally different visual treatment from buttons).',
    'Returns null when totalItems <= 0 or totalPages <= 0.',
    'Also exports generatePageRange utility for computing visible page numbers with ellipsis.',
  ],
};
