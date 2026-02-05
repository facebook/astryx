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
<XDSCenter inline>
  <XDSIcon icon={StarIcon} />
</XDSCenter>
```
