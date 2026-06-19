// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'useXDSTablePagination',
  subComponentOf: 'Table',
  displayName: 'useXDSTablePagination',
  description: 'Headless pagination plugin for XDSTable. Supports client-side slicing, server-side pagination, and cursor-based pagination. Renders XDSPagination controls automatically above, below, or both.',
  props: [
    {
      name: 'page',
      type: 'number',
      description: 'Current page number (1-based).',
      required: true,
    },
    {
      name: 'onPageChange',
      type: '(page: number) => void',
      description: 'Called when the page changes.',
      required: true,
    },
    {
      name: 'totalItems',
      type: 'number',
      description: 'Total number of items across all pages. Used to calculate total page count.',
    },
    {
      name: 'totalPages',
      type: 'number',
      description: 'Total number of pages. Use when you know the page count but not item count.',
    },
    {
      name: 'hasMore',
      type: 'boolean',
      description: 'Whether more pages exist. Use for cursor-based pagination where the total is unknown.',
    },
    {
      name: 'pageSize',
      type: 'number',
      description: 'Number of items per page.',
      default: '10',
    },
    {
      name: 'onPageSizeChange',
      type: '(pageSize: number) => void',
      description: 'Called when the user changes the page size. Shows a page size dropdown when provided with pageSizeOptions.',
    },
    {
      name: 'pageSizeOptions',
      type: 'number[]',
      description: 'Available page size options. Shows a page size selector when provided.',
    },
    {
      name: 'variant',
      type: "'pages' | 'count' | 'compact' | 'dots' | 'none'",
      description: 'Visual variant for the pagination controls.',
      default: "'pages'",
    },
    {
      name: 'position',
      type: "'below' | 'above' | 'both' | 'none'",
      description: 'Where to render pagination controls relative to the table.',
      default: "'below'",
    },
    {
      name: 'align',
      type: "'start' | 'center' | 'end'",
      description: 'Horizontal alignment of the pagination controls.',
      default: "'center'",
    },
  ],
};

export const docsZh = {
  name: 'useXDSTablePagination',
  displayName: 'useXDSTablePagination',
  description: '无头分页插件。支持客户端切片、服务器端分页和游标分页。自动渲染 XDSPagination 控件。',
  props: [
    {
      name: 'page',
      type: 'number',
      description: '当前页码（从 1 开始）。',
      required: true,
    },
    {
      name: 'onPageChange',
      type: '(page: number) => void',
      description: '页面更改时调用。',
      required: true,
    },
    {
      name: 'totalItems',
      type: 'number',
      description: '所有页面的总项目数。用于计算总页数。',
    },
    {
      name: 'pageSize',
      type: 'number',
      description: '每页项目数。',
      default: '10',
    },
    {
      name: 'variant',
      type: "'pages' | 'count' | 'compact' | 'dots' | 'none'",
      description: '分页控件的视觉变体。',
      default: "'pages'",
    },
    {
      name: 'position',
      type: "'below' | 'above' | 'both' | 'none'",
      description: '分页控件相对于表格的渲染位置。',
      default: "'below'",
    },
  ],
};

export const docsDense = {
  name: 'useXDSTablePagination',
  displayName: 'useXDSTablePagination',
  description: 'Headless pagination plugin. Client-side slicing, server-side, or cursor-based. Auto-renders XDSPagination above/below/both.',
  propDescriptions: {
    page: 'Current page (1-based).',
    onPageChange: 'Called on page change.',
    totalItems: 'Total items across all pages.',
    pageSize: 'Items per page. Default 10.',
    variant: "Pagination variant: 'pages'|'count'|'compact'|'dots'|'none'.",
    position: "Render position: 'below'|'above'|'both'|'none'.",
  },
};
