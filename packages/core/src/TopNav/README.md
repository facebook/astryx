# /packages/core/src/TopNav

Top navigation bar component for application headers.

<!-- SYNC: When files in this directory change, update this document. -->

## Features

- **Slot-based layout**: `title`, `startContent`, `endContent` for flexible organization
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

## Components

- **XDSTopNav** — Main navigation container
- **XDSTopNavTitle** — Title with logo and text
- **XDSTopNavTitleIcon** — Circular icon container for the title
- **XDSTopNavItem** — Navigation link item
- **XDSTopNavMenu** — Navigation item with hover-triggered overflow menu

## Props

### XDSTopNav

| Prop           | Type        | Default | Description                                           |
| -------------- | ----------- | ------- | ----------------------------------------------------- |
| `title`        | `ReactNode` | —       | Title slot (logo, brand) - left aligned               |
| `startContent` | `ReactNode` | —       | Start content (nav items, breadcrumbs) - left aligned |
| `endContent`   | `ReactNode` | —       | End content (search, icons, profile) - right aligned  |
| `label`        | `string`    | —       | Accessible label for navigation landmark              |

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

### XDSTopNavMenu

| Prop        | Type                      | Default | Description                                 |
| ----------- | ------------------------- | ------- | ------------------------------------------- |
| `label`     | `string`                  | —       | Visible label for the trigger (required)    |
| `items`     | `XDSTopNavMenuItemData[]` | —       | Menu items to display in the hover popover  |
| `delay`     | `number`                  | `150`   | Delay before showing on hover (ms)          |
| `hideDelay` | `number`                  | `200`   | Delay before hiding after mouse leaves (ms) |

#### XDSTopNavMenuItemData

| Property      | Type         | Description                      |
| ------------- | ------------ | -------------------------------- |
| `title`       | `string`     | Display title (required)         |
| `description` | `string`     | Optional description below title |
| `icon`        | `ReactNode`  | Optional icon on the left        |
| `href`        | `string`     | URL to navigate to               |
| `onClick`     | `() => void` | Callback on click                |

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

| File                     | Role  | Purpose                           |
| ------------------------ | ----- | --------------------------------- |
| `index.ts`               | Entry | Exports components and types      |
| `XDSTopNav.tsx`          | Core  | Main navigation container         |
| `XDSTopNavTitle.tsx`     | Core  | Title with logo and text          |
| `XDSTopNavTitleIcon.tsx` | Core  | Circular icon container           |
| `XDSTopNavItem.tsx`      | Core  | Navigation link item              |
| `XDSTopNavMenu.tsx`      | Core  | Nav item with hover overflow menu |
| `XDSTopNav.test.tsx`     | Test  | Unit tests for TopNav components  |
| `XDSTopNavMenu.test.tsx` | Test  | Unit tests for XDSTopNavMenu      |

## Layout Structure

XDSTopNav works in XDSLayout's `header` slot via XDSLayoutHeader (which handles
the divider) or directly. TopNav manages its own padding and height.

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

```
┌─────────────────────────────────────────────────────────────┐
│ [title]  [startContent ...]              [...endContent]    │
│  └─ left aligned ─────────────────────────── right aligned ─┤
└─────────────────────────────────────────────────────────────┘
```

## Implementation Notes

- XDSTopNav uses `role="navigation"` and accepts `aria-label` via the `label` prop
- Title and startContent are in a flex container that grows to push endContent right
- XDSTopNavItem supports `aria-current="page"` when `isSelected` is true
- XDSTopNavTitleIcon uses `--color-accent` background with `--color-icon-on-media` for contrast
- Default height is 48px with 16px horizontal padding
- Uses `--color-navbar` token for background (defaults to white)
- Positioning (sticky/fixed) is handled by the layout system (e.g. XDSAppShell), not TopNav itself
- Dividers are controlled by the layout system (e.g. XDSLayoutHeader's `hasDivider`), not TopNav
