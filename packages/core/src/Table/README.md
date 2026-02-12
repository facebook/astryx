# /packages/core/src/Table

Table components for the XDS design system.

<!-- SYNC: When files in this directory change, update this document. -->

## Components

| File                   | Export             | Purpose                                                      |
| ---------------------- | ------------------ | ------------------------------------------------------------ |
| `XDSTable.tsx`         | `XDSTable`         | Styled, data-driven table with density, dividers, and hover  |
| `XDSBaseTable.tsx`     | `XDSBaseTable`     | Unstyled table with colgroup, plugin pipeline, children mode |
| `XDSBaseTableRow.tsx`  | `XDSBaseTableRow`  | Thin `<tr>` wrapper for XDSBaseTable children/streaming mode |
| `XDSBaseTableCell.tsx` | `XDSBaseTableCell` | Thin `<td>` wrapper for XDSBaseTable children/streaming mode |

## Utilities

| File             | Export             | Purpose                                      |
| ---------------- | ------------------ | -------------------------------------------- |
| `columnUtils.ts` | `proportional`     | Create a proportional (fr-like) column width |
| `columnUtils.ts` | `pixel`            | Create a fixed pixel column width            |
| `columnUtils.ts` | `generateColumns`  | Auto-generate columns from data object keys  |
| `columnUtils.ts` | `columnWidthToCSS` | Convert a ColumnWidth to a CSS width string  |

## Types

| File       | Export              | Purpose                                          |
| ---------- | ------------------- | ------------------------------------------------ |
| `types.ts` | `XDSTableColumn`    | Column definition (key, header, width, renderer) |
| `types.ts` | `ColumnWidth`       | Proportional or pixel width union                |
| `types.ts` | `TablePlugin`       | Plugin interface for transform-props pipeline    |
| `types.ts` | `XDSBaseTableProps` | Props for the unstyled base table                |

## Usage Patterns

### Data-driven table

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
  hover
/>
```

### Auto-generated columns

```tsx
// Columns auto-generated from data keys with capitalized headers
<XDSTable data={users} striped />
```

### Children mode (XDSBaseTable only)

```tsx
<XDSBaseTable>
  <XDSBaseTableRow>
    <XDSBaseTableCell>Alice</XDSBaseTableCell>
    <XDSBaseTableCell>30</XDSBaseTableCell>
  </XDSBaseTableRow>
</XDSBaseTable>
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

<XDSTable data={users} plugins={[highlightPlugin]} />;
```

## Architecture

Two-layer design: **XDSBaseTable** provides unstyled structure and the plugin pipeline. **XDSTable** wraps it and injects a styling plugin built from appearance props (`density`, `dividers`, `striped`, `hover`). This validates the plugin API by dogfooding it.

## Related Files

- `/packages/core/src/theme/tokens.stylex.ts` — Design tokens used by XDSTable styling
