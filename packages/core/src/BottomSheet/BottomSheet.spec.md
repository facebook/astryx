---
schema_version: 1
template_version: 3
kind: component
id: component:BottomSheet
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [theming]
verified_by:
  [
    packages/core/src/BottomSheet/BottomSheet.test.tsx,
    packages/core/src/BottomSheet/BottomSheetPanel.test.tsx,
    scripts/check-knowledge.mjs,
  ]
families: [family:overlay-dismissal]
design_specs: []
architecture:
  [architecture:component-theming-surface, architecture:layer-runtime]
contributing: []
system_specs: []
---

# BottomSheet component contract

## Intent

BottomSheet presents caller-provided content in a panel that rises from the
bottom edge. This draft records current consumer anatomy and theming reachability
without changing runtime behavior, styling, targets, or public API.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: additive documentation only; runtime, DOM, styling,
  targets, and public API remain unchanged
- Controlled/uncontrolled behavior: unchanged
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The visual Sheet panel and its current `bottom-sheet` target.
- The scrolling Content area and decorative Handle inside the panel.
- Standalone sheet presentation, including its optional native-dialog Scrim.

**Does not own / non-goals**

- Caller-provided content rendered inside the Content area.
- A separate target for Content area, Handle, or Scrim; none exists on current
  `main`.
- A shared switcher dialog or scrim — owned by BottomSheetSwitcher when the sheet
  participates in that host.
- Shared layer hosting or dismissal policy.

## Public concepts

No new public concept is introduced. Consumer props and usage remain documented
in `BottomSheet.doc.mjs`.

## Behavioral and layout contract

| ID  | Candidate invariant                                                                                                                                                | Basis                           | Draft review state                                 |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------- | -------------------------------------------------- |
| FR1 | The current presented sheet contains one Sheet panel, one scrolling Content area, and one decorative Handle; a Scrim is present only in scrim-backed presentation. | Current source, docs, and tests | Verified current behavior; no new behavior decided |
| FR2 | The Sheet panel carries `bottom-sheet`; Content area, Handle, and Scrim carry no BottomSheet public target.                                                        | Current source, docs, and tests | Verified current behavior; no target change        |

### Allowed variation

- Caller-provided children may vary without becoming BottomSheet-owned anatomy.
- Height, snap points, motion phase, and standalone versus switcher hosting may
  vary without changing the four-part anatomy recorded here.

### Representative states

- A standalone modal sheet renders Sheet panel, Content area, Handle, and Scrim.
- A standalone non-modal sheet renders Sheet panel, Content area, and Handle
  without a Scrim.
- A switcher-managed sheet renders the same panel anatomy while
  BottomSheetSwitcher owns the shared dialog and optional Scrim.

### Transformation and precedence order

- No new height, gesture, motion, or styling precedence rule is introduced.

### Performance and resources

- No new performance or resource rule is introduced.

## Accessibility contract

This draft does not change or extend BottomSheet's existing dialog naming,
focus, Handle, keyboard, or dismissal behavior.

## Design relationships

| Anatomy or state | Design requirement                                                                    | Representation authority       | Hierarchy role | Component contract |
| ---------------- | ------------------------------------------------------------------------------------- | ------------------------------ | -------------- | ------------------ |
| Sheet panel      | Presents the painted bottom-edge surface and owns panel geometry and motion.          | Current source and public docs | Prominent      | FR1, FR2           |
| Content area     | Provides the scrolling area for caller-provided sheet content.                        | Current source and tests       | Prominent      | FR1, FR2           |
| Handle           | Presents the decorative grab affordance and owns the panel's drag interaction region. | Current source and tests       | Supporting     | FR1, FR2           |
| Scrim            | Dims and blocks the page in a scrim-backed host.                                      | Current source and public docs | Supporting     | FR1, FR2           |

Content area, Handle, and Scrim are stable visible parts, but no current public
target reaches them. Their `none` dispositions record factual reachability, not
a decision that they must remain unthemeable.

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Sheet panel": {"target": "bottom-sheet"},
  "Content area": {
    "none": {
      "reason": "reachability-gap: No current public target reaches the scrolling content area."
    }
  },
  "Handle": {
    "none": {
      "reason": "reachability-gap: No current public target reaches the handle bar or pill."
    }
  },
  "Scrim": {
    "none": {
      "reason": "reachability-gap: No BottomSheet public target reaches the native dialog backdrop or switcher-owned scrim."
    }
  }
}
```

## Family and system relationships

- `architecture:component-theming-surface` owns anatomy qualification, target
  mapping, and factual `none` dispositions.
- `architecture:layer-runtime` owns the current native-dialog host distinction
  and records that sheets retain local scrim and swipe behavior.
- `family:overlay-dismissal` owns shared Escape and platform-close ordering and
  records BottomSheet's current local-only adoption gap. This anatomy backfill
  does not migrate that runtime behavior.

## Verification map

| Contract            | Verification                                                              | Representative states                          | Mutation or failure expectation                                                                 | Audit section               |
| ------------------- | ------------------------------------------------------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------- | --------------------------- |
| FR1                 | `BottomSheet.test.tsx` render, content, Handle, and scrim behavior suites | Modal, non-modal, and switcher presentations   | Removing a documented part fails existing content, structure, or dismissal assertions.          | `audit:BottomSheet/anatomy` |
| FR2                 | Panel target assertion, source inspection, and theming target inventories | Sheet panel, Content area, Handle, and Scrim   | Removing the panel target or documenting an unshipped child target fails evidence or inventory. | `audit:BottomSheet/theming` |
| Layout evidence     | `BottomSheetPanel.test.tsx`                                               | Floating Handle and scrolling Content area     | Reordering or merging the stable parts fails existing panel structure and style assertions.     | `audit:BottomSheet/anatomy` |
| Theming anatomy map | `scripts/check-knowledge.mjs`                                             | Canonical anatomy and current target inventory | Missing, extra, prefixed, stale, or multiply assigned mappings fail repository validation.      | `audit:BottomSheet/theming` |

Existing tests directly assert the Sheet panel target, Content area placement,
Handle structure, and scrim behavior. Source and public target metadata confirm
that the other three parts have no public target.

## Decision log

None. This draft records current facts and introduces no component-local design,
API, theming, or layer-system decision.

## Open questions

- **OQ1 — Should Content area, Handle, or Scrim gain a stable public theming
  target?** (`human-api`) Their current lack of reachability is an audit gap, not
  settled intent.

## Content boundary

This file does not duplicate consumer prop tables, examples, gesture algorithms,
implementation steps, or shared layer and theming rules. It links to their
owners.
