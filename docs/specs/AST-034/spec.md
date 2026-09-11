---
schema_version: 1
template_version: 1
kind: system-spec
id: spec:AST-034
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
phase: proposed
owners: [cixzhang, imdreamrunner]
affects_architecture: [architecture:icon-resolution-and-component-slots]
affects_families: []
affects_contributing: [contributing:api-conventions]
affects_consumer_docs: [Icon, theme]
---

# Size-aware icon registry entries system spec

## Intent

A theme author should be able to provide artwork designed for each effective
`Icon` size while preserving one semantic icon name. A component that renders
`<Icon icon="chevronDown" size="xsm" />` should be able to receive different
artwork from the same theme entry than one rendering `size="sm"`, without the
component knowing the theme's icon library or the theme compensating with CSS
sizing, transforms, or rewritten SVG geometry.

Existing registry entries that provide one React node remain valid and continue
to resolve that same node for every size. The shared-name, extension-key, theme,
global, and built-in precedence defined by
`architecture:icon-resolution-and-component-slots` remains unchanged.

## Non-goals

- Implementing runtime behavior in this specification pull request.
- Adding, removing, or changing the meaning of an `IconName`.
- Changing the `xsm | sm | md | lg` size vocabulary, its geometry, or its default.
- Automatically measuring, cropping, translating, or optically centring SVG paths.
- Choosing artwork, stroke weight, or visual direction for a theme.
- Allowing a theme to change the size, placement, color, accessibility, state, or
  transforms owned by the component rendering the icon.
- Changing `componentIcons` slot names, slot precedence, or `null` suppression.
- Removing namespaced extension keys or direct React-node registry entries.
- Adding a render callback or another stateful icon-rendering mechanism.

## Requirements

- **FR1 — A registry entry has one artwork responsibility.** `icons[name]` and
  `registerIcons({[name]: entry})` MUST accept either the released React-node form
  or a declarative size-aware entry. Both forms supply artwork for the same semantic
  name; the input shape MUST NOT change component behavior, accessibility, color,
  placement, or effective size.
- **FR2 — The size-aware form has an explicit fallback.** The public shape MUST
  contain one required `default` React node and a `bySize` map keyed only by the
  released `IconSize` values. A representative shape is:

  ```ts
  export interface SizedIconRegistryEntry {
    default: ReactNode;
    bySize: Partial<Record<IconSize, ReactNode>>;
  }

  export type IconRegistryEntry = ReactNode | SizedIconRegistryEntry;
  ```

  Exact exported names may change during API review, but the required fallback,
  closed size keys, and declarative data shape are contractual.

- **FR3 — Resolution chooses a source before a size.** The resolver MUST first
  choose one registry entry using the released order: active theme, process-wide
  registration, then built-in default. It MUST then resolve the requested size
  within that chosen entry. A missing or nullish `bySize[size]` value uses that
  entry's `default`; it MUST NOT fall through to a lower-priority registry source.
- **FR4 — Legacy entries preserve identity and behavior.** A released React-node
  entry MUST resolve to that same node for every requested size and for every
  resolver call that omits size. Existing themes, registrations, extension keys,
  snapshots, SSR output, and component behavior MUST remain unchanged.
- **FR5 — Size omission is deterministic.** Resolving a size-aware entry without
  an effective size MUST return its required `default`. It MUST NOT guess a size
  from DOM geometry, context unavailable to the resolver, or the registry source.
- **FR6 — `Icon` passes its effective size to shared resolution.** String mode in
  `Icon` MUST resolve the semantic name with the effective `size` after the
  component's existing default has applied. Component mode remains unchanged.
  The selected artwork renders inside the same wrapper, color, accessibility, and
  size styles as the released string mode.
- **FR7 — Public resolvers expose the same optional size input.** `getIcon`,
  `getExtendedIcon`, `getIconRegistry`, and `useIcon` MUST support resolving a
  requested `IconSize` without changing existing calls. Omitted size uses FR5.
  Resolver syntax MUST remain backward-compatible with each released argument
  position. Resolver results remain React nodes, not registry descriptors.
- **FR8 — Component slots keep their ownership boundary.** A component slot still
  selects `IconName | null` before shared artwork resolution. When a slot resolves
  to an icon name, the component supplies its effective icon size to shared
  resolution. `null` continues to suppress the slot. Size-aware artwork MUST NOT
  let a theme select a different semantic name or change component behavior.
- **FR9 — Theme inheritance replaces entries atomically.** A child theme override
  for `icons[name]` replaces the inherited entry as one unit. Astryx MUST NOT merge
  `bySize` values across theme, global, or built-in sources. The overriding entry's
  required `default` makes every missing size deterministic.
- **FR10 — Invalid descriptors fail safely.** Types MUST reject unknown size keys
  and descriptors without `default` or `bySize`. Runtime-invalid descriptors MUST
  warn in development and resolve through the next registry source rather than
  rendering a broken object. Production uses the same fallback without the warning.
- **IR1 — Resolution remains RSC-compatible.** Size-aware entries MUST remain plain
  declarative data containing React nodes. Resolution MUST NOT require hooks, DOM
  measurement, layout effects, browser globals, or mutable render callbacks.
- **IR2 — One normalizer owns entry resolution.** Theme, global, built-in,
  extension-key, snapshot, hook, and component paths MUST share one entry-resolution
  primitive so source and size precedence cannot drift between APIs.
- **IR3 — Documentation and generated surfaces stay synchronized.** Icon reference
  docs, theme docs, public exports, type declarations, and CLI-visible theme syntax
  MUST describe the same entry shape and fallback rules.

### Platform support

- Supported feature/engine floor: every React, server-rendering, and browser target
  already supported by Astryx Core; the feature adds no browser API dependency.
- Unsupported behavior: artwork selection from measured SVG bounds, computed style,
  viewport state, or arbitrary size strings.
- Browser evidence: representative `xsm`, `sm`, `md`, and `lg` string-mode icons
  MUST show unchanged wrapper geometry while rendering the selected node. Static and
  server-rendered output MUST select the same node for the same explicit size.

## Current-state impact

Current `main` stores `ReactNode` values in the shared registry. `IconFromRegistry`
already knows the effective `IconSize`, but calls `getIcon(name, themeName)` without
passing it. A theme therefore supplies one static node for every size. Themes backed
by icon systems with separately authored 12px, 16px, 20px, and 24px assets must pick
one source for all sizes or compensate inside that node.

The shipped resolver order and component-slot architecture remain correct. This
spec widens only the artwork value resolved after a semantic name and source have
already been selected. `architecture:icon-resolution-and-component-slots` remains
the canonical owner and is updated with the accepted contract in the implementation
pull request.

## Verification

| Contract | Verification                                      | Representative states                                                                                 | Mutation or failure expectation                                                |
| -------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| FR1–FR5  | Registry type and resolver tests                  | legacy node; complete map; sparse map; missing size; omitted size; nullish size entry                 | removing fallback or selecting size before source makes a focused fixture fail |
| FR3, FR9 | Theme/global/default precedence tests             | theme sparse map over global complete map; global map over built-in node; inherited theme replacement | merging lower-priority sizes changes the expected node                         |
| FR6      | `Icon` render tests                               | default `md`; explicit `xsm`, `sm`, `md`, `lg`; rerender with a new size                              | dropping the size argument renders the default node and fails assertions       |
| FR7      | Public resolver and hook tests                    | old signatures; explicit size; namespaced extension key; registry snapshot                            | a released call stops compiling or returns a descriptor instead of a node      |
| FR8      | Representative component-slot fixture             | slot fallback; theme slot remap; null suppression; explicit effective size                            | size selection bypasses slot meaning or null renders artwork                   |
| FR10     | Type tests plus development warning fixtures      | unknown size; missing default; missing bySize; valid sparse map                                       | malformed data reaches React or silently produces no icon                      |
| IR1–IR3  | SSR fixture, RSC import check, docs/export checks | server resolution; client hydration; public subpath; CLI docs                                         | browser-only logic enters the registry or docs/types disagree                  |
| Browser  | Chromium story with four named sizes              | one semantic name mapped to four visibly distinct test nodes                                          | wrapper geometry changes or the wrong node renders                             |

## Decision log

### DEC-1 — Size-aware entries are declarative data

**Reference:** `spec:AST-034/DEC-1`
**Decider:** pending owner approval

Use a required default node plus a closed per-size map. This keeps registration
RSC-compatible, makes fallback inspectable, and lets types prevent unsupported
size keys.

Rejected: a render callback such as `(size) => ReactNode`. It permits arbitrary
render-time behavior, hides fallback completeness, and turns registry data into a
second component lifecycle.

### DEC-2 — Source precedence resolves before size precedence

**Reference:** `spec:AST-034/DEC-2`
**Decider:** pending owner approval

Select the theme, global, or built-in entry first, then resolve size within that
entry. An override therefore owns one semantic name completely and remains
predictable when extended or registered globally.

Rejected: filling missing size keys from lower-priority sources. That silently
composes artwork from different themes and makes a sparse override depend on
ambient global state.

### DEC-3 — Astryx selects assets but does not normalize their geometry

**Reference:** `spec:AST-034/DEC-3`
**Decider:** pending owner approval

The registry chooses the node authored for an effective size. The selected icon
library owns its SVG viewBox, path bounds, and optical corrections; the rendering
component continues to own the wrapper and effective size.

Rejected: runtime SVG measurement, generated offsets in Astryx, or implicit
cropping. Those mechanisms make geometry depend on asset internals and browser
layout rather than a declared theme choice.

## Open questions

- **OQ1 — Should the public descriptor be accepted directly or constructed by a
  `define*` helper that validates and brands it?** (`human-api`)
- **OQ2 — Should optional size arguments extend the existing resolver signatures
  positionally or through backward-compatible overloads with an options object?**
  (`human-api`)
