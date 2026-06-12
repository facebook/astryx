// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Table',
  displayName: 'Table',
  group: 'Table',
  category: 'Table & List',
  keywords: ["table","datatable","datagrid","spreadsheet","sorting","virtualized","columns","rows","selection","pinning"],
  playground: {
    defaults: {
      data: [
        {name: 'Alice Chen', role: 'Engineer', status: 'Active'},
        {name: 'Bob Smith', role: 'Designer', status: 'Active'},
        {name: 'Carol Wu', role: 'PM', status: 'Away'},
      ],
      columns: [
        {key: 'name', header: 'Name'},
        {key: 'role', header: 'Role'},
        {key: 'status', header: 'Status'},
      ],
    },
  },
  theming: {
    targets: [
      {className: 'xds-base-table'},
      {className: 'xds-table-row'},
      {className: 'xds-table-cell'},
      {className: 'xds-table-header-cell'},
    ],
  },
  description: 'Styled, data-driven table with density, dividers, hover highlight, striped rows, and named plugin support. T must extend Record<string, unknown>.',
  props: [
    {
      name: 'data',
      type: 'T[]',
      description: 'Array of data items to render as rows. T must extend Record<string, unknown> (use `interface MyRow extends Record<string, unknown>` for custom types).',
    },
    {
      name: 'columns',
      type: 'XDSTableColumn<T>[]',
      description: 'Column definitions — each column has {key, header, width?, align?, renderCell?}. The `header` field sets the column heading text. If omitted, columns are auto-generated from data object keys.',
    },
    {
      name: 'idKey',
      type: '(keyof T & string) | ((item: T) => string | number)',
      description: 'Row key for React reconciliation. Pass a property name string or a function. Falls back to row index if omitted.',
    },
    {
      name: 'density',
      type: "'compact' | 'balanced' | 'spacious'",
      description: 'Row density controlling cell padding and font size.',
      default: "'balanced'",
    },
    {
      name: 'dividers',
      type: "'rows' | 'columns' | 'grid' | 'none'",
      description: 'Divider style rendered between cells.',
      default: "'rows'",
    },
    {
      name: 'isStriped',
      type: 'boolean',
      description: 'Applies a background wash to even-numbered rows.',
      default: 'false',
    },
    {
      name: 'hasHover',
      type: 'boolean',
      description: 'Applies a hover highlight background to rows on pointer devices.',
      default: 'false',
    },
    {
      name: 'plugins',
      type: 'Record<string, TablePlugin<T>>',
      description: 'Named plugins that extend table behavior via the transform pipeline. Converted to an ordered array internally.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Children mode — render XDSTableRow/XDSTableCell directly instead of using data-driven rendering.',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: 'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value — not an inline style object like style={{}}.',
    },
  ],
  components: [
    {name: 'XDSTableRow'},
    {name: 'XDSTableCell'},
    {name: 'XDSTableHeaderCell'},
    {name: 'useXDSTableSelection'},
    {name: 'useXDSTableSelectionState'},
    {name: 'useXDSTableSortable'},
    {name: 'useXDSTablePagination'},
    {name: 'useXDSTableColumnSettings'},
    {name: 'useXDSTableFiltering'},
    {name: 'useXDSTableFilterState'},
  ],
  usage: {
    description:
      'Table displays structured data in rows and columns with consistent dimensionality. It supports rich cell content, sorting, selection, pagination, and column management through a composable plugin system. Use Table for data sets with uniform structure; for simpler or inconsistent data, consider a list or card layout instead.',
    bestPractices: [
      { guidance: true, description: 'Use density and divider variants to match the information density and scanning needs of your data.' },
      { guidance: true, description: 'Compose rich cell content with XDS components like XDSBadge, XDSStatusDot, and XDSAvatar via renderCell.' },
      { guidance: true, description: 'Set explicit width on every column using proportional() or pixel(). proportional(1) gives equal flex distribution with a 120px minimum that prevents columns from collapsing on narrow viewports. Omitting width skips the minimum.' },
      { guidance: false, description: 'Use a table for data without consistent columns. Use a list or card layout for heterogeneous content.' },
      { guidance: false, description: 'Enable every plugin at once. Add only the features your use case requires to keep the interface focused.' },
      { guidance: false, description: 'Omit width on text-heavy columns; without an explicit proportional() width they have no minimum and can squish to near-zero on mobile.' },
    ],
    anatomy: [
      {name: 'Column Header', required: true, description: 'Displays titles, sorting controls, and bulk selection.'},
      {name: 'Body Rows', required: true, description: 'Rows with consistent data structure.'},
      {name: 'Footer', required: false, description: 'Displays summary or totals.'},
      {name: 'Top Bar', required: false, description: 'Contains title, toolbar, and filters.'},
      {name: 'Bottom Bar', required: false, description: 'Contains pagination controls.'},
      {name: 'Support Panels', required: false, description: 'Displays row details in a side panel.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsZh = {
  usage: {
    description:
      'Table displays structured data in rows and columns with consistent dimensionality. It supports rich cell content, sorting, selection, pagination, and column management through a composable plugin system. Use Table for data sets with uniform structure; for simpler or inconsistent data, consider a list or card layout instead.',
    bestPractices: [
      { guidance: true, description: 'Use density and divider variants to match the information density and scanning needs of your data.' },
      { guidance: true, description: 'Compose rich cell content with XDS components like XDSBadge, XDSStatusDot, and XDSAvatar via renderCell.' },
      { guidance: false, description: 'Use a table for data without consistent columns. Use a list or card layout for heterogeneous content.' },
      { guidance: false, description: 'Enable every plugin at once. Add only the features your use case requires to keep the interface focused.' },
    ],
    anatomy: [
      {name: 'Column Header', required: true, description: 'Displays titles, sorting controls, and bulk selection.'},
      {name: 'Body Rows', required: true, description: 'Rows with consistent data structure.'},
      {name: 'Footer', required: false, description: 'Displays summary or totals.'},
      {name: 'Top Bar', required: false, description: 'Contains title, toolbar, and filters.'},
      {name: 'Bottom Bar', required: false, description: 'Contains pagination controls.'},
      {name: 'Support Panels', required: false, description: 'Displays row details in a side panel.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'Data-driven table w/ rich cell content via renderCell. Compose cells w/ XDSBadge, XDSStatusDot, XDSText, XDSAvatar, layout primitives. XDSBaseTable provides unstyled structural core w/ composable plugin pipeline.',
  usage: {
    description:
      'Table displays structured data in rows and columns with consistent dimensionality. It supports rich cell content, sorting, selection, pagination, and column management through a composable plugin system. Use Table for data sets with uniform structure; for simpler or inconsistent data, consider a list or card layout instead.',
    bestPractices: [
      { guidance: true, description: 'Use density and divider variants to match the information density and scanning needs of your data.' },
      { guidance: true, description: 'Compose rich cell content with XDS components like XDSBadge, XDSStatusDot, and XDSAvatar via renderCell.' },
      { guidance: true, description: 'Set explicit width on every column via proportional() or pixel(). proportional(1) = equal flex w/ 120px min preventing collapse on narrow viewports. Omitting width skips the minimum.' },
      { guidance: false, description: 'Use a table for data without consistent columns. Use a list or card layout for heterogeneous content.' },
      { guidance: false, description: 'Enable every plugin at once. Add only the features your use case requires to keep the interface focused.' },
      { guidance: false, description: 'Omit width on text-heavy columns; w/o explicit proportional() width they have no minimum and can squish to near-zero on mobile.' },
    ],
    anatomy: [
      {name: 'Column Header', required: true, description: 'Displays titles, sorting controls, and bulk selection.'},
      {name: 'Body Rows', required: true, description: 'Rows with consistent data structure.'},
      {name: 'Footer', required: false, description: 'Displays summary or totals.'},
      {name: 'Top Bar', required: false, description: 'Contains title, toolbar, and filters.'},
      {name: 'Bottom Bar', required: false, description: 'Contains pagination controls.'},
      {name: 'Support Panels', required: false, description: 'Displays row details in a side panel.'},
    ],
  },
};