# /packages/core/src/ToggleButton

XDSToggleButton component — a button that toggles between pressed and unpressed states.

Use for toolbar actions, view mode switches, formatting controls, and icon toggles
(favorite, bookmark, like). Subsumes the XDSToggleIcon pattern (#186) into a single component.

For on/off settings, use XDSSwitch. For regular actions, use XDSButton.

<!-- SYNC: When files in this directory change, update this document. -->

## Features

- **Variants**: `ghost`, `secondary`, `outline` — outline formalizes the pattern previously hacked via XDSInputGroup styling
- **Sizes**: `sm` (28px), `md` (32px), `lg` (36px)
- **Pressed state**: Visual indicator with `aria-pressed` for accessibility
- **Icon swap**: Optional `pressedIcon` for outline-to-filled icon transitions
- **Pressed icon color**: Semantic icon coloring when pressed (yellow star, pink heart)
- **Emphasized text**: Label text goes semibold when pressed, with hidden element to prevent layout shift
- **Read-only state**: Show toggle state without allowing interaction (e.g., viewing someone else's favorites)
- **Async transitions**: `onPressedChangeAction` for API-backed toggles with automatic loading state
- **Loading state**: Shows spinner, disables interaction
- **Icon-only mode**: Square button with `aria-label` and default tooltip
- **Tooltip control**: Automatic for icon-only buttons, controllable via `hasTooltip`
- **Theme overrides**: Supports component-level variant overrides via `theme.components.toggleButton.variants`

## Usage

```tsx
import { XDSToggleButton } from '@xds/core/ToggleButton';

// Icon-only toggle (toolbar usage)
const [isBold, setIsBold] = useState(false);
<XDSToggleButton
  label="Bold"
  icon={<BoldIcon />}
  isPressed={isBold}
  onPressedChange={setIsBold}
/>

// Favorite with icon swap and semantic color
<XDSToggleButton
  label="Favorite"
  icon={<StarIcon />}
  pressedIcon={<StarIconSolid />}
  pressedIconColor="#F2C00B"
  isPressed={isFavorited}
  onPressedChange={setIsFavorited}
/>

// Async toggle with API call
<XDSToggleButton
  label="Bookmark"
  icon={<BookmarkIcon />}
  pressedIcon={<BookmarkIconSolid />}
  isPressed={isBookmarked}
  onPressedChange={setIsBookmarked}
  onPressedChangeAction={async (newState) => {
    await api.bookmark(itemId, newState);
  }}
/>

// Read-only (viewing someone else's favorites)
<XDSToggleButton
  label="Favorited by user"
  icon={<StarIcon />}
  pressedIcon={<StarIconSolid />}
  pressedIconColor="#F2C00B"
  isPressed={true}
  onPressedChange={() => {}}
  isReadOnly
/>

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

| Prop                    | Type                                    | Default   | Description                                            |
| ----------------------- | --------------------------------------- | --------- | ------------------------------------------------------ |
| `label`                 | `string`                                | —         | Accessible label (required)                            |
| `isPressed`             | `boolean`                               | —         | Whether the button is pressed (required)               |
| `onPressedChange`       | `(isPressed: boolean) => void`          | —         | Pressed state change handler (required)                |
| `onPressedChangeAction` | `(isPressed: boolean) => Promise<void>` | —         | Async action with React 19 transitions                 |
| `variant`               | `'ghost' \| 'secondary' \| 'outline'`   | `'ghost'` | Visual style variant                                   |
| `size`                  | `'sm' \| 'md' \| 'lg'`                  | `'md'`    | Size variant                                           |
| `isDisabled`            | `boolean`                               | `false`   | Disables the button                                    |
| `isLoading`             | `boolean`                               | `false`   | Shows loading spinner                                  |
| `isReadOnly`            | `boolean`                               | `false`   | Shows state without interaction                        |
| `icon`                  | `ReactNode`                             | —         | Icon element                                           |
| `pressedIcon`           | `ReactNode`                             | —         | Icon shown when pressed (outline→filled swap)          |
| `pressedIconColor`      | `string`                                | —         | CSS color for icon when pressed (e.g., `"#F2C00B"`)    |
| `children`              | `ReactNode`                             | —         | Visible label content                                  |
| `tooltip`               | `string`                                | —         | Tooltip text (defaults to label for icon-only)         |
| `hasTooltip`            | `boolean`                               | auto      | Control tooltip visibility (auto = true for icon-only) |
| `value`                 | `string`                                | —         | Value identifier for use in groups                     |
| `data-testid`           | `string`                                | —         | Test ID                                                |

## Accessibility

- Uses `aria-pressed="true/false"` for toggle state
- Icon-only buttons use `aria-label` from `label` prop
- Read-only uses `aria-readonly="true"` — focusable but not interactive
- Async pending state uses native `disabled` to prevent re-click
- Keyboard: Space/Enter toggles pressed state (native `<button>` behavior)
- Focus ring visible on keyboard focus (`:focus-visible`)
- `pressedIconColor` is not the sole indicator — icon shape change provides redundant visual cue

## Design Decisions

| Decision                        | Choice                 | Rationale                                                                                  |
| ------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------ |
| Separate component              | Yes                    | Different semantics (toggle state), different ARIA (`aria-pressed`), different variant set |
| Subsumes XDSToggleIcon (#186)   | Yes                    | `pressedIcon` + `pressedIconColor` cover icon toggle patterns without a separate component |
| `isPressed` naming              | Follows `aria-pressed` | WAI-ARIA terminology. `isSelected` implies listbox pattern.                                |
| Outline variant in v1           | Included               | Formalizes the pattern previously achieved by hacking XDSInputGroup borders onto buttons   |
| No `primary`/`destructive`      | Intentional            | Toggle buttons are mode switches, not primary actions or destructive operations            |
| `pressedIconColor` on icon only | Intentional            | Semantic color applies to icon, not label text — label uses standard text color            |
| `isReadOnly` vs `isDisabled`    | Both supported         | Read-only shows state at full opacity, disabled reduces opacity. Different use cases.      |
| `hasTooltip` default            | Auto (icon-only=true)  | Icon-only buttons need tooltips; labeled buttons don't by default                          |

## Files

| File                       | Role  | Purpose                                     |
| -------------------------- | ----- | ------------------------------------------- |
| `index.ts`                 | Entry | Exports XDSToggleButton component and types |
| `XDSToggleButton.tsx`      | Core  | XDSToggleButton component implementation    |
| `XDSToggleButton.test.tsx` | Test  | Unit tests for XDSToggleButton component    |

## Implementation Notes

- Pressed state uses `--color-pressed-overlay` for background, `--color-icon-primary` / `--color-text-primary` for text/icon color
- Pressed label text uses `--font-weight-semibold` (vs `--font-weight-medium` unpressed). A hidden `<span>` with semibold weight reserves the wider width to prevent layout shift when toggling — same technique used by Material UI's bottom navigation
- `pressedIconColor` wraps the icon in a `<span>` with inline `color` style — SVG icons inherit `currentColor`
- Read-only removes hover/active overlays and sets `cursor: default`. Not `disabled` so it remains focusable.
- `onPressedChangeAction` uses React's `useTransition` — the button shows a spinner and is disabled while the promise is pending
- Outline variant uses `--color-divider-emphasized` for border in all states (default, hover, pressed) — only the fill changes
- Hover/active states layer overlays via `backgroundImage` (same pattern as XDSButton)
- `value` prop is reserved for future XDSToggleButtonGroup integration
