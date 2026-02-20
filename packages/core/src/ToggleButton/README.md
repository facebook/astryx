# /packages/core/src/ToggleButton

XDSToggleButton component — a button that toggles between pressed and unpressed states.

Use for toolbar actions, view mode switches, and formatting controls.
For on/off settings, use XDSSwitch. For regular actions, use XDSButton.

<!-- SYNC: When files in this directory change, update this document. -->

## Features

- **Variants**: `ghost`, `secondary`, `outline` — outline formalizes the pattern previously hacked via XDSInputGroup styling
- **Sizes**: `sm` (28px), `md` (32px), `lg` (36px)
- **Pressed state**: Visual indicator with `aria-pressed` for accessibility
- **Loading state**: Shows spinner, disables interaction
- **Icon-only mode**: Square button with `aria-label` and default tooltip
- **Icon swap**: Optional `pressedIcon` for outline-to-filled icon transitions
- **Emphasized text**: Label text goes semibold when pressed, with hidden pseudo-element to prevent layout shift
- **Tooltip**: Automatic for icon-only buttons, opt-in for labeled buttons
- **Theme overrides**: Supports component-level variant overrides via `theme.components.toggleButton.variants`

## Usage

```tsx
import { XDSToggleButton } from '@xds/core/ToggleButton';

// Icon-only toggle (most common — toolbar usage)
const [isBold, setIsBold] = useState(false);
<XDSToggleButton
  label="Bold"
  icon={<BoldIcon />}
  isPressed={isBold}
  onPressedChange={setIsBold}
/>

// With visible label
<XDSToggleButton
  label="Show details"
  isPressed={showDetails}
  onPressedChange={setShowDetails}
>
  Show details
</XDSToggleButton>

// Outline variant — chip-like toggle for filters
<XDSToggleButton
  label="Active"
  variant="outline"
  isPressed={isActive}
  onPressedChange={setIsActive}
>
  Active
</XDSToggleButton>
```

## Props

| Prop              | Type                                  | Default   | Description                                    |
| ----------------- | ------------------------------------- | --------- | ---------------------------------------------- |
| `label`           | `string`                              | —         | Accessible label (required)                    |
| `isPressed`       | `boolean`                             | —         | Whether the button is pressed (required)       |
| `onPressedChange` | `(isPressed: boolean) => void`        | —         | Pressed state change handler (required)        |
| `variant`         | `'ghost' \| 'secondary' \| 'outline'` | `'ghost'` | Visual style variant                           |
| `size`            | `'sm' \| 'md' \| 'lg'`                | `'md'`    | Size variant                                   |
| `isDisabled`      | `boolean`                             | `false`   | Disables the button                            |
| `isLoading`       | `boolean`                             | `false`   | Shows loading spinner                          |
| `icon`            | `ReactNode`                           | —         | Icon element                                   |
| `pressedIcon`     | `ReactNode`                           | —         | Icon shown when pressed (outline→filled swap)  |
| `children`        | `ReactNode`                           | —         | Visible label content                          |
| `tooltip`         | `string`                              | —         | Tooltip text (defaults to label for icon-only) |
| `value`           | `string`                              | —         | Value identifier for use in groups             |
| `data-testid`     | `string`                              | —         | Test ID                                        |

## Accessibility

- Uses `aria-pressed="true/false"` for toggle state
- Icon-only buttons use `aria-label` from `label` prop
- Keyboard: Space/Enter toggles pressed state (native `<button>` behavior)
- Focus ring visible on keyboard focus (`:focus-visible`)

## Design Decisions

| Decision                      | Choice                 | Rationale                                                                                  |
| ----------------------------- | ---------------------- | ------------------------------------------------------------------------------------------ |
| Separate component            | Yes                    | Different semantics (toggle state), different ARIA (`aria-pressed`), different variant set |
| `isPressed` naming            | Follows `aria-pressed` | WAI-ARIA terminology. `isSelected` implies listbox pattern.                                |
| Outline variant in v1         | Included               | Formalizes the pattern previously achieved by hacking XDSInputGroup borders onto buttons   |
| No `primary`/`destructive`    | Intentional            | Toggle buttons are mode switches, not primary actions or destructive operations            |
| Default tooltip for icon-only | Yes                    | Icon-only buttons need tooltips for discoverability                                        |

## Files

| File                       | Role  | Purpose                                     |
| -------------------------- | ----- | ------------------------------------------- |
| `index.ts`                 | Entry | Exports XDSToggleButton component and types |
| `XDSToggleButton.tsx`      | Core  | XDSToggleButton component implementation    |
| `XDSToggleButton.test.tsx` | Test  | Unit tests for XDSToggleButton component    |

## Implementation Notes

- Pressed state uses `--color-pressed-overlay` for background, `--color-icon-primary` / `--color-text-primary` for text/icon color
- Pressed label text uses `--font-weight-semibold` (vs `--font-weight-medium` unpressed). A hidden `<span>` with semibold weight reserves the wider width to prevent layout shift when toggling — same technique used by Material UI's bottom navigation
- Outline variant uses `--color-divider-emphasized` for border in all states (default, hover, pressed) — only the fill changes
- Hover/active states layer overlays via `backgroundImage` (same pattern as XDSButton)
- `value` prop is reserved for future XDSToggleButtonGroup integration
