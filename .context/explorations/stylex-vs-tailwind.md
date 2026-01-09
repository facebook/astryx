# StyleX vs Tailwind: Theming Architecture Comparison

*Exploration — January 2026*

## Context

Evaluating StyleX and Tailwind CSS for XDS theming infrastructure. Key considerations:
- Previous success with StyleX-based theme systems
- Tailwind's superior API ergonomics
- AI ecosystem pressure (most AI UIs use Tailwind)
- Alignment with zero-styling architecture

---

## Core Differences

| Aspect | StyleX | Tailwind CSS (v4) |
|--------|--------|-------------------|
| **Architecture** | CSS-in-JS with compile-time extraction | Utility-first CSS framework |
| **Output** | Static atomic CSS, zero runtime | Static CSS from build |
| **Theming** | `defineVars()` + `createTheme()` — type-safe, scoped | `@theme` directive — CSS-based, generates utilities |
| **Type safety** | Full TypeScript integration, constrained props | Limited — arbitrary values still possible |
| **Bundle scaling** | Plateaus — atomic CSS deduplicated | Grows with unique utility combinations |
| **AI familiarity** | Low — less training data | High — dominant in AI training data |
| **DX/Ergonomics** | Verbose JS objects | Concise class strings |

---

## StyleX Deep Dive

### How It Works

StyleX is a **build-time compiler**:
1. Developers write styles in JavaScript using `stylex.create()`
2. Babel plugin scans codebase during build
3. Each unique style property-value pair generates a deterministic atomic class
4. JavaScript code is replaced with generated atomic CSS class strings

### Theming Architecture

**Define variables:**
```javascript
export const colors = stylex.defineVars({
  primaryText: { default: 'black', [DARK]: 'white' },
  accent: 'blue',
  background: { default: 'white', [DARK]: '#1a1a1a' },
});
```

**Create theme overrides:**
```javascript
export const dracula = stylex.createTheme(colors, {
  primaryText: { default: 'purple', [DARK]: 'lightpurple' },
  accent: 'red',
  background: { default: '#555', [DARK]: 'black' },
});
```

**Apply scoped theme:**
```javascript
<div {...stylex.props(dracula, styles.container)}>
  {/* All children use dracula theme tokens */}
</div>
```

### Strengths

| Benefit | Details |
|---------|---------|
| **True constraint enforcement** | TypeScript prevents invalid tokens at compile time |
| **Scoped theming** | Themes apply to subtrees, enabling component-level overrides |
| **Predictable merging** | Last style wins, like `Object.assign()` |
| **Zero runtime** | Compile-time extraction, no JS execution for styles |
| **Bundle plateaus** | CSS size grows sublinearly with app size |
| **Cross-project composition** | Components using StyleX compose correctly when published to npm |

### Weaknesses

| Issue | Details |
|-------|---------|
| **Lower AI familiarity** | Less training data than Tailwind |
| **Verbose syntax** | JS objects vs class strings |
| **Tooling maturity** | Smaller ecosystem |
| **Learning curve** | Different mental model from utility CSS |

Sources: [StyleX Official Docs](https://stylexjs.com/docs/learn/), [BetterStack Guide](https://betterstack.com/community/guides/scaling-nodejs/stylex-metas/)

---

## Complex Selectors: StyleX vs Tailwind

### The Problem

Parent-child state relationships are common:
- Show delete button when list item is hovered
- Change icon color when card is focused
- Reveal actions when row is selected

### Tailwind: Simple with `group-*`

Tailwind has first-class support via the `group` pattern:

```html
<div class="group">
  <h3>Item Title</h3>
  <button class="opacity-0 group-hover:opacity-100 transition-opacity">
    Delete
  </button>
</div>
```

That's it. One `group` class on parent, `group-hover:*` on children. No extra setup.

**Nested groups**:
```html
<div class="group/card">
  <div class="group/actions">
    <button class="group-hover/card:opacity-50 group-hover/actions:opacity-100">
      Edit
    </button>
  </div>
</div>
```

### StyleX: CSS Variables Pattern

StyleX doesn't support descendant selectors. The workaround uses CSS variables:

**Step 1: Define variables**
```typescript
// tokens.stylex.ts
export const parentState = stylex.defineVars({
  childOpacity: '0',
});
```

**Step 2: Parent sets values on hover**
```typescript
const styles = stylex.create({
  card: {
    [parentState.childOpacity]: {
      default: '0',
      ':hover': '1',
    },
  },
});
```

**Step 3: Child reads variables**
```typescript
const styles = stylex.create({
  button: {
    opacity: parentState.childOpacity,
    transition: 'opacity 0.2s',
  },
});
```

### Ergonomics Comparison

| Aspect | Tailwind | StyleX |
|--------|----------|--------|
| **Lines of code** | 2 classes | 3 files, ~15 lines |
| **Setup required** | None | Define variables first |
| **Readability** | `group-hover:opacity-100` is self-explanatory | Variable indirection |
| **Nested groups** | `group/name` naming | Multiple variable sets |
| **Learning curve** | Intuitive | Requires understanding pattern |

**Tailwind wins on ergonomics** for this use case.

### Why StyleX Chose This Approach

| StyleX Principle | Benefit | Cost |
|------------------|---------|------|
| **Explicit relationships** | Child opts into parent observation | More verbose |
| **No "styles at a distance"** | Easier to trace where styles come from | Setup overhead |
| **Encapsulation** | Child controls what it reads | Indirection |
| **Static analysis** | All styles traceable at build time | No dynamic selectors |

From StyleX docs: "All styles on an element should be caused by class names on that element itself."

### Performance: Both Are Pure CSS

Both approaches are CSS-only — no JavaScript re-renders:
- Tailwind: Browser applies `:hover` styles via generated classes
- StyleX: Browser updates CSS variable, children read via `var()`

No `useState`, no event handlers, no re-renders in either case.

### What This Means for XDS

This is a real ergonomics gap with StyleX. Options:

**Option 1: Accept the verbosity**
- The pattern works, it's just more setup
- Document it well, provide helpers

**Option 2: Build abstractions**
```typescript
// Potential helper in @xds/variants
const { parent, child } = createStateRelationship('listItem', {
  actionOpacity: { default: '0', ':hover': '1' },
});

// Parent
<div {...stylex.props(parent.container)}>

// Child
<button {...stylex.props(child.action)}>
```

**Option 3: Use Tailwind for layout, StyleX for components**
- Components use StyleX (encapsulation)
- Page layouts can use Tailwind (ergonomics)
- The Tailwind preset makes tokens consistent

### Recommendation

Document the CSS variables pattern clearly and consider building a helper abstraction. The verbosity is the cost of StyleX's encapsulation guarantees — worth it for a component library, but should be as painless as possible.

Source: [StyleX: Variables for Descendant Styles](https://stylexjs.com/docs/learn/recipes/descendant-styles/)

---

## Tailwind v4 Deep Dive

### How Theming Works

The `@theme` directive defines design tokens that generate both CSS variables AND utility classes:

```css
@theme {
  --color-primary: oklch(0.72 0.11 178);
  --spacing-sm: 0.5rem;
}
```

This creates:
- CSS variable: `var(--color-primary)`
- Utility classes: `bg-primary`, `text-primary`, etc.

### Constraining the Theme

**Remove defaults and define only allowed tokens:**
```css
@theme {
  --color-*: initial;  /* Remove all default colors */
  --color-white: #fff;
  --color-primary: #3f3cbb;
  --color-secondary: #6366f1;

  --spacing-*: initial;  /* Remove all default spacing */
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 2rem;
}
```

Now only `bg-primary`, `bg-secondary`, `bg-white` exist — not `bg-red-500`.

### Theme Variable Namespaces

| Namespace | Utilities Generated |
|-----------|-------------------|
| `--color-*` | `bg-*`, `text-*`, `fill-*`, etc. |
| `--font-*` | `font-sans`, `font-serif`, etc. |
| `--text-*` | `text-xl`, `text-2xl`, etc. |
| `--spacing-*` | `px-4`, `max-h-16`, `gap-8`, etc. |
| `--breakpoint-*` | Responsive variants: `sm:*`, `md:*` |
| `--shadow-*` | `shadow-md`, `shadow-lg`, etc. |
| `--radius-*` | `rounded-sm`, `rounded-lg`, etc. |

### Strengths

| Benefit | Details |
|---------|---------|
| **Excellent AI generation** | Dominant in training data, LLMs generate it fluently |
| **`@theme` constrains utilities** | Only defined tokens generate classes |
| **Ergonomic DX** | Concise class syntax |
| **Shareable themes** | CSS files can be imported across projects |
| **Large ecosystem** | Extensive component libraries, templates |

### Weaknesses

| Issue | Details |
|-------|---------|
| **Arbitrary values bypass constraints** | `mt-[13px]`, `bg-[#ff0000]` still compile |
| **Type safety is weak** | No compile-time enforcement of valid classes |
| **Readability at scale** | Class strings become unwieldy |
| **Scoped theming is awkward** | Requires CSS variable overrides, not first-class |

Sources: [Tailwind v4 Theme Docs](https://tailwindcss.com/docs/theme), [Tailwind at Scale Issues](https://dev.to/gouranga-das-khulna/why-tailwind-css-might-be-hurting-your-large-scale-projects-3k73)

---

## Zero-Styling Architecture Alignment

Recall the core concept from `zero-styling-architecture.md`:
- Components ship with no styles
- All styling through theme file
- Swizzling for structural/behavioral flexibility

| Requirement | StyleX | Tailwind v4 |
|-------------|--------|-------------|
| No inline styles on components | ✅ Styles defined in JS, applied via props | ⚠️ Classes are inline, but constrained via `@theme` |
| Theme as single source of truth | ✅ `defineVars()` creates tokens | ✅ `@theme` creates tokens + utilities |
| Compile-time enforcement | ✅ TypeScript catches invalid tokens | ❌ Arbitrary values still compile |
| AI can't generate arbitrary values | ✅ Types prevent it | ❌ AI can still use `[arbitrary]` syntax |
| Scoped theme overrides (swizzling) | ✅ `createTheme()` scopes to subtree | ⚠️ Requires CSS variable overrides |

**Key insight**: StyleX aligns better with zero-styling architecture because constraints are enforced, not suggested.

---

## The Semantic Leakage Problem

### The Problem

Exposing raw CSS variables creates an implicit public API that's hard to evolve:

```
Consumer A: uses --xds-color-primary because "it's the brand color"  ✓ semantic
Consumer B: uses --xds-color-primary because "it's close to purple I wanted"  ✗ presentational

When you change primary → both break
But only Consumer A was using it "correctly"
```

At scale (10k+ products), you can't distinguish intent from misuse. Changing "primary" becomes a breaking change for everyone, even those who shouldn't have depended on the specific value.

### Token Tier Architecture

Research recommends a three-tier structure where only the outermost layer is public:

```
┌─────────────────────────────────────────────────────┐
│  PRIMITIVE TOKENS (never expose)                   │
│  --color-purple-500: #8b5cf6                       │
│  --spacing-16: 1rem                                │
├─────────────────────────────────────────────────────┤
│  SEMANTIC TOKENS (internal)                        │
│  --color-primary: var(--color-purple-500)          │
│  --spacing-component-gap: var(--spacing-16)        │
├─────────────────────────────────────────────────────┤
│  COMPONENT API (the public contract)               │
│  <Button intent="primary" />                       │
│  NOT: style={{ color: 'var(--xds-color-primary)' }}│
└─────────────────────────────────────────────────────┘
```

Source: [Rangle.io Token Structure](https://Rangle.io/blog/developing-your-token-structure)

### Tradeoffs of NOT Exposing CSS Variables

| Benefit | Drawback |
|---------|----------|
| Full control over evolution | Less flexibility for edge cases |
| Can distinguish semantic from presentational | Consumers can't do quick one-off styling |
| Breaking changes are intentional | May push consumers to swizzle more |
| Clear public API contract | Harder to integrate with CSS-variable-expecting tools |
| Prevents "close enough" misuse | Can't use CSS features that depend on variables (color-mix, calc) |

### The Swizzling Consideration

**Key question**: Should swizzled components have access to internal tokens?

This creates a tiered access model:

| Usage Mode | Token Access | Rationale |
|------------|--------------|-----------|
| **Standard usage** | Props only, no raw tokens | Maximum evolution freedom |
| **Swizzled components** | Internal tokens available | Maintain consistency while customizing |
| **Fully custom** | No XDS tokens | You're on your own |

**Argument FOR exposing tokens to swizzled components:**
- Swizzling is an explicit opt-out of guardrails
- Consumers still want visual consistency with the system
- Without tokens, swizzled components can't stay in sync with theme changes
- It's the "middle ground" between full constraint and full freedom

**Argument AGAINST:**
- Swizzled components become coupled to internal implementation
- Token renames/restructuring still breaks swizzled code
- Creates a "semi-public" API that's hard to version

### Proposed Token Access Model

```
┌─────────────────────────────────────────────────────────────┐
│  PUBLIC API (versioned, stable)                            │
│  - Component props: <Button intent="primary" />            │
│  - Theme customization: <XDSProvider theme={myTheme} />    │
│  - Zero styling — no CSS exposure                          │
├─────────────────────────────────────────────────────────────┤
│  SEMANTIC TOKENS (available for swizzle)                   │
│  - CSS variables: --xds-color-primary, --xds-spacing-md    │
│  - Documented, versioned with deprecation warnings         │
│  - The "escape hatch" for swizzled components              │
├─────────────────────────────────────────────────────────────┤
│  BASE/PRIMITIVE TOKENS (documentation only)                │
│  - Not in code — only in design docs                       │
│  - purple-500, spacing-16, etc.                            │
│  - No CSS variables, no runtime exposure                   │
│  - Can change without notice                               │
└─────────────────────────────────────────────────────────────┘
```

This gives:
- **Standard users**: Props only → maximum evolution freedom
- **Swizzlers**: Access to semantic CSS variables → consistency while customizing
- **Base colors**: Not even in code — purely documentation, fully internal

**Key insight**: By not exposing base colors as code at all, they can't leak into consumer codebases. Semantic tokens are the lowest level consumers can access.

### How This Affects the StyleX vs Tailwind Decision

| Factor | StyleX | Tailwind |
|--------|--------|----------|
| Can hide internal tokens | ✅ Tokens are JS, not exposed to CSS cascade | ❌ `@theme` generates CSS variables by default |
| Swizzle token access | ✅ Export specific vars via `defineVars` | ⚠️ All theme vars are public |
| Evolution safety | ✅ Change internals without breaking consumers | ❌ All tokens are implicit API |

**StyleX advantage**: You choose what to expose. Internal tokens stay internal.

**Tailwind challenge**: `@theme` vars become public CSS variables automatically. Hard to have "private" tokens.

---

## Hybrid Approaches

Given the tension between StyleX's enforcement and Tailwind's ecosystem:

### Option 1: StyleX Internally, Tailwind-Compatible Output

- Components use StyleX for type-safe theming
- Generated atomic classes follow Tailwind naming conventions
- AI-generated Tailwind code works alongside XDS

**Pros**: Best constraint enforcement, AI compatibility via naming
**Cons**: Complex build pipeline, potential naming collisions

### Option 2: Tailwind v4 with Strict Constraints

- Use `@theme` to lock down tokens
- Build-time lint to reject arbitrary values `[...]`
- Components only expose allowed class combinations via typed props

**Pros**: Native Tailwind, familiar to AI and developers
**Cons**: Enforcement is tooling-dependent, not language-level

### Option 3: Dual-Mode Components

- Ship both StyleX and Tailwind versions
- Let consumers choose their styling runtime
- Shared theme tokens exported to both formats

**Pros**: Maximum flexibility
**Cons**: Double maintenance, complexity

### Option 4: StyleX Core + Tailwind Interop Layer

- Core components use StyleX (constraint enforcement)
- Export theme tokens as CSS variables
- Provide Tailwind preset that uses XDS tokens
- AI-generated Tailwind code uses same tokens

**Pros**: Strict internals, compatible externally
**Cons**: Two mental models for contributors

---

## Variant Management Tools: tw-classed, CVA, and Tailwind Variants

### The Problem These Solve

When using Tailwind, components need to manage variants (sizes, intents, states) while staying DRY. Options include:
- Manual string concatenation: `className={isLarge ? 'px-8 py-4' : 'px-4 py-2'}` (messy at scale)
- Wrapper libraries that provide type-safe variant APIs

### Three Popular Options

| Tool | Description | Bundle Size | Key Features |
|------|-------------|-------------|--------------|
| **tw-classed** | Tailwind + CSS-in-JS DX | ~0kb | Type-safe, variants, compounds, defaults |
| **CVA** | Class Variance Authority | Small | Framework-agnostic, simple API |
| **Tailwind Variants** | Official variant management | Small | Slots, responsive variants, conflict resolution |

### tw-classed Deep Dive

**What It Is**: "Make your Tailwind components re-usable" with "Tailwind CSS and CSS-in-JS, the best of both worlds."

**Core API**:
```typescript
import { classed } from 'tw-classed';

const Button = classed('button', {
  variants: {
    intent: {
      primary: 'bg-blue-500 text-white',
      secondary: 'bg-gray-200 text-gray-900',
    },
    size: {
      sm: 'text-sm px-2 py-1',
      md: 'text-base px-4 py-2',
      lg: 'text-lg px-6 py-3',
    }
  },
  compoundVariants: [
    {
      intent: 'primary',
      size: 'lg',
      class: 'shadow-lg', // Applied when both conditions match
    }
  ],
  defaultVariants: {
    intent: 'primary',
    size: 'md',
  }
});

// Usage
<Button intent="secondary" size="lg">Click me</Button>
```

**Strengths**:
- Full TypeScript inference — `intent` prop is typed
- Zero runtime overhead (~0kb)
- No `forwardRef` boilerplate
- Automatic variant autocomplete

**Weaknesses**:
- Still allows arbitrary Tailwind classes if used outside the variant system
- No built-in slot/sub-part styling
- Tied to Tailwind ecosystem

Source: [tw-classed Official Docs](https://tw-classed.vercel.app/)

### Tailwind Variants Deep Dive

**What It Is**: NextUI's official variant management tool with advanced features.

**Slots API** (sub-part styling):
```typescript
import { tv } from 'tailwind-variants';

const card = tv({
  slots: {
    base: 'md:flex bg-slate-100 rounded-xl p-8',
    avatar: 'w-24 h-24 md:w-48 rounded-full',
    wrapper: 'flex-1 pt-6 md:p-8',
    title: 'text-xl font-medium',
    description: 'text-gray-500',
  },
  variants: {
    color: {
      primary: {
        base: 'bg-blue-50',
        title: 'text-blue-900',
      },
      secondary: {
        base: 'bg-gray-50',
        title: 'text-gray-900',
      }
    }
  }
});

const { base, avatar, wrapper, title, description } = card({ color: 'primary' });

// Usage
<div className={base()}>
  <img className={avatar()} />
  <div className={wrapper()}>
    <h3 className={title()}>...</h3>
    <p className={description()}>...</p>
  </div>
</div>
```

**Strengths**:
- **Slots enable sub-part styling** — exactly what XDS needs
- Responsive variants
- Compound slots (apply same classes to multiple slots)
- Built-in conflict resolution
- Slot-level overrides

**Weaknesses**:
- More verbose API than tw-classed
- Requires understanding slots concept
- Still Tailwind-dependent

Source: [Tailwind Variants Slots Docs](https://www.tailwind-variants.org/docs/slots)

### CVA (Class Variance Authority)

**What It Is**: Framework-agnostic variant management.

**Core API**:
```typescript
import { cva } from 'class-variance-authority';

const button = cva('font-semibold rounded', {
  variants: {
    intent: {
      primary: 'bg-blue-500 text-white',
      secondary: 'bg-gray-200 text-gray-900',
    },
    size: {
      sm: 'text-sm px-2 py-1',
      md: 'text-base px-4 py-2',
    }
  },
  defaultVariants: {
    intent: 'primary',
    size: 'md',
  }
});

// Usage
<button className={button({ intent: 'secondary', size: 'lg' })}>
  Click me
</button>
```

**Strengths**:
- Framework-agnostic (works with any CSS)
- Simplest API
- Small bundle size

**Weaknesses**:
- No slots/sub-part styling
- No responsive variants
- No conflict resolution
- Not Tailwind-specific (can use any classes)

Source: [CVA vs Tailwind Variants Comparison](https://dev.to/webdevlapani/cva-vs-tailwind-variants-choosing-the-right-tool-for-your-design-system-12am)

### How Variant Tools Affect XDS Architecture

**Alignment with Zero-Styling Goals**:

| Requirement | tw-classed | Tailwind Variants | CVA | StyleX |
|-------------|-----------|-------------------|-----|--------|
| Type-safe props | ✅ | ✅ | ✅ | ✅ |
| Sub-part styling (slots) | ❌ | ✅ | ❌ | ✅ |
| Arbitrary value prevention | ⚠️ Partial | ⚠️ Partial | ⚠️ Partial | ✅ Full |
| Intent-based API | ✅ | ✅ | ✅ | ✅ |
| Theme token integration | ⚠️ Via Tailwind | ⚠️ Via Tailwind | ⚠️ Manual | ✅ Native |
| Evolution safety | ❌ Classes are public | ❌ Classes are public | ❌ Classes are public | ✅ Internal tokens |

### The Slot Problem

XDS needs sub-part styling (icon slots, label slots, etc.). Only **Tailwind Variants** and **StyleX** support this natively.

### The Arbitrary Value Problem

All Tailwind-based tools (tw-classed, Tailwind Variants, CVA with Tailwind) **still allow arbitrary values**:

```typescript
// All of these would work even with variant tools
<Button className="mt-[13px]" />
<Button className="bg-[#ff0000]" />
```

Only StyleX prevents this at compile time through TypeScript.

### Option 5: Tailwind Variants + Strict Linting

Use Tailwind Variants for ergonomics and slots, but add strict safeguards:

1. **Tailwind Variants for component definition** — slots + variants
2. **Constrained theme via `@theme`** — only allowed tokens exist
3. **Lint to prevent arbitrary values** — build-time enforcement
4. **TypeScript wrapper to hide class strings** — components expose props, not className

**Pros**:
- Slots for sub-part styling (like XDS theming proposal)
- Tailwind ecosystem compatibility
- Type-safe variant API
- Familiar to developers and AI

**Cons**:
- Enforcement still relies on lint rules (not compile-time)
- Can't prevent all arbitrary value leakage
- Theme tokens are public CSS variables

---

## Achieving tw-classed Ergonomics Without Exposed CSS Classes

### The Challenge

tw-classed provides excellent variant API ergonomics:
```typescript
const Button = classed('button', {
  variants: { intent: { primary: '...' } }
});
```

But it has a fundamental constraint issue: **CSS classes are public**. Consumers can:
- Bypass the variant API with `className` overrides
- Depend on generated class names (coupling)
- Use arbitrary Tailwind values

Can we get the ergonomics without the exposed classes?

### Option A: StyleX + Variant Wrapper (Recommended)

Build a variant API wrapper around StyleX that mimics tw-classed ergonomics but maintains enforcement.

**Core implementation**:
```typescript
// @xds/variants — Internal wrapper around StyleX
import * as stylex from '@stylexjs/stylex';

export function createVariants(config) {
  const { base, slots = {}, variants, compoundVariants = [], defaultVariants } = config;

  return function(variantProps) {
    // Compute which styles to apply based on variant selection
    const appliedVariants = Object.entries(variantProps).map(([key, value]) => {
      return variants[key]?.[value];
    });

    // Apply compound variants
    const appliedCompounds = compoundVariants
      .filter(cv => {
        return Object.entries(cv).every(([key, value]) => {
          if (key === 'style') return true; // Skip the style key
          return variantProps[key] === value;
        });
      })
      .map(cv => cv.style);

    return {
      base: () => stylex.props(base, ...appliedVariants, ...appliedCompounds),
      slots: Object.fromEntries(
        Object.entries(slots).map(([name, slotStyles]) => [
          name,
          () => stylex.props(slotStyles)
        ])
      ),
    };
  };
}
```

**Usage**:
```typescript
// Component definition
import { createVariants } from '@xds/variants';
import * as stylex from '@stylexjs/stylex';

const button = createVariants({
  base: stylex.create({
    root: {
      padding: 8,
      borderRadius: 4,
      cursor: 'pointer',
    }
  }).root,

  slots: {
    icon: stylex.create({
      root: { width: 16, height: 16, marginRight: 8 }
    }).root,
    label: stylex.create({
      root: { fontWeight: 500 }
    }).root,
  },

  variants: {
    intent: {
      primary: stylex.create({
        root: {
          backgroundColor: 'var(--xds-color-primary)',
          color: 'var(--xds-color-on-primary)',
        }
      }).root,
      secondary: stylex.create({
        root: {
          backgroundColor: 'var(--xds-color-secondary)',
          color: 'var(--xds-color-on-secondary)',
        }
      }).root,
    },
    size: {
      sm: stylex.create({
        root: { fontSize: 14, padding: 4 }
      }).root,
      md: stylex.create({
        root: { fontSize: 16, padding: 8 }
      }).root,
      lg: stylex.create({
        root: { fontSize: 18, padding: 12 }
      }).root,
    }
  },

  compoundVariants: [
    {
      intent: 'primary',
      size: 'lg',
      style: stylex.create({
        root: { boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }
      }).root,
    }
  ],

  defaultVariants: {
    intent: 'primary',
    size: 'md',
  }
});

// Component using the variant system
export function Button({ intent = 'primary', size = 'md', icon, children }) {
  const styles = button({ intent, size });

  return (
    <button {...styles.base()}>
      {icon && <span {...styles.slots.icon()}>{icon}</span>}
      <span {...styles.slots.label()}>{children}</span>
    </button>
  );
}
```

**What this achieves**:
- ✅ tw-classed-like variant API
- ✅ Slot-based sub-part styling
- ✅ Compound variants
- ✅ Default variants
- ✅ **No exposed CSS classes** — consumers only see props
- ✅ TypeScript inference for variant values
- ✅ Compile-time enforcement via StyleX

**Type inference**:
```typescript
type ButtonVariants = {
  intent: 'primary' | 'secondary';
  size: 'sm' | 'md' | 'lg';
};

// Inferred from variant definition
type ButtonProps = ButtonVariants & { children: ReactNode; icon?: ReactNode };
```

**Tradeoffs**:
| Benefit | Drawback |
|---------|----------|
| Zero CSS class exposure | More verbose than tw-classed (JS objects vs strings) |
| Full compile-time enforcement | Requires custom wrapper (not off-the-shelf) |
| StyleX bundle benefits | Team needs to learn StyleX |
| Sub-part styling native | More complex implementation |

### Option B: Tokenami

[Tokenami](https://github.com/tokenami/tokenami) is a design token system that generates **typed CSS properties** instead of classes.

**How it works**:
```typescript
import { css } from '@tokenami/css';

// Define tokens
const tokens = {
  color: {
    primary: '#0066cc',
    secondary: '#6b7280',
  },
  spacing: {
    sm: '0.5rem',
    md: '1rem',
  }
};

// Usage — CSS properties, not classes
<button
  style={css({
    backgroundColor: 'var(--color-primary)',
    padding: 'var(--spacing-md)',
  })}
>
  Click me
</button>
```

**Variant wrapper**:
```typescript
const button = createTokenamiVariants({
  variants: {
    intent: {
      primary: { backgroundColor: 'var(--color-primary)' },
      secondary: { backgroundColor: 'var(--color-secondary)' },
    }
  }
});

// No classes generated — only CSS variables
```

**Tradeoffs**:
| Benefit | Drawback |
|---------|----------|
| No CSS classes at all | Less mature ecosystem |
| Token-first architecture | Different mental model |
| Type-safe CSS properties | Verbose inline styles |

**Verdict**: Interesting but immature. Not worth the risk for XDS core.

### Option C: Tailwind Variants Internal, Props-Only Public

Use Tailwind Variants internally but hide classes from consumers.

**Implementation**:
```typescript
import { tv } from 'tailwind-variants';

// Internal variant definition (not exported)
const buttonVariants = tv({
  slots: {
    base: 'rounded cursor-pointer',
    icon: 'w-4 h-4 mr-2',
    label: 'font-medium',
  },
  variants: {
    intent: {
      primary: {
        base: 'bg-primary text-on-primary',
      },
      secondary: {
        base: 'bg-secondary text-on-secondary',
      }
    }
  }
});

// Public component — props only
export function Button({ intent = 'primary', size = 'md', icon, children }) {
  const styles = buttonVariants({ intent, size });

  return (
    <button className={styles.base()}>
      {icon && <span className={styles.slots.icon()}>{icon}</span>}
      <span className={styles.slots.label()}>{children}</span>
    </button>
  );
}

// className prop not exposed — no escape hatch
```

**Enforcement strategy**:
1. Don't expose `className` prop on components
2. Internal Tailwind Variants definition
3. Lint rules to prevent `className` on XDS components
4. TypeScript types enforce props-only API

**Tradeoffs**:
| Benefit | Drawback |
|---------|----------|
| Uses mature Tailwind Variants | Classes still exist in DOM (inspectable) |
| Slots for sub-parts | Can't prevent consumers from finding class names |
| Tailwind ecosystem compatible | Arbitrary values still possible in internal code |
| Simpler implementation | Enforcement relies on conventions, not compiler |

**Key weakness**: Classes are in the DOM. Savvy consumers can inspect and depend on them.

### Comparison

| Approach | Enforcement Level | Ergonomics | Maturity | Recommendation |
|----------|------------------|------------|----------|----------------|
| **StyleX + Variant Wrapper** | ✅ Compile-time | ⚠️ Verbose | ✅ Proven (StyleX) | **Best for XDS** |
| **Tokenami** | ✅ No classes | ⚠️ Different model | ❌ Immature | Too risky |
| **Tailwind Variants (hidden)** | ⚠️ Convention-based | ✅ Simple | ✅ Proven | Classes leak to DOM |

### Recommendation: Option A

**Build `@xds/variants` as a lightweight wrapper around StyleX** that provides:
- tw-classed-like API ergonomics
- Slot-based sub-part styling
- Compound variants
- Default variants
- Full compile-time enforcement
- Zero CSS class exposure

This combines:
- The ergonomics benefit of variant tools
- The enforcement guarantees of StyleX
- The evolution safety of encapsulated tokens
- The AI compatibility of typed props

**Implementation plan**:
1. Create `@xds/variants` package
2. Build `createVariants()` wrapper around StyleX
3. Use it for all core components
4. Document migration from tw-classed for adopters

---

## Recommendation

Given zero-styling architecture requirements:

| Factor | Winner | Rationale |
|--------|--------|-----------|
| Constraint enforcement | **StyleX** | Types prevent arbitrary values; Tailwind can't |
| AI compatibility | **Tailwind** | LLMs know it; StyleX requires learning |
| Theming architecture | **StyleX** | Scoped themes are first-class |
| Ergonomics | **Tailwind** | Concise class syntax |
| Ecosystem pressure | **Tailwind** | More AI UIs, more templates |
| No class exposure | **StyleX** | Classes are implementation detail |

### Proposed Path: StyleX + Variant Wrapper + Tailwind Interop

Combines the best of all approaches:

**1. `@xds/variants` wrapper around StyleX**
- tw-classed-like ergonomics for component authors
- Slots for sub-part styling
- Compound variants, default variants
- Full compile-time enforcement
- Zero CSS class exposure to consumers

**2. StyleX for core constraint layer**
- Zero-styling architecture depends on enforcement
- Type-safe theming with scoped overrides
- Classes are atomic and opaque (not semantic)

**3. Export theme tokens as CSS variables (semantic tier only)**
- `--xds-color-primary`, `--xds-spacing-sm`, etc.
- Available for swizzled components
- Base/primitive tokens not exposed

**4. Provide Tailwind preset for ecosystem compatibility**
```css
@theme {
  --color-primary: var(--xds-color-primary);
  --spacing-sm: var(--xds-spacing-sm);
}
```
- Tailwind users get XDS tokens as utilities
- Interop without compromising core enforcement

**5. Document migration path**
- tw-classed → @xds/variants for adopters
- Tailwind → XDS for teams wanting stricter enforcement

This gives:
- **Strict enforcement internally** (StyleX + types)
- **Ergonomic authoring** (@xds/variants API)
- **No class exposure** (props-only public API)
- **Compatibility externally** (Tailwind preset uses same tokens)
- **AI-friendly surface** (typed props, constrained tokens)

---

## AI Considerations for StyleX + Variants Approach

### The Author vs Consumer Gap

The "AI gap" with StyleX is primarily for **component authors**, not **component consumers**.

| Role | API Surface | AI Difficulty |
|------|-------------|---------------|
| **Consumer** | `<Button intent="primary" size="md">` | Trivial — typed props, autocomplete |
| **Author** | `createVariants({ ... stylex.create() ... })` | Higher — unfamiliar StyleX patterns |
| **Swizzler** | Semantic CSS variables + custom StyleX | Medium — documented patterns |

**Why this matters**: Since XDS ships pre-built components, most users are consumers. They never touch StyleX — they just use typed props, which is extremely AI-friendly.

**For component authors** (XDS maintainers or contributors):
- StyleX is less common in training data than Tailwind
- LLMs may hallucinate incorrect StyleX APIs
- TypeScript catches errors immediately → fast iteration
- Codebase context teaches patterns quickly

### Type Inference for Variants

`@xds/variants` needs tw-classed-style type inference:

```typescript
// The goal: infer variant types from definition
const button = createVariants({
  variants: {
    intent: {
      primary: stylex.create({...}).root,
      secondary: stylex.create({...}).root,
    },
    size: {
      sm: stylex.create({...}).root,
      md: stylex.create({...}).root,
    }
  }
});

// TypeScript infers:
// { intent: 'primary' | 'secondary', size: 'sm' | 'md' }
type ButtonVariants = Parameters<typeof button>[0];
```

**Implementation approach**:
```typescript
function createVariants<
  TVariants extends Record<string, Record<string, StyleXStyles>>
>(config: {
  base?: StyleXStyles;
  variants: TVariants;
  defaultVariants?: Partial<VariantProps<TVariants>>;
}): VariantFunction<TVariants>;

type VariantProps<T> = {
  [K in keyof T]: keyof T[K]
};
```

This gives the same strong typing as tw-classed — variants only match the defined set.

### Distributable Themes Tradeoff

When themes are separate packages, there's tension between type safety and AI context:

```
@company/dark-theme          @xds/core
├── theme.ts                 ├── Button.tsx
│   intents: {               │   intent: ???
│     primary,               │   // What intents are valid?
│     secondary              │   // Component doesn't know
│   }                        │
```

**Three approaches**:

| Approach | Type Safety | AI Context Required | AI Difficulty |
|----------|-------------|---------------------|---------------|
| **Generic components** | ✅ Full | Theme type in scope | Medium — needs to understand generics |
| **Superset intents** | ⚠️ Runtime | Just component | Low — simple props |
| **Codegen** | ✅ Full | Generated component | Low — types are concrete |

**Recommended pattern: Re-export with concrete types**

```typescript
// src/components/index.ts — App-level typed components
import { Button as XDSButton } from '@xds/core';
import { theme } from '@company/dark-theme';

// Re-export with concrete types
export const Button = XDSButton<typeof theme>;
// Now intent is concretely typed: 'primary' | 'secondary'
```

This gives AI a single file with concrete types — no need to reason about generics or cross-package relationships.

### Swizzle API Vibe-ability

The swizzle API must also be AI-friendly. When users swizzle a component, AI needs to help them customize it.

**What swizzlers have access to**:
- Semantic CSS variables: `var(--xds-color-primary)`
- The original StyleX code to modify
- Documented patterns for common customizations

**Making swizzle AI-friendly**:

| Strategy | How It Helps |
|----------|--------------|
| **Consistent variable naming** | `--xds-{category}-{name}` is predictable |
| **JSDoc on swizzled code** | Inline documentation for the code AI will read |
| **Example customizations** | Common patterns in the swizzled file |
| **Simple entry points** | Clear "this is where you customize" markers |

**Swizzle template structure**:
```typescript
// Button.tsx (swizzled)
/**
 * Swizzled Button component.
 *
 * Available semantic tokens:
 * - --xds-color-primary, --xds-color-secondary, etc.
 * - --xds-spacing-sm, --xds-spacing-md, etc.
 *
 * Common customizations:
 * - Add new intent: add to `variants.intent`
 * - Change sizing: modify `variants.size`
 * - Add animation: add to base styles
 */

const button = createVariants({
  // 👇 CUSTOMIZE: Base styles applied to all variants
  base: stylex.create({
    root: { /* ... */ }
  }).root,

  // 👇 CUSTOMIZE: Add or modify intents here
  variants: {
    intent: {
      primary: stylex.create({
        root: { backgroundColor: 'var(--xds-color-primary)' }
      }).root,
      // Add custom intents below:
    }
  }
});
```

**The key insight**: Swizzled code is essentially "AI context" — structure it so LLMs can read and modify it effectively.

| Swizzle Design Choice | AI Impact |
|-----------------------|-----------|
| Comments marking customization points | Guides where to edit |
| Semantic variables (not raw values) | Predictable, learnable |
| Flat structure (not deeply nested) | Easier to navigate |
| TypeScript types on everything | Catches errors immediately |

---

## Does the Swizzle API Lead to Over-Componentization?

### Research Says: Over-Componentization Is Not a Real Problem

Design system research identifies different challenges:

| Cited Problem | What It Means |
|---------------|---------------|
| **Adoption failure** | "Design systems aren't failing because they're poorly built—they're failing because no one's using them" |
| **Poor ownership** | Unclear accountability, systems "sit on a digital shelf" |
| **Limited collaboration** | Teams work in isolation, don't contribute back |
| **Discovery issues** | Hard to find the right component (organization problem, not quantity) |

Notably missing: "we have too many components."

Sources: [Netguru: Design System Adoption Pitfalls](https://www.netguru.com/blog/design-system-adoption-pitfalls), [UXPin: Component-Based Design Guide](https://www.uxpin.com/studio/blog/component-based-design-complete-implementation-guide/)

### Why More Components Is Often Better

| More Components | Fewer Components + CSS Escape Hatches |
|-----------------|--------------------------------------|
| Explicit, named patterns | Implicit, undocumented variations |
| Discoverable via autocomplete | Hidden in CSS overrides |
| Testable individually | Side effects hard to trace |
| AI can learn discrete patterns | AI generates arbitrary styling |

Creating a `<ButtonWithIcon>` variant costs minutes. Debugging why `<Button className="custom-override">` broke in a refactor costs hours.

### When Over-Componentization IS a Problem

| Scenario | Why It's Actually Bad | Root Cause |
|----------|----------------------|------------|
| One-off components | "Only used once" should be a composition | Poor judgment |
| Prop explosion | 30+ props means should be split | Missing abstraction |
| Naming collisions | `ButtonPrimary` vs `PrimaryButton` | Governance failure |
| No composition | Every variation is new instead of composing | Not understanding composition |

These are **governance failures**, not "too many components."

### How the Swizzle API Reduces Component Proliferation

The swizzle API provides a middle ground that actually *reduces* unnecessary components:

```
┌────────────────────────────────────────────────────────────┐
│  Need                        │  Without Swizzle API       │
├──────────────────────────────┼────────────────────────────┤
│  Slight color tweak          │  New component OR CSS hack │
│  Structural change           │  New component             │
│  Behavioral change           │  New component             │
└──────────────────────────────┴────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  Need                        │  With Swizzle API          │
├──────────────────────────────┼────────────────────────────┤
│  Slight color tweak          │  Swizzle, use semantic var │
│  Structural change           │  Swizzle component         │
│  Behavioral change           │  New component (explicit)  │
└──────────────────────────────┴────────────────────────────┘
```

**Result**: New components are reserved for genuinely new patterns, not styling edge cases.

### The Real Risks to Watch For

| Risk | Mitigation |
|------|------------|
| Undiscoverable components | Good organization, Storybook, search |
| Ungoverned components | Clear ownership, contribution guidelines |
| Swizzle becomes default | Document when to swizzle vs. request new component |
| Semantic tokens misused | Lint for direct CSS variable usage outside swizzle |

---

## Open Questions

### @xds/variants Implementation
- How do we type-infer variant props from the `createVariants` definition?
- Should variants be defined per-component or centralized in theme?
- How does the variant wrapper integrate with theme context?
- Should responsive variants be part of the API or handled separately?

### Complex Selectors / Parent-Child State
- Should we build a `createStateRelationship()` helper to reduce CSS variable boilerplate?
- Is the ergonomics gap with Tailwind's `group-hover:*` acceptable for XDS?
- Should XDS components have built-in state variables for common patterns (hover reveal, focus highlight)?
- Could we generate the variable definitions automatically from component slots?

### Distributable Themes
- Generic components vs superset intents vs codegen — which approach for multi-theme type safety?
- How do we make the re-export pattern discoverable for users?
- Should XDS provide a CLI to generate typed component re-exports from a theme?
- How do we handle theme switching at runtime while maintaining type safety?

### Swizzle API
- What's the right level of inline documentation for swizzled components?
- Should swizzled components include example customizations as comments?
- How do we version swizzled component templates separately from the main library?

### Token and Theming
- How do we lint/prevent arbitrary Tailwind values in consumer codebases?
- Should the Tailwind preset be opt-in or default?
- Can we generate Tailwind classes from StyleX definitions automatically?
- How do we handle the DX gap between StyleX and Tailwind for contributors?
- What tokens belong in the "swizzle API" vs staying fully internal?
- How do we version the swizzle API separately from the component API?
- Should swizzle tokens use a different naming convention to signal instability?

---

## Related

- `zero-styling-architecture.md` — Core architecture this serves
- `ai-design-system-gaps.md` — Why constraints matter for AI
- `ai-trajectory-predictions.md` — Fundamental limits inform this choice

---

## Sources

- [StyleX Official Documentation](https://stylexjs.com/docs/learn/)
- [StyleX Theming Guide](https://stylexjs.com/docs/learn/theming/creating-themes/)
- [BetterStack: StyleX for Scalable CSS](https://betterstack.com/community/guides/scaling-nodejs/stylex-metas/)
- [Tailwind v4 Theme Documentation](https://tailwindcss.com/docs/theme)
- [Tailwind at Scale Issues](https://dev.to/gouranga-das-khulna/why-tailwind-css-might-be-hurting-your-large-scale-projects-3k73)
