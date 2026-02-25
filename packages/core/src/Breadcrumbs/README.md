# Breadcrumbs

A navigation breadcrumb trail with semantic HTML.

## Exports

| Export                   | Type      | Description                |
| ------------------------ | --------- | -------------------------- |
| `XDSBreadcrumbs`         | Component | Container with nav + ol    |
| `XDSBreadcrumbsProps`    | Type      | Container props interface  |
| `XDSBreadcrumbsVariant`  | Type      | Variant union type         |
| `XDSBreadcrumbItem`      | Component | Individual breadcrumb item |
| `XDSBreadcrumbItemProps` | Type      | Item props interface       |

### XDSBreadcrumbs

Navigation container that renders a `<nav>` with an ordered list of breadcrumb items.

```tsx
<XDSBreadcrumbs>
  <XDSBreadcrumbItem href="/">Home</XDSBreadcrumbItem>
  <XDSBreadcrumbItem href="/projects">Projects</XDSBreadcrumbItem>
  <XDSBreadcrumbItem isCurrent>My Project</XDSBreadcrumbItem>
</XDSBreadcrumbs>
```

| Prop          | Type                        | Default        | Description                       |
| ------------- | --------------------------- | -------------- | --------------------------------- |
| `children`    | `ReactNode`                 | —              | XDSBreadcrumbItem elements        |
| `separator`   | `ReactNode`                 | `'/'`          | Separator between items           |
| `variant`     | `'default' \| 'supporting'` | `'default'`    | Visual variant                    |
| `xstyle`      | `StyleXStyles`              | —              | StyleX overrides                  |
| `label`       | `string`                    | `'Breadcrumb'` | Accessible label for nav landmark |
| `data-testid` | `string`                    | —              | Test ID                           |

### XDSBreadcrumbItem

Individual breadcrumb item that renders as a link or plain text.

```tsx
<XDSBreadcrumbItem href="/settings" startIcon={<XDSIcon icon={CogIcon} size="sm" />}>
  Settings
</XDSBreadcrumbItem>
```

| Prop          | Type                      | Default | Description                          |
| ------------- | ------------------------- | ------- | ------------------------------------ |
| `children`    | `ReactNode`               | —       | Item label content                   |
| `href`        | `string`                  | —       | URL for the breadcrumb link          |
| `onClick`     | `(e: MouseEvent) => void` | —       | Click handler                        |
| `isCurrent`   | `boolean`                 | `false` | Marks as current page (aria-current) |
| `startIcon`   | `ReactNode`               | —       | Icon before the label                |
| `data-testid` | `string`                  | —       | Test ID                              |

## Usage

```tsx
import {XDSBreadcrumbs, XDSBreadcrumbItem} from '@xds/core/Breadcrumbs';

// Basic breadcrumbs
<XDSBreadcrumbs>
  <XDSBreadcrumbItem href="/">Home</XDSBreadcrumbItem>
  <XDSBreadcrumbItem href="/projects">Projects</XDSBreadcrumbItem>
  <XDSBreadcrumbItem isCurrent>My Project</XDSBreadcrumbItem>
</XDSBreadcrumbs>

// Supporting variant (smaller, secondary text)
<XDSBreadcrumbs variant="supporting">
  <XDSBreadcrumbItem href="/">Home</XDSBreadcrumbItem>
  <XDSBreadcrumbItem isCurrent>Page</XDSBreadcrumbItem>
</XDSBreadcrumbs>

// With icons
<XDSBreadcrumbs>
  <XDSBreadcrumbItem href="/" startIcon={<XDSIcon icon={HomeIcon} size="sm" />}>
    Home
  </XDSBreadcrumbItem>
  <XDSBreadcrumbItem isCurrent>Settings</XDSBreadcrumbItem>
</XDSBreadcrumbs>
```

## Accessibility

- Container is `<nav aria-label>` landmark
- Items in `<ol>` with `<li>` elements
- Current item has `aria-current="page"`
- Separators are `aria-hidden="true"`
- Auto-detects last child as current when no `isCurrent` is set

## Files

| File                      | Purpose                   |
| ------------------------- | ------------------------- |
| `XDSBreadcrumbs.tsx`      | Container component       |
| `XDSBreadcrumbItem.tsx`   | Individual item component |
| `XDSBreadcrumbs.test.tsx` | Unit tests                |
| `index.ts`                | Barrel exports            |
