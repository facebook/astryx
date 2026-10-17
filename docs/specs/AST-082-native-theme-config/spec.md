---
schema_version: 4
template_version: 2
kind: system-spec
id: spec:AST-082
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-10-16
phase: accepted
owners: [cixzhang]
affects_architecture:
  [architecture:theme-authoring-contract, architecture:theme-compilation]
affects_families: []
affects_contributing: []
affects_consumer_docs: [theme]
---

# Native renderer theme configuration system spec

<!-- Describe the system, not the project: present tense, what it does. No proposals, history, pull requests, or research in the record; see docs/contributing/spec-writing.md and report its rubric results in the pull request. -->

## Intent

A team that ships the same product on the web and in a React Native app writes
one Astryx theme. A React Native renderer that runs Astryx components, such as
Expo's, reads native-only intent from that theme's `experimental.native`
section, for example which platform material its surfaces use. Web Astryx never
reads the section: a theme produces the same CSS, the same runtime behavior,
and the same component API with or without it.

Astryx ships no separate native component package. Native support comes from
renderers that run Astryx components, and Astryx's commitment to those renderers
is this experimental theme section.

## Non-goals

- Native component implementations, a native component package, or
  native-only component props.
- How a renderer applies a native value. The renderer owns its rendering.
- A support contract for the internals a renderer relies on (OQ1), verification
  of Astryx against a native renderer (OQ2), and an accessibility bar for native
  rendering (OQ3).
- Equivalent internal implementations remain valid when they satisfy this
  contract.

## Requirements

- **FR1 — Native intent lives in one experimental theme section.**
  `defineTheme` input accepts an optional `experimental` object whose optional
  `native` member holds native-only configuration of type
  `ExperimentalNativeThemeConfig`. This object is theme configuration's
  experimental object under `spec:AST-017/FR27`. Omitting it changes nothing
  about a theme.
- **FR2 — The vocabulary is small and degrades to the default.**
  `ExperimentalNativeThemeConfig` has one optional member, `material`, typed
  `'default' | 'liquidGlass'`. `'default'` asks for the renderer's ordinary
  opaque surfaces. `'liquidGlass'` asks the renderer to draw the surfaces it
  chooses, such as navigation bars and sheets, with the platform's translucent
  glass material where the platform has one. A renderer that cannot honor a
  value, or does not recognize a member, renders as if the member were absent.
  Every member value is plain serializable data.
- **FR3 — The defined theme carries the section unchanged.** `defineTheme`
  copies the section into `DefinedTheme.experimental.native`. A theme that
  `extends` another inherits the base's section member by member: a member the
  child sets replaces the base's value, and a member the child omits keeps it.
  A built theme carries the same section as its source theme. A member outside
  the published vocabulary is a type error; `defineTheme` does not validate
  member values at runtime.
- **FR4 — The section is inert on the web.** The web theme compiler, the
  `Theme` provider, and the CLI's CSS output never read the section. For every
  theme, generated CSS, mounted rules, and rendered component markup are
  byte-identical with and without `experimental.native`. No component reads the
  section, and no component gains a prop for it.
- **FR5 — The section is unstable.** `ExperimentalNativeThemeConfig` is
  exported only from `@astryxdesign/core/theme/experimental`, never from the
  package root or `@astryxdesign/core/theme`. Its declarations and the
  `experimental` member carry `@experimental`, and the theme documentation marks
  the section `stability: 'experimental'` and says it may change or be removed
  in a patch release (`spec:AST-017/FR21`). The `experimental` member is itself
  the boundary: adding, renaming, retyping, or removing anything inside it is an
  `[experimental]` patch (`spec:AST-017/FR22`), and because the web never reads
  it (FR4), such a change cannot reach a stable surface.
- **FR6 — Renderers read the defined theme.** A native renderer reads
  `experimental.native` from the `DefinedTheme` it receives, source or built.
  It needs no web CSS, no Astryx runtime hook, and no component prop to find
  the section.

### Platform support

- Supported feature/engine floor: the web floor is unchanged; the section has
  no web behavior. Native platform support is the renderer's.
- Unsupported behavior: a renderer that ignores the section renders the theme's
  shared tokens and component overrides; a value a renderer cannot honor
  degrades to the member's absence (FR2).
- Browser evidence: none. FR4 is proven at compiler and render output, where a
  difference is a byte difference.

## Current-state impact

- `architecture:theme-authoring-contract` lists the section in its input model
  and precedence, and owns its normalization, extension, and built parity
  (INV13). The field is not yet in `defineTheme`.
- `architecture:theme-compilation` names the section as a platform-only feature
  the web compiler does not read (INV10).
- The `theme` consumer doc gains the section, marked experimental, when it
  ships.
- `@astryxdesign/core/theme/experimental` does not exist yet; it ships with the
  type.

## Verification

| Contract | Verification                                                                              | Representative states                                                                         | Mutation or failure expectation                                                                                            |
| -------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| FR1, FR2 | Type tests over `DefineThemeInput`                                                        | section omitted, empty, `material` set to each value, an unknown member                       | An unknown member type-checks, or a theme without the section stops type-checking                                          |
| FR3      | `defineTheme` unit tests, source and built                                                | own section; inherited; child overrides one member; child omits the section; built theme      | The section is dropped, replaced wholesale on extension, or differs between source and built themes                        |
| FR4      | Compiler and render output comparison                                                     | each maintained theme with and without the section; runtime-mounted and built CSS; components | Any byte of CSS, mounted rules, or rendered markup differs                                                                 |
| FR5      | Published-surface and doc-metadata checks (`spec:AST-017/FR24`)                           | root, theme, and experimental subpath exports; declaration tags; theme doc stability metadata | The type leaks through a stable path, a marker is missing, or an incompatible change is tagged other than `[experimental]` |
| FR6      | Type test reading the section from a source and a built `DefinedTheme` with no web import | source theme; built theme                                                                     | Reading the section requires CSS, a hook, or a prop                                                                        |

## Decision log

### DEC-1 — Astryx ships no separate native package

**Reference:** `spec:AST-082/DEC-1`
**Decider:** cixzhang, 2026-10-16

Native apps use Astryx through renderers that run its components, so one
component set and one theme serve the web and native, and web users carry none
of native's cost. Astryx's native commitment is the experimental theme section;
it maintains no parallel native implementation of its components.

Rejected: a separate native component package generated from the shared theme,
because it duplicates every component's implementation and API.

### DEC-2 — Native intent is experimental theme configuration, inert on the web

**Reference:** `spec:AST-082/DEC-2`
**Decider:** cixzhang, 2026-10-16

Native-only intent belongs to the theme, where an app's look already lives, and
stays experimental while renderers learn what they need. Because the web never
reads it, the vocabulary can change in a patch without risk to any web user.

Rejected: native-only component props, because they grow every component's
stable API for one platform.

## Open questions

- **OQ1 — Do renderers get a support contract for internals they rely on?**
  (`human-api`) A renderer that runs Astryx components depends on details outside
  the public API, such as StyleX conditions, `createTheme` output, and element
  choices. Options: a named list of internals Astryx keeps stable for renderers,
  or no contract with renderers tracking each release. Recommendation: a named
  list, limited to what a publicly released renderer relies on, added once one
  exists.
- **OQ2 — Is Astryx verified against a native renderer?** (`human-design`)
  Options: run Astryx's component tests through a renderer as a native surface,
  or rely on the renderer's own tests. Recommendation: run them through Expo's
  renderer once it is publicly released.
- **OQ3 — What accessibility bar makes a renderer "supported"?**
  (`human-design`) Known renderer gaps include visually hidden text missing from
  the screen-reader tree and no `aria-activedescendant`. Options: parity with web
  for the components a renderer claims, or a documented subset. Recommendation:
  call a renderer supported only at parity with web for names, roles, states,
  focus, and announcements in the components it claims; until then it is
  experimental.
