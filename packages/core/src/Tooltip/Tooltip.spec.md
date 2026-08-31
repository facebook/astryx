---
schema_version: 1
template_version: 3
kind: component
id: component:Tooltip
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [theming]
verified_by:
  [packages/core/src/Tooltip/Tooltip.test.tsx, scripts/check-knowledge.mjs]
families: [family:overlay-dismissal]
design_specs: []
architecture:
  [
    architecture:component-theming-surface,
    architecture:interaction-modality,
    architecture:layer-runtime,
    architecture:public-component-api,
  ]
contributing: []
system_specs: []
---

# Tooltip component contract

## Intent

Tooltip renders supplied tooltip content on an owned overlay surface associated
with a caller-owned trigger. This draft records current consumer anatomy and
theming ownership without deciding layer behavior, positioning, or new visual
parts.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: additive documentation only; runtime, DOM, styling,
  targets, and public API remain unchanged
- Controlled/uncontrolled behavior: unchanged
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The rendered tooltip surface and content inside that surface.

**Does not own / non-goals**

- The trigger element — supplied by the caller or referenced externally and
  outside Tooltip's owned anatomy.
- An arrow element — the current implementation renders none.
- Layer lifecycle, light dismissal, and anchor-positioning policy — outside this
  factual anatomy backfill.

## Public concepts

No new public concept is introduced. Consumer props and usage remain documented
in `Tooltip.doc.mjs` and `useTooltip.doc.mjs`.

## Behavioral and layout contract

| ID  | Candidate invariant                                                                                  | Basis                           | Draft review state                                 |
| --- | ---------------------------------------------------------------------------------------------------- | ------------------------------- | -------------------------------------------------- |
| FR1 | The current rendered tooltip contains one owned surface with the supplied tooltip content inside it. | Current source, docs, and tests | Verified current behavior; no new behavior decided |
| FR2 | The surface carries the current `tooltip` target; its content has no separate target.                | Current source and public docs  | Verified current behavior; no target change        |

### Allowed variation

- Supplied content may vary without adding a Tooltip-owned child target.

### Representative states

- The owned anatomy is unchanged across wrapped-trigger and external-anchor
  modes; the trigger remains outside it.

### Transformation and precedence order

- No new ordering or positioning rule is introduced.

### Performance and resources

- No new performance or resource rule is introduced.

## Accessibility contract

This draft does not change or extend Tooltip's existing accessibility behavior.

## Design relationships

| Anatomy or state | Design requirement                                  | Representation authority       | Hierarchy role | Component contract |
| ---------------- | --------------------------------------------------- | ------------------------------ | -------------- | ------------------ |
| Tooltip surface  | Presents the current painted overlay surface.       | Current source and public docs | Supporting     | FR1, FR2           |
| Tooltip text     | Presents supplied content within the owned surface. | Current source and public docs | Prominent      | FR1, FR2           |

The trigger is caller-owned and outside this anatomy. The current implementation
has no arrow element.

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Tooltip surface": {"target": "tooltip"},
  "Tooltip text": {"inherits": "tooltip"}
}
```

## Family and system relationships

This draft references the current shared owners without restating their rules:
`architecture:component-theming-surface`, `family:overlay-dismissal`,
`architecture:interaction-modality`, `architecture:layer-runtime`, and
`architecture:public-component-api`.

## Verification map

| Contract            | Verification                          | Representative states                 | Mutation or failure expectation                                                  | Audit section           |
| ------------------- | ------------------------------------- | ------------------------------------- | -------------------------------------------------------------------------------- | ----------------------- |
| FR1                 | `Tooltip.test.tsx` role/content suite | Rendered surface and supplied content | Removing the surface or content fails existing tooltip role and text assertions. | `audit:Tooltip/anatomy` |
| Theming anatomy map | `scripts/check-knowledge.mjs`         | Canonical anatomy and current target  | Missing, extra, prefixed, or stale mappings fail repository validation.          | `audit:Tooltip/theming` |

## Decision log

None. This draft records current facts and introduces no component-local design
or layer-system decision.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables, examples, layer-system rules,
implementation steps, or system rules. It links to their owners.
