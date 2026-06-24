# XDSSelector — Dropdown Selector Component

A dropdown selector for choosing from a list of options. Supports simple strings, rich options with icons/descriptions, sections, and dividers.

## Import

```tsx
import {XDSSelector, XDSSelectorOption} from '@astryxdesign/core';
```

## Basic Usage

```tsx
// Simple string options
<XDSSelector
  label="Fruit"
  options={['Apple', 'Banana', 'Orange']}
  value={fruit}
  onChange={setFruit}
  placeholder="Select a fruit..."
/>

// Rich options with icons and descriptions
<XDSSelector
  label="Status"
  options={[
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
  options={[
    { type: 'section', title: 'Edit', options: [
      { value: 'cut', label: 'Cut' },
      { value: 'copy', label: 'Copy' },
    ]},
    { type: 'divider' },
    { type: 'section', title: 'View', options: [
      { value: 'zoom-in', label: 'Zoom In' },
      { value: 'zoom-out', label: 'Zoom Out' },
    ]},
  ]}
  value={action}
  onChange={setAction}
/>
```

## Custom Option Rendering

```tsx
<XDSSelector
  label="User"
  options={users.map(u => ({value: u.id, label: u.name, icon: 'user'}))}
  value={selectedUser}
  onChange={setSelectedUser}
  renderOption={option => (
    <XDSSelectorOption
      icon={option.icon}
      label={option.label}
      description={option.email}
    />
  )}
/>
```

## Props

### XDSSelector

| Prop          | Type                                                          | Default     | Description                           |
| ------------- | ------------------------------------------------------------- | ----------- | ------------------------------------- |
| label         | string                                                        | required    | Label text (always rendered for a11y) |
| options       | Array<string \| OptionData \| Divider \| Section>             | required    | The options to display                |
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
| renderOption  | (option: OptionData) => ReactNode                             | —           | Custom option renderer                |

### XDSSelectorOption (for custom rendering)

| Prop        | Type        | Description        |
| ----------- | ----------- | ------------------ |
| icon        | XDSIconType | Leading icon       |
| label       | ReactNode   | Primary text       |
| description | ReactNode   | Secondary text     |
| children    | ReactNode   | Additional content |

### Option Types

```ts
type OptionData = {
  value: string;
  label?: string;
  disabled?: boolean;
  icon?: XDSIconType;
};
type Divider = {type: 'divider'};
type Section = {type: 'section'; title?: string; options: OptionData[]};
```
