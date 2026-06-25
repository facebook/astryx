# XDSSelector — Dropdown Selector Component

A dropdown selector for choosing from a list of items. Supports simple strings, rich items with icons/descriptions, sections, and dividers.

## Import

```tsx
import {XDSSelector, XDSSelectorItem} from '@astryxdesign/core';
```

## Basic Usage

```tsx
// Simple string items
<XDSSelector
  label="Fruit"
  items={['Apple', 'Banana', 'Orange']}
  value={fruit}
  onChange={setFruit}
  placeholder="Select a fruit..."
/>

// Rich items with icons and descriptions
<XDSSelector
  label="Status"
  items={[
    { value: 'active', label: 'Active', icon: 'checkCircle' },
    { value: 'paused', label: 'Paused', icon: 'pause' },
    { value: 'archived', label: 'Archived', icon: 'archive' },
  ]}
  value={status}
  onChange={setStatus}
/>

// Sections and dividers
<XDSSelector
  label="Action"
  items={[
    { type: 'section', title: 'Edit', items: [
      { value: 'cut', label: 'Cut' },
      { value: 'copy', label: 'Copy' },
    ]},
    { type: 'divider' },
    { type: 'section', title: 'View', items: [
      { value: 'zoom-in', label: 'Zoom In' },
      { value: 'zoom-out', label: 'Zoom Out' },
    ]},
  ]}
  value={action}
  onChange={setAction}
/>
```

## Custom Item Rendering

```tsx
<XDSSelector
  label="User"
  items={users.map(u => ({value: u.id, label: u.name, icon: 'user'}))}
  value={selectedUser}
  onChange={setSelectedUser}
  renderOption={item => (
    <XDSSelectorItem
      icon={item.icon}
      label={item.label}
      description={item.email}
    />
  )}
/>
```

## Props

### XDSSelector

| Prop          | Type                                                          | Default     | Description                           |
| ------------- | ------------------------------------------------------------- | ----------- | ------------------------------------- |
| label         | string                                                        | required    | Label text (always rendered for a11y) |
| items         | Array<string \| ItemData \| Divider \| Section>               | required    | The items to display                  |
| value         | string                                                        | —           | Currently selected value              |
| onChange      | (value: string) => void                                       | —           | Selection change callback             |
| changeAction  | (value: string) => Promise<void>                              | —           | Async action on change                |
| placeholder   | string                                                        | 'Select...' | Placeholder when nothing selected     |
| size          | 'sm' \| 'md' \| 'lg'                                          | 'md'        | Trigger size                          |
| isDisabled    | boolean                                                       | false       | Disabled state                        |
| isLabelHidden | boolean                                                       | false       | Visually hide label                   |
| description   | string                                                        | —           | Help text below label                 |
| isOptional    | boolean                                                       | false       | Show optional indicator               |
| isRequired    | boolean                                                       | false       | Show required indicator               |
| status        | { type: 'warning' \| 'error' \| 'success', message?: string } | —           | Validation status                     |
| renderOption  | (item: ItemData) => ReactNode                                 | —           | Custom item renderer                  |

### XDSSelectorItem (for custom rendering)

| Prop        | Type        | Description        |
| ----------- | ----------- | ------------------ |
| icon        | XDSIconType | Leading icon       |
| label       | ReactNode   | Primary text       |
| description | ReactNode   | Secondary text     |
| children    | ReactNode   | Additional content |

### Item Types

```ts
type ItemData = {
  value: string;
  label?: string;
  disabled?: boolean;
  icon?: XDSIconType;
};
type Divider = {type: 'divider'};
type Section = {type: 'section'; title?: string; items: ItemData[]};
```
