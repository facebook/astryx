# Why StyleX

XDS uses [StyleX](https://stylexjs.com/) for all component styling. This page explains the decision and the reasoning behind it.

---

## The Decision

XDS uses StyleX instead of Tailwind CSS. This was a deliberate choice driven by XDS's core architectural requirements: compile-time constraint enforcement, scoped theming, and evolution safety.

Tailwind is a great tool — it's ergonomic, well-known by developers and AI models alike, and has a massive ecosystem. But XDS is a design system that ships to many consumers, and the properties that matter most at that scale are different from what matters for individual applications.

---

## Key Reasons

### 1. Compile-Time Constraint Enforcement

StyleX uses TypeScript to enforce that only valid tokens are used. There are no escape hatches — if a token doesn't exist, the code doesn't compile.

Tailwind v4's `@theme` directive can constrain which utility classes are generated, but arbitrary values (`mt-[13px]`, `bg-[#ff0000]`) still compile. This is fine for applications, but for a design system where constraints are the product, enforcement needs to be at the language level.

```tsx
// StyleX: invalid tokens are compile errors
import { colors } from './tokens.stylex';
const styles = stylex.create({
  bad: { color: colors.doesNotExist }, // ← TypeScript error
});

// Tailwind: arbitrary values bypass the theme
<div className="bg-[#ff0000]" /> // ← compiles fine
```

### 2. Scoped Theming

StyleX's `createTheme()` applies token overrides to a DOM subtree. This is first-class — you wrap a section with a theme and all components inside use those values.

```tsx
// Define a theme override
const darkPanel = stylex.createTheme(colors, {
  background: '#1a1a1a',
  primaryText: 'white',
});

// Apply it to a subtree
<div {...stylex.props(darkPanel)}>
  {/* All children use dark theme tokens */}
  <XDSButton variant="primary" />
</div>
```

Tailwind can achieve scoped theming through CSS variable overrides, but it's not a first-class pattern — it requires manual CSS variable management.

### 3. Type-Safe Theming

StyleX tokens are TypeScript values. Theme overrides are type-checked against the original token definitions. If a token is renamed or removed, every consumer gets a compile error.

```tsx
// Token definition
export const colors = stylex.defineVars({
  primaryText: 'black',
  accent: 'blue',
});

// Theme override — type-checked against the definition
const myTheme = stylex.createTheme(colors, {
  primaryText: 'purple',
  accent: 'red',
  typo: 'green', // ← TypeScript error: 'typo' doesn't exist
});
```

### 4. No Public CSS Classes

StyleX generates atomic, deterministic class names that are implementation details. Consumers interact with components through typed props, not class strings. This means XDS can refactor its internal styling without breaking consumers.

With Tailwind, class names are semantic (`bg-primary`, `text-lg`) and become an implicit public API. Consumers inspect the DOM, depend on class names, and breakage becomes invisible until production.

### 5. Bundle Scaling

StyleX deduplicates identical style property-value pairs across the entire application. CSS size grows sublinearly — it plateaus as more components reuse the same atomic styles. For a design system used across many applications, this matters.

---

## Token Tier Model

XDS uses a three-tier token architecture that controls what consumers can access:

```
┌─────────────────────────────────────────────────────┐
│  PRIMITIVE TOKENS (never exposed)                  │
│  --color-purple-500: #8b5cf6                       │
│  --spacing-16: 1rem                                │
├─────────────────────────────────────────────────────┤
│  SEMANTIC TOKENS (available for swizzle/overrides) │
│  --xds-color-primary: var(--color-purple-500)      │
│  --xds-spacing-md: var(--spacing-16)               │
├─────────────────────────────────────────────────────┤
│  COMPONENT API (the public contract)               │
│  <XDSButton variant="primary" />                   │
│  Props only — no direct token access needed        │
└─────────────────────────────────────────────────────┘
```

- **Standard users** interact through props only — maximum evolution freedom for the system.
- **Swizzlers** get access to semantic CSS variables for consistency while customizing.
- **Primitive tokens** are not exposed in code at all — they can change without notice.

StyleX makes this tiered model natural: you choose what to export via `defineVars()`. Internal tokens stay internal. Tailwind's `@theme` generates CSS variables for everything by default, making it harder to maintain private tokens.

---

## Tradeoffs Acknowledged

### AI Familiarity

Tailwind dominates AI training data. LLMs generate Tailwind fluently and may struggle with StyleX's less common patterns. However, the AI gap is primarily for **component authors**, not consumers. Most users of XDS never touch StyleX — they use typed props like `<XDSButton variant="primary" size="md">`, which is trivially AI-friendly.

### Verbose Syntax

StyleX uses JavaScript objects where Tailwind uses concise class strings. A Tailwind `group-hover:opacity-100` is two words; the equivalent StyleX pattern requires defining CSS variables across multiple files. This is the cost of StyleX's encapsulation guarantees — worth it for a component library, but real.

### Smaller Ecosystem

Tailwind has far more community components, templates, and tooling. XDS is a self-contained system so this matters less, but contributors coming from Tailwind backgrounds face a learning curve.

### Complex Selectors

Parent-child state relationships (e.g., "show delete button when list item is hovered") are ergonomic in Tailwind (`group-hover:*`) but require a CSS variables workaround in StyleX. The pattern works and is pure CSS (no runtime), but it's more verbose to set up.

---

## Tailwind Interop

XDS doesn't use Tailwind, but consumers might. The interop strategy:

1. **XDS exports semantic tokens as CSS variables** (`--xds-color-primary`, `--xds-spacing-sm`, etc.)
2. **A Tailwind preset can map these** so Tailwind users get XDS tokens as utilities:

```css
@theme {
  --color-primary: var(--xds-color-primary);
  --spacing-sm: var(--xds-spacing-sm);
}
```

This gives Tailwind consumers access to the same design tokens without compromising XDS's internal enforcement. The tokens are the bridge — not the class names.

---

## Summary

| Factor                  | StyleX                                  | Tailwind                        |
|-------------------------|-----------------------------------------|---------------------------------|
| Constraint enforcement  | Compile-time via TypeScript             | Convention + lint rules         |
| Scoped theming          | First-class (`createTheme`)             | Manual CSS variable overrides   |
| Type safety             | Full — tokens, themes, variants         | Limited                         |
| AI familiarity          | Lower (but consumers use props, not StyleX) | High                        |
| Ergonomics              | Verbose JS objects                      | Concise class strings           |
| Bundle scaling          | Sublinear (atomic dedup)                | Grows with unique combinations  |
| Public API surface      | Props only — classes are opaque         | Classes become implicit API     |

StyleX is the right choice for a design system where **constraints are the product**. The verbosity and learning curve are real costs, but they buy enforcement guarantees that matter at scale.
