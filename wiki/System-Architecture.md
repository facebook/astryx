# System Architecture

XDS is a design system built for three audiences: product builders constructing UIs, theme authors defining visual identity, and AI assistants generating code. This document describes the architecture as it exists today.

---

## Builder Jobs To Be Done

XDS serves developers across their workflow phases:

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
│  [Planned] npx xds swizzle XDSButton                               │
│  → src/components/xds/Button/XDSButton.tsx                         │
│                                                                     │
│  Builder experience:                                                │
│  - Full component source, yours to modify                          │
│  - Access to semantic CSS variables (--xds-color-primary)          │
│  - Documented customization points for AI assistance               │
├─────────────────────────────────────────────────────────────────────┤
│  JOB 1: SET VISUAL STYLE (Theme Layer)                             │
│                                                                     │
│  Themes override tokens using stylex.createTheme()                 │
│  Components read tokens via CSS variables                          │
│  Distributable as npm packages                                     │
│                                                                     │
│  Builder experience:                                                │
│  - Define design tokens in one place                               │
│  - Components automatically reflect token changes                  │
│  - Light/dark mode via CSS light-dark() function                   │
└─────────────────────────────────────────────────────────────────────┘
```

### How the Jobs Relate

| If the builder needs... | They use... | Complexity |
|------------------------|-------------|------------|
| Different colors/spacing | Theme tokens | Low |
| New button variant | Swizzle | Medium |
| Custom component structure | Swizzle | Medium |
| New component behavior | New component | High |

**Escalation path**: Theme (tokens) → Swizzle (variants) → Custom. Each step up gives more control at the cost of more responsibility.

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
│  Tokens defined with stylex.defineVars()                       │
│  Themes override with stylex.createTheme()                     │
│                                                                 │
│  - Tokens only — no component-level configurations             │
│  - Components read via CSS variables                           │
│  - Distributable as npm packages                               │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 1: COMPONENT VARIANTS (Swizzle Layer)                   │
│                                                                 │
│  Components define variant → style mappings with StyleX        │
│  Themes can provide variant overrides via components config    │
│                                                                 │
│  - Uses semantic tokens (colorTokens.accent, etc.)             │
│  - Swizzle to customize variants (planned)                     │
└─────────────────────────────────────────────────────────────────┘
```

**Key decision**: Theme = tokens only. Variant customization happens either through theme-level component overrides or through swizzle (planned), where typing is strict and self-contained.

---

## Styling Technology

XDS uses **StyleX** as its styling engine:

- **Compile-time CSS extraction** — zero runtime overhead
- **Full TypeScript integration** — styles are typed objects
- **Scoped theming** — first-class support via `stylex.defineVars` / `stylex.createTheme`
- **No exposed CSS classes** — consumers interact with typed props, not class names
- **Deterministic specificity** — last-applied style wins, no cascade surprises

Components are authored using `stylex.create()` for styles and variants, with types derived directly from the StyleX objects using `keyof typeof variants`.

---

## Theme Definition API

> ✅ Implemented in `/packages/core/src/theme/`

### Token Definitions

XDS uses StyleX for theming, with pre-compiled theme objects:

```typescript
// /packages/core/src/theme/tokens.stylex.ts
import * as stylex from '@stylexjs/stylex';

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
}

export interface Theme {
  name: string;
  colorTheme: StyleXTheme;
  elevationTheme: StyleXTheme;
  spacingTheme?: StyleXTheme;
  radiusTheme?: StyleXTheme;
  transitionTheme?: StyleXTheme;
  typographyTheme?: StyleXTheme;
  components?: ComponentStyles;
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

### Mode Override

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

> ✅ Implemented — Button serves as the reference component

Components use StyleX with theme tokens and support theme-level variant overrides:

```typescript
// /packages/core/src/Button/XDSButton.tsx
import * as stylex from '@stylexjs/stylex';
import {colorTokens, spacingTokens, radiusTokens} from '../theme/tokens.stylex';
import {ThemeContext} from '../theme/ThemeContext';
import type {StyleXStyles} from '../theme/types';

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

// Module augmentation — register with theme types
declare module '../theme/types' {
  interface ComponentStyles {
    button?: {
      variants?: Partial<Record<ButtonVariant, StyleXStyles>>;
    };
  }
}

// Component consumes theme variant overrides
export const XDSButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({variant = 'primary', children, ...props}, ref) => {
    const themeContext = useContext(ThemeContext);
    const themeVariantOverride =
      themeContext?.theme.components?.button?.variants?.[variant];

    return (
      <button
        ref={ref}
        {...stylex.props(
          styles.base,
          variants[variant],
          themeVariantOverride, // Theme override applied on top
        )}
        {...props}>
        {children}
      </button>
    );
  },
);
```

### Key Patterns

| Pattern | Purpose |
|---------|---------|
| `keyof typeof variants` | Derive variant type from StyleX object |
| `backgroundImage` for overlays | Layer hover/active colors on top of background |
| Module augmentation | Register component variants with theme types without circular imports |
| `ThemeContext` consumption | Apply theme-level variant overrides |

See the [Component Authoring Guide](Component-Authoring-Guide) for the full reference on building new components.

---

## Token Categories

> ✅ Implemented in `/packages/core/src/theme/tokens.stylex.ts`

| Category | Purpose | Examples |
|----------|---------|----------|
| `colorTokens` | All colors (semantic, text, icon, status, dividers) | `accent`, `textPrimary`, `hoverOverlay`, `negative` |
| `spacingTokens` | Consistent spacing scale | `space1` (4px), `space2` (8px), `space4` (16px) |
| `radiusTokens` | Border radius for different contexts | `rounded`, `container`, `element`, `content` |
| `elevationTokens` | Box shadows | `base`, `thumb`, `dialog`, `hover`, `menu` |
| `transitionTokens` | Animation durations | `fast` (0.15s), `normal` (0.2s) |
| `typographyTokens` | Font families | `fontFamilyBody`, `fontFamilyCode`, `fontFamilyHeading` |

---

## AI Compatibility

### AI-Friendliness by Job

| Job | AI Difficulty | Why |
|-----|--------------|-----|
| **Construct pages** | ✅ Easy | Typed props, autocomplete, finite options |
| **Set visual style** | ⚠️ Medium | Theme structure is learnable, but separate from components |
| **Override components** | ⚠️ Medium | Documented patterns, semantic tokens, but unfamiliar StyleX |

### Why This Architecture Is AI-Friendly

| Design Decision | AI Benefit |
|----------------|------------|
| **Props, not classes** | `variant="primary"` is learnable; arbitrary class strings are not |
| **TypeScript enforcement** | Invalid props fail at compile time, AI gets immediate feedback |
| **Finite variant set** | AI learns discrete options, not infinite styling possibilities |
| **Consistent patterns** | Same API shape across all components |
| **No arbitrary values** | Can't generate invalid token values, only valid tokens |
| **Re-export pattern** | Concrete types in one file, no cross-package reasoning |

### The Author vs Consumer Gap

The "AI gap" is primarily for **component authors**, not **component consumers**.

| Role | API Surface | AI Difficulty |
|------|------------|--------------|
| **Consumer** (Job 3) | `<XDSButton variant="primary" size="md">` | Trivial — typed props, autocomplete |
| **Theme author** (Job 1) | `stylex.createTheme({ ... })` | Medium — structured, learnable |
| **Swizzler** (Job 2) | StyleX + semantic CSS variables | Medium — documented patterns |
| **Component author** | `stylex.create({ ... })` + tokens | Higher — unfamiliar patterns |

**Why this matters**: Most users are consumers (Job 3). They never touch StyleX — they just use typed props.

### Theme as AI Context

Themes are structured data that can be included in AI context:

```typescript
// Theme can be serialized for LLM context
const themeContext = {
  availableVariants: {
    button: ['primary', 'secondary', 'ghost', 'destructive'],
    input: ['default', 'error', 'success'],
  },
  availableSizes: ['sm', 'md', 'lg'],
};
```

This enables AI to:
1. Know valid prop values without reading source
2. Generate only theme-valid code
3. Adapt to different themes dynamically

---

## Swizzle API (Planned)

> ⚠️ **Not yet implemented** — this section describes the planned swizzle system.

**Job 2: Override/Create Components** — When you need to customize variants or behavior beyond what theme tokens provide.

### When to Swizzle

| Need | Solution |
|------|----------|
| Different primary color | Edit theme tokens |
| New button variant (e.g. `brand`) | Swizzle Button |
| Custom click tracking | Swizzle Button |
| Different animation | Swizzle Button |
| Structural changes | Swizzle Button |

### Planned Swizzle Command

```bash
npx xds swizzle XDSButton
# → src/components/xds/Button/XDSButton.tsx
```

The swizzled component would be a full StyleX component using XDS tokens, giving you complete control over variants, structure, and behavior.

### Swizzle Versioning

Swizzled components are "ejected" — they don't auto-update:

```
⚠️ Swizzled component: XDSButton
   Source version: @xds/core@2.1.0
   Last synced: 2026-01-15

   This component is now your responsibility.
   Check @xds/core changelog for updates.
```

Currently, component variant overrides are handled via the theme's `components` config rather than file-based swizzle.

---

## Distributable Themes

**Job 1: Set Visual Style** — Themes can be packaged and shared independently.

### Theme as npm Package

```
@company/dark-theme/
├── package.json
├── theme.ts          # Token definitions via stylex.createTheme
├── index.ts          # Exports theme + types
└── README.md
```

### Using a Theme Package

```typescript
import {Theme} from '@xds/core';
import {darkTheme} from '@company/dark-theme';
import {XDSButton} from '@xds/core';

function App() {
  return (
    <Theme theme={darkTheme}>
      <XDSButton variant="primary">Click me</XDSButton>
    </Theme>
  );
}
```

### Type Safety

| What | Where Types Come From |
|------|----------------------|
| **Tokens** | Theme definition (`stylex.createTheme` overrides) |
| **Component variants** | Component definition (self-contained via `keyof typeof variants`) |

Components have their own types based on their variant definitions — no cross-package type inference needed.

---

## Implementation Phases

### Phase 1: Core Infrastructure ✅ Complete

**Token System**
- `stylex.defineVars` for tokens (colors, spacing, typography, radius, transitions, elevation)
- `light-dark()` CSS function for automatic light/dark mode switching
- Token categories: color, spacing, radius, transition, typography, elevation

**Theme System**
- `ThemeContext` for providing theme to component tree
- `Theme` provider component with mode prop (`'light'` | `'dark'` | `'system'`)
- `stylex.createTheme` for theme-level token overrides
- Component-level variant overrides via `theme.components.{component}.variants`
- Module augmentation pattern for type-safe component styles

**Reference Components**
- Button with variants (primary, secondary, ghost, destructive)
- Loading state with spinner animation
- Press effect (scale 98%)
- Theme variant consumption pattern

**Infrastructure**
- Storybook integration with theme switching
- Vitest with StyleX babel plugin for testing

### Phase 2: Component Library ✅ 40+ Components

Over 40 components have been implemented, covering layout primitives (Box, Stack, HStack, VStack), typography (Text, Heading), form elements (Input, Checkbox, Select, Switch), navigation, data display, feedback, and more. All follow the same StyleX + token patterns established in Phase 1.

### Phase 3: Ecosystem (In Progress)

- Documentation site
- CLI tooling (`xds component --docs`, `--brief-all`)
- AI evaluation infrastructure (vibe tests)
- Migration guides

### Phase 4: Advanced Features (Planned)

- Swizzle CLI for component customization
- Animation tokens
- Multi-theme composition
- Theme gallery / community themes
- Responsive tokens

---

## Open Questions

### Resolved

1. ~~**Light/dark mode support?**~~ → CSS `light-dark()` function. Theme provider sets `color-scheme`. Mode prop controls behavior.
2. ~~**Component themes in theme vs component file?**~~ → Hybrid — variants defined in component files, themes can provide overrides via `components` config.
3. ~~**Prop naming (intent vs variant)?**~~ → Use `variant` — more corpus representation for AI.
4. ~~**Type inference from StyleX objects?**~~ → `keyof typeof variants` derives type automatically.
5. ~~**Theme-to-component type coupling?**~~ → Module augmentation avoids circular imports.
6. ~~**Default theme?**~~ → XDS ships `defaultTheme` and `neutralTheme`. Themes are required.
7. ~~**Compile-time vs runtime themes?**~~ → Compile-time via StyleX.

### Unresolved

1. **How deep should slot nesting go?** Risk of over-specification vs. flexibility.
2. **How to handle responsive tokens?** Separate responsive layer or inline breakpoints?
3. **Theme validation/linting?** Warn on missing required tokens?
4. **Swizzle CLI design** — File-based ejection vs. current theme-based overrides.
5. **Swizzle sync** — How to help users stay up-to-date with upstream changes.
