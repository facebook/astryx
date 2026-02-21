# /packages/core/src/TopNav

Top navigation bar component for application headers.

<!-- SYNC: When files in this directory change, update this document. -->

## Features

- **Slot-based layout**: `title`, `startContent`, `centerContent`, `endContent` for flexible organization
- **Position modes**: Static, sticky, or fixed positioning
- **Companion components**: XDSTopNavTitle, XDSTopNavTitleIcon, XDSTopNavItem
- **Accessible**: Proper ARIA roles and keyboard navigation
- **Themeable**: Uses XDS design tokens for styling

## Usage

```tsx
import {
  XDSTopNav,
  XDSTopNavTitle,
  XDSTopNavTitleIcon,
  XDSTopNavItem,
} from '@xds/core/TopNav';
import {XDSButton} from '@xds/core/Button';
import {HomeIcon, BellIcon, UserCircleIcon} from '@heroicons/react/24/outline';

<XDSTopNav
  label="Main navigation"
  position="sticky"
  title={
    <XDSTopNavTitle
      title="My App"
      logo={
        <XDSTopNavTitleIcon
          icon={<HomeIcon style={{width: 16, height: 16}} />}
        />
      }
      href="/"
    />
  }
  startContent={
    <>
      <XDSTopNavItem label="Dashboard" href="/dashboard" isSelected />
      <XDSTopNavItem label="Products" href="/products" />
      <XDSTopNavItem label="Reports" href="/reports" />
    </>
  }
  endContent={
    <>
      <XDSButton
        label="Notifications"
        variant="ghost"
        icon={<BellIcon style={{width: 16, height: 16}} />}
      />
      <XDSButton
        label="Profile"
        variant="ghost"
        icon={<UserCircleIcon style={{width: 16, height: 16}} />}
      />
    </>
  }
/>;
```

## Props

### XDSTopNav

| Prop            | Type                              | Default    | Description                                                        |
| --------------- | --------------------------------- | ---------- | ------------------------------------------------------------------ |
| `title`         | `ReactNode`                       | —          | Title slot (logo, brand) - left aligned                            |
| `startContent`  | `ReactNode`                       | —          | Start content (nav items, breadcrumbs) - left aligned              |
| `centerContent` | `ReactNode`                       | —          | Center content (nav items) - centered; enables three-column layout |
| `endContent`    | `ReactNode`                       | —          | End content (search, icons, profile) - right aligned               |
| `position`      | `'static' \| 'sticky' \| 'fixed'` | `'static'` | Position behavior                                                  |
| `label`         | `string`                          | —          | Accessible label for navigation landmark                           |

### XDSTopNavTitle

| Prop    | Type        | Default | Description                              |
| ------- | ----------- | ------- | ---------------------------------------- |
| `title` | `string`    | —       | Title text to display                    |
| `logo`  | `ReactNode` | —       | Logo element (image, XDSTopNavTitleIcon) |
| `href`  | `string`    | —       | URL to navigate to when clicked          |

### XDSTopNavTitleIcon

| Prop   | Type                   | Default | Description                |
| ------ | ---------------------- | ------- | -------------------------- |
| `icon` | `ReactNode`            | —       | Icon element (required)    |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'`  | Size of circular container |

### XDSTopNavItem

| Prop         | Type        | Default | Description                     |
| ------------ | ----------- | ------- | ------------------------------- |
| `label`      | `string`    | —       | Accessible label (required)     |
| `href`       | `string`    | —       | Navigation target URL           |
| `isSelected` | `boolean`   | `false` | Selected/highlighted state      |
| `isDisabled` | `boolean`   | `false` | Disabled state                  |
| `icon`       | `ReactNode` | —       | Optional icon element           |
| `children`   | `ReactNode` | —       | Custom content instead of label |

## Theming

Themes can override `TopNav` styles via `ComponentStyles`:

```tsx
// In your theme definition
const theme: Theme = {
  // ...tokens...
  components: {
    topNav: {
      root: myStyles,
    },
  },
};
```

### Available surfaces

| Surface | Description         |
| ------- | ------------------- |
| `root`  | Root nav bar styles |

## Files

| File                     | Role  | Purpose                      |
| ------------------------ | ----- | ---------------------------- |
| `index.ts`               | Entry | Exports components and types |
| `XDSTopNav.tsx`          | Core  | Main navigation container    |
| `XDSTopNavTitle.tsx`     | Core  | Title with logo and text     |
| `XDSTopNavTitleIcon.tsx` | Core  | Circular icon container      |
| `XDSTopNavItem.tsx`      | Core  | Navigation link item         |
| `XDSTopNav.test.tsx`     | Test  | Unit tests                   |

## Layout Structure

XDSTopNav works directly in XDSLayout's `header` slot — no XDSLayoutHeader
wrapper needed. TopNav manages its own padding, height, and divider.

```tsx
import {XDSLayout, XDSLayoutContent, XDSLayoutPanel} from '@xds/core/Layout';
import {XDSTopNav, XDSTopNavTitle, XDSTopNavItem} from '@xds/core/TopNav';

<XDSLayout
  header={
    <XDSTopNav
      label="Main navigation"
      title={<XDSTopNavTitle title="My App" logo={<Logo />} />}
      startContent={
        <>
          <XDSTopNavItem label="Home" href="/" isSelected />
          <XDSTopNavItem label="Settings" href="/settings" />
        </>
      }
      endContent={<Avatar />}
    />
  }
  content={
    <XDSLayoutContent role="main">
      <MainContent />
    </XDSLayoutContent>
  }
/>;
```

## Slot Layout Structure

**Standard layout** (no `centerContent`):

```
┌─────────────────────────────────────────────────────────────┐
│ [title]  [startContent ...]              [...endContent]    │
│  └─ left aligned ─────────────────────────── right aligned ─┤
└─────────────────────────────────────────────────────────────┘
```

**Three-column layout** (with `centerContent`):

```
┌─────────────────────────────────────────────────────────────┐
│ [title] [start...]   [centerContent...]   [...endContent]   │
│  └─ flex: 1 ──────── centered ──────────── flex: 1 ────────┤
└─────────────────────────────────────────────────────────────┘
```

When `centerContent` is provided, the left and right sections flex equally
(`flex: 1 1 0%`) so the center content stays visually centered regardless
of how much content is in the start or end slots.

## Implementation Notes

- XDSTopNav uses `role="navigation"` and accepts `aria-label` via the `label` prop
- Without `centerContent`: title and startContent grow to push endContent right
- With `centerContent`: left and right sections use equal flex basis for true centering
- XDSTopNavItem supports `aria-current="page"` when `isSelected` is true
- XDSTopNavTitleIcon uses `--color-accent` background with `--color-icon-on-media` for contrast
- Default height is 48px with 16px horizontal padding
- Always displays a bottom divider using `--color-divider` token
- Uses `--color-navbar` token for background (defaults to white)
