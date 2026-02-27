# /packages/core/src/NavIcon

Icon container for navigation headers with circle and icon-only variants.

<!-- SYNC: When files in this directory change, update this document. -->

## Features

- **Shared** — used in both XDSTopNavTitle and XDSPageNavHeader
- **Two variants** — `circle` (36px accent background with 24px icon) and `icon` (24px icon only)
- **Auto-sized icons** — icons are automatically constrained to 24×24px

## Usage

```tsx
import {XDSNavIcon} from '@xds/core/NavIcon';
import {CubeIcon} from '@heroicons/react/24/solid';

// Circle variant (default) — 36px accent circle with 24px icon
<XDSTopNavTitle
  title="My App"
  logo={<XDSNavIcon icon={<CubeIcon />} />}
/>

// Icon-only variant — 24px icon, no background
<XDSTopNavTitle
  title="My App"
  logo={<XDSNavIcon icon={<CubeIcon />} variant="icon" />}
/>
```

## Components

- **XDSNavIcon** — Icon container with circle or icon-only presentation

## Props

### XDSNavIcon

| Prop      | Type                   | Default    | Description                                          |
| --------- | ---------------------- | ---------- | ---------------------------------------------------- |
| `icon`    | `ReactNode`            | —          | Icon element (required). Auto-sized to 24×24px.      |
| `variant` | `'circle' \| 'icon'`   | `'circle'` | `circle`: 36px accent background. `icon`: icon only. |

## Files

| File                  | Role  | Purpose                     |
| --------------------- | ----- | --------------------------- |
| `index.ts`            | Entry | Exports component and types |
| `XDSNavIcon.tsx`      | Core  | Icon container component    |
| `XDSNavIcon.test.tsx` | Test  | Unit tests                  |
