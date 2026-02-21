# XDSCenter

Centers children horizontally and/or vertically using flexbox.

## Import

```tsx
import {XDSCenter} from '@xds/core/Center';
```

## Usage

```tsx
// Center both axes (default)
<XDSCenter width={300} height={200}>
  <Content />
</XDSCenter>

// Center horizontally only
<XDSCenter axis="horizontal">
  <Logo />
</XDSCenter>

// Inline centering for icons
<XDSCenter isInline>
  <XDSIcon icon={StarIcon} />
</XDSCenter>
```

## Theming

Themes can override `Center` styles via `ComponentStyles`:

```tsx
// In your theme definition
const theme: Theme = {
  // ...tokens...
  components: {
    center: {
      root: myStyles,
    },
  },
};
```

### Available surfaces

| Surface | Description           |
| ------- | --------------------- |
| `root`  | Root container styles |
