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
`configs.strict` / `configs.recommended`, and are not wired into
`eslint.config.js`. Turning one on is one line in `index.js`; the counts below
say what that would cost today.

**Every check automates a numbered check in the [Component Audit
Rubric](https://github.com/facebook/astryx/wiki/Component-Audit-Rubric)'s §2**,
which is the source of truth for what the rule is. Nothing here is a criterion
of its own: a check that could not name its rubric id was removed rather than
kept as a proposal. The rubric records for each check whether an enforcer
exists, and three of these — **T6**, **T7** and **T27** — are marked `manual` or
`semi` with no lint rule, which is the gap this plugin closes.

Shared analysis lives in `theming-target.js`: which `themeProps()` calls land on
an element (spread, through `mergeProps`, through a local `const`, or via
`.className`), which `stylex.props()` arguments it applies, and whether those
declare **paint** (color, background, border, font, radius, shadow), **layout**
(display, position, flex/grid, margin/padding, width/height, transform), or
neither (opacity, transition, cursor). Style objects imported from another
module are read from that module via `stylex-style-source.js`, and
`focusOutlineProps.focusVisible(…)` reads as `stylex.props(…)` plus the ring's
own outline paint — the helper forwards its arguments, so a focusable element
styled through it is not an unstyled one.

#### `@astryx/theming-target-shape`

| Check (messageId)                 | Rubric | What it flags                                                                                                                         | On `packages/` | Proposed tier |
| --------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ------------- |
| `layoutOnlyTarget`                | T7     | A sub-element target on an element whose styles declare no paint property                                                             | 6              | `warn`        |
| `wrapperTarget`                   | T7     | A target on a paint-free `div`/`span` whose only child is an Astryx component — it belongs on that component                          | 4              | `warn`        |
| `unstyledTarget`                  | T7     | A target on an element with no styles at all and nothing wrapped                                                                      | 0              | `error`       |
| `targetOnRenderPropFallback`      | T27    | A target on a fallback element that a `render*` callback renders in place of, so it misses all custom-rendered content                | 0              | `warn`        |
| `inheritableOnRenderPropFallback` | T7/T27 | Inheritable typography/color on such a fallback, where hoisting it to the row target would cover both render paths                    | 0              | `warn`        |
| `underDeclaredState`              | **T6** | The element's styles vary with a prop the target does not pass to `themeProps` — `fooStyles[prop]` with no `prop` in the sibling call | 17             | `warn`        |

**`underDeclaredState` is the one worth having.** T6 is a BLOCK the rubric
detects by grep, with no lint rule, and it records it as "historically the
single most frequent finding" — this is the check that closes that gap. Its 17
hits are a real pre-existing backlog, each needing a human call about which prop
belongs on the target, so it ships at `warn`: an `error` tier would fail CI on
`main`.

**T7's root-target exemption is implemented, not optional.** A component's own
root target is its address rather than a seam anyone chose to add, and there is
nowhere else to put it — 55 layout primitives (Stack, Grid, Divider) have a
layout-only root. Only sub-element targets are checked.

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

**Options:** `allowTargets`, `allowFiles`, `checkRenderPropFallback`.

#### `@astryx/theming-target-name`

| Check (messageId)           | Rubric | What it flags                                                                                                                        | On `packages/` | Proposed tier |
| --------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------ | -------------- | ------------- |
| `appearanceInComponentSlot` | T27    | Target attached to a leaf Astryx component whose last segment names an appearance (`-check` on an `<Icon>`) instead of the component | 2              | `warn`        |
| `stateSubTarget`            | T26    | A target name ending in `-disabled` / `-selected` / `-checked` / …                                                                   | 0              | `error`       |

The component-slot check runs only for **leaf** components (`Icon`,
`CheckboxInput`, `Divider`, `Button`, …; see `DEFAULT_COMPONENT_SLOTS`) and
skips the component's own root target. Both narrowings are deliberate: T27 makes
`{component}-option` the correct name for an option row in every list-like
component, so holding a row primitive to a three-part shape would argue with the
check the rule exists to serve.

`stateSubTarget` reads `-state` as a state segment, but not after `empty`,
`loading`, or `error`: `selector-empty-state` names the placeholder region
itself — an element that exists only in that condition, so its target has
nowhere else to live — rather than a state of a target that exists either way.

**Bad → good:**

```tsx
<Icon icon="check" {...themeProps('selector-check')} />        // ❌ appearance
<Icon icon="check" {...themeProps('selector-option-icon')} />  // ✅ names the component
```

**Options:** `allowTargets`, `allowFiles`, `componentSlots`.

#### `@astryx/themeprops-reflection`

`themeProps()` returns the class token **and** the `data-*` reflection of the
visual props. These are mechanical bugs, not judgment calls: **T12** (no
`className`/`style` beside the spread that carries the target — merge via
`mergeProps()`) and **T26** (state rides as `themeProps` data, never
hand-authored). `@astryx/no-classname-clobber` already covers T12 where a
`stylex.props()` spread is present; these checks cover the `themeProps` shapes
it does not see.

| Check (messageId)        | Rubric | What it flags                                                                                                    | On `packages/` | Proposed tier |
| ------------------------ | ------ | ---------------------------------------------------------------------------------------------------------------- | -------------- | ------------- |
| `droppedStateReflection` | T26    | `className={themeProps('x', {size}).className}` — the `data-*` attributes never render                           | 0              | `error`       |
| `clobberedByLaterProp`   | T12    | `{...themeProps('x')} className={className}` — the later prop overwrites the target, so it never reaches the DOM | 1              | `error`       |
| `bypassedThemeProps`     | T26    | `stableClassName('x')` used to build a theme class by hand, so state can never ride along                        | 7              | `warn`        |
| `classNameOnly`          | T12    | `.className` on a call with no visual props — drops nothing today, becomes the bug tomorrow                      | 4              | `warn`        |
| `handAuthoredState`      | T26    | `data-state`/`data-selected`/… hand-written on an element that already carries a target                          | 0              | `error`       |

`handAuthoredState` only looks at a short list of state attribute names: most
`data-*` attributes in the codebase are identity or query hooks the component's
own JS reads (`data-value`, `data-date`, `data-page`), and routing those through
`themeProps` would change what they mean.

**Options:** `allowDataAttributes`, `allowFiles`.

#### What these rules do NOT check

T1/T3 (tokens), T4/T5 (doc↔source sync) and T33 already have enforcers — the two
Vitest guards and `@astryx/no-hardcoded-styles` — and are not duplicated here.
Whether a target should exist at all is T27's and T7's human half: no AST says
whether a consumer needs a seam, or whether the design should converge instead.
Cross-component convergence needs a repo-wide target registry, not a per-file
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
