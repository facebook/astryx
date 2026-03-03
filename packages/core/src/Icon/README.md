# Icon

Renders icons with XDS design system colors and sizes. Supports both direct SVG icon components and semantic icon names that adapt to the active theme.

<!-- SYNC: When files in this directory change, update this document. -->

## Import

```tsx
import {XDSIcon} from '@xds/core/Icon';
```

## Features

- **Semantic Icon Names**: Use names like `'close'` or `'chevronDown'` — resolved from the theme's icon registry
- **Direct Icon Components**: Pass any SVG icon component (heroicons, lucide, etc.) directly
- **Theme-Adaptable**: Semantic icons automatically match the active theme's icon set
- **Built-in Fallbacks**: 12 lightweight inline SVGs (~1.4KB) ensure icons render without a theme
- **Theme Colors**: Color variants mapped to XDS icon color tokens
- **Consistent Sizing**: Four size options aligned with common UI patterns
- **Accessible**: Icons are hidden from screen readers by default (aria-hidden)

## Usage

### Semantic icon names (theme-adaptable)

Use semantic names for icons that should adapt to the active theme. These resolve from the theme's icon registry, falling back to built-in SVGs when no theme is present.

```tsx
import { XDSIcon } from '@xds/core/Icon';

// Semantic name — adapts to theme
<XDSIcon icon="close" />
<XDSIcon icon="chevronDown" size="sm" color="inherit" />
<XDSIcon icon="checkCircle" color="positive" />

// Great for building theme-adaptable UI
<XDSIcon icon="info" size="sm" color="secondary" />
```

### Direct icon components

Pass SVG icon components directly when you need a specific icon that isn't in the semantic set, or when you want full control.

```tsx
import { XDSIcon } from '@xds/core/Icon';
import { HomeIcon } from '@heroicons/react/24/outline';
import { HeartIcon } from '@heroicons/react/24/solid';

// Direct component
<XDSIcon icon={HomeIcon} />
<XDSIcon icon={HomeIcon} color="accent" size="lg" />
<XDSIcon icon={HeartIcon} color="negative" />

// Accessible icon with label
<XDSIcon icon={HomeIcon} aria-hidden={false} aria-label="Home" role="img" />
```

## Props

| Prop    | Type                                                                                                                     | Default     | Description                         |
| ------- | ------------------------------------------------------------------------------------------------------------------------ | ----------- | ----------------------------------- |
| `icon`  | `XDSIconName \| ComponentType<SVGProps>`                                                                                 | (required)  | Semantic name or SVG icon component |
| `color` | `'primary' \| 'secondary' \| 'tertiary' \| 'disabled' \| 'accent' \| 'positive' \| 'negative' \| 'warning' \| 'inherit'` | `'primary'` | Color variant                       |
| `size`  | `'xsm' \| 'sm' \| 'md' \| 'lg'`                                                                                          | `'md'`      | Icon size                           |

When `icon` is a component, additional SVG props (like `aria-label`, `role`) are passed through to the underlying SVG element.

## Semantic Icon Names

These names are used internally by XDS components and can be used in your own UI to build theme-adaptable interfaces. They resolve from the theme's icon registry, or fall back to built-in lightweight SVGs.

| Name           | Used by                         | Description           |
| -------------- | ------------------------------- | --------------------- |
| `close`        | CloseButton, TimeInput          | ✕ close / dismiss     |
| `chevronDown`  | DropdownMenu, Selector, TabMenu | ▾ expand / dropdown   |
| `chevronLeft`  | Calendar                        | ‹ previous            |
| `chevronRight` | Calendar                        | › next                |
| `check`        | Selector, TabMenu               | ✓ selected item       |
| `checkCircle`  | Input status                    | ✓○ success            |
| `xCircle`      | Input status                    | ✕○ error              |
| `warning`      | Input status                    | △! warning            |
| `info`         | FieldLabel                      | ⓘ information tooltip |
| `calendar`     | DateInput                       | 📅 date picker        |
| `clock`        | TimeInput                       | 🕐 time picker        |
| `externalLink` | Link                            | ↗ opens in new window |

## Color Variants

| Value       | Token                    | Use Case                        |
| ----------- | ------------------------ | ------------------------------- |
| `primary`   | `--color-icon-primary`   | Default icon color              |
| `secondary` | `--color-icon-secondary` | De-emphasized icons             |
| `tertiary`  | `--color-icon-tertiary`  | Subtle, background icons        |
| `disabled`  | `--color-icon-disabled`  | Disabled state                  |
| `accent`    | `--color-accent`         | Interactive, actionable icons   |
| `positive`  | `--color-positive`       | Success, confirmation           |
| `negative`  | `--color-negative`       | Error, destructive actions      |
| `warning`   | `--color-warning`        | Caution, attention              |
| `inherit`   | `currentColor`           | Inherits from parent text color |

## Size Variants

| Value | Dimensions | Use Case                     |
| ----- | ---------- | ---------------------------- |
| `xsm` | 12x12px    | Dense UI, badges, indicators |
| `sm`  | 16x16px    | Inline with text, compact UI |
| `md`  | 20x20px    | Default, buttons, inputs     |
| `lg`  | 24x24px    | Emphasis, standalone icons   |

## How Icon Resolution Works

When `icon` is a semantic name string:

1. **Theme registry** — If an `XDSTheme` is active and provides an icon for that name, it's used
2. **Built-in fallback** — Otherwise, a lightweight inline SVG is rendered

This means components always render visually complete, even without a theme. Themes can override any or all icons — the registry accepts partial overrides.

## Icon Sources

Any SVG icon component works with the direct component mode:

```tsx
// Heroicons
import {HomeIcon} from '@heroicons/react/24/outline';

// Lucide
import {Home} from 'lucide-react';

// Any component matching ComponentType<SVGProps<SVGSVGElement>>
```

## Theming

Themes can override `Icon` styles via `ComponentStyles`:

```tsx
// In your theme definition
const theme: Theme = {
  // ...tokens...
  components: {
    icon: {
      root: myStyles,
    },
  },
};
```

### Available surfaces

| Surface | Description             |
| ------- | ----------------------- |
| `root`  | Root SVG element styles |

## Files

| File               | Role     | Purpose                                  |
| ------------------ | -------- | ---------------------------------------- |
| `index.ts`         | Entry    | Exports component, types, and registry   |
| `XDSIcon.tsx`      | Core     | Component implementation (both modes)    |
| `IconRegistry.tsx` | Registry | Context, hook, and semantic name types   |
| `defaultIcons.tsx` | Fallback | 12 lightweight inline SVG fallback icons |
| `XDSIcon.test.tsx` | Test     | Unit tests                               |

## Implementation Notes

- Uses `aria-hidden="true"` by default since icons are typically decorative
- For meaningful icons, set `aria-hidden={false}`, `role="img"`, and `aria-label`
- `flexShrink: 0` prevents icons from shrinking in flex containers
- String mode wraps the resolved icon in a `<span>` with `fontSize`-based sizing so `1em`-based registry icons scale correctly
- Component mode passes `stylex.props` directly to the SVG element for zero-overhead styling
