---
schema_version: 1
template_version: 1
kind: design
id: design:user-states
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [ernestt, cixzhang]
review_triggers: [visual, interaction, accessibility]
verified_by: []
architecture: [architecture:interaction-modality, architecture:theme-tokens]
components: []
families: []
deciding_specs: []
---

# User states design specification

## User intent

A person should recognize whether an element is available, hovered, pressed,
focused, or selected without learning a new visual language for every component.
Each family should reuse the smallest suitable set of state representations.

## Design principles

- **DR1 — Minimize representations per intention.** A component MUST reuse an
  established treatment before introducing another visual for the same state.
- **DR2 — Design the complete user-driven interaction cycle.** Every interactive
  component MUST account for rest, hover where available, focus, press or
  activation, and its selected state where relevant. Disabled, loading, and
  status representations belong to `design:system-states`.
- **DR3 — Family consistency comes first.** A component MUST choose the treatment
  that fits its interaction archetype and remain consistent with sibling
  components before pursuing superficial system-wide sameness.
- **DR4 — Selection is one intention with archetype-specific treatments.** A
  selected item MUST remain perceivable, while its visual treatment MAY differ
  for toggles, segments, navigation, cards, and rows.

## Anatomy and hierarchy

| Role                        | Purpose                                             | Required relationship                                                  |
| --------------------------- | --------------------------------------------------- | ---------------------------------------------------------------------- |
| base surface                | Establishes the component's resting role            | Remains identifiable under every transient state treatment             |
| interaction overlay or ring | Signals pointer response                            | Adds feedback without replacing content or semantic meaning            |
| focus indicator             | Shows the current keyboard focus owner              | Has one clear owner and remains distinct from hover and selection      |
| selection indicator         | Shows persistent current or chosen state            | Fits the component archetype and remains stable after interaction ends |
| content                     | Carries the component's label, value, or affordance | Remains legible through transient and persistent states                |

## State representation

| State                      | Required representation                                                               | Allowed variation                                                            |
| -------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| rest                       | Uses base role tokens without transient interaction decoration                        | Theme controls visual character                                              |
| hovered, surface archetype | A quiet overlay changes the surface while preserving its base                         | Overlay strength may vary by theme                                           |
| hovered, field archetype   | Border or inset treatment makes the field boundary more apparent                      | Field families may tune the ring treatment                                   |
| pressed                    | Immediate tactile compression or stronger surface feedback confirms activation        | Components that cannot transform may use another established family response |
| focused, action archetype  | A clearly separated external indicator identifies the focus owner                     | Shape follows the focused element                                            |
| focused, field archetype   | An emphasized border and inset treatment identify the owning field                    | Composed fields may paint on an owning wrapper or visual proxy               |
| selected, filled           | A compact binary control fills to communicate on or chosen                            | Used for checks, radios, and switches where the control itself carries state |
| selected, surface          | The active segment separates from its containing track                                | Used for segmented choices                                                   |
| selected, edge             | An edge or underline marks the current destination or step                            | Used for tabs, entries, and ordered progress                                 |
| selected, border           | A selected container receives a clear boundary treatment                              | Used for selectable cards and similar surfaces                               |
| selected, depressed        | A persistent quiet fill marks the current row or toggle action                        | Used for navigation rows, list rows, and toggle buttons                      |
| reordering                 | Uses the drag and insertion treatment owned by `design:ordered-collection-reordering` | Applies only to ordered collections with a dedicated handle                  |

## Responsive and input behavior

- **DR5 — Hover remains conditional.** Hover treatment MUST appear only where the
  input can intentionally hover and MUST NOT be required to discover or activate
  the control.
- **DR6 — Focus follows the semantic owner.** Responsive composition MAY move or
  visually proxy a control, but it MUST preserve one perceivable focus indicator
  for the semantic focus owner.
- **DR7 — Persistent state survives reflow.** Selection MUST remain perceivable
  when labels wrap, navigation collapses, or a control changes orientation.

## Accessibility intent

Keyboard users should always be able to identify the current focus owner.
Pointer, touch, and pen users should receive feedback without sticky or
misleading hover. Selection must not be communicated by a subtle color change
alone when shape, edge, fill, or text can provide a durable cue.

Interaction modality mechanics, selectors, ARIA mapping, and component event
behavior are owned by architecture and component contracts.

## Representative examples

- A secondary action moves from rest to hover, press, and keyboard focus without
  changing the meaning or position of its label.
- A field uses its family ring treatment rather than borrowing an action outline.
- Tabs use an edge indicator while a checkbox uses a filled indicator; both
  clearly communicate the same selected intention through their archetypes.

## Visual references

No normative assets are included in this seed draft. Approved examples should be
copied into `docs/design/assets/user-states/` with state, theme,
viewport, demonstrated decision, and alt-text metadata before promotion.

## Component contract links

No component contract links are asserted in this seed draft. Candidate component
and family adoptions should cite individual `DR` requirements after review.

## Decision log

No repository design decision has approved this record yet. It distills the
human-facing state vocabulary from the public Design Conventions wiki while
leaving implementation and component semantics with their current owners.

## Open questions

- **OQ1 — Representative set.** Which components are the canonical examples for
  each hover, focus, and selection archetype?
- **OQ2 — Cross-family exceptions.** Which shipped components intentionally use
  a different state treatment, and should the family or this design record own
  each exception?

## Content boundary

This file defines visual intent for user-driven states. It does not define prop
names, selectors, ARIA attributes, focus-management mechanics, token names,
component behavior, audit results, or consumer guidance.
