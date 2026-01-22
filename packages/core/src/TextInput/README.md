# /packages/core/src/TextInput

A text input component for collecting user text input.

<!-- SYNC: When files in this directory change, update this document. -->

## Features

- **Label Support**: Required label for accessibility (can be visually hidden)
- **Description**: Optional description text displayed between the label and input
- **Optional/Required Indicators**: Display "Optional" or "Required" text with bullet separator
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

// Description with optional indicator
<XDSTextInput label="Bio" description="Tell us about yourself" isOptional value={bio} onChange={setBio} />
```

## Props

| Prop            | Type                                                        | Required | Description                                                        |
| --------------- | ----------------------------------------------------------- | -------- | ------------------------------------------------------------------ |
| `label`         | `string`                                                    | Yes      | Label text for the input (always rendered for accessibility)       |
| `value`         | `string`                                                    | Yes      | Current value of the input                                         |
| `onChange`      | `(value: string, e: ChangeEvent<HTMLInputElement>) => void` | Yes      | Callback fired when input value changes                            |
| `isLabelHidden` | `boolean`                                                   | No       | Visually hide the label (still accessible to screen readers)       |
| `description`   | `string`                                                    | No       | Description text displayed between the label and input             |
| `isOptional`    | `boolean`                                                   | No       | Whether the field is optional (mutually exclusive with isRequired) |
| `isRequired`    | `boolean`                                                   | No       | Whether the field is required (mutually exclusive with isOptional) |
| `placeholder`   | `string`                                                    | No       | Placeholder text                                                   |

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
