# XDSSelector

Dropdown selector for choosing from a list of options. Follows XDS input conventions with label, status, and field props.

## Usage

```tsx
import {XDSSelector, XDSSelectorItem} from '@xds/core/Selector';

// Basic usage (label is required)
<XDSSelector
  label="Fruit"
  items={['Apple', 'Banana', 'Orange']}
  value={value}
  onChange={setValue}
/>

// With object items (supports disabled, icons)
<XDSSelector
  label="Settings"
  items={[
    {value: 'profile', label: 'Profile', icon: UserIcon},
    {value: 'settings', label: 'Settings', icon: CogIcon, disabled: true},
  ]}
  value={value}
  onChange={setValue}
/>

// Sections (automatically include labeled dividers)
<XDSSelector
  label="Fruit"
  items={[
    {value: 'apple', label: 'Apple'},
    {type: 'section', title: 'Citrus', items: [
      {value: 'orange', label: 'Orange'},
    ]},
  ]}
  value={value}
  onChange={setValue}
/>

// Custom rendering with XDSSelectorItem
<XDSSelector label="User" items={users} value={value} onChange={setValue}>
  {user => (
    <XDSSelectorItem
      icon={UserIcon}
      label={user.label}
      description={user.email}
    />
  )}
</XDSSelector>

// With status and field props
<XDSSelector
  label="Fruit"
  isRequired
  status={{type: 'error', message: 'Required'}}
  items={['Apple', 'Banana']}
  value={value}
  onChange={setValue}
/>
```

## Props

| Prop                        | Type                                                      | Description                                                         |
| --------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------- |
| `label`                     | `string`                                                  | **Required.** Label text for accessibility                          |
| `items`                     | `XDSSelectorOption[]`                                     | **Required.** Array of items (strings, objects, dividers, sections) |
| `value`                     | `string`                                                  | Selected value                                                      |
| `onChange`                  | `(value: string) => void`                                 | Selection callback                                                  |
| `placeholder`               | `string`                                                  | Placeholder text (default: `'Select...'`)                           |
| `size`                      | `'sm' \| 'md'`                                            | Size variant (default: `'md'`)                                      |
| `isDisabled`                | `boolean`                                                 | Disable selector                                                    |
| `isLabelHidden`             | `boolean`                                                 | Visually hide label                                                 |
| `description`               | `string`                                                  | Helper text below label                                             |
| `isOptional` / `isRequired` | `boolean`                                                 | Field requirement indicators                                        |
| `status`                    | `{type: 'error'\|'warning'\|'success', message?: string}` | Status with optional message                                        |
| `children`                  | `(item: XDSSelectorItemData) => ReactNode`                | Custom item renderer                                                |

## Item Types

```tsx
// String - converted to {value: 'Apple', label: 'Apple'}
'Apple'

// Object - with optional icon, disabled
{value: 'apple', label: 'Apple', icon?: IconComponent, disabled?: boolean}

// Divider - horizontal separator
{type: 'divider'}

// Section - grouped items with labeled divider
{type: 'section', title: 'Group Name', items: [...]}
```

## XDSSelectorItem

Helper for custom item rendering:

```tsx
<XDSSelectorItem
  icon={UserIcon} // Optional XDSIconType
  label="Primary text" // Required ReactNode
  description="Secondary" // Optional ReactNode
/>
```

## Keyboard

↑↓ navigate, Enter/Space select, Escape close, Home/End jump, A-Z typeahead.

## Accessibility

Uses `role="combobox"` trigger, `role="listbox"` dropdown, `role="group"` for sections, `aria-activedescendant` for focus.
