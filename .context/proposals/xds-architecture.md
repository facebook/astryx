# XDS Architecture Proposal

_Proposal — January 2026_

## Builder Jobs To Be Done

XDS serves developers across their workflow phases. Based on research in `frontend-developer-jtbd.md`:

### Primary Jobs by Phase

| Phase           | Job                             | What Success Looks Like                                  |
| --------------- | ------------------------------- | -------------------------------------------------------- |
| **Setup**       | Set up project styling          | Define tokens/themes in one place; immediate consistency |
| **Setup**       | Configure for my stack          | Works with my build tools, framework, IDE                |
| **Build**       | Construct pages from components | Compose UI quickly with typed props, autocomplete        |
| **Build**       | Customize component appearance  | Theme changes propagate everywhere automatically         |
| **Build**       | Handle edge cases               | Swizzle when needed, clear escalation path               |
| **Maintain**    | Update to new versions          | Clear migration path, deprecation warnings               |
| **Collaborate** | Work with AI assistants         | Typed APIs, constrained options, predictable patterns    |

### How XDS Layers Map to Jobs

| XDS Layer         | Primary Jobs Served                                        |
| ----------------- | ---------------------------------------------------------- |
| **Theme Layer**   | Set up styling, customize appearance, maintain consistency |
| **Component API** | Construct pages, stay consistent, work with AI             |
| **Swizzle Layer** | Handle edge cases, customize beyond theme                  |
| **CLI/Tooling**   | Configure for stack, adopt incrementally, update versions  |

### The Three Core Builder Actions

| Job                               | What the Builder Wants                                    | XDS Layer         |
| --------------------------------- | --------------------------------------------------------- | ----------------- |
| **1. Set visual style**           | "I want to define my project's look and feel"             | **Theme Layer**   |
| **2. Override/create components** | "I want to customize beyond what's possible in the theme" | **Swizzle Layer** |
| **3. Construct pages**            | "I want to use components to build UIs"                   | **Component API** |

```
┌─────────────────────────────────────────────────────────────────────┐
│  JOB 3: CONSTRUCT PAGES (Component API)                            │
│                                                                     │
│  <XDSButton variant="primary" size="md" />                          │
│  <XDSStack gap="md"><XDSCard>...</XDSCard></XDSStack>              │
│                                                                     │
│  Builder experience:                                                │
│  - Typed props, autocomplete-driven                                │
│  - No styling decisions — just intent and structure                │
│  - AI can generate valid code with high confidence                 │
├─────────────────────────────────────────────────────────────────────┤
│  JOB 2: OVERRIDE/CREATE COMPONENTS (Swizzle Layer)                 │
│                                                                     │
│  npx xds swizzle XDSButton                                            │
│  → src/components/xds/Button/Button.tsx                            │
│                                                                     │
│  Builder experience:                                                │
│  - Full component source, yours to modify                          │
│  - Access to semantic CSS variables (--xds-color-primary)          │
│  - Documented customization points for AI assistance               │
├─────────────────────────────────────────────────────────────────────┤
│  JOB 1: SET VISUAL STYLE (Theme Layer)                             │
│                                                                     │
│  const theme = createTheme({                                       │
│    tokens: {                                                       │
│      color: { primary: ['#0066cc', '#66b3ff'] },                   │
│      spacing: { sm: '0.5rem', md: '1rem' },                        │
│    }                                                               │
│  })                                                                │
│                                                                     │
│  Builder experience:                                                │
│  - Define design tokens in one place                               │
│  - Distributable as npm package                                    │
│  - Components read tokens via CSS variables                        │
└─────────────────────────────────────────────────────────────────────┘
```

### How the Jobs Relate

| If the builder needs...    | They use...   | Complexity |
| -------------------------- | ------------- | ---------- |
| Different colors/spacing   | Theme tokens  | Low        |
| New button variant         | Swizzle       | Medium     |
| Custom component structure | Swizzle       | Medium     |
| New component behavior     | New component | High       |

**Escalation path**: Theme (tokens) → Swizzle (variants) → Custom. Each step up gives more control at the cost of more responsibility.

---

## Context

Designing the architecture for XDS based on explorations in:

- `frontend-developer-jtbd.md` — Developer jobs research, workflow phases
- `zero-styling-architecture.md` — Components with no styles, theme-driven
- `stylex-vs-tailwind.md` — StyleX core + `@xds/variants` wrapper, token tiers, AI considerations
- `ai-trajectory-predictions.md` — Constraints beat suggestions
- `ai-design-system-gaps.md` — Types as enforcement

### Key Requirements

1. **Zero-styling**: Components ship with no inline styles
2. **AI-friendly**: Constrained, predictable, learnable patterns for all three jobs
3. **Open source compatible**: Users define their own themes
4. **Multi-design-system**: Different systems have different semantic lockups
5. **Sub-part styling**: Style internal component slots (icons, labels, etc.)
6. **Evolvable**: Base tokens stay internal, semantic tokens exposed for swizzle
7. **Distributable**: Themes can be packaged and shared independently

---

## Core Architecture

### Three-Layer System

```
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 3: COMPONENT API (Public)                               │
│                                                                 │
│  <XDSButton variant="primary" size="md" />                      │
│  <XDSListItem variant="default" iconSlot={<Icon />} />          │
│                                                                 │
│  - Props define intent, not style                              │
│  - Components define their own variants                        │
│  - TypeScript enforces valid prop combinations                 │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 2: DESIGN TOKENS (Theme Layer)                          │
│                                                                 │
│  const myTheme = createTheme({                                 │
│    tokens: {                                                   │
│      color: { primary: [...], secondary: [...] },              │
│      spacing: { sm: '0.5rem', md: '1rem' },                    │
│      radius: { sm: '4px', md: '8px' },                         │
│    }                                                           │
│  })                                                            │
│                                                                 │
│  - Tokens only — no component-level configurations             │
│  - Components read via CSS variables                           │
│  - Distributable as npm packages                               │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 1: COMPONENT VARIANTS (Swizzle Layer)                   │
│                                                                 │
│  const button = createVariants({                               │
│    variants: { variant: { primary: {...}, secondary: {...} } } │
│  })                                                            │
│                                                                 │
│  - Components define their own variant → style mappings        │
│  - Uses semantic tokens (var(--xds-color-primary))             │
│  - Swizzle to customize variants                               │
└─────────────────────────────────────────────────────────────────┘
```

**Key decision**: Theme = tokens only. Variant customization happens through swizzle, where typing is strict and self-contained.

---

## Handling Different Semantic Lockups

### The Problem

Different design systems have different semantic structures:

| Design System | Button Variants                         |
| ------------- | --------------------------------------- |
| System A      | primary, secondary, tertiary            |
| System B      | primary, secondary, danger, ghost, link |
| System C      | filled, outlined, text                  |
| System D      | brand, neutral, destructive, success    |

How does XDS support all of these with a single component library?

### Solution: Swizzle for Variant Customization

With token-only themes, XDS ships **default components with standard variants**. Users swizzle to customize.

**XDS default Button** (what you get out of the box):

```typescript
// @xds/core/Button.tsx
const button = createVariants({
  variants: {
    variant: {
      primary: { backgroundColor: 'var(--xds-color-primary)' },
      secondary: { backgroundColor: 'var(--xds-color-secondary)' },
      danger: { backgroundColor: 'var(--xds-color-danger)' },
    },
    size: {
      sm: { padding: 'var(--xds-spacing-sm)' },
      md: { padding: 'var(--xds-spacing-md)' },
    }
  }
});

export function Button({ variant = 'primary', size = 'md', children }) { ... }
// Props: variant: 'primary' | 'secondary' | 'danger'
```

**System A swizzles** to get their variants:

```typescript
// src/components/xds/Button.tsx (swizzled)
const button = createVariants({
  variants: {
    variant: {
      primary: { backgroundColor: 'var(--xds-color-primary)' },
      secondary: { backgroundColor: 'var(--xds-color-secondary)' },
      tertiary: { backgroundColor: 'transparent', border: '1px solid' },
    }
  }
});

export function Button({ variant = 'primary', children }) { ... }
// Props: variant: 'primary' | 'secondary' | 'tertiary'
```

### Type Safety is Self-Contained

Each component (swizzled or not) has strict types based on its own variant definition:

```typescript
// Type is inferred from createVariants definition
type ButtonProps = {
  variant: 'primary' | 'secondary' | 'tertiary';  // From swizzled definition
  size?: 'sm' | 'md';
  children: React.ReactNode;
};

// ✅ Valid
<XDSButton variant="tertiary">Click</XDSButton>

// ❌ TypeScript error - 'ghost' not in this component's variants
<XDSButton variant="ghost">Click</XDSButton>
```

### How This Simplifies Things

| Concern                         | Token-only approach               |
| ------------------------------- | --------------------------------- |
| **Where are variants defined?** | In the component file (one place) |
| **Type inference**              | Self-contained in component       |
| **AI context**                  | Component file has everything     |
| **Customization path**          | Swizzle the component             |

---

## Sub-Part Styling (Slots)

### The Problem

Components have internal parts that need independent styling:

- Button: icon, label, loading indicator
- ListItem: leading icon, content, trailing action
- Input: prefix, input, suffix, error message

### Solution: Slots in Component Definition

With token-only themes, slots are defined in the component file using Tailwind Variants (recommended) or `createVariants`.

### Full Example: Button with Slots

**Step 1: Theme provides tokens**

```typescript
// theme.ts
export const theme = createTheme({
  tokens: {
    color: {
      primary: ['#0066cc', '#66b3ff'],
      onPrimary: ['#ffffff', '#000000'],
      secondary: ['#6b7280', '#9ca3af'],
      onSecondary: ['#ffffff', '#000000'],
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
    },
  },
});
```

**Step 2: Component defines variants and slots using tokens**

```typescript
// components/Button.tsx
import { tv } from 'tailwind-variants';

// Tailwind preset maps XDS tokens → Tailwind classes
// bg-primary → var(--xds-color-primary)
// px-md → var(--xds-spacing-md)

const button = tv({
  slots: {
    base: 'inline-flex items-center justify-center rounded-md cursor-pointer transition-colors',
    icon: 'shrink-0',
    label: 'font-medium',
    spinner: 'animate-spin',
  },

  variants: {
    variant: {
      primary: {
        base: 'bg-primary text-on-primary hover:bg-primary-dark focus:ring-2 focus:ring-primary/50',
        icon: 'text-on-primary',
      },
      secondary: {
        base: 'bg-secondary text-on-secondary hover:bg-secondary-dark',
        icon: 'text-on-secondary',
      },
      ghost: {
        base: 'bg-transparent text-primary hover:bg-primary/10',
        icon: 'text-primary',
      },
    },
    size: {
      sm: {
        base: 'px-sm py-xs text-sm gap-xs',
        icon: 'w-3 h-3',
      },
      md: {
        base: 'px-md py-sm text-base gap-sm',
        icon: 'w-4 h-4',
      },
      lg: {
        base: 'px-lg py-md text-lg gap-sm',
        icon: 'w-5 h-5',
      },
    },
  },

  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

// TypeScript infers props from variant definition
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  isLoading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({
  variant,
  size,
  icon,
  isLoading,
  children,
  onClick,
}: ButtonProps) {
  const styles = button({ variant, size });

  return (
    <button className={styles.base()} onClick={onClick} disabled={isLoading}>
      {isLoading ? (
        <Spinner className={styles.spinner()} />
      ) : (
        icon && <span className={styles.icon()}>{icon}</span>
      )}
      <span className={styles.label()}>{children}</span>
    </button>
  );
}
```

**Step 3: Use in app with theme provider**

```tsx
// App.tsx
import {Theme} from '@xds/core';
import {theme} from './theme';
import {XDSButton} from './components/Button';
import {PlusIcon} from './icons';

function App() {
  return (
    <Theme theme={theme}>
      {/* Tokens flow through CSS variables */}
      <XDSButton variant="primary" size="md" icon={<PlusIcon />}>
        Add Item
      </XDSButton>

      <XDSButton variant="ghost" size="sm">
        Cancel
      </XDSButton>

      <XDSButton variant="secondary" size="lg" isLoading>
        Saving...
      </XDSButton>
    </Theme>
  );
}
```

### How It All Connects

```
┌─────────────────────────────────────────────────────────────────┐
│  THEME (tokens only)                                            │
│  primary: ['#0066cc', '#66b3ff']                               │
│           ↓                                                     │
│  Generates CSS: --xds-color-primary: light-dark(#0066cc, ...)  │
└──────────────────────────┬──────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│  TAILWIND PRESET                                                │
│  Maps: bg-primary → background-color: var(--xds-color-primary) │
└──────────────────────────┬──────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│  COMPONENT (variants + slots)                                   │
│  primary: { base: 'bg-primary text-on-primary' }               │
│  Button reads tokens via Tailwind classes                      │
└──────────────────────────┬──────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│  USAGE                                                          │
│  <XDSButton variant="primary" icon={<Plus />}>Add</XDSButton>        │
│  Props are typed, tokens flow through, slots render correctly  │
└─────────────────────────────────────────────────────────────────┘
```

### Slot Styling per Variant

Slots can have different styles per variant:

```typescript
variants: {
  variant: {
    primary: {
      base: 'bg-primary text-on-primary',
      icon: 'text-on-primary',           // Icon inherits primary colors
    },
    ghost: {
      base: 'bg-transparent text-primary',
      icon: 'text-primary opacity-70',   // Icon is slightly muted
    },
  }
}
```

### Using StyleX + createVariants (Alternative)

For advanced users who prefer StyleX:

```typescript
import * as stylex from '@stylexjs/stylex';
import {createVariants} from '@xds/variants';

const button = createVariants({
  base: stylex.create({root: {cursor: 'pointer', borderRadius: 4}}).root,

  slots: {
    icon: stylex.create({root: {width: 16, height: 16}}).root,
    label: stylex.create({root: {fontWeight: 500}}).root,
  },

  variants: {
    variant: {
      primary: stylex.create({
        root: {
          backgroundColor: 'var(--xds-color-primary)',
          color: 'var(--xds-color-on-primary)',
        },
      }).root,
    },
  },
});
```

---

## Theme Definition API

> **Implementation Status**: ✅ Implemented in `/packages/core/src/theme/`

### Actual Implementation

XDS uses StyleX for theming, with pre-compiled theme objects:

```typescript
// /packages/core/src/theme/tokens.stylex.ts
import * as stylex from '@stylexjs/stylex';

// Define CSS variables with stylex.defineVars
export const colorTokens = stylex.defineVars({
  accent: 'light-dark(#0064E0, #2694FE)',
  accentText: 'light-dark(#0064E0, #2694FE)',
  surface: 'light-dark(#FFFFFF, #1C1C1C)',
  textPrimary: 'light-dark(#171717, #FAFAFA)',
  hoverOverlay: 'light-dark(#0000000C, #FFFFFF0C)',
  pressedOverlay: 'light-dark(#00000019, #FFFFFF19)',
  // ... more tokens
});

export const spacingTokens = stylex.defineVars({
  space0: '0px',
  space1: '4px',
  space2: '8px',
  space3: '12px',
  space4: '16px',
  // ...
});
```

### Theme Creation

Themes override token values using `stylex.createTheme`:

```typescript
// /packages/core/src/theme/neutralTheme.stylex.ts
import * as stylex from '@stylexjs/stylex';
import {colorTokens} from './tokens.stylex';
import type {Theme} from './types';

const colorTheme = stylex.createTheme(colorTokens, {
  accent: 'light-dark(oklch(0.205 0 0), oklch(0.922 0 0))',
  surface: 'light-dark(oklch(1 0 0), oklch(0.145 0 0))',
  // ... override values
});

// Component-specific variant overrides
const buttonVariants = stylex.create({
  primary: {
    color: 'light-dark(white, oklch(0.145 0 0))',
  },
  secondary: {
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colorTokens.divider,
  },
});

export const neutralTheme: Theme = {
  name: 'neutral',
  colorTheme,
  elevationTheme,
  spacingTheme,
  radiusTheme,
  transitionTheme,
  typographyTheme,
  components: {
    button: {variants: buttonVariants},
  },
};
```

### Theme Type Structure

```typescript
// /packages/core/src/theme/types.ts
export interface ComponentStyles {
  // Components register via module augmentation
  // See Button.tsx for example
}

export interface Theme {
  name: string;
  colorTheme: StyleXTheme;
  elevationTheme: StyleXTheme;
  spacingTheme?: StyleXTheme;
  radiusTheme?: StyleXTheme;
  transitionTheme?: StyleXTheme;
  typographyTheme?: StyleXTheme;
  components?: ComponentStyles; // Component-level variant overrides
}
```

### Light/Dark Mode

All color values use CSS `light-dark()` function for automatic mode switching:

```css
/* Generated CSS */
--xds-color-accent: light-dark(#0064e0, #2694fe);
--xds-color-surface: light-dark(#ffffff, #1c1c1c);
```

The Theme provider sets `color-scheme` to control which value is used:

```tsx
// Theme.tsx applies color-scheme based on mode prop
<div
  style={{
    colorScheme:
      mode === 'dark' ? 'dark' : mode === 'light' ? 'light' : 'light dark',
  }}>
  {children}
</div>
```

### Manual Mode Override

```tsx
// Follow system preference (default)
<Theme theme={myTheme} mode="system">

// Force dark mode
<Theme theme={myTheme} mode="dark">

// Force light mode
<Theme theme={myTheme} mode="light">
```

---

## Component Implementation

> **Implementation Status**: ✅ Button implemented as reference component

### Actual Button Implementation

Components use StyleX with theme tokens and support theme-level variant overrides:

```typescript
// /packages/core/src/Button/Button.tsx
import * as stylex from '@stylexjs/stylex';
import { colorTokens, spacingTokens, radiusTokens } from '../theme/tokens.stylex';
import { ThemeContext } from '../theme/ThemeContext';
import type { StyleXStyles } from '../theme/types';

// Variant styles using tokens
const variants = stylex.create({
  primary: {
    backgroundColor: colorTokens.accent,
    color: 'white',
    backgroundImage: {
      default: null,
      ':hover': `linear-gradient(${colorTokens.hoverOverlay}, ${colorTokens.hoverOverlay})`,
      ':active': `linear-gradient(${colorTokens.pressedOverlay}, ${colorTokens.pressedOverlay})`,
    },
    outline: {
      default: null,
      ':focus-visible': `2px solid ${colorTokens.focusOutline}`,
    },
    outlineOffset: {
      default: null,
      ':focus-visible': '3px',
    },
  },
  secondary: { /* ... */ },
  ghost: { /* ... */ },
  destructive: { /* ... */ },
});

// Derive variant type from StyleX object
export type ButtonVariant = keyof typeof variants;

// Module augmentation - register with theme types
declare module '../theme/types' {
  interface ComponentStyles {
    button?: {
      variants?: Partial<Record<ButtonVariant, StyleXStyles>>;
    };
  }
}

// Component consumes theme variant overrides
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', children, ...props }, ref) => {
    const themeContext = useContext(ThemeContext);
    const themeVariantOverride = themeContext?.theme.components?.button?.variants?.[variant];

    return (
      <button
        ref={ref}
        {...stylex.props(
          styles.base,
          variants[variant],
          themeVariantOverride  // Theme override applied on top
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
```

### Key Patterns

| Pattern                        | Purpose                                                               |
| ------------------------------ | --------------------------------------------------------------------- |
| `keyof typeof variants`        | Derive variant type from StyleX object                                |
| `backgroundImage` for overlays | Layer hover/active colors on top of background                        |
| Module augmentation            | Register component variants with theme types without circular imports |
| `ThemeContext` consumption     | Apply theme-level variant overrides                                   |

---

## Token Categories

> **Implementation Status**: ✅ Implemented in `/packages/core/src/theme/tokens.stylex.ts`

| Category           | Purpose                                             | Examples                                                |
| ------------------ | --------------------------------------------------- | ------------------------------------------------------- |
| `colorTokens`      | All colors (semantic, text, icon, status, dividers) | `accent`, `textPrimary`, `hoverOverlay`, `negative`     |
| `spacingTokens`    | Consistent spacing scale                            | `space1` (4px), `space2` (8px), `space4` (16px)         |
| `radiusTokens`     | Border radius for different contexts                | `rounded`, `container`, `element`, `content`            |
| `elevationTokens`  | Box shadows                                         | `base`, `thumb`, `dialog`, `hover`, `menu`              |
| `transitionTokens` | Animation durations                                 | `fast` (0.15s), `normal` (0.2s)                         |
| `typographyTokens` | Font families                                       | `fontFamilyBody`, `fontFamilyCode`, `fontFamilyHeading` |

---

## AI Compatibility Considerations

### AI-Friendliness by Job

| Job                     | AI Difficulty | Why                                                         |
| ----------------------- | ------------- | ----------------------------------------------------------- |
| **Construct pages**     | ✅ Easy       | Typed props, autocomplete, finite options                   |
| **Set visual style**    | ⚠️ Medium     | Theme structure is learnable, but separate from components  |
| **Override components** | ⚠️ Medium     | Documented patterns, semantic tokens, but unfamiliar StyleX |

### Why This Architecture Is AI-Friendly

| Design Decision            | AI Benefit                                                                     |
| -------------------------- | ------------------------------------------------------------------------------ |
| **Props, not classes**     | `variant="primary"` is learnable; `bg-blue-500 hover:bg-blue-600` is arbitrary |
| **TypeScript enforcement** | Invalid props fail at compile time, AI gets immediate feedback                 |
| **Finite variant set**     | AI learns discrete options, not infinite styling possibilities                 |
| **Consistent patterns**    | Same API shape across all components                                           |
| **No arbitrary values**    | Can't generate `mt-[13px]`, only valid tokens                                  |
| **Re-export pattern**      | Concrete types in one file, no cross-package reasoning                         |

### The Author vs Consumer Gap

The "AI gap" is primarily for **component authors**, not **component consumers**.

| Role                     | API Surface                                   | AI Difficulty                       |
| ------------------------ | --------------------------------------------- | ----------------------------------- |
| **Consumer** (Job 3)     | `<XDSButton variant="primary" size="md">`     | Trivial — typed props, autocomplete |
| **Theme author** (Job 1) | `createTheme({ ... })`                        | Medium — structured, learnable      |
| **Swizzler** (Job 2)     | StyleX + semantic CSS variables               | Medium — documented patterns        |
| **Component author**     | `createVariants({ ... stylex.create() ... })` | Higher — unfamiliar patterns        |

**Why this matters**: Most users are consumers (Job 3). They never touch StyleX — they just use typed props.

### Theme as AI Context

Themes are structured data that can be included in AI context:

```typescript
// Theme can be serialized for LLM context
const themeContext = {
  availableVariants: {
    button: ['primary', 'secondary', 'danger'],
    input: ['default', 'error', 'success'],
  },
  availableSizes: ['sm', 'md', 'lg'],
  // ...
};
```

This enables AI to:

1. Know valid prop values without reading source
2. Generate only theme-valid code
3. Adapt to different themes dynamically

---

## Tailwind Interoperability

### Exporting Theme as CSS Variables

```typescript
// Auto-generated from theme
:root {
  --xds-color-primary: #0066cc;
  --xds-color-secondary: #6b7280;
  --xds-spacing-md: 1rem;
  /* ... */
}
```

### Tailwind Preset

```css
/* @xds/tailwind-preset */
@import 'tailwindcss';
@import '@xds/tokens/css';

@theme {
  --color-primary: var(--xds-color-primary);
  --color-secondary: var(--xds-color-secondary);
  --spacing-md: var(--xds-spacing-md);
  /* ... */
}
```

Now Tailwind users can use XDS tokens:

```html
<div class="bg-primary text-on-primary p-md">Tailwind with XDS tokens</div>
```

### Linting for Arbitrary Values

Provide ESLint/Stylelint rules to prevent:

```html
<!-- ❌ Flagged by lint -->
<div class="bg-[#0066cc] mt-[13px]">
  <!-- ✅ Allowed -->
  <div class="bg-primary mt-md"></div>
</div>
```

---

## Swizzle API

**Job 2: Override/Create Components** — When you need to customize variants or behavior.

With token-only themes, swizzle is the path for **any component-level customization** beyond token changes.

### When to Swizzle

| Need                              | Solution          |
| --------------------------------- | ----------------- |
| Different primary color           | Edit theme tokens |
| New button variant (e.g. `ghost`) | Swizzle Button    |
| Custom click tracking             | Swizzle Button    |
| Different animation               | Swizzle Button    |
| Structural changes                | Swizzle Button    |

### Swizzle Command

```bash
# Default: Tailwind Variants format (recommended)
npx xds swizzle XDSButton

# StyleX format (for advanced users)
npx xds swizzle XDSButton --format=stylex
```

### Generated Code: Tailwind Variants (Default)

```typescript
/**
 * 🎨 SWIZZLED COMPONENT: Button
 *
 * Source: @xds/core@2.1.0
 * Swizzled: 2026-01-09
 *
 * ⚠️ This component is now your responsibility.
 *
 * RULES:
 * ✅ Use XDS token classes: bg-primary, text-on-primary, p-md
 * ❌ No arbitrary values: bg-[#ff0000], mt-[13px]
 *
 * COMMON CUSTOMIZATIONS:
 * - Add variant: add to variants.variant below
 * - Add behavior: modify handleClick function
 * - Change structure: modify JSX return
 */

import { tv } from 'tailwind-variants';

const button = tv({
  slots: {
    base: 'rounded-md cursor-pointer transition-colors',
    icon: 'w-4 h-4',
    label: 'font-medium',
  },

  variants: {
    // 👇 CUSTOMIZE: Add or modify variants
    variant: {
      primary: {
        base: 'bg-primary text-on-primary hover:bg-primary-dark',
        icon: 'text-on-primary',
      },
      secondary: {
        base: 'bg-secondary text-on-secondary hover:bg-secondary-dark',
        icon: 'text-on-secondary',
      },
      danger: {
        base: 'bg-danger text-on-danger hover:bg-danger-dark',
      },
    },

    size: {
      sm: { base: 'px-sm py-xs text-sm', icon: 'w-3 h-3' },
      md: { base: 'px-md py-sm text-base', icon: 'w-4 h-4' },
      lg: { base: 'px-lg py-md text-lg', icon: 'w-5 h-5' },
    },
  },

  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  // 👇 CUSTOMIZE: Add new props
}

export function Button({ variant, size, icon, children, onClick }: ButtonProps) {
  const styles = button({ variant, size });

  // 👇 CUSTOMIZE: Add behavior (tracking, analytics, etc.)
  const handleClick = () => {
    onClick?.();
  };

  return (
    <button className={styles.base()} onClick={handleClick}>
      {icon && <span className={styles.icon()}>{icon}</span>}
      <span className={styles.label()}>{children}</span>
    </button>
  );
}
```

### Why Tailwind is the Default

| Consideration      | Tailwind Variants     | StyleX                |
| ------------------ | --------------------- | --------------------- |
| **AI familiarity** | ✅ High training data | ⚠️ Less common        |
| **Learning curve** | ✅ Familiar to most   | ⚠️ New syntax         |
| **Encapsulation**  | ⚠️ Classes in DOM     | ✅ No exposed classes |
| **Recommendation** | **Default for most**  | Advanced users        |

### Format: StyleX (Alternative)

For advanced users who want maximum encapsulation:

```bash
npx xds swizzle XDSButton --format=stylex
```

```typescript
import * as stylex from '@stylexjs/stylex';
import { createVariants } from '@xds/variants';

const button = createVariants({
  base: stylex.create({ root: { cursor: 'pointer', borderRadius: 4 } }).root,

  slots: {
    icon: stylex.create({ root: { width: 16, height: 16 } }).root,
    label: stylex.create({ root: { fontWeight: 500 } }).root,
  },

  variants: {
    variant: {
      primary: stylex.create({
        root: {
          backgroundColor: 'var(--xds-color-primary)',
          color: 'var(--xds-color-on-primary)',
        }
      }).root,
      // 👇 CUSTOMIZE: Add variants
    }
  }
});

export function Button({ variant = 'primary', children }) {
  const styles = button({ variant });
  return (
    <button {...stylex.props(styles.base())}>
      <span {...stylex.props(styles.slots.label())}>{children}</span>
    </button>
  );
}
```

### Token Enforcement

Both formats use XDS tokens via the Tailwind preset — no arbitrary values:

```tsx
// ✅ Uses XDS token
base: 'bg-primary text-on-primary p-md',

// ❌ Linting error: arbitrary value not allowed
base: 'bg-[#0066cc] text-white p-4',
```

### Swizzle Versioning

Swizzled components are "ejected" — they don't auto-update:

```
⚠️ Swizzled component: Button
   Source version: @xds/core@2.1.0
   Last synced: 2026-01-15

   This component is now your responsibility.
   Check @xds/core changelog for updates.
```

---

## Distributable Themes

**Job 1: Set Visual Style** — Themes can be packaged and shared independently.

### Theme as npm Package

With token-only themes, packages are simple:

```
@company/dark-theme/
├── package.json
├── theme.ts          # Token definitions
├── index.ts          # Exports theme + types
└── tokens.css        # Generated CSS variables
```

```typescript
// @company/dark-theme/theme.ts
import {createTheme} from '@xds/core';

export const darkTheme = createTheme({
  tokens: {
    color: {
      primary: ['#6366f1', '#818cf8'],
      onPrimary: ['#ffffff', '#000000'],
      background: ['#1a1a2e', '#0f0f1a'],
      onBackground: ['#e0e0e0', '#ffffff'],
      // ...
    },
    spacing: {
      sm: '0.5rem',
      md: '1rem',
    },
  },
});

export type DarkTheme = typeof darkTheme;
```

### Using a Theme Package

```typescript
// src/App.tsx
import { Theme } from '@xds/core';
import { darkTheme } from '@company/dark-theme';
import { XDSButton } from '@xds/core';

function App() {
  return (
    <Theme theme={darkTheme}>
      <XDSButton variant="primary">Click me</XDSButton>
    </Theme>
  );
}
```

### Type Safety

With token-only themes, type safety is straightforward:

| What                   | Where Types Come From                               |
| ---------------------- | --------------------------------------------------- |
| **Tokens**             | Theme definition (`darkTheme.tokens.color.primary`) |
| **Component variants** | Component definition (self-contained)               |

Components have their own types based on their variant definitions — no cross-package type inference needed.

---

## Open Questions

### Resolved (with actual implementation)

1. ~~**Light/dark mode support?**~~ → **Resolved**: CSS `light-dark()` function. Theme provider sets `color-scheme` property. Mode prop (`system`/`light`/`dark`) controls behavior.

2. ~~**Component themes in theme vs component file?**~~ → **Resolved**: Hybrid approach - component variants defined in component files, themes can provide variant overrides via `components.button.variants`.

3. ~~**Prop naming (intent vs variant)?**~~ → **Resolved**: Use `variant` — more corpus representation for AI.

4. ~~**Type inference from StyleX objects?**~~ → **Resolved**: `keyof typeof variants` derives variant type from StyleX object. Types stay in sync automatically.

5. ~~**Theme-to-component type coupling?**~~ → **Resolved**: Module augmentation - each component declares its own entry in `ComponentStyles` interface, avoiding circular imports.

6. ~~**Default theme?**~~ → **Resolved**: XDS ships `defaultTheme` and `neutralTheme`. Themes are required to wrap components.

7. ~~**Compile-time vs runtime themes?**~~ → **Resolved**: Compile-time via StyleX. Themes are pre-compiled `stylex.createTheme()` objects.

### Unresolved Design Decisions

1. **How deep should slot nesting go?**
   - `button.slots.icon.hover` or just `button.slots.icon`?
   - Risk of over-specification vs. flexibility

2. **How to handle responsive tokens?**
   - `spacing: { md: { default: '1rem', '@md': '1.5rem' } }`
   - Or separate responsive layer?

3. **Theme validation/linting?**
   - Warn if theme is missing required tokens?
   - Provide a `validateTheme()` function?

### Swizzle Layer (Not Yet Implemented)

4. **Swizzle CLI?**
   - `npx xds swizzle XDSButton` to eject component?
   - Currently, component variant overrides are theme-based, not file-based

5. **Swizzle sync command?**
   - `npx xds sync XDSButton` to see upstream changes?
   - How do we help users stay up-to-date?

### Future Considerations

6. **Responsive variants?**
   - Should responsive breakpoints be part of variant API?
   - Or handled via StyleX media queries?

7. **Tailwind preset?**
   - XDS tokens available as Tailwind utilities for hybrid projects
   - Not yet implemented

---

## Styling Technology

### Decision: StyleX + `@xds/variants` Wrapper

Based on exploration in `stylex-vs-tailwind.md`, the recommended approach is:

**StyleX** for the styling engine:

- Compile-time CSS extraction, zero runtime
- Full TypeScript integration
- Scoped theming is first-class
- No exposed CSS classes to consumers

**`@xds/variants`** wrapper for ergonomics:

- tw-classed-like variant API
- Slots for sub-part styling
- Compound variants, default variants
- Type inference from variant definition

**Tailwind preset** for ecosystem compatibility:

- XDS tokens available as Tailwind utilities
- Interop without compromising enforcement

### Why Not Pure Tailwind?

| Issue                                | Impact                                         |
| ------------------------------------ | ---------------------------------------------- |
| Arbitrary values bypass constraints  | AI can generate `mt-[13px]`                    |
| Classes are public                   | Consumers can depend on implementation details |
| Theme tokens are all public CSS vars | Can't evolve without breaking consumers        |
| Type safety is weak                  | No compile-time enforcement                    |

### Component Authoring with `@xds/variants`

```typescript
import {createVariants} from '@xds/variants';
import * as stylex from '@stylexjs/stylex';

const button = createVariants({
  base: stylex.create({
    root: {cursor: 'pointer', borderRadius: 4},
  }).root,

  slots: {
    icon: stylex.create({root: {width: 16, height: 16}}).root,
    label: stylex.create({root: {fontWeight: 500}}).root,
  },

  variants: {
    variant: {
      primary: stylex.create({
        root: {backgroundColor: 'var(--xds-color-primary)'},
      }).root,
      secondary: stylex.create({
        root: {backgroundColor: 'var(--xds-color-secondary)'},
      }).root,
    },
    size: {
      sm: stylex.create({root: {padding: 4, fontSize: 14}}).root,
      md: stylex.create({root: {padding: 8, fontSize: 16}}).root,
    },
  },

  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

// TypeScript infers: { variant: 'primary' | 'secondary', size: 'sm' | 'md' }
```

This provides tw-classed ergonomics without exposed CSS classes.

---

## Implementation Phases

### Phase 1: Core Infrastructure ✅ Complete

**Token System**

- `stylex.defineVars` for tokens (colors, spacing, typography, radius, transitions, elevation)
- `light-dark()` CSS function for automatic light/dark mode switching
- Token categories: color, spacing, radius, transition, typography, elevation

**Theme System**

- `ThemeContext` for providing theme to component tree
- `Theme` provider component with mode prop ('light' | 'dark' | 'system')
- `stylex.createTheme` for theme-level token overrides
- Component-level variant overrides via `theme.components.{component}.variants`
- Module augmentation pattern for type-safe component styles (avoids circular imports)

**Pilot Components**

- Button with variants (primary, secondary, ghost, destructive)
- Loading state with spinner animation
- Press effect (scale 98%)
- Theme variant consumption pattern

**Infrastructure**

- Storybook integration with theme switching
- Vitest with StyleX babel plugin for testing
- Component template (`/create-component` slash command)

### Phase 2: Component Library

- Additional components (XDSInput, XDSText, XDSBox, XDSStack, XDSCard, etc.)
- Slot-level styling (icon, label, prefix, suffix)
- Full variant/size matrix across components

### Phase 3: Ecosystem

- Theme gallery / community themes
- Documentation site
- Migration guides from other design systems

### Phase 4: Advanced Features

- Swizzle CLI for component customization
- Animation tokens
- Multi-theme composition
- Responsive tokens

---

## Related Explorations

- `frontend-developer-jtbd.md` — Developer jobs research, workflow phases
- `swizzle-layer-ergonomics.md` — Dual-path swizzle approach, AI-friendliness
- `zero-styling-architecture.md` — Foundational concept
- `stylex-vs-tailwind.md` — Styling technology choice, token tiers, `@xds/variants` wrapper approach
- `ai-trajectory-predictions.md` — Why constraints matter long-term
- `required-props-pattern.md` — Explicit APIs for AI
- `distribution-methods.md` — How themes will be distributed
- `stylex-patterns.md` — StyleX usage patterns, challenges, and workarounds (e.g., `backgroundImage` for overlay effects)
- `component-swizzling.md` — How customized components could be distributed alongside themes
- `component-reference.md` — Complete Button implementation as canonical component template

---

## Sources

- [Rangle.io: Token Structure](https://Rangle.io/blog/developing-your-token-structure)
- [StyleX Theming Guide](https://stylexjs.com/docs/learn/theming/creating-themes/)
- [Tailwind v4 Theme Docs](https://tailwindcss.com/docs/theme)
- [UXPin: Component-Based Design](https://www.uxpin.com/studio/blog/component-based-design-complete-implementation-guide/)
