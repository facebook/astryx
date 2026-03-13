/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Table',
  description:
    'Data-driven table with rich cell content via renderCell. Compose cells with XDSBadge, XDSStatusDot, XDSText, XDSAvatar, and layout primitives. XDSBaseTable provides the unstyled structural core with a composable plugin pipeline.',
  features: [
    'Data-driven rendering — pass data + columns, rows render automatically',
    'Rich cell content via renderCell — compose XDS components (XDSBadge, XDSStatusDot, XDSText, XDSAvatar) inside table cells',
    'Children mode — compose XDSTableRow/XDSTableCell directly for manual layouts',
    'Plugin system — extend table behavior with composable transform plugins',
    'Density variants: compact, balanced, spacious',
    'Divider styles: rows, columns, grid, none',
    'Striped even rows and hover highlight via XDSTableContext',
    'Selection via useXDSTableSelection — checkboxes, select-all, aria-selected',
    'Body rows memoized with custom comparison — only changed rows re-render',
    'Auto-generated columns from data object keys when columns prop is omitted',
    'Themeable via className — target .xds-base-table, .xds-table-row, .xds-table-cell, .xds-table-header-cell',
  ],
  examples: [
    {
      label: 'Basic data-driven table',
      code: `<XDSTable
  data={users}
  columns={[
    {
      key: 'name',
      header: 'Name',
      renderCell: user => (
        <XDSHStack gap={2} align="center">
          <XDSAvatar name={user.name} size="small" />
          <XDSVStack gap={1}>
            <XDSText type="body" weight="semibold">
              {user.name}
            </XDSText>
            <XDSText type="supporting" color="secondary">
              {user.email}
            </XDSText>
          </XDSVStack>
        </XDSHStack>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: pixel(140),
      renderCell: user => (
        <XDSHStack gap={2} align="center">
          <XDSStatusDot status={user.isActive ? 'positive' : 'negative'} />
          <XDSBadge variant={user.isActive ? 'success' : 'error'}>
            {user.isActive ? 'Active' : 'Inactive'}
          </XDSBadge>
        </XDSHStack>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      renderCell: user => (
        <XDSText type="label" color="secondary">
          {user.role}
        </XDSText>
      ),
    },
  ]}
  density="balanced"
  dividers="rows"
  hasHover
/>`,
    },
    {
      label: 'Auto-generated columns',
      code: `// Columns auto-generated from data keys with capitalized headers
<XDSTable data={users} isStriped />`,
    },
    {
      label: 'Rich cell content with renderCell',
      code: `<XDSTable
  data={transactions}
  columns={[
    {
      key: 'description',
      header: 'Transaction',
      renderCell: tx => (
        <XDSVStack gap={1}>
          <XDSText weight="semibold">{tx.description}</XDSText>
          <XDSText type="supporting" color="secondary">
            {tx.date}
          </XDSText>
        </XDSVStack>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      renderCell: tx => (
        <XDSText
          weight="semibold"
          color={tx.amount > 0 ? 'positive' : 'negative'}>
          {tx.amount > 0 ? '+' : ''}
          {tx.amount.toFixed(2)}
        </XDSText>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      renderCell: tx => (
        <XDSBadge
          variant={
            tx.status === 'completed'
              ? 'success'
              : tx.status === 'pending'
                ? 'warning'
                : 'error'
          }>
          {tx.status}
        </XDSBadge>
      ),
    },
  ]}
  density="balanced"
  dividers="rows"
  hasHover
/>`,
    },
    {
      label: 'Children mode',
      code: `<XDSTable density="balanced" dividers="rows" isStriped hasHover>
  <XDSTableRow>
    <XDSTableCell>
      <XDSHStack gap={2} align="center">
        <XDSAvatar name="Alice" size="small" />
        <XDSText weight="semibold">Alice</XDSText>
      </XDSHStack>
    </XDSTableCell>
    <XDSTableCell>
      <XDSBadge variant="success">Active</XDSBadge>
    </XDSTableCell>
  </XDSTableRow>
</XDSTable>`,
    },
    {
      label: 'Selection plugin',
      code: `const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

const selectionPlugin = useXDSTableSelection<User>({
  getIsItemSelected: item => selectedKeys.has(item.id),
  onSelectItem: ({item, isSelected}) => {
    const next = new Set(selectedKeys);
    isSelected ? next.add(item.id) : next.delete(item.id);
    setSelectedKeys(next);
  },
  onSelectAll: ({isAllSelected}) => {
    setSelectedKeys(isAllSelected ? new Set(users.map(u => u.id)) : new Set());
  },
  getIsAllSelected: () => users.every(u => selectedKeys.has(u.id)),
  getIsIndeterminate: () => {
    const count = users.filter(u => selectedKeys.has(u.id)).length;
    return count > 0 && count < users.length;
  },
});

<XDSTable
  data={users}
  columns={columns}
  plugins={{selection: selectionPlugin}}
/>`,
    },
    {
      label: 'Custom plugin',
      code: `const highlightPlugin: TablePlugin<User> = {
  transformBodyRow(props, item) {
    if (item.isActive) {
      return {...props, styles: [...props.styles, activeRowStyle]};
    }
    return props;
  },
};

<XDSTable data={users} plugins={{highlight: highlightPlugin}} />`,
    },
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
    'Selection plugin sets aria-selected on selected body rows',
    'Select-all and per-row checkboxes use visually hidden labels ("Select all rows", "Select row") via isLabelHidden',
    'Non-selectable rows (getIsItemSelectable returns false) render no checkbox',
    'Disabled rows (getIsItemEnabled returns false) render a disabled checkbox',
  ],
  notes: [
    'Two-layer design: XDSBaseTable provides unstyled structure and the plugin pipeline; XDSTable wraps it with XDSTableContext and styled sub-components.',
    'Styling is owned by components (XDSTableRow, XDSTableCell, XDSTableHeaderCell), not by plugins — each reads XDSTableContext to apply density, dividers, striped, and hover styles.',
    'XDSTable accepts plugins as a named Record<string, TablePlugin<T>> and converts to an ordered array internally; XDSBaseTable accepts an ordered array directly.',
    'The selection plugin uses React Context so SelectAllCheckbox and SelectionRowCheckbox re-render independently from row content — only the context value updates when selection state changes.',
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
      ],
      examples: [
        {
          label: 'Data-driven',
          code: `<XDSTable
  data={users}
  columns={[
    {key: 'name', header: 'Name'},
    {key: 'email', header: 'Email', width: proportional(2)},
  ]}
  density="compact"
  dividers="grid"
  isStriped
  hasHover
/>`,
        },
        {
          label: 'Children mode',
          code: `<XDSTable density="balanced" dividers="rows">
  <XDSTableRow>
    <XDSTableCell>Alice</XDSTableCell>
    <XDSTableCell>30</XDSTableCell>
  </XDSTableRow>
</XDSTable>`,
        },
      ],
    },
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
      examples: [
        {
          label: 'With styled components',
          code: `<XDSBaseTable
  data={items}
  columns={columns}
  plugins={[myPlugin]}
  components={{Row: XDSTableRow, Cell: XDSTableCell, HeaderCell: XDSTableHeaderCell}}
/>`,
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
      examples: [
        {
          code: `<XDSTableRow>
  <XDSTableCell>Alice</XDSTableCell>
  <XDSTableCell>30</XDSTableCell>
</XDSTableRow>`,
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
      examples: [
        {
          code: `<XDSTableCell>Cell content</XDSTableCell>`,
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
      examples: [
        {
          code: `<XDSTableHeaderCell>Name</XDSTableHeaderCell>`,
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
      examples: [
        {
          label: 'Basic selection',
          code: `const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

const selectionPlugin = useXDSTableSelection<User>({
  getIsItemSelected: item => selectedKeys.has(item.id),
  onSelectItem: ({item, isSelected}) => {
    const next = new Set(selectedKeys);
    isSelected ? next.add(item.id) : next.delete(item.id);
    setSelectedKeys(next);
  },
  onSelectAll: ({isAllSelected}) => {
    setSelectedKeys(isAllSelected ? new Set(users.map(u => u.id)) : new Set());
  },
  getIsAllSelected: () => users.every(u => selectedKeys.has(u.id)),
  getIsIndeterminate: () => {
    const count = users.filter(u => selectedKeys.has(u.id)).length;
    return count > 0 && count < users.length;
  },
});

<XDSTable
  data={users}
  columns={columns}
  plugins={{selection: selectionPlugin}}
/>`,
        },
      ],
    },
  ],
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
    '主体行使用自定义比较进行记忆化 — 仅重新渲染更改的行',
    '省略 columns 属性时，自动从数据对象键生成列',
    '通过 className 实现主题化 — 目标选择器：.xds-base-table、.xds-table-row、.xds-table-cell、.xds-table-header-cell',
  ],
  examples: [
    {
      label: '基础数据驱动表格',
      code: `<XDSTable
  data={users}
  columns={[
    {
      key: 'name',
      header: 'Name',
      renderCell: user => (
        <XDSHStack gap={2} align="center">
          <XDSAvatar name={user.name} size="small" />
          <XDSVStack gap={1}>
            <XDSText type="body" weight="semibold">
              {user.name}
            </XDSText>
            <XDSText type="supporting" color="secondary">
              {user.email}
            </XDSText>
          </XDSVStack>
        </XDSHStack>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: pixel(140),
      renderCell: user => (
        <XDSHStack gap={2} align="center">
          <XDSStatusDot status={user.isActive ? 'positive' : 'negative'} />
          <XDSBadge variant={user.isActive ? 'success' : 'error'}>
            {user.isActive ? 'Active' : 'Inactive'}
          </XDSBadge>
        </XDSHStack>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      renderCell: user => (
        <XDSText type="label" color="secondary">
          {user.role}
        </XDSText>
      ),
    },
  ]}
  density="balanced"
  dividers="rows"
  hasHover
/>`,
    },
    {
      label: '自动生成列',
      code: `// Columns auto-generated from data keys with capitalized headers
<XDSTable data={users} isStriped />`,
    },
    {
      label: '通过 renderCell 实现丰富的单元格内容',
      code: `<XDSTable
  data={transactions}
  columns={[
    {
      key: 'description',
      header: 'Transaction',
      renderCell: tx => (
        <XDSVStack gap={1}>
          <XDSText weight="semibold">{tx.description}</XDSText>
          <XDSText type="supporting" color="secondary">
            {tx.date}
          </XDSText>
        </XDSVStack>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      renderCell: tx => (
        <XDSText
          weight="semibold"
          color={tx.amount > 0 ? 'positive' : 'negative'}>
          {tx.amount > 0 ? '+' : ''}
          {tx.amount.toFixed(2)}
        </XDSText>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      renderCell: tx => (
        <XDSBadge
          variant={
            tx.status === 'completed'
              ? 'success'
              : tx.status === 'pending'
                ? 'warning'
                : 'error'
          }>
          {tx.status}
        </XDSBadge>
      ),
    },
  ]}
  density="balanced"
  dividers="rows"
  hasHover
/>`,
    },
    {
      label: '子元素模式',
      code: `<XDSTable density="balanced" dividers="rows" isStriped hasHover>
  <XDSTableRow>
    <XDSTableCell>
      <XDSHStack gap={2} align="center">
        <XDSAvatar name="Alice" size="small" />
        <XDSText weight="semibold">Alice</XDSText>
      </XDSHStack>
    </XDSTableCell>
    <XDSTableCell>
      <XDSBadge variant="success">Active</XDSBadge>
    </XDSTableCell>
  </XDSTableRow>
</XDSTable>`,
    },
    {
      label: '选择插件',
      code: `const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

const selectionPlugin = useXDSTableSelection<User>({
  getIsItemSelected: item => selectedKeys.has(item.id),
  onSelectItem: ({item, isSelected}) => {
    const next = new Set(selectedKeys);
    isSelected ? next.add(item.id) : next.delete(item.id);
    setSelectedKeys(next);
  },
  onSelectAll: ({isAllSelected}) => {
    setSelectedKeys(isAllSelected ? new Set(users.map(u => u.id)) : new Set());
  },
  getIsAllSelected: () => users.every(u => selectedKeys.has(u.id)),
  getIsIndeterminate: () => {
    const count = users.filter(u => selectedKeys.has(u.id)).length;
    return count > 0 && count < users.length;
  },
});

<XDSTable
  data={users}
  columns={columns}
  plugins={{selection: selectionPlugin}}
/>`,
    },
    {
      label: '自定义插件',
      code: `const highlightPlugin: TablePlugin<User> = {
  transformBodyRow(props, item) {
    if (item.isActive) {
      return {...props, styles: [...props.styles, activeRowStyle]};
    }
    return props;
  },
};

<XDSTable data={users} plugins={{highlight: highlightPlugin}} />`,
    },
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
      examples: [
        {
          label: '数据驱动',
          code: `<XDSTable
  data={users}
  columns={[
    {key: 'name', header: 'Name'},
    {key: 'email', header: 'Email', width: proportional(2)},
  ]}
  density="compact"
  dividers="grid"
  isStriped
  hasHover
/>`,
        },
        {
          label: '子元素模式',
          code: `<XDSTable density="balanced" dividers="rows">
  <XDSTableRow>
    <XDSTableCell>Alice</XDSTableCell>
    <XDSTableCell>30</XDSTableCell>
  </XDSTableRow>
</XDSTable>`,
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
      examples: [
        {
          label: '使用带样式的组件',
          code: `<XDSBaseTable
  data={items}
  columns={columns}
  plugins={[myPlugin]}
  components={{Row: XDSTableRow, Cell: XDSTableCell, HeaderCell: XDSTableHeaderCell}}
/>`,
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
      examples: [
        {
          code: `<XDSTableRow>
  <XDSTableCell>Alice</XDSTableCell>
  <XDSTableCell>30</XDSTableCell>
</XDSTableRow>`,
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
      examples: [
        {
          code: `<XDSTableCell>Cell content</XDSTableCell>`,
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
      examples: [
        {
          code: `<XDSTableHeaderCell>Name</XDSTableHeaderCell>`,
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
      examples: [
        {
          label: '基础选择',
          code: `const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

const selectionPlugin = useXDSTableSelection<User>({
  getIsItemSelected: item => selectedKeys.has(item.id),
  onSelectItem: ({item, isSelected}) => {
    const next = new Set(selectedKeys);
    isSelected ? next.add(item.id) : next.delete(item.id);
    setSelectedKeys(next);
  },
  onSelectAll: ({isAllSelected}) => {
    setSelectedKeys(isAllSelected ? new Set(users.map(u => u.id)) : new Set());
  },
  getIsAllSelected: () => users.every(u => selectedKeys.has(u.id)),
  getIsIndeterminate: () => {
    const count = users.filter(u => selectedKeys.has(u.id)).length;
    return count > 0 && count < users.length;
  },
});

<XDSTable
  data={users}
  columns={columns}
  plugins={{selection: selectionPlugin}}
/>`,
        },
      ],
    },
  ],
};

/** @type {string} */
export const docsDense = `import{XDSTable,XDSBaseTable,XDSTableRow,XDSTableCell,XDSTableHeaderCell,useXDSTableSelection}from'@xds/core/Table' //data-driven table w/ plugins
C XDSTable //styled data-driven table w/ density, dividers, hover, striped, plugins
P data:T[] row data array | columns:XDSTableColumn<T>[] column defs, auto-generated from keys if omitted | idKey:(keyof T & string) | ((item: T) => string | number) row key for reconciliation, falls back to index | density:'compact' | 'balanced' | 'spacious'='balanced' cell padding+font size | dividers:'rows' | 'columns' | 'grid' | 'none'='rows' | isStriped:boolean='false' bg wash on even rows | hasHover:boolean='false' hover highlight on pointer devices | plugins:Record<string, TablePlugin<T>> named plugins, converted to ordered array internally | children:ReactNode children mode, render XDSTableRow/XDSTableCell directly | xstyle:StyleXStyles layout styles, must be stylex.create() value
X <XDSTable\\n  data={users}\\n  columns={[\\n    {key: 'name', header: 'Name'},\\n    {key: 'email', header: 'Email', width: proportional(2)},\\n  ]}\\n  density="compact"\\n  dividers="grid"\\n  isStriped\\n  hasHover\\n/> | <XDSTable density="balanced" dividers="rows">\\n  <XDSTableRow>\\n    <XDSTableCell>Alice</XDSTableCell>\\n    <XDSTableCell>30</XDSTableCell>\\n  </XDSTableRow>\\n</XDSTable>
C XDSBaseTable //unstyled structural table w/ plugin pipeline + components prop
P data:T[] row data array | columns:XDSTableColumn<T>[] column defs, auto-generated if omitted | idKey:(keyof T & string) | ((item: T) => string | number) row key, falls back to index | plugins:TablePlugin<T>[] ordered plugin array | components:{Row?: ComponentType<TableRowComponentProps>; Cell?: ComponentType<TableCellComponentProps>; HeaderCell?: ComponentType<TableHeaderCellComponentProps>} component overrides for row/cell | children:ReactNode children mode, render rows in tbody | tableProps:HTMLAttributes<HTMLTableElement> extra attrs on <table>
X <XDSBaseTable\\n  data={items}\\n  columns={columns}\\n  plugins={[myPlugin]}\\n  components={{Row: XDSTableRow, Cell: XDSTableCell, HeaderCell: XDSTableHeaderCell}}\\n/>
C XDSTableRow //<tr> wrapper, reads XDSTableContext for striped/hover/divider styles
P children:ReactNode! row cells
X <XDSTableRow>\\n  <XDSTableCell>Alice</XDSTableCell>\\n  <XDSTableCell>30</XDSTableCell>\\n</XDSTableRow>
C XDSTableCell //<td> wrapper, reads context for density/font/dividers
P children:ReactNode cell content
X <XDSTableCell>Cell content</XDSTableCell>
C XDSTableHeaderCell //<th> wrapper, reads context for density/semibold/secondary color/dividers
P children:ReactNode header content
X <XDSTableHeaderCell>Name</XDSTableHeaderCell>
C useXDSTableSelection //hook returning TablePlugin for row selection w/ checkboxes
P getIsItemSelected:(item: T) => boolean! | onSelectItem:(event: {item: T; isSelected: boolean}) => void! called on row checkbox toggle | onSelectAll:(event: {isAllSelected: boolean}) => void! called on select-all toggle | getIsAllSelected:() => boolean! | getIsIndeterminate:() => boolean partial selection, renders indeterminate checkbox | getIsItemSelectable:(item: T) => boolean='() => true' non-selectable rows render no checkbox | getIsItemEnabled:(item: T) => boolean='() => true' disabled rows show disabled checkbox
X const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());\\n\\nconst selectionPlugin = useXDSTableSelection<User>({\\n  getIsItemSelected: item => selectedKeys.has(item.id),\\n  onSelectItem: ({item, isSelected}) => {\\n    const next = new Set(selectedKeys);\\n    isSelected ? next.add(item.id) : next.delete(item.id);\\n    setSelectedKeys(next);\\n  },\\n  onSelectAll: ({isAllSelected}) => {\\n    setSelectedKeys(isAllSelected ? new Set(users.map(u => u.id)) : new Set());\\n  },\\n  getIsAllSelected: () => users.every(u => selectedKeys.has(u.id)),\\n  getIsIndeterminate: () => {\\n    const count = users.filter(u => selectedKeys.has(u.id)).length;\\n    return count > 0 && count < users.length;\\n  },\\n});\\n\\n<XDSTable\\n  data={users}\\n  columns={columns}\\n  plugins={{selection: selectionPlugin}}\\n/>
X <XDSTable\\n  data={users}\\n  columns={[\\n    {\\n      key: 'name',\\n      header: 'Name',\\n      renderCell: user => (\\n        <XDSHStack gap={2} align="center">\\n          <XDSAvatar name={user.name} size="small" />\\n          <XDSVStack gap={1}>\\n            <XDSText type="body" weight="semibold">\\n              {user.name}\\n            </XDSText>\\n            <XDSText type="supporting" color="secondary">\\n              {user.email}\\n            </XDSText>\\n          </XDSVStack>\\n        </XDSHStack>\\n      ),\\n    },\\n    {\\n      key: 'status',\\n      header: 'Status',\\n      width: pixel(140),\\n      renderCell: user => (\\n        <XDSHStack gap={2} align="center">\\n          <XDSStatusDot status={user.isActive ? 'positive' : 'negative'} />\\n          <XDSBadge variant={user.isActive ? 'success' : 'error'}>\\n            {user.isActive ? 'Active' : 'Inactive'}\\n          </XDSBadge>\\n        </XDSHStack>\\n      ),\\n    },\\n    {\\n      key: 'role',\\n      header: 'Role',\\n      renderCell: user => (\\n        <XDSText type="label" color="secondary">\\n          {user.role}\\n        </XDSText>\\n      ),\\n    },\\n  ]}\\n  density="balanced"\\n  dividers="rows"\\n  hasHover\\n/> | // Columns auto-generated from data keys with capitalized headers\\n<XDSTable data={users} isStriped /> | <XDSTable\\n  data={transactions}\\n  columns={[\\n    {\\n      key: 'description',\\n      header: 'Transaction',\\n      renderCell: tx => (\\n        <XDSVStack gap={1}>\\n          <XDSText weight="semibold">{tx.description}</XDSText>\\n          <XDSText type="supporting" color="secondary">\\n            {tx.date}\\n          </XDSText>\\n        </XDSVStack>\\n      ),\\n    },\\n    {\\n      key: 'amount',\\n      header: 'Amount',\\n      renderCell: tx => (\\n        <XDSText\\n          weight="semibold"\\n          color={tx.amount > 0 ? 'positive' : 'negative'}>\\n          {tx.amount > 0 ? '+' : ''}\\n          {tx.amount.toFixed(2)}\\n        </XDSText>\\n      ),\\n    },\\n    {\\n      key: 'status',\\n      header: 'Status',\\n      renderCell: tx => (\\n        <XDSBadge\\n          variant={\\n            tx.status === 'completed'\\n              ? 'success'\\n              : tx.status === 'pending'\\n                ? 'warning'\\n                : 'error'\\n          }>\\n          {tx.status}\\n        </XDSBadge>\\n      ),\\n    },\\n  ]}\\n  density="balanced"\\n  dividers="rows"\\n  hasHover\\n/> | <XDSTable density="balanced" dividers="rows" isStriped hasHover>\\n  <XDSTableRow>\\n    <XDSTableCell>\\n      <XDSHStack gap={2} align="center">\\n        <XDSAvatar name="Alice" size="small" />\\n        <XDSText weight="semibold">Alice</XDSText>\\n      </XDSHStack>\\n    </XDSTableCell>\\n    <XDSTableCell>\\n      <XDSBadge variant="success">Active</XDSBadge>\\n    </XDSTableCell>\\n  </XDSTableRow>\\n</XDSTable> | const highlightPlugin: TablePlugin<User> = {\\n  transformBodyRow(props, item) {\\n    if (item.isActive) {\\n      return {...props, styles: [...props.styles, activeRowStyle]};\\n    }\\n    return props;\\n  },\\n};\\n\\n<XDSTable data={users} plugins={{highlight: highlightPlugin}} />
A selection plugin sets aria-selected on selected body rows|select-all+per-row checkboxes use visually hidden labels ("Select all rows", "Select row") via isLabelHidden|non-selectable rows (getIsItemSelectable=false) render no checkbox|disabled rows (getIsItemEnabled=false) render disabled checkbox
N two-layer design: XDSBaseTable=unstyled structure+plugin pipeline; XDSTable wraps w/ XDSTableContext+styled sub-components|styling owned by components (XDSTableRow, XDSTableCell, XDSTableHeaderCell), not plugins, each reads XDSTableContext|XDSTable accepts plugins as Record<string, TablePlugin<T>>, converts to ordered array; XDSBaseTable accepts ordered array directly|selection plugin uses React Context so checkboxes re-render independently from row content|body rows memoized via React.memo w/ custom comparison; define columns outside component or memoize to avoid full re-renders|columns auto-generated from data keys via generateColumns(); widths via proportional() and pixel() helpers|tableProps on XDSBaseTable passes extra HTML attrs to <table> element`;
