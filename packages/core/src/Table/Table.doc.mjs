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
  components: [
    {
      name: 'XDSTable',
      displayName: 'Table',
      description:
        'Styled, data-driven table with density, dividers, hover highlight, striped rows, and named plugin support.',
      props: [
        {
          name: 'data',
          type: 'T[]',
          description: 'Array of data items to render as rows.',
        },
        {
          name: 'columns',
          type: 'XDSTableColumn<T>[]',
          description:
            'Column definitions. If omitted, columns are auto-generated from data object keys.',
        },
        {
          name: 'idKey',
          type: '(keyof T & string) | ((item: T) => string | number)',
          description:
            'Row key for React reconciliation. Pass a property name string or a function. Falls back to row index if omitted.',
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
          description:
            'Applies a hover highlight background to rows on pointer devices.',
          default: 'false',
        },
        {
          name: 'plugins',
          type: 'Record<string, TablePlugin<T>>',
          description:
            'Named plugins that extend table behavior via the transform pipeline. Converted to an ordered array internally.',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description:
            'Children mode — render XDSTableRow/XDSTableCell directly instead of using data-driven rendering.',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value — not an inline style object like style={{}}.',
        },
      ],    },
    {
      name: 'XDSBaseTable',
      isHiddenFromOverview: true,
      displayName: 'Base Table',
      description:
        'Unstyled structural table component with a plugin transform pipeline and a components prop for swapping in custom row/cell renderers.',
      props: [
        {
          name: 'data',
          type: 'T[]',
          description: 'Array of data items to render as rows.',
        },
        {
          name: 'columns',
          type: 'XDSTableColumn<T>[]',
          description:
            'Column definitions. If omitted, columns are auto-generated from data object keys.',
        },
        {
          name: 'idKey',
          type: '(keyof T & string) | ((item: T) => string | number)',
          description:
            'Row key for React reconciliation. Pass a property name string or a function. Falls back to row index if omitted.',
        },
        {
          name: 'plugins',
          type: 'TablePlugin<T>[]',
          description:
            'Ordered array of plugins applied as a sequential transform pipeline.',
        },
        {
          name: 'components',
          type: '{Row?: ComponentType<TableRowComponentProps>; Cell?: ComponentType<TableCellComponentProps>; HeaderCell?: ComponentType<TableHeaderCellComponentProps>}',
          description:
            'Component overrides for row and cell elements. When provided, these components receive xstyle from plugin transforms.',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description:
            'Children mode — render rows directly in the tbody instead of using data-driven rendering.',
        },
        {
          name: 'tableProps',
          type: 'HTMLAttributes<HTMLTableElement>',
          description:
            'Additional HTML attributes passed directly to the root <table> element.',
        },
      ],
    },
    {
      name: 'XDSTableRow',
      isHiddenFromOverview: true,
      displayName: 'Table Row',
      description:
        '<tr> wrapper that reads XDSTableContext to apply striped, hover, and divider styles when used inside XDSTable.',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Row cell elements.',
          required: true,
        },
      ],
    },
    {
      name: 'XDSTableCell',
      isHiddenFromOverview: true,
      displayName: 'Table Cell',
      description:
        '<td> wrapper that reads XDSTableContext to apply density padding, font size, and divider borders when used inside XDSTable.',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Cell content.',
        },
      ],
    },
    {
      name: 'XDSTableHeaderCell',
      isHiddenFromOverview: true,
      displayName: 'Table Header Cell',
      description:
        '<th> wrapper that reads XDSTableContext to apply density padding, semibold weight, secondary text color, and divider borders when used inside XDSTable.',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Header cell content.',
        },
      ],
    },
    {
      name: 'useXDSTableSelection',
      displayName: 'useXDSTableSelection',
      description:
        'Hook that returns a TablePlugin implementing row selection with checkboxes, select-all, and aria-selected. Uses React Context for independent checkbox re-renders.',
      props: [
        {
          name: 'getIsItemSelected',
          type: '(item: T) => boolean',
          description: 'Returns whether the given item is currently selected.',
          required: true,
        },
        {
          name: 'onSelectItem',
          type: '(event: {item: T; isSelected: boolean}) => void',
          description:
            'Called when a row checkbox is toggled. isSelected is the new desired state.',
          required: true,
        },
        {
          name: 'onSelectAll',
          type: '(event: {isAllSelected: boolean}) => void',
          description: 'Called when the select-all header checkbox is toggled.',
          required: true,
        },
        {
          name: 'getIsAllSelected',
          type: '() => boolean',
          description:
            'Returns whether all selectable items are currently selected.',
          required: true,
        },
        {
          name: 'getIsIndeterminate',
          type: '() => boolean',
          description:
            'Returns whether selection is partial (some but not all). Renders the select-all checkbox in indeterminate state.',
        },
        {
          name: 'getIsItemSelectable',
          type: '(item: T) => boolean',
          description:
            'Returns whether a row should show a checkbox. Non-selectable rows render nothing in the selection cell.',
          default: '() => true',
        },
        {
          name: 'getIsItemEnabled',
          type: '(item: T) => boolean',
          description:
            'Returns whether a row checkbox is interactive. Disabled rows show a disabled checkbox.',
          default: '() => true',
        },
      ],
    },
    {
      name: 'useXDSTableSelectionState',
      displayName: 'useXDSTableSelectionState',
      description:
        'State management companion for useXDSTableSelection. Handles disabled/selectable row filtering for select-all automatically — disabled rows are frozen (preserved across select-all/deselect-all), non-selectable rows are excluded.',
      props: [
        {
          name: 'data',
          type: 'T[]',
          description: 'The full data array rendered in the table.',
          required: true,
        },
        {
          name: 'idKey',
          type: '(keyof T & string) | ((item: T) => string)',
          description:
            'Key extractor — property name or function returning a unique string ID.',
          required: true,
        },
        {
          name: 'selectedKeys',
          type: 'Set<string>',
          description: 'Controlled set of selected item IDs.',
          required: true,
        },
        {
          name: 'setSelectedKeys',
          type: 'Dispatch<SetStateAction<Set<string>>>',
          description: 'Setter for the controlled selected keys.',
          required: true,
        },
        {
          name: 'getIsItemSelectable',
          type: '(item: T) => boolean',
          description:
            'Should this row show a checkbox? Non-selectable rows are excluded from select-all.',
          default: '() => true',
        },
        {
          name: 'getIsItemEnabled',
          type: '(item: T) => boolean',
          description:
            'Is this row checkbox interactive? Disabled rows are frozen — select-all preserves their state.',
          default: '() => true',
        },
      ],
    },
    {
      name: 'useXDSTableSortable',
      displayName: 'useXDSTableSortable',
      description:
        'Headless multi-sort plugin for XDSTable. The consumer owns sort state and provides a callback. Shift+click enables secondary sort columns. Sort indicators render in header cells automatically.',
      props: [
        {
          name: 'sort',
          type: 'XDSTableSortState<TSortKey>',
          description:
            'Current sort state. Ordered array of {sortKey, direction} entries. First entry is the primary sort.',
          required: true,
        },
        {
          name: 'onSortChange',
          type: '(sort: XDSTableSortState<TSortKey>) => void',
          description:
            'Called when the user clicks a header cell to change sort.',
          required: true,
        },
        {
          name: 'allowUnsortedState',
          type: 'boolean',
          description:
            'Allow cycling back to unsorted. When true: asc, desc, unsorted. When false: asc, desc, asc.',
          default: 'false',
        },
        {
          name: 'isMultiSortEnabled',
          type: 'boolean',
          description:
            'Enable multi-sort via Shift+click. Regular click still replaces the entire sort state.',
          default: 'false',
        },
      ],
    },
    {
      name: 'useXDSTablePagination',
      displayName: 'useXDSTablePagination',
      description:
        'Headless pagination plugin for XDSTable. Supports client-side slicing, server-side pagination, and cursor-based pagination. Renders XDSPagination controls automatically above, below, or both.',
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
          description:
            'Total number of items across all pages. Used to calculate total page count.',
        },
        {
          name: 'totalPages',
          type: 'number',
          description:
            'Total number of pages. Use when you know the page count but not item count.',
        },
        {
          name: 'hasMore',
          type: 'boolean',
          description:
            'Whether more pages exist. Use for cursor-based pagination where the total is unknown.',
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
          description:
            'Called when the user changes the page size. Shows a page size dropdown when provided with pageSizeOptions.',
        },
        {
          name: 'pageSizeOptions',
          type: 'number[]',
          description:
            'Available page size options. Shows a page size selector when provided.',
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
          description:
            'Where to render pagination controls relative to the table.',
          default: "'below'",
        },
        {
          name: 'align',
          type: "'start' | 'center' | 'end'",
          description:
            'Horizontal alignment of the pagination controls.',
          default: "'center'",
        },
      ],
    },
    {
      name: 'useXDSTableColumnSettings',
      displayName: 'useXDSTableColumnSettings',
      description:
        'Headless column visibility and ordering management for XDSTable. Provides filtered columns, toggle helpers, and pre-built XDSMultiSelector options for a column picker UI.',
      props: [
        {
          name: 'columns',
          type: 'XDSColumnSettingsOption[]',
          description:
            'All available columns with metadata for the settings UI. Each entry has key, label, optional isAlwaysVisible and group.',
          required: true,
        },
        {
          name: 'activeColumnKeys',
          type: 'string[]',
          description:
            'Currently active column keys, in display order. Only columns with keys in this array are shown.',
          required: true,
        },
        {
          name: 'onChangeActiveColumnKeys',
          type: '(keys: string[]) => void',
          description:
            'Called when active columns change (toggle, reorder).',
          required: true,
        },
        {
          name: 'defaultColumnKeys',
          type: 'string[]',
          description:
            'Default column set for "Reset to default". When omitted, reset shows all columns.',
        },
      ],
    },
    {
      name: 'useXDSTableFiltering',
      isHiddenFromOverview: true,
      displayName: 'useXDSTableFiltering',
      description:
        'Table plugin that adds inline column filters with popover or inline controls. Pairs with useXDSTableFilterState for managed state. Supports text, select, multi-select, date, and number filter types via PowerSearch field definitions.',
      props: [
        {
          name: 'filters',
          type: 'XDSTableFilterState',
          description:
            'Current filter state — map from column key to filter value.',
          required: true,
        },
        {
          name: 'onFilterChange',
          type: '(columnKey: string, value: XDSTableFilterValue | null) => void',
          description:
            'Called when the user changes a filter value. null clears the filter.',
          required: true,
        },
        {
          name: 'variant',
          type: "'popover' | 'inline'",
          description:
            'Display variant for filter controls.',
          default: "'popover'",
        },
      ],
    },
    {
      name: 'useXDSTableFilterState',
      isHiddenFromOverview: true,
      displayName: 'useXDSTableFilterState',
      description:
        'Managed state hook for table filtering. Returns the current filter map and an onChange handler. Pass the result directly to useXDSTableFiltering.',
      props: [
        {
          name: 'initialState',
          type: 'XDSTableFilterState',
          description:
            'Optional initial filter state map.',
        },
      ],
    },
  ],
  usage: {
    description:
      'Table displays structured data in rows and columns with consistent dimensionality. It supports rich cell content, sorting, selection, pagination, and column management through a composable plugin system. Use Table for data sets with uniform structure; for simpler or inconsistent data, consider a list or card layout instead.',
    bestPractices: [
      { guidance: true, description: 'Use density and divider variants to match the information density and scanning needs of your data.' },
      { guidance: true, description: 'Compose rich cell content with XDS components like XDSBadge, XDSStatusDot, and XDSAvatar via renderCell.' },
      { guidance: true, description: 'Set explicit width on every column using proportional() or pixel(). proportional(1) gives equal flex distribution with a 120px minimum that prevents columns from collapsing on narrow viewports. Omitting width skips the minimum.' },
      { guidance: false, description: 'Use a table for data without consistent columns — use a list or card layout for heterogeneous content.' },
      { guidance: false, description: 'Enable every plugin at once — add only the features your use case requires to keep the interface focused.' },
      { guidance: false, description: 'Omit width on text-heavy columns — without an explicit proportional() width they have no minimum and can squish to near-zero on mobile.' },
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

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Table',
  displayName: 'Table',
  group: 'Table',
  theming: {
    targets: [
      {className: 'xds-base-table'},
      {className: 'xds-table-row'},
      {className: 'xds-table-cell'},
      {className: 'xds-table-header-cell'},
    ],
  },
  components: [
    {
      name: 'XDSTable',
      displayName: 'Table',
      description:
        '带样式的数据驱动表格，支持密度、分隔线、悬停高亮、条纹行和命名插件。',
      props: [
        {
          name: 'data',
          type: 'T[]',
          description: '要渲染为行的数据项数组。',
        },
        {
          name: 'columns',
          type: 'XDSTableColumn<T>[]',
          description:
            '列定义。如果省略，将自动从数据对象键生成列。',
        },
        {
          name: 'idKey',
          type: '(keyof T & string) | ((item: T) => string | number)',
          description:
            '用于 React 协调的行键。传入属性名称字符串或函数。省略时回退到行索引。',
        },
        {
          name: 'density',
          type: "'compact' | 'balanced' | 'spacious'",
          description: '行密度，控制单元格内边距和字体大小。',
          default: "'balanced'",
        },
        {
          name: 'dividers',
          type: "'rows' | 'columns' | 'grid' | 'none'",
          description: '单元格之间渲染的分隔线样式。',
          default: "'rows'",
        },
        {
          name: 'isStriped',
          type: 'boolean',
          description: '为偶数行应用背景底色。',
          default: 'false',
        },
        {
          name: 'hasHover',
          type: 'boolean',
          description:
            '在指针设备上为行应用悬停高亮背景。',
          default: 'false',
        },
        {
          name: 'plugins',
          type: 'Record<string, TablePlugin<T>>',
          description:
            '通过转换管道扩展表格行为的命名插件。在内部转换为有序数组。',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description:
            '子元素模式 — 直接渲染 XDSTableRow/XDSTableCell，而非使用数据驱动渲染。',
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
      name: 'XDSBaseTable',
      isHiddenFromOverview: true,
      displayName: 'Base Table',
      description:
        '无样式的结构表格组件，配有插件转换管道和 components 属性，用于替换自定义行/单元格渲染器。',
      props: [
        {
          name: 'data',
          type: 'T[]',
          description: '要渲染为行的数据项数组。',
        },
        {
          name: 'columns',
          type: 'XDSTableColumn<T>[]',
          description:
            '列定义。如果省略，将自动从数据对象键生成列。',
        },
        {
          name: 'idKey',
          type: '(keyof T & string) | ((item: T) => string | number)',
          description:
            '用于 React 协调的行键。传入属性名称字符串或函数。省略时回退到行索引。',
        },
        {
          name: 'plugins',
          type: 'TablePlugin<T>[]',
          description:
            '作为顺序转换管道应用的有序插件数组。',
        },
        {
          name: 'components',
          type: '{Row?: ComponentType<TableRowComponentProps>; Cell?: ComponentType<TableCellComponentProps>; HeaderCell?: ComponentType<TableHeaderCellComponentProps>}',
          description:
            '行和单元格元素的组件覆盖。提供时，这些组件从插件转换中接收 xstyle。',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description:
            '子元素模式 — 在 tbody 中直接渲染行，而非使用数据驱动渲染。',
        },
        {
          name: 'tableProps',
          type: 'HTMLAttributes<HTMLTableElement>',
          description:
            '直接传递给根 <table> 元素的额外 HTML 属性。',
        },
      ],
    },
    {
      name: 'XDSTableRow',
      isHiddenFromOverview: true,
      displayName: 'Table Row',
      description:
        '<tr> 包装器，读取 XDSTableContext 以在 XDSTable 内部使用时应用条纹、悬停和分隔线样式。',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description: '行单元格元素。',
          required: true,
        },
      ],
    },
    {
      name: 'XDSTableCell',
      isHiddenFromOverview: true,
      displayName: 'Table Cell',
      description:
        '<td> 包装器，读取 XDSTableContext 以在 XDSTable 内部使用时应用密度内边距、字体大小和分隔线边框。',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description: '单元格内容。',
        },
      ],
    },
    {
      name: 'XDSTableHeaderCell',
      isHiddenFromOverview: true,
      displayName: 'Table Header Cell',
      description:
        '<th> 包装器，读取 XDSTableContext 以在 XDSTable 内部使用时应用密度内边距、半粗字重、次要文本颜色和分隔线边框。',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description: '表头单元格内容。',
        },
      ],
    },
    {
      name: 'useXDSTableSelection',
      displayName: 'useXDSTableSelection',
      description:
        '返回 TablePlugin 的 Hook，实现带复选框、全选和 aria-selected 的行选择功能。使用 React Context 实现独立的复选框重新渲染。',
      props: [
        {
          name: 'getIsItemSelected',
          type: '(item: T) => boolean',
          description: '返回给定项是否当前被选中。',
          required: true,
        },
        {
          name: 'onSelectItem',
          type: '(event: {item: T; isSelected: boolean}) => void',
          description:
            '当行复选框被切换时调用。isSelected 为新的期望状态。',
          required: true,
        },
        {
          name: 'onSelectAll',
          type: '(event: {isAllSelected: boolean}) => void',
          description: '当全选表头复选框被切换时调用。',
          required: true,
        },
        {
          name: 'getIsAllSelected',
          type: '() => boolean',
          description:
            '返回所有可选择项是否当前都被选中。',
          required: true,
        },
        {
          name: 'getIsIndeterminate',
          type: '() => boolean',
          description:
            '返回选择是否为部分选中（部分但非全部）。将全选复选框渲染为不确定状态。',
        },
        {
          name: 'getIsItemSelectable',
          type: '(item: T) => boolean',
          description:
            '返回行是否应显示复选框。不可选择的行在选择单元格中不渲染任何内容。',
          default: '() => true',
        },
        {
          name: 'getIsItemEnabled',
          type: '(item: T) => boolean',
          description:
            '返回行复选框是否可交互。禁用的行显示禁用状态的复选框。',
          default: '() => true',
        },
      ],
    },
    {
      name: 'useXDSTableSortable',
      displayName: 'useXDSTableSortable',
      description:
        '无头多列排序插件。用户拥有排序状态并提供回调。Shift+点击启用二级排序列。排序指示器自动渲染在表头单元格中。',
      props: [
        {
          name: 'sort',
          type: 'XDSTableSortState<TSortKey>',
          description:
            '当前排序状态。{sortKey, direction} 条目的有序数组。第一个条目是主排序。',
          required: true,
        },
        {
          name: 'onSortChange',
          type: '(sort: XDSTableSortState<TSortKey>) => void',
          description:
            '用户点击表头单元格更改排序时调用。',
          required: true,
        },
        {
          name: 'allowUnsortedState',
          type: 'boolean',
          description:
            '允许循环回到未排序状态。为 true 时：升序、降序、未排序。为 false 时：升序、降序、升序。',
          default: 'false',
        },
        {
          name: 'isMultiSortEnabled',
          type: 'boolean',
          description:
            '通过 Shift+点击启用多列排序。普通点击仍替换整个排序状态。',
          default: 'false',
        },
      ],
    },
    {
      name: 'useXDSTablePagination',
      displayName: 'useXDSTablePagination',
      description:
        '无头分页插件。支持客户端切片、服务器端分页和游标分页。自动渲染 XDSPagination 控件。',
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
          description:
            '所有页面的总项目数。用于计算总页数。',
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
    },
    {
      name: 'useXDSTableColumnSettings',
      displayName: 'useXDSTableColumnSettings',
      description:
        '无头列可见性和排序管理。提供筛选后的列、切换帮助方法和 XDSMultiSelector 选项。',
      props: [
        {
          name: 'columns',
          type: 'XDSColumnSettingsOption[]',
          description:
            '所有可用列及其设置 UI 的元数据。每个条目包含 key、label、可选的 isAlwaysVisible 和 group。',
          required: true,
        },
        {
          name: 'activeColumnKeys',
          type: 'string[]',
          description:
            '当前活动的列键，按显示顺序排列。',
          required: true,
        },
        {
          name: 'onChangeActiveColumnKeys',
          type: '(keys: string[]) => void',
          description: '活动列更改时调用。',
          required: true,
        },
      ],
    },
    {
      name: 'useXDSTableFiltering',
      isHiddenFromOverview: true,
      displayName: 'useXDSTableFiltering',
      description:
        '表格筛选插件，添加内联列过滤器（弹出式或内联控件）。与 useXDSTableFilterState 配合使用管理状态。',
      props: [
        {
          name: 'filters',
          type: 'XDSTableFilterState',
          description: '当前筛选状态——列键到筛选值的映射。',
          required: true,
        },
        {
          name: 'onFilterChange',
          type: '(columnKey: string, value: XDSTableFilterValue | null) => void',
          description: '用户更改筛选值时调用。null 清除筛选。',
          required: true,
        },
        {
          name: 'variant',
          type: "'popover' | 'inline'",
          description: '筛选控件的显示变体。',
          default: "'popover'",
        },
      ],
    },
    {
      name: 'useXDSTableFilterState',
      isHiddenFromOverview: true,
      displayName: 'useXDSTableFilterState',
      description:
        '表格筛选的受管状态 hook。返回当前筛选映射和 onChange 处理程序。将结果直接传递给 useXDSTableFiltering。',
      props: [
        {
          name: 'initialState',
          type: 'XDSTableFilterState',
          description: '可选的初始筛选状态映射。',
        },
      ],
    },
  ],
  usage: {
    description:
      'Table displays structured data in rows and columns with consistent dimensionality. It supports rich cell content, sorting, selection, pagination, and column management through a composable plugin system. Use Table for data sets with uniform structure; for simpler or inconsistent data, consider a list or card layout instead.',
    bestPractices: [
      { guidance: true, description: 'Use density and divider variants to match the information density and scanning needs of your data.' },
      { guidance: true, description: 'Compose rich cell content with XDS components like XDSBadge, XDSStatusDot, and XDSAvatar via renderCell.' },
      { guidance: false, description: 'Use a table for data without consistent columns — use a list or card layout for heterogeneous content.' },
      { guidance: false, description: 'Enable every plugin at once — add only the features your use case requires to keep the interface focused.' },
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
  description: 'Structured data in rows + columns w/ consistent dimensionality. Rich cell content, sorting, selection, pagination, column management via composable plugin system. Use for uniform data sets; for simpler/inconsistent data, use list/card layout instead.',
  usage: {
    bestPractices: [
      { guidance: true, description: 'Use density + divider variants to match information density + scanning needs.' },
      { guidance: true, description: 'Compose rich cell content w/ XDSBadge, XDSStatusDot, XDSAvatar via renderCell.' },
      { guidance: true, description: 'Set explicit width on every column via proportional() or pixel(). proportional(1) gives equal flex w/ 120px min preventing collapse on narrow viewports. Omitting width skips min.' },
      { guidance: false, description: 'Use table for data w/o consistent columns — use list/card layout for heterogeneous content instead.' },
      { guidance: false, description: 'Enable every plugin at once — add only features your use case requires to keep interface focused.' },
      { guidance: false, description: 'Omit width on text-heavy columns — w/o explicit proportional() width they have no min + can squish to near-zero on mobile.' },
    ],
  },
  components: [
    {
      name: 'XDSTable',
      displayName: 'Table',
      description: 'Styled data-driven table w/ density, dividers, hover highlight, striped rows + named plugin support.',
      propDescriptions: {
        data: 'Row data array.',
        columns: 'Column defs; auto-generated from data keys if omitted.',
        idKey: 'Row key for React reconciliation; property name string or fn. Falls back to index if omitted.',
        density: 'Row density controlling cell padding + font size.',
        dividers: 'Divider style between cells.',
        isStriped: 'Background wash on even rows.',
        hasHover: 'Hover highlight on pointer devices.',
        plugins: 'Named plugins extending behavior via transform pipeline; converted to ordered array internally.',
      },
    },
    {
      name: 'XDSBaseTable',
      isHiddenFromOverview: true,
      displayName: 'Base Table',
      description: 'Unstyled structural table w/ plugin transform pipeline + components prop for custom row/cell renderers.',
      propDescriptions: {
        data: 'Row data array.',
        columns: 'Column defs; auto-generated from data keys if omitted.',
        idKey: 'Row key for React reconciliation; property name string or fn. Falls back to index if omitted.',
        plugins: 'Ordered plugin array applied as sequential transform pipeline.',
        components: 'Component overrides for row/cell elements; receive xstyle from plugin transforms.',
        tableProps: 'Extra HTML attrs passed to root <table> element.',
      },
    },
    {
      name: 'XDSTableRow',
      isHiddenFromOverview: true,
      displayName: 'Table Row',
      description: '<tr> wrapper; reads XDSTableContext for striped/hover/divider styles inside XDSTable.',
    },
    {
      name: 'XDSTableCell',
      isHiddenFromOverview: true,
      displayName: 'Table Cell',
      description: '<td> wrapper; reads XDSTableContext for density padding, font size + divider borders inside XDSTable.',
    },
    {
      name: 'XDSTableHeaderCell',
      isHiddenFromOverview: true,
      displayName: 'Table Header Cell',
      description: '<th> wrapper; reads XDSTableContext for density padding, semibold weight, secondary text color + divider borders inside XDSTable.',
    },
    {
      name: 'useXDSTableSelection',
      displayName: 'useXDSTableSelection',
      description: 'Hook returning TablePlugin for row selection w/ checkboxes, select-all + aria-selected. Uses React Context for independent checkbox re-renders.',
      propDescriptions: {
        getIsItemSelected: 'Returns if item is selected **(required)**.',
        onSelectItem: 'Called on row checkbox toggle; isSelected = new desired state **(required)**.',
        onSelectAll: 'Called on select-all header checkbox toggle **(required)**.',
        getIsAllSelected: 'Returns if all selectable items are selected **(required)**.',
        getIsIndeterminate: 'Returns partial selection state; renders select-all checkbox as indeterminate.',
        getIsItemSelectable: 'Returns if row shows checkbox; non-selectable rows render nothing in selection cell.',
        getIsItemEnabled: 'Returns if row checkbox is interactive; disabled rows show disabled checkbox.',
      },
    },
    {
      name: 'useXDSTableSelectionState',
      displayName: 'useXDSTableSelectionState',
      description: 'State management companion for useXDSTableSelection. Handles disabled/selectable row filtering for select-all automatically — disabled rows frozen (preserved across select-all/deselect-all); non-selectable rows excluded.',
      propDescriptions: {
        data: 'Full data array rendered in table **(required)**.',
        idKey: 'Key extractor — property name or fn returning unique string ID **(required)**.',
        selectedKeys: 'Controlled set of selected item IDs **(required)**.',
        setSelectedKeys: 'Setter for controlled selected keys **(required)**.',
        getIsItemSelectable: 'Should row show checkbox? Non-selectable rows excluded from select-all.',
        getIsItemEnabled: 'Is row checkbox interactive? Disabled rows frozen — select-all preserves their state.',
      },
    },
    {
      name: 'useXDSTableSortable',
      displayName: 'useXDSTableSortable',
      description: 'Headless multi-sort plugin. Consumer owns sort state + callback. Shift+click for secondary sort. Sort indicators auto-render in header cells.',
      propDescriptions: {
        sort: 'Current sort state; ordered array of {sortKey, direction}. First entry = primary sort **(required)**.',
        onSortChange: 'Called on header cell click to change sort **(required)**.',
        allowUnsortedState: 'Allow cycling to unsorted. true: asc→desc→unsorted; false: asc→desc→asc.',
        isMultiSortEnabled: 'Enable multi-sort via Shift+click; regular click replaces entire sort state.',
      },
    },
    {
      name: 'useXDSTablePagination',
      displayName: 'useXDSTablePagination',
      description: 'Headless pagination plugin. Client-side slicing, server-side, or cursor-based. Auto-renders XDSPagination above/below/both.',
      propDescriptions: {
        page: 'Current page (1-based) **(required)**.',
        onPageChange: 'Called on page change **(required)**.',
        totalItems: 'Total items across all pages; calculates total page count.',
        totalPages: 'Total page count; use when you know pages but not item count.',
        hasMore: 'More pages exist; use for cursor-based pagination w/ unknown total.',
        pageSize: 'Items per page.',
        onPageSizeChange: 'Called on page size change; shows dropdown when provided w/ pageSizeOptions.',
        pageSizeOptions: 'Available page size options; shows selector when provided.',
        variant: 'Pagination control visual variant.',
        position: 'Render position relative to table.',
        align: 'Horizontal alignment of pagination controls.',
      },
    },
    {
      name: 'useXDSTableColumnSettings',
      displayName: 'useXDSTableColumnSettings',
      description: 'Headless column visibility + ordering management. Provides filtered columns, toggle helpers + XDSMultiSelector options for column picker UI.',
      propDescriptions: {
        columns: 'All available columns w/ metadata (key, label, optional isAlwaysVisible + group) **(required)**.',
        activeColumnKeys: 'Active column keys in display order; only these columns shown **(required)**.',
        onChangeActiveColumnKeys: 'Called on column toggle/reorder **(required)**.',
        defaultColumnKeys: 'Default column set for reset; omit = show all.',
      },
    },
    {
      name: 'useXDSTableFiltering',
      isHiddenFromOverview: true,
      displayName: 'useXDSTableFiltering',
      description: 'Table plugin adding inline column filters w/ popover/inline controls. Pairs w/ useXDSTableFilterState for managed state. Supports text, select, multi-select, date + number filter types via PowerSearch field defs.',
      propDescriptions: {
        filters: 'Current filter state — map from column key to filter value **(required)**.',
        onFilterChange: 'Called on filter change; null clears filter **(required)**.',
        variant: 'Filter control display variant.',
      },
    },
    {
      name: 'useXDSTableFilterState',
      isHiddenFromOverview: true,
      displayName: 'useXDSTableFilterState',
      description: 'Managed state hook for table filtering. Returns filter map + onChange handler; pass result directly to useXDSTableFiltering.',
      propDescriptions: {
        initialState: 'Optional initial filter state map.',
      },
    },
  ],
};
