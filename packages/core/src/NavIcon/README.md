# NavIcon

Circular icon container for navigation headers.

<!-- SYNC: When files in this directory change, update this document. -->

## Import

```tsx
import {XDSNavIcon} from '@xds/core/NavIcon';
```

## Features

- **Shared** — used in both XDSTopNavTitle and XDSPageNavHeader
- **Accent background** — uses `--color-accent` with `--color-icon-on-media` contrast
- **Fixed size** — renders at the medium (`--size-md`) design token size

## Usage

```tsx
import {XDSNavIcon} from '@xds/core/NavIcon';
import {CubeIcon} from '@heroicons/react/24/solid';

// In top navigation
<XDSTopNavTitle
  title="My App"
  logo={<XDSNavIcon icon={<CubeIcon style={{width: 16, height: 16}} />} />}
/>

// In side navigation
<XDSPageNavHeader
  icon={<XDSNavIcon icon={<CubeIcon style={{width: 16, height: 16}} />} />}
  title="My App"
/>
```

## Components

- **XDSNavIcon** — Circular icon container with accent background

## Props

### XDSNavIcon

| Prop   | Type        | Default | Description             |
| ------ | ----------- | ------- | ----------------------- |
| `icon` | `ReactNode` | —       | Icon element (required) |

## Files

| File                  | Role  | Purpose                     |
| --------------------- | ----- | --------------------------- |
| `index.ts`            | Entry | Exports component and types |
| `XDSNavIcon.tsx`      | Core  | Circular icon container     |
| `XDSNavIcon.test.tsx` | Test  | Unit tests                  |
