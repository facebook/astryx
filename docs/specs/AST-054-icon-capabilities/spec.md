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
    architecture:theme-authoring-contract,
    architecture:theme-compilation,
  ]
affects_families: []
affects_contributing: []
affects_consumer_docs: [theme, Icon]
---

# Theme-owned Icon capabilities system spec

## Intent

Icon libraries expose different size, appearance, and weight systems. One library
may use `outline` and `filled`, another may add `solid`, `duotone`, or `color`, and
another may expose no appearance choice. Weight may be numeric, named, adjustable
through a supported stroke control, or unavailable.

`Icon` should let a caller request those three concepts independently while the
active theme defines their typed vocabulary:

```tsx
<Icon icon="search" size="medium" appearance="duotone" weight={600} />
```

`size`, `appearance`, and `weight` are optional. Omitting them is valid: size uses
the existing contextual-size cascade, while appearance and weight use the selected
icon configuration's supplied defaults. The required `icon` source keeps its
existing meaning.

A component that owns an icon slot does not repeat the theme vocabularies or specify
all three requests. For example, a Button may resolve its semantic icon name and
render `<Icon icon={resolvedButtonIcon} />`; Button's contextual size and the selected
icon configuration's defaults complete the result. A component supplies an explicit
size, appearance, or weight only when its own documented behavior requires that
override.

## Non-goals

- Define universal appearance or weight names for every icon library.
- Require every icon in a set to support every declared appearance or weight.
- Generate a missing icon version by editing SVG fill, stroke, color, paths,
  transforms, filters, or geometry.
- Change semantic icon names, component-owned icon slots, color, direction,
  accessibility, state, interaction, or registry-source precedence.
- Remove the existing `xsm`, `sm`, `md`, or `lg` size values.
- Implement the runtime, theme compiler, generated declarations, or consumer docs
  in this specification pull request.
- Equivalent internal implementations remain valid when they satisfy this contract.

## Requirements

### Public requests and theme vocabularies

- **FR1 — The three requests are independent and optional.** `size`, `appearance`,
  and `weight` MUST remain separate caller requests. Size resolution remains the
  explicit prop when supplied, then the nearest component-owned default, then
  standalone `md`. Omitting appearance or weight uses the selected icon
  configuration's declared default. A component owner SHOULD omit capability
  requests the component does not own and MUST NOT hardcode an appearance or weight
  value absent from any supported theme contract.
- **FR2 — The base size scale remains compatible.** `xsm` (12px), `sm` (16px),
  `md` (20px), and `lg` (24px) at the default 16px root MUST remain valid with
  their existing dimensions. A theme MAY define a preferred typed size scale and
  use only that scale in theme-owned components, but it MUST NOT make the base
  values invalid for existing callers.
- **FR3 — Theme-owned size values are complete.** A theme-owned size name MUST map
  to dimensions in every theme that can become active where that name is valid,
  whether by direct declaration or theme inheritance. Missing or invalid dimensions
  MUST fail theme validation before rendering; the resolver MUST NOT guess another
  size. The requested size name remains the key for size-specific icon versions.
- **FR4 — Appearance vocabulary is theme-owned.** Core MUST define no universal
  appearance values. An integration contributes a finite typed string vocabulary
  that may include names such as `outline`, `filled`, `solid`, `duotone`, `color`,
  or library-specific terms. A requested appearance uses an exact supplied match;
  an unsupported or omitted appearance uses the selected icon configuration's
  default version without warning.
- **FR5 — Weight vocabulary is theme-owned.** Core MUST define no universal weight
  names or numbers. An integration contributes a finite typed string or numeric
  vocabulary. A requested weight uses an exact supplied match; an unsupported or
  omitted weight uses the selected icon configuration's default version without
  warning. Core MUST NOT interpret the value as CSS `font-weight` or infer a
  `stroke-width`.
- **FR6 — Types remain finite.** Theme-generated or augmentable declarations MUST
  expose only admitted size, appearance, and weight values. The props MUST NOT widen
  to arbitrary strings, numbers, CSS lengths, or pixel values. Invalid callsite
  values fail type checking, and invalid theme keys fail authoring validation.

### Theme entries and resolution

- **FR7 — Existing fixed entries remain valid.** A plain React node in `icons[name]`
  remains a fixed icon version. Size still controls its box; appearance and weight
  do not alter it. Existing themes, process-wide registrations, built-in defaults,
  direct SVG component sources, and programmatic node-returning lookups remain
  compatible.
- **FR8 — Adaptive entries always have a real default.** A theme MAY supply an
  adaptive entry with size-, appearance-, and weight-specific versions. Every
  adaptive root and nested configuration MUST provide one real default icon version.
  `defaultAppearance` and `defaultWeight`, when present, label that version; the
  matching keys MUST NOT be duplicated in their maps because those entries would be
  unreachable.
- **FR9 — Resolution order is stable.** Resolution MUST occur in this order:
  1. active theme, process-wide fixed registration, then built-in fixed default;
  2. explicit, contextual, then standalone size;
  3. an exact size-specific icon configuration when present;
  4. an exact appearance version when present, otherwise that configuration's default;
  5. an exact weight version when present, otherwise that configuration's default.
- **FR10 — A selected source is atomic.** Once one registry source supplies an icon
  entry, missing size, appearance, or weight versions MUST NOT come from a lower
  source. A child theme replaces an inherited icon entry as one unit; nested icon
  configurations do not merge across child, parent, global, or built-in sources.
- **FR11 — A size-specific configuration is authoritative.** An exact fixed size
  version is final. An exact adaptive size configuration owns all later appearance
  and weight resolution. The resolver MUST NOT return to root versions after an
  exact size match.
- **FR12 — Appearance resolves before weight.** An exact appearance configuration
  owns weight lookup and its default. A fixed appearance version is final and
  ignores weight. Weight lookup MUST NOT cross size or appearance configurations.
- **FR13 — Missing versions are never synthesized.** Every rendered result MUST be
  a version explicitly supplied by the selected theme entry. The core resolver MUST
  NOT inspect or mutate SVG internals to imitate an unsupported request.

### Compatibility and parity

- **FR14 — Presentation behavior stays component-owned.** Selected icon versions
  MUST NOT change the resolved box, color, alignment, accessible name, decorative
  default, focusability, interaction, component-owned state, or direction handling.
  Existing `xstyle`, `className`, inline `style`, and pass-through precedence remain
  unchanged.
- **FR15 — Every public path resolves consistently.** Component rendering, hooks,
  component-owned slots, programmatic lookups, server rendering, client rendering,
  runtime themes, and compiled themes MUST produce the same observable result for
  the same source and requests. Resolution is synchronous and requires no DOM
  measurement, computed style, browser global, network request, or mutable render
  callback.
- **FR16 — Inspection separates request from support.** Public tooling and docs MUST
  distinguish requested size, appearance, and weight from the capabilities supplied
  by the selected icon entry. An ignored request MUST NOT be reported as supported.

### Platform support

- Supported feature/engine floor: every platform that currently supports `Icon` and
  normalized themes.
- Unsupported behavior: fixed icon sources keep their existing behavior and ignore
  appearance and weight requests.
- Browser evidence: representative real-browser checks prove stable box geometry,
  styling, accessibility, hydration, and selection of the supplied icon version.

## Current-state impact

Current `Icon` exposes only the closed `xsm | sm | md | lg` size axis. It has no
appearance or weight prop, and theme icon entries are fixed React nodes.

**Current conflict:** `architecture:component-theming-surface` INV14 keeps
`Icon.size` closed because an unavailable custom value has no safe
theme-independent fallback. This proposal does not invent such a fallback: it
requires every possible active theme to define every admitted theme-owned size
value and rejects incomplete theme contracts before rendering. Acceptance MUST
amend INV14; while this record remains draft, INV14 continues to govern.

Acceptance also requires coordinated amendments to the current owners of Icon's
public API, theme authoring and compilation, and shared icon resolution.

The implementation must update the Icon component contract and consumer docs, theme
normalization and inheritance, runtime/build parity, generated declarations, and all
component-slot and programmatic resolver paths. This specification changes no runtime
or package by itself and adds no Changeset.

## Verification

| Contract | Required evidence                      | Representative states                                                                               | Failure signal                                                                  |
| -------- | -------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| FR1–FR6  | public type and theme-authoring tests  | omitted props; base and theme-owned sizes; named appearances; named/numeric weights; invalid values | omission throws, a domain widens, or an admitted size lacks dimensions          |
| FR7–FR8  | fixed/adaptive registry tests          | fixed root; one or many appearances; sparse weights; required defaults                              | an existing node entry changes or an adaptive configuration has no real default |
| FR9–FR13 | resolver matrix                        | source × size × appearance × weight; fixed nested versions; unsupported requests                    | resolution crosses a source/configuration boundary or synthesizes a version     |
| FR14     | styling and accessibility regressions  | decorative and labelled icons; direction/state; style escape hatches                                | selection changes box, color, name, focus, interaction, or style precedence     |
| FR15     | runtime/build and server/client parity | component, hook, programmatic lookup, component slot, SSR and hydration                             | equivalent inputs select different versions across public paths                 |
| FR16     | generated docs and inspection tests    | requested value supported, unsupported, and omitted                                                 | tooling describes an ignored request as a fulfilled capability                  |

## Decision log

### DEC-1 — Themes own the capability vocabularies

**Reference:** `spec:AST-054/DEC-1`
**Decider:** `rubyycheung`, `2026-10-02`

Different icon libraries use incompatible appearance and weight models. Themes
therefore define finite typed appearance and weight vocabularies, and may define a
preferred size vocabulary while the base size values remain compatible.

Rejected: one universal numeric weight scale or one closed appearance list, because
either would misrepresent supported icon libraries.

### DEC-2 — Optional requests use supplied defaults

**Reference:** `spec:AST-054/DEC-2`
**Decider:** `rubyycheung`, `2026-10-02`

Callers may omit size, appearance, or weight. Size keeps its existing cascade;
appearance and weight use the selected icon configuration's real default version.
Unsupported appearance and weight requests degrade the same way without warning.

Rejected: runtime errors for omitted optional props, synthetic icon versions, and
cross-source fallback that mixes icon families.

### DEC-3 — Resolution narrows from source to size to appearance to weight

**Reference:** `spec:AST-054/DEC-3`
**Decider:** `rubyycheung`, `2026-10-02`

Each exact selection owns the remaining choices and its default. This keeps
size-specific design, appearance-specific weight coverage, and one icon family's
visual language intact.

Rejected: root fallback after an exact size or appearance match, because it can mix
versions designed for different boxes or styles.

## Open questions

- **OQ1 — How should themes declare the three vocabularies?** (`human-api`) The
  observable contract above is independent of whether the public authoring shape
  uses dedicated fields or one grouped icon configuration. API review must settle
  that shape before this record can become current.
