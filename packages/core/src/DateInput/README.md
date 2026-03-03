# DateInput

XDSDateInput component combining a text input with a calendar popover for date selection.

## Import

```tsx
import {XDSDateInput} from '@xds/core/DateInput';
```

## Features

- **Text Input**: Manual date entry with flexible parsing (supports various formats)
- **Calendar Popover**: Click icon or use keyboard to open calendar picker
- **Date Constraints**: `min`, `max`, and custom `dateConstraints` functions
- **Status Indicators**: Error, warning, and success states with messages
- **Accessibility**: Full keyboard navigation, focus trapping, screen reader support
- **Field Integration**: Built on XDSField for consistent label, description, and validation states

## Usage

```tsx
import { XDSDateInput } from '@xds/core/DateInput';

// Basic usage
<XDSDateInput
  label="Event date"
  value={date}
  onChange={setDate}
/>

// With constraints
<XDSDateInput
  label="Departure date"
  value={date}
  onChange={setDate}
  min="2026-01-01"
  max="2026-12-31"
  placeholder="Pick a date"
/>

// Two-month calendar
<XDSDateInput
  label="Check-in date"
  value={date}
  onChange={setDate}
  numberOfMonths={2}
/>

// With description and required
<XDSDateInput
  label="Due date"
  description="When should this task be completed?"
  isRequired
  value={date}
  onChange={setDate}
/>

// With error status
<XDSDateInput
  label="Event date"
  value={date}
  onChange={setDate}
  status={{
    type: 'error',
    message: 'This date is not available',
  }}
/>
```

## Props

| Prop              | Type                                          | Default           | Description                              |
| ----------------- | --------------------------------------------- | ----------------- | ---------------------------------------- |
| `label`           | `string`                                      | —                 | Label text (required)                    |
| `isLabelHidden`   | `boolean`                                     | `false`           | Visually hide label                      |
| `description`     | `string`                                      | —                 | Helper text below label                  |
| `isOptional`      | `boolean`                                     | `false`           | Show "(optional)" indicator              |
| `isRequired`      | `boolean`                                     | `false`           | Mark field as required                   |
| `isDisabled`      | `boolean`                                     | `false`           | Disable input and calendar               |
| `value`           | `ISODateString`                               | —                 | Selected date (YYYY-MM-DD)               |
| `onChange`        | `(value: ISODateString \| undefined) => void` | —                 | Selection callback                       |
| `min`             | `ISODateString`                               | —                 | Minimum selectable date                  |
| `max`             | `ISODateString`                               | —                 | Maximum selectable date                  |
| `dateConstraints` | `Array<(date: Date) => boolean>`              | —                 | Custom constraint functions              |
| `placeholder`     | `string`                                      | `"Select a date"` | Input placeholder text                   |
| `size`            | `'sm' \| 'md' \| 'lg'`                        | `'md'`            | Input size                               |
| `status`          | `XDSInputStatus`                              | —                 | Status indicator (error/warning/success) |
| `numberOfMonths`  | `1 \| 2`                                      | `1`               | Months shown in calendar popover         |

## Keyboard Navigation

- **Tab**: Move between input and calendar icon button
- **Enter/Space** on icon: Open calendar and move focus into it
- **Escape**: Close calendar popover
- **Arrow keys** in calendar: Navigate between days
- **Page Up/Down** in calendar: Navigate between months

## Date Input Parsing

The text input accepts various date formats:

- ISO format: `2026-01-28`
- US format: `01/28/2026`, `1/28/2026`
- Written: `Jan 28, 2026`, `January 28 2026`

Invalid input reverts to the previous valid value on blur.

## Theming

Themes can override `DateInput` styles via `ComponentStyles`:

```tsx
// In your theme definition
const theme: Theme = {
  // ...tokens...
  components: {
    dateInput: {
      wrapper: myStyles,
      input: myStyles,
    },
  },
};
```

### Available surfaces

| Surface   | Description               |
| --------- | ------------------------- |
| `wrapper` | Input wrapper styles      |
| `input`   | Text input element styles |

## Files

| File                  | Role   | Purpose                  |
| --------------------- | ------ | ------------------------ |
| XDSDateInput.tsx      | Core   | Component implementation |
| XDSDateInput.test.tsx | Test   | Unit tests               |
| index.ts              | Export | Public API exports       |
| README.md             | Docs   | This documentation       |
