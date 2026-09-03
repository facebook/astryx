---
schema_version: 1
template_version: 1
kind: system-spec
id: spec:AST-010
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-08-31
phase: accepted
owners: [cixzhang]
affects_architecture: [architecture:public-component-api]
affects_families: [family:layout-regions]
affects_contributing: []
affects_consumer_docs: [Resizable]
---

# Percentage and CSS math useResizable configuration system spec

## Intent

A person resizing a panel should get the same panel size that the handle presents
and assistive technology announces. Builders may configure an initial size in
pixels or as a percentage. Bounds additionally accept recursive CSS `min()` and
`max()` expressions over pixel and percentage leaves, so common fluid floors and
ceilings do not require CSS-only clamping. Every user-selected size remains pixels
so pointer, keyboard, persistence, and programmatic behavior stay predictable.

This spec preserves the released meaning of `defaultSize: 'N%'` when no
`containerRef` is supplied: resolve once against `window.innerWidth` (or the
1200px server fallback), then continue as pixels. Supplying `containerRef`
changes only the basis used by percentage configuration: the container's
content-box active axis replaces the viewport. It does not create a persistent
relative sizing mode.

Numeric inputs are pixels. Resolved public outputs remain pixels. Shipped source,
tests, and consumer docs remain the evidence for current behavior until the
implementation and verification below land; the draft `component:Resizable`
record is updated alongside that implementation.

## Non-goals

- Preserving a percentage ratio after pointer, keyboard, or programmatic resize.
- Automatically distributing remaining space or requiring independently sized
  regions to total 100%.
- Supporting CSS constraint syntax beyond non-negative pixel and percentage leaves
  composed with `min()` and `max()`: no other units, `calc()`, `clamp()`,
  arithmetic, `var()`, or other functions.
- Adding percentage snap points or percentage collapse thresholds.
- Adding controlled size state; current controlled collapse behavior is
  unchanged.
- Widening `resize()` beyond its released numeric pixel input.
- Changing the persisted state shape or adding a relative-size field.
- Widening SideNav's simplified `defaultWidth`, `minWidth`, and `maxWidth`
  configuration. That integration requires a separate component decision because
  SideNav owns its root and handle.
- Changing LayoutPanel's ownership of structure, scrolling, inset, or divider
  presentation.

## Requirements

- **FR1 — Percentage configuration uses an explicit basis.** Without
  `containerRef`, a percentage `defaultSize` MUST resolve once against
  `window.innerWidth`, or 1200px when `window` is unavailable, preserving the
  released fallback. With `containerRef`, it MUST resolve once against that
  container's measured content-box active axis. After either resolution, the
  selected size is pixels and MUST NOT scale when the viewport or container
  changes.
- **FR2 — Direction selects the container basis.** With `containerRef`,
  horizontal resizing MUST use the container's content-box inline size and
  vertical resizing MUST use its content-box block size. RTL may reverse pointer
  delta, but MUST NOT change the percentage basis. Without `containerRef`, the
  compatibility basis remains `window.innerWidth` regardless of direction.
- **FR3 — Interactions remain pixel-based.** Numeric defaults and every result of
  a percentage default resolve to pixels. Pointer, keyboard, snap, collapse,
  expand, persistence, callback, and programmatic resize paths MUST continue to
  read and write pixel selections exactly as the released API does. No
  interaction may create or preserve a percentage-selected mode.
- **FR4 — Mixed and composed bounds remain valid.** Builders MAY combine pixel
  and percentage values across `defaultSize`, `minSize`, and `maxSize`. Unified
  bounds MAY recursively compose those leaves with CSS `min()` and `max()` up to
  eight function levels. Numeric and `Npx` leaves remain pixels. Every percentage
  leaf resolves against the same viewport or container basis as FR1; basis
  dependency is recursive, so a percentage nested anywhere in an expression makes
  that bound re-resolve whenever the basis changes. Re-resolved bounds clamp the
  existing pixel selection; they MUST NOT scale it proportionally. If the resolved
  minimum exceeds the resolved maximum, development MUST warn and the maximum MUST
  win, preserving the released `Math.min(max, Math.max(min, size))` ordering and
  guaranteeing finite, non-`NaN` geometry.
- **FR5 — Effective geometry stays synchronized.** The effective selected pixel
  size, LayoutPanel or caller-rendered size, persisted expanded value, and
  ResizeHandle's `aria-valuenow`, `aria-valuemin`, and `aria-valuemax` MUST describe
  the same resolved geometry. CSS-only clamping that leaves hook state outside the
  painted bounds is prohibited. Existing controlled-collapse callbacks remain an
  explicit exception: they report a rejected collapse or expand intent without
  claiming that the controlled owner changed the rendered size.
- **FR6 — Basis changes update only percentage-dependent constraints.** Once a
  percentage default has initialized the selected pixel size, a viewport or
  container resize MUST NOT re-resolve that default. Bounds with a percentage leaf
  at any nesting depth MUST re-resolve and clamp the selected pixel size. A
  basis-only layout change MUST NOT fire an interaction callback or otherwise claim
  that a person selected a new size.
- **FR7 — Pointer gestures preserve released behavior.** Pointer deltas continue
  from the selected pixel size. Percentage-dependent bounds MUST use one stable
  basis during a gesture; a basis change during the gesture takes effect after the
  gesture ends so the handle does not move away from the pointer.
- **FR8 — Keyboard, snap, and collapse semantics continue.** Arrow-key steps,
  Shift+Arrow steps, Home, End, collapse thresholds, and snap points remain
  pixel-based. Collapse retains the expanded pixel size, and expand restores that
  pixel size subject to the currently resolved bounds.
- **FR9 — Persistence remains pixel-only.** Existing positive plain numbers and
  `{size, isCollapsed}` entries MUST continue to restore as pixel choices. A
  legacy plain `0` MUST retain its current meaning: collapsed with no saved
  expanded size when collapse is enabled, otherwise no usable saved size. New
  percentage configuration MUST use the current persisted pixel shape; no
  percentage or relative-mode field is added.
- **FR10 — Callbacks report resolved pixels.** `onSizeChange` MUST continue to
  receive resolved pixel numbers for user interactions and released programmatic
  transitions. Initialization, hydration correction, viewport resize, container
  resize, and bounds-only re-clamping MUST NOT be reported as user interaction.
- **FR11 — Single and multi-region configurations share the contract.** A
  multi-region call MUST use one optional container and axis for all regions.
  Regions remain independently pixel-selected; this change MUST NOT add balancing,
  ratio preservation, or a 100% total invariant.
- **FR12 — Invalid configuration has safe deterministic fallbacks.** The released
  `defaultSize` input remains a non-negative finite number, an exact non-negative
  finite `Npx` string, or an exact `N%` string from 0% through 100%. Unified
  `minSize` and `maxSize` accept those same leaves plus full-match recursive CSS
  `min()` and `max()` expressions, bounded to eight function levels. Empty
  functions, malformed separators or parentheses, trailing input, other units,
  `calc()`, `clamp()`, arithmetic, `var()`, negatives, out-of-range percentages,
  and non-finite values are invalid. An invalid `defaultSize` MUST use 250px before
  normal bounds clamping; an invalid `minSize` or `minSizePx` MUST use 50px; and an
  invalid `maxSize` or `maxSizePx` MUST use unbounded `Infinity`. Explicit
  `maxSizePx: Infinity` remains valid for compatibility because a shipped template
  uses it. Development MUST warn for every fallback; production MUST use the same
  fallback without warning. After initialization, an invalid raw value MUST NOT
  directly replace a persisted or otherwise legal selected pixel size; a
  fallback-normalized bound may affect that size only through normal clamping.

### Public API requirements

- **API1 — `containerRef` opts into a container basis, not a relative mode.**
  Single- and multi-region config MAY accept
  `containerRef?: React.RefObject<HTMLElement | null>`. When omitted, percentage
  configuration uses the released viewport basis. When supplied, every percentage
  default or bound uses that container's content-box active axis. The ref is
  caller-owned because only the caller can identify the intended layout container;
  the hook MUST NOT infer a panel or ResizeHandle ancestor.
- **API2 — Direction is explicit.** Single-region config MAY accept
  `direction?: 'horizontal' | 'vertical'`, defaulting to `horizontal`.
  Multi-region config's existing top-level `direction` supplies every region's
  axis. ResizeHandle direction and hook direction MUST agree; the implementation
  MUST make a mismatch detectable in development. Direction affects the
  container basis only when `containerRef` is present.
- **API3 — Bounds use one restricted Resizable vocabulary.** Add the public
  `ResizableConstraintValue` type and use it for flat `minSize` and `maxSize`:

  ```ts
  type ResizableConstraintValue =
    number | `${number}px` | `${number}%` | `min(${string})` | `max(${string})`;
  ```

  Runtime parsing remains authoritative for expression interiors and MUST match
  the complete input. Functions are lowercase CSS `min()` or `max()` only, accept
  one or more comma-separated expressions, recurse up to eight function levels,
  and may contain only non-negative finite `Npx` or 0–100 `N%` leaves. Partial
  parses, trailing text, malformed separators or parentheses, other units,
  negatives, non-finite values, `calc()`, `clamp()`, arithmetic, `var()`, and
  every other function are invalid. Keep the released `defaultSize?: SizeValue`
  type and its existing number / exact `Npx` / exact `N%` runtime behavior; CSS
  math is constraint-only. Do not add parallel `defaultSizePercent`,
  `minSizePercent`, or `maxSizePercent` props.

- **API4 — Pixel aliases are exactly mutually exclusive with unified bounds.**
  `minSizePx` and `maxSizePx` remain supported but become deprecated. TypeScript
  MUST encode each old/new pair as an exact union, equivalent to:

  ```ts
  type MinSizeConfig =
    | {minSize?: ResizableConstraintValue; minSizePx?: never}
    | {minSize?: never; minSizePx?: number};
  type MaxSizeConfig =
    | {maxSize?: ResizableConstraintValue; maxSizePx?: never}
    | {maxSize?: never; maxSizePx?: number};
  ```

  Old-only callers remain unchanged. If JavaScript, an `any` cast, or an object
  spread supplies both, the unified `minSize` or `maxSize` MUST win and development
  MUST emit a clear conflict/deprecation warning naming the ignored alias.

- **API5 — Resolved output and state stay pixels.** `ResizableRegion.size`,
  `onSizeChange`, internal `ResizableProps` geometry, and persisted state remain
  pixel numbers. Existing `width={region.size}`, arithmetic, persistence, and ARIA
  callsites MUST continue to type-check and behave as before. Controlled-collapse
  callbacks keep their released intent-reporting behavior: when the owner rejects
  a requested state change, the rendered size remains owner-controlled even
  though the callback reported the requested transition.
- **API6 — Programmatic resize remains pixels.** `resize(size: number)` retains
  its released signature and selects a clamped pixel size. Percentage strings are
  unsupported and MUST remain a type error; runtime-invalid, negative, or
  non-finite values warn in development and do not replace the last legal pixel
  selection.

### Invalid configuration behavior

| Input                                                      | Accepted values                                                                                  | Invalid fallback                | Development behavior                                         | Production behavior                |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------- | ------------------------------------------------------------ | ---------------------------------- |
| `defaultSize`                                              | non-negative finite number; exact non-negative finite `Npx`; exact `N%` from 0–100               | 250px, then normal bounds clamp | warn and use fallback                                        | use same fallback without warning  |
| `minSize`                                                  | `ResizableConstraintValue`; full-match runtime grammar from API3                                 | 50px                            | warn and use fallback                                        | use same fallback without warning  |
| `minSizePx`                                                | non-negative finite number                                                                       | 50px                            | warn and use fallback                                        | use same fallback without warning  |
| `maxSize`                                                  | `ResizableConstraintValue`; full-match runtime grammar from API3                                 | unbounded `Infinity`            | warn and use fallback                                        | use same fallback without warning  |
| `maxSizePx`                                                | non-negative finite number or explicit `Infinity`                                                | unbounded `Infinity`            | warn for invalid values; do not warn for explicit `Infinity` | use same fallback without warning  |
| old/new bound pair supplied together through untyped input | unified value is authoritative                                                                   | ignore deprecated alias         | warn and name the ignored alias                              | unified value wins without warning |
| resolved minimum above resolved maximum                    | both values are individually valid, including after recursive CSS math and percentage resolution | maximum wins                    | warn and use released clamp order                            | use same ordering without warning  |

A fallback repairs configuration; it is not a new user selection. After
initialization, an invalid raw value never directly replaces persisted or otherwise
legal selected pixel state. Effective fallback bounds may affect that state only
through normal clamping.

### Platform support

- Supported feature/engine floor: every browser supported by Astryx Core with
  `ResizeObserver`; the shared observer remains the one runtime owner for a
  supplied container.
- Before a supplied container has a positive measurement, percentage configuration
  MAY use the released deterministic 1200px basis as a temporary fallback. The
  first valid measurement resolves the percentage default to its final initial
  pixel size and resolves percentage bounds without persisting or announcing the
  temporary fallback.
- Browser evidence: real Chromium MUST verify nested containers, horizontal and
  vertical axes, pointer and keyboard resizing, live basis changes, both canonical
  expressions (`max(40%, 333px)` and `min(400px, 10%)`) across wide and narrow
  containers, and the unchanged viewport-compatibility and pixel paths. jsdom
  geometry stubs alone are not sufficient.
- SSR: without `containerRef`, percentage defaults preserve the released 1200px
  server basis and client viewport initialization behavior. With `containerRef`,
  the server uses the same temporary 1200px basis until the first client
  measurement. Hydration MAY make one documented correction, but MUST NOT write the
  temporary fallback to storage or fire `onSizeChange` for that correction.

## Current-state impact

Current `main` accepts a percentage string only for `defaultSize`. It resolves
that value once against `window.innerWidth`, with a 1200px server fallback, and
stores the result as pixels. It does not follow later viewport changes. This
released behavior remains the compatibility path when `containerRef` is omitted.

`minSizePx` and `maxSizePx` cannot express percentage bounds. Builders can apply a
CSS percentage maximum, but CSS then clamps paint without clamping hook state.
ResizeHandle publishes the hook's `_size` as `aria-valuenow`, so the separator can
announce a value larger than the panel a person sees.

The proposed `containerRef` passes both gates in current
[AST-002](../AST-002/spec.md): the caller owns which element is the intended
percentage basis, and the hook cannot derive that choice safely. Keeping all
selected state in pixels makes the result predictable under AST-002 FR8 and avoids
an invalid split between selected state, paint, persistence, callbacks, and ARIA
under AST-002 FR10.

The open implementation spike in
[PR #5783](https://github.com/facebook/astryx/pull/5783) demonstrates
container-relative defaults and bounds and supplies browser measurements. It is
evidence for this proposal, not the governing contract. Before implementation is
accepted it must preserve one-time default resolution, pixel-only interaction and
persistence, vertical-axis behavior, multi-region behavior, collapse/expand, and
SSR requirements in this spec.

This change reviews the current owning records:

- `architecture:public-component-api` owns the additive API, stable pixel output,
  deprecation, and migration boundary;
- `family:layout-regions` continues to delegate resize state and interaction to
  useResizable and ResizeHandle while LayoutPanel consumes only resolved size;
- `spec:AST-002` requires the new caller-owned basis to remain understandable,
  predictable, and correct in every supported state;
- shipped Resizable source, tests, and consumer docs remain the evidence for
  current pointer, keyboard, collapse, snap, persistence, handle, and ARIA
  behavior until implementation lands; and
- the draft `component:Resizable` record and Resizable consumer docs change when
  the implementation ships, not in this specification pull request.

### Persistence representation

The persisted representation does not change:

```ts
interface PersistedResizableState {
  size: number | null;
  isCollapsed: boolean | null;
}
```

A percentage default becomes a pixel selection before it is persisted. A
persisted pixel selection wins over `defaultSize` on restore and is clamped by the
currently resolved bounds. A legacy plain `0` remains a collapse marker with no
expanded size, so expand falls back to the configured default; when collapse is
disabled it supplies no usable saved size. Pointer, keyboard, collapse, expand, and
numeric programmatic resize continue to persist pixels. Basis changes never write
a percentage or relative intent.

### Implementation requirements

1. Preserve the current no-ref resolver for valid percentage defaults:
   `window.innerWidth` on the client and 1200px when `window` is unavailable.
2. Parse the complete value. Keep `defaultSize` on its released atomic grammar;
   parse unified bounds with the bounded recursive API3 grammar; validate deprecated
   aliases as pixel numbers only. Apply FR12's 250px/50px/`Infinity` fallbacks
   before clamping and warn only in development. Preserve explicit
   `maxSizePx: Infinity` as valid legacy input.
3. Encode each unified/deprecated bound pair as the exact API4 union. At runtime,
   prefer a unified bound over a simultaneously supplied alias and warn in
   development with the ignored alias's name.
4. When `containerRef` is supplied, measure its content box on the configured axis
   and observe it through Astryx's shared ResizeObserver.
5. Resolve a percentage default once into selected pixel state. Re-resolve only
   bounds with a percentage dependency anywhere in their parsed expression when
   the viewport or container basis changes, then clamp the selected pixel state so
   paint, persistence, and ARIA stay synchronized.
6. Preserve the released maximum-wins clamp order when a resolved minimum exceeds
   its maximum, warn in development, and never emit `NaN` or invalid geometry.
7. Keep pointer, keyboard, snap, collapse, expand, callback, persistence, and
   `resize(number)` behavior pixel-based. Do not add a relative mode or widen
   `resize()` to strings. Invalid later configuration must not replace persisted or
   otherwise legal selected state.
8. Preserve all current controlled-collapse and legacy persistence behavior not
   explicitly changed by this spec.
9. If multiple hooks must observe the same container, update the shared observer
   to support independent callbacks and remove only the unmounting callback. Keep
   that reusable prerequisite independently reviewable.
10. Update `component:Resizable`, `useResizable.doc.mjs`, aggregate Resizable docs,
    stories, release notes, and focused tests in the implementation pull request.
11. Keep SideNav's simplified resize configuration pixel-only until a separate
    integration spec or compatibility decision authorizes widening it.

## Verification

| Contract         | Verification                                                          | Representative states                                                                                              | Mutation or failure expectation                                                                                                                          |
| ---------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR1, API1        | Focused hook tests plus Chromium geometry                             | no ref at 1200px viewport; nested container; first positive measurement                                            | no-ref default changes semantics, or supplied ref measures viewport/panel/handle ancestor                                                                |
| FR2, API2        | Axis tests and Chromium interaction                                   | horizontal/vertical; LTR/RTL; reversed handle; no-ref vertical compatibility                                       | vertical container sizing reads width, or compatibility stops using `innerWidth`                                                                         |
| FR3, FR6-FR8     | Interaction and basis-change tests                                    | percentage default before/after drag; viewport/container resize; Arrow, Shift+Arrow, Home, End; collapse/expand    | selected size preserves a ratio, basis change scales it, or existing pixel interactions change                                                           |
| FR4              | Mixed-bound, nested-expression, basis-change, and invalid-order tests | canonical `max(40%, 333px)` / `min(400px, 10%)`; variadic nesting; recursive percentage dependency; min above max  | parser drops nested basis dependency, bounds use different bases, selection scales instead of clamps, maximum does not win, or geometry becomes invalid  |
| FR5              | Hook, LayoutPanel, persistence, and ResizeHandle assertions           | below/at/above max; basis shrink; controlled collapse intent                                                       | effective paint, state, storage, and ARIA diverge, or controlled rejection changes owned state                                                           |
| FR9              | Persistence compatibility tests                                       | positive number; legacy zero; legacy object; percentage default; corrupt entry                                     | stored shape changes, a percentage is persisted, or old state changes meaning                                                                            |
| FR10, API5       | Callback tests                                                        | initialization; hydration correction; basis-only re-clamp; pointer/keyboard/programmatic change                    | callback receives a percentage or reports a non-interaction layout correction                                                                            |
| FR11             | Multi-region and shared-observer tests                                | two regions on one container; another hook observing the same node                                                 | regions use different bases, selected ratios are introduced, or one subscription removes another                                                         |
| FR12             | Production/development parser and state-preservation tests            | malformed functions; unsupported functions/units/arithmetic; depth 8/9; invalid rerender; explicit legacy Infinity | fallback differs by build, warning occurs in production, invalid input replaces legal state, unbounded recursion, or any path produces `NaN`             |
| API3, API4, API6 | Type, runtime validation, and development-warning tests               | restricted constraint type; recursive grammar; old-only aliases; exact-union conflicts; `resize('50%')`            | unsupported top-level strings type-check, duplicate pairs type-check, alias overrides unified input, exact parsing is skipped, or resize accepts strings |
| Platform/SSR     | Server render, hydration test, and Chromium evidence                  | no ref; ref not measured; hidden/zero container; first positive measurement                                        | 1200px fallback changes, temporary fallback persists, or correction fires `onSizeChange`                                                                 |
| Compatibility    | Existing Resizable, LayoutPanel, SideNav, and template suites         | current pixel-only callsites and no-ref percentage default                                                         | existing numeric configuration, percentage fallback, output, interaction, or persistence changes                                                         |

### Completion criteria

This spec moves from `accepted` to `shipped` only when:

- no-ref percentage defaults preserve one-time `window.innerWidth` resolution and
  the 1200px SSR fallback without tracking viewport resize;
- supplied-container percentage defaults resolve once against the content-box
  active axis, then remain pixel selections through basis changes and every
  interaction path;
- bounds with percentage leaves at any nesting depth re-resolve in both basis modes
  and clamp existing pixel state without proportionally scaling it; pure-pixel
  expressions do not subscribe to basis changes;
- pointer, keyboard, snap, collapse, expand, persistence, callbacks, and
  `resize(number)` preserve released pixel semantics;
- old-only `minSizePx` and `maxSizePx` callers remain unchanged, each old/new
  pair is an exact mutually exclusive TypeScript union, and untyped conflicts
  prefer the unified value with a clear ignored-alias warning;
- exact parsing preserves `defaultSize`'s released atomic grammar and accepts
  unified bounds only as `ResizableConstraintValue`: non-negative finite numbers,
  complete `Npx` / 0–100 `N%` strings, or recursive lowercase `min()` / `max()`
  expressions up to eight levels; every other function, unit, arithmetic form,
  malformed input, and deeper expression uses the documented 50px or `Infinity`
  fallback without replacing persisted/legal selected state, while explicit legacy
  `maxSizePx: Infinity` remains valid;
- inverted resolved bounds warn in development, deterministically choose the
  maximum, and never produce `NaN` or invalid geometry;
- mixed bounds keep effective state, paint, storage, and separator ARIA aligned,
  while controlled-collapse callbacks preserve released intent reporting;
- single and multi-region subscriptions coexist with every other observer of the
  same element;
- focused tests fail against the old implementation and pass against the new one;
- real Chromium proves both container-basis behavior and unchanged compatibility
  and pixel paths; and
- `component:Resizable` and consumer docs describe the shipped contract in the
  same pull request as the implementation.

## Decision log

### DEC-1 — Percentages configure pixel state; they do not create relative state

**Reference:** `spec:AST-010/DEC-1`
**Decider:** `cixzhang`, `2026-08-31`

Preserve the released no-ref percentage default: resolve once against
`window.innerWidth`, use 1200px when `window` is unavailable, and then behave as
pixels. An optional caller-owned `containerRef` changes the basis for percentage
defaults and bounds to the container's content-box active axis. It does not make a
selected size responsive.

All user interaction, programmatic `resize()`, collapse/expand, callbacks, and
persistence remain pixel-only. Percentage bounds may re-resolve with their basis
and clamp that pixel state. This keeps the API predictable and every represented
state valid under `spec:AST-002` while avoiding a second persistent sizing mode.

Rejected: preserving a percentage ratio after drag or widening `resize()` to
accept percentage strings. Both would change released pixel-based interaction and
add unit-aware state, persistence, callback, and restoration semantics that the
caller did not request.

### DEC-2 — Initial size and bounds share one flat configuration vocabulary

**Reference:** `spec:AST-010/DEC-2`
**Decider:** `cixzhang`, `2026-08-31`

Add flat `minSize` and `maxSize` alongside `defaultSize`. Numbers remain static
pixels; atomic strings accept finite non-negative `Npx` or `N%`; and mixing units
across the initial size and bounds is valid. This gives builders one predictable
set of flat size props without parallel percentage props. DEC-3 amends only the
accepted bound-string grammar; `defaultSize` remains unchanged.

Preserve `minSizePx` and `maxSizePx` as deprecated compatibility aliases so
old-only callers behave unchanged. TypeScript encodes each old/new pair as an exact
mutually exclusive union. If untyped JavaScript, an `any` cast, or an object spread
supplies both, the unified `minSize` or `maxSize` wins and development warns with
the ignored alias's name. The explicit migration target must not be silently
overridden by a deprecated value hidden in a spread; this keeps the runtime result
predictable and avoids an ambiguous configuration under `spec:AST-002`.

Invalid inputs use deterministic role-specific fallbacks in every build: 250px for
`defaultSize`, 50px for either minimum spelling, and unbounded `Infinity` for
either maximum spelling. Development additionally warns. Explicit
`maxSizePx: Infinity` remains valid because that legacy form is shipped in an
Astryx template. If a resolved minimum exceeds its maximum, development warns and
the maximum wins under the released clamp order. These rules keep malformed input,
conflicts, and inverted bounds from producing `NaN` or replacing persisted/legal
selected state.

### DEC-3 — Bounds accept bounded CSS min/max composition

**Reference:** `spec:AST-010/DEC-3`
**Amendment author:** `freddymeta`, `2026-09-03`
**Approval:** exact-head spec-owner approval required before merge

Keep released `defaultSize` typing and runtime behavior unchanged. Restrict flat
`minSize` and `maxSize` to the Resizable-specific `ResizableConstraintValue`:
numbers remain static pixels; atomic strings accept finite non-negative `Npx` or
0–100 `N%`; and bounds additionally accept lowercase, full-match, recursive CSS
`min()` / `max()` expressions up to eight function levels. No `calc()`, `clamp()`,
arithmetic, `var()`, other function, or other unit is accepted.

The template-literal type rejects unrelated top-level strings while the runtime
parser remains authoritative for non-negativity, finiteness, and recursive
function interiors. This keeps shared `SizeValue` unchanged and adds only the two
CSS comparisons needed for fluid constraints.

## Open questions

None. Changing the released 1200px server fallback or adding a persistent
relative-size mode requires a separate decision.
