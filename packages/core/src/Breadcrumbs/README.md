# Breadcrumbs

A navigation breadcrumb trail showing the user's location within a hierarchy.

## Exports

| Export                   | Type      | Description                 |
| ------------------------ | --------- | --------------------------- |
| `XDSBreadcrumbs`         | Component | Container nav + ol wrapper  |
| `XDSBreadcrumbItem`      | Component | Individual breadcrumb item  |
| `XDSBreadcrumbsProps`    | Type      | Props for XDSBreadcrumbs    |
| `XDSBreadcrumbItemProps` | Type      | Props for XDSBreadcrumbItem |

## XDSBreadcrumbs Props

| Prop          | Type           | Default        | Description                          |
| ------------- | -------------- | -------------- | ------------------------------------ |
| `children`    | `ReactNode`    | —              | XDSBreadcrumbItem elements           |
| `separator`   | `ReactNode`    | `'/'`          | Separator between items (decorative) |
| `xstyle`      | `StyleXStyles` | —              | StyleX styles for the nav container  |
| `label`       | `string`       | `'Breadcrumb'` | aria-label for the nav landmark      |
| `data-testid` | `string`       | —              | Test ID for the nav element          |

## XDSBreadcrumbItem Props

| Prop          | Type                      | Default | Description                                 |
| ------------- | ------------------------- | ------- | ------------------------------------------- |
| `children`    | `ReactNode`               | —       | Label content                               |
| `href`        | `string`                  | —       | URL for the breadcrumb link                 |
| `onClick`     | `(e: MouseEvent) => void` | —       | Click handler                               |
| `isCurrent`   | `boolean`                 | `false` | Marks as current page (aria-current="page") |
| `startIcon`   | `ReactNode`               | —       | Icon rendered before the label              |
| `data-testid` | `string`                  | —       | Test ID for the list item                   |

## Usage

```tsx
import {XDSBreadcrumbs, XDSBreadcrumbItem} from '@xds/core/Breadcrumbs';

// Basic usage
<XDSBreadcrumbs>
  <XDSBreadcrumbItem href="/">Home</XDSBreadcrumbItem>
  <XDSBreadcrumbItem href="/projects">Projects</XDSBreadcrumbItem>
  <XDSBreadcrumbItem isCurrent>My Project</XDSBreadcrumbItem>
</XDSBreadcrumbs>

// Auto-detect current (last item becomes current automatically)
<XDSBreadcrumbs>
  <XDSBreadcrumbItem href="/">Home</XDSBreadcrumbItem>
  <XDSBreadcrumbItem>Settings</XDSBreadcrumbItem>
</XDSBreadcrumbs>

// Custom separator
<XDSBreadcrumbs separator="›">
  <XDSBreadcrumbItem href="/">Home</XDSBreadcrumbItem>
  <XDSBreadcrumbItem isCurrent>Page</XDSBreadcrumbItem>
</XDSBreadcrumbs>

// With icons
<XDSBreadcrumbs>
  <XDSBreadcrumbItem href="/" startIcon={<HomeIcon />}>Home</XDSBreadcrumbItem>
  <XDSBreadcrumbItem isCurrent>Settings</XDSBreadcrumbItem>
</XDSBreadcrumbs>
```

## Accessibility

- Outer `<nav>` landmark with `aria-label`
- Items rendered in an `<ol>` ordered list
- Current item has `aria-current="page"` and renders as `<span>` (not a link)
- Separators are `aria-hidden="true"` with `role="presentation"`
- Auto-detects last child as current if no `isCurrent` is explicitly set

## Files

| File                      | Purpose                  |
| ------------------------- | ------------------------ |
| `XDSBreadcrumbs.tsx`      | Component implementation |
| `XDSBreadcrumbs.test.tsx` | Unit tests               |
| `index.ts`                | Barrel exports           |
