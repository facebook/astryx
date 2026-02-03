# Input Component Props Convention

This document defines the standard props that all XDS input components should implement for consistency.

## Core Field Props

All input components that represent a form field should include these props:

| Prop            | Type      | Default | Required | Description                                                        |
| --------------- | --------- | ------- | -------- | ------------------------------------------------------------------ |
| `label`         | `string`  | -       | ✓        | Accessible label text (always rendered for screen readers)         |
| `isLabelHidden` | `boolean` | `false` |          | Visually hide the label while keeping it accessible                |
| `description`   | `string`  | -       |          | Helper text displayed between label and input                      |
| `isOptional`    | `boolean` | `false` |          | Shows "(Optional)" indicator. Mutually exclusive with `isRequired` |
| `isRequired`    | `boolean` | `false` |          | Marks field as required. Mutually exclusive with `isOptional`      |
| `isDisabled`    | `boolean` | `false` |          | Disables the input                                                 |

## Value Props

| Prop       | Type                      | Description                       |
| ---------- | ------------------------- | --------------------------------- |
| `value`    | varies                    | The controlled value of the input |
| `onChange` | `(value, event?) => void` | Callback when value changes       |

### onChange Signature Convention

- **Text-based inputs** (TextInput, TextArea): Include the event for access to the DOM element

  ```ts
  onChange: (value: string, e: ChangeEvent<HTMLInputElement>) => void
  ```

- **Parsed value inputs** (DateInput, TimeInput): Event is omitted since value is parsed/transformed

  ```ts
  onChange: (value: ISODateString | undefined) => void
  onChange: (value: ISOTimeString | undefined) => void
  ```

- **Boolean inputs** (CheckboxInput): Include the event
  ```ts
  onChange: (checked: boolean, e: ChangeEvent<HTMLInputElement>) => void
  ```

## Optional Common Props

| Prop           | Type               | Default | Applicable To              | Description                        |
| -------------- | ------------------ | ------- | -------------------------- | ---------------------------------- |
| `placeholder`  | `string`           | varies  | Text-based inputs          | Placeholder text when empty        |
| `size`         | `'sm' \| 'md'`     | `'md'`  | Most inputs                | Size variant                       |
| `status`       | `{type, message?}` | -       | Inputs with validation     | Error/warning/success state        |
| `labelTooltip` | `string`           | -       | Inputs needing explanation | Tooltip on info icon next to label |
| `startIcon`    | `XDSIconType`      | -       | Inputs with icon support   | Icon at start of input             |

## Size Variants

Standard sizes across components:

| Size | Input Height | Use Case                         |
| ---- | ------------ | -------------------------------- |
| `sm` | 18px         | Compact UIs, tables, dense forms |
| `md` | 26px         | Default, most forms              |

## Status Object

For inputs that support validation status, use the shared `XDSInputStatus` type from `@xds/core`:

```ts
import type {XDSInputStatus, XDSInputStatusType} from '@xds/core';

// XDSInputStatusType = 'error' | 'warning' | 'success'

interface XDSInputStatus {
  type: XDSInputStatusType;
  message?: string; // Optional message displayed below input
}
```

Each input component re-exports these types with component-specific aliases for convenience:

- `XDSTextInputStatus`, `XDSTextInputStatusType`
- `XDSDateInputStatus`, `XDSDateInputStatusType`
- `XDSTimeInputStatus`, `XDSTimeInputStatusType`

## Current Implementation Status

| Component        | label | isLabelHidden | description | isOptional | isRequired | isDisabled | size | status | placeholder |
| ---------------- | ----- | ------------- | ----------- | ---------- | ---------- | ---------- | ---- | ------ | ----------- |
| XDSTextInput     | ✓     | ✓             | ✓           | ✓          | ✓          | ✓          | ✓    | ✓      | ✓           |
| XDSTextArea      | ✓     | ✓             | ✓           | ✓          | ✓          | ✓          | -    | -      | ✓           |
| XDSCheckboxInput | ✓     | ✓             | ✓           | -          | ✓          | ✓          | ✓    | -      | -           |
| XDSDateInput     | ✓     | ✓             | ✓           | ✓          | ✓          | ✓          | ✓    | ✓      | ✓           |
| XDSTimeInput     | ✓     | ✓             | ✓           | ✓          | ✓          | ✓          | ✓    | ✓      | ✓           |

### Gaps to Address

1. **status**: Add to TextArea for validation feedback
2. **isOptional**: Add to CheckboxInput for consistency
3. **size**: Add to TextArea for consistency
4. **labelTooltip**: Consider adding to all field-based inputs

## Boolean Prop Naming

All boolean props must be prefixed with `is` or `has`:

- `is` prefix: State or condition (`isDisabled`, `isRequired`, `isOptional`, `isLabelHidden`)
- `has` prefix: Feature toggle (`hasSeconds`, `hasClear`, `hasAutoFocus`)

## forwardRef Pattern

All input components should use `forwardRef` to expose the underlying input element:

```tsx
export const XDSInput = forwardRef<HTMLInputElement, Props>((props, ref) => {
  // ...
  return <input ref={ref} ... />;
});

XDSInput.displayName = 'XDSInput';
```

## Accessibility Requirements

1. **Label**: Always associate label with input via `htmlFor`/`id`
2. **Description**: Use `aria-describedby` to link description to input
3. **Required**: Set `aria-required="true"` when `isRequired` is true
4. **Invalid**: Set `aria-invalid="true"` when status type is `'error'`
5. **Disabled**: Use native `disabled` attribute (provides correct semantics)
