# PageNav

Sidebar navigation component for application pages. Supports sections, nested items, selected state, icons, and responsive collapse.

## Components

| Component           | Description                                                                               |
| ------------------- | ----------------------------------------------------------------------------------------- |
| `XDSPageNav`        | Container with five zones: header, topContent, children (scrollable), footer, footerIcons |
| `XDSPageNavHeader`  | Product/suite/account header with smart interaction boundary logic                        |
| `XDSPageNavItem`    | Navigation item with icon, selected state, and nesting                                    |
| `XDSPageNavSection` | Section grouping with optional title and end content                                      |

## Files

| File                    | Purpose                                    |
| ----------------------- | ------------------------------------------ |
| `XDSPageNav.tsx`        | Container component                        |
| `XDSPageNavHeader.tsx`  | Header component with popover menu support |
| `XDSPageNavItem.tsx`    | Navigation item component                  |
| `XDSPageNavSection.tsx` | Section grouping component                 |
| `XDSPageNav.test.tsx`   | Unit tests                                 |
| `index.ts`              | Public exports                             |

## Usage

```tsx
import {
  XDSPageNav,
  XDSPageNavHeader,
  XDSPageNavItem,
  XDSPageNavSection,
} from '@xds/core/PageNav';
```

### With XDSAppShell + TopNav

When used inside `XDSAppShell` alongside a `XDSTopNav`, **omit the header** — the TopNav already provides the app name and logo. Including `XDSPageNavHeader` would double the identity.

```tsx
// TopNav provides identity → PageNav has no header
<XDSAppShell
  topNav={<XDSTopNav title={<XDSTopNavTitle title="My App" />} />}
  sideNav={
    <XDSPageNav>
      <XDSPageNavSection title="Main" isHeaderHidden>
        <XDSPageNavItem
          label="Dashboard"
          icon={HomeIcon}
          isSelected
          href="/dashboard"
        />
        <XDSPageNavItem label="Projects" icon={FolderIcon} href="/projects" />
      </XDSPageNavSection>
    </XDSPageNav>
  }>
  <Content />
</XDSAppShell>
```

### Standalone (no TopNav)

Without a TopNav, include `XDSPageNavHeader` to provide app identity.

```tsx
// No TopNav → PageNav header provides identity
<XDSAppShell
  sideNav={
    <XDSPageNav
      header={
        <XDSPageNavHeader icon={<AppIcon />} title="My App" titleHref="/" />
      }
      topContent={<XDSButton label="Create new" variant="primary" />}
      footerIcons={<XDSButton icon={HelpIcon} variant="ghost" label="Help" />}>
      <XDSPageNavSection title="Main">
        <XDSPageNavItem
          label="Dashboard"
          icon={HomeIcon}
          selectedIcon={HomeIconSolid}
          isSelected
          href="/dashboard"
        />
        <XDSPageNavItem
          label="Projects"
          icon={FolderIcon}
          href="/projects"
          endContent={<XDSBadge>3</XDSBadge>}
        />
      </XDSPageNavSection>

      <XDSPageNavSection title="Settings">
        <XDSPageNavItem label="General" href="/settings/general" />
        <XDSPageNavItem label="Security" href="/settings/security" />
      </XDSPageNavSection>
    </XDSPageNav>
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

- `<nav aria-label="Page navigation">`
- `aria-current="page"` on selected item
- Sections: `role="group"` with `aria-labelledby`
- Keyboard: Tab through items, Enter/Space to activate

## Dependencies

- `useXDSPopover` — for header menu popover
- `XDSIcon` — for rendering icon components in nav items
