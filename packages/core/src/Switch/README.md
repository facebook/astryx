# /packages/core/src/Switch

A toggle switch component for boolean values with integrated label support.

<!-- SYNC: When files in this directory change, update this document. -->

## Features

- **Boolean Toggle**: Clean on/off switch for boolean values (40x24px with 20px thumb)
- **Label Integration**: Uses XDSFieldLabel for accessible labels with optional tooltip and icon
- **Label Position**: Label can appear before or after the switch (`start` or `end`)
- **Label Spacing**: Support for spread layout (label and switch on opposite ends)
- **Description**: Optional description text below the label
- **Optional/Required**: Visual indicators for field status
- **Accessibility**: Uses native checkbox with `role="switch"`, proper ARIA attributes

## Usage

```tsx
import { XDSSwitch } from '@xds/core/Switch';

// Basic usage
<XDSSwitch
  label="Enable notifications"
  value={enabled}
  onChange={setEnabled}
/>

// With description
<XDSSwitch
  label="Dark mode"
  description="Switch to a darker color scheme"
  value={darkMode}
  onChange={setDarkMode}
/>

// With label icon and tooltip
<XDSSwitch
  label="Auto-save"
  labelIcon={CloudArrowUpIcon}
  labelTooltip="Automatically save changes"
  value={autoSave}
  onChange={setAutoSave}
/>

// Label at start with spread spacing (settings panel style)
<XDSSwitch
  label="Enable notifications"
  value={enabled}
  onChange={setEnabled}
  labelPosition="start"
  labelSpacing="spread"
/>
```

## Props

| Prop            | Type                                         | Default     | Description                                   |
| --------------- | -------------------------------------------- | ----------- | --------------------------------------------- |
| `label`         | `string`                                     | —           | Label text for the switch (required)          |
| `value`         | `boolean`                                    | —           | Whether the switch is on or off               |
| `onChange`      | `(checked: boolean, e: ChangeEvent) => void` | —           | Callback fired when state changes             |
| `isLabelHidden` | `boolean`                                    | `false`     | Visually hide the label (still accessible)    |
| `description`   | `string`                                     | —           | Description text below the label              |
| `isDisabled`    | `boolean`                                    | `false`     | Whether the switch is disabled                |
| `isOptional`    | `boolean`                                    | `false`     | Whether the field is optional                 |
| `isRequired`    | `boolean`                                    | `false`     | Whether the switch is required                |
| `onFocus`       | `(e: FocusEvent) => void`                    | —           | Callback on focus                             |
| `onBlur`        | `(e: FocusEvent) => void`                    | —           | Callback on blur                              |
| `labelIcon`     | `XDSIconType`                                | —           | Icon before the label                         |
| `labelTooltip`  | `string`                                     | —           | Tooltip on info icon after label              |
| `labelPosition` | `'start' \| 'end'`                           | `'end'`     | Which side of the switch the label appears on |
| `labelSpacing`  | `'default' \| 'spread'`                      | `'default'` | Spacing behavior between label and switch     |

## Files

| File                 | Role  | Purpose                     |
| -------------------- | ----- | --------------------------- |
| `index.ts`           | Entry | Exports component and types |
| `XDSSwitch.tsx`      | Core  | Component implementation    |
| `XDSSwitch.test.tsx` | Test  | Unit tests                  |

## Implementation Notes

- Fixed dimensions: 40px width, 24px height, 16px thumb (off) / 20px thumb (on)
- Uses CSS custom properties for hover state management
- Native checkbox input with `role="switch"` for proper semantics
- Track and thumb animation with CSS transitions
- Follows the same patterns as XDSCheckboxInput for consistency
- `labelPosition="start"` with `labelSpacing="spread"` creates a settings panel style layout
