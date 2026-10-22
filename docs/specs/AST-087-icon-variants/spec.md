---
schema_version: 4
template_version: 2
kind: system-spec
id: spec:AST-087
authority: current
archive_reason: null
superseded_by: null
approved_by: imdreamrunner
approved_at: 2026-10-21
phase: accepted
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

A theme decides how icons look:

- `Icon` takes an optional `variant`, and a theme icon entry can be a function of
  the final size and that variant, so the theme maps both to its icon library's
  own artwork or props.
- A theme sets the dimension of each Icon size through the Icon stylesheet
  target; the glyph and any component-owned icon box follow it.
- A component exposes a themeable icon as a `componentIcons` slot, and a slot
  entry can resolve from the component's state, so a theme decides what a
  pressed, selected, or disabled icon looks like.

## Non-goals

- Appearance or weight axes, or variant names defined by Astryx.
- New Icon size names.
- Additional component icon maps or an icon-role concept.
- Theme styling for icon components passed directly to `Icon`.
- Equivalent internal implementations remain valid when they satisfy this
  contract.

## Requirements

### Variant and theme entries

- **FR1 — A theme icon entry is a node or a function of the request.**
  `DefineThemeInput.icons` and process-wide registration accept, for a semantic
  or namespaced key, a React node or a function receiving `{size, variant}`, where
  `size` is the final Icon size and `variant` is the requested variant or
  `undefined`. Conceptually:

  ```ts
  type IconRequest = Readonly<{
    size: 'xsm' | 'sm' | 'md' | 'lg';
    variant?: string;
  }>;

  type IconEntry =
    React.ReactNode | ((request: IconRequest) => React.ReactNode);
  ```

  A theme maps size and variant to its library's own props or artwork:

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

- **FR2 — `Icon` passes an optional variant to the entry.**
  `<Icon icon={name} variant={value}>` passes `variant` to the selected entry. An
  omitted variant, or one the entry does not handle, renders the entry's normal
  artwork. A node entry renders the same node for every variant.
- **FR3 — Variant applies to registry icons.** An icon component passed directly
  to `Icon` renders as given and does not receive `variant`; `Icon` does not
  forward `variant` to it or to the DOM.
- **FR4 — Sources resolve before the request.** A theme entry wins over a
  process-wide registration, which wins over the built-in default; a nullish
  static entry falls through to the next source. The selected function runs once,
  and its result is final: a nullish result renders no glyph.
- **FR5 — Entries and resolvers are pure and synchronous.** They compute their
  result from their input only, without hooks, DOM or SVG measurement, browser
  globals, network access, or side effects.

### Sizes

- **FR6 — Entries receive the resolved size.** `Icon` resolves its size by
  `component:Icon` ORD1 (`xsm`, `sm`, `md`, `lg`) and passes it to the entry,
  which selects artwork for that size.
- **FR7 — A theme sets each size's dimension in the stylesheet.** The Icon theming
  target guarantees `width` and `height` on its size selectors, so
  `components.icon['size:sm']` sets the `sm` dimension. Without theme styles,
  sizes are 12, 16, 20, and 24px at a 16px root and scale with the root font size.
- **FR8 — Component icon boxes use the theme dimension.** A component that
  reserves a box for an icon at a size, such as the Button family's icon slot,
  sizes the box with the active theme's dimension for that size, so the glyph and
  its box match. Control height and touch targets remain set by the component
  (`family:buttons` FR7).
- **FR9 — Astryx default glyphs render through `Icon`.** A Core or first-party
  component that supplies a default registry glyph, including one passed into
  another component's icon prop, renders it through `Icon`, so theme dimensions,
  color, and variant apply to it.

### Component icon slots

- **FR10 — Component icons are `componentIcons` slots.** A themeable icon a
  component owns is a slot in `ComponentIconSlotMap`, mapped through
  `componentIcons` as `architecture:icon-resolution-and-component-slots`
  describes. A `true` value declares a stateless slot; an object type declares
  the slot's readonly state fields.
- **FR11 — A slot value is a name, `null`, or a state resolver.**
  `componentIcons` accepts an `IconName`, `null`, or a function of the slot's
  state that returns a partial request. Conceptually:

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

  The component supplies its state; the theme handles state combinations in the
  resolver.

- **FR12 — Partial results fall back field by field.** Icon content passed by the
  caller wins over the slot. Otherwise a resolver `icon` replaces the component's
  fallback name, and `variant` and `size` apply to whichever name renders. A
  missing field keeps the component's choice. `null`, a `null` result, or
  `icon: null` hides the icon.
- **FR13 — A slot size sizes the glyph and its icon box.** A resolved `size`
  replaces the component's size for that slot, and the glyph and its box use that
  size's theme dimension. The control's height, touch target, placement, color,
  interaction, and accessibility remain set by the component, including any outer
  dimensions a family contract fixes across states.
- **FR14 — Themes set state-dependent icons through slots.** A component that
  shows a state-dependent icon exposes that state through its slot so the theme
  can resolve it. Per-state icon props passed by a caller, such as `pressedIcon`
  or `selectedIcon`, act as caller-supplied icon content.
- **FR15 — Slot state is documented theme metadata.** A slot's state fields are
  listed with its slot metadata in the owner's component docs and in CLI and
  docsite discovery. Changing a released state field is a compatibility change.

### Reads, built themes, and server rendering

- **FR16 — Public reads return nodes.** Registry, extension, snapshot, and hook
  reads, `IconRegistry`, `DefinedTheme['icons']`, and built-theme icon exports
  return React nodes; a function entry is read at `{size: 'md'}`. Products
  request a size or variant through `Icon`.
- **FR17 — Runtime, built, and server themes agree.** Runtime themes, `extends`,
  built output, server rendering, and hydration resolve to the same nodes. A
  child theme's entry replaces the inherited entry for the same key. A function
  the build cannot carry fails the build. Server code may resolve icons with a
  theme that holds functions; client code passes that theme to `Theme`.
- **FR18 — Malformed resolver output is treated as missing.** An unknown `icon`,
  a non-string `variant`, or a size outside the four names in a resolver result
  is ignored field by field, with one development-only warning.

### Platform support

- Supported floor: every React, server-rendering, and browser target supported by
  Astryx Core.
- Unsupported behavior: asynchronous resolvers, and passing a theme that holds
  functions as a prop from a Server Component to a Client Component.
- Browser evidence: theme switching, nested themes, component states, and each
  Icon size keep glyph and icon-box dimensions equal and hydrate to the expected
  node.

## Current-state impact

Existing node entries, direct icon components, namespaced keys, instance props,
and reads keep working. When this ships:

- `component:Icon` — registry mode accepts `variant` (FR2, FR3) and selects
  artwork with the size resolved by ORD1 (FR6).
- `architecture:component-theming-surface` — the Icon target's guaranteed
  properties include `width` and `height` for its size selectors (FR7); INV14
  records how `variant` falls back once OQ1 is answered.
- `architecture:icon-resolution-and-component-slots` — slot values are `true` or
  a state shape, and INV3 admits state resolvers (FR10, FR11). INV8 lets a slot
  resolver set the slot's size (FR13). A selected function's result is final
  (FR4), and component docs list slot state (FR15).
- `architecture:theme-authoring-contract` — `icons` and `componentIcons` accept
  functions, and `extends` replaces same-key entries (FR16, FR17).
- `architecture:theme-compilation` — built output reproduces function entries and
  slot resolvers (FR17).
- `architecture:theme-application` — client code passes a theme that holds
  functions to `Theme` (FR17).
- `family:buttons` — FR7's icon slot sizes its box with the theme dimension
  (FR8, FR13).
- Consumer `theme`, `Icon`, and `Button` docs describe function entries,
  `variant`, size styling, and slot resolvers.

## Verification

| Contract  | Verification                                                 | Representative states                                                                          | Mutation or failure expectation                                                 |
| --------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| FR1–FR5   | Registry type, resolver, and Icon render tests               | node; function; null; omitted, handled, and unhandled variant; theme, global, default; direct  | sources mix, `variant` reaches a component or the DOM, or a node entry changes  |
| FR6–FR9   | Theme styling, geometry, and default-glyph tests             | each size with and without theme styles; Button family icon slot; default glyphs in icon props | glyph and box dimensions differ, or a default glyph renders outside `Icon`      |
| FR10–FR15 | Slot type, state, fallback, geometry, and metadata tests     | `true` slot; state slot; partial and full results; `null`; caller content; documented state    | fallback order changes, `null` stops hiding, or a slot size changes the control |
| FR16–FR17 | Public read, SSR, hydration, and runtime/build/extends tests | one-argument reads; nested themes; child replacement; built function entries; client theme     | a public read returns a function, or built and runtime results differ           |
| FR18      | Type and returned-field tests                                | invalid state shape; unknown icon; non-string variant; invalid size                            | malformed fields change the fallback, or production warns                       |

## Decision log

### DEC-1 — One variant request

**Reference:** `spec:AST-087/DEC-1`
**Decider:** imdreamrunner, 2026-10-21

A variant system is standard across design systems. `Icon` carries one optional
`variant`, and a heavier or lighter stroke is the theme entry's adjustment for
the final size.

Rejected: appearance and weight axes, because they are product-specific.

### DEC-2 — Theme entries are functions of size and variant

**Reference:** `spec:AST-087/DEC-2`
**Decider:** imdreamrunner, 2026-10-21

A theme entry is a node or a pure function of the final size and optional
variant that returns supplied artwork, so the theme owns everything specific to
its icon library.

### DEC-3 — The stylesheet sets icon dimensions

**Reference:** `spec:AST-087/DEC-3`
**Decider:** imdreamrunner, 2026-10-21

A theme sets the dimension of each Icon size through the Icon stylesheet target,
and component-owned icon boxes follow the same dimension.

Rejected: theme-added size names, because a component using one has no value
when the theme is absent.

### DEC-4 — `componentIcons` holds component icons

**Reference:** `spec:AST-087/DEC-4`
**Decider:** imdreamrunner, 2026-10-21

The global icon map names what each icon is for, and `componentIcons` overrides
it per component slot. A slot can resolve its request from typed component state.

Rejected: a second component icon map or an icon-role concept.

### DEC-5 — Themes set state-dependent icons

**Reference:** `spec:AST-087/DEC-5`
**Decider:** imdreamrunner, 2026-10-21

A state-dependent icon is a theme decision made through a slot resolver, so every
instance follows one rule.

### DEC-6 — A selected function's result is final

**Reference:** `spec:AST-087/DEC-6`
**Decider:** imdreamrunner, 2026-10-21

Once a function entry is selected, its result answers the request, so artwork
never mixes two sources and a theme can deliberately draw nothing.

### DEC-7 — Products request size and variant through `Icon`

**Reference:** `spec:AST-087/DEC-7`
**Decider:** imdreamrunner, 2026-10-21

Size- and variant-aware resolution serves Astryx components and tooling. Public
reads return React nodes, reading function entries at `{size: 'md'}`, the
standalone Icon default.

### DEC-8 — Malformed resolver output is ignored field by field

**Reference:** `spec:AST-087/DEC-8`
**Decider:** imdreamrunner, 2026-10-21

An invalid field in a resolver result is treated as missing, so the fallback
still renders, with one development-only warning.

## Open questions

- **OQ1 — How is `variant` typed?** (`human-api`)
  - An open `string`: nothing to maintain, no type safety for callers, and the
    entry owns the fallback for an unknown value.
  - A theme-extensible `IconVariantMap`, augmented by the application or
    generated by `theme build`: typed values; an unknown value falls back to the
    request without a variant.
- **OQ2 — Which relationships between icon sizes does a theme keep, and how does
  a theme author see them?** (`human-design`)
- **OQ3 — How do public slot resolvers receive state, and what does public theme
  data expose for a resolver slot?** (`human-api`)
