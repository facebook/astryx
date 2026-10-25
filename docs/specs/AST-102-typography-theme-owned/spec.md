---
schema_version: 4
template_version: 2
kind: system-spec
id: spec:AST-102
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-10-24
phase: accepted
owners: [cixzhang]
affects_architecture: []
affects_families: [family:input-fields]
affects_contributing: []
affects_consumer_docs: []
---

# Typography stays theme-owned system spec

<!-- path-applicability:v1 -->

```json
{
  "paths": ["packages/core/src/**", "packages/lab/src/**", "packages/themes/**"]
}
```

<!-- Describe the system, not the project: present tense, what it does. No proposals, history, pull requests, or research in the record; see docs/contributing/spec-writing.md and report its rubric results in the pull request. -->

## Intent

People see the typography their theme chose in every Astryx component, on
every platform: no component swaps in a platform font or its own text size.
Where a shipped Astryx theme has no brand typeface for body text, it can use
the platform's own body font, so text reads like the rest of the person's
device.

## Non-goals

- Whether a theme scales its text sizes with the person's system text-size
  setting, such as iOS Dynamic Type (OQ1).
- Any new public theme option or document attribute for system text size
  (OQ2).
- Which typeface a branded theme uses; a brand keeps its own.
- The type scale itself: `design:typography-hierarchy` and
  `design:mobile-typography` own roles, sizes, and the mobile reading base.

## Requirements

- **FR1 — Components never override typography.** No Core or Lab web
  component sets the font family, font size, or line height of text it renders
  except through the theme's typography tokens. That includes platform font keywords such as `-apple-system-body`
  and system font stacks: a component never applies one directly, on any
  pointer. A font size that sizes an icon, such as a `1em` icon at a
  `spec:AST-087` FR10 size, is not text typography. Native components follow
  the platform's own text settings (`spec:AST-082` FR11). Typography values come only from the theme. The one
  exception is a size floor a current family record requires, such as the iOS
  16 px text-entry floor of `family:input-fields` FR9.
- **FR2 — Unbranded shipped themes may use the system body font.** An Astryx
  shipped theme whose body font is not branded MAY set its body font token to
  the platform's system body font family, such as `system-ui` or Apple's
  system font. Whether body text also takes its size from the person's iOS
  text-size setting, through `-apple-system-body`, is OQ1. A branded theme
  keeps its brand font for body text. The choice lives in the theme's token
  value, so components pick it up without change (FR1).

### Platform support

- Supported feature/engine floor: the package's supported browsers
  (`spec:AST-013` FR1, FR3). Platform font keywords that an engine does not
  recognize fall back to the rest of the theme's font stack.
- Unsupported behavior: none beyond the font fallback above.
- Browser evidence: Safari on iOS proves an FR2 theme's body text in the system
  body font (`spec:AST-013` FR10); token and source checks prove FR1.

## Current-state impact

- Core's default body font is the system font stack, an unbranded value FR2
  allows. Each shipped theme package sets a brand body font and keeps it.
- Some components set typography outside the theme today, such as Lab's
  Sankey labels using `system-ui` directly and several Core and Lab components
  setting their own sizes or line heights; under FR1 those are conformance
  gaps.

## Verification

| Contract | Verification                                                      | Representative states                                                                                                              | Mutation or failure expectation                                                                                                |
| -------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| FR1      | Source check over Core and Lab component styles plus token review | font family, size, and line height in component styles; coarse and fine pointer; a platform font keyword; the iOS text-entry floor | A component sets a font family, size, or line height outside typography tokens, or applies a platform font keyword directly    |
| FR2      | Theme token review plus Safari on iOS, top-level document         | an unbranded shipped theme using the system body font family; a branded theme; the default theme                                   | A branded theme's body font replaced by the system font, or a system body font applied by a component instead of a theme token |

## Decision log

### DEC-1 — Typography is the theme's; unbranded shipped themes may use the system body font

**Reference:** `spec:AST-102/DEC-1`
**Decider:** `cixzhang`, `2026-10-24`

A component that swaps in a platform font or its own text size breaks the
theme's typography for that one surface, and a product cannot see or tune it.
Keeping every family, size, and line height in theme tokens means the theme
decides, everywhere. Where a shipped theme has no brand typeface, the system
body font is the most familiar choice for the person reading, so those themes
may use it through their own token; a brand keeps its typeface.

Rejected: components applying a platform font such as `-apple-system-body` directly.

## Open questions

- **OQ1 — Which themes may scale sizes with the system text-size setting?**
  (`human-design`) A theme could scale its own font-size tokens with iOS
  Dynamic Type, alongside `design:mobile-typography` DR1's reading base.
  Options: any theme that opts in, branded ones included; or only unbranded
  shipped themes. This includes whether an unbranded theme's body text uses
  `-apple-system-body`, which carries the system text size as well as the
  family.
- **OQ2 — New public surface for system text size.** (`human-design`) Scaling
  would add a theme option (such as `typography.dynamicType`) and a document
  attribute carrying the system text size (such as `data-astryx-text-size`),
  both new public surface under `spec:AST-002`. Options: admit both; admit only
  the theme option and keep the attribute internal; or add neither and leave
  sizes fixed.
