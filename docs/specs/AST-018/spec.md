---
schema_version: 1
template_version: 1
kind: system-spec
id: spec:AST-018
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
affects_consumer_docs: [theme, color]
---

# Approved tonal palette metadata system spec

## Intent

Give maintained themes a typed, validated inventory of approved numbered color
stops. Theme authors and tooling can reference exact approved colors without
turning every stop into a portable semantic token or adding the palette to the
default runtime theme module.

Semantic tokens remain the primary interface for components and applications.
Palette stops are an authoring fallback for defining those semantic tokens,
theme-owned component mappings, visualizations, and other cases where the
portable vocabulary does not express the required color.

“Approved” means that a palette is intentionally maintained and reviewed by its
owning theme. `defineTonalPalettes()` validates the data contract; it does not
grant design approval or certify accessibility.

## Terminology

This record uses the vocabulary already established by the Neutral remap:

- A theme has one **palette map**.
- The map contains one or more named **families**, such as `neutral` or `red`.
- A family contains a required light **ramp** and an optional dark ramp.
- A ramp contains the complete set of numbered **stops**.
- A palette-bearing build emits one **palette artifact set** for the theme in
  JavaScript, JSON, and TypeScript declaration formats.

## Non-goals

- Enforcing that every theme color comes from a declared palette.
- Rejecting direct CSS colors or requiring an exception mechanism before a theme
  can use one.
- Treating a palette stop as a semantic role or accessibility guarantee.
- Exposing numbered palette stops as portable Core tokens for component or
  application code.
- Generating semantic tokens automatically from hue, chroma, or stop numbers.
- Approving any particular theme's palette values, mappings, or visual result.
- Adding repository-wide palette linting in the initial contract implementation.

## Requirements

- **FR1 — Palette metadata is optional and additive.** The `defineTheme()`
  configuration MAY accept an optional named palette map. A theme that omits it
  retains its existing runtime, build, inheritance, and package behavior.
  Palette metadata MUST NOT alter CSS merely because it is declared.
- **FR2 — Declared ramps are complete and validated.** Every declared family
  MUST provide a complete light ramp for the approved numbered stop set and MAY
  provide a separately tuned dark ramp. There is no required family set: a theme
  such as Stone MAY declare only one family, and an omitted dark ramp means that
  family intentionally uses its light ramp in both modes. Values MUST be opaque
  six-digit hex colors ordered from darker to lighter by relative luminance.
  Unknown family and ramp fields MUST be rejected. Hue, chroma, semantic labels,
  and descriptions are optional metadata rather than generators.
- **FR3 — Semantic tokens remain first.** Components and applications SHOULD use
  portable semantic tokens. Maintained theme source MAY select an exact palette
  stop when defining semantic tokens or theme-owned component mappings. The
  existence of a palette MUST NOT make numbered stops part of the portable token
  contract.
- **FR4 — Palette usage is not hard-enforced.** Existing token and component
  value contracts MUST continue to accept direct CSS colors. Intentional
  deviations MAY be used for alpha overlays, composited colors, externally
  defined brand colors, contrast-specific adjustments, or other cases where no
  approved opaque stop satisfies the requirement. A palette validator MUST NOT
  reinterpret or reject those values.
- **FR5 — Theme adoption owns values and exceptions.** Each adopting theme's
  colocated theme spec owns its palette inventory, selected token and component
  mappings, intentional deviations, visual approval, and accessibility evidence.
  Sharing a palette stop does not prove that every foreground/background or
  interaction-state pairing meets its required contrast.
- **FR6 — Extension is deterministic by family.** A child theme MUST inherit its
  base theme's resolved palette families and MAY replace a family by restating
  its exact family name. Family replacement is shallow; stops from two versions
  of one family MUST NOT be combined into an unreviewed ramp. Family names are
  local to their owning theme; independently imported `neutralPalettes.red` and
  `stonePalettes.red` do not share a global namespace. Tooling MUST NOT combine
  unrelated palette artifact sets into an unqualified global family map.
- **FR7 — Runtime and artifact boundaries are explicit.** Source themes retain
  resolved palette metadata for authoring and source-theme extension. The default
  built runtime module MUST omit it. A palette-bearing static build MUST emit
  exactly one logical palette artifact set containing the same resolved metadata
  in JavaScript, JSON, and TypeScript declaration formats. The formats are not
  independent palettes, and color families MUST NOT be emitted as separate
  artifact sets.
- **FR8 — Optional artifacts have a complete lifecycle.** Build and `--check`
  behavior MUST create, compare, report, and remove every file in the palette
  artifact set as the source adds, changes, or removes palette metadata.
  Palette-free themes MUST remain buildable when the installed Core version
  predates this optional contract; a palette-bearing theme MUST fail clearly
  when that Core support is unavailable.
- **FR9 — Published palette removal is compatibility work.** Local and
  unpublished builds MAY remove obsolete palette artifacts automatically. Once a
  published package exposes a `/palette` subpath, removing its palette MUST also
  remove the package export through an explicitly reviewed breaking Changeset and
  migration note. A published export MUST NOT remain pointed at a deleted
  palette artifact.

### Platform support

- Supported feature/engine floor: every platform that consumes the existing
  theme authoring object or the CLI's generated theme artifacts.
- Unsupported behavior: a consumer MUST NOT infer semantic meaning or accessible
  pairings from stop numbers alone.
- Browser evidence: palette structure and artifacts are nonvisual; each adopting
  theme supplies real-browser evidence for its actual light, dark, component, and
  interaction-state mappings.

## Current-state impact

Current `main` has semantic color tokens and theme-local values but no typed
inventory for complete approved ramps. Theme authors either repeat literal
colors or maintain palette knowledge outside the theme contract.

This proposal adds optional `palettes` metadata to the normalized source theme,
validates complete ramps, inherits families, and emits an opt-in palette artifact
set. It does not change the meaning or accepted values of `tokens`, `localTokens`,
or component overrides. Neutral is the first proposed adopter; its exact ramps,
mappings, deviations, contrast receipts, and visual approval remain owned by
`theme:neutral`.

A focused `check:theme-palettes` repository check is planned as follow-up tooling,
not as an additional requirement for the initial implementation PR. It should
fail for package-export/artifact mismatches, orphan artifacts, and malformed
families; warn about unusually large palette output and direct colors that match
an existing stop; and preserve intentional deviations allowed by FR4. Consumer
guidance should say to use an approved stop when one satisfies the requirement,
rather than implying that direct colors are always prohibited.

## Verification

| Contract | Verification                                                            | Representative states                                                                                    | Mutation or failure expectation                                                                                           |
| -------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| FR1–FR2  | `packages/core/src/theme/palettes.test.ts` and `defineTheme.test.ts`    | omitted metadata; complete and incomplete ramps; invalid colors, order, and fields                       | An omitted palette changes a theme, or malformed metadata is accepted.                                                    |
| FR3–FR5  | Neutral source, theme spec, token tests, and rendered contrast evidence | semantic mapping; direct color; alpha overlay; light/dark component pairing                              | Palette declaration becomes mandatory, a justified direct value is rejected, or a stop is treated as accessibility proof. |
| FR6      | Core theme-extension tests                                              | inherited families; exact family replacement; omitted dark ramp                                          | A child loses unrelated families or accidentally merges partial ramps.                                                    |
| FR7–FR8  | CLI palette build and older-Core compatibility tests                    | source and built bases; JS/JSON/declaration outputs; add/change/remove; `--check`; palette-free old Core | Runtime output gains unused metadata, palette artifacts drift or remain stale, or an unrelated older-Core build fails.    |
| FR9      | Package-export and Changeset checks                                     | unpublished cleanup; published `/palette` retention and removal                                          | An exported palette artifact disappears without compatibility treatment, or an export points to a deleted file.           |

## Decision log

No decisions are authoritative while this record remains a draft. The proposed
contract intentionally keeps palette adoption optional and permits explicit
theme-owned deviations rather than enforcing palette-only authoring.

## Open questions

- **OQ1 — Do the owners approve optional, non-enforced palette adoption as the
  public contract?** (`human-api`) Promotion requires explicit approval of the
  boundary in FR3–FR5, including intentional deviations.
- **OQ2 — Are JavaScript, JSON, and TypeScript declarations the supported palette
  artifact set?** (`human-api`) Promotion requires agreement that these opt-in
  outputs are useful enough to become maintained package and CLI contracts.
- **OQ3 — Is Neutral's exact palette and remapping evidence complete?**
  (`human-design`) This does not block evaluation of the generic contract, but
  Neutral adoption requires separate exact-head theme approval.
