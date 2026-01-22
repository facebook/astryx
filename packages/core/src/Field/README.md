# /packages/core/src/Field

A form field wrapper component that provides label and description.

<!-- SYNC: When files in this directory change, update this document. -->

## Features

- **Label Support**: Required label for accessibility (can be visually hidden)
- **Description**: Optional description text displayed between the label and input
- **Optional/Required Indicators**: Display "Optional" or "Required" text with bullet separator
- **Accessible**: Label properly associated with input via htmlFor/id
- **Styled with StyleX**: Uses XDS design tokens for consistent styling

## Usage

```tsx
import {XDSField} from '@xds/core/Field';
import {useId} from 'react';

// Basic usage with explicit IDs
const id = useId();
<XDSField label="Email" inputID={id}>
  <input id={id} />
</XDSField>;

// With description
const inputId = useId();
const descId = useId();
<XDSField
  label="Email"
  description="We'll never share your email"
  inputID={inputId}
  descriptionID={descId}>
  <input id={inputId} aria-describedby={descId} />
</XDSField>;

// Hidden label (for screen readers only)
const searchId = useId();
<XDSField label="Search" isLabelHidden inputID={searchId}>
  <input id={searchId} placeholder="Search..." />
</XDSField>;

// Optional field
const nicknameId = useId();
<XDSField label="Nickname" isOptional inputID={nicknameId}>
  <input id={nicknameId} placeholder="Enter your nickname" />
</XDSField>;

// Required field
const usernameId = useId();
<XDSField label="Username" isRequired inputID={usernameId}>
  <input id={usernameId} placeholder="Enter your username" />
</XDSField>;

// Description with optional indicator (shows bullet separator)
const bioId = useId();
const bioDescId = useId();
<XDSField
  label="Bio"
  description="Tell us about yourself"
  isOptional
  inputID={bioId}
  descriptionID={bioDescId}>
  <input id={bioId} aria-describedby={bioDescId} />
</XDSField>;
```

## Props

| Prop            | Type        | Required | Description                                                            |
| --------------- | ----------- | -------- | ---------------------------------------------------------------------- |
| `label`         | `string`    | Yes      | Label text for the field (always rendered for accessibility)           |
| `isLabelHidden` | `boolean`   | No       | Visually hide the label (still accessible to screen readers)           |
| `description`   | `string`    | No       | Description text displayed between the label and input                 |
| `inputID`       | `string`    | Yes      | ID for the input element (used for label's htmlFor attribute)          |
| `descriptionID` | `string`    | No       | ID for the description element (use for aria-describedby on the input) |
| `isOptional`    | `boolean`   | No       | Whether the field is optional (mutually exclusive with isRequired)     |
| `isRequired`    | `boolean`   | No       | Whether the field is required (mutually exclusive with isOptional)     |
| `children`      | `ReactNode` | Yes      | The input or control to render                                         |

## Files

| File                | Role  | Purpose                     |
| ------------------- | ----- | --------------------------- |
| `index.ts`          | Entry | Exports component and types |
| `XDSField.tsx`      | Core  | Component implementation    |
| `XDSField.test.tsx` | Test  | Unit tests                  |

## Implementation Notes

- Parent components are responsible for generating IDs (using `useId` hook)
- Label is always rendered for accessibility; use `isLabelHidden` to hide visually
- Hidden label uses CSS technique that remains accessible to screen readers
- Description is rendered when provided; if `descriptionID` is also provided, the description element gets that ID for `aria-describedby` association
- `isOptional` and `isRequired` are mutually exclusive; setting both will show "Optional"
- Optional/Required text appears on the same line as the label
