---
schema_version: 2
template_version: 1
kind: theme
id: theme:neutral
authority: current
approved_by: rubyycheung
approved_at: 2026-09-04
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

This record is the current approved palette and Neutral token-mapping record.
It does not decide cross-theme local-token, palette-generation, compiler, or
artifact APIs; current `spec:AST-006` owns the accepted local-token contract.
DEC-2 ratifies the exact palette shipped by this change, and DEC-4 ratifies the
reviewed Neutral token mappings shipped with it. Proposed local-token roles and
additional component mappings remain separate work and must not be treated as
an approved public contract.

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

Neutral's candidate implementation owns the approved accent role and proposes
the related roles below for exact-head review:

| Exact name                                             | Neutral-only meaning                                | Proposed value               | Status   |
| ------------------------------------------------------ | --------------------------------------------------- | ---------------------------- | -------- |
| `--astryx-theme-neutral-color-status-fill-accent`      | Filled accent status                                | `['#0074e2', '#6d9cfe']`     | Approved |
| `--astryx-theme-neutral-color-status-fill-success`     | Filled success status                               | `['#198100', '#64af4c']`     | Proposed |
| `--astryx-theme-neutral-color-status-fill-warning`     | Filled warning status                               | `'#ffce2f'`                  | Proposed |
| `--astryx-theme-neutral-color-status-fill-error`       | Filled error status                                 | `['#c9303a', '#ff705d']`     | Proposed |
| `--astryx-theme-neutral-color-on-tint-neutral`         | Neutral content placed on a semantic tinted surface | `['#fafafa4D', '#0a0a0a4D']` | Proposed |
| `--astryx-theme-neutral-color-on-tint-overlay-hover`   | Hover overlay placed on a semantic tinted surface   | `['#fafafa1A', '#0a0a0a1A']` | Proposed |
| `--astryx-theme-neutral-color-on-tint-overlay-pressed` | Pressed overlay placed on a semantic tinted surface | `['#fafafa33', '#0a0a0a33']` | Proposed |

AST-006 is current and accepted, and its implementation is proposed separately
in the parent local-token PR. This stacked candidate authors and consumes exact
names without aliases:

```ts
localTokens: {
  '--astryx-theme-neutral-color-status-fill-accent': ['#0074e2', '#6d9cfe'],
},
components: {
  badge: {
    'variant:info': {
      backgroundColor:
        'var(--astryx-theme-neutral-color-status-fill-accent)',
    },
  },
},
```

The `localTokens` key, component `var(...)` reference, `DefinedTheme` map, and
emitted custom property use the same complete name. The proposed value prefers
the approved `[light, dark]` `TokenValue` tuple, which normalizes exactly as the
same tuple does under existing `tokens`. Opt-in uses Neutral's existing
`name: 'neutral'` byte-for-byte; it is already a valid stable lower-kebab
identifier, so no name normalization occurs.

Once shipped, the exact name and filled-accent-status meaning are a public
Neutral-family compatibility contract. The role is not portable to other themes
and is not intended for Core component source. Its length is acceptable because
it accurately names the context in which it may be applied; output alone does
not authorize a broader meaning.

## Tonal palette definitions

Candidate source work contains complete light and dark ramps for neutral, red,
orange, yellow, green, teal, cyan, blue, purple, and pink. The committed request,
generated module, and receipt make the reviewed `astryx-oklch-v1` result
reproducible. Draft `spec:AST-018` separately owns the cross-theme authoring and
validation contract. Regeneration is an explicit reviewed palette change and
never occurs during a normal theme build. Mapping runtime tokens to these stops
is reviewed in a separate stacked change.

The approved dark-mode adjustment reduces realized chroma to 50% through stop
25 for chromatic families, with a 65% family override for yellow, and recovers
smoothly to the standard recipe at stop 60. It leaves the light ramps, neutral
ramps, and stops 60 through 100 unchanged. It does not use opacity or change
tone coordinates.

## Component and state mappings

The candidate maps the shared status-fill roles across Badge, StatusDot,
AvatarStatusDot, Stepper indicators, and ProgressBar wherever the existing state
already has the same semantic meaning. Banner uses the proposed tint-content and
interaction roles. Every mapping remains subject to exact-head theme review and
rendered light/dark evidence; shared color alone is not enough.

This work does not add component states. It intentionally excludes
`table-row-status`, which has no approved theming target, and SegmentedControl
geometry/shadow changes, which are reviewed independently.

## Compatibility and migration

This record documents the package output shipped by the current Neutral change.
Existing Neutral authoring and portable token names remain stable while the
reviewed mappings are emitted through the runtime theme and CLI template.
Neutral explicitly supplies `localTokens`; the exact names and meanings are
therefore part of its public compatibility contract.

Implementation requires the parent AST-006 implementation to ship first,
followed by complete rendered evidence and exact-head approval for every
proposed value and mapping. When Neutral ships a definition, its exact name and
approved semantic meaning become a public compatibility contract of the Neutral
family. A local-token name, enrolled theme name, or semantic meaning change must
preserve descendants and consumers through an explicit reviewed migration or
alias. Compiled CSS does not broaden a role beyond its approved contexts.

## Accessibility and contrast evidence

A current cross-theme design record for contrast methodology does not yet exist,
so this draft does not select or restate a methodology. The future record is an
unresolved dependency and therefore is not listed in frontmatter.

Current Neutral-specific receipts include the Badge contrast check and pairings
documented beside Neutral source. The candidate accent fill uses `#0074e2` in
light mode and `#6d9cfe` in dark mode, but those values are not an accessibility
claim by themselves. Adoption requires the actual Badge informational foreground
and background pairing to meet its threshold in rendered light and dark states;
every later mapping needs receipts for its foreground, graphical-object,
interaction, and disabled states. No palette stop is accessible by itself, and
color cannot replace another signal required by the component contract. This
record will own those pairings, exceptions, measurements, and known gaps after
the shared methodology is current; it will not copy the methodology or shared
measurement-tool implementation.

## Build and artifact contract

The package manifest and build tests define Neutral's runtime, CSS, declaration,
and export outputs. The complete palette remains in a theme-owned source file
for authoring and audits, while the generated selected-stop references used by
`defineTheme` are included in the runtime and CLI template artifacts. The
complete authoring palette is not bundled into generated CSS or generic
theme-build artifacts.

## Verification map

| Theme contract            | Evidence                                            | Representative states                                          | Failure signal                                                                                                 |
| ------------------------- | --------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Current value inventory   | Neutral source and theme tests                      | light/dark token families                                      | Source and record disagree about a theme-owned meaning.                                                        |
| Local role contract       | Planned AST-006 implementation and Neutral fixtures | exact declaration/use/output name; public meaning; rename      | The shipped name or meaning changes without reviewed compatibility handling, or leaks into portable/Core APIs. |
| Component mappings        | Theme-spec review and rendered evidence             | Badge info; each future mapping; light/dark; interaction state | A mapping does not genuinely mean filled accent status or lands without contextual evidence.                   |
| Contrast                  | Badge check plus rendered component matrix          | light/dark and interactive states                              | A required pairing falls below its threshold.                                                                  |
| Existing package contract | Theme build, package, and resolution tests          | runtime, CSS, declarations, public exports                     | This record implies an artifact that the package does not ship.                                                |

## Decision log

The decisions below record settled input for the portions they name. DEC-2
approves the exact palette, and DEC-4 approves the reviewed token mappings
shipped by this release. Local-token roles and rendered-evidence questions
remain subject to the specific approval gates stated in their decisions.

### DEC-1 — Own one exact Neutral filled-accent-status role

**Reference:** `theme:neutral/DEC-1`
**System-boundary decider:** `cixzhang`, `2026-08-31`
**Final Neutral adoption decider:** `rubyycheung`, after OQ1 passes and exact-head review

Neutral owns theme-local definitions in this colocated theme spec. It may adopt
`--astryx-theme-neutral-color-status-fill-accent` for filled accent status using
its exact stable `name: 'neutral'`. The exact name and semantic meaning become a
public Neutral-family compatibility contract when shipped, despite not being
portable across themes or intended for Core component source. The long name is
acceptable because it precisely states the role.

The token may be applied only where the mapped context genuinely means filled
accent status. Each added mapping is a theme-spec compatibility review and needs
rendered evidence for its actual light/dark and relevant interaction states.
Neither the proposed value nor any mapping is authorized until OQ1 passes and
`rubyycheung` ratifies the exact record head.

Rejected: treating the role as global, treating it as disposable private output,
or applying it merely because two contexts currently share a color.

### DEC-2 — Approve the Neutral palette as a decision anchor

**Reference:** `theme:neutral/DEC-2`

**Decider:** `rubyycheung`, `2026-09-02`

Neutral's exact palette values are approved as the stable starting point for
subsequent color and contrast decisions. The request, generated result, receipt,
and visual review must change together. Runtime token mappings are deliberately
excluded from this decision and reviewed in a separate stacked change. The
complete authoring palette is not added to the runtime theme object or generated
CSS.

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

## Open questions

- **OQ1 — Is rendered light/dark evidence complete for the proposed tuple and
  Badge mapping, and for every later mapping's relevant interaction states?**
  (`checkable`) Neutral promotion and implementation remain blocked until the
  actual pairings meet the applicable current contrast methodology, each mapped
  context is visibly verified, and `rubyycheung` ratifies that exact record head.
- **OQ2 — Do the proposed success, warning, error, and tint roles have stable
  meanings across every listed component mapping?** (`checkable`) The additional
  names remain proposals until reviewers confirm each mapping represents the
  same semantic role rather than merely sharing a current color value.

## Content boundary

This record owns Neutral's intent, factual value inventory, approved local-token
name and meaning, proposed value, selected mappings, required pairings/states,
theme-specific exceptions, measured receipts, known gaps, compatibility, and
package facts. A future current design record owns the cross-theme contrast
methodology; shared measurement implementation belongs to
architecture/tooling. This record does not define cross-theme local-token or
palette APIs. `spec:AST-006` owns the cross-theme local-token API, namespace,
validation, lineage, and compiler invariants. Component/family records own
observable behavior, and consumer docs own supported syntax and examples.
