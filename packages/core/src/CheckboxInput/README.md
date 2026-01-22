# /packages/core/src/CheckboxInput

A checkbox input component for toggling boolean values.

<!-- SYNC: When files in this directory change, update this document. -->

## Features

- **Accessible**: Always includes a label (can be visually hidden)
- **Indeterminate state**: Supports indeterminate state for "select all" patterns
- **Descriptions**: Optional description text below the label
- **Custom styling**: Uses StyleX with XDS design tokens
- **Disabled state**: Full support for disabled state styling

## Usage

```tsx
import { XDSCheckboxInput } from '@xds/core/CheckboxInput';

// Basic usage
<XDSCheckboxInput
  label="Accept terms and conditions"
  value={accepted}
  onChange={setAccepted}
/>

// With description
<XDSCheckboxInput
  label="Subscribe to newsletter"
  description="Receive weekly updates about new features"
  value={subscribed}
  onChange={setSubscribed}
/>

// Indeterminate state (e.g., for "select all" when some items are selected)
<XDSCheckboxInput
  label="Select all items"
  value="indeterminate"
  onChange={setSelectAll}
/>

// Hidden label (still accessible)
<XDSCheckboxInput
  label="Select row"
  isLabelHidden
  value={selected}
  onChange={setSelected}
/>

// Disabled
<XDSCheckboxInput
  label="Premium feature"
  description="Upgrade to enable this option"
  value={false}
  onChange={() => {}}
  isDisabled
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Label text for the checkbox (always rendered for accessibility) |
| `isLabelHidden` | `boolean` | `false` | Whether to visually hide the label |
| `description` | `string` | — | Description text displayed below the label |
| `value` | `boolean \| 'indeterminate'` | — | Whether the checkbox is checked, unchecked, or indeterminate |
| `onChange` | `(checked: boolean, e: ChangeEvent) => void` | — | Callback fired when the checkbox state changes |
| `isDisabled` | `boolean` | `false` | Whether the checkbox is disabled |

## Files

| File | Role | Purpose |
|------|------|---------|
| `index.ts` | Entry | Exports component and types |
| `XDSCheckboxInput.tsx` | Core | Component implementation |
| `XDSCheckboxInput.test.tsx` | Test | Unit tests |

## Implementation Notes

- Uses a hidden native `<input type="checkbox">` for accessibility with a custom visual checkbox overlay
- The visual checkbox responds to hover, focus, and checked states via sibling selectors in CSS
- Label is clickable and properly associated with the input via `htmlFor`/`id`
- Focus outline uses the standard XDS focus outline token
