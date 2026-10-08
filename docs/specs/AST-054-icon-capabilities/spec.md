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

`Icon` supports libraries whose supplied artwork varies by size, appearance, and
weight without forcing them into one universal vocabulary:

```tsx
<Icon icon="search" size="compact" appearance="duotone" weight={600} />
```

The optional requests have separate jobs: `size` controls the icon box,
`appearance` selects a supplied visual version, and `weight` selects a supplied
thickness. Omitting any request is valid.

A theme supplies one presentation policy for registry icons and explicitly adapted
direct product icons. The policy may choose default and per-size appearance and
weight. It may also choose appearance, but never weight, for selected, pressed,
disabled, and loading states. Final size selects only the default weight; an explicit
`Icon weight` remains authoritative.

An **icon role** is the stable place or purpose of an icon inside a component: a
Button leading icon, a SideNav item icon, a Selector selected marker, or an input
status icon. A **state** is one finite literal condition declared by a role. A role
may declare the exact literals `selected`, `pressed`, `disabled`, and `loading`, or
another finite set; no universal state list is implied. Component maintainers own
each role's vocabulary and precedence. Components decide when states change and
continue to own source, placement, interaction, and accessibility. Themes own visual
presentation.

A product library can adapt an export once so `<Icon icon={ProductIcon}>` receives
the active theme request without a registry key. Ordinary direct components remain
fixed, and Astryx never forwards unknown presentation props to them or the DOM.

## Public model

### Capability contracts

A library declares one grouped capability contract:

```tsx
const capabilities = defineIconCapabilities({
  sizes: {
    compact: {default: '14px'},
    display: {default: '32px'},
  },
  appearances: ['outline', 'filled', 'duotone'],
  weights: {values: [400, 500, 600]},
});
```

A continuous integration declares a validated numeric range instead:

```tsx
const capabilities = defineIconCapabilities({
  weights: {range: {min: 100, max: 700}},
});
```

Installed registry integrations and direct-icon adapters contribute their bound
contracts to one application capability set. Generated public types, documentation,
inspection, runtime themes, and built themes derive from that set. Appearance and
weight declarations form admitted unions; individual sources may support a subset
because every adaptive branch and adapter supplies a safe default.

A custom size name has one canonical application default dimension. Repeating a
name with the same default is valid; a conflicting default fails validation. The
canonical default remains available under every active theme.

A contract default means no theme-level request for that axis. The selected source's
required supplied default renders. Astryx does not invent a universal appearance or
weight default.

### Theme presentation and inheritance

A theme uses one contract, may override admitted dimensions, and may provide one
serializable presentation policy:

```tsx
defineTheme({
  iconCapabilities: {
    contract: capabilities,
    sizeOverrides: {compact: '16px'},
    presentation: {
      default: {appearance: 'outline', weight: 500},
      bySize: {
        compact: {weight: 600},
        display: {appearance: 'duotone', weight: 400},
      },
      byState: {
        selected: {appearance: 'filled'},
        pressed: {appearance: 'duotone'},
        disabled: {appearance: 'outline'},
        loading: {appearance: 'duotone'},
      },
    },
    roleSizeOverrides: {
      'button-leading': 'compact',
    },
  },
  icons: {search},
});
```

The installed role declarations for this example admit the exact state literals
`selected`, `pressed`, `disabled`, and `loading`.

`byState` is a partial record keyed by public `ComponentIconStateName` and its
values contain only `appearance`. `ComponentIconStateName` is the conditional union
of finite literal states from metadata-bearing roles; `true` entries contribute no
state key. Undeclared keys do not type-check. State never supplies weight. Final size
selects the `default` plus matching `bySize` weight before source fallback. An
explicit public `Icon weight` is the only override.

Theme inheritance is deterministic:

- an absent `presentation` inherits the nearest outer presentation;
- an explicit presentation object replaces the inherited presentation atomically;
- `presentation: null` clears inherited presentation and resets every axis to the
  contract defaults;
- `roleSizeOverrides` merges per role; an absent role inherits, a size replaces that
  role, and `null` clears it so component/family default size applies; and
- runtime themes and built themes flatten these rules identically.

The nearest active theme dimension override wins. Without one, the application
capability set's canonical dimension applies.

### Adaptive entries

An icon version is either a fixed React node or a pure parameterized component
supplied by an integration. An adaptive icon entry is a tree with optional size,
appearance, and weight branches. Every branch has a supplied default, and every path
ends at a supplied version:

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
    duotone: {default: <SearchDuotone400 />},
  },
  bySize: {
    compact: {default: <SearchCompact />},
  },
};
```

A parameterized version receives an admitted numeric weight unchanged and maps it
to its own library API. Astryx never interprets the value as CSS `font-weight`,
`stroke-width`, or another library-specific setting.

### Direct product-icon adaptation

A product library binds its capability contract and request mapping once:

```tsx
const adaptProductIcon = createIconAdapter({
  capabilities,
  resolveProps(request) {
    return {
      appearance: mapAppearance(request.appearance),
      weight: mapWeight(request.weight),
    };
  },
});

export const ProductIcon = adaptProductIcon(ProductIconImpl);
```

The adapter's contract joins the application capability set. Its export remains
assignable to `IconType` and carries typed participation metadata through an opaque
Astryx-owned channel rather than public SVG props.

Astryx validates a request against the application set, then narrows it to the
adapter's bound contract. The adapter receives only admitted values. An axis the
adapter does not support is omitted, so the wrapped library's declared default
applies. Request provenance remains attached to the omission: an explicit caller
appearance/weight mismatch produces one deduplicated development warning plus
inspection metadata; theme-policy fallback records inspection metadata without a
console warning. A malformed mapping result produces one deduplicated development
warning and renders the wrapped component without mapped presentation props, using
its normal declared default. Adapter failure never forwards unknown data or throws
from capability resolution.

### Component participation

The approved public `ComponentIconSlotMap` remains the owner of component icon role
names. A role value is either the existing `true` marker or metadata with a finite
literal state vocabulary. `true` remains a valid stateless, nonparticipating role:
it continues to use `componentIcons` source mapping but receives no AST-054 role size
or state appearance. Public `ComponentIconStateName` conditionally extracts states
only from metadata-bearing entries. Conceptually:

```ts
export interface ComponentIconSlotMap {
  'selector-selected-option': true;
  'button-leading': {
    states: 'pressed' | 'disabled' | 'loading';
  };
  'selector-selected-marker': {
    states: 'selected' | 'disabled';
  };
}

type StatesOf<T> = T extends {states: infer State extends string}
  ? State
  : never;

export type ComponentIconStateName = StatesOf<
  ComponentIconSlotMap[keyof ComponentIconSlotMap]
>;
```

Existing `{slot: true}` module augmentations continue to type-check and contribute no
state names. Generated metadata for each metadata-bearing role supplies its
component/family default size and deterministic precedence containing only that
role's state literals. Exact helper and field spellings remain under API review; the
conditional public union and compatibility rule do not.

A metadata-bearing role computes active conditions using that precedence and sends
zero or one effective `ComponentIconStateName` to Icon resolution. There is no
multi-state appearance merge. The component owns state transitions; the theme maps
the one effective state label to appearance.

A component opts into role sizing and state presentation only through a
metadata-bearing map value. Undeclared roles and `true` roles do not participate in
those capabilities. The `componentIcons` contract maps every approved slot, including
a `true` role, to `IconName | null` before icon entry resolution; it does not become a
state-transition resolver.

A component/family policy may choose source, provide or derive default size from
component inputs, and define state transitions. Every owned role reuses that policy
unless a documented structural exception applies. It never supplies appearance or
weight.

A participating component's contract-default path is pixel-equivalent to the same
component without participation metadata. Its default-theme presentation preserves
that baseline. Undeclared components, `true` roles, and themes that omit capability
fields are byte- and pixel-compatible.

Components do not automatically gain public appearance or weight props. A component
exposes caller control only when the visual request is caller-owned and cannot be
derived from its documented role and state behavior.

Caller-supplied `selectedIcon` and `pressedIcon` values are explicit source
overrides. Without one, the normal source remains and theme state appearance provides
the visual state.

## Resolution order

All component slots, hooks, programmatic reads, registry icons, and adapted direct
icons use this sequence:

1. **Source and state.** A component applies an explicit caller source override,
   otherwise resolves its `ComponentIconSlotMap` role through `componentIcons`, then
   selects one icon source. A metadata-bearing role applies its deterministic state
   precedence and reports zero or one effective state; a `true` role reports none. A
   semantic icon entry resolves from active theme, then process-wide registration,
   then built-in default. A direct component keeps its identity.
2. **Size.** An admitted explicit `Icon size` wins, followed by a theme role
   override for a metadata-bearing role, component/family default, then standalone
   `md`. Theme-authored dimensions and role overrides must be admitted before theme
   use. An untyped consumer size outside the application contract is ignored, emits
   one deduplicated development warning,
   and continues through the remaining size cascade. The resolved size's nearest
   theme dimension override or canonical dimension defines the box. An exact
   size-artwork branch is used when present; otherwise the root branch renders in the
   resolved box.
3. **Appearance request.** Appearance resolves explicit `Icon appearance`, theme
   appearance for the one effective state, theme `default` plus matching `bySize`
   appearance, then the selected adaptive branch or adapter default.
4. **Weight request.** Weight resolves explicit `Icon weight`, theme `default` plus
   matching `bySize` weight, then the selected adaptive branch or adapter default.
   State never changes weight.
5. **Version.** Within the selected source and size branch, Astryx selects exact
   appearance and then exact weight or a supplied parameterized range. Unsupported
   appearance enters that branch's supplied default and still evaluates weight.
   Unsupported weight uses that branch's supplied default version.

Each axis is evaluated once. After an exact size or appearance match, later fallback
stays inside that match. A selected registry source is atomic: Astryx never fills
missing branches from another source or merges nested entry trees across theme or
registry boundaries.

Fixed nodes, fixed registry entries, fixed namespaced icons, and ordinary unadapted
direct components ignore theme appearance and weight without warning. An explicit
unsupported caller request still produces the normal development diagnostic.
Adapted direct components instead receive the admitted subset supported by their
bound contract.

A missing or unresolved namespaced key passed to `Icon` renders nothing.
`getIcon()` returns no node for that key, and `getExtendedIcon()` uses its
caller-supplied fallback. Capability resolution does not change those behaviors.

One-argument programmatic reads remain node-valued and keep their documented
behavior. Request-aware reads and the active-theme hook accept optional size,
appearance, and weight and return the same result as `Icon` for equivalent input.

## Failure and diagnostics

Capability mismatch never throws during rendering.

| Situation                                                                              | Result                                              | Development reporting                             |
| -------------------------------------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------- |
| Request omitted or theme field absent                                                  | contract/source default                             | none                                              |
| Statically known value outside the application contract                                | rejected before rendering                           | type or authoring error                           |
| Untyped runtime appearance/weight is unadmitted                                        | selected source default; value is not delivered     | one deduplicated warning plus inspection metadata |
| Untyped consumer size is unadmitted                                                    | ignore it; continue role/family/`md` cascade        | one deduplicated warning plus inspection metadata |
| Explicit appearance/weight is admitted but unsupported by the selected adaptive branch | branch default; later axes continue                 | one deduplicated warning plus inspection metadata |
| Theme appearance/weight is unsupported by the selected adaptive branch                 | branch default; later axes continue                 | inspection metadata only                          |
| Exact size artwork is absent                                                           | root branch in the resolved box                     | none                                              |
| Theme appearance/weight targets a fixed or ordinary direct source                      | fixed source                                        | none                                              |
| Explicit appearance/weight targets a fixed or ordinary direct source                   | fixed source                                        | one deduplicated warning plus inspection metadata |
| Active-theme registry entry is malformed                                               | skip it and continue normal registry precedence     | one deduplicated warning plus inspection metadata |
| Process-wide registry entry is malformed                                               | skip it and continue to built-in default            | one deduplicated warning plus inspection metadata |
| Namespaced key passed to `Icon` is unresolved                                          | render nothing                                      | none                                              |
| Namespaced key passed to `getIcon` is unresolved                                       | return no node                                      | none                                              |
| Namespaced key passed to `getExtendedIcon` is unresolved                               | caller-supplied fallback                            | none                                              |
| Explicit caller axis is admitted globally but unsupported by the adapter               | omit that axis; wrapped library default             | one deduplicated warning plus inspection metadata |
| Theme-policy axis is admitted globally but unsupported by the adapter                  | omit that axis; wrapped library default             | inspection metadata only                          |
| Adapter mapping result is malformed                                                    | wrapped component without mapped presentation props | one deduplicated warning plus inspection metadata |
| Role-size override is unadmitted or targets a `true` role                              | reject theme before use                             | validation error                                  |
| Participating component reports undeclared role/state or bypasses shared resolution    | output is nonconforming                             | static/inventory conformance failure              |

Production emits no capability-mismatch console warnings. Inspection continues to
report requested, admitted, supported, selected, omitted, and fallback values.
Malformed contracts, conflicting custom-size defaults, invalid ranges, missing
branch defaults, and invalid theme data fail validation before theme use.

## What Astryx never generates

Every result comes from a supplied fixed or parameterized icon version. Passing a
validated number to an integration's parameterized component is selection, not
synthesis. Astryx never edits SVG fill, stroke, color, paths, transforms, filters, or
geometry to imitate a missing appearance or weight.

## Non-goals

- Define universal appearance or weight names.
- Require every source to support every value in the application capability set.
- Clamp, interpolate, synthesize, or mutate icon artwork.
- Forward presentation data to ordinary direct components or DOM nodes.
- Let state presentation choose weight.
- Add per-role or per-component appearance/weight theme objects.
- Move source, state transitions, placement, interaction, or accessibility into the
  theme.
- Remove explicit `selectedIcon` or `pressedIcon` compatibility overrides.
- Replace `componentIcons` name/null authority.
- Require a `ComponentIconSlotMap` value of `true` to carry metadata or participate in
  role size/state appearance.
- Change missing or unresolved namespaced-key behavior for `Icon`, `getIcon`, or
  `getExtendedIcon`.
- Add another Theme, icon provider, or active-theme selection path.

## Requirements

- **FR1 — Explicit requests remain optional and independent.** Size, appearance,
  and weight do not rewrite one another. Final size selects only the theme's default
  weight; explicit `Icon weight` remains authoritative. Missing appearance may enter
  its default branch and still honor weight.
- **FR2 — One grouped application capability set owns admitted values.** Registry
  integrations and direct adapters contribute bound contracts. Types, docs,
  inspection, runtime themes, and built themes derive from their composition.
- **FR3 — Every admitted size has a safe canonical dimension.** `xsm`, `sm`, `md`,
  and `lg` retain 12px, 16px, 20px, and 24px defaults. Added names declare one
  application-wide default; nearest theme overrides may replace dimensions but not
  remove names.
- **FR4 — Weight supports exact and continuous libraries.** A contract declares
  exact numeric/named values or one numeric range. An admitted number reaches the
  integration unchanged. Astryx defines no universal scale or mapping.
- **FR5 — Every adaptive branch has a supplied default.** Fixed entries remain
  valid. Defaults may contain later-axis branches; every path ends at a supplied
  fixed or parameterized version.
- **FR6 — Capability mismatch does not throw.** The normative matrix controls
  fallback and reporting. Explicit caller/runtime mismatch warns once in development;
  theme-policy fallback is inspection-only; production stays quiet. An unadmitted
  untyped consumer size follows the documented size fallback rather than failing
  render.
- **FR7 — Families share derived structural defaults.** One family policy may choose
  source, provide or derive default size, declare state transitions, and define
  documented structural exceptions. Every owned role reuses it. Family policy never
  supplies appearance or weight.
- **FR8 — Missing size artwork uses the root branch.** The root version renders in
  the resolved box without warning.
- **FR9 — Resolution narrows once.** Source, size, appearance, and weight resolve in
  that order. Exact adaptive matches own later fallback.
- **FR10 — Sources stay isolated.** Resolution does not combine registry sources or
  implicitly merge replacement entry trees.
- **FR11 — Fixed and adapted direct sources are distinct.** Ordinary direct
  components remain fixed and ignore theme appearance/weight. Only adapter-produced
  direct components receive an admitted request through the opaque participation
  contract. Fixed nodes, registrations, and namespaced icons remain valid. A missing
  namespaced key renders nothing in `Icon`, returns no node from `getIcon`, and uses
  the caller-supplied fallback in `getExtendedIcon`.
- **FR12 — Slots, hooks, and programmatic APIs share resolution.**
  `ComponentIconSlotMap` owns roles and keeps `true` as a valid stateless value;
  `componentIcons` chooses `IconName | null` before entry resolution. One-argument
  reads remain compatible; request-aware reads and hooks match `Icon`.
- **FR13 — Authoring validation happens before theme use.** Capability composition,
  theme authoring, runtime compilation, and static builds reject malformed branches,
  ranges, unadmitted dimensions or role-size overrides, presentations, and
  conflicting defaults consistently. This does not change FR6's untyped consumer
  runtime fallback.
- **FR14 — Structure and default pixels remain compatible.** Undeclared components,
  `true` roles, and themes that omit capability fields are byte- and pixel-compatible.
  A participating component's contract-default path is pixel-equivalent to its
  nonparticipating baseline. Opt-in theme presentation may choose supplied artwork
  without changing box geometry, color, alignment, accessibility, interaction,
  direction, state transitions, placement, focus, or style-prop precedence except an
  explicit theme dimension/role-size rule.
- **FR15 — Resolution is synchronous and environment-independent.** Equivalent
  server/client and runtime/built inputs select the same supplied version without
  DOM measurement, computed styles, browser globals, network requests, or mutable
  render callbacks.
- **FR16 — One theme policy owns size defaults and state appearance.** `default` and
  `bySize` may supply appearance and weight. `byState` may supply appearance only.
  Explicit public requests win; state never changes weight.
- **FR17 — Registry and adapted direct sources receive equivalent requests.** Both
  consume the same resolved size/appearance/weight intent and apply source-local
  sparse fallback. Fixed sources ignore policy requests as defined above.
- **FR18 — Direct adaptation is safe and total.** The adapter's bound contract joins
  the application set. Only admitted, adapter-supported axes reach it; unsupported
  axes are omitted. Explicit caller mismatch warns once in development, while
  theme-policy fallback is inspection-only. Malformed mapping warns in development
  and renders the wrapped component with its declared default, without unknown-prop
  leakage.
- **FR19 — Metadata-bearing role size has stable precedence and inheritance.** Size
  resolves explicit request, theme override for a metadata-bearing role,
  component/family default, then `md`. A `true` role has no role-size override. Role
  maps merge per key through theme inheritance; `null` clears one inherited override.
- **FR20 — Metadata-bearing roles own a finite typed state vocabulary.** A
  `ComponentIconSlotMap` value of `true` stays stateless and contributes no state.
  Metadata-bearing values declare literals; public `ComponentIconStateName` and theme
  `byState` keys conditionally derive as their union. A role's precedence contains
  only its own states and emits zero or one effective state. Themes map that state to
  appearance. Explicit caller source overrides remain compatible; placement and
  accessibility remain component-owned.
- **FR21 — Theme inheritance and environment parity are exact.** Absent presentation
  inherits, an explicit object replaces atomically, and `null` resets to contract
  defaults. Source/built themes, nested themes, hydration, and theme switching remain
  equivalent.
- **FR22 — Role/state metadata generates one visual inventory.** The inventory marks
  `true` roles as stateless/nonparticipating. For every metadata-bearing role it shows
  source mode, default/resolved size, finite state vocabulary and precedence,
  effective state, appearance, and weight under each theme. Types, docs, inspection,
  runtime, and builds use the same declarations.
- **FR23 — Participation and conformance are explicit.** Only metadata-bearing
  `ComponentIconSlotMap` values opt into role size and state appearance; `true`
  remains valid and nonparticipating. Checks flag undeclared states, shared-path
  bypass, hardcoded visual state, dropped role size, missing inventory coverage, or a
  contract-default result that differs from the nonparticipating pixel baseline.

### Platform support

- Every platform that supports `Icon` and normalized themes is supported.
- Browser evidence covers theme switching, nested themes, hydration, fixed/adaptive
  registry entries, ordinary/adapted direct icons, role size, deterministic states,
  explicit overrides, inventory views, stable structure, and accessibility.
- Compile-time evidence covers admitted unions/ranges, adapter contract composition,
  slot augmentation, and invalid theme data.

## Current-state impact

The released compatibility surface includes `xsm | sm | md | lg`, 12/16/20/24px
defaults, fixed theme entries, direct component mode, shared and namespaced registry
keys, and one-argument reads. Capability participation preserves those paths.

`architecture:icon-resolution-and-component-slots` is the canonical owner of
`ComponentIconSlotMap`, `componentIcons` name/null meaning, and slot-to-name
precedence. The slot-map value contract accepts the original `true` marker and
metadata-bearing values; `true` stays stateless and nonparticipating. Capability
resolution follows source selection and does not create a competing role map. Under
INV8, source, state transitions, transforms, placement, color, and accessibility
remain component-owned. A metadata-bearing opted-in role permits a theme default
size and theme appearance for its one effective state; no other ownership moves.

Size-specific entry resolution has exactly one canonical owner. AST-054 either owns
the rule or delegates to another authoritative record; the system never has two
competing definitions.

Theme compilation preserves normalized capability, presentation, role-size, and
entry metadata so source and built themes resolve identically. Theme authoring,
compilation, application, public API, Icon, participating component/family records,
and consumer documentation each retain their existing ownership boundary while
implementing the requirements assigned here.

Ordinary direct exports, undeclared components, and `true` roles remain
nonparticipants. Product libraries participate by adapting exports once;
metadata-bearing component roles participate with a pixel-equivalent contract-default
path.

## Verification

| Contract         | Evidence                                                   | Representative states                                                                                                                                        | Mutation or failure signal                                                                                                                  |
| ---------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| FR1–FR5          | Public type and capability-contract tests                  | omitted/independent requests; custom-size conflicts; exact/range weight; duotone; branch defaults                                                            | arbitrary values type-check, size lacks a canonical default, range lacks renderer, or path lacks a supplied version                         |
| FR6, FR8–FR11    | Resolver and diagnostic matrix tests                       | untyped consumer size; missing size artwork; unresolved namespaced key; fixed/ordinary/adapted sources; explicit/theme adapter mismatch; malformed registry  | render throws, size fallback changes, namespaced behavior changes, policy warns, explicit mismatch is silent, or root branch uses wrong box |
| FR7, FR12        | Family, slot, hook, shared-default, and programmatic tests | `true` slot augmentation; metadata-bearing slot; derived Button size; documented exception; slot-to-name order; active-theme hook; old/request-aware reads   | `true` stops typechecking or participates, roles repeat defaults, hook differs, explicit intent loses, or compatibility read changes        |
| FR13, FR18, FR21 | Authoring/build/adapter parity tests                       | source/built; absent/replace/null presentation; unadmitted theme size/role; per-role clear; explicit/theme unsupported adapter axis; malformed mapping       | invalid authoring reaches render, inherited field leaks through atomic replacement, warning provenance changes, or equivalent themes differ |
| FR14, FR16–FR20  | Browser presentation and accessibility evidence            | omitted-field baseline; `true` role; metadata-bearing role; role sizes; selected/pressed/disabled/loading; source overrides; direction/focus                 | baseline or `true` pixels change, state affects weight, structure/a11y changes, or source override breaks                                   |
| FR22             | Generated inventory snapshots against runtime              | `true` role marked stateless; metadata-bearing role; conditional state union; declared precedence; default/resolved size; effective state; appearance/weight | `true` gains states, public union includes nonmetadata, or inventory/theme/runtime state differs                                            |
| FR23             | Static/generated conformance fixtures                      | undeclared component; legacy `true` augmentation; metadata bypass; hardcoded state; missing inventory; baseline-pixel divergence                             | `true` stops typechecking, nonparticipant changes, bypass passes, or compatible override is rejected                                        |

## Decision log

### DEC-1 — Themes use one grouped capability contract

**Reference:** `spec:AST-054/DEC-1`
**Decider:** `rubyycheung`, `2026-10-02`

Installed contracts compose into one application capability set containing custom
sizes with canonical defaults, appearance names, and exact values or numeric ranges
backed by integration-supplied renderers. Types, docs, runtime, build, and inspection
derive from it. Conflicting custom-size defaults fail validation.

Rejected: unrelated declarations that can disagree, universal appearance names, and
one universal weight scale.

### DEC-2 — Size names are overridable tokens with safe defaults

**Reference:** `spec:AST-054/DEC-2`
**Decider:** `rubyycheung`, `2026-10-02`

`xsm`, `sm`, `md`, and `lg` keep 12px, 16px, 20px, and 24px defaults and
may be deliberately overridden. Every added size has one canonical application
default under any theme.

Rejected: removing admitted names, undefined theme-switch results, and fallback to
an unrelated size name.

### DEC-3 — Capability mismatch falls back without throwing

**Reference:** `spec:AST-054/DEC-3`
**Decider:** `rubyycheung`, `2026-10-02`

Unsupported appearance enters the selected branch default and later axes continue.
Unsupported weight uses that branch default. Explicit mismatch warns once in
development; policy mismatch is inspection-only; production stays quiet.

Rejected: render-time exceptions, clamping, inferred weights, SVG mutation, and
warnings for normal size-artwork fallback.

### DEC-4 — Component families own structural defaults only

**Reference:** `spec:AST-054/DEC-4`
**Decider:** `rubyycheung`, `2026-10-02`

A family policy may choose source, derive default size from component inputs, define
state transitions, and name documented structural exceptions. Every owned role
reuses it. Appearance and weight belong to explicit Icon requests, theme
presentation, or source defaults, never component/family policy.

Rejected: repeated per-role structure and component-owned visual-state defaults.

### DEC-5 — Resolution narrows in one direction

**Reference:** `spec:AST-054/DEC-5`
**Decider:** `rubyycheung`, `2026-10-02`

Resolution moves through one selected source, size, appearance, and weight. Each axis
is evaluated once; exact matches own later fallback. Existing one-argument reads
remain compatible while request-aware paths share the resolver.

Rejected: mixing icon families, returning to root after an exact adaptive match, and
changing existing one-argument reads.

### DEC-6 — `appearance` selects supplied artwork

**Reference:** `spec:AST-054/DEC-6`
**Decider:** `rubyycheung`, `2026-10-02`

The optional `appearance` prop expresses caller-owned visual intent that cannot
always be derived from semantic name or component state. Astryx consumes it instead
of forwarding it as CSS.

Rejected: `variant`, `style`, `iconStyle`, and `fill`, which are ambiguous or too
narrow for supported library models.

### DEC-7 — Direct product icons participate through a typed adapter

**Reference:** `spec:AST-054/DEC-7`
**Decider:** `<pending>` — proposed, not yet decided

A library adapter binds a contract that joins the application set and exports an
ordinary `IconType`-compatible component. It receives only admitted supported axes;
unsupported axes are omitted. Explicit caller mismatch warns once in development;
theme-policy fallback is inspection-only. Malformed mapping safely renders the
wrapped default. Ordinary direct components stay fixed.

Rejected: mandatory registration, blind `IconType` widening, unknown-prop forwarding,
and a second provider.

### DEC-8 — Themes own weight by final size and appearance by state

**Reference:** `spec:AST-054/DEC-8`
**Decider:** `<pending>` — proposed, not yet decided

Theme `default` and `bySize` may choose appearance and weight. A final-size weight is
the only theme weight source. `byState` chooses appearance only. Explicit Icon
requests win; component/family policy supplies neither axis.

Rejected: state weight, per-component presentation, and role-specific visual values.

### DEC-9 — Component slots own roles and deterministic state precedence

**Reference:** `spec:AST-054/DEC-9`
**Decider:** `<pending>` — proposed, not yet decided

The approved `ComponentIconSlotMap` owns role names and keeps `true` as a valid
stateless, nonparticipating value. Metadata-bearing values own finite literal state
vocabularies. Public `ComponentIconStateName` and theme `byState` keys conditionally
derive as their union. Each participating role declares precedence over only its own
states, reports zero or one effective state, and may receive a size-only theme
override. Explicit caller source overrides remain compatible; component behavior and
structure remain component-owned.

Rejected: a competing role map, multi-state appearance merging, and theme-owned state
transitions.

### DEC-10 — Theme inheritance is explicit and atomic

**Reference:** `spec:AST-054/DEC-10`
**Decider:** `<pending>` — proposed, not yet decided

Absent presentation inherits; an explicit object replaces atomically; `null` resets
to contract defaults. Role-size maps merge per role and `null` clears one inherited
override. Generated role/state metadata drives one visual inventory and conformance
checks.

Rejected: implicit nested presentation merging and hand-maintained inventories.

## Open questions

- **OQ1 — What are the final exported spellings and module paths?** (`human-api`)
  API review may rename capability, adapter, presentation, role-metadata,
  request-aware lookup, and inspection exports without changing their behavior.
- **OQ2 — Where do the generated inventory and conformance command live?**
  (`human-api`) Tooling review must choose their shipped docs/preview location and
  command entry point while preserving complete runtime-equivalent coverage.
