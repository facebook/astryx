---
schema_version: 1
template_version: 3
kind: component
id: component:Outline
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [theming]
verified_by:
  [packages/core/src/Outline/Outline.test.tsx, scripts/check-knowledge.mjs]
families: []
design_specs: []
architecture: [architecture:component-theming-surface]
contributing: []
system_specs: []
---

# Outline component contract

## Intent

Outline presents same-page heading navigation with heading links, labels, a
vertical indicator track, and a sliding active indicator. This draft records
current consumer anatomy and theming reachability without changing runtime
behavior, styling, targets, or public API.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: additive documentation only; runtime, DOM, styling,
  targets, aliases, and public API remain unchanged
- Controlled/uncontrolled behavior: unchanged
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The outline navigation container and its current `outline` target.
- The heading links and their current `outline-item` target.
- The active indicator and its current `outline-indicator` target.
- The label and indicator-track elements rendered inside that structure.

**Does not own / non-goals**

- The destination headings or their content — owned by the document or product
  callsite.
- Whether the Indicator track should gain a public target — unresolved by this
  factual backfill.

## Public concepts

No new public concept is introduced. Consumer props and usage remain documented
in `Outline.doc.mjs`.

## Behavioral and layout contract

| ID  | Candidate invariant                                                                                                                       | Basis                                                | Draft review state                                                                   |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------ |
| FR1 | The current render contains one Outline, one Heading link and Label per item, one Indicator track, and one Active indicator.              | Current source and docs; existing link/marker tests  | Verified by source; Label-wrapper and Indicator-track identity lack exact assertions |
| FR2 | Outline, Heading link, and Active indicator carry `outline`, `outline-item`, and `outline-indicator`; Label inherits from `outline-item`. | Current source and target docs; current target tests | Current target facts verified; Label inheritance remains source-inspected            |
| FR3 | Indicator track currently carries no public target.                                                                                       | Current source and target docs                       | Verified current behavior; theming intent unsettled                                  |

### Allowed variation

- Heading count, labels, levels, density, and active item may vary without
  changing the five-part anatomy recorded here.

### Representative states

- Controlled and uncontrolled active state use the same anatomy and current
  targets.
- Default and compact density use the same anatomy and current targets.
- An empty items array still renders Outline, Indicator track, and Active
  indicator; it renders no Heading link or Label instances.

### Transformation and precedence order

- No new navigation, active-state, layout, or styling precedence rule is
  introduced.

### Performance and resources

- No new performance or resource rule is introduced.

## Accessibility contract

This draft does not change or extend Outline's existing navigation, link,
current-item, or keyboard behavior.

## Design relationships

| Anatomy or state | Design requirement                                                  | Representation authority       | Hierarchy role | Component contract |
| ---------------- | ------------------------------------------------------------------- | ------------------------------ | -------------- | ------------------ |
| Outline          | Groups same-page heading navigation and the indicator presentation. | Current source and public docs | Supporting     | FR1, FR2           |
| Heading link     | Navigates to one heading and carries level and active state.        | Current source and public docs | Prominent      | FR1, FR2           |
| Label            | Presents heading text inside its Heading link.                      | Current source and public docs | Prominent      | FR1, FR2           |
| Indicator track  | Paints the vertical rule behind the active marker.                  | Current source and public docs | Supporting     | FR1, FR3           |
| Active indicator | Paints the marker aligned to the current Heading link.              | Current source and public docs | Supporting     | FR1, FR2           |

The Label sits inside the `outline-item` target and receives the link's
inherited text treatment. Its own StyleX rules only manage truncation. The
Indicator track's target exposure remains unsettled; its current lack of a
target does not decide that the part must remain unthemeable.

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Outline": {"target": "outline"},
  "Heading link": {"target": "outline-item"},
  "Label": {"inherits": "outline-item"},
  "Indicator track": {
    "none": {
      "reason": "unsettled: No current public target reaches this part"
    }
  },
  "Active indicator": {"target": "outline-indicator"}
}
```

## Family and system relationships

- `architecture:component-theming-surface` owns anatomy qualification, target
  mapping, inherited-part treatment, and explicit unsettled dispositions.

## Verification map

| Contract            | Verification                                             | Representative states                 | Mutation or failure expectation                                                                                                                                            | Audit section           |
| ------------------- | -------------------------------------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| FR1                 | Source inspection plus existing link/indicator suites    | Populated and active outlines         | Heading links and the active indicator have regression assertions; Label-wrapper and Indicator-track identity remain source-inspected without exact regression assertions. | `audit:Outline/anatomy` |
| FR2                 | `Outline.test.tsx` stable-target and active-state suites | Root, heading link, active indicator  | Removing or renaming a current target fails existing class assertions or target inventories.                                                                               | `audit:Outline/theming` |
| FR3                 | Source inspection and current target inventories         | Indicator track                       | Adding or documenting a current track target without updating the map fails repository checks.                                                                             | `audit:Outline/theming` |
| Theming anatomy map | `scripts/check-knowledge.mjs`                            | Canonical anatomy and current targets | Missing, extra, prefixed, stale, or alias-backed mappings fail repository validation.                                                                                      | `audit:Outline/theming` |

## Decision log

None. This draft records current facts and introduces no component-local design
or theming decision.

## Open questions

- **OQ1 — Should Indicator track gain a stable public theming target?**
  (`human-api`) Target exposure is unsettled; the current lack of reachability
  does not decide the answer.
- **OQ2 — Add exact regression assertions for the Label wrapper and Indicator
  track identity.** (`checkable`) Current evidence for those two parts is source
  inspection rather than a uniquely identifying test assertion.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit
results, implementation steps, or system rules. It links to their owners.
