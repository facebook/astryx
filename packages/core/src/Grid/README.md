# XDSGrid

CSS Grid-based layout with responsive auto-fit support.

## Import

```tsx
import {XDSGrid, XDSGridSpan} from '@xds/core/Grid';
```

### XDSGrid

Grid container with fixed or responsive auto-fit columns.

```tsx
<XDSGrid columns={3} gap="space4">
  <Item />
  <Item />
  <Item />
</XDSGrid>
```

| Prop            | Type             | Default     | Description                                    |
| --------------- | ---------------- | ----------- | ---------------------------------------------- |
| `columns`       | `number`         | —           | Maximum number of columns                      |
| `minChildWidth`  | `number`         | —           | Min item width in px (enables auto-fit)        |
| `width`         | `number \| string` | —         | Container width                                |
| `height`        | `number \| string` | —         | Container height                               |
| `gap`           | `SpacingScale`   | —           | Spacing between all items                      |
| `rowGap`        | `SpacingScale`   | —           | Row spacing (overrides gap)                    |
| `columnGap`     | `SpacingScale`   | —           | Column spacing (overrides gap)                 |
| `align`         | `GridAlignment`  | `'stretch'` | Vertical alignment of items                    |
| `justify`       | `GridAlignment`  | `'stretch'` | Horizontal alignment of items                  |
| `xstyle`        | `StyleXStyles`   | —           | StyleX overrides                               |
| `children`      | `ReactNode`      | —           | Grid content                                   |

### XDSGridSpan

Grid item that spans multiple columns or rows.

```tsx
<XDSGrid columns={3} gap="space4">
  <XDSGridSpan columns={2}>Wide item</XDSGridSpan>
  <div>Normal item</div>
</XDSGrid>
```

| Prop       | Type                 | Default | Description                              |
| ---------- | -------------------- | ------- | ---------------------------------------- |
| `columns`  | `number \| 'full'`   | —       | Columns to span ('full' = entire row)    |
| `rows`     | `number`             | —       | Rows to span                             |
| `xstyle`   | `StyleXStyles`       | —       | StyleX overrides                         |
| `children` | `ReactNode`          | —       | Content                                  |

## Usage

```tsx
// Fixed 3-column grid
<XDSGrid columns={3} gap="space4">
  <Item />
  <Item />
  <Item />
</XDSGrid>

// Responsive auto-fit (items wrap based on min width)
<XDSGrid minChildWidth={200} gap="space4">
  <Card />
  <Card />
  <Card />
</XDSGrid>

// Auto-fit with max columns cap
<XDSGrid minChildWidth={200} columns={4} gap="space4">
  <Card />
</XDSGrid>

// Grid item spanning multiple columns
<XDSGrid columns={3} gap="space4">
  <XDSGridSpan span={2}>Wide item</XDSGridSpan>
  <div>Normal item</div>
</XDSGrid>

// Dense grid (e.g. color swatches, icon grids, compact controls)
<XDSGrid columns={6} gap="space2">
  {items.map(item => (
    <XDSButton key={item.id} label={item.label} icon={item.icon} variant="ghost" size="sm" />
  ))}
</XDSGrid>
```

Use `XDSGrid` for any grid layout instead of manual CSS grid (`display: 'grid'`,
`gridTemplateColumns`). It handles gap tokens and works with any column count.

## Theming

Themes can override `Grid` styles via `ComponentStyles`:

```tsx
// In your theme definition
const theme: Theme = {
  // ...tokens...
  components: {
    grid: {
      root: myStyles,
    },
  },
};
```

### Available surfaces

| Surface | Description                |
| ------- | -------------------------- |
| `root`  | Root grid container styles |
