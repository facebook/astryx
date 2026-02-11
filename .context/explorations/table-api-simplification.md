# XDSTable API Simplification

Exploring a simplified table API that reduces verbosity while maintaining configurability.

## Design Goals

1. **Minimal required props** - just `label` + `data` for the simplest case
2. **Single canonical form** - one pattern for columns (objects), no multiple syntaxes
3. **Smart defaults** - infer headers, widths, cell rendering from keys
4. **Plugins for features** - all behavior/features stay in `plugins` prop (no prop explosion)
5. **LLM-friendly** - predictable structure, easy to document
6. **RSC-friendly** - streaming mode with minimal config

## API Examples

### Simplest Table (auto-generated columns)

```tsx
<XDSTable
  label="User directory"
  data={[
    {name: 'Alice', email: 'alice@example.com', status: 'Active'},
    {name: 'Bob', email: 'bob@example.com', status: 'Pending'},
  ]}
/>
```

- Columns auto-generated from own enumerable properties of `data[0]`
- Headers default to capitalized keys
- Cell rendering by value type:
  - Primitives (string, number, boolean) → render as text
  - null/undefined → render "—" or empty
  - Date → locale formatted string
  - Objects/Arrays → require explicit `cell` renderer (warn in dev)
- Row IDs auto-detect `id` field, fallback to index

### With columns and plugins (features)

All table features are configured via `plugins`:

```tsx
<XDSTable
  label="User directory"
  data={users}
  columns={[
    {
      key: 'name',
      header: 'Full Name',
      width: proportional(2),
      cell: ({item}) => <XDSTableContentCell label={item.name} />,
    },
    {key: 'email', header: 'Email Address'},
    {key: 'status', width: pixel(100)},
  ]}
  plugins={{
    rowHeader: useXDSTableRowHeader({key: 'name'}),
    sortable: useXDSTableSortable({
      defaultSort: {key: 'name', direction: 'asc'},
    }),
    selection: useXDSTableSelection({
      selected: selectedIds,
      onChange: setSelectedIds,
    }),
    emptyState: useXDSTableEmptyState({content: <EmptyMessage />}),
  }}
/>
```

## Column Definition

```tsx
interface XDSTableColumn<T> {
  // Required
  key: string; // Object key to access, also used as column ID

  // Optional with defaults
  header?: string; // Default: capitalize(key)
  width?: ColumnWidth; // Default: proportional(1)
  type?: 'text' | 'number' | 'status' | 'action'; // Default: 'text'
  cell?: (props: {item: T}) => ReactNode; // Default: render item[key] as text

  // Advanced
  align?: 'start' | 'center' | 'end';
}
```

## Core Props

| Prop               | Type                                      | Required | Description                                                                               |
| ------------------ | ----------------------------------------- | -------- | ----------------------------------------------------------------------------------------- |
| `label`            | `string`                                  | Yes      | Screen reader label for table                                                             |
| `data`             | `T[]`                                     | No\*     | Array of row objects (\*required if no children)                                          |
| `columns`          | `Column<T>[]`                             | No\*     | Column definitions (\*required for streaming mode, auto-generated from data[0] otherwise) |
| `children`         | `ReactNode`                               | No\*     | Row components (\*mutually exclusive with `data`)                                         |
| `header`           | `ReactNode`                               | No       | Additional content in `<thead>` after column headers (e.g., filter row)                   |
| `footer`           | `ReactNode`                               | No       | Content in `<tfoot>` (e.g., load more, totals)                                            |
| `idKey`            | `keyof T`                                 | No       | Field to use as row ID (default: `'id'`, fallback: index)                                 |
| `density`          | `XDSTableDensity`                         | No       | Row height + padding (default: `'balanced'`)                                              |
| `verticalAlign`    | `'start' \| 'center'`                     | No       | Cell content alignment (default: based on density)                                        |
| `dividers`         | `'none' \| 'rows' \| 'columns' \| 'grid'` | No       | Table divider lines (default: `'rows'`)                                                   |
| `striped`          | `boolean`                                 | No       | Alternating row backgrounds (default: `false`)                                            |
| `highlightOnHover` | `boolean`                                 | No       | Highlight rows on hover (default: `false`)                                                |
| `plugins`          | `XDSTablePlugins`                         | No       | Feature plugins (see below)                                                               |
| `xstyle`           | `StyleXStyles`                            | No       | Custom styles                                                                             |

**Important**: Column headers are always rendered from the `columns` prop. The `header` prop is for _additional_ content (like filter rows), not column definitions.

### Header and Footer Slots

The table renders:

1. `<thead>`: Column headers (from `columns`) + optional `header` content
2. `<tbody>`: Row data (from `data` or `children`)
3. `<tfoot>`: Optional `footer` content

**Smart wrapping**: If header/footer content is not an `XDSTableRow`, the table wraps it in `<tr><td colSpan="all">...</td></tr>`.

```tsx
// Simple footer - auto-wrapped in row/cell
<XDSTable
  columns={columns}
  footer={<XDSStream endpoint="/api/users" />}
>
  {users.map(user => ...)}
</XDSTable>

// Custom footer row structure
<XDSTable
  columns={columns}
  footer={
    <XDSTableRow>
      <XDSTableCell>Total</XDSTableCell>
      <XDSTableCell />
      <XDSTableCell>{formatCurrency(sum)}</XDSTableCell>
    </XDSTableRow>
  }
>
  {users.map(user => ...)}
</XDSTable>

// Header with filter row
<XDSTable
  columns={columns}
  header={
    <XDSTableRow>
      {columns.map(col => (
        <XDSTableCell key={col.key}>
          <FilterInput column={col.key} />
        </XDSTableCell>
      ))}
    </XDSTableRow>
  }
>
  {users.map(user => ...)}
</XDSTable>
```

## Appearance Props

Visual styling is controlled via simple top-level props rather than a complex variant system.

### Density

Controls row height and padding. Vertical alignment defaults based on density but can be overridden.

```tsx
type XDSTableDensity =
  | 'compact' // single line, tight padding → default verticalAlign: 'center'
  | 'balanced' // two lines, medium padding → default verticalAlign: 'center'
  | 'spacious' // flexible height, generous padding → default verticalAlign: 'start'
  | SpacingToken // direct spacing token for custom padding
  | {
      rowHeight?: 'single' | 'double' | 'auto' | number;
      padding?: SpacingToken;
    };
```

```tsx
// Preset (most common)
<XDSTable density="balanced" ... />

// Spacing token
<XDSTable density={4} ... />

// Full custom
<XDSTable density={{ rowHeight: 64, padding: 3 }} verticalAlign="center" ... />
```

### Dividers, Striping, and Alignment

| Prop               | Type                                      | Default          | Description                       |
| ------------------ | ----------------------------------------- | ---------------- | --------------------------------- |
| `dividers`         | `'none' \| 'rows' \| 'columns' \| 'grid'` | `'rows'`         | Table divider lines               |
| `striped`          | `boolean`                                 | `false`          | Alternating row background colors |
| `highlightOnHover` | `boolean`                                 | `false`          | Highlight rows on mouse hover     |
| `verticalAlign`    | `'start' \| 'center'`                     | Based on density | Cell content vertical alignment   |

```tsx
<XDSTable
  label="User directory"
  data={users}
  density="compact"
  dividers="grid"
  striped
/>
```

### Competitive Analysis

| Framework    | Size/Density                            | Borders                                                  | Striping         |
| ------------ | --------------------------------------- | -------------------------------------------------------- | ---------------- |
| Mantine      | `horizontalSpacing`, `verticalSpacing`  | `withTableBorder`, `withColumnBorders`, `withRowBorders` | `striped`        |
| Radix Themes | `size` ("1" \| "2" \| "3")              | —                                                        | —                |
| Ant Design   | `size` ("small" \| "middle" \| "large") | `bordered`                                               | —                |
| Material UI  | `size` ("small" \| "medium")            | —                                                        | —                |
| Carbon       | `size` ("xs" - "xl")                    | —                                                        | `useZebraStyles` |

Our approach: semantic `density` presets that bundle row height + padding + alignment, with escape hatches for custom values. Dividers and striping as simple boolean props.

## Plugins

All features are configured via the `plugins` prop. Each plugin is created with a hook:

| Plugin               | Hook                            | Description                          |
| -------------------- | ------------------------------- | ------------------------------------ |
| `rowHeader`          | `useXDSTableRowHeader`          | Column to use as row header for a11y |
| `sortable`           | `useXDSTableSortable`           | Enable column sorting                |
| `selection`          | `useXDSTableSelection`          | Row selection (multi)                |
| `selection`          | `useXDSTableSingleSelection`    | Row selection (single)               |
| `activation`         | `useXDSTableRowActivation`      | Row click/activation                 |
| `rowStyling`         | `useXDSTableRowStyling`         | Conditional row styles/props         |
| `emptyState`         | `useXDSTableEmptyState`         | Empty state content                  |
| `virtualization`     | `useXDSTableVirtualization`     | Virtual scrolling                    |
| `expansion`          | `useXDSTableRowExpansion`       | Expandable rows                      |
| `expansion`          | `useXDSTableTreeRows`           | Tree/hierarchical rows               |
| `filtering`          | `useXDSTableFiltering`          | Column filtering                     |
| `dragAndDropRows`    | `useXDSTableDragAndDropRows`    | Row reordering                       |
| `dragAndDropColumns` | `useXDSTableDragAndDropColumns` | Column reordering                    |
| `columnResize`       | `useXDSTableColumnResize`       | Resizable columns                    |
| `stickyColumns`      | `useXDSTableStickyColumns`      | Sticky columns                       |

### Row Styling Plugin

For conditional per-row styling based on data:

```tsx
plugins={{
  rowStyling: useXDSTableRowStyling({
    getRowProps: (item) => ({
      xstyle: [
        item.status === 'error' && styles.errorRow,
        item.isArchived && styles.dimmed,
      ],
      'data-testid': `row-${item.id}`,
    }),
  }),
}}
```

## Migration from Current API

Current:

```tsx
const dataSource = useMemo(
  () =>
    xdsTableStandardDataSource(DATA, {
      getStableUniqueID: item => item.id,
    }),
  [],
);

const rowHeader = useXDSTableRowHeader<Item, ColumnKey>({key: 'name'});

<XDSTable
  columns={columns}
  dataSource={dataSource}
  label="Users"
  plugins={{rowHeader}}
/>;
```

New:

```tsx
<XDSTable
  label="Users"
  data={DATA}
  columns={columns}
  plugins={{
    rowHeader: useXDSTableRowHeader({key: 'name'}),
  }}
/>
```

**Changes:**

- `dataSource` → `data` (raw array)
- `label` → `label` (clearer purpose)
- `getStableUniqueID` → auto-derived from `item.id` (or use `idKey` prop)
- Plugins remain the same pattern

## Open Questions

1. Should `columns` support array-of-arrays data with numeric indices?
2. Should there be a `caption` prop for visible table titles?
3. How does virtualization interact with the `data` prop for lazy loading?

## Recipes

Common table configurations for copy-paste:

### Compact Data-Dense Table

```tsx
<XDSTable
  label="Transaction log"
  data={transactions}
  density="compact"
  highlightOnHover
/>
```

### Spreadsheet-Style

```tsx
<XDSTable
  label="Budget spreadsheet"
  data={cells}
  density="compact"
  dividers="grid"
/>
```

### Card-Like Rows

```tsx
<XDSTable
  label="Project list"
  data={projects}
  density="spacious"
  dividers="none"
  striped
/>
```

### Sortable with Selection

```tsx
<XDSTable
  label="User management"
  data={users}
  columns={[
    {key: 'name', header: 'Name'},
    {key: 'email', header: 'Email'},
    {key: 'role', header: 'Role'},
  ]}
  plugins={{
    rowHeader: useXDSTableRowHeader({key: 'name'}),
    sortable: useXDSTableSortable({
      defaultSort: {key: 'name', direction: 'asc'},
    }),
    selection: useXDSTableSelection({selected, onChange: setSelected}),
  }}
/>
```

## LLM & DevX Considerations

### Plugin Discoverability

All plugins follow the `useXDSTable*` naming convention. The `plugins` prop is typed to show available keys:

```tsx
plugins?: {
  rowHeader?: ReturnType<typeof useXDSTableRowHeader>;
  sortable?: ReturnType<typeof useXDSTableSortable>;
  selection?: ReturnType<typeof useXDSTableSelection | typeof useXDSTableSingleSelection>;
  // ... etc
}
```

IDE autocomplete on the `plugins` object keys reveals all available plugins.

### Defaults Summary

| Prop               | Default                                                 |
| ------------------ | ------------------------------------------------------- |
| `columns`          | Auto-generated from `data[0]` keys                      |
| `idKey`            | `'id'` field, fallback to array index                   |
| `density`          | `'balanced'`                                            |
| `verticalAlign`    | `'center'` for compact/balanced, `'start'` for spacious |
| `dividers`         | `'rows'`                                                |
| `striped`          | `false`                                                 |
| `highlightOnHover` | `false`                                                 |

## Streaming API (RSC Compatible)

For server streaming and RSC compatibility, use `columns` prop (data-only) with compositional body:

```tsx
const columns = [
  {key: 'name', header: 'Name', width: proportional(2), type: 'content'},
  {key: 'email', header: 'Email'},
  {key: 'status', header: 'Status', width: pixel(100), type: 'status'},
];

<XDSTable
  label="Users"
  columns={columns} // Required upfront for streaming
  density="compact"
  dividers="grid">
  <Suspense fallback={<XDSTableLoadingRow count={10} />}>
    <UserRowsFromServer />
  </Suspense>
</XDSTable>;

// Server Component - streams rows
async function UserRowsFromServer() {
  const users = await fetchUsers();
  return users.map(user => (
    <XDSTableRow key={user.id}>
      <XDSTableCell>{user.name}</XDSTableCell>
      <XDSTableCell>{user.email}</XDSTableCell>
      <XDSTableCell>
        <XDSBadge>{user.status}</XDSBadge>
      </XDSTableCell>
    </XDSTableRow>
  ));
}
```

### Why Columns Upfront?

Column definitions must be provided via props (not children) because:

1. **No upward registration** - Context flows downward; children can't inform parent of column structure
2. **Loading state awareness** - Skeleton rows need column widths/types from context
3. **Single canonical form** - One pattern for columns (design goal #2)
4. **RSC compatible** - No effects or callbacks needed for column registration

**Tradeoff**: Column headers/definitions can't be streamed. This is acceptable because:

- Column definitions are small/fast
- Body cells (the bulk of data) still stream
- Lazy cells can fetch on intersection if needed

### Data vs Streaming Mode

| Aspect               | `data` prop                        | `children` (streaming)            |
| -------------------- | ---------------------------------- | --------------------------------- |
| **Use case**         | Simple tables, full plugin support | RSC, streaming, custom structure  |
| **Server streaming** | ❌ Full array needed               | ✅ Row components stream          |
| **Auto-columns**     | ✅ From object keys                | ❌ `columns` prop required        |
| **Plugins**          | ✅ Full support                    | ⚠️ Some have split responsibility |

The `data` prop and `children` are mutually exclusive.

### Compositional Components

| Component      | Description  |
| -------------- | ------------ |
| `XDSTableRow`  | Row wrapper  |
| `XDSTableCell` | Cell wrapper |

That's it. No `XDSTableHead`, `XDSTableBody`, or `XDSTableFoot` - the table handles structure internally:

- Header renders from `columns` prop
- `children` become body rows
- `footer` prop for footer content

## Loading Patterns

Use generic XDS primitives rather than table-specific loading components. This avoids component proliferation and enables reuse across the design system.

### Skeleton Rows

```tsx
// Use generic XDSSkeleton in table cells
function SkeletonRows({columns, count}) {
  return Array.from({length: count}, (_, i) => (
    <XDSTableRow key={i}>
      {columns.map(col => (
        <XDSTableCell key={col.key}>
          <XDSSkeleton width={col.type === 'status' ? 80 : undefined} />
        </XDSTableCell>
      ))}
    </XDSTableRow>
  ));
}
```

### Infinite Scroll / Load More

Use `footer` prop with generic `XDSIntersectionTrigger`:

```tsx
<XDSTable
  label="Users"
  columns={columns}
  footer={
    hasMore && (
      <XDSIntersectionTrigger onIntersect={loadMore} rootMargin="200px">
        {isLoading && <XDSTableLoadingRow />}
      </XDSIntersectionTrigger>
    )
  }>
  {users.map(user => (
    <XDSTableRow key={user.id}>...</XDSTableRow>
  ))}
</XDSTable>
```

### Lazy Cell Data

For cells that fetch data on visibility:

```tsx
<XDSTableCell>
  <XDSLazy
    fetch={() => fetchScore(user.id)}
    fallback={<XDSSkeleton width={60} />}>
    {score => <span>{score}</span>}
  </XDSLazy>
</XDSTableCell>
```

### XDSTableLoadingRow

A convenience component that renders skeleton cells matching the column structure:

```tsx
// Reads columns from context, renders appropriate skeletons
<XDSTableLoadingRow />

// Multiple rows
<XDSTableLoadingRow count={10} />

// With explicit columns (when context unavailable)
<XDSTableLoadingRow columns={columns} count={5} />
```

Internally uses `XDSSkeleton` with column-aware widths/shapes based on column `type`.

### Generic Primitives

See [RSC Utilities](./rsc-utilities.md) for full documentation on:

| Component                | Description                                             |
| ------------------------ | ------------------------------------------------------- |
| `XDSSkeleton`            | Loading placeholder (shimmer animation)                 |
| `XDSIntersectionTrigger` | Fires callback when element enters viewport             |
| `XDSLazy`                | Lazy load wrapper - fetches data on intersection        |
| `XDSStream`              | RSC streaming - fetches flight response on intersection |
| `XDSSpinner`             | Loading spinner                                         |

## RSC Streaming

For React Server Component infinite scroll, use `XDSStream` after the initial rows:

```tsx
const columns = [
  {key: 'name', header: 'Name', width: proportional(2)},
  {key: 'email', header: 'Email'},
  {key: 'status', header: 'Status', width: pixel(100)},
];

async function UsersPage() {
  const {users, nextCursor, hasMore} = await fetchUsers({limit: 20});

  return (
    <XDSTable label="Users" columns={columns}>
      {users.map(user => (
        <XDSTableRow key={user.id}>
          <XDSTableCell>{user.name}</XDSTableCell>
          <XDSTableCell>{user.email}</XDSTableCell>
          <XDSTableCell>{user.status}</XDSTableCell>
        </XDSTableRow>
      ))}

      {hasMore && (
        <XDSStream
          endpoint="/api/users"
          params={{cursor: nextCursor}}
          loading={<XDSTableLoadingRow />}
        />
      )}
    </XDSTable>
  );
}
```

The server endpoint returns rows + the next `XDSStream` trigger, creating a recursive chain for infinite scroll. See [RSC Utilities](./rsc-utilities.md) for implementation details.

## Plugin Architecture

Plugins work via render transforms. Each plugin can wrap or modify renders at various levels:

```tsx
type XDSTablePlugin<TItem, TColumnKey> = {
  // Table structure
  transformTable?: (render) => render;
  transformLayout?: (render) => render;
  transformColumns?: (columns) => columns;

  // Header
  transformHeaderSegment?: (render) => render;
  transformHeaderRow?: (render) => render;
  transformHeaderCell?: (render) => render;

  // Body
  transformBodyRow?: (render) => render;
  transformBodyCell?: (render) => render;

  // Footer
  transformFooterSegment?: (render) => render;
  transformFooterRow?: (render) => render;
  transformFooterCell?: (render) => render;

  // Loading state
  transformLoadingRow?: (render) => render;
  transformLoadingCell?: (render) => render;
};
```

### How Plugins Compose

Plugin hooks return plugin objects. The table composes all transforms:

```tsx
// Each hook returns a plugin object
const sortable = useXDSTableSortable({ ... });
// → { transformHeaderCell: (render) => renderWithSortIcon, ... }

const selection = useXDSTableSelection({ ... });
// → { transformBodyRow: (render) => renderWithCheckbox, transformColumns: (cols) => [checkboxCol, ...cols] }

// Table composes them
plugins={{ sortable, selection }}
// → All transforms are chained together
```

### Plugins in Streaming Mode

Some plugins work with children, some require `data`:

| Plugin           | Data Mode | Streaming Mode | Notes                                                    |
| ---------------- | --------- | -------------- | -------------------------------------------------------- |
| `rowHeader`      | ✅        | ✅             | Via `<XDSTableRow rowHeader>`                            |
| `sortable`       | ✅        | ⚠️ Split       | Table handles UI/indicators, caller handles row ordering |
| `selection`      | ✅        | ✅             | Via context + `<XDSTableRow selectable>`                 |
| `activation`     | ✅        | ✅             | Via `<XDSTableRow onActivate>`                           |
| `emptyState`     | ✅        | ✅             | Via conditional children                                 |
| `virtualization` | ✅        | ⚠️ Possible    | Needs explicit `rowHeight` + `rowCount` props            |
| `expansion`      | ✅        | ✅             | Via `<XDSTableRow expandable>`                           |
| `rowStyling`     | ✅        | ✅             | Props on `<XDSTableRow>`                                 |
| `dragAndDrop`    | ✅        | ✅ Deferred    | Rows register refs on mount                              |
| `stickyColumns`  | ✅        | ✅             | Via column config `{ key: 'name', sticky: true }`        |

### Streaming Mode Details

**Sortable (split responsibility):**

```tsx
// Table provides: sort state context, column indicators, onSort callbacks
// Caller provides: correctly ordered rows

const [sort, setSort] = useState({key: 'name', direction: 'asc'});
const sortedUsers = useMemo(
  () => [...users].sort(comparator(sort.key, sort.direction)),
  [users, sort],
);

<XDSTable
  columns={columns}
  plugins={{sortable: useXDSTableSortable({sort, onSort: setSort})}}>
  {sortedUsers.map(user => (
    <XDSTableRow key={user.id}>...</XDSTableRow>
  ))}
</XDSTable>;
```

**Virtualization (with explicit dimensions):**

```tsx
// rowHeight and rowCount enable virtualization without full data knowledge
<XDSTable
  columns={columns}
  rowHeight={48}
  rowCount={1000}
  plugins={{virtualization: useXDSTableVirtualization({maxHeight: 400})}}>
  {/* Only visible rows render */}
</XDSTable>
```

**Drag and Drop (deferred registration):**

```tsx
// Rows register refs with context on mount
// By user interaction time, all refs are available
<XDSTable
  columns={columns}
  plugins={{dragAndDrop: useXDSTableDragAndDropRows({onReorder})}}>
  {items.map(item => (
    <XDSTableRow key={item.id} draggable>
      ...
    </XDSTableRow>
  ))}
</XDSTable>
```

## RSC Plugin Pattern

For React Server Components, plugins can be provided via a wrapper that composes context providers. This avoids upward registration and keeps plugin configuration declarative.

### API

```tsx
<XDSTablePlugins
  sortable={{
    Plugin: XDSTableSortablePlugin,
    defaultSort: {key: 'name', direction: 'asc'},
  }}
  selection={{
    Plugin: XDSTableSelectionPlugin,
    selected: ids,
    onChange: setIds,
  }}>
  <XDSTable label="Users" columns={columns}>
    <UserRows /> {/* Server Component */}
  </XDSTable>
</XDSTablePlugins>
```

### How It Works

**1. XDSTablePlugins composes nested providers:**

```tsx
function XDSTablePlugins({sortable, selection, children}) {
  let result = children;

  if (selection) {
    const {Plugin, ...props} = selection;
    result = <Plugin {...props}>{result}</Plugin>;
  }
  if (sortable) {
    const {Plugin, ...props} = sortable;
    result = <Plugin {...props}>{result}</Plugin>;
  }

  return result;
}
```

**2. Each plugin component is a client boundary:**

```tsx
'use client';

function XDSTableSortablePlugin({defaultSort, onSort, children}) {
  const sortable = useXDSTableSortable({defaultSort, onSort});
  return (
    <SortableContext.Provider value={sortable}>
      {children}
    </SortableContext.Provider>
  );
}
```

**3. Table consumes via context:**

```tsx
function XDSTable({children}) {
  const sortable = useContext(SortableContext);
  const selection = useContext(SelectionContext);
  // Apply plugin transforms...
}
```

### Benefits

- **Server-renderable config**: Plugin props are plain objects, serializable
- **No upward registration**: Plugins known upfront, composed top-down
- **Clean client boundaries**: Each plugin is its own `'use client'` component
- **Composable**: Add/remove plugins declaratively
