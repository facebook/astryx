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
`Principle` column below cites what each check enforces.

**Rules and principles are reconciled as of this PR** — every divergence found
while encoding them was resolved on one side or the other, and the audit is in
the PR description. A divergence is a bug in the rule or a gap in the
principle, not a tolerated state: when one turns up, fix it rather than
recording which side wins.

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

| Check (messageId)                                                 | Principle                                                 | What it flags                                                                                                                                             | On `packages/` | Proposed tier                                      |
| ----------------------------------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | -------------------------------------------------- |
| `layoutOnlyTarget`                                                | P1 — target the element that carries the styling          | A sub-element target on an element whose styles declare no paint property                                                                                 | 5              | `warn`                                             |
| `wrapperTarget`                                                   | P1 + attach to the component                              | A target on a paint-free `div`/`span` whose only child is an Astryx component — it belongs on that component                                              | 4              | `warn` (→ `error` once fixed)                      |
| `unstyledTarget`                                                  | P1 — "if nothing at that spot paints, there is no target" | A target on an element with no styles at all and nothing wrapped                                                                                          | 0              | `error`                                            |
| `layoutOnlyRootTarget` (opt-in: `checkRootTargets`)               | P1                                                        | A component's OWN root target, when the root paints nothing                                                                                               | 55             | off — layout primitives legitimately trip it       |
| `stateVariesOnlyLayout` (opt-in: `checkStateSurface`)             | P1 refinement — the _state seam_ only moves layout        | The target declares runtime state, but that state only moves layout (a `transform`)                                                                       | 0              | `warn` — worth turning on                          |
| `underDeclaredState` (opt-in: `checkStateSurface`)                | P2 — state and size are data on the target                | The element's styles vary with a state the target does not pass to `themeProps`                                                                           | 16             | off — a real backlog, each item needs a human call |
| `targetOnRenderPropFallback`                                      | P4 — prefer inheritance over child targets                | A target on a fallback element that a `render*` callback renders in place of, so it misses all custom-rendered content — principle 4's named anti-pattern | 0              | `warn`                                             |
| `inheritableOnRenderPropFallback`                                 | P4                                                        | Inheritable typography/color on such a fallback, where hoisting it to the row target would cover both render paths                                        | 0              | `warn`                                             |
| `inheritablePropertyOnChild` (opt-in: `checkInheritableHoisting`) | P4, broadly                                               | Any inheritable property on an untargeted descendant of a target-carrying element                                                                         | 111            | off — see below                                    |

**On hoisting inheritable properties (P4).** The broad form of this check —
flag `font*` / `color` / `lineHeight` / `letterSpacing` / `textAlign` /
`textTransform` on any untargeted descendant of a target — is implementable and
measures **111 hits**, but most of them are correct code: a Banner's title and
description (`packages/core/src/Banner/Banner.tsx:460,462`) declare different
typography _because they should differ_, and nothing in the AST distinguishes
that from a declaration begging to be hoisted. It ships off by default, as an
exploration aid rather than a check.

The two default-on P4 checks use a narrower predicate that does not depend on
design intent: a **render-prop fallback**. In
`renderOption ? renderOption(item) : <span {...stylex.props(styles.itemLabel)}>`,
the fallback's typography demonstrably reaches one of two render paths — that
divergence is in the AST, not in anyone's judgment. It is the case principle 4
describes, and a target on such a fallback is the `-label` anti-pattern the
principle names outright.

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
