---
schema_version: 2
template_version: 1
kind: theme
id: theme:neutral
authority: draft
approved_by: null
approved_at: null
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
  ]
---

# Neutral theme specification

This draft is a theme-record example and a factual inventory. It does not decide
local-token, palette-generation, compiler, or artifact APIs; separate system
specifications own those proposals.

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

Current source has no accepted first-class theme-local-role API. Candidate
Neutral-only repeated meanings from unlanded work include filled accent, success,
warning, and error status colors and content/interaction colors used on tinted
surfaces. Their names, authoring API, namespace, inheritance, and validation are
not decided here; a separate draft system spec must be accepted first.

## Tonal palette definitions

Candidate source work contains complete light and separately tuned dark ramps for
neutral, red, orange, yellow, green, teal, cyan, blue, purple, and pink. This is
useful theme-owned inventory and evidence, not a requirement to adopt a palette
generator or publish palette artifacts. Those cross-theme choices require a
separate draft system spec.

## Component and state mappings

Current source is the implementation baseline. Candidate mappings under review
share filled status color across Badge, compact status indicators, Stepper, Table
row status, and ProgressBar, and preserve legibility of Banner content on tinted
surfaces. This record does not change which component states exist or authorize
unlanded mappings.

## Compatibility and migration

This knowledge-only record changes no package output. Existing Neutral authoring,
portable token overrides, runtime behavior, and package exports remain unchanged.
Any future API adoption is optional and requires its own accepted system spec,
implementation evidence, compatibility plan, and release note.

## Accessibility and contrast evidence

A current cross-theme design record for contrast methodology does not yet exist,
so this draft does not select or restate a methodology. The future record is an
unresolved dependency and therefore is not listed in frontmatter.

Current Neutral-specific receipts include the Badge contrast check and pairings
documented beside Neutral source. Candidate mappings still need receipts for the
actual light/dark and interaction states they affect. This record will own those
pairings, exceptions, measurements, and known gaps after the shared methodology
is current; it will not copy the methodology or shared measurement-tool
implementation.

## Build and artifact contract

The package manifest and existing build tests define Neutral's current runtime,
CSS, declaration, and export outputs. This record does not require new generated
palette or local-token artifacts.

## Verification map

| Theme contract            | Evidence                                   | Representative states                      | Failure signal                                                  |
| ------------------------- | ------------------------------------------ | ------------------------------------------ | --------------------------------------------------------------- |
| Current value inventory   | Neutral source and theme tests             | light/dark token families                  | Source and record disagree about a theme-owned meaning.         |
| Component mappings        | Theme tests and rendered evidence          | status and interaction states              | A mapped state loses its intended distinction.                  |
| Contrast                  | Badge check plus rendered component matrix | light/dark and interactive states          | A required pairing falls below its threshold.                   |
| Existing package contract | Theme build, package, and resolution tests | runtime, CSS, declarations, public exports | This record implies an artifact that the package does not ship. |

## Decision log

No theme decision is accepted while this record has `authority: draft`.

## Open questions

- Which candidate Neutral values and component mappings should become current
  after their cross-theme enabling APIs, if any, are settled separately?
- What current design record should own the cross-theme contrast methodology
  before Neutral can rely on it through `references`?
- Which rendered pairings and interaction states still need theme-specific
  measured receipts?

## Content boundary

This record owns Neutral's intent, factual value inventory, selected mappings,
required pairings/states, theme-specific exceptions, measured receipts, known
gaps, compatibility, and package facts. A future current design record owns the
cross-theme contrast methodology; shared measurement implementation belongs to
architecture/tooling. This record does not define cross-theme local-token or
palette APIs. Component/family records own observable behavior, and consumer
docs own supported syntax and examples.
