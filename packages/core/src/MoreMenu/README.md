# MoreMenu

Overflow menu with a three-dot icon trigger. A convenience wrapper that composes an icon-only XDSButton with a dropdown menu, eliminating the boilerplate of wiring up state management, positioning, and accessibility attributes.

<!-- SYNC: When files in this directory change, update this document. -->

## Features

- **Zero-config defaults**: Three-dot icon, "More options" label, ghost variant — just pass `items`
- **Data-driven items**: Same `items` prop as XDSDropdownMenu (items, dividers, sections)
- **Icon-only trigger**: Always renders as a square icon button with aria-label
- **Keyboard navigation**: Full keyboard support (Arrow keys, Home, End, Enter, Space, Escape)
- **Accessibility**: Proper ARIA roles (`menu`, `menuitem`), `aria-haspopup`, `aria-expanded`
- **Tooltip**: Shows label on hover, hidden when menu is open
- **Custom rendering**: Optional `children` render function for custom item content

## Usage

```tsx
import {XDSMoreMenu} from '@xds/core/MoreMenu';

// Minimal — just actions
<XDSMoreMenu
  items={[
    { label: 'Edit', onClick: handleEdit },
    { label: 'Delete', onClick: handleDelete },
  ]}
/>

// With custom label and size (e.g., table row actions)
<XDSMoreMenu
  label="Row actions"
  size="sm"
  items={[
    { label: 'Edit', icon: PencilIcon, onClick: () => handleEdit(row) },
    { type: 'divider' },
    { label: 'Delete', icon: TrashIcon, onClick: () => handleDelete(row) },
  ]}
/>

// With sections
<XDSMoreMenu
  label="Document actions"
  items={[
    {
      type: 'section',
      title: 'Actions',
      items: [
        { label: 'Edit', onClick: handleEdit },
        { label: 'Duplicate', onClick: handleDuplicate },
      ],
    },
    {
      type: 'section',
      title: 'Danger zone',
      items: [
        { label: 'Delete', onClick: handleDelete },
      ],
    },
  ]}
/>

// With custom item rendering
<XDSMoreMenu
  label="User actions"
  items={actions}
>
  {item => (
    <XDSDropdownMenuItem
      icon={item.icon}
      label={item.label}
      description={item.description}
    />
  )}
</XDSMoreMenu>
```

## Composition Stories

### Table row actions

```tsx
<td>
  <XDSMoreMenu
    size="sm"
    label="Row actions"
    items={[
      {label: 'Edit', icon: PencilIcon, onClick: () => handleEdit(row)},
      {type: 'divider'},
      {label: 'Delete', icon: TrashIcon, onClick: () => handleDelete(row)},
    ]}
  />
</td>
```

### Card header

```tsx
<div
  style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  }}>
  <XDSHeading level={3}>Card Title</XDSHeading>
  <XDSMoreMenu
    items={[
      {label: 'Edit', onClick: handleEdit},
      {label: 'Duplicate', onClick: handleDuplicate},
      {type: 'divider'},
      {label: 'Delete', onClick: handleDelete},
    ]}
  />
</div>
```

### Toolbar (alongside other buttons)

```tsx
<div style={{display: 'flex', gap: 8}}>
  <XDSButton label="Save" variant="primary" />
  <XDSButton label="Preview" variant="secondary" />
  <XDSMoreMenu label="More actions" items={overflowActions} />
</div>
```

## Props

### XDSMoreMenu

| Prop          | Type                                           | Default          | Description                                    |
| ------------- | ---------------------------------------------- | ---------------- | ---------------------------------------------- |
| `items`       | `XDSDropdownMenuOption[]`                      | —                | Menu items (items, dividers, or sections)      |
| `label`       | `string`                                       | `'More options'` | Accessible label (aria-label) and tooltip text |
| `variant`     | `XDSButtonVariant`                             | `'ghost'`        | Visual style variant of the trigger button     |
| `size`        | `XDSButtonSize`                                | `'md'`           | Size of the trigger button                     |
| `icon`        | `ReactNode`                                    | Three-dot icon   | Override the default three-dot icon            |
| `isDisabled`  | `boolean`                                      | `false`          | Whether the menu trigger is disabled           |
| `children`    | `(item: XDSDropdownMenuItemData) => ReactNode` | —                | Custom render function for items               |
| `data-testid` | `string`                                       | —                | Test ID for testing frameworks                 |

## When to use XDSMoreMenu vs XDSDropdownMenu

- **XDSMoreMenu**: Icon-only trigger (three dots), no visible label. Best for overflow actions in tight spaces (table rows, card headers, list items).
- **XDSDropdownMenu**: Labeled trigger button with chevron. Best for primary dropdown selections (file menus, action selectors).

For full control over the trigger or menu content, compose `XDSButton` + `useXDSLayer` + `XDSDropdownMenuItem` directly.

## Files

| File                   | Role    | Purpose                       |
| ---------------------- | ------- | ----------------------------- |
| `index.ts`             | Entry   | Exports component and types   |
| `XDSMoreMenu.tsx`      | Core    | Main component implementation |
| `XDSMoreMenu.test.tsx` | Testing | Unit tests                    |
