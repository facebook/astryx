---
schema_version: 3
template_version: 7
kind: component
id: component:EmptyState
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [public-api, behavior, layout, theming, accessibility, testing]
verified_by:
  [
    packages/core/src/EmptyState/EmptyState.test.tsx,
    packages/core/src/theme/themingTargets.test.ts,
    packages/core/src/docPropReferences.test.ts,
  ]
modules: []
families: []
design_specs: []
architecture:
  [
    architecture:public-component-api,
    architecture:component-theming-surface,
    architecture:component-test-sufficiency,
  ]
contributing: []
system_specs: [spec:AST-020/FR1, spec:AST-029/FR3]
---

# EmptyState component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                       |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `EmptyState` renders a required title plus optional description, decorative icon, and caller-owned actions in one status region; callers choose heading level and compact layout.              |
| Behavior                | Non-rendering optional values create no slot wrapper or spacing. Rendered content follows icon, text, then actions order; compact layout reduces spacing and stacks actions.                   |
| End-user impact         | A person reaches a named empty-content message and any next action without blank slot spacing; the title fits the surrounding document outline.                                                |
| Builder impact          | Callers supply content and actions, select heading semantics, and may compose supported root props and styling. No additional setup is required.                                               |
| Compatibility/readiness | The released default is preserved. This draft observes current shipped behavior and current remediation; it adds no API, default, or compatibility promise.                                    |
| Review checks           | Reject a missing heading, an informative icon hidden as decorative, a non-rendering optional slot that still changes layout, a dropped root prop/ref/style, or a theme target without anatomy. |
| Governing rules         | `architecture:public-component-api` INV1 and INV5–INV9; `architecture:component-theming-surface` INV2–INV6; `architecture:component-test-sufficiency` INV1–INV7, INV10–INV11; WCAG 2.2.        |

This table is a review projection; the body below is authoritative.

## Intent

`EmptyState` gives an otherwise empty content area a semantic heading, supporting
context, optional decorative visual, and optional caller-owned next actions.

## Compatibility and migration

- Released default preserved: yes
- Compatibility class: observational and additive documentation; runtime remediation removes wrappers that paint no content
- Controlled/uncontrolled behavior: not applicable
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- the status-region root, content order, heading element, and default/compact layout;
- hiding the icon slot from assistive technology as decorative; and
- whether optional slots create component-owned wrappers and spacing.

**Does not own / non-goals**

- the message copy, icon meaning, action controls, or action behavior — those belong to the product callsite and the components it supplies;
- page-level heading order — the caller chooses `headingLevel` for its document; or
- error, loading, or populated-content behavior.

## Public concepts

| Concept        | Closed values or states   | Meaning                                                                   | Availability by variant/orientation/state | Default  | Owner                  | Stability | Invalid-value behavior             |
| -------------- | ------------------------- | ------------------------------------------------------------------------- | ----------------------------------------- | -------- | ---------------------- | --------- | ---------------------------------- |
| title          | non-empty string          | The empty region's heading content.                                       | all                                       | required | `component:EmptyState` | stable    | type rejection                     |
| description    | string or absent          | Optional supporting context below the title.                              | all                                       | absent   | `component:EmptyState` | stable    | type rejection                     |
| icon           | renderable node or absent | Optional caller visual, exposed as decorative beside the textual message. | all                                       | absent   | product callsite       | stable    | non-rendering values omit the slot |
| actions        | renderable node or absent | Optional caller-owned next actions below the message.                     | all                                       | absent   | product callsite       | stable    | non-rendering values omit the slot |
| heading level  | `1` through `6`           | The title's HTML heading level in the surrounding document outline.       | all                                       | `3`      | product callsite       | stable    | type rejection                     |
| layout variant | default, compact          | Compact reduces spacing and stacks the action slot vertically.            | all                                       | default  | `component:EmptyState` | stable    | type rejection                     |

## Behavioral and layout contract

Draft requirements identify their basis so observed code is not mistaken for an
intentional decision. A `current` contract contains no unresolved rows.

| ID  | Candidate invariant                                                                                                               | Basis                                                                                                 | Draft review state |
| --- | --------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------ |
| FR1 | The component MUST render one status-region root containing the icon, text group, and actions in that reading order when present. | Current implementation and consumer docs; WCAG 2.2 SC 1.3.2 and SC 4.1.3                              | verify             |
| FR2 | The required title MUST render at the caller-selected heading level without changing the component's visual type role.            | Current implementation, tests, and consumer docs; WCAG 2.2 SC 1.3.1 and SC 2.4.6                      | verify             |
| FR3 | A non-rendering optional value MUST NOT create a wrapper, layout gap, or assistive-technology node.                               | React render semantics; established public optional-slot interface; `component-test-sufficiency` INV4 | verify             |
| FR4 | The decorative icon wrapper MUST be absent when the slot is absent and hidden from assistive technology when rendered.            | Current implementation and tests; WCAG 2.2 SC 1.1.1                                                   | verify             |
| FR5 | Root DOM/data/ARIA/event props, ref, `className`, `style`, and `xstyle` MUST reach and compose on the status-region root.         | `architecture:public-component-api` INV5–INV8                                                         | verify             |
| FR6 | Compact layout MUST reduce component spacing and stack the actions slot while preserving content order and root semantics.        | Current implementation, tests, and consumer docs                                                      | verify             |

### Allowed variation

- **AV1 — Caller content.** Message wording, decorative artwork, and action
  composition may vary at the product callsite.
- **AV2 — Theme paint.** Theme-controlled paint and typography may vary through
  the documented targets while anatomy and content order remain stable.

### Representative states

| State                       | Required invariant                                      | Allowed variation                      |
| --------------------------- | ------------------------------------------------------- | -------------------------------------- |
| title only                  | status root and selected heading level remain present   | message wording                        |
| description                 | supporting text follows the title                       | text length and wrapping               |
| decorative icon             | visual precedes text and is hidden from assistive tech  | artwork supplied by the caller         |
| actions                     | caller controls follow the text group                   | one or more caller-owned controls      |
| compact                     | reduced spacing and vertical actions preserve semantics | theme paint and caller content         |
| non-rendering optional slot | no component wrapper or spacing is emitted              | which optional slot receives the value |

### Transformation and precedence order

- **ORD1 — Root composition.** Component semantics and theme metadata combine
  with component styles, then consumer `xstyle`, `className`, and `style` under
  the shared merge contract; component-owned `role="status"` remains authoritative.

### Performance and resources

- **PR1 — Render-only surface.** EmptyState owns no retained state, listener,
  observer, timer, or external resource.

## Accessibility contract

- **AR1 — Heading semantics.** The title is a heading at the caller-selected level.
- **AR2 — Decorative visual.** The icon slot is hidden from assistive technology;
  callers keep all necessary meaning in the title or description.
- **AR3 — Status exposure.** The root exposes the empty message as a status region
  without moving focus; action controls keep their own names, roles, and behavior.

## Design relationships

No current design record governs EmptyState-specific representation. Visual
judgment remains evidence, not product authority.

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Container": {"target": "empty-state"},
  "Icon": {
    "none": {
      "reason": "intentional: caller-supplied decorative content keeps its own styling and has no component-owned paint target"
    }
  },
  "Title": {"target": "empty-state-title"},
  "Description": {"target": "empty-state-description"},
  "Actions": {
    "none": {
      "reason": "intentional: caller-supplied controls keep their own component targets and behavior"
    }
  }
}
```

## Family and system relationships

No current family record owns EmptyState-specific behavior.

## Verification map

| Contract       | Verification                                                 | Representative states                     | Mutation or failure expectation                                      | Audit section             |
| -------------- | ------------------------------------------------------------ | ----------------------------------------- | -------------------------------------------------------------------- | ------------------------- |
| FR1–FR4, AR1–3 | `EmptyState.test.tsx` plus exact-head accessibility evidence | title only, all slots, absent/empty slots | order, heading, status, or decorative treatment regresses            | `audit:EmptyState/a11y`   |
| FR5, ORD1      | focused root/ref/theming tests and shared API guards         | DOM/data props, ref, root target, compact | accepted input is dropped or component semantics/styles are replaced | `audit:EmptyState/api`    |
| FR6            | focused DOM tests plus exact-head rendered evidence          | default and compact, wide and narrow      | compact spacing or action direction no longer applies                | `audit:EmptyState/layout` |
| PR1            | source review                                                | every render path                         | a retained resource appears without a named owner                    | `audit:EmptyState/code`   |

## Decision log

No component-local decision is approved in this draft.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit
results, implementation steps, or family/system rules. It links to their owners.
