# TopNav

Top navigation bar component for application headers.

<!-- SYNC: When files in this directory change, update this document. -->

## Import

```tsx
import {XDSTopNav, XDSTopNavTitle, XDSTopNavItem} from '@xds/core/TopNav';
```

## Features

- **Slot-based layout**: `title`, `startContent`, `endContent` for flexible organization
- **Companion components**: XDSTopNavTitle, XDSTopNavItem
- **Accessible**: Proper ARIA roles and keyboard navigation
- **Themeable**: Uses XDS design tokens for styling

## Usage

```tsx
import {XDSTopNav, XDSTopNavTitle, XDSTopNavItem} from '@xds/core/TopNav';
import {XDSNavIcon} from '@xds/core/NavIcon';
import {XDSButton} from '@xds/core/Button';
import {HomeIcon, BellIcon, UserCircleIcon} from '@heroicons/react/24/outline';

<XDSTopNav
  label="Main navigation"
  title={
    <XDSTopNavTitle
      title="My App"
      logo={<XDSNavIcon icon={<HomeIcon style={{width: 16, height: 16}} />} />}
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
- **XDSTopNavItem** — Navigation link item
- **XDSTopNavMenu** — Navigation item with hover-triggered overflow menu

For the circular icon container, use `XDSNavIcon` from `@xds/core/NavIcon`.

## Props

### XDSTopNav

```tsx
<XDSTopNav
  label="Main navigation"
  title={<XDSTopNavTitle title="My App" href="/" />}
  startContent={
    <XDSTopNavItem label="Dashboard" href="/dashboard" isSelected />
  }
  endContent={<XDSButton label="Profile" variant="ghost" />}
/>
```

| Prop           | Type        | Default | Description                                           |
| -------------- | ----------- | ------- | ----------------------------------------------------- |
| `title`        | `ReactNode` | —       | Title slot (logo, brand) - left aligned               |
| `startContent` | `ReactNode` | —       | Start content (nav items, breadcrumbs) - left aligned |
| `endContent`   | `ReactNode` | —       | End content (search, icons, profile) - right aligned  |
| `label`        | `string`    | —       | Accessible label for navigation landmark              |

### XDSTopNavTitle

```tsx
<XDSTopNavTitle
  title="My App"
  logo={<XDSNavIcon icon={<HomeIcon />} />}
  href="/"
/>
```

| Prop    | Type        | Default | Description                      |
| ------- | ----------- | ------- | -------------------------------- |
| `title` | `string`    | —       | Title text to display            |
| `logo`  | `ReactNode` | —       | Logo element (image, XDSNavIcon) |
| `href`  | `string`    | —       | URL to navigate to when clicked  |

### XDSTopNavItem

```tsx
<XDSTopNavItem
  label="Dashboard"
  href="/dashboard"
  isSelected
  icon={<HomeIcon />}
/>
```

| Prop         | Type        | Default | Description                     |
| ------------ | ----------- | ------- | ------------------------------- |
| `label`      | `string`    | —       | Accessible label (required)     |
| `href`       | `string`    | —       | Navigation target URL           |
| `isSelected` | `boolean`   | `false` | Selected/highlighted state      |
| `isDisabled` | `boolean`   | `false` | Disabled state                  |
| `icon`       | `ReactNode` | —       | Optional icon element           |
| `children`   | `ReactNode` | —       | Custom content instead of label |

### XDSTopNavMenu

```tsx
<XDSTopNavMenu
  label="Products"
  items={[
    {title: 'Analytics', description: 'View metrics', href: '/analytics'},
    {title: 'Reports', description: 'Generate reports', href: '/reports'},
  ]}
/>
```

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

## Selected State

When `isSelected` is true, nav items show:

- **Background**: `--color-accent-deemphasized` (subtle accent tint)
- **Text**: `--color-text-primary` with semibold weight
- **Icon**: Primary color; use `selectedIcon` for filled variants

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

**Three-column layout** (with `centerContent`):

```
┌─────────────────────────────────────────────────────────────┐
│ [title] [start...]   [centerContent...]   [...endContent]   │
│  └─ 1fr start ──┘   └── auto center ──┘   └── 1fr end ───┤
└─────────────────────────────────────────────────────────────┘
```

When `centerContent` is provided, the layout switches to a CSS grid with
`gridTemplateColumns: '1fr auto 1fr'`. This guarantees the center column
is always at the exact horizontal center of the nav bar, regardless of
left/right content widths. The right column is always rendered (even when
`endContent` is absent) to maintain the three-column grid structure.

## Implementation Notes

- XDSTopNav uses `role="navigation"` and accepts `aria-label` via the `label` prop
- Without `centerContent`: title and startContent grow to push endContent right
- With `centerContent`: switches to CSS grid (`1fr auto 1fr`) for true centering
- XDSTopNavItem supports `aria-current="page"` when `isSelected` is true
- Default height is 48px with 16px horizontal padding
- Uses `--color-navbar` token for background (defaults to white)
- Positioning (sticky/fixed) is handled by the layout system (e.g. XDSAppShell), not TopNav itself
- Dividers are controlled by the layout system (e.g. XDSLayoutHeader's `hasDivider`), not TopNav
