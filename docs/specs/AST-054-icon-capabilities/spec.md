---
schema_version: 4
template_version: 2
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
    architecture:theme-application,
    architecture:theme-authoring-contract,
    architecture:theme-compilation,
  ]
affects_families: []
affects_contributing: [contributing:api-conventions]
affects_consumer_docs: [theme, Icon]
---

# Registry-backed Icon variant and component-slot resolver system spec

## Intent

A theme may supply more than one authored representation for one semantic icon.
`Icon` accepts one optional registry-backed `variant` request, so a semantic name
selects the active theme's representation. A component-owned slot in
`componentIcons` may choose its semantic icon request from the component's state.

## Non-goals

- Add appearance or weight axes, universal variant names, or per-library capability
  contracts.
- Add Icon size names beyond `xsm | sm | md | lg` or let a theme redefine their
  physical dimensions.
- Add nested size, variant, weight, or component-state maps.
- Generate compound component slot keys for state combinations.
- Build a union of variant values across themes or change public types when the
  active theme changes.
- Route direct component-mode Icons through registry selection.
- Synthesize, inspect, measure, mutate, or normalize SVG artwork.
- Change semantic icon names, registry-source precedence, component instance
  precedence, `null` suppression, color, accessibility, interaction, or control
  geometry.
- Equivalent internal implementations remain valid when they satisfy this contract.

## Requirements

- **FR1 — Authoring entries are fixed nodes or pure request resolvers.**
  `DefineThemeInput.icons` and process-wide registration, for semantic and
  namespaced keys, accept a fixed React node or one resolver receiving
  `{size, variant}`. A fixed node is the same node for every request. Built-in
  default icons are fixed nodes. Conceptually:

  ```ts
  type IconRegistryRequest = Readonly<{
    size: 'xsm' | 'sm' | 'md' | 'lg';
    variant?: string;
  }>;

  type IconRegistryEntry =
    React.ReactNode | ((request: IconRegistryRequest) => React.ReactNode);
  ```

- **FR2 — One optional variant is registry-backed.** Registry mode may request an
  opaque `variant?: string`. The selected entry owns its meanings and the normal
  representation used for an omitted or unsupported variant. Variant is not a
  `themeProps` axis, public `*Map` vocabulary, appearance/weight model, or
  cross-theme union.
- **FR3 — Registry size stays closed and semantic.** Every registry request uses
  only `xsm | sm | md | lg`. `Icon` resolves its effective size, passes it to the
  registry, and applies the fixed box CSS for that size. A registry resolver
  selects artwork and cannot alter the effective size.
- **FR4 — Direct component mode stays fixed.** A supplied icon component renders
  directly and never invokes a registry resolver. `IconProps` is an extendable
  interface, and runtime destructuring removes `variant` before remaining props
  are forwarded. Size, styling, ref, and accessibility precedence are unchanged.
- **FR5 — Source precedence resolves before requests.** A non-nullish active-theme
  entry wins over a non-nullish process-wide registration, which wins over the
  built-in default; static nullish entries fall through in that order. A selected
  resolver is invoked once. Its nullish result renders no glyph and never retries
  without `variant` or falls through to another source (DEC-5).
- **FR6 — Component slots use one typed state resolver.** `ComponentIconSlotMap`
  is the one slot owner: a `true` value denotes a stateless slot whose resolver
  receives `{}`, and an object-type value declares the slot's exact readonly state
  fields. `componentIcons` accepts a static `IconName | null` or one pure resolver
  of that state. Conceptually:

  ```ts
  type ComponentIconRequest = Readonly<{
    icon?: IconName | null;
    variant?: string;
    size?: 'xsm' | 'sm' | 'md' | 'lg';
  }>;

  type ComponentIconValue<State> =
    | IconName
    | null
    | ((state: Readonly<State>) => ComponentIconRequest | null | undefined);
  ```

  The component supplies only deterministic state, and a theme handles state
  combinations in resolver code.

- **FR7 — Partial slot results preserve precise fallbacks.** Consumer instance
  content wins; the theme slot entry is not consulted and none of its fields
  apply. Otherwise, a resolver `icon` wins over the component's declared fallback,
  and a missing `icon` or an `undefined` result uses that fallback. Resolver
  `variant` and `size` apply to whichever of those semantic names wins. A missing
  `variant` sends no variant request. A missing `size` keeps the component's
  Icon-size choice. Static `null`, a `null` result, and `icon: null` suppress the
  slot after consumer-instance precedence; a `null` component fallback renders
  nothing.
- **FR8 — A slot size changes only that Icon box.** A resolver-provided `size`
  replaces the component's Icon-size choice for that slot, and `Icon` applies the
  CSS for that named size. The containing control, touch target, placement, state,
  color, transforms, interaction, and accessibility stay component-owned and never
  derive from the selected Icon size.
- **FR9 — Released reads and calls stay source-compatible.** One-argument
  registry, extension, snapshot, and hook calls return React nodes; an omitted
  request outside Astryx-maintained code uses `md`. `IconRegistry`,
  `DefinedTheme['icons']`, registry snapshots, and built-theme public icon exports
  are node-valued, materialized at `{size: 'md'}` (DEC-6). A nullish materialized
  resolver result stays nullish and never falls through to a lower source. Every
  Astryx-maintained callsite in Core or a first-party package passes its effective
  size or renders through `Icon`.
- **FR10 — Resolution is synchronous and environment-independent.** Registry and
  slot resolvers are pure synchronous functions of their input. They use no hooks,
  DOM or SVG measurement, computed style, browser globals, network access, mutable
  module state, or render-phase side effects.
- **FR11 — Runtime, build, and server boundaries agree.** Runtime themes,
  `extends`, built output, server rendering, and hydration produce equivalent
  resolver inputs, source precedence, and selected nodes. A child theme's icon and
  slot entries replace inherited entries for the same key whole. Server code may
  resolve icons with a resolver-bearing theme; only client code passes that theme
  to `<Theme>`, and passing it as a prop across a Server-to-Client Component
  boundary is unsupported (DEC-7).
- **FR12 — Validation is split between types, theme shape, and resolver output.**
  Types reject a `ComponentIconSlotMap` value that is neither `true` nor an object
  type of state fields, a resolver result field outside `icon`, `variant`, and
  `size`, and a size outside the four names. Theme validation accepts only a valid
  semantic name, `null`, or a function as a slot value. At render, an unknown
  returned `icon`, a non-string `variant`, or an unsupported `size` is treated as
  a missing field and warns once in development only (DEC-8). A valid but unknown
  variant string uses the resolver's own fallback and does not warn.
- **FR13 — Slot state is public theme metadata.** A stateful slot's exact state
  fields join the slot metadata that component docs and CLI/docsite discovery
  expose under `architecture:icon-resolution-and-component-slots`. Adding,
  renaming, removing, or reinterpreting a shipped state field is a compatibility
  change.

### Platform support

- Supported floor: every React, server-rendering, and browser target supported by
  Astryx Core.
- Unsupported behavior: asynchronous resolvers, resolvers that depend on ambient
  mutable state, DOM or SVG measurement, computed-style selection, arbitrary Icon
  size strings, and passing a resolver-bearing theme object as a prop across a
  Server-to-Client Component boundary.
- Browser evidence: representative theme switching, nested themes, component states,
  and all four Icon sizes preserve wrapper geometry and hydration while selecting
  the expected supplied node.

## Current-state impact

Fixed registry entries, direct icon components, semantic names, namespaced keys,
component instance props, node-valued read projections, and one-argument lookups
are compatible. Applications that author no resolver entry and request no variant
render the same nodes and box geometry. Every static `componentIcons` value keeps
its meaning; state resolution is additive.

When this ships, these owners change:

- `component:Icon` — the glyph-source concept gains the optional registry-mode
  `variant` request (FR2, FR4), and registry artwork selection uses the size
  resolved by ORD1 (FR3).
- `architecture:icon-resolution-and-component-slots` — `ComponentIconSlotMap`
  values are `true` or a state shape, and INV3 and `ComponentIconMap` admit the
  typed state resolver beside static `IconName | null` (FR6). INV8 lets a slot
  resolver replace the slot's Icon size while control geometry stays
  component-owned (FR8). Shared resolution treats a selected resolver's result as
  final (FR5), and the component-local documentation section lists state fields
  (FR13).
- `architecture:component-theming-surface` — INV14 gains one explicit exception:
  the registry `variant` request is an open string whose fallback belongs to the
  selected resolver rather than being theme-independent. It is not a component
  prop axis, `themeProps` does not reflect it, and no `*Map` enumerates it. No
  other axis gains this exception.
- `architecture:theme-authoring-contract` — `DefineThemeInput.icons` and
  `componentIcons` accept resolver entries. Normalization and `extends` preserve
  request-aware behavior for shared resolution, replace same-key entries whole,
  and keep `DefinedTheme['icons']` node-valued (FR9, FR11).
- `architecture:theme-compilation` — built output reproduces runtime
  request-aware `icons` and `componentIcons` behavior while public icon exports
  stay node-valued (FR11).
- `architecture:theme-application` — `Theme` receives a resolver-bearing theme
  only from client code (FR11).
- `contributing:api-conventions` — the open-vocabulary section states that the
  registry `variant` request is the INV14 exception and not a `*Map` axis, so its
  `*Map` rule is not applied to it.
- Consumer `theme` and `Icon` docs describe resolver entries, `variant`, slot
  resolvers, and the server boundary.

## Verification

| Contract  | Verification                                                       | Representative states                                                                                                                    | Mutation or failure expectation                                                                                     |
| --------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| FR1–FR5   | Registry input/read types, resolver, and Icon render tests         | fixed node; resolver; static null; resolver null; omitted/known/unknown variant; four sizes; theme/global/default; direct component mode | source mixing, prop leakage, changed node reads, or changed fixed-node identity fails fixtures                      |
| FR6–FR8   | Component-slot type, state, precedence, and geometry tests         | stateless `true`; state object; empty/icon/variant/size/full result; undefined; null; instance; component default Icon size              | fallback order changes, null loses suppression, or Icon size changes the control/touch target                       |
| FR9       | Public read, API, hook, and maintained-callsite tests              | released calls; request-aware calls; Core and first-party direct lookups; namespaced key; theme and registry snapshots                   | a released read widens to a function, a call returns a descriptor, or a maintained callsite passes the wrong size   |
| FR10–FR11 | SSR, server-boundary, hydration, runtime/build/import tests        | nested themes; child replacement; built resolver behavior; public node exports; resolver-bearing client theme; theme switching           | public exports contain functions, resolvers merge, built and runtime results differ, or server/client nodes diverge |
| FR3, FR8  | Browser geometry and accessibility evidence                        | each Icon size; slot override; containing control states; touch targets; labelled and decorative icons                                   | selection changes control/touch geometry, focus, naming, color, interaction, or accessibility                       |
| FR12      | Type, theme-shape, and returned-field negative tests               | invalid state; invalid slot value; unknown icon; non-string variant; invalid size; unknown valid variant                                 | malformed fields change fallback, production warns, or valid variant fallback warns                                 |
| FR13      | Component metadata, CLI/docsite fixtures, and compatibility review | stateless/stateful slots; fallback; null behavior; state field addition, rename, removal, and meaning change                             | a resolver state is undiscoverable or changes without compatibility classification                                  |

## Decision log

### DEC-1 — Registry entries use one pure request resolver

**Reference:** `spec:AST-054/DEC-1`
**Decider:** `<pending>` — proposed, not yet decided

A registry entry is a fixed React node or one pure synchronous function receiving
the effective semantic size and optional variant. The function returns supplied
artwork; Astryx does not model the icon library behind it.

Rejected: per-icon capability trees and separate appearance or weight resolvers.

### DEC-2 — Variant is opaque and registry-only

**Reference:** `spec:AST-054/DEC-2`
**Decider:** `<pending>` — proposed, not yet decided

One optional string request lets a selected registry entry expose theme-specific
representations without changing direct component-mode Icon or constructing a
cross-theme type union. It is an explicit registry-only exception to open
component-axis vocabulary: `themeProps` does not reflect it and no public `*Map`
enumerates values. Omission and unsupported values use resolver-owned normal
artwork.

Rejected: universal appearance/weight vocabularies and application-wide capability
composition.

### DEC-3 — Component state extends the existing slot map

**Reference:** `spec:AST-054/DEC-3`
**Decider:** `<pending>` — proposed, not yet decided

A component slot may use one typed state resolver returning a partial semantic icon
request. Consumer instance content takes none of its fields; otherwise variant and
size apply to the resolver icon or component fallback. Missing fields preserve
precise defaults, and `null` suppresses the slot. Slot names, state meaning, and
rendering behavior are component-owned.

Rejected: a second component-icon registry or definer, nested state maps, and
compound keys for state combinations.

### DEC-4 — Semantic selection stays outside geometry

**Reference:** `spec:AST-054/DEC-4`
**Decider:** `<pending>` — proposed, not yet decided

A registry resolver selects supplied artwork from the already-effective semantic
size and cannot alter it. A component-slot resolver may replace the Icon size for
that slot; `Icon` then applies the box CSS for that size while the containing
component's control geometry and touch target are unchanged. Selected artwork never
feeds measured geometry back into either layer.

Rejected: theme-defined Icon dimensions, SVG measurement, and generated geometry
corrections.

### DEC-5 — A selected resolver's result is final

**Reference:** `spec:AST-054/DEC-5`
**Decider:** `<pending>` — proposed, not yet decided

Static nullish entries fall through to the next source. Once a resolver entry is
selected, its single result is the answer for that source chain: a nullish result
renders no glyph, so the selected theme can deliberately draw nothing for a
request.

Rejected: retrying without `variant` or falling through to a lower source, because
the result would mix artwork from two sources.

### DEC-6 — Node-valued public reads materialize `md`

**Reference:** `spec:AST-054/DEC-6`
**Decider:** `<pending>` — proposed, not yet decided

Public read projections and one-argument calls keep their React-node types by
materializing each resolver entry at `{size: 'md'}`, the standalone Icon default.

Rejected: widening released read types to include functions.

### DEC-7 — Resolver-bearing themes stay on the client side of `Theme`

**Reference:** `spec:AST-054/DEC-7`
**Decider:** `<pending>` — proposed, not yet decided

A theme carrying resolver functions can resolve icons in server code, and client
code passes it to `<Theme>`. Passing it as a prop from a Server Component to a
Client Component is unsupported because functions are not serializable props.

### DEC-8 — Malformed resolver output degrades to missing fields

**Reference:** `spec:AST-054/DEC-8`
**Decider:** `<pending>` — proposed, not yet decided

An unknown returned `icon`, a non-string `variant`, or an unsupported `size` is
treated as missing, so the precise fallback still renders, and warns once in
development only.

Rejected: throwing during render for malformed theme output.

## Open questions

- **OQ1 — What are the final request-aware overload and exported type names?**
  (`human-api`) Existing calls, the `variant` prop name, the resolver inputs, and
  component-slot semantics are fixed by DEC-1 through DEC-4. API review may adjust only type and overload
  spelling without adding another public definer or capability layer.
- **OQ2 — What does public theme data expose for a resolver-valued component slot?**
  (`human-api`) The state resolver must remain available to runtime and built-theme
  resolution, but it cannot be materialized without component state. Undecided:
  whether the public `DefinedTheme.componentIcons` map admits resolver functions directly or whether request-aware slot entries live on a
  separate non-public projection while the public map remains static.
