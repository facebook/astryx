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

## Props

| Prop       | Type                                         | Default  | Description                                        |
| ---------- | -------------------------------------------- | -------- | -------------------------------------------------- |
| `axis`     | `'both' \| 'horizontal' \| 'vertical'`       | `'both'` | Which direction(s) to center                       |
| `width`    | `number \| string`                            | —        | Container width (px or CSS value)                  |
| `height`   | `number \| string`                            | —        | Container height (px or CSS value)                 |
| `isInline` | `boolean`                                    | `false`  | Use inline-flex (useful for text/icons)            |
| `children` | `ReactNode`                                  | —        | Content to center                                  |
| `xstyle`   | `StyleXStyles`                               | —        | StyleX overrides                                   |
