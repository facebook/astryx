# @astryx/eslint-plugin

ESLint plugin for Astryx design system token enforcement.

## Philosophy: Two-Tier Linting

This plugin implements a two-tier linting strategy:

| Mode            | Audience  | Behavior            | Trigger                             |
| --------------- | --------- | ------------------- | ----------------------------------- |
| **Recommended** | Humans    | Warnings only       | Default (local dev)                 |
| **Strict**      | Agents/CI | Errors (fail build) | `CI=true` or `ASTRYX_STRICT_LINT=1` |

### Why Two Tiers?

- **Agents** should follow strict rules perfectly; they have no excuse for violations
- **Humans** need flexibility during development; warnings inform without blocking

## Rules

### `@astryx/no-hardcoded-styles`

Detects hardcoded CSS values in `stylex.create()` that should use Astryx tokens:

| Property                     | Should Use                          |
| ---------------------------- | ----------------------------------- |
| `fontSize`                   | `textSizeVars['--text-*']`          |
| `fontWeight`                 | `fontWeightVars['--font-weight-*']` |
| `color`, `backgroundColor`   | `colorVars['--color-*']`            |
| `padding*`, `margin*`, `gap` | `spacingVars['--spacing-*']`        |
| `borderRadius`               | `radiusVars['--radius-*']`          |

**Bad:**

```tsx
const styles = stylex.create({
  text: {
    fontSize: '14px', // ❌ Hardcoded
    fontWeight: 600, // ❌ Hardcoded
    color: '#FF0000', // ❌ Hardcoded
  },
});
```

**Good:**

```tsx
const styles = stylex.create({
  text: {
    fontSize: textSizeVars['--font-size-base'], // ✅ Token
    fontWeight: fontWeightVars['--font-weight-semibold'], // ✅ Token
    color: colorVars['--color-error'], // ✅ Token
  },
});
```

### `@astryx/no-style-only-wrapper`

Flags a `<div>`/`<span>` that exists only to style a single Astryx component.
Every component extends `BaseProps`, so it takes `xstyle` — the wrapper adds a
DOM node that takes the component out of its parent's flex/grid child
relationship (this is what knocked the pagination carets off-center in #4752).

**Bad:**

```tsx
<span {...stylex.props(rtlStyles.mirror)}>
  <Icon icon="chevronsLeft" /> {/* ❌ wrapper exists only to carry a style */}
</span>
```

**Good:**

```tsx
<Icon icon="chevronsLeft" xstyle={rtlStyles.mirror} /> {/* ✅ */}
```

The rule only fires when dropping the wrapper preserves behavior, so it stays
quiet on wrappers that do real work:

| Wrapper                                                               | Reported? |
| --------------------------------------------------------------------- | --------- |
| Only style attributes (`stylex.props`, `className`)                   | ✅ yes    |
| `role`, `aria-*`, `data-*`, `ref`, a handler, `{...rest}`             | ❌ no     |
| More than one child, or a non-Astryx / host child                     | ❌ no     |
| Styles include `display`, flex/grid container props, `gap`, `padding` | ❌ no     |
| Child renders no root element (`Tooltip`, providers)                  | ❌ no     |

Style objects imported from another module are read from that module, so
`import {rtlStyles} from '../utils'` is classified as accurately as a local
`stylex.create()` (see `stylex-style-source.js`).

**Options:** `wrapperElements`, `componentSources`, `allowComponents`,
`allowFiles`.

**Suggestion (not auto-fix):** for the unambiguous shape — a lone
`{...stylex.props(…)}` over a child with no `xstyle` — the rule offers a
rewrite that moves the styles onto the child. Removing a node can shift layout,
so it is never applied by `--fix`.

### `@astryx/require-letter-spacing`

Recommends adding `letterSpacing` when `fontSize` is defined (common design pattern for badges, labels).

**Strict mode only.** Helps catch missing letter-spacing in compact text elements.

### `@astryx/require-baseprops-passthrough`

Ensures a component actually forwards the styling props it accepts via `BaseProps`:
`xstyle`, `className`, and `style`. A component's props may promise consumers these
escape hatches, but the implementation can silently drop them:

- **Unused** — a styling prop is destructured but never referenced, so the override is dropped.
- **Not forwarded** — a styling prop the type promises is never destructured and never reaches
  the root element.

Forwarding paths differ by what each prop *is*:

- `className` and `style` are real DOM attributes, so they survive a `{...rest}` spread onto
  the root element (native or composed) — that counts as forwarding them.
- `xstyle` is a StyleX style object, **not** a DOM attribute. It cannot ride a `{...rest}`
  spread onto a native element (it renders inert); the only valid un-destructured path is a
  rest spread onto a composed Astryx component, which re-accepts `xstyle` via its own `BaseProps`.

Fix by threading each prop into the root `mergeProps(...)` / `stylex.props(...)` call, or
forwarding to a composed component.

Scoped to public components (those with a `.displayName`). Opt out by omitting the prop from
the type, e.g. `Omit<BaseProps, 'xstyle' | 'className' | 'style'>` (as `VisuallyHidden` does),
or mark an intentionally-unused binding with a leading underscore (`className: _className`).

## Usage

### Local Development (Human Mode)

```bash
pnpm lint
# ESLint running in RECOMMENDED (human) mode
# Shows warnings but doesn't fail
```

### CI / Agent Mode

```bash
pnpm lint:strict
# or
ASTRYX_STRICT_LINT=1 pnpm lint
# or (automatic in GitHub Actions)
CI=true pnpm lint

# ESLint running in STRICT (agent/CI) mode
# Errors cause build failure
```

## Testing the Plugin

A test file with intentional violations is provided:

```bash
# Human mode - shows warnings
pnpm lint packages/core/src/Badge/Badge.test-violations.tsx

# Strict mode - shows errors
pnpm lint:strict packages/core/src/Badge/Badge.test-violations.tsx
```

Expected output in strict mode:

```
  12:15  error  Use textSizeVars token instead of hardcoded fontSize  @astryx/no-hardcoded-styles
  17:16  error  Use fontWeightVars token instead of hardcoded fontWeight  @astryx/no-hardcoded-styles
  22:12  error  Use colorVars token instead of hardcoded color  @astryx/no-hardcoded-styles
  ...
```

## Configuration

The plugin is configured in `eslint.config.js`:

```js
import astryxPlugin from "./internal/eslint-plugin-astryx/index.js";

const isStrictMode = process.env.ASTRYX_STRICT_LINT === '1' || process.env.CI === 'true';
const astryxConfig = isStrictMode ? astryxPlugin.configs.strict : astryxPlugin.configs.recommended;

// Applied to core package files
{
  files: ["packages/core/src/**/*.{ts,tsx}"],
  ...astryxConfig,
}
```

## Ignoring Specific Properties

If a property legitimately needs a hardcoded value:

```js
// In eslint.config.js
{
  files: ["packages/core/src/**/*.{ts,tsx}"],
  plugins: { '@astryx': astryxPlugin },
  rules: {
    '@astryx/no-hardcoded-styles': ['warn', {
      ignore: ['lineHeight']  // Allow hardcoded lineHeight
    }],
  },
}
```

### `@astryx/presentational-component`

Enforces that presentational components remain server-component compatible by preventing:

1. **Remembering things**: `useState`, `useReducer`, `useTransition`
2. **Watching things**: `useEffect`, `useLayoutEffect`, `useRef`, `ResizeObserver`, etc.
3. **Coordinating children**: `createContext`

Allowed hooks: `useId`, `useMemo`, `useCallback`, `useContext` (read-only).

**Applies to these components:**

- AspectRatio, Badge, Card, Center, Divider, EmptyState, Field, FormLayout
- Grid, Layout, Link, NavIcon, ProgressBar, Section, Skeleton, Stack, StatusDot, Token

**Bad:**

```tsx
// In Badge.tsx
import {useState} from 'react';
export function Badge() {
  const [x, setX] = useState(0); // ❌ Presentational components must not remember things
  return <span>{x}</span>;
}
```

**Good:**

```tsx
// In Badge.tsx
import {useId, useContext} from 'react';
export function Badge({label}) {
  const id = useId(); // ✅ useId is RSC-compatible
  const theme = useContext(ThemeContext); // ✅ Reading context is fine
  return <span id={id}>{label}</span>;
}
```

**What to do when you need state/effects:**

- Move the behavior to a wrapper component (e.g. `TextTruncation` wraps `Text`)
- Make state controlled via props (consumer owns the state)
- If the component legitimately needs client behavior, remove it from the presentational list

See: https://github.com/facebook/astryx/issues/493

### `@astryx/no-nullish-jsx-guard`

Flags a bare nullish check (`!= null`, `!== null`, `!== undefined`) used as a JSX render guard for a value that is then rendered as a child. `!= null` only rejects `null`/`undefined`, but React also renders nothing for `false`, `true`, and `''` — all of which pass a `!= null` guard and leak an empty wrapper element into the DOM. Use `isRenderable(value)` from `@astryxdesign/core/utils` instead (it also excludes boolean and empty-string values; `0` stays renderable).

**Scope (deliberately conservative):** only flags when both (1) the guard renders JSX and (2) the guarded value is rendered as a JSX _child_ of that branch. A value used only as a prop (`{user != null && <Profile user={user} />}`) is **not** flagged, since it is a data object, not a rendered slot.

**Bad:**

```tsx
{
  sideNav != null && <aside>{sideNav}</aside>;
}
{
  label != null ? <span>{label}</span> : null;
}
```

**Good:**

```tsx
import {isRenderable} from '@astryxdesign/core/utils';

{
  isRenderable(sideNav) && <aside>{sideNav}</aside>;
}
{
  isRenderable(label) ? <span>{label}</span> : null;
}
```

Ships as a **warning in both tiers** while core migrates its existing call sites; promote to `error` in strict mode once migrated. Provides an ESLint suggestion that rewrites the comparison to `isRenderable(value)` (add the import manually).

See: https://github.com/facebook/astryx/issues/2538

### `@astryx/focus-outline-keyboard-only`

Flags a focus outline written against `:focus` or `:focus-within` inside `stylex.create()`. A focus outline is a **keyboard** affordance; both of those selectors also match a plain mouse click, so the ring gets shown to pointer users too — most easily missed on the paths where focus is restored programmatically (an overlay that returns focus to its trigger after a click-to-dismiss puts the ring back up with no keyboard involved).

Use `:focus-visible`, or `:has(:focus-visible)` when the ring is drawn on a wrapper around the focusable element. A text input still matches `:focus-visible` when clicked, so nothing is lost.

**Bad:**

```ts
const styles = stylex.create({
  base: {
    outline: {
      default: 'none',
      ':focus': `2px solid ${colorVars['--color-accent']}`,
    },
  },
  wrapper: {
    ':focus-within': {outline: `2px solid ${colorVars['--color-accent']}`},
  },
});
```

**Good:**

```ts
import {focusOutlineStyles} from '../utils/focusOutline.stylex';

// Preferred — the shared ring: .focusVisible on the focusable element,
// .focusWithin (`:has(:focus-visible)`) on a wrapper around it.
stylex.props(focusOutlineStyles.focusVisible);
```

**Scope:** `outline` and its longhands only, and only where the ring is drawn — suppressing one on a broader selector (`outline: {':focus': 'none'}`) is legitimate and is not flagged. A field's `:focus-within` border and inset box-shadow (`Field/inputStyles.stylex.ts`) are a different treatment — "you are typing here" — and are deliberately not policed by this rule.

Ships as an **error in both tiers**: core is clean, and this keeps it that way.

### `@astryx/focus-outline-shared`

Flags a focus ring written out inside `stylex.create()` instead of taken from the shared utility. There is one ring in the system and it is themeable through the `--focus-outline-*` tokens; a component that spells out its own gets those values by accident and drifts the moment either side moves — which is what happened before this rule existed (offsets wandered between 1px, 2px and 3px, and one ring was a border-width thick).

**Bad:**

```ts
const styles = stylex.create({
  base: {
    outline: {
      default: 'none',
      ':focus-visible': `2px solid ${colorVars['--color-accent']}`,
    },
  },
});
```

**Good:**

```ts
import {focusOutlineStyles} from '../utils/focusOutline.stylex';

stylex.props(focusOutlineStyles.focusVisible, styles.base);
```

**Scope:** only what the ring LOOKS like — the `outline` shorthand, `outlineWidth`, `outlineStyle` — under a literal `:focus-visible` condition. Not flagged: `outlineOffset` (where the ring sits is a local constraint — inset into a tight grid, or held clear of a field border — and such a component still follows the theme's width, style and color), `outlineColor` (re-coloring per variant is the documented override), and a computed condition key such as `stylex.when.ancestor(':has(:focus-visible)', scope)`, which a shared style cannot express because a scope marker cannot be shared between components.

Ships as an **error in both tiers**: core and lab are clean, and this keeps them that way.
