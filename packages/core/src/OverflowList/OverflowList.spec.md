---
schema_version: 3
template_version: 3
kind: component
id: component:OverflowList
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [theming]
verified_by:
  [
    packages/core/src/OverflowList/OverflowList.test.tsx,
    scripts/check-knowledge.mjs,
  ]
modules: [module:OverflowList/useOverflow]
families: []
design_specs: []
architecture: [architecture:component-theming-surface]
contributing: []
system_specs: []
---

# OverflowList component contract

## Intent

OverflowList renders a selected subset of caller-supplied items in a visible
horizontal list and may render a caller-supplied indicator for collapsed items.
Items may collapse because they exceed the measured space or a configured count
limit. This draft records the current consumer anatomy and theming ownership,
and when lists measure (FR4), without changing collapse behavior, targets, or
public API.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: timing only. The collapse and `onOverflowChange` land
  one microtask after the commit (FR4), before the frame paints; DOM, styling,
  targets, and public API are unchanged. Under `spec:AST-017` FR1 this is not
  breaking: no documented scenario reads the visible items or the collapsed set
  in the same task as a synchronous render, and the consumer docs promise no
  such timing. `module:OverflowList/useOverflow` states the hook's timing. Test code that asserted in that task
  awaits one microtask (`await act(async () => {})`)
- Controlled/uncontrolled behavior: unchanged
- Migration decision: none required; the release note names the test-code case

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The visible list container and its current `overflow-list` theming target.
- Measuring available space, applying configured count limits, and choosing
  which supplied items remain visible.

**Does not own / non-goals**

- The items supplied through `children` — owned by the caller.
- The overflow indicator returned by `overflowRenderer` — owned by the caller.
- The hidden inert measurement container as consumer-facing anatomy or a public
  target.

## Public concepts

No new public concept is introduced. Consumer props and usage remain documented
in `OverflowList.doc.mjs`.

## Behavioral and layout contract

| ID  | Candidate invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Basis                           | Draft review state                                 |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------- | -------------------------------------------------- |
| FR1 | The visible list container carries the `overflow-list` target and renders the caller-supplied items selected by current width and count limits.                                                                                                                                                                                                                                                                                                                          | Current source, docs, and tests | Verified current behavior; no new behavior decided |
| FR2 | When the current overflow calculation collapses items and a renderer is supplied, its returned indicator appears at the configured collapse edge.                                                                                                                                                                                                                                                                                                                        | Current source, docs, and tests | Verified current behavior; no new behavior decided |
| FR3 | The hidden inert measurement copy carries no public theming target and is not consumer-facing anatomy.                                                                                                                                                                                                                                                                                                                                                                   | Current source and tests        | Verified current behavior; no target change        |
| FR4 | Lists that mount or change in one React commit measure after that commit and before its frame paints: every list reads its sizes, then one render applies every result, so the first painted frame shows the measured subset. The collapse and `onOverflowChange` land one microtask after the commit, not inside it. `onOverflowChange` fires after the render that applies the collapse has committed, and state a caller sets in it renders before that frame paints. | DEC-1                           | Decided; not yet implemented                       |

### Allowed variation

- Item and overflow-indicator content may vary without becoming
  OverflowList-owned theming targets.

### Representative states

- With no configured count cap, a sufficiently wide list shows every item and
  no indicator. Width pressure or `maxVisibleItems` may instead collapse a
  subset; the remaining items and optional indicator stay inside the same
  targeted list container.

### Transformation and precedence order

- Measurement runs after the commit that mounts or changes a list and before
  that frame paints (FR4); collapse order and rendering order are unchanged.
- A caller that renders synchronously and reads the visible items or the
  collapsed set in the same task waits for the microtask that applies them.

### Performance and resources

- A measurement inside the commit follows other components' DOM writes and
  forces a style and layout pass per list. FR4 reads every list in one pass
  after the commit: one layout for the whole commit.
- This draft adds no observer requirement.

## Accessibility contract

This draft does not change or extend the existing hidden measurement container,
DOM forwarding, or caller-content accessibility behavior.

## Design relationships

| Anatomy or state   | Design requirement                                                                      | Representation authority       | Hierarchy role    | Component contract |
| ------------------ | --------------------------------------------------------------------------------------- | ------------------------------ | ----------------- | ------------------ |
| List               | Presents the current visible list container.                                            | Current source and public docs | Supporting        | FR1                |
| Items              | Present caller-supplied content selected for visible display by width and count limits. | Caller-supplied content        | Context-dependent | FR1                |
| Overflow indicator | Presents caller-rendered access to or a count of collapsed items.                       | Caller-supplied content        | Context-dependent | FR2                |

The hidden measurement copy is implementation plumbing rather than
consumer-facing anatomy.

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "List": {"target": "overflow-list"},
  "Items": {
    "none": {
      "reason": "intentional: Caller-supplied items retain their own theming ownership; OverflowList applies no target to them."
    }
  },
  "Overflow indicator": {
    "none": {
      "reason": "intentional: The caller-rendered overflow indicator retains its own theming ownership; OverflowList applies no target to it."
    }
  }
}
```

## Family and system relationships

- `architecture:component-theming-surface` owns anatomy qualification and factual
  `none` dispositions for caller-owned content.

## Verification map

| Contract            | Verification                                                                                                                                                               | Representative states                                                                           | Mutation or failure expectation                                                                                                                                                                                                                                                                                      | Audit section                |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| FR1, FR2            | `OverflowList.test.tsx` fit, cap, and overflow suites                                                                                                                      | All items visible; count-capped; start/end overflow                                             | Removing visible items or changing capped/width-driven indicator placement fails existing content assertions.                                                                                                                                                                                                        | `audit:OverflowList/anatomy` |
| FR4                 | `OverflowList.test.tsx` and `useOverflow.test.ts`, which await one microtask after each render; the test that renders state set in `onOverflowChange` before the next task | Mount; reorder; two lists mounted in one commit; a caller that renders its own overflow control | A collapse or `onOverflowChange` applied inside the commit, a collapse applied after the next task, caller state rendered after the next task, or a render between two lists' size reads in one commit fails. Gap: the first painted frame is checked only by a real-browser trace, with no automated browser check. | `audit:OverflowList/anatomy` |
| FR1, FR3            | `OverflowList.test.tsx` rendering-contract suites                                                                                                                          | Visible and hidden measurement containers                                                       | Moving the target from the visible list or exposing measurement content fails assertions.                                                                                                                                                                                                                            | `audit:OverflowList/theming` |
| Theming anatomy map | `scripts/check-knowledge.mjs`                                                                                                                                              | Canonical anatomy and current target                                                            | Missing, extra, prefixed, or stale mappings fail repository validation.                                                                                                                                                                                                                                              | `audit:OverflowList/theming` |

## Decision log

- **DEC-1 — Lists measure together after the commit.** Every list mounted or
  changed in one commit measures after that commit and before the frame paints,
  so a page that mounts many lists pays for one layout instead of one per list,
  and the first painted frame is the same. The collapse and `onOverflowChange`
  land one microtask after the commit, not inside it. `onOverflowChange` fires
  once the render that applies the collapse has committed, and state a caller
  sets in it renders before that frame paints, so a caller that shows its own
  overflow control from the collapsed set never paints a frame without it.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables, examples, overflow
measurement mechanics, implementation steps, or system rules. It links to their
owners.
