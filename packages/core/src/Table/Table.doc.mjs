/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Table',
  description:
    'Data-driven table with rich cell content via renderCell. Compose cells with XDSBadge, XDSStatusDot, XDSText, XDSAvatar, and layout primitives. XDSBaseTable provides the unstyled structural core with a composable plugin pipeline.',
  showcase: {
    aspectRatio: 4 / 3,
    code: '<XDSTable data={[]} columns={[]} />',
  },
  keywords: ["table","datatable","datagrid","spreadsheet","sorting","virtualized","columns","rows","selection","pinning"],
  features: [
    'Data-driven rendering — pass data + columns, rows render automatically',
    'Rich cell content via renderCell — compose XDS components (XDSBadge, XDSStatusDot, XDSText, XDSAvatar) inside table cells',
    'Children mode — compose XDSTableRow/XDSTableCell directly for manual layouts',
    'Plugin system — extend table behavior with composable transform plugins',
    'Density variants: compact, balanced, spacious',
    'Divider styles: rows, columns, grid, none',
    'Column alignment: start (default), center, end — per-column via align prop',
    'Row vertical alignment: middle (default), top, bottom — table-level via verticalAlign prop',
    'Striped even rows and hover highlight via XDSTableContext',
    'Selection via useXDSTableSelectionState + useXDSTableSelection — checkboxes, select-all, disabled row handling',
    'Sorting via useXDSTableSortable — single or multi-column sort with header indicators',
    'Pagination via useXDSTablePagination — client-side, server-side, or cursor-based with auto-rendered controls',
    'Column visibility via useXDSTableColumnSettings — toggle, reorder, and reset columns with XDSMultiSelector integration',
    'Column resize via useXDSTableColumnResize — drag-to-resize column headers with min/max constraints and proportional-preserving behavior',
    'Body rows memoized with custom comparison — only changed rows re-render',
    'Auto-generated columns from data object keys when columns prop is omitted',
    'Themeable via className — target .xds-base-table, .xds-table-row, .xds-table-cell, .xds-table-header-cell',
  ],  theming: {
    targets: [
      {className: 'xds-base-table'},
      {className: 'xds-table-row'},
      {className: 'xds-table-cell'},
      {className: 'xds-table-header-cell'},
    ],
  },
  accessibility: [
    'Selection plugin sets aria-selected on selected body rows',
    'Select-all and per-row checkboxes use visually hidden labels ("Select all rows", "Select row") via isLabelHidden',
    'Non-selectable rows (getIsItemSelectable returns false) render no checkbox',
    'Disabled rows (getIsItemEnabled returns false) render a disabled checkbox',
  ],
  notes: [
    'Two-layer design: XDSBaseTable provides unstyled structure and the plugin pipeline; XDSTable wraps it with XDSTableContext and styled sub-components.',
    'Styling is owned by components (XDSTableRow, XDSTableCell, XDSTableHeaderCell), not by plugins — each reads XDSTableContext to apply density, dividers, striped, and hover styles.',
    'XDSTable accepts plugins as a named Record<string, TablePlugin<T>> and converts to an ordered array internally; XDSBaseTable accepts an ordered array directly.',
    'The selection plugin uses useSyncExternalStore so only the row whose selection state changed re-renders. useXDSTableSelectionState manages the selection set and handles disabled/selectable row filtering for select-all automatically.',
    'useXDSTableColumnResize — drag-to-resize column headers. Proportional columns preserve their ratio when neighboring columns are resized. Pass columnWidths state and onColumnResizeEnd to control width persistence. Use minWidth/maxWidth for per-resize constraints.',
    'Body rows are memoized via React.memo with a custom comparison. For optimal performance, define columns outside the component or memoize them to avoid triggering full re-renders.',
    'Columns can be auto-generated from data keys using generateColumns(); column widths are expressed as proportional (fr-like) or fixed pixel values via the proportional() and pixel() helpers.',
    'tableProps on XDSBaseTable passes additional HTML attributes directly to the <table> element.',
  ],
  components: [
    {
      name: 'XDSTable',
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
  ],
  usage: {
    summary: 'Displays information with consistent data dimensionality in a grid format.',
    content: `## When to use

- Simple tables for read-only data display.
- Data tables with column controls.
- Complex tables with control toolbars and detail panes.

## When NOT to use

- Consider lists or card-lists for simpler or inconsistent data.

## Best practices

- Do: Use row activation to show details in a side panel.
- Don't: Use row expansion for details (breaks column alignment).
- Layout presets: space-optimized (40px rows), balanced (56px default), content-optimized (dynamic height).
- Cell types: Content (main with media), Text, Value (right-aligned numbers), Status (dot + label).`,
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
  description:
    '数据驱动的表格，通过 renderCell 实现丰富的单元格内容。使用 XDSBadge、XDSStatusDot、XDSText、XDSAvatar 和布局基础组件组合单元格。XDSBaseTable 提供无样式的结构核心，配合可组合的插件管道。',
  features: [
    '数据驱动渲染 — 传入数据和列定义，行自动渲染',
    '通过 renderCell 实现丰富的单元格内容 — 在表格单元格中组合 XDS 组件（XDSBadge、XDSStatusDot、XDSText、XDSAvatar）',
    '子元素模式 — 直接组合 XDSTableRow/XDSTableCell 实现手动布局',
    '插件系统 — 通过可组合的转换插件扩展表格行为',
    '密度变体：紧凑、均衡、宽松',
    '分隔线样式：行、列、网格、无',
    '通过 XDSTableContext 实现偶数行条纹和悬停高亮',
    '通过 useXDSTableSelection 实现选择功能 — 复选框、全选、aria-selected',
    '通过 useXDSTableSortable 实现排序 — 单列或多列排序，表头指示器',
    '通过 useXDSTablePagination 实现分页 — 客户端、服务器端或游标分页，自动渲染控件',
    '通过 useXDSTableColumnSettings 实现列可见性 — 切换、排序和重置列',
    '通过 useXDSTableColumnResize 实现列调整 — 拖拽表头调整宽度，支持最小/最大约束和等比例调整',
    '主体行使用自定义比较进行记忆化 — 仅重新渲染更改的行',
    '省略 columns 属性时，自动从数据对象键生成列',
    '通过 className 实现主题化 — 目标选择器：.xds-base-table、.xds-table-row、.xds-table-cell、.xds-table-header-cell',
  ],
  theming: {
    targets: [
      {className: 'xds-base-table'},
      {className: 'xds-table-row'},
      {className: 'xds-table-cell'},
      {className: 'xds-table-header-cell'},
    ],
  },
  accessibility: [
    '选择插件在选中的主体行上设置 aria-selected',
    '全选和每行复选框通过 isLabelHidden 使用视觉隐藏标签（"Select all rows"、"Select row"）',
    '不可选择的行（getIsItemSelectable 返回 false）不渲染复选框',
    '禁用的行（getIsItemEnabled 返回 false）渲染禁用状态的复选框',
  ],
  notes: [
    '双层设计：XDSBaseTable 提供无样式结构和插件管道；XDSTable 使用 XDSTableContext 和带样式的子组件对其进行包装。',
    '样式由组件（XDSTableRow、XDSTableCell、XDSTableHeaderCell）控制，而非插件 — 每个组件读取 XDSTableContext 来应用密度、分隔线、条纹和悬停样式。',
    'XDSTable 接受命名的 Record<string, TablePlugin<T>> 格式的插件，并在内部转换为有序数组；XDSBaseTable 直接接受有序数组。',
    '选择插件使用 React Context，使 SelectAllCheckbox 和 SelectionRowCheckbox 独立于行内容重新渲染 — 仅当选择状态变化时更新 context 值。',
    'useXDSTableColumnResize — 拖拽表头调整列宽。比例列在调整相邻列时保持比例。传入 columnWidths 状态和 onColumnResizeEnd 控制宽度持久化。使用 minWidth/maxWidth 设置每次调整的约束范围。',
    '主体行通过带有自定义比较的 React.memo 进行记忆化。为获得最佳性能，请在组件外部定义列或对其进行记忆化，以避免触发全量重新渲染。',
    '可以使用 generateColumns() 从数据键自动生成列；列宽使用 proportional() 和 pixel() 辅助函数表达为比例值（类似 fr）或固定像素值。',
    'XDSBaseTable 上的 tableProps 将额外的 HTML 属性直接传递给 <table> 元素。',
  ],
  components: [
    {
      name: 'XDSTable',
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
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'Data-driven table w/ rich cell content via renderCell. Compose cells w/ XDSBadge, XDSStatusDot, XDSText, XDSAvatar, layout primitives. XDSBaseTable provides unstyled structural core w/ composable plugin pipeline.',
  features: [
    'Data-driven rendering; pass data + columns, rows render automatically',
    'Rich cell content via renderCell; compose XDS components inside cells',
    'Children mode; compose XDSTableRow/XDSTableCell directly for manual layouts',
    'Plugin system; extend behavior w/ composable transform plugins',
    'Density variants: compact, balanced, spacious',
    'Divider styles: rows, columns, grid, none',
    'Striped even rows + hover highlight via XDSTableContext',
    'Selection via useXDSTableSelectionState + useXDSTableSelection — checkboxes, select-all, disabled row handling',
    'Sorting via useXDSTableSortable — single/multi-column sort w/ header indicators',
    'Pagination via useXDSTablePagination — client-side, server-side, cursor-based w/ auto-rendered controls',
    'Column visibility via useXDSTableColumnSettings — toggle, reorder, reset w/ XDSMultiSelector integration',
    'Body rows memoized w/ custom comparison; only changed rows re-render',
    'Auto-generated columns from data object keys when columns omitted',
    'Themeable via className; target .xds-base-table, .xds-table-row, .xds-table-cell, .xds-table-header-cell',
  ],
  notes: [
    'Two-layer design: XDSBaseTable=unstyled structure + plugin pipeline; XDSTable wraps w/ XDSTableContext + styled sub-components.',
    'Styling owned by components (XDSTableRow, XDSTableCell, XDSTableHeaderCell), not plugins; each reads XDSTableContext.',
    'XDSTable accepts plugins as Record<string, TablePlugin<T>>, converts to ordered array; XDSBaseTable accepts ordered array directly.',
    'Selection plugin uses React Context; checkboxes re-render independently from row content.',
    'Body rows memoized via React.memo w/ custom comparison; define columns outside component or memoize to avoid full re-renders.',
    'Columns auto-generated from data keys via generateColumns(); widths via proportional() + pixel() helpers.',
    'tableProps on XDSBaseTable passes extra HTML attrs to <table> element.',
  ],
  accessibility: [
    'Selection plugin sets aria-selected on selected body rows.',
    'Select-all + per-row checkboxes use visually hidden labels ("Select all rows", "Select row") via isLabelHidden.',
    'Non-selectable rows (getIsItemSelectable=false) render no checkbox.',
    'Disabled rows (getIsItemEnabled=false) render disabled checkbox.',
  ],
  components: [
    {
      name: 'XDSTable',
      description: 'Styled data-driven table w/ density, dividers, hover, striped rows, named plugin support.',
      propDescriptions: {
        data: 'Array of data items to render as rows.',
        columns: 'Column defs; auto-generated from data keys if omitted.',
        idKey: 'Row key for React reconciliation; property name or fn. Falls back to index.',
        density: 'Row density controlling cell padding + font size.',
        dividers: 'Divider style between cells.',
        isStriped: 'Background wash on even rows.',
        hasHover: 'Hover highlight on pointer devices.',
        plugins: 'Named plugins extending behavior via transform pipeline; converted to ordered array.',
        children: 'Children mode; render XDSTableRow/XDSTableCell directly.',
        xstyle: 'StyleX layout styles; must be stylex.create() value.',
      },
    },
    {
      name: 'XDSBaseTable',
      description: 'Unstyled structural table w/ plugin transform pipeline + components prop for custom row/cell renderers.',
      propDescriptions: {
        data: 'Array of data items to render as rows.',
        columns: 'Column defs; auto-generated from data keys if omitted.',
        idKey: 'Row key for React reconciliation; property name or fn. Falls back to index.',
        plugins: 'Ordered plugin array applied as sequential transform pipeline.',
        components: 'Component overrides for row/cell elements; receive xstyle from plugin transforms.',
        children: 'Children mode; render rows in tbody directly.',
        tableProps: 'Extra HTML attrs passed to root <table> element.',
      },
    },
    {
      name: 'XDSTableRow',
      description: '<tr> wrapper; reads XDSTableContext for striped/hover/divider styles.',
      propDescriptions: {
        children: 'Row cell elements.',
      },
    },
    {
      name: 'XDSTableCell',
      description: '<td> wrapper; reads XDSTableContext for density padding, font size, divider borders.',
      propDescriptions: {
        children: 'Cell content.',
      },
    },
    {
      name: 'XDSTableHeaderCell',
      description: '<th> wrapper; reads XDSTableContext for density padding, semibold weight, secondary color, dividers.',
      propDescriptions: {
        children: 'Header cell content.',
      },
    },
    {
      name: 'useXDSTableSelection',
      description: 'Hook returning TablePlugin for row selection w/ checkboxes, select-all, aria-selected. Uses React Context for independent checkbox re-renders.',
      propDescriptions: {
        getIsItemSelected: 'Returns whether item is selected.',
        onSelectItem: 'Called on row checkbox toggle; isSelected = new desired state.',
        onSelectAll: 'Called on select-all header checkbox toggle.',
        getIsAllSelected: 'Returns whether all selectable items are selected.',
        getIsIndeterminate: 'Returns partial selection state; renders indeterminate checkbox.',
        getIsItemSelectable: 'Returns whether row shows checkbox; non-selectable rows render nothing.',
        getIsItemEnabled: 'Returns whether row checkbox is interactive; disabled rows show disabled checkbox.',
      },
    },
    {
      name: 'useXDSTableSortable',
      description: 'Headless multi-sort plugin. Consumer owns sort state + callback. Shift+click for secondary sort. Sort indicators auto-render in header cells.',
      propDescriptions: {
        sort: 'Current sort state; ordered array of {sortKey, direction} entries.',
        onSortChange: 'Called on header click to change sort.',
        allowUnsortedState: 'Allow cycling to unsorted. true: asc>desc>unsorted. false: asc>desc>asc.',
        isMultiSortEnabled: 'Enable multi-sort via Shift+click. Regular click replaces sort state.',
      },
    },
    {
      name: 'useXDSTablePagination',
      description: 'Headless pagination plugin. Client-side slicing, server-side, or cursor-based. Auto-renders XDSPagination above/below/both.',
      propDescriptions: {
        page: 'Current page (1-based).',
        onPageChange: 'Called on page change.',
        totalItems: 'Total items across all pages.',
        pageSize: 'Items per page. Default 10.',
        variant: "Pagination variant: 'pages'|'count'|'compact'|'dots'|'none'.",
        position: "Render position: 'below'|'above'|'both'|'none'.",
      },
    },
    {
      name: 'useXDSTableColumnSettings',
      description: 'Headless column visibility/ordering. Provides filtered columns, toggle helpers, XDSMultiSelector options.',
      propDescriptions: {
        columns: 'All available columns w/ metadata (key, label, isAlwaysVisible, group).',
        activeColumnKeys: 'Active column keys in display order.',
        onChangeActiveColumnKeys: 'Called on column toggle/reorder.',
        defaultColumnKeys: 'Default column set for reset. Omit = show all.',
      },
    },
  ],
};