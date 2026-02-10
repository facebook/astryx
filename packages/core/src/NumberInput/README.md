# /packages/core/src/NumberInput

A number input component for collecting numeric user input with validation.

<!-- SYNC: When files in this directory change, update this document. -->

## Features

- **Label Support**: Required label for accessibility (can be visually hidden)
- **Description**: Optional description text displayed between the label and input
- **Optional/Required Indicators**: Display "Optional" or "Required" text with bullet separator
- **Label Tooltip**: Optional info icon with tooltip at end of label
- **Label Icon**: Optional icon before the label text
- **Accessible**: Label properly associated with input via htmlFor/id
- **Styled with StyleX**: Uses XDS design tokens for consistent styling
- **Size Variants**: Three sizes (sm, md, lg) for different contexts
- **Status Handling**: Error, warning, and success states with messages
- **Number Constraints**: Support for min, max, and step attributes
- **Validated onChange**: Only calls onChange when the entered value passes validation
- **Units Display**: Optional units suffix (e.g., "%" or "GB")
- **Integer Mode**: Option to restrict to integers only
- **Native Controls**: Uses `type="number"` for browser step controls
- **Event Callbacks**: onFocus, onBlur, and onEnter handlers

## Usage

```tsx
import { XDSNumberInput } from '@xds/core/NumberInput';

// Basic input with label
<XDSNumberInput label="Quantity" value={quantity} onChange={setQuantity} />

// With placeholder
<XDSNumberInput label="Age" value={age} onChange={setAge} placeholder="Enter your age" />

// With min/max constraints
<XDSNumberInput label="Rating" value={rating} onChange={setRating} min={1} max={5} />

// With step for decimals
<XDSNumberInput label="Price" value={price} onChange={setPrice} min={0} step={0.01} />

// With units display
<XDSNumberInput label="Discount" value={discount} onChange={setDiscount} units="%" />

// Integer only
<XDSNumberInput label="Count" value={count} onChange={setCount} isIntegerOnly />

// With description
<XDSNumberInput label="Quantity" description="Enter the number of items" value={qty} onChange={setQty} />

// Optional field
<XDSNumberInput label="Phone Extension" isOptional value={ext} onChange={setExt} />

// Required field
<XDSNumberInput label="Amount" isRequired value={amount} onChange={setAmount} />

// With validation status (error, warning, or success)
<XDSNumberInput
  label="Age"
  value={age}
  onChange={setAge}
  status={{ type: 'error', message: 'Age must be between 18 and 120' }}
/>

// With event handlers
<XDSNumberInput
  label="Search"
  value={search}
  onChange={setSearch}
  onEnter={() => handleSearch()}
  onFocus={() => console.log('focused')}
  onBlur={() => console.log('blurred')}
/>
```

## Props

| Prop            | Type                                                      | Required | Description                                                        |
| --------------- | --------------------------------------------------------- | -------- | ------------------------------------------------------------------ |
| `label`         | `string`                                                  | Yes      | Label text for the input (always rendered for accessibility)       |
| `value`         | `number \| null \| undefined`                             | Yes      | Current value of the input                                         |
| `onChange`      | `(value: number) => void`                                 | Yes      | Callback fired when input value changes (only on valid input)      |
| `size`          | `'sm' \| 'md' \| 'lg'`                                    | No       | Size variant (default: `'md'`)                                     |
| `isLabelHidden` | `boolean`                                                 | No       | Visually hide the label (still accessible to screen readers)       |
| `description`   | `string`                                                  | No       | Description text displayed between the label and input             |
| `isOptional`    | `boolean`                                                 | No       | Whether the field is optional (mutually exclusive with isRequired) |
| `isRequired`    | `boolean`                                                 | No       | Whether the field is required (mutually exclusive with isOptional) |
| `isDisabled`    | `boolean`                                                 | No       | Whether the input is disabled                                      |
| `placeholder`   | `string`                                                  | No       | Placeholder text                                                   |
| `tooltip`       | `string`                                                  | No       | Tooltip text to display in an info icon at the end of the label    |
| `startIcon`     | `XDSIconType`                                             | No       | Icon to display at the start of the input                          |
| `labelIcon`     | `XDSIconType`                                             | No       | Icon to display before the label text                              |
| `status`        | `{type: 'error'\|'warning'\|'success', message?: string}` | No       | Validation status with optional message                            |
| `min`           | `number \| null`                                          | No       | Minimum value allowed                                              |
| `max`           | `number \| null`                                          | No       | Maximum value allowed                                              |
| `step`          | `number \| null`                                          | No       | Step increment for the input (default: 1)                          |
| `units`         | `string \| null`                                          | No       | Units text to display at the end of the input (e.g., "%" or "GB")  |
| `isIntegerOnly` | `boolean`                                                 | No       | Only allow integer values (no floating point)                      |
| `htmlName`      | `string`                                                  | No       | HTML name attribute for form submissions                           |
| `autoComplete`  | `string`                                                  | No       | HTML autocomplete attribute                                        |
| `hasAutoFocus`  | `boolean`                                                 | No       | Whether to focus the input on mount                                |
| `onFocus`       | `(e: FocusEvent<HTMLInputElement>) => void`               | No       | Callback fired when the input receives focus                       |
| `onBlur`        | `(e: FocusEvent<HTMLInputElement>) => void`               | No       | Callback fired when the input loses focus                          |
| `onEnter`       | `() => void`                                              | No       | Callback fired when the user presses the Enter key                 |

## Files

| File                      | Role  | Purpose                     |
| ------------------------- | ----- | --------------------------- |
| `index.ts`                | Entry | Exports component and types |
| `XDSNumberInput.tsx`      | Core  | Component implementation    |
| `XDSNumberInput.test.tsx` | Test  | Unit tests                  |

## Implementation Notes

- Uses `useId` hook for accessible label-input association
- Label is always rendered for accessibility; use `isLabelHidden` to hide visually
- Hidden label uses CSS technique that remains accessible to screen readers
- Wraps `XDSField` component for label, description, and optional/required handling
- `isOptional` and `isRequired` are mutually exclusive; setting both will show "Optional"
- Uses `type="number"` to enable native browser step controls (up/down arrows)
- **Validated onChange**: Only calls `onChange` when the entered value is a valid number that passes min/max/integer constraints
- Uses internal pending state to allow free-form typing while validating
- Units are displayed as a lighter grey suffix after the input value
