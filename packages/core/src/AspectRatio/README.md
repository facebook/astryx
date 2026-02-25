# XDSAspectRatio

Maintains a specific aspect ratio for its children.

## Import

```tsx
import {XDSAspectRatio} from '@xds/core/AspectRatio';
```

## Usage

```tsx
<XDSAspectRatio ratio={16 / 9}>
  <img src="image.jpg" alt="Widescreen image" style={{objectFit: 'cover'}} />
</XDSAspectRatio>

// Square
<XDSAspectRatio ratio={1}>
  <Avatar />
</XDSAspectRatio>

// 4:3 video
<XDSAspectRatio ratio={4 / 3}>
  <video src="video.mp4" />
</XDSAspectRatio>
```

## Theming

Themes can override `AspectRatio` styles via `ComponentStyles`:

```tsx
// In your theme definition
const theme: Theme = {
  // ...tokens...
  components: {
    aspectRatio: {
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

| Prop       | Type           | Default | Description                                       |
| ---------- | -------------- | ------- | ------------------------------------------------- |
| `ratio`    | `number`       | —       | Aspect ratio as width/height (e.g., 16/9, 1)     |
| `children` | `ReactNode`    | —       | Content positioned absolutely to fill container   |
| `xstyle`   | `StyleXStyles` | —       | StyleX overrides for the container                |
