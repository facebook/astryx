---
schema_version: 3
template_version: 3
kind: component
id: component:Divider
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [theming]
verified_by:
  [packages/core/src/Divider/Divider.test.tsx, scripts/check-knowledge.mjs]
modules: []
families: []
design_specs: []
architecture:
  [architecture:component-theming-surface, architecture:container-padding]
contributing: []
system_specs: []
---

# Divider component contract

## Intent

Divider presents a separator group as one rule, or as two rules around an
optional label. This draft records current consumer anatomy and theming
reachability without changing runtime behavior, styling, targets, or public API.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: additive documentation only; runtime, DOM, styling,
  targets, aliases, and public API remain unchanged
- Controlled/uncontrolled behavior: not applicable
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The separator group, its current `divider` target, the painted rule segments,
  and the optional label placement.

**Does not own / non-goals**

- The meaning of the content regions separated by the divider, which is owned by
  the product callsite.
- Container inset publication or structural page regions. Divider only reads
  inherited container geometry when `isFullBleed` is enabled.
- Whether Rule or Label should gain public targets, which is unresolved by this
  factual backfill.

## Public concepts

No new public concept is introduced. Consumer props and usage remain documented
in `Divider.doc.mjs`.

## Behavioral and layout contract

| ID  | Candidate invariant                                                                                      | Basis                           | Draft review state                                  |
| --- | -------------------------------------------------------------------------------------------------------- | ------------------------------- | --------------------------------------------------- |
| FR1 | The current render contains one rule without a label and two rules with the optional label between them. | Current source, docs, and tests | Verified current behavior; no new behavior decided  |
| FR2 | The divider group carries the current `divider` target; Rule and Label currently carry no public target. | Current source, docs, and tests | Verified current behavior; theming intent unsettled |

### Allowed variation

- Orientation, visual weight, full-bleed layout, and label content may vary
  without changing the three-part anatomy recorded here.

### Representative states

- Unlabelled horizontal and vertical dividers render one Rule.
- Labelled horizontal and vertical dividers render Label between two instances
  of Rule.

### Transformation and precedence order

- No new layout or styling precedence rule is introduced.

### Performance and resources

- No new performance or resource rule is introduced.

## Accessibility contract

This draft does not change or extend Divider's existing separator naming or
orientation behavior.

## Design relationships

| Anatomy or state | Design requirement                                                | Representation authority       | Hierarchy role | Component contract |
| ---------------- | ----------------------------------------------------------------- | ------------------------------ | -------------- | ------------------ |
| Divider group    | Arranges the separator's rule segments and optional label.        | Current source and public docs | Supporting     | FR1, FR2           |
| Rule             | Paints the separator line in the selected orientation and weight. | Current source and public docs | Supporting     | FR1, FR2           |
| Label            | Presents optional content between two rule segments.              | Current source and public docs | Prominent      | FR1, FR2           |

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Divider group": {"target": "divider"},
  "Rule": {
    "none": {
      "reason": "unsettled: No current public target reaches this part"
    }
  },
  "Label": {
    "none": {
      "reason": "unsettled: No current public target reaches this part"
    }
  }
}
```

The two `none` dispositions record current reachability while target exposure
remains unsettled. They do not decide that Rule or Label should remain without
public targets.

## Family and system relationships

`family:layout-regions` does not own Divider: separating content is not a
structural page-region contract. `architecture:container-padding` owns the
inherited inset geometry that Divider reads only when `isFullBleed` is enabled.
`architecture:component-theming-surface` owns anatomy qualification, target
mapping, and the difference between factual reachability and intended public
theming API.

## Verification map

| Contract            | Verification                                     | Representative states                | Mutation or failure expectation                                                                   | Audit section           |
| ------------------- | ------------------------------------------------ | ------------------------------------ | ------------------------------------------------------------------------------------------------- | ----------------------- |
| FR1                 | `Divider.test.tsx` structure and label suites    | Labelled and unlabelled; both axes   | Removing or reordering Rule or Label instances fails existing child-count and content assertions. | `audit:Divider/anatomy` |
| FR2                 | Source inspection and current target inventories | Group, Rule, and Label               | Adding or documenting a current target without updating the anatomy map fails repository checks.  | `audit:Divider/theming` |
| Theming anatomy map | `scripts/check-knowledge.mjs`                    | Canonical anatomy and current target | Missing, extra, prefixed, stale, or alias-backed mappings fail repository validation.             | `audit:Divider/theming` |

## Decision log

None. This draft records current facts and introduces no component-local design
or theming decision.

## Open questions

- **OQ1 — Should Rule or Label gain stable public theming targets?** (`human-api`)
  Their target exposure is unsettled; the current lack of reachability does not
  decide the answer.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit
results, implementation steps, or system rules. It links to their owners.
