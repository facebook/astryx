---
schema_version: 3
template_version: 7
kind: component
id: component:Field
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [public-api, behavior, layout, theming, accessibility]
verified_by:
  [
    packages/core/src/Field/Field.test.tsx,
    packages/core/src/theme/themingTargets.test.ts,
    packages/core/src/docPropLiterals.test.ts,
    packages/core/src/docPropReferences.test.ts,
  ]
modules: []
families: [family:input-fields]
design_specs:
  [design:spatial-hierarchy, design:typography-hierarchy, design:system-states]
architecture:
  [
    architecture:public-component-api,
    architecture:component-theming-surface,
    architecture:component-test-sufficiency,
  ]
contributing: []
system_specs:
  [spec:AST-027/FR1, spec:AST-027/FR2, spec:AST-027/FR3, spec:AST-027/FR11]
---

# Field component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                                        |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `Field` wraps one caller-owned control with a label, optional description and status, optionality indicators, an explicit width, and root `BaseProps`; it also consumes FormLayout's horizontal-label mode.                                                     |
| Behavior                | Single controls use a native label association; groups use a labelled span. Status messages receive stable IDs and use persistent live regions. Horizontal-label mode exposes one protected `data-layout` theme axis.                                           |
| End-user impact         | People can identify a custom control, hear its description and changing status, and keep label/control/status relationships together across ordinary and horizontal form layouts.                                                                               |
| Builder impact          | Builders provide the control and its ID, wire descriptions/status IDs to that control, choose group semantics when needed, and use a status placement that is safe for the wrapped surface.                                                                     |
| Compatibility/readiness | This draft records released behavior. It adds no API or policy. The released default `statusVariant="attached"` for arbitrary children conflicts with the capability boundary in `family:input-fields/FR8` and remains open.                                    |
| Review checks           | Reject a lost label/group association, dropped root props, caller replacement of `data-layout`, duplicate/missing status announcement, escaped local z-index, undocumented public literals, or a claim that all custom controls safely support attached status. |
| Governing rules         | Established public `Field` interface; `family:input-fields` shared ownership and FR8; `architecture:public-component-api/INV5–INV8`; `spec:AST-027/FR1–FR3`; HTML label and ARIA naming/description semantics.                                                  |

This table is a review projection; the body below is authoritative.

## Intent

`Field` supplies shared label, description, status, width, and layout chrome for a native, custom, or third-party control that does not already own an Astryx field shell. The caller continues to own the control's value, interaction model, and control-specific accessibility semantics.

## Compatibility and migration

- Released default preserved: yes; `statusVariant` still defaults to `attached` in the current implementation.
- Compatibility class: observational only; this draft changes no public prop, default, or behavior.
- Controlled/uncontrolled behavior: caller-owned and unchanged.
- Migration decision: none; resolving OQ1 requires a separate compatibility decision.

## Ownership boundary

**Owns**

- The root field box, explicit width, local stacking boundary, and composition order.
- Label and description placement around the caller-owned control.
- Single-control versus grouped-label semantics.
- Status-message placement and persistent live-region announcement.
- The FormLayout horizontal-label projection.

**Does not own / non-goals**

- The wrapped control's value, focus model, keyboard behavior, disabled behavior, or event semantics — owned by the caller or wrapped component.
- Applying `aria-describedby` to the wrapped control — the caller supplies the control and wires the generated or explicit IDs.
- The visual and semantic contract of `FieldLabel`, `FieldStatus`, `Tooltip`, or caller-owned children — owned by those components.
- Input-family member APIs and control-box part props — owned by `family:input-fields` and each member.

## Public concepts

| Concept                | Closed values or states                           | Meaning                                                                                          | Availability by variant/orientation/state                              | Default                        | Owner                 | Stability                 | Invalid-value behavior                |
| ---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- | ------------------------------ | --------------------- | ------------------------- | ------------------------------------- |
| label mode             | single control; group                             | Chooses a native `<label htmlFor>` or a `<span>` named through `aria-labelledby`.                | All layouts.                                                           | single control                 | `component:Field`     | released                  | Type-constrained                      |
| label visibility       | visible; visually hidden                          | Hides label and description visually while preserving them for assistive technology.             | All layouts.                                                           | visible                        | `component:Field`     | released                  | Type-constrained                      |
| optionality marker     | none; optional; required                          | Shows the localized exception to FormLayout's optionality default.                               | Label presentation.                                                    | none                           | `component:Field`     | released                  | Both set warns; optional wins visibly |
| status placement       | `attached`; `detached`; `tooltip`                 | Places a status box behind the control, below it, or leaves visible tooltip affordance to input. | Message required for a rendered box; tooltip still announces messages. | `attached` (see OQ1)           | `family:input-fields` | released; conformance gap | Type-constrained                      |
| width                  | absent; number; CSS size string                   | Sizes the complete ordinary field box.                                                           | Ordinary box layout; horizontal-label mode uses `display: contents`.   | containing layout              | `component:Field`     | released                  | Type-constrained                      |
| field layout           | ordinary box; `horizontal-labels` from FormLayout | Stacks content or projects label and input group into the parent grid.                           | Resolved from `FormLayoutContext`.                                     | ordinary box                   | `component:Field`     | released                  | Context-constrained                   |
| description/status IDs | explicit; generated from `inputID`; absent        | Names stable description and message elements for caller-owned `aria-describedby` wiring.        | Generated only when the corresponding text is present.                 | generated when text is present | `component:Field`     | released                  | Empty text omits output               |

## Behavioral and layout contract

Draft requirements identify their basis so observed code is not mistaken for an intentional decision.

| ID  | Candidate invariant                                                                                                                                                                                                                                          | Basis                                                                  | Draft review state                  |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- | ----------------------------------- |
| FR1 | A single-control label renders as `<label htmlFor={inputID}>`; a group label renders as a non-label element with `labelID` for caller-owned `aria-labelledby`.                                                                                               | Established public interface; HTML and ARIA semantics                  | settled observation                 |
| FR2 | Visually hidden labels and descriptions remain in the DOM and out of layout flow.                                                                                                                                                                            | Established public interface and accessibility behavior                | settled observation                 |
| FR3 | Description and status IDs use explicit values when supplied and otherwise resolve to `${inputID}-desc` and `${inputID}-status` only when text exists.                                                                                                       | Established public interface                                           | settled observation                 |
| FR4 | Error status messages announce assertively and warning/success messages politely through persistent live regions; tooltip placement renders no `FieldStatus` box but preserves the announcement.                                                             | Existing tests; family ownership                                       | settled observation                 |
| FR5 | Ordinary layout orders label, control, then optional status. Horizontal-label mode places the label wrapper before one description/control/status group and reflects `data-layout="horizontal-labels"`; caller props cannot replace that owned theme marker. | Established layout interface; `architecture:public-component-api/INV5` | settled observation                 |
| FR6 | `width` applies to the ordinary root field box; it does not style the caller-owned control and has no box to target in horizontal-label mode.                                                                                                                | Established public interface; `family:input-fields` shared owner       | settled observation                 |
| FR7 | Root ref, data/ARIA/DOM inputs, events, `xstyle`, class name, and inline style reach or compose on the root without replacing component-owned semantics.                                                                                                     | `architecture:public-component-api/INV5–INV8`                          | settled observation                 |
| FR8 | The Field root isolates every local attached-status paint relationship without assigning the root a page-level z-index.                                                                                                                                      | `spec:AST-027/FR1–FR3`, `FR11`                                         | settled observation                 |
| FR9 | Attached status is safe only for an opaque, bordered, fixed-height control with reliable size reflection; custom, tall, wrapped, translucent, or non-bordered controls use detached or component-owned placement.                                            | `family:input-fields/FR8`; current default mismatch                    | human decision for released default |

### Allowed variation

- **AV1 — Caller-owned control.** Any control markup may occupy the slot; Field does not inspect, clone, or change it.
- **AV2 — Form arrangement.** FormLayout may choose ordinary or horizontal-label arrangement without changing label, description, status, or announcement ownership.
- **AV3 — Status surface.** Eligible controls may use attached placement; other controls use detached or a member-owned tooltip presentation.

### Representative states

| State             | Required invariant                                                             | Allowed variation                                          |
| ----------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| label only        | One associated label precedes the caller-owned control.                        | Visible or visually hidden.                                |
| description       | One description element receives the resolved ID.                              | Caller may use an explicit ID or the generated value.      |
| group             | Group label is not a literal `<label>` and is referenceable by ID.             | Caller owns the group role and `aria-labelledby`.          |
| status            | Message receives resolved ID and is announced once on its urgency channel.     | Attached/detached box or tooltip-owned visible affordance. |
| horizontal labels | Label and input group participate in the parent grid and retain `data-layout`. | Description/status may be absent.                          |
| explicit width    | Ordinary root receives the requested size and remains shrinkable.              | Number or CSS size string.                                 |

### Transformation and precedence order

- **ORD1 — Root props.** Caller DOM/data/event props are forwarded first; Field-owned visual-state reflection is applied afterward; StyleX, caller class, and caller inline style compose in the documented order.
- **ORD2 — IDs.** Explicit description/status ID wins; otherwise text presence derives an ID from `inputID`; absent text produces no ID-bearing element.
- **ORD3 — Optionality.** FormLayout default optionality suppresses the matching visible marker; if both local booleans are true, Field warns and the optional marker wins visibly.

### Performance and resources

- **PR1 — No per-field global resource.** Field owns no listener, observer, timer, or external store. Status announcement delegates to the shared persistent live-region runtime.

## Accessibility contract

- **AR1 — Label association.** Single controls receive a native label association; grouped controls use caller-wired `aria-labelledby` and never a misleading literal `<label>`.
- **AR2 — Description association.** Description text remains separate from the accessible name and exposes a stable ID for caller-owned `aria-describedby`.
- **AR3 — Status announcement.** Changing status text is announced through the persistent live region, including tooltip placement where no message box renders.
- **AR4 — Hidden labels.** Visually hidden label and description text remain available to assistive technology.

## Design relationships

| Anatomy or state              | Design requirement                                       | Representation authority                               | Hierarchy role            | Component contract |
| ----------------------------- | -------------------------------------------------------- | ------------------------------------------------------ | ------------------------- | ------------------ |
| Label and description         | `design:typography-hierarchy/DR4`, `DR6`                 | prescribed roles; exact tuning remains token-owned     | label and supporting text | FR1–FR3            |
| Label/control/status grouping | `design:spatial-hierarchy` local and group relationships | prescribed relationship; exact gap remains token-owned | one field group           | FR5                |
| Semantic status               | `design:system-states/DR2`                               | delegated to FieldStatus and wrapped input             | supporting feedback       | FR4, FR9           |

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Container": {"target": "field"},
  "Label": {"target": "field-label"},
  "Description": {
    "none": {
      "reason": "reachability-gap: The stable description paints supporting text outside the field-label target and has no current public target of its own."
    }
  },
  "Control slot": {
    "none": {
      "reason": "intentional: The wrapped control is caller-owned or another Astryx component and retains its own theming surface."
    }
  },
  "Status message": {"target": "field-status"},
  "Input status icon": {"target": "input-status-icon"},
  "Input clear button": {"target": "input-clear-button"},
  "Input clear icon": {"target": "input-clear-icon"},
  "Optional/Required indicator": {"inherits": "field-label"},
  "Label tooltip": {
    "delegatesTo": {"owner": "component:Tooltip", "target": "tooltip"}
  }
}
```

## Family and system relationships

- `family:input-fields` owns shared status-placement capability and identifies Field as the standalone label, description, status-placement, and explicit-width owner.
- `architecture:public-component-api` owns root prop, style, event, and ref composition.
- `architecture:component-theming-surface` owns anatomy qualification and target disposition.
- `architecture:component-test-sufficiency` owns mutation-sensitive evidence and bounded partitions.
- `spec:AST-027` owns the isolated local paint relationship between the control and attached status.

## Verification map

| Contract                 | Verification                                                                           | Representative states                                                                                | Mutation or failure expectation                                                                                                | Audit section               |
| ------------------------ | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------- |
| FR1–FR3, AR1–AR2, AR4    | `Field.test.tsx` DOM/accessibility tests                                               | single control, group, visible/hidden label, explicit/generated IDs                                  | A lost association, wrong element, missing hidden text, or wrong ID fails.                                                     | `audit:Field/accessibility` |
| FR4, AR3                 | `Field.test.tsx` announcement tests plus exact-head browser accessibility evidence     | first mount, update, repeat, error, warning, attached, detached, tooltip                             | A missing, duplicate, stale, or wrong-urgency announcement fails.                                                              | `audit:Field/accessibility` |
| FR5–FR7, ORD1            | `Field.test.tsx`, BaseProps lint, theming-target tests, and exact-head visual evidence | ordinary/horizontal layout; class/style/xstyle/data/event/ref; description/status                    | Dropped caller input, replaceable layout marker, wrong order, or lost target fails.                                            | `audit:Field/api`           |
| FR8                      | computed-style tests and exact-head browser rendering                                  | attached, detached, tooltip, no status                                                               | Removing isolation or ranking the root outside its parent fails.                                                               | `audit:Field/code-health`   |
| FR9                      | family contract review and component-owned visual evidence                             | eligible bordered control; custom/tall/non-bordered control                                          | Attached placement on an ineligible surface remains visible as the current conformance gap.                                    | `audit:Field/behavior`      |
| Theming anatomy          | knowledge validation and theming-target tests                                          | Field root, label, description, caller control, status, shared input affordances, indicator, tooltip | Missing, duplicate, or wrongly owned dispositions fail.                                                                        | `audit:Field/theming`       |
| Documentation projection | docs typecheck and prop literal/reference tests                                        | labelIcon; all status placements; anatomy and usage guidance                                         | Docs omit or misstate a public type/literal/owner and validation fails or review rejects it.                                   | `audit:Field/docs`          |
| RTL applicability        | exact-head RTL audit and verified-N/A registry                                         | all checked-in Field stories and source                                                              | A directional glyph, physical inline placement, order, scroll/drag, overlay, or directional keyboard behavior makes N/A stale. | `audit:Field/i18n-rtl`      |

## Decision log

No component-local decision is asserted. This draft records released behavior and leaves the current family-owned status-placement conflict in OQ1.

## Open questions

- **OQ1 — How should Field migrate the released `attached` default so arbitrary custom controls cannot receive a placement that `family:input-fields/FR8` says they may not safely support?** (`human-api`)

## Content boundary

This draft records verified shipped behavior and the current family-owned conformance gap. It does not approve a new default, migration, theme target, or compatibility promise, and it does not duplicate audit scores or run evidence.
