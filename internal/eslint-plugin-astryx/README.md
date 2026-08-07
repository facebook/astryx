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

### Theming targets — `theming-target-shape`, `theming-target-name`, `themeprops-reflection`

**Status: prototype.** All three are registered on the plugin but are NOT in
`configs.strict` / `configs.recommended` yet, and are not wired into
`eslint.config.js` — the criteria they encode are still being settled. Measured
counts against `packages/` and the proposed tier for each check are below;
turning one on is one line in `index.js`.

**The criteria are canonical in the wiki**, under "Principles for authoring
theming targets" in
[Theming Infrastructure](https://github.com/facebook/astryx/wiki/Theming-Infrastructure).
These rules encode the mechanically checkable subset of that page; the
`Principle` column below cites what each check enforces. Where the wiki and a
rule disagree, the wiki wins and the rule is wrong.

A theming target (`themeProps('selector-option')`) is a public API commitment:
a stable `.astryx-*` class a theme writes CSS against. These rules check the
part of "is this a good target?" that is mechanical. Whether a real consumer
needs the target, whether it has a stated visual intent, and whether the design
should converge instead (principles 6 and 7) stay human.

Shared analysis lives in `theming-target.js`: which `themeProps()` calls land on
an element (spread, through `mergeProps`, through a local `const`, or via
`.className`), which `stylex.props()` arguments it applies, and whether those
declare **paint** (color, background, border, font, radius, shadow), **layout**
(display, position, flex/grid, margin/padding, width/height, transform), or
neither (opacity, transition, cursor). Style objects imported from another
module are read from that module via `stylex-style-source.js`.

#### `@astryx/theming-target-shape`

| Check (messageId)                                     | Principle                                                 | What it flags                                                                                                | On `packages/` | Proposed tier                                      |
| ----------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | -------------- | -------------------------------------------------- |
| `layoutOnlyTarget`                                    | P1 — target the element that carries the styling          | A sub-element target on an element whose styles declare no paint property                                    | 5              | `warn`                                             |
| `wrapperTarget`                                       | P1 + attach to the component                              | A target on a paint-free `div`/`span` whose only child is an Astryx component — it belongs on that component | 4              | `warn` (→ `error` once fixed)                      |
| `unstyledTarget`                                      | P1 — "if nothing at that spot paints, there is no target" | A target on an element with no styles at all and nothing wrapped                                             | 0              | `error`                                            |
| `layoutOnlyRootTarget` (opt-in: `checkRootTargets`)   | P1                                                        | A component's OWN root target, when the root paints nothing                                                  | 55             | off — layout primitives legitimately trip it       |
| `stateVariesOnlyLayout` (opt-in: `checkStateSurface`) | P1 refinement — the _state seam_ only moves layout        | The target declares runtime state, but that state only moves layout (a `transform`)                          | 0              | `warn` — worth turning on                          |
| `underDeclaredState` (opt-in: `checkStateSurface`)    | P2 — state and size are data on the target                | The element's styles vary with a state the target does not pass to `themeProps`                              | 16             | off — a real backlog, each item needs a human call |

The rule stays silent when it cannot see the whole picture: a target spread onto
an Astryx component (the paint is inside the component), a style it cannot
resolve, an element that sets a CSS custom property (it feeds the derived-var
pipeline), and SVG (which paints through presentation attributes). The
consumer's `xstyle` is not treated as unknown — it is not part of the
component's declared surface.

**Bad:**

```tsx
// styles.dropdown: boxSizing, maxHeight, overflowY, padding — nothing paints
<div {...mergeProps(themeProps('selector-dropdown'), stylex.props(styles.dropdown))}>

// the target belongs on <CheckboxInput>, not on the box holding it
<div inert {...mergeProps(themeProps('x-option-checkbox'), stylex.props(styles.box))}>
  <CheckboxInput label="" />
</div>
```

**Options:** `allowTargets`, `allowFiles`, `checkRootTargets`,
`checkStateSurface`.

#### `@astryx/theming-target-name`

| Check (messageId)           | Principle                                | What it flags                                                                                                                        | On `packages/` | Proposed tier |
| --------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | -------------- | ------------- |
| `appearanceInComponentSlot` | P3 — one vocabulary per concept          | Target attached to a leaf Astryx component whose last segment names an appearance (`-check` on an `<Icon>`) instead of the component | 3              | `warn`        |
| `missingPosition`           | Name by position                         | `{parent}-{component}` with no position segment, on a composed component                                                             | 0              | `warn`        |
| `stateSubTarget`            | P2 — never mint a `-selected` sub-target | A target name ending in `-disabled` / `-selected` / `-checked` / …                                                                   | 0              | `error`       |

The component-slot check runs only for **leaf** components (`Icon`,
`CheckboxInput`, `Divider`, `Button`, …; see `DEFAULT_COMPONENT_SLOTS`) and
skips the component's own root target. Both narrowings are deliberate: principle
3 makes `{component}-option` the correct name for an option row in every
list-like component, so holding a row primitive to
`{parent}-{position}-{component}` would argue with the principle the rule
exists to serve. Position words are an open vocabulary and are not checked.

**Bad → good:**

```tsx
<Icon icon="check" {...themeProps('selector-check')} />        // ❌ appearance
<Icon icon="check" {...themeProps('selector-option-icon')} />  // ✅ position + component
```

**Options:** `allowTargets`, `allowFiles`, `componentSlots`.

#### `@astryx/themeprops-reflection`

`themeProps()` returns the class token **and** the `data-*` reflection of the
visual props. Every check here enforces **P2** — "reflect variants and runtime
state through `themeProps({ ... })`, which emits both the class token and the
kebab-cased `data-*` attribute together." These are mechanical bugs, not
judgment calls.

| Check (messageId)        | What it flags                                                                                                    | On `packages/` | Proposed tier |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------- | -------------- | ------------- |
| `droppedStateReflection` | `className={themeProps('x', {size}).className}` — the `data-*` attributes never render                           | 0              | `error`       |
| `clobberedByLaterProp`   | `{...themeProps('x')} className={className}` — the later prop overwrites the target, so it never reaches the DOM | 2              | `error`       |
| `bypassedThemeProps`     | `stableClassName('x')` used to build a theme class by hand, so state can never ride along                        | 2              | `error`       |
| `classNameOnly`          | `.className` on a call with no visual props — drops nothing today, becomes the bug tomorrow                      | 3              | `warn`        |
| `handAuthoredState`      | `data-state`/`data-selected`/… hand-written on an element that already carries a target                          | 0              | `error`       |

`handAuthoredState` only looks at a short list of state attribute names: most
`data-*` attributes in the codebase are identity or query hooks the component's
own JS reads (`data-value`, `data-date`, `data-page`), and routing those through
`themeProps` would change what they mean.

**Options:** `allowDataAttributes`, `allowFiles`.

#### What these rules do NOT check

Principles 6 (a target needs a stated visual intent, ideally a real use case)
and 7 (consolidate at the design level first) are human judgment and always
will be — no AST says whether a consumer needs a seam. Principle 3's
cross-component convergence and principle 5 (do not expose internal structure)
are also out of reach: both need a repo-wide target registry, not a per-file
rule. **Lint checks the shape of a target; a human decides whether it should
exist.**

### `@astryx/require-letter-spacing`

Recommends adding `letterSpacing` when `fontSize` is defined (common design pattern for badges, labels).

**Strict mode only.** Helps catch missing letter-spacing in compact text elements.

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
