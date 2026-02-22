# /packages/core/src/AppShell

Application-level layout shell component.

<!-- SYNC: When files in this directory change, update this document. -->

## Overview

XDSAppShell provides the structural frame for an application: header, side navigation, and main content area. It composes XDSLayout internally and replaces the internal XDSPage + XDSPageLayout pattern.

## Import

```tsx
import {XDSAppShell} from '@xds/core/AppShell';
```

## Usage

```tsx
// Standard app shell — fill mode, sideNav + header
<XDSAppShell
  topNav={<XDSTopNav title="My App" />}
  sideNav={<XDSPageNav items={navItems} />}
  banner={<XDSBanner status="info" title="System update" />}
>
  <DashboardContent />
</XDSAppShell>

// Header only (no sideNav)
<XDSAppShell topNav={<XDSTopNav title="Landing" />}>
  <LandingContent />
</XDSAppShell>

// Auto-height for content-heavy pages
<XDSAppShell
  topNav={<XDSTopNav title="Docs" />}
  sideNav={<XDSPageNav items={docNav} />}
  height="auto"
>
  <LongDocumentContent />
</XDSAppShell>

// Controlled sideNav collapse
<XDSAppShell
  topNav={<XDSTopNav title="App" />}
  sideNav={<XDSPageNav items={navItems} />}
  isSideNavCollapsed={collapsed}
  onSideNavCollapsedChange={setCollapsed}
>
  <Content />
</XDSAppShell>
```

## Props

| Prop                        | Type                             | Default  | Description                                 |
| --------------------------- | -------------------------------- | -------- | ------------------------------------------- |
| `children`                  | `ReactNode`                      | —        | Main content area (rendered as `<main>`)    |
| `topNav`                    | `ReactNode`                      | —        | Top navigation slot (typically XDSTopNav)   |
| `sideNav`                   | `ReactNode`                      | —        | Side navigation slot (typically XDSPageNav) |
| `banner`                    | `ReactNode`                      | —        | Banner slot for system-wide announcements   |
| `height`                    | `'fill' \| 'auto'`               | `'fill'` | Height behavior                             |
| `isSideNavCollapsed`        | `boolean`                        | —        | Whether sideNav is collapsed (controlled)   |
| `initialIsSideNavCollapsed` | `boolean`                        | `false`  | Initial collapsed state (uncontrolled)      |
| `onSideNavCollapsedChange`  | `(isCollapsed: boolean) => void` | —        | Collapse change callback                    |
| `sideNavBreakpoint`         | `'sm' \| 'md' \| 'lg' \| 'none'` | `'md'`   | Breakpoint for auto-collapse                |
| `sideNavWidth`              | `number`                         | `260`    | SideNav width in pixels                     |
| `xstyle`                    | `StyleXStyles`                   | —        | StyleX overrides                            |
| `data-testid`               | `string`                         | —        | Test ID                                     |

## Height Modes

### Fill (default)

- Shell fills viewport (`100dvh`)
- TopNav is pinned at top
- SideNav has its own scroll container
- Content area scrolls independently
- Best for: dashboards, admin panels, tools

### Auto

- Shell grows with content, page scrolls
- TopNav gets `position: sticky; top: 0`
- SideNav gets `position: sticky; top: <header-height>`
- Best for: docs sites, content-heavy pages

## SideNav Behavior

- **Controlled**: Use `isSideNavCollapsed` + `onSideNavCollapsedChange`
- **Uncontrolled**: Use `initialIsSideNavCollapsed`
- **Responsive**: `sideNavBreakpoint` auto-collapses below the specified width
- **Mobile**: Collapsed sideNav renders as an overlay with backdrop
- **Animations**: Snap open/closed for now; ViewTransitions support planned

## Internal Composition

XDSAppShell composes `XDSLayout` internally with:

- `header` → `XDSLayoutHeader` containing topNav + banner
- `start` → `XDSLayoutPanel` containing sideNav
- `content` → `XDSLayoutContent` containing children as `<main>`

This gives automatic padding collapse, scroll containment, and slot awareness.

## Accessibility

- Semantic HTML via XDSLayout slots
- `<main>` has `role="main"` for landmark navigation
- SideNav has `role="navigation"` with `aria-label="Application navigation"`
- Skip-to-content link (visually hidden, shown on focus)
- Escape closes mobile sideNav overlay

## Files

| File                   | Role      | Purpose                     |
| ---------------------- | --------- | --------------------------- |
| `index.ts`             | Entry     | Exports component and types |
| `XDSAppShell.tsx`      | Component | Main shell implementation   |
| `XDSAppShell.test.tsx` | Tests     | Unit tests                  |
| `README.md`            | Docs      | This documentation          |
