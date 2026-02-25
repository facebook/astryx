# SideNav

Sidebar navigation component for application pages. Supports sections, nested items, selected state, icons, and responsive collapse.

## Components

| Component           | Description                                                                               |
| ------------------- | ----------------------------------------------------------------------------------------- |
| `XDSSideNav`        | Container with five zones: header, topContent, children (scrollable), footer, footerIcons |
| `XDSSideNavHeader`  | Product/suite/account header with smart interaction boundary logic                        |
| `XDSSideNavItem`    | Navigation item with icon, selected state, and nesting                                    |
| `XDSSideNavSection` | Section grouping with optional title and end content                                      |

## Files

| File                    | Purpose                                    |
| ----------------------- | ------------------------------------------ |
| `XDSSideNav.tsx`        | Container component                        |
| `XDSSideNavHeader.tsx`  | Header component with popover menu support |
| `XDSSideNavItem.tsx`    | Navigation item component                  |
| `XDSSideNavSection.tsx` | Section grouping component                 |
| `XDSSideNav.test.tsx`   | Unit tests                                 |
| `index.ts`              | Public exports                             |

## Usage

```tsx
import {
  XDSSideNav,
  XDSSideNavHeader,
  XDSSideNavItem,
  XDSSideNavSection,
} from '@xds/core/SideNav';
```

### With XDSAppShell + TopNav

When used inside `XDSAppShell` alongside a `XDSTopNav`, **omit the header** — the TopNav already provides the app name and logo. Including `XDSSideNavHeader` would double the identity.

```tsx
// TopNav provides identity → SideNav has no header
<XDSAppShell
  topNav={<XDSTopNav title={<XDSTopNavTitle title="My App" />} />}
  sideNav={
    <XDSSideNav>
      <XDSSideNavSection title="Main" isHeaderHidden>
        <XDSSideNavItem
          label="Dashboard"
          icon={HomeIcon}
          isSelected
          href="/dashboard"
        />
        <XDSSideNavItem label="Projects" icon={FolderIcon} href="/projects" />
      </XDSSideNavSection>
    </XDSSideNav>
  }>
  <Content />
</XDSAppShell>
```

### Standalone (no TopNav)

Without a TopNav, include `XDSSideNavHeader` to provide app identity.

```tsx
// No TopNav → SideNav header provides identity
<XDSAppShell
  sideNav={
    <XDSSideNav
      header={
        <XDSSideNavHeader icon={<AppIcon />} title="My App" titleHref="/" />
      }
      topContent={<XDSButton label="Create new" variant="primary" />}
      footerIcons={<XDSButton icon={HelpIcon} variant="ghost" label="Help" />}>
      <XDSSideNavSection title="Main">
        <XDSSideNavItem
          label="Dashboard"
          icon={HomeIcon}
          selectedIcon={HomeIconSolid}
          isSelected
          href="/dashboard"
        />
        <XDSSideNavItem
          label="Projects"
          icon={FolderIcon}
          href="/projects"
          endContent={<XDSBadge>3</XDSBadge>}
        />
      </XDSSideNavSection>

      <XDSSideNavSection title="Settings">
        <XDSSideNavItem label="General" href="/settings/general" />
        <XDSSideNavItem label="Security" href="/settings/security" />
      </XDSSideNavSection>
    </XDSSideNav>
  }>
  <Content />
</XDSAppShell>
```

## Header Interaction Model

| Props provided                          | Behavior                                                       |
| --------------------------------------- | -------------------------------------------------------------- |
| `titleHref` only, no menu               | Whole header is one link                                       |
| `titleHref` + `supertitleHref`, no menu | Each text is an independent link                               |
| `menu` only, no hrefs                   | Whole header is the popover trigger                            |
| `menu` + hrefs                          | Links are independent `<a>`, chevron/remaining area is trigger |

## Accessibility

- `<nav aria-label="Side navigation">`
- `aria-current="page"` on selected item
- Sections: `role="group"` with `aria-labelledby`
- Keyboard: Tab through items, Enter/Space to activate

## Dependencies

- `useXDSPopover` — for header menu popover
- `XDSIcon` — for rendering icon components in nav items
