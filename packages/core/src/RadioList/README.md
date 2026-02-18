# /packages/core/src/RadioList

A radio group component for single-value selection from a list of options.

<!-- SYNC: When files in this directory change, update this document. -->

## Features

- **Accessible**: Uses native `<input type="radio">` with proper `role="radiogroup"` and ARIA attributes
- **Orientation**: Supports `vertical` and `horizontal` layouts
- **Sizes**: `sm` (18px radio, 20px wrapper) and `md` (22px radio, 24px wrapper)
- **Descriptions**: Optional description text per item
- **Custom content**: `startContent` and `endContent` slots on each item
- **Disabled state**: Supports disabling the entire group or individual items
- **Field integration**: Uses `XDSField` for label, description, required/optional, and status messaging

## Usage

```tsx
import { XDSRadioList, XDSRadioListItem } from '@xds/core/RadioList';

// Basic usage
<XDSRadioList
  label="Notification preference"
  value={selected}
  onChange={setSelected}
>
  <XDSRadioListItem label="Email" value="email" />
  <XDSRadioListItem label="SMS" value="sms" />
  <XDSRadioListItem label="Push" value="push" />
</XDSRadioList>

// With descriptions
<XDSRadioList
  label="Plan"
  value={plan}
  onChange={setPlan}
>
  <XDSRadioListItem
    label="Free"
    value="free"
    description="Basic features, limited usage"
  />
  <XDSRadioListItem
    label="Pro"
    value="pro"
    description="All features, unlimited usage"
  />
</XDSRadioList>

// Horizontal layout
<XDSRadioList
  label="Size"
  value={size}
  onChange={setSize}
  orientation="horizontal"
>
  <XDSRadioListItem label="Small" value="sm" />
  <XDSRadioListItem label="Medium" value="md" />
  <XDSRadioListItem label="Large" value="lg" />
</XDSRadioList>

// With status
<XDSRadioList
  label="Required choice"
  value={choice}
  onChange={setChoice}
  isRequired
  status={{ type: 'error', message: 'Please select an option' }}
>
  <XDSRadioListItem label="Option A" value="a" />
  <XDSRadioListItem label="Option B" value="b" />
</XDSRadioList>

// Disabled group
<XDSRadioList
  label="Locked selection"
  value="locked"
  onChange={() => {}}
  isDisabled
>
  <XDSRadioListItem label="Locked" value="locked" />
  <XDSRadioListItem label="Unavailable" value="unavailable" />
</XDSRadioList>
```

## XDSRadioList Props

| Prop            | Type                              | Default      | Description                                                         |
| --------------- | --------------------------------- | ------------ | ------------------------------------------------------------------- |
| `label`         | `string`                          | —            | Label text for the radio group (always rendered for accessibility)   |
| `isLabelHidden` | `boolean`                         | `false`      | Whether to visually hide the label                                  |
| `description`   | `string`                          | —            | Description text displayed below the label                          |
| `value`         | `string`                          | —            | The currently selected value                                        |
| `onChange`      | `(value: string) => void`         | —            | Callback fired when the selected value changes                      |
| `orientation`   | `'vertical' \| 'horizontal'`     | `'vertical'` | Layout direction of the radio items                                 |
| `isDisabled`    | `boolean`                         | `false`      | Whether all radio items are disabled                                |
| `isRequired`    | `boolean`                         | `false`      | Whether the radio group is required                                 |
| `isOptional`    | `boolean`                         | `false`      | Whether the field is optional (mutually exclusive with `isRequired`) |
| `status`        | `XDSInputStatus`                  | —            | Status indicator (`{ type, message }`)                              |
| `size`          | `'sm' \| 'md'`                   | `'md'`       | Size of the radio controls                                          |
| `labelTooltip`  | `string`                          | —            | Tooltip text for an info icon next to the label                     |
| `xstyle`        | `StyleXStyles`                    | —            | Additional styles for the outer container                           |
| `data-testid`   | `string`                          | —            | Test ID for the outer container                                     |
| `children`      | `ReactNode`                       | —            | `XDSRadioListItem` elements                                        |

## XDSRadioListItem Props

| Prop           | Type        | Default | Description                                    |
| -------------- | ----------- | ------- | ---------------------------------------------- |
| `label`        | `string`    | —       | Label text for the radio item                  |
| `value`        | `string`    | —       | Value of this radio item                       |
| `description`  | `string`    | —       | Description text displayed below the label     |
| `isDisabled`   | `boolean`   | `false` | Whether this individual radio item is disabled |
| `startContent` | `ReactNode` | —       | Content to render before the radio circle      |
| `endContent`   | `ReactNode` | —       | Content to render after the label              |
| `data-testid`  | `string`    | —       | Test ID for the radio item container           |

## Files

| File                      | Role  | Purpose                                            |
| ------------------------- | ----- | -------------------------------------------------- |
| `index.ts`                | Entry | Exports components and types                       |
| `XDSRadioList.tsx`        | Core  | Radio group container with context provider        |
| `XDSRadioListItem.tsx`    | Core  | Individual radio item consuming `RadioListContext` |
| `XDSRadioList.test.tsx`   | Test  | Unit tests                                         |

## Implementation Notes

- `XDSRadioList` creates a `RadioListContext` that provides `name`, `value`, `onChange`, `isDisabled`, `isRequired`, `size`, and `status` to child items
- `XDSRadioListItem` must be used within an `XDSRadioList` — throws if context is missing
- Uses a hidden native `<input type="radio">` with a custom visual overlay for consistent styling
- Focus outline uses the standard XDS focus outline token with `2px` offset
- Hover states use `color-mix()` for consistent overlay tinting
- Size variants match `CheckboxInput` dimensions for visual consistency
