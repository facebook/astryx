# XDSTimeInput

Time input with text parsing and keyboard navigation.

## Import

```tsx
import {XDSTimeInput} from '@xds/core/TimeInput';
```

## Usage

```tsx
// Basic usage
<XDSTimeInput
  label="Start time"
  value={time}
  onChange={setTime}
/>

// 24-hour format with clear button
<XDSTimeInput
  label="Meeting time"
  value={time}
  onChange={setTime}
  hourFormat="24h"
  hasClear
/>

// With min/max constraints
<XDSTimeInput
  label="Business hours"
  value={time}
  onChange={setTime}
  min="09:00"
  max="17:00"
/>

// With seconds and validation
<XDSTimeInput
  label="Precise time"
  value={time}
  onChange={setTime}
  hasSeconds
  status={{ type: 'error', message: 'Invalid time' }}
/>
```

## Props

| Prop            | Type                                              | Default           | Description                                    |
| --------------- | ------------------------------------------------- | ----------------- | ---------------------------------------------- |
| `label`         | `string`                                          | —                 | Label text (required for accessibility)        |
| `isLabelHidden` | `boolean`                                         | `false`           | Visually hide label                            |
| `description`   | `string`                                          | —                 | Description text below label                   |
| `isOptional`    | `boolean`                                         | `false`           | Show "(optional)" indicator                    |
| `isRequired`    | `boolean`                                         | `false`           | Mark field as required                         |
| `isDisabled`    | `boolean`                                         | `false`           | Disable the input                              |
| `value`         | `ISOTimeString`                                   | —                 | Selected time (HH:MM or HH:MM:SS)             |
| `onChange`      | `(value: ISOTimeString \| undefined) => void`     | —                 | Callback fired when time changes               |
| `min`           | `ISOTimeString`                                   | —                 | Minimum selectable time                        |
| `max`           | `ISOTimeString`                                   | —                 | Maximum selectable time                        |
| `hasSeconds`    | `boolean`                                         | `false`           | Include seconds in the time input              |
| `hasClear`      | `boolean`                                         | `false`           | Show clear button when value is set            |
| `hourFormat`    | `'12h' \| '24h'`                                  | `'12h'`           | Hour display format                            |
| `increment`     | `number`                                          | `1`               | Increment in minutes for arrow keys            |
| `placeholder`   | `string`                                          | `"Select a time"` | Placeholder text                               |
| `size`          | `'sm' \| 'md'`                                    | `'md'`            | Input size                                     |
| `status`        | `XDSInputStatus`                                  | —                 | Status indicator (error/warning/success)       |

## Theming

Themes can override `TimeInput` styles via `ComponentStyles`:

```tsx
// In your theme definition
const theme: Theme = {
  // ...tokens...
  components: {
    timeInput: {
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
