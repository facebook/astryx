# AppShell

Application-level layout shell component.

<!-- SYNC: When files in this directory change, update this document. -->

## Overview

XDSAppShell provides the structural frame for an application: header, side navigation, and main content area. It composes XDSLayout internally and replaces the internal XDSPage + XDSPageLayout pattern.

## Import

```tsx
import {XDSAppShell} from '@xds/core/AppShell';
```

## Composition Patterns

XDSAppShell has two navigation slots: `topNav` (horizontal bar) and `sideNav` (vertical sidebar). How you combine them determines where app identity lives.

### TopNav + SideNav (most common)

When a TopNav is present, the SideNav should **not** include a header — the TopNav already provides the app name and logo. Adding `XDSSideNavHeader` would double the identity.

```tsx
<XDSAppShell
  topNav={
    <XDSTopNav
      label="Main navigation"
      title={<XDSTopNavTitle title="My App" logo={<Logo />} />}
      startContent={
        <>
          <XDSTopNavItem label="Home" href="/" isSelected />
          <XDSTopNavItem label="Products" href="/products" />
        </>
      }
    />
  }
  sideNav={
    // No header — TopNav has the app identity
    <XDSSideNav>
      <XDSSideNavSection title="Main" isHeaderHidden>
        <XDSSideNavItem
          label="Dashboard"
          icon={HomeIcon}
          isSelected
          href="/dashboard"
        />
        <XDSSideNavItem
          label="Analytics"
          icon={ChartBarIcon}
          href="/analytics"
        />
      </XDSSideNavSection>
      <XDSSideNavSection title="Settings">
        <XDSSideNavItem label="General" icon={CogIcon} href="/settings" />
      </XDSSideNavSection>
    </XDSSideNav>
  }>
  <DashboardContent />
</XDSAppShell>
```

### SideNav Only (no TopNav)

Without a TopNav, the SideNav needs its own header to provide app identity.

```tsx
<XDSAppShell
  sideNav={
    <XDSSideNav
      header={
        <XDSSideNavHeader icon={<AppIcon />} title="My App" titleHref="/" />
      }>
      <XDSSideNavSection title="Main" isHeaderHidden>
        <XDSSideNavItem
          label="Dashboard"
          icon={HomeIcon}
          isSelected
          href="/dashboard"
        />
        <XDSSideNavItem
          label="Analytics"
          icon={ChartBarIcon}
          href="/analytics"
        />
      </XDSSideNavSection>
    </XDSSideNav>
  }>
  <DashboardContent />
</XDSAppShell>
```

### TopNav Only (no sideNav)

For landing pages or simple apps that don't need secondary navigation.

```tsx
<XDSAppShell
  topNav={
    <XDSTopNav
      label="Navigation"
      title={<XDSTopNavTitle title="Landing Page" />}
    />
  }>
  <LandingContent />
</XDSAppShell>
```

### Responsive: SideNav + MobileNav

For apps that need both desktop and mobile layouts, use the `mobileNav` slot.
On desktop the SideNav renders inline; on mobile AppShell hides the SideNav
(via `sideNavBreakpoint`) and the consumer shows an XDSMobileNav drawer instead.

Pass a fully composed `<XDSMobileNav>` — AppShell just renders it, same as
every other slot. All drawer props (`isOpen`, `onClose`, `title`) stay on
XDSMobileNav where they belong.

```tsx
const [mobileOpen, setMobileOpen] = useState(false);
const isMobile = useMediaQuery('(max-width: 768px)');

<XDSAppShell
  topNav={
    <XDSTopNav
      label="Navigation"
      title={<XDSTopNavTitle title="My App" />}
      startContent={
        isMobile ? (
          <XDSButton
            label="Menu"
            icon={<XDSIcon icon="menu" color="inherit" />}
            variant="ghost"
            onClick={() => setMobileOpen(true)}
          />
        ) : (
          <XDSTopNavItem label="Home" href="/" isSelected />
        )
      }
    />
  }
  sideNav={<XDSSideNav>{navSections}</XDSSideNav>}
  mobileNav={
    <XDSMobileNav
      isOpen={mobileOpen}
      onClose={() => setMobileOpen(false)}
      title="My App">
      {navSections}
    </XDSMobileNav>
  }>
  <Content />
</XDSAppShell>;
```

### Pattern Summary

| Layout           | TopNav | SideNav Header | When to use                     |
| ---------------- | ------ | -------------- | ------------------------------- |
| TopNav + SideNav | ✅     | ❌ Omit        | Dashboards, admin panels, tools |
| SideNav only     | ❌     | ✅ Include     | Simpler apps, focused tools     |
| TopNav only      | ✅     | N/A            | Landing pages, single-page apps |
| Neither          | ❌     | N/A            | Auth screens, embedded views    |

## More Usage

```tsx
// Auto-height for content-heavy pages
<XDSAppShell
  topNav={<XDSTopNav label="Docs" title={<XDSTopNavTitle title="Docs" />} />}
  sideNav={<XDSSideNav>...</XDSSideNav>}
  height="auto"
>
  <LongDocumentContent />
</XDSAppShell>

// Controlled sideNav collapse
<XDSAppShell
  topNav={<XDSTopNav label="App" title={<XDSTopNavTitle title="App" />} />}
  sideNav={<XDSSideNav>...</XDSSideNav>}
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
| `sideNav`                   | `ReactNode`                      | —        | Side navigation slot (typically XDSSideNav) |
| `banner`                    | `ReactNode`                      | —        | Banner slot for system-wide announcements   |
| `height`                    | `'fill' \| 'auto'`               | `'fill'` | Height behavior                             |
| `isSideNavCollapsed`        | `boolean`                        | —        | Whether sideNav is collapsed (controlled)   |
| `defaultIsSideNavCollapsed` | `boolean`                        | `false`  | Default collapsed state (uncontrolled)      |
| `mobileNav`                 | `ReactNode`                      | —        | Mobile navigation (typically XDSMobileNav)  |
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
- **Uncontrolled**: Use `defaultIsSideNavCollapsed`
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
