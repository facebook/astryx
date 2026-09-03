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
    packages/core/src/Resizable/utils.test.ts,
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
Grab zone. AST-010 adds explicit pixel and percentage configuration while keeping
selected state, persistence, callbacks, paint, and ARIA in resolved pixels.

## Compatibility and migration

- Released default preserved: `yes`; numeric and exact `Npx` stay pixels, exact
  `N%` retains released one-time default behavior, and the broad `defaultSize`
  string type remains source-compatible
- Compatibility class: additive `minSize` / `maxSize`, structured percentage helper,
  and optional container basis; deprecated pixel aliases remain supported
- Controlled/uncontrolled behavior: unchanged
- Migration decision: CSS-like `min()` / `max()` strings are not supported. Use
  `percent(value, {min: pixel(value)})` or
  `percent(value, {max: pixel(value)})`.

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
  theming state; that remains a separate theming follow-up.

## Public concepts

`ResizableSize` is a Resizable-specific union: pixel number, exact `Npx`, exact
`N%`, `PixelWidth`, or `ResizablePercentSize`.
`pixel(value)` is Table's existing canonical structured pixel helper;
`percent(value, {min: pixel(value)})` creates a literal percentage with a pixel
floor; `percent(value, {max: pixel(value)})` creates one with a pixel ceiling.
The options argument is required and the two bounds are mutually exclusive.
`defaultSize` retains its released broad `SizeValue` type and adds the structured
`PixelWidth` and `ResizablePercentSize` values; runtime validation remains
authoritative for legacy strings.

Numbers and exact `Npx` remain pixels. A descriptor default resolves once; a
descriptor bound remains live. Consumer props, outputs, and examples are documented
in `Resizable.doc.mjs` and `useResizable.doc.mjs`.

## Behavioral and layout contract

| ID  | Candidate invariant                                                                                                                                                                                                                      | Basis                            | Draft review state                                            |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------- |
| FR1 | ResizeHandle renders one focusable Handle and one enlarged Grab zone; the default render also contains a Grip pill, while caller-provided children replace that pill.                                                                    | Current source, docs, and tests  | Verified current behavior; no new behavior decided            |
| FR2 | Handle carries `resize-handle`, Grip pill carries `resize-handle-pill`, and Grab zone carries no public target.                                                                                                                          | Current source and public docs   | Verified current target inventory; no target change           |
| FR3 | Pointer, keyboard, collapse, snap, persistence, reversal, and size behavior remain owned by ResizeHandle and useResizable rather than layout-regions collaborators.                                                                      | Current source, docs, and tests  | Verified current ownership; resize semantics remain unchanged |
| FR4 | Resizable metadata advertises `direction` as a Handle visual state, but current runtime calls `themeProps('resize-handle')` without reflecting that value, so direction selectors cannot match.                                          | Current source and public docs   | Verified audit gap; deliberately not fixed in this change     |
| FR5 | `percent(value, {min: pixel(value)})` and `percent(value, {max: pixel(value)})` resolve against the AST-010 basis; a default selects pixels once, while a bound re-resolves and clamps selected pixels. Both/neither bounds are invalid. | AST-010, source, tests, Chromium | New structured sizing behavior; selected state remains pixels |
| FR6 | Deprecated pixel aliases remain source-compatible and mutually exclusive with unified bounds; untyped exact atomic strings keep their released runtime behavior, and untyped conflicts prefer the unified value and warn.                | AST-010, source, tests           | Additive migration with deterministic precedence              |

### Allowed variation

- **AV1 — Axis.** Handle may resize along the horizontal or vertical layout axis;
  separator orientation and cursor follow the current implementation.
- **AV2 — Placement.** Handle may participate inline or overlay its parent, and
  Grip pill may sit at start, end, center, or the current automatic side.
- **AV3 — Grip content.** Caller-provided children may replace Grip pill without
  changing Handle or Grab zone ownership.
- **AV4 — Divider.** Handle may paint its current divider treatment; a composing
  region remains responsible for avoiding a duplicate adjacent divider.
- **AV5 — Structured percentage bound.** A descriptor carries exactly one `min`
  or `max`, whose value is a `PixelWidth`. Atomic percentages use the existing
  exact `N%` string; arbitrary CSS expressions are outside this contract.

### Representative states

| State                  | Required invariant                                                    | Allowed variation                                  |
| ---------------------- | --------------------------------------------------------------------- | -------------------------------------------------- |
| Default handle         | Handle, Grab zone, and Grip pill render.                              | Divider and always-visible treatment may vary.     |
| Custom handle content  | Handle and Grab zone remain; caller content replaces Grip pill.       | Caller content remains caller-owned.               |
| Horizontal or vertical | Interaction follows the selected axis and current ARIA orientation.   | Size, reversal, and pill placement may vary.       |
| Collapsed or expanded  | Handle preserves valid separator value semantics and resize controls. | Grip pill automatic side follows current behavior. |
| Disabled               | Handle remains represented but is removed from interactive tab order. | Painted treatment follows existing styles.         |

### Transformation and precedence order

- Parse atomic strings exactly; validate `percent()` descriptors as a finite 0–100
  percentage with exactly one finite non-negative pixel bound.
- Resolve percentages against one active basis, then apply the descriptor's floor or
  ceiling.
- Commit a structured default as one initial pixel choice; keep percentage bounds
  live and clamp with `Math.min(max, Math.max(min, size))`.
- Maximum wins when resolved bounds conflict; interaction and persistence stay
  pixel-only.

### Performance and resources

- Atomic pixel paths add no observer or render work.
- A structured default observes a supplied container only until its initial pixel
  choice is final; persisted pixels skip that measurement.
- Percentage bounds reuse the shared ResizeObserver and remain subscribed while
  live. Structured validation and resolution are constant-time; no CSS parser is
  introduced.

## Accessibility contract

The structured API does not change ResizeHandle's separator role, label,
orientation, collapsed value text, focus, pointer, or keyboard behavior. Its
`aria-valuemin`, `aria-valuemax`, and `aria-valuenow` remain the same resolved pixel
values used by hook state and painted geometry.

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
- `architecture:interaction-modality` owns shared modality behavior;
  `architecture:public-component-api` owns the additive structured API and
  compatibility boundary.
- `Resizable/utils` is server-safe and re-exports Table's exact `pixel()` binding
  plus `PixelWidth`, alongside Resizable's `percent()` and structured types.
- `family:layout-regions` lists useResizable and ResizeHandle as collaborators
  that may drive a LayoutPanel's size. Resizable is not a layout-regions member,
  and that family does not own or redefine resize state, snapping, persistence,
  collapse, pointer, or keyboard semantics.

## Verification map

| Contract            | Verification                                       | Representative states                                                            | Mutation or failure expectation                                                                                   | Audit section              |
| ------------------- | -------------------------------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------- |
| FR1                 | `ResizeHandle.test.tsx` plus source inspection     | Default, custom, collapsed, disabled, both axes                                  | Handle and Grab zone regressions fail focused tests; custom Grip replacement currently relies on source review.   | `audit:Resizable/anatomy`  |
| FR2                 | Source inspection and `themingTargets.test.ts`     | Handle, Grip pill, and Grab zone                                                 | Removing a target or documenting an unshipped Grab zone target fails evidence or inventory.                       | `audit:Resizable/theming`  |
| FR3                 | `ResizeHandle.test.tsx` and `useResizable.test.ts` | Pointer, keyboard, snap, collapse, persistence                                   | Moving resize ownership or changing current transformations fails focused behavior coverage.                      | `audit:Resizable/behavior` |
| FR4                 | Source and public metadata comparison              | Horizontal and vertical Handle                                                   | No current test detects that documented `direction` is absent from runtime target-state reflection.               | `audit:Resizable/theming`  |
| FR5                 | Hook/utils tests, typecheck, and Chromium          | Canonical floor/ceiling/default; invalid XOR shape; SSR/hydration; basis changes | Wrong resolution, rescaling defaults, stale clamps, observer leaks, or state/paint/storage/ARIA divergence fails. | `audit:Resizable/behavior` |
| FR6                 | Hook type/runtime tests                            | Old-only aliases; untyped exact atomic strings; typed and untyped conflicts      | Alias incompatibility, ambiguous config, or wrong precedence fails focused tests.                                 | `audit:Resizable/behavior` |
| Theming anatomy map | `scripts/check-knowledge.mjs`                      | Canonical anatomy and two current targets                                        | Missing, extra, prefixed, stale, or multiply assigned mappings fail repository validation.                        | `audit:Resizable/theming`  |

Current tests exercise Handle and Grab zone structure and behavior but do not
render `children` to prove that custom content replaces Grip pill. That branch is
source-inspected and lacks focused regression evidence. The documented
`direction` visual axis is a closed union, so `extensibleAxes.test.ts` does not
cover its missing runtime reflection; that mismatch is currently unguarded.

## Decision log

### Structured percentages use a Table-style helper

**Decision:** `percent(value, {min: pixel(value)})` or
`percent(value, {max: pixel(value)})` represents a percentage with exactly one
pixel bound. Reuse Table's exact `pixel()` binding and `PixelWidth`; do not create
a parallel static helper. The required options and XOR type avoid a second
spelling for plain percentages and make every supported combination explicit.
The pure helper is available with the same `pixel()` binding from the server-safe
`Resizable/utils` subpath, matching Table's established helper/export pattern.
`proportional()` is deliberately not reused because it means sibling weight, not a
literal percentage.

**Rejected:** parsing recursive CSS `min()` / `max()` strings. That would create a
partial second CSS implementation without a demonstrated need for arbitrary
composition.

## Open questions

- **OQ1 — Which follow-up should add and verify the missing Handle `direction`
  target-state reflection?** (`checkable`)
- **OQ2 — Which focused test should pin custom content replacing Grip pill?**
  (`checkable`)

## Content boundary

This file does not duplicate consumer prop tables/examples, resize algorithms,
layout-region rules, current audit results, or implementation steps. It links to
their owners.
