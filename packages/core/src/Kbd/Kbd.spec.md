---
schema_version: 3
template_version: 3
kind: component
id: component:Kbd
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [theming]
verified_by: [packages/core/src/Kbd/Kbd.test.tsx, scripts/check-knowledge.mjs]
modules: []
families: []
design_specs: []
architecture: [architecture:component-theming-surface]
contributing: []
system_specs: []
---

# Kbd component contract

## Intent

Kbd presents a keyboard shortcut as one or more painted key badges. This draft
records current consumer anatomy and theming reachability without changing
runtime behavior, styling, targets, or public API.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: additive documentation only; runtime, DOM, styling,
  targets, aliases, and public API remain unchanged
- Controlled/uncontrolled behavior: not applicable
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The shortcut group, its current `kbd` target, and the painted key badges it
  renders from the supplied shortcut string.

**Does not own / non-goals**

- The action associated with the shortcut or how the shortcut is discovered —
  owned by the product callsite.
- Whether an individual key badge should gain a public target — unresolved by
  this factual backfill.

## Public concepts

No new public concept is introduced. Consumer props and usage remain documented
in `Kbd.doc.mjs`.

## Behavioral and layout contract

| ID  | Candidate invariant                                                                                          | Basis                           | Draft review state                                  |
| --- | ------------------------------------------------------------------------------------------------------------ | ------------------------------- | --------------------------------------------------- |
| FR1 | The current render contains one shortcut group and one painted key badge for every parsed key segment.       | Current source, docs, and tests | Verified current behavior; no new behavior decided  |
| FR2 | The shortcut group carries the current `kbd` target; individual key badges currently carry no public target. | Current source, docs, and tests | Verified current behavior; theming intent unsettled |

### Allowed variation

- Platform-specific key text and caller-supplied shortcut combinations may vary
  without changing the two-part anatomy recorded here.

### Representative states

- The same anatomy applies to single-key, multi-key, modifier, and
  platform-resolved shortcuts.

### Transformation and precedence order

- No new parsing, layout, or styling precedence rule is introduced.

### Performance and resources

- No new performance or resource rule is introduced.

## Accessibility contract

This draft does not change or extend Kbd's existing accessible-name behavior.

## Design relationships

| Anatomy or state | Design requirement                                                 | Representation authority       | Hierarchy role | Component contract |
| ---------------- | ------------------------------------------------------------------ | ------------------------------ | -------------- | ------------------ |
| Shortcut         | Groups the complete shortcut and carries its accessible name.      | Current source and public docs | Supporting     | FR1, FR2           |
| Key badge        | Paints one visible badge for each key in the supplied combination. | Current source and public docs | Prominent      | FR1, FR2           |

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Shortcut": {"target": "kbd"},
  "Key badge": {
    "none": {
      "reason": "unsettled: No current public target reaches this part"
    }
  }
}
```

The `none` disposition records current reachability while target exposure remains
unsettled. It does not decide that key badges should remain without a public
target.

## Family and system relationships

- `architecture:component-theming-surface` owns anatomy qualification, target
  mapping, and the difference between factual reachability and intended public
  theming API.

## Verification map

| Contract            | Verification                                     | Representative states           | Mutation or failure expectation                                                                  | Audit section       |
| ------------------- | ------------------------------------------------ | ------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------- |
| FR1                 | `Kbd.test.tsx` key rendering suites              | Single-key and multi-key output | Removing the group or a parsed badge fails existing role, element, or text assertions.           | `audit:Kbd/anatomy` |
| FR2                 | Source inspection and current target inventories | Root target and child badges    | Adding or documenting a current target without updating the anatomy map fails repository checks. | `audit:Kbd/theming` |
| Theming anatomy map | `scripts/check-knowledge.mjs`                    | Canonical anatomy and targets   | Missing, extra, prefixed, stale, or alias-backed mappings fail repository validation.            | `audit:Kbd/theming` |

## Decision log

None. This draft records current facts and introduces no component-local design
or theming decision.

## Open questions

- **OQ1 — Should each Key badge gain a stable public theming target?**
  (`human-api`) Target exposure is unsettled; the current lack of reachability
  does not decide the answer.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit
results, implementation steps, or system rules. It links to their owners.
