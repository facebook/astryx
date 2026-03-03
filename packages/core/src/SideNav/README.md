# SideNav

Sidebar navigation component for application pages. Supports sections, nested items, selected state, icons, and responsive collapse.

## Import

```tsx
import {
  XDSSideNav,
  XDSSideNavHeader,
  XDSSideNavItem,
  XDSSideNavSection,
} from '@xds/core/SideNav';
```

## Components

### XDSSideNav

Container with five zones: header, topContent, children (scrollable), footer, footerIcons.

```tsx
<XDSSideNav
  header={<XDSSideNavHeader icon={<AppIcon />} title="My App" titleHref="/" />}
  topContent={<XDSButton label="Create new" variant="primary" />}>
  <XDSSideNavSection title="Main">
    <XDSSideNavItem
      label="Dashboard"
      icon={HomeIcon}
      isSelected
      href="/dashboard"
    />
    <XDSSideNavItem label="Projects" icon={FolderIcon} href="/projects" />
  </XDSSideNavSection>
</XDSSideNav>
```

| Prop          | Type           | Default | Description                                |
| ------------- | -------------- | ------- | ------------------------------------------ |
| `header`      | `ReactNode`    | —       | Header area (XDSSideNavHeader). Sticky     |
| `topContent`  | `ReactNode`    | —       | Content below header (e.g., create button) |
| `children`    | `ReactNode`    | —       | Navigation sections and items. Scrollable  |
| `footer`      | `ReactNode`    | —       | Footer area above icon bar                 |
| `footerIcons` | `ReactNode`    | —       | Footer icon bar                            |
| `xstyle`      | `StyleXStyles` | —       | StyleX overrides                           |
| `data-testid` | `string`       | —       | Test ID                                    |

### XDSSideNavHeader

Product/suite/account header with smart interaction boundary logic.

```tsx
<XDSSideNavHeader icon={<AppIcon />} title="My App" titleHref="/" />
```

| Prop             | Type           | Default | Description                 |
| ---------------- | -------------- | ------- | --------------------------- |
| `icon`           | `ReactNode`    | —       | Product/app icon            |
| `title`          | `string`       | —       | Product/app name (required) |
| `titleHref`      | `string`       | —       | Link for the title          |
| `supertitle`     | `string`       | —       | Text above the title        |
| `supertitleHref` | `string`       | —       | Link for the supertitle     |
| `subtitle`       | `string`       | —       | Text below the title        |
| `subtitleHref`   | `string`       | —       | Link for the subtitle       |
| `menu`           | `ReactNode`    | —       | Menu content in a popover   |
| `xstyle`         | `StyleXStyles` | —       | StyleX overrides            |
| `data-testid`    | `string`       | —       | Test ID                     |

### XDSSideNavItem

Navigation item with icon, selected state, and nesting support.

```tsx
<XDSSideNavItem
  label="Dashboard"
  icon={HomeIcon}
  selectedIcon={HomeIconSolid}
  isSelected
  href="/dashboard"
  endContent={<XDSBadge>3</XDSBadge>}
/>
```

| Prop           | Type                      | Default | Description                         |
| -------------- | ------------------------- | ------- | ----------------------------------- |
| `as`           | `XDSLinkComponentType`    | —       | Custom link component               |
| `label`        | `string`                  | —       | Item label (required)               |
| `icon`         | `XDSIconType`             | —       | Icon (outline variant)              |
| `selectedIcon` | `XDSIconType`             | —       | Icon when selected (filled variant) |
| `isSelected`   | `boolean`                 | `false` | Current page indicator              |
| `isDisabled`   | `boolean`                 | `false` | Disabled state                      |
| `href`         | `string`                  | —       | Navigation URL                      |
| `onClick`      | `(e: MouseEvent) => void` | —       | Click handler                       |
| `endContent`   | `ReactNode`               | —       | Right-side content (badges, counts) |
| `children`     | `ReactNode`               | —       | Sub-items for nesting               |
| `data-testid`  | `string`                  | —       | Test ID                             |

### XDSSideNavSection

Section grouping with optional title and end content.

```tsx
<XDSSideNavSection title="Settings" endContent={<XDSBadge>New</XDSBadge>}>
  <XDSSideNavItem label="General" href="/settings/general" />
  <XDSSideNavItem label="Security" href="/settings/security" />
</XDSSideNavSection>
```

| Prop             | Type        | Default | Description                             |
| ---------------- | ----------- | ------- | --------------------------------------- |
| `title`          | `string`    | —       | Section title (required)                |
| `subtitle`       | `string`    | —       | Section subtitle                        |
| `children`       | `ReactNode` | —       | Section items                           |
| `endContent`     | `ReactNode` | —       | Right-side content in section header    |
| `isHeaderHidden` | `boolean`   | `false` | Visually hide header (still accessible) |
| `data-testid`    | `string`    | —       | Test ID                                 |

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
