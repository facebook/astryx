# /packages/core/src/TextArea

A multi-line text input component for collecting longer user input.

<!-- SYNC: When files in this directory change, update this document. -->

## Features

- **Label Support**: Required label for accessibility (can be visually hidden)
- **Description**: Optional description text displayed between the label and textarea
- **Optional/Required Indicators**: Display "Optional" or "Required" text with bullet separator
- **Disabled State**: Support for disabled textarea with visual styling
- **Accessible**: Label properly associated with textarea via htmlFor/id
- **Styled with StyleX**: Uses XDS design tokens for consistent styling
- **Resizable**: Vertical resize enabled by default with a minimum height

## Usage

```tsx
import { XDSTextArea } from '@xds/core/TextArea';

// Basic textarea with label
<XDSTextArea label="Description" value={description} onChange={setDescription} />

// With placeholder
<XDSTextArea label="Notes" value={notes} onChange={setNotes} placeholder="Enter your notes..." />

// With custom rows
<XDSTextArea label="Message" rows={5} value={message} onChange={setMessage} />

// Hidden label (for screen readers only)
<XDSTextArea label="Comments" isLabelHidden value={comments} onChange={setComments} placeholder="Add a comment..." />

// With description
<XDSTextArea label="Bio" description="Tell us about yourself" value={bio} onChange={setBio} />

// Optional field
<XDSTextArea label="Additional Notes" isOptional value={notes} onChange={setNotes} />

// Required field
<XDSTextArea label="Feedback" isRequired value={feedback} onChange={setFeedback} />

// Disabled field
<XDSTextArea label="Disabled" isDisabled value="Cannot edit this" onChange={setDisabled} />
```

## Props

| Prop            | Type                                                           | Required | Description                                                        |
| --------------- | -------------------------------------------------------------- | -------- | ------------------------------------------------------------------ |
| `label`         | `string`                                                       | Yes      | Label text for the textarea (always rendered for accessibility)    |
| `value`         | `string`                                                       | Yes      | Current value of the textarea                                      |
| `onChange`      | `(value: string, e: ChangeEvent<HTMLTextAreaElement>) => void` | Yes      | Callback fired when textarea value changes                         |
| `isLabelHidden` | `boolean`                                                      | No       | Visually hide the label (still accessible to screen readers)       |
| `description`   | `string`                                                       | No       | Description text displayed between the label and textarea          |
| `isOptional`    | `boolean`                                                      | No       | Whether the field is optional (mutually exclusive with isRequired) |
| `isRequired`    | `boolean`                                                      | No       | Whether the field is required (mutually exclusive with isOptional) |
| `placeholder`   | `string`                                                       | No       | Placeholder text                                                   |
| `rows`          | `number`                                                       | No       | Number of visible text rows (default: 3)                           |
| `isDisabled`    | `boolean`                                                      | No       | Whether the textarea is disabled (default: false)                  |

## Files

| File                   | Role  | Purpose                     |
| ---------------------- | ----- | --------------------------- |
| `index.ts`             | Entry | Exports component and types |
| `XDSTextArea.tsx`      | Core  | Component implementation    |
| `XDSTextArea.test.tsx` | Test  | Unit tests                  |

## Implementation Notes

- Uses `useId` hook for accessible label-textarea association
- Label is always rendered for accessibility; use `isLabelHidden` to hide visually
- Hidden label uses CSS technique that remains accessible to screen readers
- Wraps `XDSField` component for label, description, and optional/required handling
- `isOptional` and `isRequired` are mutually exclusive; setting both will show "Optional"
- Optional/Required text appears on the same line as the label
- Textarea has vertical resize enabled with a minimum height of 80px
