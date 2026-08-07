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
`eslint.config.js` — the criteria they encode ("Principles for authoring
theming targets" in the wiki, plus paint-not-layout and
`{parent}-{position}-{component}`) are still being settled. Measured counts
against `packages/` and the proposed tier for each check are below; turning one
on is one line in `index.js`.

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

| Check (messageId)                                     | What it flags                                                                                                | On `packages/` | Proposed tier                                      |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | -------------- | -------------------------------------------------- |
| `layoutOnlyTarget`                                    | A sub-element target on an element whose styles declare no paint property                                    | 5              | `warn`                                             |
| `wrapperTarget`                                       | A target on a paint-free `div`/`span` whose only child is an Astryx component — it belongs on that component | 4              | `warn` (→ `error` once fixed)                      |
| `unstyledTarget`                                      | A target on an element with no styles at all and nothing wrapped                                             | 0              | `error`                                            |
| `layoutOnlyRootTarget` (opt-in: `checkRootTargets`)   | A component's OWN root target, when the root paints nothing                                                  | 55             | off — layout primitives legitimately trip it       |
| `stateVariesOnlyLayout` (opt-in: `checkStateSurface`) | The target declares runtime state, but that state only moves layout (a `transform`)                          | 0              | `warn` — worth turning on                          |
| `underDeclaredState` (opt-in: `checkStateSurface`)    | The element's styles vary with a state the target does not pass to `themeProps`                              | 16             | off — a real backlog, each item needs a human call |

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

| Check (messageId)           | What it flags                                                                                                                        | On `packages/` | Proposed tier |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | -------------- | ------------- |
| `appearanceInComponentSlot` | Target attached to a leaf Astryx component whose last segment names an appearance (`-check` on an `<Icon>`) instead of the component | 3              | `warn`        |
| `missingPosition`           | `{parent}-{component}` with no position segment, on a composed component                                                             | 0              | `warn`        |
| `stateSubTarget`            | A target name ending in `-disabled` / `-selected` / `-checked` / …                                                                   | 0              | `error`       |

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
visual props. These are mechanical bugs, not judgment calls.

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
