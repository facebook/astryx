# XDS Architecture Proposal

*Proposal — January 2026*

## Builder Jobs To Be Done

XDS serves developers across their workflow phases. Based on research in `frontend-developer-jtbd.md`:

### Primary Jobs by Phase

| Phase | Job | What Success Looks Like |
|-------|-----|------------------------|
| **Setup** | Set up project styling | Define tokens/themes in one place; immediate consistency |
| **Setup** | Configure for my stack | Works with my build tools, framework, IDE |
| **Build** | Construct pages from components | Compose UI quickly with typed props, autocomplete |
| **Build** | Customize component appearance | Theme changes propagate everywhere automatically |
| **Build** | Handle edge cases | Swizzle when needed, clear escalation path |
| **Maintain** | Update to new versions | Clear migration path, deprecation warnings |
| **Collaborate** | Work with AI assistants | Typed APIs, constrained options, predictable patterns |

### How XDS Layers Map to Jobs

| XDS Layer | Primary Jobs Served |
|-----------|---------------------|
| **Theme Layer** | Set up styling, customize appearance, maintain consistency |
| **Component API** | Construct pages, stay consistent, work with AI |
| **Swizzle Layer** | Handle edge cases, customize beyond theme |
| **CLI/Tooling** | Configure for stack, adopt incrementally, update versions |

### The Three Core Builder Actions

| Job | What the Builder Wants | XDS Layer |
|-----|------------------------|-----------|
| **1. Set visual style** | "I want to define my project's look and feel" | **Theme Layer** |
| **2. Override/create components** | "I want to customize beyond what's possible in the theme" | **Swizzle Layer** |
| **3. Construct pages** | "I want to use components to build UIs" | **Component API** |

```
┌─────────────────────────────────────────────────────────────────────┐
│  JOB 3: CONSTRUCT PAGES (Component API)                            │
│                                                                     │
│  <Button intent="primary" size="md" />                             │
│  <Stack gap="md"><Card>...</Card></Stack>                          │
│                                                                     │
│  Builder experience:                                                │
│  - Typed props, autocomplete-driven                                │
│  - No styling decisions — just intent and structure                │
│  - AI can generate valid code with high confidence                 │
├─────────────────────────────────────────────────────────────────────┤
│  JOB 2: OVERRIDE/CREATE COMPONENTS (Swizzle Layer)                 │
│                                                                     │
│  npx xds swizzle Button                                            │
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
│    tokens: { color: { primary: '#0066cc' } },                      │
│    components: { button: { intents: {...} } }                      │
│  })                                                                │
│                                                                     │
│  Builder experience:                                                │
│  - Define tokens and component variants in one place               │
│  - Distributable as npm package                                    │
│  - Type-safe, validates against component requirements             │
└─────────────────────────────────────────────────────────────────────┘
```

### How the Jobs Relate

| If the builder needs... | They use... | Complexity |
|------------------------|-------------|------------|
| Different colors | Theme tokens | Low |
| New button variant | Theme component intents | Low |
| Custom component structure | Swizzle | Medium |
| New component behavior | New component | High |

**Escalation path**: Theme → Swizzle → Custom. Each step up gives more control at the cost of more responsibility.

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
│  <Button intent="primary" size="md" />                         │
│  <ListItem intent="default" iconSlot={<Icon />} />             │
│                                                                 │
│  - Props define intent, not style                              │
│  - Zero styling on components                                  │
│  - TypeScript enforces valid prop combinations                 │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 2: THEME DEFINITION (User-Defined)                      │
│                                                                 │
│  const myTheme = createTheme({                                 │
│    button: {                                                   │
│      intents: { primary: {...}, secondary: {...} },            │
│      sizes: { sm: {...}, md: {...}, lg: {...} },               │
│      parts: { icon: {...}, label: {...} }                      │
│    }                                                           │
│  })                                                            │
│                                                                 │
│  - Users define their design system's semantic lockup          │
│  - Maps intents → visual properties                            │
│  - Includes sub-part styling                                   │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 1: DESIGN TOKENS (Internal + Swizzle)                   │
│                                                                 │
│  Semantic: --xds-color-primary, --xds-spacing-md               │
│  Base: (documentation only, not in code)                       │
│                                                                 │
│  - Semantic tokens available for swizzle                       │
│  - Base colors never exposed in code                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Handling Different Semantic Lockups

### The Problem

Different design systems have different semantic structures:

| Design System | Button Intents |
|---------------|----------------|
| System A | primary, secondary, tertiary |
| System B | primary, secondary, danger, ghost, link |
| System C | filled, outlined, text |
| System D | brand, neutral, destructive, success |

How does XDS support all of these with a single component library?

### Solution: Intent Mapping Layer

```typescript
// XDS provides a "universal" set of slots
type XDSButtonSlots = {
  primary: ButtonStyles;
  secondary: ButtonStyles;
  tertiary: ButtonStyles;
  danger: ButtonStyles;
  ghost: ButtonStyles;
  link: ButtonStyles;
  // ... extensible
};

// User theme maps their semantic concepts to XDS slots
const systemATheme = createTheme({
  button: {
    intents: {
      primary: { /* styles */ },
      secondary: { /* styles */ },
      tertiary: { /* styles */ },
      // danger, ghost, link → undefined (not used in System A)
    }
  }
});

// Component only shows valid intents for that theme
<Button intent="primary" />  // ✅ Valid in System A
<Button intent="danger" />   // ❌ TypeScript error if not in theme
```

### How This Works

1. **XDS defines a superset of possible intents** (union type)
2. **Theme defines which intents are valid** (maps a subset)
3. **TypeScript narrows the type** based on active theme
4. **Invalid intents are compile-time errors**

```typescript
// Type narrowing based on theme
type ThemeConfig = typeof systemATheme;
type ValidIntents = keyof ThemeConfig['button']['intents'];
// ValidIntents = 'primary' | 'secondary' | 'tertiary'

// Button component uses narrowed type
function Button<T extends ThemeConfig>({
  intent
}: {
  intent: keyof T['button']['intents']
}) { ... }
```

### Extensibility for Custom Intents

Users can add intents not in XDS's superset:

```typescript
const customTheme = createTheme({
  button: {
    intents: {
      primary: { /* ... */ },
      secondary: { /* ... */ },
      // Custom intent not in XDS superset
      'ai-suggested': { /* ... */ },
    }
  }
});

// Works because theme defines what's valid
<Button intent="ai-suggested" />  // ✅ Valid
```

---

## Sub-Part Styling (Slots)

### The Problem

Components have internal parts that need independent styling:
- Button: icon, label, loading indicator
- ListItem: leading icon, content, trailing action
- Input: prefix, input, suffix, error message

### Solution: Slot-Based Theme Structure

```typescript
const theme = createTheme({
  button: {
    intents: {
      primary: {
        // Base styles for the component
        background: '--xds-color-primary',
        color: '--xds-color-on-primary',

        // Slot-specific styles
        parts: {
          icon: {
            size: '--xds-icon-md',
            color: 'inherit',
          },
          label: {
            font: '--xds-font-button',
            weight: '--xds-font-weight-medium',
          },
          loadingIndicator: {
            color: 'currentColor',
          }
        }
      }
    }
  },

  listItem: {
    intents: {
      default: {
        padding: '--xds-spacing-md',

        parts: {
          leadingIcon: {
            size: '--xds-icon-sm',
            color: '--xds-color-secondary',
          },
          content: {
            font: '--xds-font-body',
          },
          trailingAction: {
            // inherits from parent by default
          }
        }
      }
    }
  }
});
```

### How Components Consume Slots

```typescript
// Component definition with typed slots
interface ButtonParts {
  icon?: ReactNode;
  label: ReactNode;
  loadingIndicator?: ReactNode;
}

function Button({
  intent,
  children,
  icon,
  isLoading
}: ButtonProps) {
  const theme = useTheme();
  const styles = theme.button.intents[intent];

  return (
    <button {...stylex.props(styles.base)}>
      {icon && (
        <span {...stylex.props(styles.parts.icon)}>
          {icon}
        </span>
      )}
      <span {...stylex.props(styles.parts.label)}>
        {children}
      </span>
      {isLoading && (
        <Spinner {...stylex.props(styles.parts.loadingIndicator)} />
      )}
    </button>
  );
}
```

### Slot Inheritance

Slots can inherit from parent or override:

```typescript
parts: {
  icon: {
    color: 'inherit',        // Inherits from button color
  },
  label: {
    color: '--xds-color-on-primary',  // Explicit override
  }
}
```

---

## Theme Definition API

### Light/Dark Mode Enforcement

All color tokens are **required** to be `[light, dark]` pairs — TypeScript enforces this:

```typescript
type LightDarkPair = [light: string, dark: string];

// ❌ Type error: expected [string, string]
primary: '#0066cc',

// ✅ Valid: both light and dark values
primary: ['#0066cc', '#66b3ff'],
```

### The "on*" Pattern

Every background color has a corresponding foreground color for accessible contrast:

```
primary     → onPrimary      (text color when on primary background)
surface     → onSurface      (general text color)
danger      → onDanger       (text on danger background)
```

### createTheme Function

```typescript
import { createTheme } from '@xds/core';

export const myTheme = createTheme({
  tokens: {
    color: {
      // Surfaces — [light, dark]
      background: ['#ffffff', '#121212'],
      onBackground: ['#1a1a1a', '#e0e0e0'],
      surface: ['#f5f5f5', '#1e1e1e'],
      onSurface: ['#1a1a1a', '#e0e0e0'],

      // Brand — [light, dark]
      primary: ['#0066cc', '#66b3ff'],
      onPrimary: ['#ffffff', '#000000'],
      secondary: ['#6b7280', '#9ca3af'],
      onSecondary: ['#ffffff', '#000000'],

      // Semantic — [light, dark]
      danger: ['#dc2626', '#f87171'],
      onDanger: ['#ffffff', '#000000'],
      success: ['#16a34a', '#4ade80'],
      onSuccess: ['#ffffff', '#000000'],

      // Borders
      border: ['#e5e7eb', '#374151'],
      borderFocus: ['#0066cc', '#66b3ff'],
    },

    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
    },

    radius: {
      sm: '0.25rem',
      md: '0.5rem',
      lg: '1rem',
      full: '9999px',
    },

    typography: {
      fontFamily: {
        sans: 'Inter, system-ui, sans-serif',
        mono: 'JetBrains Mono, monospace',
      },
      fontSize: {
        sm: '0.875rem',
        md: '1rem',
        lg: '1.125rem',
      }
    },
  },

  // Component-specific theming
  components: {
    button: {
      intents: { /* ... */ },
      sizes: { /* ... */ },
      parts: { /* ... */ },
    },
    input: { /* ... */ },
    listItem: { /* ... */ },
  }
});

type MyTheme = typeof myTheme;
```

### Generated CSS Output

Themes generate CSS using the `light-dark()` function:

```css
:root {
  color-scheme: light dark;

  /* Colors with automatic light/dark support */
  --xds-color-primary: light-dark(#0066cc, #66b3ff);
  --xds-color-on-primary: light-dark(#ffffff, #000000);
  --xds-color-background: light-dark(#ffffff, #121212);
  --xds-color-on-background: light-dark(#1a1a1a, #e0e0e0);

  /* Spacing (no light/dark needed) */
  --xds-spacing-sm: 0.5rem;
  --xds-spacing-md: 1rem;
}
```

Components reference these variables and automatically adapt to light/dark mode.

### Manual Mode Override

For apps that want manual light/dark toggle:

```tsx
// Follow system preference (default)
<XDSProvider theme={myTheme} mode="system">

// Force dark mode
<XDSProvider theme={myTheme} mode="dark">

// Force light mode
<XDSProvider theme={myTheme} mode="light">
```

### Using the Theme

```typescript
import { XDSProvider } from '@xds/core';
import { myTheme } from './theme';

function App() {
  return (
    <XDSProvider theme={myTheme}>
      <Button intent="primary" size="md">
        Click me
      </Button>
    </XDSProvider>
  );
}
```

### Theme Composition

Themes can extend other themes:

```typescript
import { baseTheme } from '@xds/themes/base';

const myTheme = createTheme({
  extends: baseTheme,

  // Override specific parts
  tokens: {
    color: {
      primary: '#custom-brand-color',
    }
  },

  components: {
    button: {
      intents: {
        // Add a new intent
        'custom-cta': { /* ... */ }
      }
    }
  }
});
```

---

## AI Compatibility Considerations

### AI-Friendliness by Job

| Job | AI Difficulty | Why |
|-----|---------------|-----|
| **Construct pages** | ✅ Easy | Typed props, autocomplete, finite options |
| **Set visual style** | ⚠️ Medium | Theme structure is learnable, but separate from components |
| **Override components** | ⚠️ Medium | Documented patterns, semantic tokens, but unfamiliar StyleX |

### Why This Architecture Is AI-Friendly

| Design Decision | AI Benefit |
|-----------------|------------|
| **Props, not classes** | `intent="primary"` is learnable; `bg-blue-500 hover:bg-blue-600` is arbitrary |
| **TypeScript enforcement** | Invalid props fail at compile time, AI gets immediate feedback |
| **Finite intent set** | AI learns discrete options, not infinite styling possibilities |
| **Consistent patterns** | Same API shape across all components |
| **No arbitrary values** | Can't generate `mt-[13px]`, only valid tokens |
| **Re-export pattern** | Concrete types in one file, no cross-package reasoning |

### The Author vs Consumer Gap

The "AI gap" is primarily for **component authors**, not **component consumers**.

| Role | API Surface | AI Difficulty |
|------|-------------|---------------|
| **Consumer** (Job 3) | `<Button intent="primary" size="md">` | Trivial — typed props, autocomplete |
| **Theme author** (Job 1) | `createTheme({ ... })` | Medium — structured, learnable |
| **Swizzler** (Job 2) | StyleX + semantic CSS variables | Medium — documented patterns |
| **Component author** | `createVariants({ ... stylex.create() ... })` | Higher — unfamiliar patterns |

**Why this matters**: Most users are consumers (Job 3). They never touch StyleX — they just use typed props.

### Theme as AI Context

Themes are structured data that can be included in AI context:

```typescript
// Theme can be serialized for LLM context
const themeContext = {
  availableIntents: {
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
@import "tailwindcss";
@import "@xds/tokens/css";

@theme {
  --color-primary: var(--xds-color-primary);
  --color-secondary: var(--xds-color-secondary);
  --spacing-md: var(--xds-spacing-md);
  /* ... */
}
```

Now Tailwind users can use XDS tokens:

```html
<div class="bg-primary text-on-primary p-md">
  Tailwind with XDS tokens
</div>
```

### Linting for Arbitrary Values

Provide ESLint/Stylelint rules to prevent:

```html
<!-- ❌ Flagged by lint -->
<div class="bg-[#0066cc] mt-[13px]">

<!-- ✅ Allowed -->
<div class="bg-primary mt-md">
```

---

## Swizzle API

**Job 2: Override/Create Components** — When theme customization isn't enough.

Based on exploration in `swizzle-layer-ergonomics.md`, the swizzle layer serves two distinct personas with different needs.

### Two Personas

| Persona | Goal | Skill Level | Swizzle Use |
|---------|------|-------------|-------------|
| **DS Team** | Customize appearance to match brand | High — willing to learn StyleX | Heavy, styling-focused |
| **Regular Builder** | Unblock a specific functionality | Medium — wants to ship fast | Minimal, functionality-focused |

### Dual-Path Swizzle

```
┌─────────────────────────────────────────────────────────────────┐
│  PATH A: STYLING CUSTOMIZATION (customize)                     │
│                                                                 │
│  npx xds customize Button --theme=myTheme                      │
│  → Generates theme extension (AI-friendly config)              │
│                                                                 │
│  For: DS teams, adding intents, tweaking tokens                │
│  AI vibes: ✅ Excellent — structured data                      │
├─────────────────────────────────────────────────────────────────┤
│  PATH B: FUNCTIONAL OVERRIDE (swizzle)                         │
│                                                                 │
│  npx xds swizzle Button                                        │
│  → Full source with AI-friendly annotations                    │
│                                                                 │
│  For: Builders needing behavior changes                        │
│  AI vibes: ⚠️ Medium — unfamiliar but documented              │
└─────────────────────────────────────────────────────────────────┘
```

### Path A: Theme Extension (Styling)

For DS teams that want to customize appearance without changing structure.

```bash
npx xds customize Button --theme=corporate
```

**Generated file** (`themes/corporate/button.ts`):
```typescript
// AI-friendly format: structured config, not code
import { extendTheme } from '@xds/core';

export const corporateButtonTheme = extendTheme({
  component: 'button',

  intents: {
    'brand-primary': {
      background: '--corporate-blue',
      color: 'white',
    },
  },

  sizes: {
    lg: { padding: '16px 32px', fontSize: '18px' },
  },
});
```

**Why AI-friendly**: Structured config format, clear property names, predictable schema.

### Path B: Full Swizzle (Functionality)

For builders who need to change behavior or structure.

```bash
npx xds swizzle Button
```

**Generated file** — Full source with heavy documentation:
```typescript
/**
 * 🎨 SWIZZLED COMPONENT: Button
 *
 * COMMON CUSTOMIZATIONS:
 * 1. Add custom behavior: see line 45
 * 2. Modify structure: see line 89
 * 3. Styling changes: use semantic tokens (var(--xds-color-primary))
 */

const button = createVariants({
  // 👇 CUSTOMIZE: Base styles
  base: stylex.create({ root: { cursor: 'pointer' } }).root,

  // 👇 CUSTOMIZE: Add or modify intents
  variants: { /* ... */ },
});

export function Button({ intent, onClick, children }) {
  // 👇 CUSTOMIZE: Add custom behavior (tracking, analytics)
  const handleClick = () => { onClick?.(); };

  return <button onClick={handleClick}>{children}</button>;
}
```

**Why this works despite StyleX**:
- Extensive inline documentation (AI reads comments)
- Clear customization markers (👇 CUSTOMIZE)
- Examples in comments
- Semantic tokens only (no raw StyleX internals)

### When to Use Which Path

| Builder needs... | Recommended path |
|-----------------|------------------|
| Different colors/spacing | **Path A** (customize) |
| New button intent | **Path A** (customize) |
| Custom click tracking | **Path B** (swizzle) |
| Different validation logic | **Path B** (swizzle) |
| Custom keyboard behavior | **Path B** (swizzle) |
| Structural changes | **Path B** (swizzle) |

### Swizzle Versioning

Swizzled components are "ejected" — they don't auto-update:

```
⚠️ Swizzled component: Button
   Source version: @xds/core@2.1.0
   Last synced: 2026-01-15

   This component is now your responsibility.
   Check @xds/core changelog for updates.
```

### Format Options

For builders who prefer Tailwind patterns:

```bash
# Default (StyleX) — maximum encapsulation
npx xds swizzle Button

# Tailwind format — familiar syntax, better AI vibes
npx xds swizzle Button --format=tailwind
```

| Format | Best for | Tradeoff |
|--------|----------|----------|
| `stylex` (default) | DS teams, maximum control | Less familiar, learning curve |
| `tailwind` | Regular builders, fast shipping | Classes in DOM, less encapsulation |

Both formats use XDS tokens — no arbitrary values allowed. See `swizzle-layer-ergonomics.md` for detailed examples.

---

## Distributable Themes

**Job 1: Set Visual Style** — Themes can be packaged and shared independently.

### Theme as npm Package

```
@company/dark-theme/
├── package.json
├── theme.ts          # Theme definition
├── index.ts          # Exports theme + types
└── tokens.css        # Generated CSS variables
```

```typescript
// @company/dark-theme/theme.ts
import { createTheme } from '@xds/core';

export const darkTheme = createTheme({
  tokens: {
    color: {
      primary: '#6366f1',
      background: '#1a1a2e',
      // ...
    }
  },
  components: {
    button: {
      intents: {
        primary: { /* ... */ },
        secondary: { /* ... */ },
      }
    }
  }
});

export type DarkTheme = typeof darkTheme;
```

### Type-Safe Theme Consumption

When themes are separate packages, components need to know what intents are available.

**Recommended pattern: Re-export with concrete types**

```typescript
// src/components/index.ts — App-level typed components
import { Button as XDSButton, Input as XDSInput } from '@xds/core';
import { darkTheme, DarkTheme } from '@company/dark-theme';

// Re-export with concrete types
export const Button = XDSButton<DarkTheme>;
export const Input = XDSInput<DarkTheme>;

// Now intent is concretely typed: 'primary' | 'secondary'
// AI sees simple, concrete types — no generics to reason about
```

**App setup**:
```typescript
// src/App.tsx
import { XDSProvider } from '@xds/core';
import { darkTheme } from '@company/dark-theme';
import { Button } from './components';

function App() {
  return (
    <XDSProvider theme={darkTheme}>
      <Button intent="primary">Click me</Button>
    </XDSProvider>
  );
}
```

### Theme Distribution Tradeoffs

| Approach | Type Safety | AI Context Required | Recommendation |
|----------|-------------|---------------------|----------------|
| **Generic components** | ✅ Full | Theme type in scope | Power users |
| **Re-export with concrete types** | ✅ Full | Just component file | **Default pattern** |
| **Superset intents** | ⚠️ Runtime | Just component | Simpler but less safe |

The re-export pattern gives AI a single file with concrete types — no cross-package reasoning required.

---

## Open Questions

### Resolved

1. ~~**Light/dark mode support?**~~ → **Resolved**: Color tokens are always `[light, dark]` pairs. CSS uses `light-dark()` function. TypeScript enforces pairs.

2. ~~**Swizzle layer ergonomics?**~~ → **Resolved**: Dual-path approach (Path A: customize for styling, Path B: swizzle for functionality). See `swizzle-layer-ergonomics.md`.

### Unresolved Design Decisions

1. **How deep should slot nesting go?**
   - `button.parts.icon.hover` or just `button.parts.icon`?
   - Risk of over-specification vs. flexibility

2. **Should themes be runtime or compile-time?**
   - Compile-time: Better performance, type safety
   - Runtime: Dynamic theming, user preferences
   - Hybrid: Base at compile-time, overrides at runtime?

3. **How to handle responsive tokens?**
   - `spacing: { md: { default: '1rem', '@md': '1.5rem' } }`
   - Or separate responsive layer?

4. **Theme validation/linting?**
   - Warn if theme is missing required intents?
   - Provide a `validateTheme()` function?

5. **Default theme?**
   - Should XDS ship a default theme?
   - Or require users to always define one?

### Distributable Themes

7. **Generic components vs re-export pattern?**
   - Should we enforce the re-export pattern?
   - Or make generic components ergonomic enough for direct use?

8. **Theme CLI tooling?**
   - `npx xds init-theme` to scaffold a theme package?
   - `npx xds generate-components` to create typed re-exports?

9. **Runtime theme switching with type safety?**
   - How do we switch themes while maintaining compile-time type checks?
   - Union of all possible theme intents?

### `@xds/variants` Implementation

10. **Type inference complexity?**
    - How do we infer variant props from nested StyleX objects?
    - Should variants reference theme tokens or be self-contained?

11. **Responsive variants?**
    - Should responsive breakpoints be part of variant API?
    - Or handled via StyleX media queries?

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

| Issue | Impact |
|-------|--------|
| Arbitrary values bypass constraints | AI can generate `mt-[13px]` |
| Classes are public | Consumers can depend on implementation details |
| Theme tokens are all public CSS vars | Can't evolve without breaking consumers |
| Type safety is weak | No compile-time enforcement |

### Component Authoring with `@xds/variants`

```typescript
import { createVariants } from '@xds/variants';
import * as stylex from '@stylexjs/stylex';

const button = createVariants({
  base: stylex.create({
    root: { cursor: 'pointer', borderRadius: 4 }
  }).root,

  slots: {
    icon: stylex.create({ root: { width: 16, height: 16 } }).root,
    label: stylex.create({ root: { fontWeight: 500 } }).root,
  },

  variants: {
    intent: {
      primary: stylex.create({
        root: { backgroundColor: 'var(--xds-color-primary)' }
      }).root,
      secondary: stylex.create({
        root: { backgroundColor: 'var(--xds-color-secondary)' }
      }).root,
    },
    size: {
      sm: stylex.create({ root: { padding: 4, fontSize: 14 } }).root,
      md: stylex.create({ root: { padding: 8, fontSize: 16 } }).root,
    }
  },

  defaultVariants: {
    intent: 'primary',
    size: 'md',
  }
});

// TypeScript infers: { intent: 'primary' | 'secondary', size: 'sm' | 'md' }
```

This provides tw-classed ergonomics without exposed CSS classes.

---

## Proposed Implementation Phases

### Phase 1: Core Infrastructure
- `@xds/variants` wrapper around StyleX — tw-classed-like ergonomics with compile-time enforcement
- `createTheme()` function with TypeScript inference
- `XDSProvider` context
- Basic token system (colors, spacing, typography)
- 3-5 pilot components (Button, Input, Text, Box, Stack)

### Phase 2: Component Library
- Full component set with intent/size/part slots
- Swizzle CLI
- Storybook integration

### Phase 3: Ecosystem
- Tailwind preset
- CSS variable export
- Lint rules for arbitrary value prevention
- Theme gallery / community themes

### Phase 4: Advanced Features
- Runtime theme switching
- Responsive tokens
- Animation tokens
- Multi-theme composition

---

## Related Explorations

- `frontend-developer-jtbd.md` — Developer jobs research, workflow phases
- `swizzle-layer-ergonomics.md` — Dual-path swizzle approach, AI-friendliness
- `zero-styling-architecture.md` — Foundational concept
- `stylex-vs-tailwind.md` — Styling technology choice, token tiers, `@xds/variants` wrapper approach
- `ai-trajectory-predictions.md` — Why constraints matter long-term
- `required-props-pattern.md` — Explicit APIs for AI
- `distribution-methods.md` — How themes will be distributed

---

## Sources

- [Rangle.io: Token Structure](https://Rangle.io/blog/developing-your-token-structure)
- [StyleX Theming Guide](https://stylexjs.com/docs/learn/theming/creating-themes/)
- [Tailwind v4 Theme Docs](https://tailwindcss.com/docs/theme)
- [UXPin: Component-Based Design](https://www.uxpin.com/studio/blog/component-based-design-complete-implementation-guide/)
