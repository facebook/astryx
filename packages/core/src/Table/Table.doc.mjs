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
        <XDSHStack gap="space2" align="center">
          <XDSAvatar name={user.name} size="small" />
          <XDSVStack gap="space1">
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
        <XDSHStack gap="space2" align="center">
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
        <XDSVStack gap="space1">
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
      <XDSHStack gap="space2" align="center">
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
