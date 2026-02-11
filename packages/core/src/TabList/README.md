# /packages/core/src/TabList

XDSTabList component for tab navigation with overflow menu support.

<!-- SYNC: When files in this directory change, update this document. -->

## Features

- **Context-based communication**: `XDSTabListContext` passes value/onChange/size from XDSTabList to children
- **Single-responsibility XDSTab**: Renders as `<button>` or `<a>` (when `href` is provided) in the nav
- **Overflow menu**: `XDSTabMenu` accepts an `options` prop and renders menu items internally
- **Dynamic trigger label**: Menu trigger shows the selected option's label when one is active
- **Menu heading**: Dropdown includes an `XDSDivider` with the menu's `label` as a separator heading
- **Selection indicator**: Selected menu items show a checkmark icon (matching XDSSelector pattern)
- **Keyboard navigation**: Tab between items, ArrowUp/Down in menu, Home/End, Escape closes menu (via `useListFocus`)
- **Hover state**: Unselected tabs show a gray underline on hover; no background hover overlay
- **Accessibility**: `nav` landmark, `aria-current="page"` on selected tabs, `role="menu"` + `aria-label` on dropdown, `aria-controls` connecting trigger to menu, `role="menuitem"` for items, `role="separator"` for heading divider

## Usage

```tsx
import { XDSTabList, XDSTab, XDSTabMenu } from '@xds/core/TabList';

// Basic usage
<XDSTabList value={activeTab} onChange={setActiveTab}>
  <XDSTab value="home" label="Home" />
  <XDSTab value="settings" label="Settings" />
</XDSTabList>

// With links
<XDSTabList value={activeTab} onChange={setActiveTab}>
  <XDSTab value="home" label="Home" href="/home" />
  <XDSTab value="settings" label="Settings" href="/settings" />
</XDSTabList>

// With icons
<XDSTabList value={activeTab} onChange={setActiveTab}>
  <XDSTab value="home" label="Home" icon={<HomeIcon />} selectedIcon={<HomeFilledIcon />} />
  <XDSTab value="settings" label="Settings" icon={<CogIcon />} />
</XDSTabList>

// With bottom divider
<XDSTabList value={activeTab} onChange={setActiveTab} hasDivider>
  <XDSTab value="home" label="Home" />
  <XDSTab value="settings" label="Settings" />
</XDSTabList>

// With overflow menu (including icons on menu items)
<XDSTabList value={activeTab} onChange={setActiveTab}>
  <XDSTab value="home" label="Home" />
  <XDSTab value="settings" label="Settings" />
  <XDSTabMenu
    label="More"
    options={[
      {value: 'analytics', label: 'Analytics', icon: ChartBarIcon},
      {value: 'reports', label: 'Reports', icon: DocumentTextIcon},
    ]}
  />
</XDSTabList>
```

## Props

### XDSTabList

| Prop         | Type                   | Default | Description                        |
| ------------ | ---------------------- | ------- | ---------------------------------- |
| `value`      | `string`               | —       | Active tab value                   |
| `onChange`   | `(v: string) => void`  | —       | Tab change callback                |
| `size`       | `'sm' \| 'md' \| 'lg'` | `'md'`  | Size variant for tabs              |
| `hasDivider` | `boolean`              | `false` | Show bottom divider under tab list |
| `children`   | `ReactNode`            | —       | XDSTab/XDSTabMenu items            |

### XDSTab

| Prop           | Type        | Default     | Description                               |
| -------------- | ----------- | ----------- | ----------------------------------------- |
| `value`        | `string`    | —           | Unique tab value                          |
| `label`        | `string`    | —           | Visible label text                        |
| `href`         | `string`    | `undefined` | URL; renders as `<a>` when provided       |
| `icon`         | `ReactNode` | `undefined` | Icon when not selected                    |
| `selectedIcon` | `ReactNode` | `undefined` | Icon when selected (falls back to `icon`) |

### XDSTabMenu

| Prop      | Type                 | Default | Description                                               |
| --------- | -------------------- | ------- | --------------------------------------------------------- |
| `label`   | `string`             | —       | Trigger label (shown when no option selected) and heading |
| `options` | `XDSTabMenuOption[]` | —       | Menu options rendered in dropdown                         |

### XDSTabMenuOption

| Field   | Type          | Description                    |
| ------- | ------------- | ------------------------------ |
| `value` | `string`      | Option value                   |
| `label` | `string`      | Option display label           |
| `icon`  | `XDSIconType` | Optional icon before the label |

## Files

| File                   | Role    | Purpose                                    |
| ---------------------- | ------- | ------------------------------------------ |
| `index.ts`             | Entry   | Exports all components and types           |
| `XDSTabListContext.ts` | Context | XDSTabListContext definition               |
| `XDSTabList.tsx`       | Core    | Nav wrapper providing XDSTabListContext    |
| `XDSTab.tsx`           | Core    | Tab button/link with `aria-current="page"` |
| `XDSTabMenu.tsx`       | Core    | Menu trigger with `role="menu"` dropdown   |
| `XDSTabList.test.tsx`  | Test    | Unit tests                                 |

## Accessibility

### XDSTab

- Renders as `<button>` or `<a>` (no `role="tab"` — uses navigation pattern instead)
- Selected tab has `aria-current="page"`
- Hover shows gray underline; selected shows accent underline

### XDSTabMenu

- Trigger: `aria-haspopup="menu"` + `aria-expanded` + `aria-controls` pointing to menu
- Dropdown: `role="menu"` + `id` (matching `aria-controls`) + `aria-label`
- Heading: `XDSDivider` with `role="separator"`
- Items: `role="menuitem"` + `aria-current="true"` for selected
- Keyboard: ArrowUp/Down (wrapping), Home/End, Escape to close (via `useListFocus` hook)

## Implementation Notes

- `XDSTab` renders as `<button>` by default, `<a>` when `href` is provided
- `XDSTabMenu` renders menu items internally from `options` prop — no child composition
- Trigger label derives from `options.find(o => o.value === ctx.value)?.label ?? label`
- Menu trigger underline scopes to the label text only (not the chevron icon)
- Icons on menu items render via `XDSIcon` with `size="sm"` and `color="secondary"`
- Selected menu items show a `CheckIcon` checkmark (matching XDSSelector pattern)
- `hasDivider` on XDSTabList controls the bottom border (default: off)
- Size uses hardcoded 28/32/36px heights (`sizeVars` not yet available on this branch)
