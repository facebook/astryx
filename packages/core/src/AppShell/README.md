# /packages/core/src/AppShell

Application-level layout shell component.

<!-- SYNC: When files in this directory change, update this document. -->

## Overview

XDSAppShell provides the structural frame for an application: header, sidebar navigation, and main content area. It composes XDSLayout internally and replaces the internal XDSPage + XDSPageLayout pattern.

## Import

```tsx
import {XDSAppShell} from '@xds/core/AppShell';
```

## Usage

```tsx
// Standard app shell — fill mode, sidebar + header
<XDSAppShell
  topNav={<XDSTopNav title="My App" />}
  pageNav={<XDSPageNav items={navItems} />}
  topBanner={<XDSBanner status="info" title="System update" />}
>
  <DashboardContent />
</XDSAppShell>

// Header only (no sidebar)
<XDSAppShell topNav={<XDSTopNav title="Landing" />}>
  <LandingContent />
</XDSAppShell>

// Auto-height for content-heavy pages
<XDSAppShell
  topNav={<XDSTopNav title="Docs" />}
  pageNav={<XDSPageNav items={docNav} />}
  height="auto"
>
  <LongDocumentContent />
</XDSAppShell>

// Controlled sidebar collapse
<XDSAppShell
  topNav={<XDSTopNav title="App" />}
  pageNav={<XDSPageNav items={navItems} />}
  isSidebarCollapsed={collapsed}
  onSidebarCollapsedChange={setCollapsed}
>
  <Content />
</XDSAppShell>
```

## Props

| Prop                        | Type                             | Default  | Description                                    |
| --------------------------- | -------------------------------- | -------- | ---------------------------------------------- |
| `children`                  | `ReactNode`                      | —        | Main content area (rendered as `<main>`)       |
| `topNav`                    | `ReactNode`                      | —        | Top navigation slot (typically XDSTopNav)      |
| `pageNav`                   | `ReactNode`                      | —        | Sidebar navigation slot (typically XDSPageNav) |
| `topBanner`                 | `ReactNode`                      | —        | Top banner slot for system-wide announcements  |
| `height`                    | `'fill' \| 'auto'`               | `'fill'` | Height behavior                                |
| `isSidebarCollapsed`        | `boolean`                        | —        | Whether sidebar is collapsed (controlled)      |
| `initialIsSidebarCollapsed` | `boolean`                        | `false`  | Initial collapsed state (uncontrolled)         |
| `onSidebarCollapsedChange`  | `(isCollapsed: boolean) => void` | —        | Collapse change callback                       |
| `sidebarBreakpoint`         | `'sm' \| 'md' \| 'lg' \| 'none'` | `'md'`   | Breakpoint for auto-collapse                   |
| `sidebarWidth`              | `number`                         | `260`    | Sidebar width in pixels                        |
| `xstyle`                    | `StyleXStyles`                   | —        | StyleX overrides                               |
| `data-testid`               | `string`                         | —        | Test ID                                        |

## Height Modes

### Fill (default)

- Shell fills viewport (`100dvh`)
- TopNav is pinned at top
- PageNav has its own scroll container
- Content area scrolls independently
- Best for: dashboards, admin panels, tools

### Auto

- Shell grows with content, page scrolls
- TopNav gets `position: sticky; top: 0`
- PageNav gets `position: sticky; top: <header-height>`
- Best for: docs sites, content-heavy pages

## Sidebar Behavior

- **Controlled**: Use `isSidebarCollapsed` + `onSidebarCollapsedChange`
- **Uncontrolled**: Use `initialIsSidebarCollapsed`
- **Responsive**: `sidebarBreakpoint` auto-collapses below the specified width
- **Mobile**: Collapsed sidebar renders as an overlay with backdrop
- **Animations**: Uses ViewTransitions API when available

## Accessibility

- Semantic HTML: `<header>`, `<nav>`, `<main>`
- `<main>` has `role="main"` for landmark navigation
- Sidebar `<nav>` has `aria-label="Application navigation"`
- Skip-to-content link (visually hidden, shown on focus)
- Escape closes mobile sidebar overlay

## Files

| File                   | Role      | Purpose                     |
| ---------------------- | --------- | --------------------------- |
| `index.ts`             | Entry     | Exports component and types |
| `XDSAppShell.tsx`      | Component | Main shell implementation   |
| `XDSAppShell.test.tsx` | Tests     | Unit tests                  |
| `README.md`            | Docs      | This documentation          |
