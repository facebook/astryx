# Field

A form field wrapper component that provides label and description.

<!-- SYNC: When files in this directory change, update this document. -->

## Features

- **Label Support**: Required label for accessibility (can be visually hidden)
- **Description**: Optional description text displayed between the label and input
- **Optional/Required Indicators**: Display "Optional" or "Required" text with bullet separator
- **Label Tooltip**: Optional info icon with tooltip at end of label
- **Accessible**: Label properly associated with input via htmlFor/id
- **Styled with StyleX**: Uses XDS design tokens for consistent styling

## Components

### XDSField

Form field wrapper that provides label, description, and optional/required indicators.

```tsx
<XDSField label="Email" inputID={id}>
  <input id={id} />
</XDSField>
```

| Prop             | Type          | Default | Description                                   |
| ---------------- | ------------- | ------- | --------------------------------------------- |
| `label`          | `string`      | —       | Label text (required for accessibility)       |
| `isLabelHidden`  | `boolean`     | `false` | Visually hide the label                       |
| `description`    | `string`      | —       | Description text between label and input      |
| `inputID`        | `string`      | —       | ID for the input (used for label's htmlFor)   |
| `descriptionID`  | `string`      | —       | ID for the description (for aria-describedby) |
| `isOptional`     | `boolean`     | `false` | Show "Optional" indicator                     |
| `isRequired`     | `boolean`     | `false` | Show "Required" indicator                     |
| `labelStartIcon` | `XDSIconType` | —       | Icon before the label text                    |
| `labelTooltip`   | `string`      | —       | Tooltip text for info icon at end of label    |
| `children`       | `ReactNode`   | —       | The input or control to render                |

### XDSFieldLabel

Standalone label component with optional/required indicators and tooltip support.

```tsx
<XDSFieldLabel label="Username" inputID={id} isRequired />
```

| Prop            | Type          | Default | Description                                |
| --------------- | ------------- | ------- | ------------------------------------------ |
| `label`         | `string`      | —       | Label text (required)                      |
| `inputID`       | `string`      | —       | ID of the input this label is for          |
| `isLabelHidden` | `boolean`     | `false` | Visually hide the label                    |
| `isDisabled`    | `boolean`     | `false` | Whether the associated input is disabled   |
| `isOptional`    | `boolean`     | `false` | Show "Optional" indicator                  |
| `isRequired`    | `boolean`     | `false` | Show "Required" indicator                  |
| `startIcon`     | `XDSIconType` | —       | Icon before the label text                 |
| `tooltip`       | `string`      | —       | Tooltip text for info icon at end of label |

### XDSFieldStatus

Status message component for form field validation feedback.

```tsx
<XDSFieldStatus type="error" message="This field is required" />
```

| Prop      | Type                                | Default      | Description                                     |
| --------- | ----------------------------------- | ------------ | ----------------------------------------------- |
| `type`    | `'error' \| 'warning' \| 'success'` | —            | Status type                                     |
| `message` | `string`                            | —            | Status message text                             |
| `id`      | `string`                            | —            | ID for aria-describedby association             |
| `variant` | `'attached' \| 'detached'`          | `'attached'` | Visual variant (overlaps vs floats below input) |

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

| Prop             | Type          | Required | Description                                                            |
| ---------------- | ------------- | -------- | ---------------------------------------------------------------------- |
| `label`          | `string`      | Yes      | Label text for the field (always rendered for accessibility)           |
| `isLabelHidden`  | `boolean`     | No       | Visually hide the label (still accessible to screen readers)           |
| `description`    | `string`      | No       | Description text displayed between the label and input                 |
| `inputID`        | `string`      | Yes      | ID for the input element (used for label's htmlFor attribute)          |
| `descriptionID`  | `string`      | No       | ID for the description element (use for aria-describedby on the input) |
| `isOptional`     | `boolean`     | No       | Whether the field is optional (mutually exclusive with isRequired)     |
| `isRequired`     | `boolean`     | No       | Whether the field is required (mutually exclusive with isOptional)     |
| `labelStartIcon` | `XDSIconType` | No       | Icon to display before the label text                                  |
| `labelTooltip`   | `string`      | No       | Tooltip text to display in an info icon at the end of the label        |
| `children`       | `ReactNode`   | Yes      | The input or control to render                                         |

## Theming

Themes can override `Field` styles via `ComponentStyles`:

```tsx
// In your theme definition
const theme: Theme = {
  // ...tokens...
  components: {
    field: {
      root: myStyles,
      description: myStyles,
    },
  },
};
```

### Available surfaces

| Surface       | Description             |
| ------------- | ----------------------- |
| `root`        | Root container styles   |
| `description` | Description text styles |

## Files

| File                     | Role   | Purpose                                           |
| ------------------------ | ------ | ------------------------------------------------- |
| `index.ts`               | Entry  | Exports component, types, and shared input styles |
| `XDSField.tsx`           | Core   | Component implementation                          |
| `XDSFieldLabel.tsx`      | Core   | Standalone label component                        |
| `XDSFieldStatus.tsx`     | Core   | Status message component                          |
| `XDSField.test.tsx`      | Test   | Unit tests                                        |
| `XDSFieldLabel.test.tsx` | Test   | Unit tests for label component                    |
| `types.ts`               | Types  | Shared input types (status, size)                 |
| `inputStyles.stylex.ts`  | Styles | Shared input wrapper appearance styles            |

## Implementation Notes

- Parent components are responsible for generating IDs (using `useId` hook)
- Label is always rendered for accessibility; use `isLabelHidden` to hide visually
- Hidden label uses CSS technique that remains accessible to screen readers
- Description is rendered when provided; if `descriptionID` is also provided, the description element gets that ID for `aria-describedby` association
- `isOptional` and `isRequired` are mutually exclusive; setting both will show "Optional"
- Optional/Required text appears on the same line as the label
