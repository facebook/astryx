---
schema_version: 3
template_version: 3
kind: component
id: component:Stepper
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-09-02
owners: [cixzhang]
review_triggers: [public-api, theming, layout, behavior]
verified_by:
  [packages/core/src/Stepper/Stepper.test.tsx, scripts/check-knowledge.mjs]
modules: []
families: []
design_specs: []
architecture:
  [
    architecture:component-theming-surface,
    architecture:public-component-api,
    architecture:react-update-propagation,
  ]
contributing: []
system_specs: [spec:AST-002/DEC-1]
---

# Stepper component contract

## Intent

Stepper presents an ordered flow of steps and the progress made through it. This
contract records its narrow-container behavior, anatomy-to-target map, public
semantic custom property `--step-connector-gap`, and Label and Description
ownership.

## Compatibility and migration

- `horizontalOptions.minimumStepWidth` defaults to `112` CSS pixels, and
  `collapsedVariant` defaults to `withLabelAndControls`. The threshold accepts
  only finite non-negative numbers and interprets them as CSS pixels.
- `horizontalOptions` owns the per-step collapsed threshold and collapsed
  label/control presentation as one horizontal-only public concept.
- Changes to `horizontalOptions`, its defaults, or any other exported Stepper
  surface MUST preserve valid released usage or provide the explicit
  compatibility and migration evidence required by
  `architecture:public-component-api`.
- Stepper has no controlled/uncontrolled state mode.
- When compatible implementation cannot preserve valid released usage, consumer
  instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The `stepper`, `stepper-summary`, `step`, `step-bar`, `step-connector`,
  `step-indicator`, `step-label`, and `step-description` targets.
- The Frame as a private layout-only wrapper. It MAY remain in the DOM but MUST
  NOT expose a theme target, public selector contract, or styling dependency.
- The two paint layers of a connector — the unfilled track (the element's own
  background) and the accent fill (an absolutely placed `::before`) — and the
  single clip that holds both off the indicator.
- Which pieces an on-track connector is drawn from, and how many.
- Interpretation of the number-only `horizontalOptions.minimumStepWidth` threshold
  and the collapsed state derived from that pixel value, the Stepper width, and
  registered steps.
- Label and Description paint and the target ownership defined by FR9–FR11.

**Does not own / non-goals**

- Indicator artwork supplied through `indicator` — owned by the caller.
- The step content slot and any `endContent` — owned by the caller.
- Whether a step is complete: derived from `activeStep`, not from a caller-owned
  per-step lifecycle.
- The unpainted clickable inner column.

## Public concepts

| Concept                              | Closed values or states                            | Meaning                                                                                                                                            | Availability by variant/orientation/state                                                                     | Default                                                    | Owner               | Stability | Invalid-value behavior                                                                                                                             |
| ------------------------------------ | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--step-connector-gap`               | Any CSS `<length-percentage>`                      | How far the track stops short of the indicator, on the side facing it                                                                              | `indicatorPosition="on-track"`, both orientations and both directions, only on steps that render an indicator | `0px`                                                      | `component:Stepper` | stable    | Clamped, never rejected: values below `0` resolve to `0`, values above `--spacing-2` cap at `--spacing-2`                                          |
| `horizontalOptions.minimumStepWidth` | finite non-negative `number`                       | Required within `horizontalOptions`; per-step width in CSS pixels below which a horizontal Stepper uses its collapsed presentation                 | Horizontal orientation                                                                                        | `112` when `horizontalOptions` is omitted                  | Caller              | stable    | Negative, `NaN`, infinite, string, unit-bearing, `calc()`, and custom-property values are unsupported and MUST NOT be reinterpreted as CSS lengths |
| `horizontalOptions.collapsedVariant` | `withLabelAndControls \| withLabel \| hiddenLabel` | Required within `horizontalOptions`; whether collapsed mode shows a label with navigation controls, a label alone, or only the bare progress track | Collapsed horizontal orientation; controls require `withLabelAndControls` and `onStepClick`                   | `withLabelAndControls` when `horizontalOptions` is omitted | Caller              | stable    | TypeScript rejects unknown variants                                                                                                                |

Consumer syntax and description remain in `Stepper.doc.mjs` `theming.vars`.

### Context ownership and privacy

The exported `StepperContextValue` and `useStepperContext` contract remains the
v0.5.2 shape:

- `activeStep`, `previousActiveStep`, `orientation`, `isNonLinear`,
  `onStepClick`, `density`, and `indicatorPosition`; and
- `registerStep(index)`, returning its unmount cleanup.

Collapsed-layout coordination uses a separate private context that is not
exported from the Stepper subpath or package root. It MAY expose narrowly scoped
collapsed capabilities such as `isCollapsed` and a parent-owned render capability
for the explicitly named Collapsed summary anatomy. It MUST NOT expose a raw DOM
`summarySlot`, require a child to own the parent's destination element, or add
collapsed-layout fields to `StepperContextValue`.

The exact private function names and storage mechanism are implementation details.
The current two-argument `registerStep`, public `stepCount`, `isCompact`,
`summarySlot`, `minimumStepWidth`, and `minStepWidthMeasureRef` fields are
implementation adoption gaps, not additions to the exported contract.

## Behavioral and layout contract

| ID   | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Evidence                                        |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| FR1  | `--step-connector-gap` falls back to `0px` where each connector consumes it and honors values inherited from an ancestor or supplied through the `stepper` theming target.                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Current source; PR #5495 is historical evidence |
| FR2  | The gap is applied to the ONE edge each segment faces the indicator from, mirrored per axis, so the pair leaves a hole centred on the node.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Current source and browser probe                |
| FR3  | One declaration covers both connector paint layers. A clip on the segment clips its `::before` with it, against one reference box, so the two cannot disagree.                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Current source and browser probe                |
| FR4  | The resolved value is clamped to `max(0px, min(value, --spacing-2))` before use.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Current source; PR #5495 is historical evidence |
| FR5  | A step rendering no indicator (`indicator="none"`) applies no clip, leaving its track continuous.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Current source and browser probe                |
| FR6  | No accepted value changes the Stepper's outer size, in either orientation. A clip cannot affect layout.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Current source and browser probe                |
| FR7  | The horizontal clip mirrors under `dir="rtl"`, so the hole stays at the indicator rather than moving to the join between steps.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Current source; PR #5495 is historical evidence |
| FR8  | The pieces an on-track connector is drawn from are not public: no `data-segment`, and no bare `lead`/`rail`/`content` class is emitted.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | `component:Stepper/DEC-1`                       |
| FR9  | In both indicator positions, each rendered Label and Description carries its own target and reflects `progress` and `status`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Current source, docs, and tests                 |
| FR10 | Label alone reflects `disabled`, because only Label owns disabled paint. Description and the other targets do not gain the selector for symmetry.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Current source, docs, and tests                 |
| FR11 | Label and Description each declare `font-size`, `line-height`, and `color`. Those declarations outrank values inherited from `step`, so only direct targets can expose that paint to themes.                                                                                                                                                                                                                                                                                                                                                                                                                                     | Current source and Chromium probe               |
| FR12 | A collapsed horizontal summary sits directly beneath its track without an additional frame gap.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Current source and narrow-layout evidence       |
| FR13 | In collapsed `on-track`, indicators remain on the rail and the active indicator is not repeated beside the summary label; collapsed `separated` retains the active indicator beside its label.                                                                                                                                                                                                                                                                                                                                                                                                                                   | Current source and narrow-layout evidence       |
| FR14 | `horizontalOptions.minimumStepWidth` accepts only a finite non-negative number interpreted as CSS pixels. No string, CSS unit, `calc()`, custom property, hidden measurement element, or browser-resolved threshold is part of the public contract.                                                                                                                                                                                                                                                                                                                                                                              | Owner-defined number-only threshold             |
| FR15 | `horizontalOptions.collapsedVariant` keeps horizontal-only configuration together: `withLabelAndControls` shows the label and controls, `withLabel` shows only the label, and `hiddenLabel` renders only the bare progress track with no collapsed row.                                                                                                                                                                                                                                                                                                                                                                          | Current source, docs, and tests                 |
| FR16 | Changing `isDisabled` on one mounted Step MAY rerender that Step and the collapsed summary navigation affordances whose availability depends on it. It MUST NOT unregister or re-register the Step, change registered membership or `stepCount`, replace the exported-context provider value, or rerender unrelated Steps. Mount, unmount, and a change to the Step's `step` identity are the only events that change membership. Mutable disabled metadata uses a narrowly subscribed channel independent from membership. The affected Step continues to own its disabled interaction and rendered-state semantics under FR10. | Owner-defined render-isolation requirement      |
| FR17 | `StepperContextValue` and `useStepperContext` preserve the v0.5.2 exported contract. Collapsed-layout coordination uses a separate non-exported context. That private context MAY expose `isCollapsed` and a parent-owned render capability for Collapsed summary, but MUST NOT expose a raw DOM slot or turn collapsed-layout state into exported context fields. Changes that affect only collapsed coordination MUST NOT replace the public context value unless one of its stable public fields changed.                                                                                                                     | Owner-defined API and privacy boundary          |

`status` on Label and Description is a selector seam. It does not claim that
Astryx paints either text part by status.

### Allowed variation

- **AV1 — Segment count.** How many elements draw one connector span may change
  with orientation and with the presence of a content slot, without becoming a
  regression. It is not public.
- **AV2 — Percentage resolution.** A percentage resolves against each segment's
  own box, so the hole may differ slightly between a fixed and a flexible
  segment. Both layers of any one segment still agree exactly (FR3).

### Representative states

| State                                                          | Required invariant | Allowed variation            |
| -------------------------------------------------------------- | ------------------ | ---------------------------- |
| vertical, on-track, indicator                                  | FR2, FR3, FR6      | AV1, AV2                     |
| horizontal, on-track, indicator                                | FR2, FR3, FR6, FR7 | AV1, AV2                     |
| `dir="rtl"`, horizontal                                        | FR7                | AV1                          |
| `indicator="none"`                                             | FR5                | —                            |
| value below `0` or above the cap                               | FR4, FR6           | —                            |
| both indicator positions; each progress/status; disabled Label | FR9–FR11           | —                            |
| collapsed horizontal summary                                   | FR12               | —                            |
| collapsed `on-track` and `separated` indicators                | FR13               | —                            |
| finite non-negative pixel threshold                            | FR14               | —                            |
| default threshold in ordinary and all-complete progress states | FR14               | —                            |
| each `collapsedVariant`, with and without `onStepClick`        | FR15               | —                            |
| mounted Step `isDisabled` false → true → false                 | FR16               | —                            |
| collapsed/un-collapsed transition and Collapsed summary render | FR17               | private implementation shape |

### Transformation and precedence order

- **ORD1 — Gap resolution.** Read the inherited custom property → clamp to
  `max(0px, min(value, --spacing-2))` → apply as one `clip-path: inset()` on the
  segment. Both halves of the clamp are load-bearing, and neither for padding's
  reasons: `inset()` **accepts** a negative length rather than clamping it the
  way padding does, so the floor has to be written; the cap bounds an oversized
  gap to a short track.

### Performance and resources

- Stepper measures its rendered width through one component-owned resize
  subscription. Collapsed state compares that width with the registered step count
  and the number-only pixel threshold from FR14.
- The current hidden CSS-length probe, `minStepWidthMeasureRef`, resolved-threshold
  state, and second ResizeObserver subscription are not justified by the intended
  number-only API. They are an implementation adoption gap, not part of the
  public contract.
- Step membership and mutable per-Step navigation metadata use separate update
  channels. Registration is lifecycle-bound. Disabled metadata may use a
  lifecycle-stable ref, store, or another narrowly subscribed mechanism; the
  mechanism is not normative, but it must preserve FR16's membership,
  context-identity, and render-isolation outcomes.

## Accessibility contract

Collapsed layout preserves the ordered-list role and `aria-current` handling while
moving optional navigation to the summary controls. Threshold calculation adds no
hidden measurement content to the accessibility tree.

## Design relationships

| Anatomy or state  | Design requirement                                                                                  | Representation authority       | Hierarchy role | Component contract     |
| ----------------- | --------------------------------------------------------------------------------------------------- | ------------------------------ | -------------- | ---------------------- |
| Stepper           | Lays the flow out on one orientation and indicator placement.                                       | Current source and public docs | Supporting     | FR1                    |
| Frame             | Groups the ordered steps with the optional collapsed summary; remains private layout-only structure | `component:Stepper`            | Supporting     | no public theme target |
| Collapsed summary | Names and controls the current step when horizontal labels collapse.                                | Current source and public docs | Prominent      | —                      |
| Step              | Carries one step's status.                                                                          | Current source and public docs | Supporting     | —                      |
| Progress bar      | Presents progress as a segmented bar per step.                                                      | Current source and public docs | Prominent      | —                      |
| Connector         | Presents the track between indicators, and the progress made along it.                              | Current source and public docs | Prominent      | FR2–FR7                |
| Indicator         | Presents the step's position or completion.                                                         | Current source and public docs | Prominent      | FR5                    |
| Label             | Identifies the step.                                                                                | Current source and public docs | Prominent      | FR9–FR11               |
| Description       | Gives supporting context below the Label.                                                           | Current source and public docs | Supporting     | FR9–FR11               |

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Stepper": {"target": "stepper"},
  "Frame": {
    "none": {
      "reason": "intentional: The Frame is structural layout only and has no distinct stable paint semantics."
    }
  },
  "Collapsed summary": {"target": "stepper-summary"},
  "Step": {"target": "step"},
  "Progress bar": {"target": "step-bar"},
  "Connector": {"target": "step-connector"},
  "Indicator": {"target": "step-indicator"},
  "Label": {"target": "step-label"},
  "Description": {"target": "step-description"}
}
```

Frame is layout-only structure. The currently emitted
`astryx-stepper-frame` selector is an implementation adoption gap, not public
contract. Themes must not style or rely on the wrapper; the semantic Stepper/list
and the explicitly targeted visual anatomy remain the public theming surface.

Connector is one anatomy part with one target, even though the on-track layouts
draw it from up to three elements. Those pieces are layout implementation, not
semantic parts, so they get no targets of their own — see `DEC-1`, which is also
why the caller-owned gap is a custom property rather than a per-piece vocabulary.

Label and Description are local spans styled by Stepper, not delegated `Text`
parts. Their own typography and color declarations make `inherits: step` false;
`DEC-2` records why they own direct targets instead.

## Family and system relationships

- `architecture:component-theming-surface` owns anatomy qualification, the
  guaranteed-property catalog, and the admission rule for public semantic
  variables.
- `architecture:public-component-api` owns the API admission bar those variables
  must also pass.
- `architecture:react-update-propagation` owns the shared boundaries for
  lifecycle registration, mutable metadata, context fan-out, and render-isolation
  evidence. FR16 projects those boundaries onto Stepper's concrete behavior.

## Verification map

| Contract            | Verification                                                                                           | Representative states                                                                                               | Mutation or failure expectation                                                                                                                                                                                                                                                                    | Audit section            |
| ------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| FR1                 | `Stepper.test.tsx` fallback and inheritance assertions                                                 | vertical and horizontal on-track                                                                                    | Declaring a default on the semantic Stepper/list blocks values inherited from an ancestor.                                                                                                                                                                                                         | `audit:Stepper/theming`  |
| FR2, FR3            | `Stepper.test.tsx` clip assertions                                                                     | vertical and horizontal on-track                                                                                    | Clipping the wrong edge, or per-layer copies of the value, fails the suite.                                                                                                                                                                                                                        | `audit:Stepper/theming`  |
| FR4, FR6            | `Stepper.test.tsx` clamp assertion                                                                     | values below `0` and above the cap                                                                                  | Removing the floor lets a negative inset through; removing the cap unbounds the hole.                                                                                                                                                                                                              | `audit:Stepper/theming`  |
| FR5                 | `Stepper.test.tsx` no-indicator assertion                                                              | `indicator="none"`                                                                                                  | Applying the clip unconditionally puts holes in a track with no node in them.                                                                                                                                                                                                                      | `audit:Stepper/theming`  |
| FR7                 | `Stepper.test.tsx` RTL assertion                                                                       | `dir="rtl"`, horizontal                                                                                             | Dropping the mirror moves the hole to the join between steps; caught by the assertion.                                                                                                                                                                                                             | `audit:Stepper/theming`  |
| FR8                 | `Stepper.test.tsx` vocabulary guard                                                                    | vertical on-track                                                                                                   | Re-adding `data-segment` or a bare role class fails the guard.                                                                                                                                                                                                                                     | `audit:Stepper/theming`  |
| FR9, FR10           | `Stepper.test.tsx` target and generated-theme assertions                                               | Both indicator positions; progress, status, and disabled                                                            | Removing a target or state, or moving it off the painted span, fails focused tests.                                                                                                                                                                                                                | `audit:Stepper/theming`  |
| FR11                | Exact-head Chromium probe                                                                              | Themed `step`, Label, and Description                                                                               | If inheritance reaches the text, the Step target's probe color appears there.                                                                                                                                                                                                                      | `audit:Stepper/theming`  |
| FR12                | `Stepper.test.tsx` collapsed frame gap assertion                                                       | Collapsed horizontal summary                                                                                        | Restoring frame spacing separates the summary from the track and fails the suite.                                                                                                                                                                                                                  | `audit:Stepper/layout`   |
| FR13                | `Stepper.test.tsx` collapsed indicator assertions                                                      | Collapsed `separated` and `on-track`                                                                                | Repeating the on-track active indicator, or dropping the separated one, fails the suite.                                                                                                                                                                                                           | `audit:Stepper/layout`   |
| FR14                | Type, runtime-validation, and collapsed-threshold assertions                                           | Default, zero, positive finite pixel number, negative, `NaN`, infinity, string/CSS input, all-complete state        | A string or non-finite/negative value becomes a CSS length, a hidden threshold probe is required, or pixel comparison changes across progress states.                                                                                                                                              | `audit:Stepper/layout`   |
| FR15                | `Stepper.test.tsx` collapsed-variant assertions                                                        | Three variants, with and without navigation                                                                         | A variant shows an unrequested label/control or changes the accessible sequence.                                                                                                                                                                                                                   | `audit:Stepper/layout`   |
| FR16                | Registration, context-identity, and render-count mutation tests                                        | Mounted Step `false → true → false` in collapsed/non-collapsed layouts; Step identity change; unmount; StrictMode   | Disabled updates change only the affected Step and dependent collapsed controls; registration setup/cleanup and `stepCount` stay unchanged; provider identity and unrelated Step render counts stay stable; identity change/unmount update membership once; disabled DOM semantics remain correct. | `audit:Stepper/behavior` |
| FR17                | Public declaration diff, export guards, provider-identity tests, and collapsed-summary rendering tests | v0.5.2 public context imports; collapsed/un-collapsed transitions; summary present/absent; disabled metadata change | The public hook/type gains a field or signature change, private context is exported, raw DOM crosses the context, the public provider changes for private-only state, or the parent no longer owns summary placement.                                                                              | `audit:Stepper/behavior` |
| Theming anatomy map | `scripts/check-knowledge.mjs`                                                                          | Canonical anatomy; eight current targets; Frame classified as intentionally unthemeable                             | A target has no anatomy owner, Frame regains a target, or a stale/extra part passes repository validation.                                                                                                                                                                                         | `audit:Stepper/theming`  |

## Decision log

### DEC-1 — The connector gap is a public custom property, not a theme target per piece

**Reference:** `component:Stepper/DEC-1`
**Decider:** `cixzhang`, `2026-09-02`

The optional Connector anatomy represents the connected, on-track presentation;
its inner gap from the component-owned Indicator is a stable component
responsibility. A theme may want that track to stop short of the indicator rather
than run through it. Two otherwise identical Steppers need different resolved outcomes
and only the theme knows which, so the need is caller-owned
(`spec:AST-002/DEC-1` FR1). Astryx cannot derive it: nothing in the component's
state, content, or layout says whether this design wants a broken or a
continuous track.

No guaranteed CSS property on the owning target can express it. A connector
paints in two layers — the element's own background (the unfilled track) and a
`::before` at `inset: 0` (the accent fill) — and a theme target reaches the
element only. Measured in Chromium against a built theme override on
`step-connector`, three steps, vertical:

- `paddingBlock: 6px` produces **no hole at all**. The element's background
  paints to its border box, and the fill is a pseudo-element the theme cannot
  reach, so the only observable effect is the Stepper growing 108px → 120px.
- `paddingBlockEnd: 6px` produces no hole either, and would in any case address
  only one of the two edges: the leading segment faces the node with its far
  edge, the trailing segment with its near one.

Only the component can put one clip on the segment that takes its pseudo-element
with it, mirror it per axis and per direction, and clamp the value first.

Rejected: exposing `lead` / `rail` / `content` as a public segment vocabulary
(the earlier form of this change). The words never reached generated docs, they
emitted bare `lead` / `content` classes a consumer stylesheet can collide with,
and `lead` denotes different geometry per orientation, so a theme selecting it
could not know what it would get.

### DEC-2 — Label and Description own direct targets

**Reference:** `component:Stepper/DEC-2`
**Decider:** `cixzhang`, `2026-09-02`

FR9–FR11 define the admitted targets, state selectors, and inheritance
evidence. Rejected alternatives: `inherits: step` fails FR11;
`delegatesTo: component:Text` describes a composition Stepper does not render;
and `step-row` would expose an unpainted wrapper for speculative styling.

### DEC-3 — Horizontal behavior uses one options object

**Reference:** `component:Stepper/DEC-3`
**Decider:** `cixzhang`, `2026-09-06`

Two otherwise identical horizontal Steppers can need different collapse points
or collapsed content: one may use short fixed labels while another uses wider
localized labels; one surrounding flow may own Back/Continue or a step heading
while another relies on the Stepper. The caller owns those distinctions. Existing
styling seams cannot select the collapsed React presentation because collapse
changes rendered labels, focus targets, navigation controls, and preserved
content rather than paint alone.

`horizontalOptions` keeps these horizontal-only decisions out of the Stepper's
top-level API. `minimumStepWidth` names the finite non-negative per-step pixel
width the caller is guaranteeing. It does not accept CSS strings, units,
`calc()`, or custom properties; the component compares the numeric threshold
directly with measured Stepper geometry. `collapsedVariant` is one closed choice
because its values describe the complete collapsed presentation and avoid
conflicting boolean combinations.

### DEC-4 — The collapsed threshold is a finite pixel number

**Reference:** `component:Stepper/DEC-4`
**Decider:** `cixzhang`, `2026-09-06`

`horizontalOptions.minimumStepWidth` accepts only a finite non-negative number
and interprets it as CSS pixels. The threshold is a collapsed-layout input, not a
CSS styling seam. A number keeps the comparison explicit, portable, and
independent from inherited styling or a hidden measurement element.

Rejected: CSS strings, units, `calc()`, and custom properties. Supporting those
forms would add browser-resolved threshold state, a hidden probe, and another
ResizeObserver subscription without an intended public need.

### DEC-5 — The Frame remains private layout structure

**Reference:** `component:Stepper/DEC-5`
**Decider:** `cixzhang`, `2026-09-06`

The Frame groups the semantic Stepper/list with its optional collapsed summary, but
that structural responsibility does not make it a public visual anatomy target.
It may remain as an internal wrapper when layout requires it. Themes must use the
semantic `stepper` target or an explicitly approved painted part and must not
style, select, or depend on the Frame.

Rejected: `stepper-frame` / `astryx-stepper-frame` as a public target. Exposing a
layout-only wrapper makes DOM structure a theme compatibility promise without an
owned visual need. The current `none` disposition is factual and does not preclude
a future target proposal backed by distinct stable paint semantics and the normal
admission evidence.

### DEC-6 — Collapsed coordination stays private

**Reference:** `component:Stepper/DEC-6`
**Decider:** `cixzhang`, `2026-09-06`

The exported `StepperContextValue` and `useStepperContext` remain the v0.5.2
contract. Collapsed-layout coordination belongs to a separate private,
non-exported context so adding or changing collapse behavior does not enlarge the
public supporting API or replace its provider value for private-only state.

The private context may expose `isCollapsed` and a parent-owned render capability
for Collapsed summary. The parent owns placement and rendering of that anatomy;
children must not exchange a raw DOM `summarySlot`. Exact private function names
and storage remain implementation details.

Rejected: adding `stepCount`, `isCompact`, `summarySlot`, `minimumStepWidth`,
`minStepWidthMeasureRef`, or a two-argument `registerStep` to the exported context.
Those values expose layout machinery, confuse collapsed layout with compact
density, or change the released public operation shape.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables, examples, implementation
steps, or system rules. It links to their owners.
