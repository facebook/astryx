# /packages/core/src/Layout/XDSLayout

Page shell and app layout system with header, sidebar, content, and footer slots.

<!-- SYNC: When files in this directory change, update this document. -->

## When to use

- Building a page with a sidebar → XDSLayout with `start` slot
- Dashboard with header + scrollable body → XDSLayout with `header` + `content`
- Settings page with nav panel → XDSLayout with `start` + `content`
- App shell with top bar, side nav, and main area → XDSLayout with all slots
- Card with header/body/footer sections → XDSLayout inside XDSCard

Don't use XDSLayout for simple vertical/horizontal stacking — use XDSVStack/XDSHStack instead.

## Overview

The XDSLayout system provides a 5-slot layout structure for building page shells and structured layouts. It handles padding collapse between adjacent slots, scroll containment, and automatic RTL support. It follows a **zero styling** principle — no `xstyle` customization props.

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

### App shell with sidebar navigation

```tsx
<XDSCard height="100vh">
  <XDSLayout
    header={<XDSLayoutHeader hasDivider>App Name</XDSLayoutHeader>}
    start={
      <XDSLayoutPanel hasDivider width={240} role="navigation">
        <Navigation />
      </XDSLayoutPanel>
    }
    content={
      <XDSLayoutContent role="main">
        <MainContent />
      </XDSLayoutContent>
    }
  />
</XDSCard>
```

### Dashboard with sidebar and detail panel

```tsx
<XDSCard height="100vh">
  <XDSLayout
    header={<XDSLayoutHeader hasDivider>Dashboard</XDSLayoutHeader>}
    start={
      <XDSLayoutPanel hasDivider width={200} role="navigation">
        <Navigation />
      </XDSLayoutPanel>
    }
    content={<XDSLayoutContent>Main content</XDSLayoutContent>}
    end={
      <XDSLayoutPanel hasDivider width={300} role="complementary">
        <DetailPanel />
      </XDSLayoutPanel>
    }
  />
</XDSCard>
```

### Card with header and content

```tsx
<XDSCard>
  <XDSLayout
    header={<XDSLayoutHeader hasDivider>Page Title</XDSLayoutHeader>}
    content={<XDSLayoutContent>Main content here</XDSLayoutContent>}
    footer={<XDSLayoutFooter hasDivider>Actions</XDSLayoutFooter>}
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

| Component          | Description                                                               | Renders                           |
| ------------------ | ------------------------------------------------------------------------- | --------------------------------- |
| `XDSLayout`        | Page shell with header, sidebar(s), content, and footer slots             | `<div>`                           |
| `XDSLayoutHeader`  | Top bar — page titles, app bars, toolbars                                 | `<div>` (use `role` for landmark) |
| `XDSLayoutFooter`  | Bottom bar — action bars, pagination, status bars                         | `<div>` (use `role` for landmark) |
| `XDSLayoutContent` | Scrollable main content area                                              | `<div>` (use `role` for landmark) |
| `XDSLayoutPanel`   | Sidebar — navigation panels, settings sidebars, detail/inspector panels   | `<div>` (use `role` for landmark) |

## Props

### XDSLayout

| Prop          | Type               | Default  | Description                                                                        |
| ------------- | ------------------ | -------- | ---------------------------------------------------------------------------------- |
| `header`      | `ReactNode`        | —        | Header slot content                                                                |
| `footer`      | `ReactNode`        | —        | Footer slot content                                                                |
| `content`     | `ReactNode`        | —        | Main content slot                                                                  |
| `start`       | `ReactNode`        | —        | Start panel (left in LTR)                                                          |
| `end`         | `ReactNode`        | —        | End panel (right in LTR)                                                           |
| `height`      | `'fill' \| 'auto'` | `'fill'` | `fill`: layout fills container, content scrolls. `auto`: layout grows with content |
| `isFullBleed` | `boolean`          | `false`  | Removes padding at layout's outer edges                                            |

### XDSLayoutHeader / XDSLayoutFooter

| Prop          | Type        | Default | Description                                                                       |
| ------------- | ----------- | ------- | --------------------------------------------------------------------------------- |
| `children`    | `ReactNode` | —       | Area content                                                                      |
| `hasDivider`  | `boolean`   | `false` | Adds themed border (bottom for header, top for footer)                            |
| `isFullBleed` | `boolean`   | `false` | Removes internal padding                                                          |
| `label`       | `string`    | —       | Accessible label for the landmark (required when multiple landmarks of same type) |
| `role`        | `AriaRole`  | —       | ARIA landmark role (e.g., `'banner'`, `'contentinfo'`)                            |

### XDSLayoutContent

| Prop           | Type        | Default | Description                                                                              |
| -------------- | ----------- | ------- | ---------------------------------------------------------------------------------------- |
| `children`     | `ReactNode` | —       | Area content                                                                             |
| `isFullBleed`  | `boolean`   | `false` | Removes internal padding                                                                 |
| `isScrollable` | `boolean`   | `true`  | Enables scrollable overflow. Set to `false` for auto-height layouts with sticky elements |
| `label`        | `string`    | —       | Accessible label for the landmark                                                        |
| `role`         | `AriaRole`  | —       | ARIA landmark role (e.g., `'main'`)                                                      |

### XDSLayoutPanel

| Prop          | Type        | Default | Description                                                                       |
| ------------- | ----------- | ------- | --------------------------------------------------------------------------------- |
| `children`    | `ReactNode` | —       | Area content                                                                      |
| `hasDivider`  | `boolean`   | `false` | Adds themed border (auto-positioned based on slot)                                |
| `isFullBleed` | `boolean`   | `false` | Removes internal padding                                                          |
| `label`       | `string`    | —       | Accessible label for the landmark (required when multiple landmarks of same type) |
| `role`        | `AriaRole`  | —       | ARIA landmark role (e.g., `'navigation'`, `'complementary'`)                      |

## Files

| File                      | Role      | Purpose                          |
| ------------------------- | --------- | -------------------------------- |
| `index.ts`                | Entry     | Exports all components and types |
| `XDSLayout.tsx`           | Core      | Main layout component            |
| `XDSLayoutHeader.tsx`     | Component | Header content area              |
| `XDSLayoutFooter.tsx`     | Component | Footer content area              |
| `XDSLayoutContent.tsx`    | Component | Main content area                |
| `XDSLayoutPanel.tsx`      | Component | Side panel component             |
| `XDSLayoutAreaContext.ts` | Context   | Slot detection context           |

## Dividers

`hasDivider` on content areas auto-places the divider on the correct edge:

| Component     | Divider Position |
| ------------- | ---------------- |
| Header        | Bottom edge      |
| Footer        | Top edge         |
| Panel (start) | End edge         |
| Panel (end)   | Start edge       |

When `hasDivider` is false, spacing collapse is applied automatically for seamless visual flow.

## RTL Support

Uses CSS logical properties (`padding-inline`, `border-inline-start`, etc.) for automatic RTL support. The `start`/`end` naming ensures panels appear on the correct side in both LTR and RTL contexts.

## Related

- See `.context/proposals/layout-system.md` for full design proposal
- See `../Stack/README.md` for stack primitives used internally
