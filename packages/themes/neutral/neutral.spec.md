---
schema_version: 2
template_version: 1
kind: theme
id: theme:neutral
authority: current
approved_by: rubyycheung
approved_at: 2026-10-17
review_triggers:
  [tokens, palette-values, component-mappings, contrast, artifacts]
verified_by: [scripts/check-badge-contrast.test.mjs]
package: '@astryxdesign/theme-neutral'
source_theme: packages/themes/neutral/src/neutralTheme.ts
references:
  [
    architecture:theme-authoring-contract,
    architecture:theme-tokens,
    architecture:theme-compilation,
    architecture:component-theming-surface,
    spec:AST-006,
  ]
---

# Neutral theme specification

This record is the current approved palette and Neutral token-mapping contract.
It does not decide cross-theme local-token, palette-generation, compiler, or
artifact APIs; current `spec:AST-006` owns the local-token contract and
`architecture:theme-tokens` owns the portable semantic vocabulary. DEC-2 owns
the exact palette and DEC-4 owns the reviewed Neutral mappings.

## Intent and audience

Neutral serves builders who want a quiet grayscale foundation with restrained
surfaces and distinguishable semantic and categorical color. It should remain
product-neutral while status and interaction states stay recognizable in both
color modes.

## Inheritance and base

Neutral starts from Astryx core defaults and overrides selected typography,
motion, radius, shadow, semantic color, syntax, icon, and component values. It
does not currently extend another published package theme.

## Portable token overrides

The exact shipped values remain in `source_theme`. Neutral owns its grayscale
canvas/surface hierarchy, near-black/near-white content roles, status and
categorical selections, neutral boundaries, and syntax choices. Cross-theme token
vocabulary remains owned by `architecture:theme-tokens`.

## Theme-local role definitions

Neutral emits theme-local status roles as compatibility contracts for Neutral
extensions. They use named palette stops and are not portable Core tokens:

| Exact name                                         | Neutral-only meaning  | Value                                 |
| -------------------------------------------------- | --------------------- | ------------------------------------- |
| `--astryx-theme-neutral-color-status-fill-accent`  | Filled accent status  | `[blue.light[50], blue.dark[70]]`     |
| `--astryx-theme-neutral-color-status-fill-success` | Filled success status | `[green.light[45], green.dark[65]]`   |
| `--astryx-theme-neutral-color-status-fill-warning` | Filled warning status | `[yellow.light[85], yellow.dark[85]]` |
| `--astryx-theme-neutral-color-status-fill-error`   | Filled error status   | `[red.light[50], red.dark[65]]`       |

The exact names and meanings are public Neutral-family compatibility contracts.
Core components consume the portable `--color-*` semantic roles instead; no
Core implementation depends on these Neutral-local aliases.

## Tonal palette definitions

The complete source owns light and dark ramps for neutral, red, orange, yellow,
green, teal, cyan, blue, purple, and pink. The committed palette, generated
selected-stop module, and generation receipt make the `astryx-oklch-v1` result
reproducible. Regeneration is an explicit reviewed palette change and never
occurs during a normal theme build.

The approved dark-mode adjustment reduces realized chroma to 50% through stop
25 for chromatic families, with a 65% family override for yellow, and recovers
smoothly to the standard recipe at stop 60. It leaves the light ramps, neutral
ramps, and stops 60 through 100 unchanged. It does not use opacity or change
tone coordinates.

## Component and state mappings

Core components choose semantic roles by surface: strong fills use the base
semantic color with `--color-on-*`, pale surfaces use `--color-*-muted` with
`--color-on-*-muted`, and plain-surface text, icons, and boundaries use
`--color-status-foreground-*`. Neutral supplies named palette-stop values for
those public roles. Component-local Neutral mappings exist only when the theme
intentionally differs from Core behavior.

This contract does not add component states. Lab components and chart palettes
remain outside the Neutral status-component mapping surface.

## Compatibility and migration

Portable semantic token names remain stable across themes. Neutral-local status
roles remain emitted for Neutral extensions, but Core does not depend on them.
A Neutral-local name, enrolled theme name, exact value, or semantic meaning may
change only through an owner-approved compatibility update recorded here.
Compiled CSS does not broaden a local role beyond its approved context.

## Accessibility and contrast evidence

The Badge contrast guard resolves Core's semantic Badge pairings through all
first-party themes and applies theme-local overrides where present. Rendered
light/dark component matrices verify contextual appearance. Palette stops are
not accessibility claims by themselves; every foreground/background pair is
measured in the component and surface where it appears. Color does not replace
labels, shapes, focus indicators, or other signals required by the component
contract.

## Build and artifact contract

The package manifest and build tests define Neutral's runtime, CSS, declaration,
and export outputs. The complete palette remains in a theme-owned source file
for authoring and audits, while the generated selected-stop references used by
`defineTheme` are included in the runtime and CLI template artifacts. The
complete authoring palette is not bundled into generated CSS or generic
theme-build artifacts.

The selected-stop module is a deterministic derived artifact. A checked-in,
explicit maintenance command MUST discover every palette family, mode, and stop
referenced by Neutral's theme source, resolve each one from the committed full
palette, and regenerate the selected-stop module without changing token mappings.
A non-writing check MUST compare the complete generated module with the committed
file and fail on missing, extra, stale, or invalid references. Theme verification
MUST fail when the committed module differs from this deterministic projection.
Normal theme builds MUST NOT regenerate or adopt palette values.

The selected-stop module MUST contain exactly the palette stops referenced by
Neutral's theme source. Removing an unreferenced private entry preserves every
referenced value, the complete authoring palette, all token mappings, rendered
output, and public APIs.

## Verification map

| Theme contract            | Evidence                                          | Representative states                                    | Failure signal                                                                                              |
| ------------------------- | ------------------------------------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Current value inventory   | Neutral source and theme tests                    | light/dark token families                                | Source and record disagree about a theme-owned meaning.                                                     |
| Local role contract       | Neutral source and local-token fixtures           | exact declaration/output name; public meaning; rename    | The shipped name or meaning changes without owner-approved compatibility handling, or leaks into Core APIs. |
| Component mappings        | Theme source and rendered component matrix        | strong, pale, and plain-surface status roles; light/dark | A component selects the wrong role for its surface or a theme override no longer reaches it.                |
| Contrast                  | Badge guard plus rendered component matrix        | light/dark semantic pairs                                | A required pairing falls below its threshold.                                                               |
| Selected runtime refs     | Deterministic regeneration plus exhaustive parity | every referenced family, mode, and stop                  | A generated reference is missing, extra, invalid, or differs from the committed full palette.               |
| Existing package contract | Theme build, package, and resolution tests        | runtime, CSS, declarations, public exports               | This record implies an artifact that the package does not ship.                                             |

## Decision log

The decisions below own the current Neutral palette, mappings, compatibility
roles, and generated selected-stop contract.

### DEC-1 — Own one exact Neutral filled-accent-status role

**Reference:** `theme:neutral/DEC-1`
**System-boundary decider:** `cixzhang`, `2026-08-31`
**Final Neutral adoption decider:** `rubyycheung`, `2026-10-17`

Neutral owns theme-local definitions in this colocated theme spec.
`--astryx-theme-neutral-color-status-fill-accent` represents filled accent
status under the stable `name: 'neutral'`. Its exact name, meaning, and
`[blue.light[50], blue.dark[70]]` value are a public Neutral-family
compatibility contract, despite not being portable across themes or consumed by
Core.

The token may be applied only where the mapped context genuinely means filled
accent status. A new component mapping requires rendered light/dark evidence for
its actual interaction states.

Rejected: treating the role as global, treating it as disposable private output,
or applying it merely because two contexts currently share a color.

### DEC-2 — Approve the Neutral palette as a decision anchor

**Reference:** `theme:neutral/DEC-2`

**Decider:** `rubyycheung`, `2026-09-02`

Neutral's exact palette values are approved as the stable starting point for
subsequent color and contrast decisions. The committed palette, generated
selected-stop module, generation receipt, and visual review move together.
Runtime token mappings are outside this palette decision. The complete
authoring palette is not added to the runtime theme object or generated CSS.

Neutral is the repository reference implementation for palette-aware theme
templates. Templates may reuse its ownership, review, and alignment workflow;
they do not inherit Neutral's values, mappings, or stop layout as requirements.

Rejected: regenerating the palette during a normal build, silently changing
runtime token mappings as part of palette generation, or requiring complete
component-level contrast conformance before the palette can serve as the
baseline for measuring and improving those mappings.

### DEC-3 — Mute the dark chromatic edge without changing its tone scale

**Reference:** `theme:neutral/DEC-3`

**Decider:** `rubyycheung`, `2026-09-04`

Neutral's dark chromatic ramps use a 50% realized-chroma multiplier through
stop 25 and recover smoothly to the standard recipe at stop 60. Yellow uses a
65% multiplier to preserve its identity. The adjustment emits solid colors: it
adds no alpha, changes no light or neutral ramp, and preserves exact endpoint
and stop coordinates.

Rejected: reducing the entire palette's vibrancy, using translucent colors, or
changing semantic token mappings in the palette-value change.

### DEC-4 — Map Neutral roles through reviewed palette references

**Reference:** `theme:neutral/DEC-4`

**Decider:** `rubyycheung`, `2026-09-04`

Neutral's semantic, categorical, syntax, and color-bearing effect values use
named palette-stop references when an approved match exists. Token names and
meanings remain unchanged. Alpha variants derive from the referenced stop
rather than duplicating its hex value.

The mapping is role-aware rather than a blind nearest-color conversion. Very
dark foregrounds preserve their darker role, ordinary backgrounds do not become
true black automatically, and a reviewed token may use the closer value from
the companion ramp. Intentional values without an approved palette match remain
explicit theme-local values.

### DEC-5 — Generate the selected runtime references from their owned sources

**Reference:** `theme:neutral/DEC-5`

**Decider:** `rubyycheung`, `2026-09-30`

Neutral's selected-stop module is generated from two existing sources of truth:
the family, mode, and stop references used by Neutral's theme source, and the exact
values in the committed full palette. Regeneration copies only those selected
values into the runtime artifact. It neither chooses mappings nor regenerates the
full palette.

The generator has an explicit write mode for maintainers and a non-writing check
for verification. The check compares the entire expected artifact, so a missing,
extra, invalid, or stale selected reference fails before package output is
accepted. Normal theme builds never rewrite committed palette source.

Rejected: importing the complete palette at runtime, maintaining a second manual
selection manifest, or treating token-mapping assertions as proof that copied
hex values still match the approved palette.

## Open questions

None.

## Content boundary

This record owns Neutral's intent, factual value inventory, approved local-token
names and meanings, selected mappings, required pairings and states,
theme-specific exceptions, compatibility, and package facts. Shared contrast
methodology and measurement implementation remain outside this theme record.
`spec:AST-006` owns the cross-theme local-token API, namespace, validation,
lineage, and compiler invariants. Component and family records own observable
behavior, and consumer docs own supported syntax and examples.
