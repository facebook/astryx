---
schema_version: 4
template_version: 1
kind: system-spec
id: spec:AST-054
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
phase: proposed
owners: [rubyycheung]
affects_architecture:
  [
    architecture:component-theming-surface,
    architecture:icon-resolution-and-component-slots,
    architecture:public-component-api,
    architecture:theme-application,
    architecture:theme-authoring-contract,
    architecture:theme-compilation,
  ]
affects_families: [family:buttons]
affects_contributing: [contributing:api-conventions]
affects_consumer_docs: [theme, Icon]
---

# Theme-defined Icon capabilities system spec

## Intent

Icon libraries do not all work the same way. One may provide outline and filled
versions. Another may use solid, duotone, or color. Weight may be a name, one of
several numbers, a continuous numeric range, or unavailable.

`Icon` should support those differences without forcing every library into one
model:

```tsx
<Icon icon="search" size="compact" appearance="duotone" weight={600} />
```

The three optional props have separate jobs:

- `size` controls the icon box;
- `appearance` selects a supplied visual version, such as outline or duotone; and
- `weight` selects a supplied thickness or weight.

The installed icon capability contracts determine which values type-check. The
active theme and selected icon determine which supplied version renders. Omitting
any prop is valid.

## Compatibility examples

This contract is library-neutral, but it must cover materially different public
icon models:

- Material Symbols uses a continuous numeric weight axis and a separate fill axis.
- Phosphor uses named weights that include thin, regular, bold, fill, and duotone.
- Lucide exposes numeric stroke width through its library API.
- Heroicons has a sparse matrix: 24px outline assets and 16px, 20px, and 24px
  solid assets.
- Fluent UI System Icons supplies regular and filled versions broadly and lighter
  versions for a subset.

These examples explain why Astryx supports exact values, parameterized numeric
ranges, sparse size-specific versions, and theme-defined appearance names. A
parameterized integration owns how a validated number reaches its library; Astryx
does not reinterpret it as stroke width or another library-specific setting.

## Public model

### Capability contracts

Theme integrations declare their supported icon values once in one reusable,
grouped capability contract. Conceptually:

```tsx
const capabilities = defineIconCapabilities({
  sizes: {
    compact: {default: '14px'},
    display: {default: '32px'},
  },
  appearances: ['outline', 'filled'],
  weights: {values: [400, 500, 600]},
});
```

A continuous library may declare a numeric range instead:

```tsx
const capabilities = defineIconCapabilities({
  weights: {range: {min: 100, max: 700, default: 400}},
});
```

The final exported names require normal API review, but the public structure is
one grouped contract rather than unrelated declarations. Generated types, docs,
runtime themes, and built themes all derive from that same contract.

All installed contracts compose into one application capability set. A custom size
name has one canonical default dimension in that set. Repeating the same name with
the same default is valid; repeating it with a different default is a capability or
build error. That canonical default remains available even when the active theme
uses another contract. Appearance and weight declarations form admitted unions;
an active theme or icon may support only a subset because their supplied defaults
make that mismatch safe.

A theme uses a contract, may override size dimensions, and supplies its icon
entries. The nearest active theme override for a size name wins. Without one,
Astryx uses the application capability set's canonical default. Existing fixed
`icons` entries remain valid:

```tsx
defineTheme({
  iconCapabilities: {
    contract: capabilities,
    sizeOverrides: {compact: '16px'},
  },
  icons: {
    search: <SearchIcon />,
  },
});
```

### Three terms used in this spec

- An **icon version** is either a fixed React node or a pure parameterized icon
  component supplied by an integration.
- A **parameterized version** receives either a validated requested numeric weight
  or its range's declared default when weight is omitted, then maps that number to
  its own library API, such as a variable-font axis or `strokeWidth`. Astryx passes
  the admitted value but does not interpret or mutate it.
- An **icon entry** is either one fixed version or an adaptive tree of supplied
  branches. Every branch has a default that is always present. A default may be
  another adaptive branch for later axes, and every path ends at an icon version.

Adaptive entries may nest branches by size, appearance, and weight in the order
that matches the supplied library. They are not required to support every value
admitted by the capability contract. Conceptually:

```tsx
const outline = {
  default: <SearchOutline400 />,
  byWeight: {600: <SearchOutline600 />},
};

const search = {
  default: outline,
  byAppearance: {
    outline,
    filled: {default: <SearchFilled400 />},
  },
  bySize: {
    compact: {default: <SearchCompact />},
  },
};
```

A sparse library may put size branches inside an appearance branch instead. For
example, a Heroicons-style `solid` branch may contain exact 16px, 20px, and 24px
versions while its `outline` branch has only a 24px default. The resolver supports
both this shape and appearance branches nested inside size branches.

A continuous library instead supplies a pure parameterized component for its
admitted range. The component—not Astryx—maps the validated requested value or the
range's declared default to that library's rendering API.

## Size

Astryx continues to provide these names and default dimensions:

- `xsm` = 12px
- `sm` = 16px
- `md` = 20px
- `lg` = 24px

Themes may intentionally override those dimensions, but they cannot remove the
names. An application that does not opt into an override renders exactly as it
does today.

A capability contract may add names such as `compact` or `display`. Every added
name declares one theme-independent default dimension. A theme may override that
dimension; when it does not, Astryx uses the declared default. This keeps the
value safe when the active theme changes without falling back to an unrelated
name such as `md`.

An icon entry may provide artwork for an exact size name. Matching uses the name,
not the resolved dimension, so an override of `compact` still selects the
`compact` branch. Astryx uses that branch when it exists. When it does not, Astryx
renders the entry's normal branch in the resolved box size. That is normal behavior
and does not produce a warning.

## Appearance

Appearance selects a visual version supplied by the icon entry. Each capability
contract chooses its own names, such as `outline`, `filled`, `solid`, `duotone`,
`color`, or `regular`.

`appearance` is intentionally separate from component `variant` and React
`style`. Astryx consumes the prop and does not forward it to the DOM or treat it
as CSS `appearance`.

If an explicit appearance is unavailable in the current branch, Astryx enters that
branch's supplied default and continues resolving later axes. A requested weight
may therefore still select a version inside the default appearance branch. The
fallback and diagnostic behavior follows the normative matrix below.

## Weight

A capability contract may declare either:

- exact numeric or named values, such as `400 | 500 | 600` or
  `"regular" | "bold"`; or
- a continuous numeric range with a minimum, maximum, and default value inside the
  range.

Exact values provide literal types and autocomplete. A range accepts numbers,
validates its bounds at runtime, and declares the in-range number used when `weight`
is omitted. A requested in-range value is passed unchanged to the integration's
supplied parameterized version. Different installed themes may declare different
sets; public callsite types describe their combined admitted values because the
active theme can change at runtime.

When every installed contract uses exact values, `weight` retains their literal
union. Installing any range necessarily widens the application's `weight` type to
`number`, so TypeScript cannot reject every out-of-range literal or preserve a
literal-only completion list in that application. Runtime range validation and
contract-aware documentation remain authoritative.

If the current branch does not provide an exact weight or parameterized range, or
a number is outside its declared range, Astryx uses that branch's supplied default
as defined by the normative matrix below. Astryx never clamps, converts, or decides
that weight means CSS `font-weight`, `stroke-width`, or any other library-specific
setting.

## Fixed icon sources

A fixed React node, a directly supplied icon component, a fixed process-wide
registration, or a fixed namespaced extension icon continues to render normally.
`size` still controls its box. Because the source has only one supplied version,
`appearance` and `weight` do not change it.

An explicit unsupported request uses the normative fallback and diagnostic matrix
below. Astryx never edits the SVG to imitate the request.

## Component and family defaults

Adding an icon role to a component does not require repeating theme values or
per-icon defaults.

A component family may own one shared icon-default policy. The policy may provide
fixed defaults or derive them from documented component inputs. For example, the
Button family defines its control-size-to-icon-size relationship once, and every
Button icon role reuses it. Fixed appearance or weight defaults can live in the
same policy. Only a documented exception overrides the shared policy.

Each optional request resolves in this order:

1. an explicit `Icon` request;
2. the nearest component- or family-owned default policy; then
3. the final default:
   - `md` for an Icon outside an Astryx component-owned icon slot; or
   - the current adaptive branch's supplied default for appearance or weight.

A component-owned default is evaluated like an explicit request during icon
selection. If the current branch cannot satisfy it, resolution enters that branch's
supplied default and continues to any later axis. Runtime warnings are reserved for
explicit caller requests so existing fixed themes do not warn on every
component-owned icon.

Components do not automatically gain public icon appearance or weight props.
Each component or family must deliberately expose caller control when that choice
is caller-owned and cannot be derived from component behavior.

## Resolution order

For a semantic icon name, Astryx first resolves:

1. one icon entry from the active theme, then a process-wide fixed registration,
   then the built-in fixed default; and
2. the box size from an explicit request, component/family policy, or standalone
   `md`, using the nearest active theme override when present and otherwise the
   application's canonical default dimension for that size name.

Astryx then traverses the selected adaptive entry:

1. Size, appearance, and weight begin unresolved.
2. At the current branch, Astryx looks for exact children for unresolved axes. When
   more than one exact child is available at that branch, priority is size, then
   appearance, then weight.
3. After an exact child is selected, that axis is resolved and is not evaluated
   again. Astryx descends and retries the still-unresolved axes, so a size branch may
   live inside an appearance branch or an appearance branch inside a size branch.
4. When the current branch has no exact child for any unresolved request, Astryx
   descends into its supplied default and retries there.
5. At a fixed leaf, an unresolved appearance or weight is unsupported. An unresolved
   size means no size-specific artwork exists, so the leaf renders in the resolved
   box without a warning. A validated requested numeric range counts as an exact
   weight match and renders through its supplied parameterized component. When
   weight is omitted, that component receives the range's declared default.

For example, if `duotone` is unavailable but the default appearance branch supplies
weight `600`, a request for `appearance="duotone" weight={600}` reports only the
appearance mismatch and still selects weight `600`. If an exact appearance branch
ends in one fixed version, a later unsupported weight keeps that version and reports
the weight mismatch; resolution does not return to a broader branch.

After an exact match, later fallback stays inside that match. It does not return to
root branches or another registry source.

After one registry source supplies an entry, Astryx does not fill missing versions
from another source. A child theme that replaces an icon entry replaces it as a
unit; nested version maps do not merge implicitly across theme or registry
boundaries. This prevents one rendered icon from mixing icon families.

## Existing component icon paths and programmatic lookups

Existing component-owned icon rendering and `renderIconSlot` use the same entry
resolver whenever they resolve a semantic icon name. A directly supplied React node
follows the fixed-source behavior. Existing behavior for a missing or unresolved
namespaced icon key does not change.

AST-054 does not create or expand a separate theme-level `componentIcons` registry.
That documented but unimplemented subsystem remains owned by
`architecture:icon-resolution-and-component-slots` and requires its own authority
and implementation before it can become a dependency of this feature.

Existing one-argument programmatic calls remain valid and return the same React
nodes as today. Request-aware forms accept optional size, appearance, and weight
and use the shared resolver. Their exact function signatures require normal API
review, but the compatibility rule does not: existing calls require no migration.

## Failure and diagnostics

Capability mismatch alone never throws during rendering. This matrix is the
normative fallback and diagnostic behavior:

| Situation                                                                               | Rendered result                                                                                                  | Development reporting            |
| --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| Request omitted                                                                         | documented default                                                                                               | none                             |
| Explicit appearance or weight is admitted but unsupported by the current branch         | best exact sibling match under traversal, otherwise that branch's supplied default; later axes remain resolvable | one deduplicated console warning |
| Component/family policy value is unsupported                                            | that branch's supplied default                                                                                   | none                             |
| Explicit appearance or weight targets a fixed source                                    | the fixed version                                                                                                | one deduplicated console warning |
| Exact size-specific artwork is absent                                                   | root/default leaf in the resolved box                                                                            | none                             |
| Untyped runtime request is outside the application capability contract or numeric range | the same fallback as an unsupported request                                                                      | one deduplicated console warning |
| Runtime data bypasses authoring validation and contains a malformed icon entry          | skip that registry source and continue normal source precedence                                                  | one deduplicated console warning |

Production emits no capability-mismatch console warning.

When every installed contract uses exact values, a statically known exact value
outside the application contract is a TypeScript error. An installed numeric range
widens the application type to `number`, so range bounds are enforced at runtime.
Untyped callers use the runtime behavior above. Malformed capability contracts,
conflicting custom-size defaults, missing branch defaults, invalid ranges, and
malformed theme overrides fail capability, theme-authoring, or static-build
validation before the theme is used. Runtime and built themes apply the same
validation contract and preserve the same resolved capability metadata.

## What Astryx never generates

Every rendered result comes from a supplied fixed or parameterized icon version.
Passing a validated number to an integration's supplied parameterized component is
selection, not synthesis. Astryx never edits SVG fill, stroke, color, paths,
transforms, filters, or geometry to imitate a missing appearance or weight.

## Non-goals

- Define universal appearance or weight names.
- Require every icon to support every value admitted by its capability contract.
- Clamp, interpolate, synthesize, or mutate icon versions.
- Add icon appearance or weight props to every Astryx component automatically.
- Create a new component-icon registry or public inspection API.
- Change semantic icon names, color, direction, accessibility, interaction,
  registry-source precedence, or existing missing-key behavior.
- Equivalent internal implementations remain valid when they satisfy this
  contract.

## Requirements

- **FR1 — Requests remain optional and independently evaluated.** Size,
  appearance, and weight do not rewrite one another. A missing appearance may enter
  its default branch and still honor a later weight request. Omitting any request is
  valid.
- **FR2 — One grouped application capability set owns admitted values.** Types,
  docs, runtime themes, and built themes derive from the same reusable contracts.
  Duplicate custom-size names must have identical defaults; conflicting defaults
  fail validation.
- **FR3 — Every size has a safe canonical dimension.** Astryx's four existing names
  keep their current defaults. Every added name declares one application-wide
  default that remains available under any active theme. The nearest theme may
  override dimensions but may not remove admitted names.
- **FR4 — Weight supports discrete and continuous libraries.** A contract declares
  exact numeric or named values, or one numeric range with an in-range default. A
  requested in-range number or the omitted-request default is passed unchanged to
  an integration-supplied pure parameterized component. Any installed range widens
  the application weight type to `number`; exact-only applications keep literal
  unions. Astryx defines no universal scale or library-specific mapping.
- **FR5 — Every adaptive branch has a supplied default.** Fixed entries remain
  valid. Branches may nest axes in either order. An adaptive default may itself
  contain later unresolved axes, and every path ends at a supplied fixed version or
  a parameterized version whose range declares an omitted-weight default.
- **FR6 — Capability mismatch does not throw during rendering.** Fallback and
  reporting follow the normative matrix above. Development console warnings are
  limited to explicit caller or untyped runtime requests; policy fallback is silent
  so fixed themes do not warn on every icon.
- **FR7 — Families do not repeat shared defaults.** One component/family policy may
  provide fixed defaults or derive them from component inputs for every owned icon
  role. Explicit caller intent wins; documented exceptions may override the policy.
- **FR8 — Missing size artwork uses the current default.** An exact branch keyed by
  the requested size name is used wherever it appears in the adaptive tree. If no
  exact size branch is found before a leaf, that leaf renders in the resolved box
  without a warning.
- **FR9 — Resolution narrows without requiring one nesting order.** Source selection
  happens first. Within one entry, exact matches consume each axis at most once;
  size, appearance, then weight break ties at one branch. Still-unresolved axes may
  match deeper branches, and fallback never returns above an exact match.
- **FR10 — Sources and theme entries stay isolated.** Resolution does not combine
  versions from multiple registry sources or implicitly merge replacement entries
  across theme inheritance.
- **FR11 — Fixed sources remain compatible.** Direct icon components, fixed React
  nodes, fixed registrations, and fixed namespaced extensions keep rendering and
  ignore appearance and weight without SVG mutation. Only explicit unsupported
  requests produce the development warning.
- **FR12 — Existing icon paths share resolution.** Existing one-argument lookups keep
  their behavior. Request-aware forms, `renderIconSlot`, and component-owned
  semantic icon rendering use the same result as `Icon` for the same request and
  active theme. This spec does not create a separate `componentIcons` registry.
- **FR13 — Validation happens before theme use.** Capability authoring,
  `defineTheme`, runtime compilation, and static theme builds reject malformed
  branches, ranges, overrides, and conflicting size defaults consistently and
  preserve equivalent capability metadata.
- **FR14 — Existing presentation behavior stays unchanged.** Version selection does
  not change resolved box geometry, color, alignment, accessibility, focus,
  interaction, direction, component state, or style-prop precedence beyond an
  intentional theme size override.
- **FR15 — Resolution stays synchronous and environment-independent.** Equivalent
  server/client and runtime/built inputs select the same supplied fixed or pure
  parameterized version without DOM measurement, computed styles, browser globals,
  network requests, or mutable render callbacks.

### Platform support

- Supported floor: every platform that currently supports `Icon` and normalized
  themes.
- Unsupported capability requests use the supplied fallback instead of throwing.
- Representative browser evidence covers theme switching, nested themes,
  hydration, fixed and adaptive entries, diagnostics, stable geometry, styling,
  and accessibility.

## Current-state impact

Today `Icon` supports only `xsm | sm | md | lg`, uses static default dimensions,
has no appearance or weight prop, and accepts fixed theme icon entries.

This proposal is additive. Existing fixed entries, omitted optional props,
one-argument programmatic lookups, and applications without size overrides keep
their current behavior. Theme authors deliberately choosing a different dimension
for an existing size also deliberately choose the resulting layout change.

### Relationship to prior Astryx work

- [Issue #44](https://github.com/facebook/astryx/issues/44) established the need
  for themeable icons across font and SVG libraries, including filled, outline,
  and variable-axis models.
- The draft in
  [PR #6244](https://github.com/facebook/astryx/pull/6244) proposes size-aware
  registry entries with a required default and closed `bySize` map. Its proposed
  `spec:AST-034` identifier already belongs to the current Theme family build
  behavior spec, so that draft cannot become authority under its present id.
  AST-054 incorporates its size-specific use case and is the proposed canonical
  owner of the broader size, appearance, weight, family-policy, and resolver
  contract.
- [PR #6025](https://github.com/facebook/astryx/pull/6025) and
  [PR #6028](https://github.com/facebook/astryx/pull/6028) were earlier closed
  attempts to specify and implement theme-owned Icon sizes.
- [Issue #1267](https://github.com/facebook/astryx/issues/1267) explored CSS-driven
  SVG mutation. AST-054 instead requires supplied fixed or parameterized versions.
- [Issue #5058](https://github.com/facebook/astryx/issues/5058) records a current
  theme-build registry bug that any implementation carrying richer entries must not
  preserve.

AST-054 is the proposed canonical owner for size-specific entry resolution. The
size-aware draft may inform review, but it must use another record id or defer to
AST-054; the two drafts must not become competing authority.

`architecture:component-theming-surface` INV14 currently requires every
theme-extensible prop axis to have a safe baseline independent of the active theme.
Acceptance of this spec amends that rule for all three Icon axes:

- A `size` extension is admitted only through a public icon capability contract that
  supplies a canonical theme-independent dimension. The active theme may override
  it; without an override, the contract default is the no-match baseline.
- `appearance` and `weight` are non-layout visual-selection axes. After one registry
  source is selected, its always-present default branch is their deterministic
  baseline even though that branch belongs to the active theme. This exception is
  safe only because FR14 prohibits appearance or weight fallback from changing box
  geometry, composition, accessibility, or interaction.

While this spec remains draft, the current INV14 still governs.

Implementation also requires coordinated amendments to the affected current
records:

- theme authoring and compilation carry grouped capability contracts, size
  overrides, adaptive entries, validation, and equivalent runtime/build metadata;
- theme application makes the nearest active theme's dimension override available
  while preserving the contract baseline;
- icon resolution covers direct components, fixed and adaptive registry entries,
  namespaced extensions, existing component-owned icon paths, and request-aware
  programmatic lookups;
- the public API record admits the optional caller-owned `appearance` and `weight`
  requests and reviews exported names and widened public types;
- the API-conventions record replaces its closed `Icon.size` example with the
  capability-contract rule for size and the selected-entry-default exception for
  non-layout appearance and weight axes;
- the current `component:Icon` contract changes its closed size concept, size
  resolution, and caller-owned public requests;
- the Button-family contract preserves explicit intent and one family-owned policy
  rather than per-role duplication; and
- Icon and theme consumer documentation explain admitted values, defaults,
  diagnostics, and sparse library support.

The owners of each affected current record must review its amendment. This
specification pull request changes no runtime or package and adds no Changeset.

## Verification

| Contract   | Verification                                             | Representative states                                                                                                                           | Mutation or failure expectation                                                                            |
| ---------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| FR1–FR4    | Public type and capability-contract tests                | omitted props; duplicate/conflicting size defaults; active theme using another contract; exact-only versus range-widened weight types           | arbitrary values type-check in exact-only apps, a range lacks a renderer, or size is undefined             |
| FR5–FR10   | Resolver and theme-inheritance matrix tests              | size→appearance and appearance→size nesting; missing appearance then supported weight; fixed exact match then later request; source replacement | a default is absent, an unresolved axis is skipped, fallback crosses a selected boundary, or entries merge |
| FR6, FR11  | Development/production diagnostic tests                  | explicit versus policy mismatch; direct component; fixed registration; out-of-range weight; malformed runtime entry                             | rendering throws, policy use spams warnings, production warns, or malformed data reaches React             |
| FR7, FR12  | Family, existing icon-path, hook, and programmatic tests | `renderIconSlot`; explicit request; derived Button mapping; shared default; old and request-aware lookup                                        | roles repeat policy, explicit intent loses, or public paths disagree                                       |
| FR13, FR15 | Theme authoring/build and server/client parity tests     | conflicting contract; malformed branch; runtime theme; built theme; nested theme; hydration; pure parameterized component                       | invalid input reaches rendering or equivalent inputs select different versions                             |
| FR14       | Browser presentation and accessibility evidence          | theme size override; fallback version; selected/pressed/loading component states; direction and focus                                           | unintended geometry, naming, color, interaction, or style precedence changes                               |

## Decision log

### DEC-1 — Themes use one grouped capability contract

**Reference:** `spec:AST-054/DEC-1`
**Decider:** `rubyycheung`, `2026-10-02`

Reusable contracts compose into one application capability set containing added
size names and canonical defaults, appearance names, and either exact weight values
or numeric ranges with in-range defaults backed by integration-supplied
parameterized components. Public
types, docs, runtime, and build derive from it. Conflicting defaults for one custom
size name fail validation. Installing any numeric range necessarily widens the
application weight type to `number`; exact-only applications keep literal unions.

Rejected: unrelated declarations that can disagree, ambiguous custom-size defaults,
one universal appearance list, and one universal weight scale.

### DEC-2 — Size names are overridable tokens with safe defaults

**Reference:** `spec:AST-054/DEC-2`
**Decider:** `rubyycheung`, `2026-10-02`

Astryx's existing names keep their current default dimensions and may be
deliberately overridden by a theme. Every added size has one canonical application
default that remains available under any active theme. The nearest active theme
override wins; otherwise the canonical default applies.

Rejected: permanently locking all dimensions, removing existing names, an
undefined result after theme switching, and fallback to an unrelated size name.

### DEC-3 — Capability mismatch falls back without throwing

**Reference:** `spec:AST-054/DEC-3`
**Decider:** `rubyycheung`, `2026-10-02`

An unsupported appearance enters the current branch's supplied default and later
axes continue resolving there. Unsupported weight uses that branch's supplied
default version. Explicit mismatches produce a deduplicated development warning;
production silently renders the fallback. Policy defaults fall back silently. A
missing size-specific branch uses the current leaf in the resolved box.

Rejected: render-time exceptions, clamping, inferred weights, SVG mutation, and
warnings for normal size-artwork fallback.

### DEC-4 — Component families own shared default policies

**Reference:** `spec:AST-054/DEC-4`
**Decider:** `rubyycheung`, `2026-10-02`

A family policy may provide fixed icon defaults or derive them from component
inputs, such as Button size. Every owned role reuses it; explicit caller intent
wins and only documented exceptions override it.

Rejected: repeating defaults for every component or icon role and treating the
existing Button size mapping as one fixed value.

### DEC-5 — Resolution narrows in one direction

**Reference:** `spec:AST-054/DEC-5`
**Decider:** `rubyycheung`, `2026-10-02`

Resolution selects one source, then one box dimension, then traverses that source's
adaptive branches. At one branch, size, appearance, then weight break ties; after
one exact match, still-unresolved axes may match deeper branches in either nesting
order. A matched axis is never re-evaluated, and fallback never returns above an
exact match. Existing programmatic calls remain compatible while request-aware
paths share this resolver.

Rejected: mixing icon families, returning to root after an exact adaptive match,
and changing existing one-argument lookups.

### DEC-6 — `appearance` selects a supplied visual version

**Reference:** `spec:AST-054/DEC-6`
**Decider:** `rubyycheung`, `2026-10-02`

The optional `appearance` prop expresses caller-owned standalone Icon intent that
cannot always be derived from the semantic name. The name avoids collision with
component `variant` and React `style`; Astryx consumes it rather than forwarding
it as CSS.

Rejected: `variant`, `style`, `iconStyle`, and `fill`, which are ambiguous or too
narrow for the supported library models.

### DEC-7 — Non-layout axes use the selected entry's default

**Reference:** `spec:AST-054/DEC-7`
**Decider:** `rubyycheung`, `2026-10-02`

An Icon size extension always has a theme-independent canonical dimension because
size affects layout. Appearance and weight cannot affect geometry, composition,
accessibility, or interaction, so their safe baseline is the always-present default
branch of the already-selected icon entry. This is the explicit Icon exception to
the current theme-independent-baseline rule for non-layout visual axes.

Rejected: requiring one global appearance or weight default across unrelated icon
libraries and allowing appearance or weight fallback to change layout.

## Open questions

- **OQ1 — What are the final exported helper, theme-field, and request-aware
  lookup names?** (`human-api`) The public `size`, `appearance`, and `weight` prop
  names and their behavior are settled. API review may adjust only the helper,
  grouped theme-field, and programmatic lookup spellings without changing the
  contract decided here.
