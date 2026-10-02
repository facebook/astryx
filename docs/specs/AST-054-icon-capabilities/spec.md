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

Icon libraries do not all work the same way. One may provide outline and filled
versions. Another may use solid, duotone, or color. Weight may be a number, a name,
an adjustable stroke width, or unavailable.

`Icon` should support those differences without forcing every library into one model:

```tsx
<Icon icon="search" size="medium" appearance="duotone" weight={600} />
```

The three optional props have separate jobs:

- `size` controls the icon box;
- `appearance` chooses a theme-supplied version, such as outline or duotone; and
- `weight` chooses a theme-supplied thickness or weight.

The active theme decides which values exist and which icon versions are available.
Callers may omit any optional prop without causing an error.

## What theme authors define

### Size

Astryx keeps its existing sizes so old code does not break:

- `xsm` = 12px
- `sm` = 16px
- `md` = 20px
- `lg` = 24px

A theme may add and prefer its own typed names, such as `small`, `medium`, and
`large`. Adding those names does not remove or change the four existing values.
Every active theme must provide dimensions for every added size name it supports;
Astryx does not guess a substitute size.

### Appearance

Astryx does not define one appearance list for every icon library. A theme may use
names such as `outline`, `filled`, `solid`, `duotone`, `color`, or another
type-checked list of names.

If the requested appearance exists for an icon, Astryx uses it. If it does not exist,
Astryx uses that icon's theme-supplied default version.

### Weight

Astryx does not define one weight scale for every icon library. A theme may use
numbers, names, or another type-checked list of values that matches the library.

If the requested weight exists for the selected icon version, Astryx uses it. If it
does not exist, Astryx uses that icon configuration's theme-supplied default. Astryx
does not reinterpret the value as CSS `font-weight` or guess a `stroke-width`.

### Icon entries

An **icon configuration** is one group of available icon versions with one supplied
default. It may be fixed or adaptive.

An existing plain React node remains a valid fixed configuration. It ignores appearance
and weight because it has only one version.

A theme may instead provide an adaptive configuration with versions by size,
appearance, weight, or any combination. Every adaptive configuration must include one
real default version, so omitted or unsupported requests always have a supplied result.
When `defaultAppearance` or `defaultWeight` labels that version, the same key must not
also appear in its map because that duplicate could never be selected.

## What component maintainers do

Adding an icon role to a component does not require repeating the theme's size,
appearance, or weight lists.

A component maintainer chooses the semantic icon role and fallback icon name. The
component or family may provide one shared icon-default profile when all of its icons
need the same treatment. Every owned icon role inherits that profile; individual icons
override it only when the component's documented behavior requires an exception.

For example, the Button family already defines its icon-size relationship once for
all Button icons. Adding another Button icon role reuses that relationship rather than
repeating a size for every icon.

## Defaults and fallback

Astryx determines the effective value for each optional prop in this order:

1. an explicit `Icon` prop;
2. the nearest component- or family-owned default; then
3. the final default:
   - standalone `md` for size; or
   - the selected icon configuration's supplied default for appearance and weight.

A component/family appearance or weight default becomes the requested value for the
next lookup. If that version is unavailable for the selected icon, Astryx uses the
configuration's supplied default.

An unknown callsite value is a type error. A malformed theme value is a theme-authoring
error. Omitting a prop is valid and never causes a runtime error.

Astryx chooses one icon entry from the active theme, then process-wide registration,
then the built-in default. After one of those sources supplies the entry, Astryx never
fills missing versions from another source. This prevents one rendered icon from
mixing different icon families.

## Resolution order

For a semantic icon name, Astryx resolves:

1. the icon entry: active theme, process-wide fixed registration, then built-in fixed
   default;
2. the effective box size from the explicit prop, component/family default, or
   standalone `md`;
3. an exact size-specific icon configuration when one exists;
4. the effective appearance from the explicit prop or component/family default, then
   an exact version when one exists, otherwise the current configuration's default;
   and
5. the effective weight from the explicit prop or component/family default, then an
   exact version when one exists, otherwise the current configuration's default.

An exact fixed size or appearance version is final. After an exact adaptive size or
appearance match, later fallback stays inside that match; it does not jump back to the
top-level icon versions.

## What Astryx never generates

Every rendered result must be a version supplied by the selected theme entry. Astryx
never edits SVG fill, stroke, color, paths, transforms, filters, or geometry to imitate
a missing appearance or weight.

## Non-goals

- Define universal appearance or weight names.
- Require every icon to support every value declared by its theme.
- Remove or change the existing size values.
- Change semantic icon names, component-owned icon slots, color, direction,
  accessibility, state, interaction, or registry-source precedence.
- Implement the runtime, theme compiler, declarations, or consumer docs in this
  specification pull request.
- Equivalent internal implementations remain valid when they satisfy this contract.

## Requirements

- **FR1 — Requests remain independent.** Size, appearance, and weight must not rewrite
  one another.
- **FR2 — Existing sizes do not break.** Existing calls using `xsm`, `sm`, `md`, or
  `lg` keep their current meaning and dimensions.
- **FR3 — Theme values stay specific and type-safe.** Size and appearance accept only
  names declared by the theme; weight accepts only declared names or numbers. The
  props do not widen to arbitrary values or CSS lengths.
- **FR4 — Theme-owned sizes are complete.** Every added size name has dimensions in
  every theme where it is valid, either directly or through theme inheritance.
  Incomplete themes fail validation before rendering.
- **FR5 — Components do not repeat shared defaults.** A component or family may define
  one shared size, appearance, and weight profile inherited by all owned icon roles.
  Adding another role does not require redeclaring those values; only an explicit
  exception overrides them.
- **FR6 — Fixed and adaptive entries coexist.** Existing fixed React nodes keep their
  behavior. Every adaptive configuration supplies one real default icon version. A
  default appearance or weight key must not also appear in its map because that
  duplicate could never be selected.
- **FR7 — Resolution order is stable.** Source, size, appearance, and weight resolve in
  that order using the defaults described above.
- **FR8 — Later fallback stays inside the current match.** After an exact size or
  appearance match, unsupported later requests use that match's supplied default.
  They do not jump back to top-level versions or another icon source.
- **FR9 — Missing versions are never synthesized.** Every result is explicitly supplied
  by the selected theme entry.
- **FR10 — Existing presentation behavior stays unchanged.** Version selection does
  not change box geometry, color, alignment, accessibility, focus, interaction,
  direction, selected/pressed/loading behavior, or style-prop precedence.
- **FR11 — Public resolution stays consistent and synchronous.** Components, hooks,
  component slots, programmatic lookups, server/client rendering, runtime themes, and
  compiled themes produce the same result for the same inputs. Resolution does not
  depend on DOM measurement, computed styles, browser globals, network requests, or
  mutable render callbacks.
- **FR12 — Public surfaces stay synchronized.** Generated types and docs describe the
  same admitted values and defaults as the runtime theme contract. Inspection reports
  what was requested separately from what the selected icon entry supports.

### Platform support

- Supported floor: every platform that currently supports `Icon` and normalized
  themes.
- Fixed icon sources keep their existing behavior and ignore appearance and weight.
- Representative browser checks prove stable geometry, styling, accessibility,
  hydration, and selection of supplied icon versions.

## Current-state impact

Today `Icon` supports only the closed `xsm | sm | md | lg` size values. It has no
appearance or weight prop, and theme icon entries are fixed React nodes.

**Compatibility:** this proposal is additive and is not intended to require a caller
or theme migration. Existing sizes, fixed icon entries, omitted optional props,
defaults, and node-returning programmatic lookups stay unchanged. An implementation
that removes or reinterprets those behaviors is a separate breaking change and is not
authorized by this spec.

**Current conflict:** `architecture:component-theming-surface` INV14 keeps
`Icon.size` closed because a missing custom size has no safe fallback. This proposal
does not invent a fallback. Instead, every active theme must define every added size
name it supports, and incomplete theme contracts fail before rendering. Accepting this
spec requires amending INV14; while this spec remains draft, INV14 still governs.

Implementation must update the Icon component contract and docs, theme authoring and
compilation, generated types, runtime/build parity, and component-slot and
programmatic resolver paths. This spec changes no runtime or package by itself and
adds no Changeset.

## Verification

| Contract | Required evidence                                                | Failure signal                                                                                                          |
| -------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| FR1–FR5  | type, theme-authoring, and component-family default tests        | omission fails, a type widens, a size lacks dimensions, or a component repeats family defaults                          |
| FR6–FR9  | fixed/adaptive registry and resolver matrix tests                | an old fixed entry changes, a configuration lacks a default, resolution crosses a boundary, or a version is synthesized |
| FR10     | styling and accessibility regressions                            | version selection changes geometry, color, naming, focus, interaction, direction, or style precedence                   |
| FR11     | runtime/build, server/client, and environment-independence tests | equivalent inputs select different versions or resolution depends on DOM, network, or mutable render state              |
| FR12     | generated type, docs, and inspection tests                       | types/docs disagree with runtime values or tooling reports an ignored request as supported                              |

## Decision log

### DEC-1 — Themes decide which values are available

**Reference:** `spec:AST-054/DEC-1`
**Decider:** `rubyycheung`, `2026-10-02`

Themes define type-checked appearance and weight values that match their icon
libraries. They may also add preferred size names while Astryx keeps its four existing
size values compatible.

Rejected: one universal weight scale or one closed appearance list.

### DEC-2 — Optional requests use shared defaults

**Reference:** `spec:AST-054/DEC-2`
**Decider:** `rubyycheung`, `2026-10-02`

Optional requests resolve from an explicit prop, then one shared component- or
family-owned default, then the standalone size or selected icon configuration default.
One family profile applies to every owned icon role, so adding an icon does not repeat
defaults.

Rejected: runtime errors for omitted props, per-role duplication, synthetic icon
versions, and cross-source fallback.

### DEC-3 — Resolution narrows in one direction

**Reference:** `spec:AST-054/DEC-3`
**Decider:** `rubyycheung`, `2026-10-02`

Resolution moves from source to size to appearance to weight. Each exact match owns the
choices and default that follow.

Rejected: returning to root versions after an exact size or appearance match.

## Open questions

- **OQ1 — What is the public theme authoring shape?** (`human-api`) API review must
  choose dedicated fields or one grouped icon configuration for theme-owned values,
  adaptive entries, and shared component/family defaults before this spec can become
  current.
