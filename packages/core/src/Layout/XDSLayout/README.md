# /packages/core/src/Layout/XDSLayout

XDS Layout structure components for arranging sections using named slots.

<!-- SYNC: When files in this directory change, update this document. -->

## Overview

The XDSLayout system provides a 5-slot layout structure for building consistent page and component layouts. It follows a **zero styling** principle — no `xstyle` customization props.

```
┌─────────────────────────────────────────┐
│                 header                  │
├──────┬─────────────────────────┬────────┤
│      │                         │        │
│start │        content          │  end   │
│      │                         │        │
├──────┴─────────────────────────┴────────┤
│                 footer                  │
└─────────────────────────────────────────┘
```

## Import

```tsx
import {
  XDSCard,
  XDSSection,
  XDSLayout,
  XDSLayoutHeader,
  XDSLayoutFooter,
  XDSLayoutContent,
  XDSLayoutPanel,
} from '@xds/core/Layout';
```

## Usage

XDSLayout must be wrapped in a container component (XDSCard, XDSSection, or XDSLayoutContainer), which provides visual appearance and padding context.

### Basic Layout

```tsx
<XDSCard>
  <XDSLayout
    header={<XDSLayoutHeader hasDivider>Page Title</XDSLayoutHeader>}
    content={<XDSLayoutContent>Main content here</XDSLayoutContent>}
    footer={<XDSLayoutFooter>Actions</XDSLayoutFooter>}
  />
</XDSCard>
```

### With Sidebars

```tsx
<XDSCard>
  <XDSLayout
    header={<XDSLayoutHeader hasDivider>Dashboard</XDSLayoutHeader>}
    start={
      <XDSLayoutPanel hasDivider role="navigation">
        <Navigation />
      </XDSLayoutPanel>
    }
    content={<XDSLayoutContent>Main content</XDSLayoutContent>}
    end={
      <XDSLayoutPanel hasDivider role="complementary">
        <Sidebar />
      </XDSLayoutPanel>
    }
  />
</XDSCard>
```

### Full Bleed Content

Use `isFullBleed` on XDSLayoutContent to remove internal padding, allowing content to touch the edges. Useful for tables, images, or other edge-to-edge content.

```tsx
<XDSCard>
  <XDSLayout
    header={<XDSLayoutHeader hasDivider>Users</XDSLayoutHeader>}
    content={
      <XDSLayoutContent isFullBleed>
        <Table />
      </XDSLayoutContent>
    }
    footer={<XDSLayoutFooter hasDivider>Actions</XDSLayoutFooter>}
  />
</XDSCard>
```

### Section Variants

```tsx
<XDSSection variant="wash">
  <XDSLayout
    content={<XDSLayoutContent>Content in wash section</XDSLayoutContent>}
  />
</XDSSection>
```

## Components

| Component | Description | Renders |
|-----------|-------------|---------|
| `XDSLayout` | Main layout component with named slots | `<div>` |
| `XDSLayoutHeader` | Header content area | `<div>` (use `role` for landmark) |
| `XDSLayoutFooter` | Footer content area | `<div>` (use `role` for landmark) |
| `XDSLayoutContent` | Main content area | `<div>` (use `role` for landmark) |
| `XDSLayoutPanel` | Side panel for start/end slots | `<div>` (use `role` for landmark) |

## Props

### XDSLayout

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `header` | `ReactNode` | — | Header slot content |
| `footer` | `ReactNode` | — | Footer slot content |
| `content` | `ReactNode` | — | Main content slot |
| `start` | `ReactNode` | — | Start panel (left in LTR) |
| `end` | `ReactNode` | — | End panel (right in LTR) |
| `height` | `'fill' \| 'auto'` | `'fill'` | `fill`: layout fills container, content scrolls. `auto`: layout grows with content |
| `isFullBleed` | `boolean` | `false` | Removes padding at layout's outer edges |

### XDSLayoutHeader / XDSLayoutFooter

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | — | Area content |
| `hasDivider` | `boolean` | `false` | Adds themed border (bottom for header, top for footer) |
| `isFullBleed` | `boolean` | `false` | Removes internal padding |
| `label` | `string` | — | Accessible label for the landmark (required when multiple landmarks of same type) |
| `role` | `AriaRole` | — | ARIA landmark role (e.g., `'banner'`, `'contentinfo'`) |

### XDSLayoutContent

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | — | Area content |
| `isFullBleed` | `boolean` | `false` | Removes internal padding |
| `isScrollable` | `boolean` | `true` | Enables scrollable overflow. Set to `false` for auto-height layouts with sticky elements |
| `label` | `string` | — | Accessible label for the landmark |
| `role` | `AriaRole` | — | ARIA landmark role (e.g., `'main'`) |

### XDSLayoutPanel

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | — | Area content |
| `hasDivider` | `boolean` | `false` | Adds themed border (auto-positioned based on slot) |
| `isFullBleed` | `boolean` | `false` | Removes internal padding |
| `label` | `string` | — | Accessible label for the landmark (required when multiple landmarks of same type) |
| `role` | `AriaRole` | — | ARIA landmark role (e.g., `'navigation'`, `'complementary'`) |

## Files

| File | Role | Purpose |
|------|------|---------|
| `index.ts` | Entry | Exports all components and types |
| `XDSLayout.tsx` | Core | Main layout component |
| `XDSLayoutHeader.tsx` | Component | Header content area |
| `XDSLayoutFooter.tsx` | Component | Footer content area |
| `XDSLayoutContent.tsx` | Component | Main content area |
| `XDSLayoutPanel.tsx` | Component | Side panel component |
| `XDSLayoutAreaContext.ts` | Context | Slot detection context |

## Dividers

`hasDivider` on content areas auto-places the divider on the correct edge:

| Component | Divider Position |
|-----------|------------------|
| Header | Bottom edge |
| Footer | Top edge |
| Panel (start) | End edge |
| Panel (end) | Start edge |

When `hasDivider` is false, spacing collapse is applied automatically for seamless visual flow.

## RTL Support

Uses CSS logical properties (`padding-inline`, `border-inline-start`, etc.) for automatic RTL support. The `start`/`end` naming ensures panels appear on the correct side in both LTR and RTL contexts.

## Related

- See `.context/proposals/layout-system.md` for full design proposal
- See `../Stack/README.md` for stack primitives used internally
