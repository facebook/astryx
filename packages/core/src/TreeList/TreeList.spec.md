---
schema_version: 1
template_version: 2
kind: component
id: component:TreeList
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [behavior, theming, accessibility]
verified_by:
  [
    packages/core/src/TreeList/TreeList.test.tsx,
    packages/core/src/theme/themingTargets.test.ts,
    scripts/check-knowledge.mjs,
  ]
families: []
design_specs: []
architecture:
  [
    architecture:component-theming-surface,
    architecture:interaction-modality,
    architecture:public-component-api,
  ]
contributing: []
system_specs: []
---

# TreeList component contract

## Intent

TreeList presents hierarchical data as expandable tree rows. This draft records
its current consumer anatomy, target ownership, delegated Icon glyph, and
unreached stable parts without changing runtime behavior, styling, targets, or
public API.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: additive documentation only; runtime, DOM, styling,
  targets, aliases, and public API remain unchanged
- Controlled/uncontrolled behavior: unchanged
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The Tree list, Item, Chevron, Item label, and Guide parts and their five current
  targets.
- The stable Item description rendered below an Item label.
- Hierarchical placement, indentation, expansion, selection, and tree semantics.

**Does not own / non-goals**

- The Chevron glyph artwork and Icon target — owned by `component:Icon`.
- Header, Start content, and End content supplied through consumer slots — owned
  by the product callsite.
- New targets for Item description or caller-provided slots — unresolved by this
  factual backfill.

## Public concepts

No new public concept is introduced. Consumer data, props, slots, and usage
remain documented in `TreeList.doc.mjs`.

## Behavioral and layout contract

| ID  | Candidate invariant                                                                                                                                                                                          | Basis                             | Draft review state                                                        |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------- | ------------------------------------------------------------------------- |
| FR1 | The current render contains one Tree list, one Item and Item label per rendered node, optional Header, Chevron, Item description, Start content, End content, and Guide parts, and delegated Chevron glyphs. | Current source, docs, and tests   | Verified current behavior; no new behavior decided                        |
| FR2 | Tree list, Item, Chevron, Item label, and Guide carry the five current `tree-list*` targets documented below.                                                                                                | Current source and target docs    | Verified current inventory; focused placement coverage is partial         |
| FR3 | Chevron glyph delegates to Icon's `icon` target. Header, Start content, and End content are consumer-owned and have no TreeList target.                                                                      | Current source and component docs | Verified current ownership; no target change                              |
| FR4 | Item description is a stable library-rendered part below Item label and currently has no public target. It does not inherit through `tree-list-item-label`; both spans are siblings inside the row content.  | Current source and target docs    | Verified current reachability; long-term theming intent remains unsettled |

### Allowed variation

- **AV1 — Hierarchy.** Item count, depth, expansion, selection, density, and guide
  visibility may vary without changing the anatomy ownership recorded here.
- **AV2 — Consumer content.** Header, Start content, End content, Item label
  values, and descriptions may vary without making caller-owned slot content a
  TreeList target.
- **AV3 — Delegated glyph.** Icon may change the Chevron glyph's internal element
  shape while preserving its own public contract.

### Representative states

| State                    | Required invariant                                    | Allowed variation                             |
| ------------------------ | ----------------------------------------------------- | --------------------------------------------- |
| Empty tree               | Tree list remains; no Item instances render.          | Optional Header content.                      |
| Flat items               | Each Item contains an Item label.                     | Description and consumer slots may be absent. |
| Expandable item          | Item may contain Chevron and delegated Chevron glyph. | Expanded or collapsed state.                  |
| Nested `lineGuides` tree | Guide instances show parent-child relationships.      | Count and position follow hierarchy.          |
| `noGuides` tree          | Guide instances are absent; indentation remains.      | All other anatomy remains unchanged.          |
| Described item           | Item description renders below Item label.            | Caller-provided description text.             |

### Transformation and precedence order

- No new hierarchy, focus, expansion, layout, or styling precedence rule is
  introduced.

### Performance and resources

- No new performance or resource rule is introduced.

## Accessibility contract

This draft does not change or extend TreeList's current tree, treeitem, group,
roving-focus, expansion, selection, disabled, or activation behavior.

## Design relationships

| Anatomy or state | Design requirement                                                   | Representation authority       | Hierarchy role    | Component contract |
| ---------------- | -------------------------------------------------------------------- | ------------------------------ | ----------------- | ------------------ |
| Tree list        | Groups the hierarchical tree and owns its density and guide variant. | Current source and public docs | Supporting        | FR1, FR2           |
| Header           | Visibly names the tree with caller-provided content.                 | Caller-supplied content        | Prominent         | FR1, FR3           |
| Item             | Paints one row and reflects density, selection, and disabled state.  | Current source and public docs | Prominent         | FR1, FR2           |
| Chevron          | Provides the expand and collapse control for an Item with children.  | Current source and public docs | Supporting        | FR1, FR2           |
| Chevron glyph    | Presents the current directional symbol inside Chevron.              | `component:Icon`               | Supporting        | FR1, FR3           |
| Item label       | Presents the primary content that identifies an Item.                | Current source and public docs | Prominent         | FR1, FR2           |
| Item description | Presents stable secondary text below Item label.                     | Current source and public docs | Supporting        | FR1, FR4           |
| Start content    | Presents caller-provided content before Item label.                  | Caller-supplied content        | Context-dependent | FR1, FR3           |
| End content      | Presents caller-provided content after Item label.                   | Caller-supplied content        | Context-dependent | FR1, FR3           |
| Guide            | Paints a connector between related hierarchy levels.                 | Current source and public docs | Supporting        | FR1, FR2           |

Item description is stable TreeList-rendered anatomy, not consumer-owned slot
structure. Its current lack of a target is observed reachability, not a decision
that it must remain unthemeable. Header, Start content, and End content remain
caller-owned even though TreeList positions their slot wrappers.

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Tree list": {"target": "tree-list"},
  "Header": {
    "none": {
      "reason": "TreeList applies no public target to caller-provided Header content"
    }
  },
  "Item": {"target": "tree-list-item"},
  "Chevron": {"target": "tree-list-chevron"},
  "Chevron glyph": {
    "delegatesTo": {"owner": "component:Icon", "target": "icon"}
  },
  "Item label": {"target": "tree-list-item-label"},
  "Item description": {
    "none": {
      "reason": "No current public target is applied to the stable Item description"
    }
  },
  "Start content": {
    "none": {
      "reason": "TreeList applies no public target to caller-provided Start content"
    }
  },
  "End content": {
    "none": {
      "reason": "TreeList applies no public target to caller-provided End content"
    }
  },
  "Guide": {"target": "tree-list-guide"}
}
```

The five local targets are current public seams. The Chevron glyph retains Icon
ownership. Consumer-slot `none` dispositions are ownership boundaries; Item
description's `none` disposition records a current audit gap and does not
authorize a new target.

## Family and system relationships

- `architecture:component-theming-surface` owns anatomy qualification, target
  mapping, delegation, and factual `none` dispositions.
- `architecture:public-component-api` owns the stable data, props, and slot
  surface; this documentation adds no API.
- `architecture:interaction-modality` owns shared keyboard and pointer modality;
  TreeList continues to own its existing tree focus and activation behavior.
- TreeList has no current family contract, and no unresolved family or runtime
  record identifier is included.

## Verification map

| Contract            | Verification                                                                                    | Representative states                              | Mutation or failure expectation                                                                                                                                                                                                                     | Audit section            |
| ------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| FR1                 | `TreeList.test.tsx` rendering, hierarchy, slot, and accessibility suites plus source inspection | Flat, nested, described, headed, and slotted items | Removing asserted Tree list, Header, Item, Chevron, Item label, Item description, Start content, End content, or Guide behavior fails existing role, content, hierarchy, or state assertions; Chevron glyph presence remains source-inspected only. | `audit:TreeList/anatomy` |
| FR2                 | `TreeList.test.tsx` and `themingTargets.test.ts`                                                | Five local targets and their documented states     | Removing or moving any current local target fails focused class assertions or the global inventory.                                                                                                                                                 | `audit:TreeList/theming` |
| FR3                 | Source inspection plus Icon public target metadata                                              | Expandable rows and caller-provided slots          | Existing focused tests do not assert the composed Icon instance; changing glyph or slot ownership requires this map and the relevant owner metadata to change.                                                                                      | `audit:TreeList/theming` |
| FR4                 | `TreeList.test.tsx` description rendering test and source inspection                            | Item with description                              | Removing description fails content coverage; adding a target requires an explicit map update.                                                                                                                                                       | `audit:TreeList/anatomy` |
| Theming anatomy map | `scripts/check-knowledge.mjs`                                                                   | Canonical anatomy and five current local targets   | Missing, extra, prefixed, stale, or alias-backed mappings fail repository validation.                                                                                                                                                               | `audit:TreeList/theming` |

Focused target-placement assertions cover all five local targets: Tree list,
Item, Chevron, Item label, and Guide. Existing tests do not assert the Icon
instance that renders Chevron glyph.

## Decision log

None. This draft records current facts and introduces no component-local design,
API, behavior, or theming decision.

## Open questions

- **OQ1 — Should Item description gain a stable public theming target?**
  (`human-api`) Its current lack of reachability is an audit gap, not settled
  intent.
- **OQ2 — Should a focused test pin the delegated Chevron glyph's Icon
  instance?** (`checkable`) Its presence is currently source-inspected rather
  than asserted.

## Content boundary

This file does not duplicate consumer prop tables/examples, shared modality
rules, current audit results, or implementation steps. It links to their owners.
