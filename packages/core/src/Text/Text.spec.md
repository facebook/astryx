---
schema_version: 1
template_version: 3
kind: component
id: component:Text
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [theming]
verified_by:
  [
    packages/core/src/Text/Text.test.tsx,
    packages/core/src/Heading/Heading.test.tsx,
    packages/core/src/theme/themingTargets.test.ts,
    scripts/check-knowledge.mjs,
  ]
families: []
design_specs: []
architecture: [architecture:component-theming-surface]
contributing: []
system_specs: []
---

# Text component contract

## Intent

Text renders themed body text through the Text component and semantic headings
through its referenced Heading member. This draft records their current consumer
anatomy, the two live root targets owned by the canonical Text documentation, and
the conditional Tooltip delegation used for truncated content. It does not
change runtime behavior, styling, targets, or public API.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: additive documentation only; runtime, DOM, styling,
  targets, and public API remain unchanged
- Controlled/uncontrolled behavior: not applicable
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The polymorphic Text element and its current `text` theming target.
- The referenced Heading member's semantic heading element and its current
  `heading` theming target.
- Deciding from the current truncation state whether to compose Tooltip against
  the Text or Heading element.

**Does not own / non-goals**

- The truncation tooltip surface, layer behavior, or `tooltip` target — owned by
  Tooltip when that composed surface renders.
- Content supplied as Text or Heading children — owned by the caller.
- A separate Heading component contract; Heading remains a referenced member of
  the canonical Text documentation and target inventory.
- New typography behavior, truncation behavior, semantics, styling, targets,
  public API, or target aliases.

## Public concepts

No new public concept is introduced. Text and Heading props, defaults, and usage
remain documented in `Text.doc.mjs` and `Heading.doc.mjs`.

## Behavioral and layout contract

| ID  | Candidate invariant                                                                                                                                                                                                                                                                          | Basis                                             | Draft review state                                    |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------- |
| FR1 | Text renders one polymorphic text element carrying the current `text` target.                                                                                                                                                                                                                | Current source, docs, and tests                   | Verified current behavior; no new behavior decided    |
| FR2 | Heading renders one semantic `h1`–`h6` element carrying the current `heading` target. Heading is a referenced member of Text rather than a nested Text element.                                                                                                                              | Current source, docs, tests, and target history   | Verified current behavior and canonical ownership     |
| FR3 | Text or Heading composes Tooltip only when `maxLines` is positive, truncation tooltips are enabled, and measurement reports that the rendered content is truncated. Otherwise the truncation Tooltip path does not render.                                                                   | Current source, tests, and truncation history     | Verified current conditional behavior                 |
| FR4 | When the conditional truncation path renders, Tooltip owns the layer surface and applies the `tooltip` target. Text and Heading retain their own root targets and do not apply or claim Tooltip's target.                                                                                    | Current source and owner target metadata          | Verified current ownership; no target change          |
| FR5 | Text reflects `type`, `size`, and resolved `color` on `text`; Heading reflects `level`, `color`, and an explicitly supplied `type` on `heading`. Display mode, truncation state, semantic element choice, and Tooltip open state do not become separate anatomy parts or Text-owned targets. | Current source, docs, tests, and target inventory | Verified current capabilities; no new anatomy decided |

### Observed current behavior

These observations describe the implementation; they do not establish new
intent:

- Text defaults to a `span` and may render another supported text element through
  `as`. Heading maps `level` directly to `h1` through `h6`.
- Both members render caller content directly inside their targeted root element;
  neither creates a separately targeted content wrapper.
- Both members measure truncation only when `maxLines` is positive. When the
  measurement reports overflow and `hasTruncateTooltip` is not `false`, they
  lazy-load Tooltip in sibling-anchor mode.
- Tooltip owns its layer lifecycle and applies `tooltip` only to its own rendered
  layer. The truncated Text or Heading element remains the anchor and keeps only
  its own target.
- Text and Heading no longer add a native `title` for this path; the composed
  Tooltip is the single tooltip presentation.

### Allowed variation

- **AV1 — Text element and content.** Text may use any currently supported `as`
  element and either member may contain caller-supplied content without changing
  target ownership.
- **AV2 — Typography.** Level, type, size, color, weight, wrapping, decoration,
  and theme or consumer styling may vary through the existing APIs and targets.
- **AV3 — Conditional tooltip.** Fitting content, disabled truncation tooltips,
  and non-truncating configurations omit the delegated Tooltip path.

### Representative states

| State                                     | Required invariant                                                                         | Allowed variation                                 |
| ----------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| Text without truncation                   | One Text element carries `text`; no truncation Tooltip path renders.                       | Supported element, content, and typography props. |
| Heading without truncation                | One semantic heading carries `heading`; no Text target or truncation Tooltip path renders. | Heading level, accessibility level, and type.     |
| Truncation configured but content fits    | The owning Text or Heading root remains; no truncation Tooltip path renders.               | Line limit and available width.                   |
| Truncated with tooltip disabled           | The owning root remains clipped; no truncation Tooltip path renders.                       | Text or Heading owner.                            |
| Truncated with tooltip enabled and opened | The owning root anchors one Tooltip-owned surface carrying `tooltip`.                      | Placement and full text content.                  |

### Transformation and precedence order

- No new typography, truncation, element-selection, or styling precedence rule is
  introduced.

### Performance and resources

- This draft records the current shared ResizeObserver-based truncation path and
  lazy Tooltip composition but introduces no new measurement, observer, render,
  or loading requirement.

## Accessibility contract

This draft does not change or extend Text's polymorphic semantics, Heading's
native heading level and optional `aria-level`, or Tooltip's existing
`aria-describedby` ownership for truncated content.

## Design relationships

| Anatomy or state   | Design requirement                                                                | Representation authority       | Hierarchy role | Component contract |
| ------------------ | --------------------------------------------------------------------------------- | ------------------------------ | -------------- | ------------------ |
| Text               | Presents caller content in the current polymorphic text element.                  | Current source and public docs | Prominent      | FR1, FR5           |
| Heading            | Presents caller content in the referenced semantic Heading member.                | Current source and public docs | Prominent      | FR2, FR5           |
| Truncation tooltip | Presents the full content only on the current measured-overflow and enabled path. | `component:Tooltip`            | Supporting     | FR3, FR4           |

Text and Heading are sibling public components represented by the canonical Text
documentation; Heading is not nested inside Text. The Tooltip row is conditional
composition rather than a Text- or Heading-owned surface.

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Text": {"target": "text"},
  "Heading": {"target": "heading"},
  "Truncation tooltip": {
    "delegatesTo": {"owner": "component:Tooltip", "target": "tooltip"}
  }
}
```

The two local targets are the exact current targets declared by the canonical
Text doc. The delegated `tooltip` target applies only when the conditional
truncation path reaches Tooltip and Tooltip renders its layer; it is not a
Text- or Heading-owned target. No anatomy part requires a `none` disposition.

## Family and system relationships

- `architecture:component-theming-surface` owns anatomy qualification, aggregate
  parent/member target ownership, exact target mapping, and delegation.
- Text is the canonical documentation and contract owner for both `text` and
  `heading`; Heading remains a referenced member and does not receive a separate
  component spec.
- Tooltip retains ownership of its delegated surface, interaction behavior, and
  `tooltip` target.

## Verification map

| Contract            | Verification                                                                                   | Representative states                                   | Mutation or failure expectation                                                                                     | Audit section           |
| ------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| FR1, FR5            | `Text.test.tsx` and `themingTargets.test.ts`                                                   | Default, polymorphic, custom type/color, explicit size  | Removing, renaming, or changing the current Text target capabilities fails focused or global target assertions.     | `audit:Text/theming`    |
| FR2, FR5            | `Heading.test.tsx`, `themingTargets.test.ts`, and target-introduction history                  | Levels 1–6, display type, custom color                  | Removing, renaming, or changing the current Heading target capabilities fails focused or global assertions.         | `audit:Heading/theming` |
| FR3, FR4            | Text and Heading source inspection, truncation tests, Tooltip target metadata, and fix history | Fitting, overflowing, disabled, enabled                 | Moving the surface or target into Text/Heading, or restoring a native duplicate tooltip, violates current evidence. | `audit:Text/anatomy`    |
| Theming anatomy map | `scripts/check-knowledge.mjs`                                                                  | Canonical anatomy, both local targets, Tooltip delegate | Missing, extra, prefixed, stale, multiply assigned, or invalid delegated mappings fail repository validation.       | `audit:Text/theming`    |

Current focused tests pin both local target names and Text's lack of a duplicate
native `title`. The conditional Tooltip path and Heading's matching no-`title`
behavior are established by shared source shape and history rather than a
separate focused assertion in each suite.

## Decision log

None. This draft records current facts and introduces no component-local design,
API, behavior, accessibility, or theming decision.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables/examples, typography token
values, truncation measurement mechanics, Tooltip internals, implementation
steps, current audit results, or system theming rules. It links to their owners.
