# XDSDivider

Visual separator with optional label, using XDS design tokens.

## Import

```tsx
import {XDSDivider} from '@xds/core/Divider';
```

## Usage

```tsx
// Simple horizontal divider
<XDSDivider />

// With label
<XDSDivider label="or" />

// Vertical divider
<XDSDivider orientation="vertical" />

// Strong variant (more visible)
<XDSDivider variant="strong" />

// Full bleed (extends to container edges)
<XDSDivider isFullBleed />
```

## Theming

Themes can override `Divider` styles via `ComponentStyles`:

```tsx
// In your theme definition
const theme: Theme = {
  // ...tokens...
  components: {
    divider: {
      root: myStyles,
      line: myStyles,
      label: myStyles,
    },
  },
};
```

### Available surfaces

| Surface | Description           |
| ------- | --------------------- |
| `root`  | Root container styles |
| `line`  | Divider line styles   |
| `label` | Label text styles     |

## Props

| Prop          | Type                           | Default        | Description                                     |
| ------------- | ------------------------------ | -------------- | ----------------------------------------------- |
| `orientation` | `'horizontal' \| 'vertical'`   | `'horizontal'` | Orientation of the divider                      |
| `label`       | `ReactNode`                    | —              | Optional label centered on the divider          |
| `variant`     | `'subtle' \| 'strong'`         | `'subtle'`     | Visual weight of the divider line               |
| `isFullBleed` | `boolean`                      | `false`        | Extend to container edges with negative margins |
| `xstyle`      | `StyleXStyles`                 | —              | StyleX overrides                                |
