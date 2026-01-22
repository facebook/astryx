# /packages/core/src/Field

A form field wrapper component that provides label and description.

<!-- SYNC: When files in this directory change, update this document. -->

## Features

- **Label Support**: Required label for accessibility (can be visually hidden)
- **Description**: Optional description text displayed between the label and input
- **Accessible**: Label properly associated with input via htmlFor/id
- **Render Props**: Supports render prop pattern for passing id and aria attributes to children
- **Styled with StyleX**: Uses XDS design tokens for consistent styling

## Usage

```tsx
import { XDSField } from '@xds/core/Field';

// With render props (recommended for full accessibility)
<XDSField label="Email" description="We'll never share your email">
  {({ id, ...aria }) => <input id={id} {...aria} />}
</XDSField>

// With regular children
<XDSField label="Name">
  <XDSTextInput label="Name" isLabelHidden value={name} onChange={setName} />
</XDSField>

// Hidden label (for screen readers only)
<XDSField label="Search" isLabelHidden>
  {({ id }) => <input id={id} placeholder="Search..." />}
</XDSField>
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `label` | `string` | Yes | Label text for the field (always rendered for accessibility) |
| `isLabelHidden` | `boolean` | No | Visually hide the label (still accessible to screen readers) |
| `description` | `string` | No | Description text displayed between the label and input |
| `children` | `ReactNode \| ((props) => ReactNode)` | Yes | The input or control to render |

## Files

| File | Role | Purpose |
|------|------|---------|
| `index.ts` | Entry | Exports component and types |
| `XDSField.tsx` | Core | Component implementation |
| `XDSField.test.tsx` | Test | Unit tests |

## Implementation Notes

- Uses `useId` hook for accessible label-input association
- Label is always rendered for accessibility; use `isLabelHidden` to hide visually
- Hidden label uses CSS technique that remains accessible to screen readers
- Supports render prop pattern to pass `id` and `aria-describedby` to children
