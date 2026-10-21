---
schema_version: 4
template_version: 2
kind: system-spec
id: spec:AST-087
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
phase: proposed
owners: [imdreamrunner]
affects_architecture:
  [
    architecture:component-theming-surface,
    architecture:icon-resolution-and-component-slots,
    architecture:theme-application,
    architecture:theme-authoring-contract,
    architecture:theme-compilation,
  ]
affects_families: [family:buttons]
affects_contributing: []
affects_consumer_docs: [theme, Icon, Button]
---

# Icon variants, theme sizes, and component icon slots system spec

<!-- Describe the system, not the project: present tense, what it does. No proposals, history, pull requests, or research in the record; see docs/contributing/spec-writing.md and report its rubric results in the pull request. -->

## Intent

A theme decides how icons look without Astryx modeling any icon library's style
vocabulary:

- `Icon` accepts one optional `variant` request, and a theme's icon entry is a
  fixed node or a pure function of the final semantic size and that variant. The
  function owns every library-specific choice, such as a heavier stroke at small
  sizes.
- The four Icon sizes keep their names. A theme sets their physical dimensions
  through the Icon stylesheet target, and the glyph and any component-owned icon
  box follow the same dimension.
- A component exposes a themeable icon only through a `componentIcons` slot. A
  slot entry may resolve from the component's typed state, so a theme, not a
  per-state prop, decides what a pressed, selected, or disabled icon looks like.

## Non-goals

- Appearance or weight axes, per-library capability declarations, or variant
  names defined by Astryx.
- Adding, removing, or renaming Icon sizes. `xsm | sm | md | lg` stay closed
  under `architecture:component-theming-surface` INV14.
- An icon-role concept, or any component icon map besides `componentIcons`.
- Nested state maps or compound slot keys for state combinations.
- Theme resolution for direct component-mode icons, or adapters that make an
  imported icon library follow the theme.
- Public lookups that take a size or variant. Products request both through
  `Icon`.
- Migrating existing namespaced keys, which stay the known deviation recorded by
  `architecture:icon-resolution-and-component-slots`, or removing released
  per-state icon props.
- A generated icon inventory or review tooling.
- Synthesizing, measuring, or mutating SVG artwork.
- Equivalent internal implementations remain valid when they satisfy this
  contract.
- Internal modules, files, function names, algorithms, data structures, storage
  layouts, manifests, journals, locks, transaction protocols, and CI job/workflow
  topology belong in architecture or implementation unless callers or
  interoperating systems intentionally depend on that exact mechanism as a public
  protocol. In that case, state who depends on it and why an equivalent
  implementation would not satisfy the contract.

## Requirements

### Variant and theme entries

- **FR1 — A theme icon entry is a fixed node or a pure function of the request.**
  `DefineThemeInput.icons` and process-wide registration accept, for a semantic
  or namespaced key, a React node or one function receiving `{size, variant}`.
  `size` is the final semantic size and `variant` is the requested variant, or
  `undefined`. A fixed node is the same node for every request. Built-in default
  icons are fixed nodes. Conceptually:

  ```ts
  type IconRequest = Readonly<{
    size: 'xsm' | 'sm' | 'md' | 'lg';
    variant?: string;
  }>;

  type IconEntry =
    React.ReactNode | ((request: IconRequest) => React.ReactNode);
  ```

  A theme maps size and variant to its icon library's own props or artwork:

  ```tsx
  const star = ({size, variant}: IconRequest) => (
    <StarIcon
      weight={
        variant === 'filled' ? 'fill' : size === 'sm' ? 'bold' : 'regular'
      }
    />
  );

  defineTheme({name: 'brand', icons: {star}});
  ```

- **FR2 — `Icon` accepts one optional variant.** In registry mode,
  `<Icon icon={name} variant={value}>` passes `variant` to the selected entry. An
  omitted variant, or one the entry does not handle, renders the entry's normal
  artwork. A fixed-node entry renders the same node for every variant.
- **FR3 — Direct component mode stays fixed.** A supplied icon component renders
  directly and never receives `variant`. `Icon` removes `variant` before it
  forwards remaining props. Size, styling, ref, and accessibility precedence are
  unchanged.
- **FR4 — Source precedence resolves before the request.** A non-nullish theme
  entry wins over a non-nullish process-wide registration, which wins over the
  built-in default; static nullish entries fall through in that order. A selected
  function runs once. A nullish result renders no glyph; it does not retry
  without `variant` or fall through to another source.
- **FR5 — Resolution is pure and synchronous.** Entry functions and slot
  resolvers are synchronous functions of their input. They use no hooks, DOM or
  SVG measurement, computed style, browser globals, network access, mutable
  module state, or render-phase side effects.

### Sizes

- **FR6 — Size names stay closed and semantic.** Every request uses
  `xsm | sm | md | lg`. `Icon` resolves its size by `component:Icon` ORD1 and
  passes it to the entry. An entry function selects artwork for that size and
  cannot change it.
- **FR7 — A theme sets each size's dimension through the Icon stylesheet target.**
  The Icon theming target guarantees `width` and `height` on its `size`
  selectors as reviewed target-specific additions, so
  `components.icon['size:sm']` reliably sets the `sm` dimension. A size the
  active theme does not style keeps its default: 12, 16, 20, and 24px at a 16px
  root, scaling with the root font size.
- **FR8 — Component-owned icon boxes follow the theme dimension.** A component
  that reserves a box for an icon at a semantic size, such as the Button family's
  icon slot, sizes that box with the active theme's dimension for that size, so
  the glyph and its box match. Control height, touch target, and family geometry
  guarantees stay component-owned (`family:buttons` FR7).
- **FR9 — Astryx-maintained default glyphs render through `Icon`.** A Core or
  first-party component that supplies a default registry glyph, including one it
  passes into another component's icon prop, renders it through `Icon` so theme
  dimensions, color, and variant reach it.

### Component icon slots

- **FR10 — `componentIcons` is the only component icon map.** A themeable
  component-owned icon is a slot in `ComponentIconSlotMap`, mapped through
  `componentIcons` as `architecture:icon-resolution-and-component-slots` defines.
  A `true` slot value declares a stateless slot. An object-type value declares
  the slot's exact readonly state fields.
- **FR11 — A slot value is a name, `null`, or a pure state resolver.**
  `componentIcons` accepts a static `IconName | null` or one function of the
  slot's state returning a partial request. Conceptually:

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

  The component supplies deterministic state; the theme handles state
  combinations in resolver code.

- **FR12 — Partial results keep precise fallbacks.** Consumer instance content
  wins, and the theme slot entry is not consulted. Otherwise a resolver `icon`
  wins over the component's declared fallback, and a missing `icon` or an
  `undefined` result uses that fallback. Resolver `variant` and `size` apply to
  whichever name wins. A missing `variant` sends none; a missing `size` keeps the
  component's own size choice. Static `null`, a `null` result, and `icon: null`
  suppress the slot.
- **FR13 — A slot size changes only the glyph and its icon box.** A resolved
  `size` replaces the component's size choice for that slot; the glyph and its
  component-owned box use that size's theme dimension. Control height, touch
  target, placement, color, interaction, and accessibility stay component-owned.
  Where a family contract fixes outer dimensions across states, a state-dependent
  slot size does not change them.
- **FR14 — Themes, not per-state props, own state looks.** A component that shows
  a state-dependent icon exposes that state through its slot. It does not add a
  per-state icon prop. A released per-state prop, such as `pressedIcon` or
  `selectedIcon`, stays a caller override at instance precedence.
- **FR15 — Slot state is public theme metadata.** A stateful slot's state fields
  join the slot metadata in its owner's component documentation and CLI and
  docsite discovery. Adding, renaming, removing, or reinterpreting a shipped
  state field is a compatibility change.

### Reads, built themes, and server rendering

- **FR16 — Public reads stay node-valued; size- and variant-aware resolution is
  internal.** One-argument registry, extension, snapshot, and hook reads return
  React nodes. `IconRegistry`, `DefinedTheme['icons']`, and built-theme public
  icon exports are node-valued, with each function entry materialized at
  `{size: 'md'}`. No public lookup accepts a size or variant. Public slot
  resolvers return the semantic request for a slot and its state, and the
  component renders that request through `Icon`.
- **FR17 — Runtime, built, and server themes agree.** Runtime themes, `extends`,
  built output, server rendering, and hydration produce the same requests, source
  precedence, and selected nodes. A child theme's icon and slot entries replace
  inherited entries for the same key whole. A function value the build cannot
  carry fails the build rather than being dropped. Server code may resolve icons
  with a function-bearing theme; passing that theme as a prop from a Server
  Component to a Client Component is unsupported.
- **FR18 — Malformed resolver output degrades to missing fields.** Types reject a
  slot value that is neither `true` nor an object type, a result field outside
  `icon`, `variant`, and `size`, and a size outside the four names. At render, an
  unknown `icon`, a non-string `variant`, or an unsupported `size` is treated as
  missing and warns once in development only.

### Platform support

- Supported floor: every React, server-rendering, and browser target supported by
  Astryx Core.
- Unsupported behavior: asynchronous resolvers, resolvers that depend on ambient
  mutable state, DOM or SVG measurement, size names outside the four, and passing
  a function-bearing theme as a prop across a Server-to-Client Component
  boundary.
- Browser evidence: theme switching, nested themes, component states, and each
  Icon size keep glyph and icon-box dimensions equal, keep control height and
  touch targets unchanged, and hydrate to the expected supplied node.

## Current-state impact

Fixed entries, direct icon components, semantic names, namespaced keys, instance
props, node-valued reads, and one-argument lookups keep working. A theme that
authors no function entry and no size styles, used without `variant`, renders the
same nodes and dimensions.

When this ships, these owners change:

- `component:Icon` — registry mode gains the optional `variant` request (FR2,
  FR3), and registry artwork selection uses the size resolved by ORD1 (FR6).
- `architecture:component-theming-surface` — the Icon target's guaranteed
  properties gain `width` and `height` for its size selectors (FR7). INV14
  records how `variant` relates to the theme-independent fallback once OQ1 is
  answered.
- `architecture:icon-resolution-and-component-slots` — `ComponentIconSlotMap`
  values are `true` or a state shape, and INV3 admits the state resolver beside
  `IconName | null` (FR10, FR11). INV8 lets a resolver replace the slot's size
  while control geometry stays component-owned (FR13). Shared resolution treats a
  selected function's result as final (FR4), and component-local documentation
  lists state fields (FR15).
- `architecture:theme-authoring-contract` — `icons` and `componentIcons` accept
  functions; normalization and `extends` replace same-key entries whole and keep
  `DefinedTheme['icons']` node-valued (FR16, FR17).
- `architecture:theme-compilation` — built output reproduces runtime `icons` and
  `componentIcons` behavior and fails on a function it cannot carry (FR17).
- `architecture:theme-application` — `Theme` receives a function-bearing theme
  only from client code (FR17).
- `family:buttons` — FR7's owned icon slot sizes its box with the theme dimension
  (FR8), and a state-dependent slot size keeps outer control dimensions (FR13).
- Consumer `theme`, `Icon`, and `Button` docs describe function entries,
  `variant`, size styling, and slot resolvers.

## Verification

| Contract  | Verification                                                 | Representative states                                                                                                 | Mutation or failure expectation                                                                |
| --------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| FR1–FR5   | Registry type, resolver, and Icon render tests               | fixed node; function; static null; null result; omitted, handled, and unhandled variant; theme/global/default; direct | sources mix, `variant` leaks to a component or the DOM, or a fixed node changes identity       |
| FR6–FR9   | Theme styling, geometry, and maintained-callsite tests       | each size with and without theme styles; Button family icon slot; default glyphs passed into icon props               | glyph and box dimensions differ, an unstyled size changes, or a default glyph skips `Icon`     |
| FR10–FR13 | Slot type, state, precedence, and geometry tests             | `true` slot; state slot; empty, icon, variant, size, and full results; `undefined`; `null`; instance content          | fallback order changes, `null` loses suppression, or a slot size changes control or outer size |
| FR14–FR15 | Component API review, metadata, and CLI/docsite fixtures     | stateful slot docs; state field added, renamed, removed; released per-state prop                                      | a new per-state icon prop appears, or slot state is undiscoverable or changes unclassified     |
| FR16–FR17 | Public read, SSR, hydration, and runtime/build/extends tests | one-argument reads; nested themes; child replacement; built function entries; function-bearing client theme           | a public read returns a function, built and runtime results differ, or a function is dropped   |
| FR18      | Type, theme-shape, and returned-field negative tests         | invalid state shape; unknown icon; non-string variant; invalid size                                                   | malformed fields change fallback, or production warns                                          |

## Decision log

### DEC-1 — One variant request; no appearance or weight axes

**Reference:** `spec:AST-087/DEC-1`
**Decider:** pending

A variant system is standard across design systems, while appearance and weight
are product-specific concepts. `Icon` carries one optional `variant`; a heavier
or lighter stroke is the theme entry's adjustment for the final size, not a
system axis.

Rejected: appearance and weight props typed from per-library capability
declarations, because they encode product concepts in the system.

### DEC-2 — Theme entries are pure functions of size and variant

**Reference:** `spec:AST-087/DEC-2`
**Decider:** pending

A theme entry is a fixed node or one pure synchronous function of the final
semantic size and optional variant. The function returns supplied artwork, and
Astryx does not model the icon library behind it.

Rejected: per-icon version trees keyed by size, appearance, and weight.

### DEC-3 — Four size names; dimensions belong to the stylesheet

**Reference:** `spec:AST-087/DEC-3`
**Decider:** pending

Size names stay `xsm | sm | md | lg`, because a component may use any of them
and each needs a value when no theme is applied. A theme sets their dimensions
through the Icon stylesheet target, which guarantees the properties it needs,
and component-owned icon boxes follow the same dimension.

Rejected: names added by a theme or icon library, because a component using a
missing name has no fallback; a separate size setting beside the stylesheet
target.

### DEC-4 — `componentIcons` is the one component icon map

**Reference:** `spec:AST-087/DEC-4`
**Decider:** pending

The global icon map names what each icon is for, and `componentIcons` overrides
it per component slot. A slot may resolve its request from typed component state.
Slot names, state meaning, and rendering stay component-owned.

Rejected: an icon-role concept or a second component icon map; namespaced
`icons` keys for new component glyphs; nested state maps or compound keys.

### DEC-5 — Themes own state looks

**Reference:** `spec:AST-087/DEC-5`
**Decider:** pending

A state-dependent icon look is a theme decision expressed through a slot
resolver, so every instance follows one rule. Per-state icon props scale with
every component and state; released ones remain as instance overrides.

### DEC-6 — A selected function's result is final

**Reference:** `spec:AST-087/DEC-6`
**Decider:** pending

Static nullish entries fall through to the next source. Once a function entry is
selected, its single result answers that source chain, so a theme can
deliberately draw nothing for a request.

Rejected: retrying without `variant` or falling through to a lower source,
because the result would mix artwork from two sources.

### DEC-7 — Size- and variant-aware resolution stays inside Astryx

**Reference:** `spec:AST-087/DEC-7`
**Decider:** pending

Products style icons through `Icon`. The resolver that selects artwork for a size
and variant serves Astryx components and tooling and is not exported. Public
reads keep their React-node types by materializing function entries at
`{size: 'md'}`, the standalone Icon default.

Rejected: public lookups that take size or variant; widening released read types
to include functions.

### DEC-8 — Malformed resolver output degrades to missing fields

**Reference:** `spec:AST-087/DEC-8`
**Decider:** pending

An unknown returned `icon`, a non-string `variant`, or an unsupported `size` is
treated as missing, so the precise fallback still renders, with one
development-only warning.

Rejected: throwing during render for malformed theme output.

## Open questions

- **OQ1 — How is `variant` typed?** (`human-api`)
  - An open `string`: no vocabulary to maintain, no type safety for callers, and
    an explicit INV14 exception, because the fallback for an unknown value
    belongs to the entry.
  - A theme-extensible `IconVariantMap`, augmented by the application or
    generated by `theme build`: typed values and autocomplete; an unknown value
    falls back to the request without a variant, which is a theme-independent
    baseline under INV14; the type is the union across the application's
    themes.
- **OQ2 — Which relationships between icon sizes must a theme preserve, and how
  does a theme author see them?** (`human-design`) For example, whether size
  order must hold and which components map their own sizes to each icon size,
  so a theme author knows which values to set.
- **OQ3 — How do public slot resolvers accept state, and what does public theme
  data expose for a resolver slot?** (`human-api`) The resolver must stay
  available to runtime and built-theme resolution. Whether
  `DefinedTheme['componentIcons']` exposes resolver functions or keeps a static
  projection is unsettled.
