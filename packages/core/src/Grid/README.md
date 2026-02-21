# XDSGrid

CSS Grid-based layout with responsive auto-fit support.

## Import

```tsx
import {XDSGrid, XDSGridSpan} from '@xds/core/Grid';
```

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
