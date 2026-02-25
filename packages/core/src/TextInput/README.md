# TextInput

A text input component for collecting user text input.

<!-- SYNC: When files in this directory change, update this document. -->

## Features

- **Label Support**: Required label for accessibility (can be visually hidden)
- **Description**: Optional description text displayed between the label and input
- **Optional/Required Indicators**: Display "Optional" or "Required" text with bullet separator
- **Label Tooltip**: Optional info icon with tooltip at end of label
- **Accessible**: Label properly associated with input via htmlFor/id
- **Styled with StyleX**: Uses XDS design tokens for consistent styling

## Usage

```tsx
import { XDSTextInput } from '@xds/core/TextInput';

// Basic input with label
<XDSTextInput label="Name" value={name} onChange={setName} />

// With placeholder
<XDSTextInput label="Email" value={email} onChange={setEmail} placeholder="email@example.com" />

// Hidden label (for screen readers only)
<XDSTextInput label="Search" isLabelHidden value={query} onChange={setQuery} placeholder="Search..." />

// With description
<XDSTextInput label="Email" description="We'll never share your email" value={email} onChange={setEmail} />

// Optional field
<XDSTextInput label="Nickname" isOptional value={nickname} onChange={setNickname} />

// Required field
<XDSTextInput label="Username" isRequired value={username} onChange={setUsername} />

// With validation status (error, warning, or success)
<XDSTextInput
  label="Email"
  value={email}
  onChange={setEmail}
  status={{ type: 'error', message: 'Invalid email address' }}
/>
```

## Props

| Prop            | Type                                                        | Required | Description                                                           |
| --------------- | ----------------------------------------------------------- | -------- | --------------------------------------------------------------------- |
| `label`         | `string`                                                    | Yes      | Label text for the input (always rendered for accessibility)          |
| `value`         | `string`                                                    | Yes      | Current value of the input                                            |
| `onChange`      | `(value: string, e: ChangeEvent<HTMLInputElement>) => void` | Yes      | Callback fired when input value changes                               |
| `size`          | `'sm' \| 'md' \| 'lg'`                                      | No       | Size variant (default: `'md'`)                                        |
| `isLabelHidden` | `boolean`                                                   | No       | Visually hide the label (still accessible to screen readers)          |
| `description`   | `string`                                                    | No       | Description text displayed between the label and input                |
| `isOptional`    | `boolean`                                                   | No       | Whether the field is optional (mutually exclusive with isRequired)    |
| `isRequired`    | `boolean`                                                   | No       | Whether the field is required (mutually exclusive with isOptional)    |
| `placeholder`   | `string`                                                    | No       | Placeholder text                                                      |
| `labelTooltip`  | `string`                                                    | No       | Tooltip text to display in an info icon at the end of the label       |
| `status`        | `{type: 'error'\|'warning'\|'success', message?: string}`   | No       | Validation status with optional message (sets aria-invalid for error) |

## Theming

Themes can override `TextInput` styles via `ComponentStyles`:

```tsx
// In your theme definition
const theme: Theme = {
  // ...tokens...
  components: {
    textInput: {
      wrapper: myStyles,
      input: myStyles,
    },
  },
};
```

### Available surfaces

| Surface   | Description              |
| --------- | ------------------------ |
| `wrapper` | Wrapper container styles |
| `input`   | Input element styles     |

## Files

| File                    | Role  | Purpose                     |
| ----------------------- | ----- | --------------------------- |
| `index.ts`              | Entry | Exports component and types |
| `XDSTextInput.tsx`      | Core  | Component implementation    |
| `XDSTextInput.test.tsx` | Test  | Unit tests                  |

## Implementation Notes

- Uses `useId` hook for accessible label-input association
- Label is always rendered for accessibility; use `isLabelHidden` to hide visually
- Hidden label uses CSS technique that remains accessible to screen readers
- Wraps `XDSField` component for label, description, and optional/required handling
- `isOptional` and `isRequired` are mutually exclusive; setting both will show "Optional"
- Optional/Required text appears on the same line as the label
