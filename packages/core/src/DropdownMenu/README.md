# /packages/core/src/DropdownMenu

A dropdown menu component for displaying actionable items in a popup menu.

<!-- SYNC: When files in this directory change, update this document. -->

## Features

- **Button customization**: Customize the trigger button via the `button` prop (supports all XDSButton props)
- **Data-driven items**: Pass items via the `items` prop with support for sections and dividers
- **Controlled/Uncontrolled**: Supports both controlled (`isMenuOpen`/`onMenuToggle`) and uncontrolled modes
- **Custom menu width**: Override default width (matches button) via `menuWidth` prop
- **Sections**: Group related items with optional headers using `XDSDropdownMenuSection`
- **Keyboard navigation**: Full keyboard support (Arrow keys, Home, End, Enter, Space, Escape)
- **Accessibility**: Proper ARIA roles (menu, menuitem) and attributes
- **Custom rendering**: Optional `children` render function with `XDSDropdownMenuItem` helper

## Usage

```tsx
import {XDSDropdownMenu, XDSDropdownMenuItem} from '@xds/core/DropdownMenu';

// Basic usage
<XDSDropdownMenu
  button={{ label: 'Actions' }}
  items={[
    { label: 'Edit', onClick: () => handleEdit() },
    { label: 'Delete', onClick: () => handleDelete() },
  ]}
/>

// With icons
<XDSDropdownMenu
  button={{ label: 'Actions' }}
  items={[
    { label: 'Edit', icon: PencilIcon, onClick: () => handleEdit() },
    { label: 'Delete', icon: TrashIcon, onClick: () => handleDelete() },
  ]}
/>

// With sections
<XDSDropdownMenu
  button={{ label: 'File', variant: 'ghost' }}
  items={[
    {
      type: 'section',
      title: 'Create',
      items: [
        { label: 'New File', onClick: () => handleNew() },
        { label: 'New Folder', onClick: () => handleNewFolder() },
      ],
    },
    {
      type: 'section',
      title: 'Manage',
      items: [
        { label: 'Rename', onClick: () => handleRename() },
        { label: 'Delete', disabled: true },
      ],
    },
  ]}
/>

// With dividers
<XDSDropdownMenu
  button={{ label: 'Actions' }}
  items={[
    { label: 'Edit', onClick: () => handleEdit() },
    { type: 'divider' },
    { label: 'Delete', onClick: () => handleDelete() },
  ]}
/>

// Controlled mode
const [isOpen, setIsOpen] = useState(false);
<XDSDropdownMenu
  button={{ label: 'Options' }}
  items={[...]}
  isMenuOpen={isOpen}
  onMenuToggle={setIsOpen}
/>

// Custom item rendering with XDSDropdownMenuItem
<XDSDropdownMenu
  button={{ label: 'Users' }}
  items={users}
>
  {item => (
    <XDSDropdownMenuItem
      icon={item.icon}
      label={item.label}
      description={item.email}
    />
  )}
</XDSDropdownMenu>
```

## Props

### XDSDropdownMenu

| Prop           | Type                                           | Default             | Description                                                   |
| -------------- | ---------------------------------------------- | ------------------- | ------------------------------------------------------------- |
| `button`       | `XDSDropdownMenuButtonProps`                   | `{ label: 'Menu' }` | Props for the trigger button (XDSButton props except onClick) |
| `items`        | `XDSDropdownMenuOption[]`                      | —                   | Menu items (items, dividers, or sections)                     |
| `isMenuOpen`   | `boolean`                                      | —                   | Controlled open state                                         |
| `onMenuToggle` | `(isOpen: boolean) => void`                    | —                   | Callback when open state changes                              |
| `menuWidth`    | `number \| string`                             | —                   | Custom menu width (default: matches button)                   |
| `onClick`      | `() => void`                                   | —                   | Callback when button is clicked                               |
| `children`     | `(item: XDSDropdownMenuItemData) => ReactNode` | —                   | Custom render function for items                              |

### XDSDropdownMenuItem

Helper component for custom item rendering with consistent styling.

| Prop          | Type           | Default | Description                                    |
| ------------- | -------------- | ------- | ---------------------------------------------- |
| `icon`        | `XDSIconType`  | —       | Icon to display before the label               |
| `label`       | `ReactNode`    | —       | Primary label text                             |
| `description` | `ReactNode`    | —       | Secondary description text below the label     |
| `children`    | `ReactNode`    | —       | Additional content after the label/description |
| `xstyle`      | `StyleXStyles` | —       | StyleX styles for the root container           |

### XDSDropdownMenuItemData

| Prop       | Type          | Default | Description                      |
| ---------- | ------------- | ------- | -------------------------------- |
| `label`    | `string`      | —       | Display label for the item       |
| `onClick`  | `() => void`  | —       | Callback when item is selected   |
| `disabled` | `boolean`     | `false` | Whether the item is disabled     |
| `icon`     | `XDSIconType` | —       | Icon to display before the label |

### XDSDropdownMenuDivider

| Prop   | Type        | Value       | Description       |
| ------ | ----------- | ----------- | ----------------- |
| `type` | `'divider'` | `'divider'` | Indicates divider |

### XDSDropdownMenuSection

| Prop    | Type                        | Default | Description             |
| ------- | --------------------------- | ------- | ----------------------- |
| `type`  | `'section'`                 | —       | Indicates section       |
| `title` | `string`                    | —       | Optional section header |
| `items` | `XDSDropdownMenuItemData[]` | —       | Items in the section    |

## Files

| File                       | Role      | Purpose                          |
| -------------------------- | --------- | -------------------------------- |
| `index.ts`                 | Entry     | Exports components and types     |
| `XDSDropdownMenu.tsx`      | Core      | Main component implementation    |
| `XDSDropdownMenuItem.tsx`  | Component | Helper for custom item rendering |
| `XDSDropdownMenu.test.tsx` | Testing   | Unit tests                       |

## Implementation Notes

- Uses `useXDSLayer` with `mode: 'context'` for CSS anchor positioning
- Uses `XDSButton` internally with `ChevronDownIcon` that inherits button text color
- Items are tracked via the `items` prop to enable keyboard navigation
- Keyboard navigation skips disabled items
- Light dismiss is enabled by default (clicking outside closes menu)
- Focus returns to button when menu closes
- `XDSDropdownMenuItem` provides consistent styling for custom item layouts
