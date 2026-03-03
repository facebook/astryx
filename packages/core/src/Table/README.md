# Table

Data-driven table with rich cell content via `renderCell`. Compose cells with
XDSBadge, XDSStatusDot, XDSText, XDSAvatar, and layout primitives.

<!-- SYNC: When files in this directory change, update this document. -->

## Components

| File                     | Export               | Purpose                                                      |
| ------------------------ | -------------------- | ------------------------------------------------------------ |
| `XDSTable.tsx`           | `XDSTable`           | Styled, data-driven table with density, dividers, and hover  |
| `XDSBaseTable.tsx`       | `XDSBaseTable`       | Unstyled table with colgroup, plugin pipeline, children mode |
| `XDSTableRow.tsx`        | `XDSTableRow`        | `<tr>` wrapper with context-aware styling + `xstyle`         |
| `XDSTableCell.tsx`       | `XDSTableCell`       | `<td>` wrapper with context-aware styling + `xstyle`         |
| `XDSTableHeaderCell.tsx` | `XDSTableHeaderCell` | `<th>` wrapper with context-aware header styling + `xstyle`  |
| `XDSTableContext.ts`     | `XDSTableContext`    | Context for passing styling props to row/cell components     |

## Hooks

| File                       | Export                 | Purpose                                              |
| -------------------------- | ---------------------- | ---------------------------------------------------- |
| `useXDSTableSelection.tsx` | `useXDSTableSelection` | Selection plugin hook — checkboxes, select-all, aria |

## Utilities

| File             | Export             | Purpose                                      |
| ---------------- | ------------------ | -------------------------------------------- |
| `columnUtils.ts` | `proportional`     | Create a proportional (fr-like) column width |
| `columnUtils.ts` | `pixel`            | Create a fixed pixel column width            |
| `columnUtils.ts` | `generateColumns`  | Auto-generate columns from data object keys  |
| `columnUtils.ts` | `columnWidthToCSS` | Convert a ColumnWidth to a CSS width string  |

## Types

| File                       | Export                          | Purpose                                          |
| -------------------------- | ------------------------------- | ------------------------------------------------ |
| `types.ts`                 | `XDSTableColumn`                | Column definition (key, header, width, renderer) |
| `types.ts`                 | `ColumnWidth`                   | Proportional or pixel width union                |
| `types.ts`                 | `TablePlugin`                   | Plugin interface for transform-props pipeline    |
| `types.ts`                 | `XDSBaseTableProps`             | Props for the unstyled base table                |
| `types.ts`                 | `TableRowComponentProps`        | Props interface for Row components               |
| `types.ts`                 | `TableCellComponentProps`       | Props interface for Cell components              |
| `types.ts`                 | `TableHeaderCellComponentProps` | Props interface for HeaderCell components        |
| `useXDSTableSelection.tsx` | `UseXDSTableSelectionConfig`    | Config type for the selection hook               |

## Components

### XDSTable

Styled, data-driven table. Use `renderCell` on columns for rich cell content —
compose with XDSBadge, XDSStatusDot, XDSText, XDSAvatar, and layout primitives.

```tsx
<XDSTable
  data={users}
  columns={[
    {
      key: 'name',
      header: 'Name',
      renderCell: user => (
        <XDSStack direction="horizontal" gap="space2" align="center">
          <XDSAvatar name={user.name} size="small" />
          <XDSStack direction="vertical" gap="space1">
            <XDSText type="body" weight="semibold">
              {user.name}
            </XDSText>
            <XDSText type="supporting" color="secondary">
              {user.email}
            </XDSText>
          </XDSStack>
        </XDSStack>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: pixel(140),
      renderCell: user => (
        <XDSStack direction="horizontal" gap="space2" align="center">
          <XDSStatusDot status={user.isActive ? 'positive' : 'negative'} />
          <XDSBadge variant={user.isActive ? 'success' : 'error'}>
            {user.isActive ? 'Active' : 'Inactive'}
          </XDSBadge>
        </XDSStack>
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
/>
```

| Prop        | Type                                    | Default      | Description                                                    |
| ----------- | --------------------------------------- | ------------ | -------------------------------------------------------------- |
| `data`      | `T[]`                                   | —            | Array of data items                                            |
| `columns`   | `XDSTableColumn<T>[]`                   | —            | Column definitions with optional `renderCell` for rich content |
| `idKey`     | `string \| (item: T) => string`         | —            | Row key for React reconciliation                               |
| `density`   | `'compact' \| 'balanced' \| 'spacious'` | `'balanced'` | Row density                                                    |
| `dividers`  | `XDSTableDividers`                      | `'rows'`     | Divider style                                                  |
| `isStriped` | `boolean`                               | `false`      | Striped even rows                                              |
| `hasHover`  | `boolean`                               | `false`      | Hover highlight on rows                                        |
| `plugins`   | `Record<string, TablePlugin<T>>`        | —            | Named plugins to extend behavior                               |
| `children`  | `ReactNode`                             | —            | Children mode (manual rows)                                    |

### XDSBaseTable

Unstyled table with colgroup, plugin pipeline, and components prop for custom rendering.

```tsx
<XDSBaseTable
  data={items}
  columns={columns}
  plugins={[myPlugin]}
  components={{Row: XDSTableRow, Cell: XDSTableCell}}
/>
```

| Prop         | Type                            | Default | Description                            |
| ------------ | ------------------------------- | ------- | -------------------------------------- |
| `data`       | `T[]`                           | —       | Array of data items                    |
| `columns`    | `XDSTableColumn<T>[]`           | —       | Column definitions                     |
| `idKey`      | `string \| (item: T) => string` | —       | Row key for React reconciliation       |
| `plugins`    | `TablePlugin<T>[]`              | —       | Ordered plugins for transform pipeline |
| `components` | `{Row?, Cell?, HeaderCell?}`    | —       | Component overrides for table elements |
| `children`   | `ReactNode`                     | —       | Children mode                          |
| `tableProps` | `HTMLAttributes`                | —       | Additional attrs for `<table>` element |

### XDSTableRow

`<tr>` wrapper with context-aware styling and xstyle support.

```tsx
<XDSTableRow>
  <XDSTableCell>Alice</XDSTableCell>
  <XDSTableCell>30</XDSTableCell>
</XDSTableRow>
```

| Prop       | Type             | Default | Description     |
| ---------- | ---------------- | ------- | --------------- |
| `children` | `ReactNode`      | —       | Row cells       |
| `xstyle`   | `StyleXStyles[]` | —       | Style overrides |

### XDSTableCell

`<td>` wrapper with context-aware styling and xstyle support. Accepts any ReactNode
as children — compose rich content with XDS components like XDSBadge, XDSStatusDot,
XDSText, XDSAvatar, and layout primitives.

```tsx
<XDSTableCell>
  <XDSStack direction="horizontal" gap="space2" align="center">
    <XDSStatusDot status="positive" />
    <XDSText weight="semibold">Active</XDSText>
  </XDSStack>
</XDSTableCell>
```

| Prop       | Type                           | Default | Description     |
| ---------- | ------------------------------ | ------- | --------------- |
| `children` | `ReactNode`                    | —       | Cell content    |
| `xstyle`   | `StyleXStyles \| StyleXStyles` | —       | Style overrides |

### XDSTableHeaderCell

`<th>` wrapper with context-aware header styling and xstyle support.

```tsx
<XDSTableHeaderCell>Name</XDSTableHeaderCell>
```

| Prop       | Type                             | Default | Description     |
| ---------- | -------------------------------- | ------- | --------------- |
| `children` | `ReactNode`                      | —       | Header content  |
| `xstyle`   | `StyleXStyles \| StyleXStyles[]` | —       | Style overrides |

## Usage Patterns

### Rich cell content with renderCell

Use `renderCell` to compose XDS components inside table cells. This is the
recommended pattern for any table that displays more than plain text.

```tsx
const columns = [
  {
    key: 'transaction',
    header: 'Transaction',
    renderCell: item => (
      <XDSStack direction="vertical" gap="space1">
        <XDSText type="body" weight="semibold">
          {item.description}
        </XDSText>
        <XDSText type="supporting" color="secondary">
          {item.date}
        </XDSText>
      </XDSStack>
    ),
  },
  {
    key: 'amount',
    header: 'Amount',
    width: pixel(120),
    renderCell: item => (
      <XDSText
        type="body"
        weight="semibold"
        color={item.amount > 0 ? 'positive' : 'primary'}>
        {item.amount > 0 ? '+' : ''}
        {item.amount.toFixed(2)}
      </XDSText>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    width: pixel(140),
    renderCell: item => (
      <XDSStack direction="horizontal" gap="space2" align="center">
        <XDSStatusDot status={statusMap[item.status]} />
        <XDSBadge variant={badgeMap[item.status]}>{item.status}</XDSBadge>
      </XDSStack>
    ),
  },
];

<XDSTable data={transactions} columns={columns} hasHover dividers="rows" />;
```

### Data-driven table (plain text)

For simple tables where plain text is sufficient, columns default to `String(item[key])`:

```tsx
<XDSTable
  data={users}
  columns={[
    {key: 'name', header: 'Name'},
    {key: 'email', header: 'Email', width: proportional(2)},
    {key: 'age', header: 'Age', width: pixel(80)},
  ]}
  density="balanced"
  dividers="rows"
  hasHover
/>
```

### Auto-generated columns

```tsx
// Columns auto-generated from data keys with capitalized headers
<XDSTable data={users} isStriped />
```

### Children mode

For fully custom row layouts, use children mode with XDSTableRow and XDSTableCell:

```tsx
<XDSTable density="balanced" dividers="rows" isStriped hasHover>
  <XDSTableRow>
    <XDSTableCell>
      <XDSStack direction="horizontal" gap="space2" align="center">
        <XDSAvatar name="Alice" size="small" />
        <XDSText weight="semibold">Alice</XDSText>
      </XDSStack>
    </XDSTableCell>
    <XDSTableCell>
      <XDSBadge variant="success">Active</XDSBadge>
    </XDSTableCell>
  </XDSTableRow>
</XDSTable>
```

### Custom plugin

```tsx
const highlightPlugin: TablePlugin<User> = {
  transformBodyRow(props, item) {
    if (item.isActive) {
      return {...props, styles: [...props.styles, activeRowStyle]};
    }
    return props;
  },
};

<XDSTable data={users} plugins={{highlight: highlightPlugin}} />;
```

### Selection

```tsx
const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

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
  // Optional: hide checkbox for non-selectable rows
  getIsItemSelectable: item => item.role !== 'admin',
  // Optional: disable checkbox for locked rows
  getIsItemEnabled: item => !item.isLocked,
});

<XDSTable
  data={users}
  columns={columns}
  plugins={{selection: selectionPlugin}}
/>;
```

## Architecture

Two-layer design: **XDSBaseTable** provides unstyled structure, the plugin pipeline, and a `components` prop for rendering custom elements. **XDSTable** wraps it, providing `XDSTableContext` with appearance configuration and passing styled components (`XDSTableRow`, `XDSTableCell`, `XDSTableHeaderCell`) that read context to apply density, dividers, isStriped, and hasHover styles.

### Component-Based Styling

Styling is owned by components rather than a styling plugin:

- **XDSTableRow** — reads `XDSTableContext` for striped/hover/divider styles
- **XDSTableCell** — reads `XDSTableContext` for density/divider styles
- **XDSTableHeaderCell** — reads `XDSTableContext` for density/header/divider styles

Each component accepts `xstyle` for additional styles from plugin transforms (e.g., selected row background from the selection plugin).

### Plugin System

Plugins transform render props at each structural level (`transformTable`, `transformHeaderRow`, `transformBodyRow`, etc.). XDSTable accepts plugins as a named record (`Record<string, TablePlugin<T>>`), while XDSBaseTable accepts an ordered array. XDSTable converts the record to an array internally.

Plugins can also provide:

- `transformTableContext` — wrap the table output in context providers (used by selection to provide `SelectionContext`)
- Row transforms receive pre-rendered `children` (cells), allowing plugins to prepend/append elements

### Selection Architecture

The selection plugin uses React Context so that `SelectAllCheckbox` and `SelectionRowCheckbox` re-render independently from row content. The hook returns a stable plugin object via ref — only the context value updates when selection state changes. Selection cells render `XDSTableCell` and `XDSTableHeaderCell` directly, inheriting styling from `XDSTableContext`.

### Performance

Body rows are memoized via `React.memo` with a custom comparison function. When a single data item changes, only that row re-renders — unchanged rows are skipped. For this to work optimally, consumers should define `columns` outside the component or memoize them.

## Theming

Themes can override `Table` styles via `ComponentStyles`:

```tsx
// In your theme definition
const theme: Theme = {
  // ...tokens...
  components: {
    table: {
      root: myStyles,
    },
  },
};
```

### Available surfaces

| Surface | Description       |
| ------- | ----------------- |
| `root`  | Root table styles |
