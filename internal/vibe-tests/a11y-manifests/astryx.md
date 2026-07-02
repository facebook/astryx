# Astryx Accessibility Manifest

**Source:** packages/core/src/\*/README.md
**Generated:** 2026-02-05T18:03:04.596Z

## Avatar

**Built-in accessibility:**

- Accessible: Proper role and aria-label support

## Button

**Built-in accessibility:**

- Variants: `primary`, `secondary`, `ghost`, `destructive`
- Focus visible: Accessible focus outline with variant-specific colors

**Developer must provide:**

- Provide aria-label for icon-only buttons
- Use aria-pressed for toggle buttons

**Notes:**

- `ButtonVariant` type is derived from the `variants` StyleX object using `keyof typeof variants`
- Destructive variant uses `colorTokens.negative` for its focus outline color

## CheckboxInput

**Built-in accessibility:**

- Accessible: Always includes a label (can be visually hidden)
- Supports visually hidden labels (still accessible to screen readers)

**Notes:**

- Label is clickable and properly associated with the input via `htmlFor`/`id`
- Label is required prop - component handles label association

## DateInput

**Built-in accessibility:**

- Calendar Popover: Click icon or use keyboard to open calendar picker
- Accessibility: Full keyboard navigation, focus trapping, screen reader support
- Supports visually hidden labels (still accessible to screen readers)

**Notes:**

- Label is required prop - component handles label association

## Field

**Built-in accessibility:**

- Accessible: Label properly associated with input via htmlFor/id
- Uses aria-describedby for descriptions
- Supports visually hidden labels (still accessible to screen readers)

**Notes:**

- Label is always rendered for accessibility; use `isLabelHidden` to hide visually
- Hidden label uses CSS technique that remains accessible to screen readers
- Description is rendered when provided; if `descriptionID` is also provided, the description element gets that ID for `aria-describedby` association
- Optional/Required text appears on the same line as the label

## Icon

**Built-in accessibility:**

- Theme Colors: Color variants mapped to Astryx icon color tokens
- Accessible: Icons are hidden from screen readers by default (aria-hidden)

**Notes:**

- Uses `aria-hidden="true"` by default since icons are typically decorative
- For meaningful icons, set `aria-hidden={false}`, `role="img"`, and `aria-label`

## Selector

**Built-in accessibility:**

- Uses `role="combobox"` trigger
- `role="listbox"` dropdown
- `role="group"` for sections
- `aria-activedescendant` for focus
- Supports visually hidden labels (still accessible to screen readers)

**Keyboard:**

- ↑↓ navigate, Enter/Space select, Escape close, Home/End jump, A-Z typeahead.

## TextArea

**Built-in accessibility:**

- Accessible: Label properly associated with textarea via htmlFor/id
- Supports visually hidden labels (still accessible to screen readers)

**Notes:**

- Uses `useId` hook for accessible label-textarea association
- Label is always rendered for accessibility; use `isLabelHidden` to hide visually
- Hidden label uses CSS technique that remains accessible to screen readers
- Wraps `Field` component for label, description, and optional/required handling
- Optional/Required text appears on the same line as the label
- Label is required prop - component handles label association

## TextInput

**Built-in accessibility:**

- Accessible: Label properly associated with input via htmlFor/id
- Sets aria-invalid for error status
- Supports visually hidden labels (still accessible to screen readers)

**Notes:**

- Uses `useId` hook for accessible label-input association
- Label is always rendered for accessibility; use `isLabelHidden` to hide visually
- Hidden label uses CSS technique that remains accessible to screen readers
- Wraps `Field` component for label, description, and optional/required handling
- Optional/Required text appears on the same line as the label
- Label is required prop - component handles label association

## theme

**Built-in accessibility:**

- Theme Provider: Wraps app to provide CSS variables
