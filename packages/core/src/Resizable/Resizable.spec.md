---
schema_version: 3
template_version: 3
kind: component
id: component:Resizable
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [behavior, layout, theming, accessibility]
verified_by:
  [
    packages/core/src/Resizable/ResizeHandle.test.tsx,
    packages/core/src/Resizable/useResizable.test.ts,
    packages/core/src/theme/themingTargets.test.ts,
    scripts/check-knowledge.mjs,
  ]
modules: []
families: []
design_specs: []
architecture:
  [
    architecture:component-theming-surface,
    architecture:interaction-modality,
    architecture:public-component-api,
  ]
contributing: []
system_specs: [spec:AST-010]
---

# Resizable component contract

## Intent

Resizable combines the useResizable state and behavior hook with a focusable
ResizeHandle. The handle presents a default Grip pill over an enlarged invisible
Grab zone. This draft records consumer anatomy and theming ownership plus the
AST-010 sizing contract: configuration may express container- or viewport-based
percentage constraints, including bounded recursive CSS `min()` / `max()`, while
selected state, rendered geometry, persistence, callbacks, and ARIA remain pixels.

## Compatibility and migration

- Released default preserved: `yes`; `defaultSize` retains its released type,
  one-time percentage resolution, and 250px invalid fallback
- Compatibility class: additive `minSize` / `maxSize` and
  `ResizableConstraintValue`; deprecated `minSizePx` / `maxSizePx`, pixel output,
  controlled behavior, DOM, styling, and theming targets remain compatible
- Controlled/uncontrolled behavior: unchanged
- Migration decision: aliases remain supported; use unified constraints for new
  code

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- useResizable size, collapse, snapping, persistence, and resize lifecycle.
- ResizeHandle's separator semantics, pointer and keyboard interaction, and
  current `resize-handle` target.
- The default Grip pill and its current `resize-handle-pill` target, plus the
  aligned invisible Grab zone.

**Does not own / non-goals**

- The structural region being resized — owned by LayoutPanel, SideNav, or another
  caller.
- Layout-region topology, inset, divider, or scrolling rules.
- A public target for the Grab zone; none exists on current `main`.
- Fixing the missing runtime reflection for the documented Handle `direction`
  theming state in this constraint change.

## Public concepts

`minSize` and `maxSize` are flat unified constraints typed as
`ResizableConstraintValue`: a non-negative pixel number, exact `Npx`, exact
0–100 `N%`, or a lowercase recursive CSS `min()` / `max()` expression over those
string leaves, nested at most eight function levels. `defaultSize` keeps its
released `SizeValue` surface and atomic runtime grammar. Consumer props, outputs,
and examples are documented in `Resizable.doc.mjs` and `useResizable.doc.mjs`.

## Behavioral and layout contract

| ID  | Candidate invariant                                                                                                                                                                                                                                                  | Basis                            | Draft review state                                                        |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------- |
| FR1 | ResizeHandle renders one focusable Handle and one enlarged Grab zone; the default render also contains a Grip pill, while caller-provided children replace that pill.                                                                                                | Current source, docs, and tests  | Verified current behavior; no new behavior decided                        |
| FR2 | Handle carries `resize-handle`, Grip pill carries `resize-handle-pill`, and Grab zone carries no public target.                                                                                                                                                      | Current source and public docs   | Verified current target inventory; no target change                       |
| FR3 | Pointer, keyboard, collapse, snap, persistence, reversal, and size behavior remain owned by ResizeHandle and useResizable rather than layout-regions collaborators.                                                                                                  | Current source, docs, and tests  | Verified current ownership; resize semantics remain unchanged             |
| FR4 | Resizable metadata advertises `direction` as a Handle visual state, but current runtime calls `themeProps('resize-handle')` without reflecting that value, so direction selectors cannot match.                                                                      | Current source and public docs   | Verified audit gap; deliberately not fixed in this change                 |
| FR5 | Percentage leaves in `minSize` / `maxSize`, including inside recursive CSS `min()` / `max()`, resolve against the AST-010 basis and re-clamp pixel state when it changes. Invalid expressions use deterministic fallbacks; if minimum exceeds maximum, maximum wins. | AST-010, source, tests, Chromium | New additive constraint contract; defaults and interactions remain pixels |

### Allowed variation

- **AV1 — Axis.** Handle may resize along the horizontal or vertical layout axis;
  separator orientation and cursor follow the current implementation.
- **AV2 — Placement.** Handle may participate inline or overlay its parent, and
  Grip pill may sit at start, end, center, or the current automatic side.
- **AV3 — Grip content.** Caller-provided children may replace Grip pill without
  changing Handle or Grab zone ownership.
- **AV4 — Divider.** Handle may paint its current divider treatment; a composing
  region remains responsible for avoiding a duplicate adjacent divider.

### Representative states

| State                  | Required invariant                                                    | Allowed variation                                  |
| ---------------------- | --------------------------------------------------------------------- | -------------------------------------------------- |
| Default handle         | Handle, Grab zone, and Grip pill render.                              | Divider and always-visible treatment may vary.     |
| Custom handle content  | Handle and Grab zone remain; caller content replaces Grip pill.       | Caller content remains caller-owned.               |
| Horizontal or vertical | Interaction follows the selected axis and current ARIA orientation.   | Size, reversal, and pill placement may vary.       |
| Collapsed or expanded  | Handle preserves valid separator value semantics and resize controls. | Grip pill automatic side follows current behavior. |
| Disabled               | Handle remains represented but is removed from interactive tab order. | Painted treatment follows existing styles.         |

### Transformation and precedence order

- Parse each bound fully, rejecting unsupported syntax before evaluation.
- Resolve pixel leaves directly and percentage leaves against one active basis;
  evaluate nested `min()` / `max()` from the leaves outward.
- Clamp with `Math.min(max, Math.max(min, size))`; maximum wins when bounds
  conflict.
- Pointer, keyboard, snap, collapse, persistence, and callbacks then continue on
  resolved pixel state.

### Performance and resources

- Parsing is linear in the authored value and recursion is bounded to eight
  function levels.
- Percentage-dependent constraints reuse the one shared ResizeObserver subscription
  required by AST-010; pure-pixel values and expressions subscribe to no basis.

## Accessibility contract

This draft does not change or extend ResizeHandle's existing separator role,
label, orientation, value, collapsed value text, focus, pointer, or keyboard
behavior.

## Design relationships

| Anatomy or state | Design requirement                                                      | Representation authority       | Hierarchy role | Component contract |
| ---------------- | ----------------------------------------------------------------------- | ------------------------------ | -------------- | ------------------ |
| Handle           | Presents the focusable resize separator and optional divider treatment. | Current source and public docs | Prominent      | FR1, FR2, FR3      |
| Grip pill        | Presents the default visible resize affordance.                         | Current source and public docs | Supporting     | FR1, FR2           |
| Grab zone        | Enlarges pointer reach while remaining visually transparent.            | Current source and tests       | Supporting     | FR1, FR2           |
| Direction state  | Selects horizontal or vertical resize presentation.                     | Current public metadata        | Supporting     | FR3, FR4           |

Grab zone is interaction structure rather than a painted public theming seam. Its
`none` disposition records factual reachability. The missing Handle direction
reflection is a separate current audit gap: the target exists, but runtime does
not emit the documented target state.

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Handle": {"target": "resize-handle"},
  "Grip pill": {"target": "resize-handle-pill"},
  "Grab zone": {
    "none": {
      "reason": "intentional: The invisible pointer hit area is nonvisual interaction structure and has no public target"
    }
  }
}
```

## Family and system relationships

- `architecture:component-theming-surface` owns anatomy qualification, target
  mapping, and target-state reflection requirements.
- `architecture:interaction-modality` continues to own shared modality behavior;
  `architecture:public-component-api` owns the additive constraint type and
  compatibility boundary.
- `spec:AST-010` owns basis resolution, parsing, clamping, persistence, and the
  maximum-wins conflict rule.
- `family:layout-regions` lists useResizable and ResizeHandle as collaborators
  that may drive a LayoutPanel's size. Resizable is not a layout-regions member,
  and that family does not own or redefine resize state, snapping, persistence,
  collapse, pointer, or keyboard semantics.

## Verification map

| Contract            | Verification                                       | Representative states                                                        | Mutation or failure expectation                                                                                                         | Audit section              |
| ------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| FR1                 | `ResizeHandle.test.tsx` plus source inspection     | Default, custom, collapsed, disabled, both axes                              | Handle and Grab zone regressions fail focused tests; custom Grip replacement currently relies on source review.                         | `audit:Resizable/anatomy`  |
| FR2                 | Source inspection and `themingTargets.test.ts`     | Handle, Grip pill, and Grab zone                                             | Removing a target or documenting an unshipped Grab zone target fails evidence or inventory.                                             | `audit:Resizable/theming`  |
| FR3                 | `ResizeHandle.test.tsx` and `useResizable.test.ts` | Pointer, keyboard, snap, collapse, persistence                               | Moving resize ownership or changing current transformations fails focused behavior coverage.                                            | `audit:Resizable/behavior` |
| FR4                 | Source and public metadata comparison              | Horizontal and vertical Handle                                               | No current test detects that documented `direction` is absent from runtime target-state reflection.                                     | `audit:Resizable/theming`  |
| FR5                 | `useResizable.test.ts`, typecheck, and Chromium    | Atomic/nested/invalid values; wide/narrow basis; inverted bounds; SSR/no-ref | Parser or dependency regressions fail focused tests; canonical browser measurements must match resolved ARIA bounds and panel geometry. | `audit:Resizable/behavior` |
| Theming anatomy map | `scripts/check-knowledge.mjs`                      | Canonical anatomy and two current targets                                    | Missing, extra, prefixed, stale, or multiply assigned mappings fail repository validation.                                              | `audit:Resizable/theming`  |

Current tests exercise Handle and Grab zone structure and behavior but do not
render `children` to prove that custom content replaces Grip pill. That branch is
source-inspected and lacks focused regression evidence. The documented
`direction` visual axis is a closed union, so `extensibleAxes.test.ts` does not
cover its missing runtime reflection; that mismatch is currently unguarded.

## Decision log

Resizable sizing decisions are delegated to `spec:AST-010`, including
constraint vocabulary, basis dependency, deterministic fallbacks, and
maximum-wins conflict handling. This component record adds no second policy.

## Open questions

- **OQ1 — Which follow-up should add and verify the missing Handle `direction`
  target-state reflection?** (`checkable`)
- **OQ2 — Which focused test should pin custom content replacing Grip pill?**
  (`checkable`)

## Content boundary

This file does not duplicate consumer prop tables/examples, resize algorithms,
layout-region rules, current audit results, or implementation steps. It links to
their owners.
