---
schema_version: 3
template_version: 7
kind: component
id: component:FormLayout
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [public-api, behavior, layout, theming, accessibility]
verified_by:
  [
    packages/core/src/FormLayout/FormLayout.test.tsx,
    apps/storybook/stories/FormLayout.stories.tsx,
    packages/core/src/theme/themingTargets.test.ts,
    packages/core/src/docPropLiterals.test.ts,
    packages/core/src/docPropReferences.test.ts,
  ]
modules: []
families: [family:input-fields]
design_specs: []
architecture:
  [
    architecture:public-component-api,
    architecture:component-theming-surface,
    architecture:component-test-sufficiency,
  ]
contributing: []
system_specs: []
---

# FormLayout component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                                                |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `FormLayout` arranges caller-owned fields through `vertical`, `horizontal`, and `horizontal-labels` directions, provides a form-level optionality default, exports its context and supporting types, and accepts root `BaseProps`.                                      |
| Behavior                | Vertical stacks children; horizontal creates one fractional grid track per child in logical inline order; horizontal-labels pairs Field labels and controls, then collapses below a 481px viewport.                                                                     |
| End-user impact         | People encounter predictable field spacing and order, and assistive technology receives required-state information even when the form-wide visual convention leaves the common case unmarked.                                                                           |
| Builder impact          | Builders supply the fields and any semantic `<form>`, title, or footer; nested layouts replace the outer direction and optionality context for their descendants.                                                                                                       |
| Compatibility/readiness | This draft records released behavior. It changes no public API, default, or runtime behavior.                                                                                                                                                                           |
| Review checks           | Reject lost root props, physical inline ordering, changed collapse boundaries, caller-overridable direction reflection, lost nested-context shadowing, or a visible optionality convention that disagrees with ARIA. Narrow label/control grouping remains open in OQ1. |
| Governing rules         | Established public FormLayout interface; `family:input-fields` outer-arrangement ownership; `architecture:public-component-api/INV5–INV9`; `architecture:component-theming-surface/INV2–INV6`.                                                                          |

This table is a review projection; the body below is authoritative.

## Intent

`FormLayout` owns the outer spatial relationship among caller-owned form fields. It does not create form submission, field state, labels, controls, or action regions.

## Compatibility and migration

- Released default preserved: yes; direction defaults to `vertical`, and optionality remains field-owned when `defaultOptionality` is unset.
- Compatibility class: observational only; this draft changes no public prop, default, or behavior.
- Controlled/uncontrolled behavior: not applicable; FormLayout owns no form value or submission state.
- Migration decision: none.

## Ownership boundary

**Owns**

- Outer field arrangement, spacing, direction, and the viewport collapse for horizontal labels.
- Form-level optionality context and nested-layout shadowing.
- The root DOM element, root prop composition, and the `form-layout` theme target.

**Does not own / non-goals**

- Form semantics, submission, validation, or action placement — owned by the product callsite and native `<form>`.
- Field labels, controls, status, and internal geometry — owned by `component:Field`, each input, and `family:input-fields`.
- The content or visual contract of caller-supplied titles and footers — owned by their rendered components or the callsite.

## Public concepts

| Concept             | Closed values or states                         | Meaning                                                                 | Availability by variant/orientation/state                    | Default              | Owner                  | Stability | Invalid-value behavior |
| ------------------- | ----------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------ | -------------------- | ---------------------- | --------- | ---------------------- |
| direction           | `vertical`; `horizontal`; `horizontal-labels`   | Selects the outer arrangement and provides that value to descendants.   | All layouts.                                                 | `vertical`           | `component:FormLayout` | released  | Type-constrained       |
| default optionality | unset; `optional`; `required`                   | Marks only exceptions while controls preserve resolved required state.  | All directions; the nearest nested layout shadows the outer. | unset / per-field    | `component:FormLayout` | released  | Type-constrained       |
| root composition    | DOM/data/ARIA/events; ref; class/style/`xstyle` | Extends the root layout container without replacing owned reflection.   | All directions.                                              | no caller decoration | `component:FormLayout` | released  | Shared merge contract  |
| layout context      | direction plus optionality                      | Lets Field and inputs adapt their layout and required-state projection. | Descendants in the same layer scope.                         | vertical / unset     | `component:FormLayout` | released  | Nearest provider wins  |

## Behavioral and layout contract

Draft requirements identify their basis so observed code is not mistaken for an intentional decision.

| ID  | Candidate invariant                                                                                                                                                                                                                                                                                                         | Basis                                                               | Draft review state                                    |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------- |
| FR1 | Vertical direction stacks children with the shared spacing token.                                                                                                                                                                                                                                                           | Established public interface; current source and stories            | settled observation                                   |
| FR2 | Horizontal direction places every direct child in one `1fr` grid track and follows the document's logical inline order without a component-owned wrap rule.                                                                                                                                                                 | Established public interface; current source and stories            | settled observation                                   |
| FR3 | Horizontal-labels direction lets Field labels and control groups participate in a two-column grid, with the label on the inline-start side; at a viewport width of 480px or below it becomes one vertical flex column. Whether the collapsed label/control gap distinguishes each pair strongly enough remains open in OQ1. | Established public interface; Field composition and browser fixture | wide behavior settled; narrow grouping human decision |
| FR4 | A nested FormLayout replaces the outer direction and optionality context for its descendants.                                                                                                                                                                                                                               | Existing context and unit tests                                     | settled observation                                   |
| FR5 | `defaultOptionality` suppresses only the visible marker that restates the form default; descendant controls still expose resolved `aria-required`, while native `required` remains tied to explicit field intent.                                                                                                           | Existing tests; `family:input-fields` ownership                     | settled observation                                   |
| FR6 | Root ref, DOM/data/ARIA/event props, `xstyle`, class name, and inline style reach or compose on the root without replacing `data-direction` or the canonical target.                                                                                                                                                        | `architecture:public-component-api/INV5–INV8`                       | settled observation                                   |

### Allowed variation

- **AV1 — Caller content.** Any caller-owned field, heading, explanatory content, or action region may be a child; FormLayout does not inspect or rewrite it.
- **AV2 — Nested arrangement.** Builders may nest vertical and horizontal layouts; each provider owns only its descendant scope.
- **AV3 — Root styling.** Caller styling may change the container's presentation while preserving the public direction and child contracts.

### Representative states

| State                      | Required invariant                                                      | Allowed variation                                                  |
| -------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------ |
| vertical                   | One block-axis stack with tokenized gaps.                               | Any caller-owned children.                                         |
| horizontal                 | One `1fr` grid track per child in logical inline order.                 | Child count and content.                                           |
| horizontal labels / wide   | Label/control pairs share consistent two-column tracks.                 | Label and control content.                                         |
| horizontal labels / narrow | One vertical column at 480px or below with no component-owned overflow. | Label/control grouping remains OQ1; caller-owned content may wrap. |
| optional by default        | Only explicitly required fields show the exception marker.              | Field and input type.                                              |
| required by default        | Only explicitly optional fields show the exception marker.              | Field and input type.                                              |
| nested                     | Inner direction and optionality replace outer values.                   | Any supported inner direction/default combination.                 |

### Transformation and precedence order

- **ORD1 — Context.** Explicit props resolve against `vertical` and unset defaults, then the nearest provider exposes the resolved values to descendants.
- **ORD2 — Root props.** FormLayout-owned target and direction reflection compose with StyleX and caller styling; caller DOM props reach the same root without replacing owned reflection.
- **ORD3 — Optionality.** The layout default establishes the unmarked majority; a field-level `isRequired` or `isOptional` marks the exception and controls native validation only when explicitly requested.

### Performance and resources

- **PR1 — Stable context identity.** Descendants receive one memoized context value per direction/optionality pair; FormLayout owns no listener, observer, timer, or external resource.

## Accessibility contract

- **AR1 — Layout remains nonsemantic.** FormLayout renders a `<div>` and does not imply `<form>`, group, label, or submission semantics; callers provide those when their composition needs them.
- **AR2 — Required state remains perceivable.** A form-wide optionality convention may remove redundant visible markers, but descendant controls preserve the resolved required state for assistive technology.
- **AR3 — Logical order is preserved.** Every direction retains DOM order and logical inline flow; FormLayout does not create a separate keyboard order.

## Design relationships

No current component-local or shared design record prescribes a FormLayout-specific representation. Spacing uses the current token scale; exact tuning remains token-owned.

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Layout container": {"target": "form-layout"},
  "Form title": {
    "none": {
      "reason": "intentional: A title is caller-owned content; FormLayout neither renders nor styles a title part."
    }
  },
  "Fields": {
    "none": {
      "reason": "intentional: Caller-owned Field and input components retain their own theming targets."
    }
  },
  "Footer": {
    "none": {
      "reason": "intentional: A footer is caller-owned content; FormLayout neither renders nor styles an action region."
    }
  }
}
```

The root target reflects the closed `direction` axis. It owns the outer arrangement container and does not claim the visual parts rendered by child components.

## Family and system relationships

- `family:input-fields` identifies FormLayout as the owner of outer arrangement, spacing, direction, and form-level optionality.
- `component:Field` consumes horizontal-label direction and optionality while retaining label, control, description, and status ownership.
- `architecture:public-component-api` owns root prop, styling, event, ref, and released-type composition.
- `architecture:component-theming-surface` owns the root target's anatomy mapping and reflected direction axis.
- `architecture:component-test-sufficiency` owns bounded, mutation-sensitive evidence selection.

## Verification map

| Contract          | Verification                                                                                           | Representative states                                            | Mutation or failure expectation                                                                               | Audit section                    |
| ----------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| FR1–FR4, ORD1     | `FormLayout.test.tsx`, exact-head `AuditMatrix` story-play guards, and independent rendered inspection | vertical, horizontal, horizontal-label wide/narrow, nested       | Changed display, order, breakpoint, or provider shadowing fails; narrow grouping remains visible for OQ1.     | `audit:FormLayout/behavior`      |
| FR5, ORD3, AR2    | `FormLayout.test.tsx`, Field tests, and scoped browser accessibility audit                             | required/optional/unset defaults; explicit exceptions            | A redundant marker returns, resolved `aria-required` disappears, or native validation changes.                | `audit:FormLayout/accessibility` |
| FR6, ORD2         | root composition tests, BaseProps lint, theming-target tests, and exact-head AuditMatrix play          | ref, DOM/data/ARIA/events, class/style/`xstyle`, every direction | A caller input drops, direction reflection is replaced, or the public target disappears.                      | `audit:FormLayout/api`           |
| AR1, AR3          | DOM tests and exact-head browser/a11y evidence                                                         | plain root, native form wrapper, LTR/RTL                         | Layout invents semantics, changes DOM/keyboard order, or uses physical inline placement.                      | `audit:FormLayout/accessibility` |
| Theming anatomy   | knowledge validation, consumer-doc projection, and theming-target tests                                | root target; caller-owned title, fields, and footer              | The target loses its semantic owner or FormLayout claims a child component's painter.                         | `audit:FormLayout/theming`       |
| Documentation     | docs typecheck and prop literal/reference tests                                                        | all directions, breakpoint, optionality, root anatomy            | Docs claim wrapping, physical order, flex growth, or another behavior the released code lacks.                | `audit:FormLayout/docs`          |
| RTL applicability | verified-N/A registry plus exact-head AuditMatrix logical-order assertion                              | horizontal and horizontal-labels in LTR/RTL                      | A physical side, directional glyph, transform, scroll/drag, overlay, or directional key path makes N/A stale. | `audit:FormLayout/i18n-rtl`      |

## Decision log

No component-local decision is asserted. This draft records released behavior and its current shared owners.

## Open questions

- **OQ1 — At 480px and below, should each horizontal-label pair preserve a smaller intra-field label/control gap than the gap between adjacent fields?** (`human-design`)

## Content boundary

This draft records verified shipped behavior and the unresolved narrow grouping relationship. It does not create form semantics, prescribe caller content, approve a new API or target, or duplicate consumer prop tables and audit-run scores.
