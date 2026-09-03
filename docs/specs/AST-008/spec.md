---
schema_version: 1
template_version: 1
kind: system-spec
id: spec:AST-008
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
phase: proposed
owners: [cixzhang, rubyycheung, imdreamrunner]
affects_architecture:
  [architecture:theme-authoring-contract, architecture:theme-compilation]
affects_families: []
affects_contributing: []
affects_consumer_docs: [color, theme]
---

# Palette authoring and explicit color adoption system spec

## Intent

Palettes help theme authors choose and verify colors. Themes ship only values an
author explicitly reviewed and saved. Changing a palette must never silently
regenerate rendered theme colors.

Semantic tokens remain the primary interface for components and applications.
Palette stops are optional authoring references, not live semantic values,
runtime dependencies, design approval, or accessibility guarantees.

## Non-goals

- Define the palette data shape, inheritance, validation, or package artifacts.
- Define or select a palette-generation recipe.
- Make `defineTheme` choose semantic colors from palette metadata.
- Change `color` expansion when palette metadata exists.
- Require every theme color to match a palette stop.
- Expose numbered stops as portable Core tokens.
- Approve any theme's exact palette or color mappings.

## Requirements

The authoring flow has four separate operations:

| Operation | Result                                                                         |
| --------- | ------------------------------------------------------------------------------ |
| Reference | An exact, validated palette artifact that tooling can inspect.                 |
| Suggest   | A reviewable candidate mapping from one exact palette color to one theme role. |
| Save      | An explicit final color value in theme source.                                 |
| Verify    | Contextual evidence for the exact saved value.                                 |

- **FR1 — Palettes are optional.** A theme MAY use generated, hand-authored,
  imported, or no palette data. Omitting palette data MUST NOT warn, require
  migration, remove a feature, add a runtime dependency, or change theme output.
- **FR2 — Palette validity and theme mapping are separate.** A valid palette is
  eligible authoring input. Validation does not adopt it, map semantic roles,
  approve its design, or certify accessibility. A theme MAY adopt some, all, or
  none of its stops.
- **FR3 — Suggestions are authoring-time evidence.** A suggestion MUST identify
  the palette artifact, a content digest of its exact bytes, mode, family, stop,
  exact color, requested theme role, selection reason, and any measured
  difference. It MUST be inspectable before any source edit. A nearest-stop
  result is a suggestion, never live theme behavior.
- **FR4 — Saved values are the theme source of truth.** Accepting a suggestion
  MUST write the final explicit color value into theme source. The saved token or
  component mapping MUST NOT resolve through a live numbered-palette lookup.
  Authors MAY adjust or reject a suggestion before saving it.
- **FR5 — Palette changes never recolor a theme implicitly.** Editing, replacing,
  or regenerating palette data MUST leave normalized theme tokens, generated CSS,
  built runtime modules, and mounted runtime behavior unchanged. Tooling MAY show
  an informational comparison or offer a reviewable source patch. Nothing changes
  until an author explicitly accepts and saves new values.
- **FR6 — Palette data and `color` stay independent.** A theme with both palette
  data and `defineTheme.color` MUST retain the same `color` normalization and
  output it would have without palette data. Tooling MAY compare those generated
  values with palette stops and suggest explicit overrides. It MUST NOT change
  `expandColorScale` or add an automatic combined mode.
- **FR7 — Explicit deviations remain valid.** Otherwise-valid CSS colors MUST NOT
  be rejected only because they are absent from a palette. Alpha overlays,
  compositions, external brand colors, and context-specific contrast adjustments
  remain legitimate. Tooling MAY report neutral comparison information, but MUST
  NOT call nonmembership wrong or inaccessible.
- **FR8 — Accessibility remains contextual.** Tools MAY report measured color
  properties and contrast ratios for explicit pairs. They MUST NOT label a
  palette, family, stop, or suggestion accessible. For every accessibility claim
  a theme makes, evidence belongs to the exact foreground, background, text size,
  component state, mode, and non-color cues involved.
- **FR9 — Theme records own adopted mappings.** A current `theme:<name>` record
  owns one theme's saved token and component mappings, intentional deviations,
  claimed pairings and states, compatibility, and rendered evidence. Palette
  inventory and artifact ownership remain with the metadata contract. A candidate
  or draft record MUST NOT be presented as approved theme behavior.
- **FR10 — Palette metadata has a separate owner.** A separate accepted system
  contract MUST own palette structure, source association, inheritance,
  validation, sidecars, and package compatibility. It MUST reference this record
  for mapping behavior instead of creating a second automatic or live-mapping
  rule.
- **FR11 — Generation has a separate owner.** A future generator contract MAY own
  candidate math, author controls, reproducibility, and recipe selection. Its
  output enters this flow only as palette data or suggestions. Generation MUST NOT
  bypass Review, Save, or Verify.

- **IR1 — Palette tooling is authoring-only.** Palette readers, comparison logic,
  suggestions, and receipts MUST NOT enter Core component runtime, theme mounting,
  default theme CSS or JavaScript, or a theme package's default runtime export.
- **IR2 — Suggestions are atomic and reviewable.** A read or suggest operation
  MUST NOT edit source. A mutating operation MUST require explicit apply intent,
  show the exact target and patch, preserve author overrides, and leave no partial
  edit after failure.
- **IR3 — Reference-only data does not gain runtime authority.** AST-008 does not
  authorize a `DefineThemeInput` field or change current theme normalization. Any
  future metadata API must be accepted by its owning contract and reconciled with
  current theme architecture before implementation.
- **IR4 — One mapping rule serves every authoring surface.** A CLI, UI, checker, or
  theme-specific tool MUST NOT invent a second meaning for exact match,
  nonmembership, or explicit saved values. Shared authoring logic and its fixtures
  own those results.

### Platform support

- Supported floor: authoring environments that can read the accepted palette
  artifact and theme source contracts.
- Unsupported behavior: runtime palette lookup, automatic remapping, hidden source
  edits, and best-effort partial apply.
- Browser evidence: structure and suggestions need no browser. Theme adoption
  requires real Chromium evidence for representative light and dark states.

## Current-state impact

| State                                 | Required result                                        |
| ------------------------------------- | ------------------------------------------------------ |
| No palette                            | Existing theme behavior and bytes stay unchanged.      |
| Palette only                          | Theme output stays unchanged.                          |
| `color` with or without palette data  | Existing `expandColorScale` behavior stays unchanged.  |
| Suggestion produced                   | Theme source and output stay unchanged.                |
| Suggestion accepted                   | The reviewed explicit value appears in a source patch. |
| Palette later changes                 | Saved values and rendered output stay unchanged.       |
| Explicit value is outside the palette | It remains valid; comparison is informational.         |

This specification-only pull request changes no runtime, build, theme, or package
behavior and carries no Changeset.

## Verification

| Contract           | Verification                                                             | Representative states                                                      | Failure signal                                                                       |
| ------------------ | ------------------------------------------------------------------------ | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| FR1–FR2            | Palette-absent and palette-present authoring fixtures                    | none, hand-authored, imported, generated                                   | Omission warns or validation claims adoption, meaning, or accessibility.             |
| FR3–FR4, IR2       | Suggest/apply golden patches                                             | exact, nearest, adjusted, rejected, failed, repeated apply                 | A read edits source, required evidence is missing, or apply hides/loses an override. |
| FR5–FR6            | Before/after normalized-theme, CSS, built-module, and runtime comparison | palette edit; `color` only; palette only; both                             | A palette-only edit changes any rendered or built theme value.                       |
| FR7, IR4           | Value validation and authoring-tool parity                               | exact stop, opaque deviation, alpha, composition, brand color              | A valid CSS color is rejected for nonmembership or tools disagree on its status.     |
| FR8–FR9            | Current theme records and browser evidence                               | mappings, deviations, light/dark states, explicit pairs                    | A draft/candidate is called approved or a palette is labeled accessible.             |
| FR10–FR11, IR1–IR3 | API, dependency, and bundle inventory                                    | Core runtime, theme source, default export, optional authoring entry point | Reference/generator data changes normalization or enters default runtime output.     |

## Decision log

### DEC-1 — Palette suggestions never become live theme dependencies

**Reference:** `spec:AST-008/DEC-1`
**Decider:** `cixzhang`, `2026-09-03`

FR3–FR6 make palette selection an authoring workflow. Themes keep reviewed exact
values, and later palette edits cannot silently recolor them.

Rejected: passing palette metadata into `expandColorScale` so runtime or build
normalization automatically chooses semantic defaults.

### DEC-2 — Palette guidance does not invalidate explicit colors

**Reference:** `spec:AST-008/DEC-2`
**Decider:** `cixzhang`, `2026-09-03`

FR7 keeps palettes advisory. Authors may save an exact stop or a justified direct
color. Tooling may explain the relationship without turning guidance into a gate.

Rejected: requiring palette membership for every token or component color.

### DEC-3 — Generator decisions follow the palette boundary

**Reference:** `spec:AST-008/DEC-3`
**Decider:** `cixzhang`, `2026-09-03`

FR11 leaves generator recipes, controls, and reproducibility to a later contract.
Any generator must produce authoring input and cannot bypass explicit review and
save steps.

Rejected: selecting or shipping a production recipe before palette adoption has a
stable authoring-only boundary.

## Open questions

None.
