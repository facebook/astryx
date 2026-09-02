---
schema_version: 1
template_version: 1
kind: design
id: design:template-composition
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [ernestt, cixzhang]
review_triggers: [visual, layout, theming, responsive]
verified_by: []
architecture: [architecture:template-authoring]
components: []
families: [family:layout-primitives, family:layout-regions]
deciding_specs: []
---

# Template composition design specification

## User intent

Templates should communicate purpose through composition, not just valid components.

## Design principles

Sourced from public
[Design Conventions](https://github.com/facebook/astryx/wiki/Design-Conventions):

- **DR1 — Purpose.** Layout MUST make the primary task clear.
- **DR2 — Attention.** Visual hierarchy MUST guide attention.
- **DR3 — Relationships.** Spacing and alignment MUST express grouping.
- **DR4 — Affordance.** Components MUST visually match their roles.
- **DR5 — Themes.** Themes and color modes MUST preserve meaning and emphasis.

## Anatomy and hierarchy

No anatomy is universal. Each template owns its roles and membership; Design
reviews whether they form a coherent composition.

## State representation

No state matrix is universal; each template owns and preserves its required states.

## Responsive and input behavior

No responsive/input matrix is universal; each template owns its supported modes
and preserves reading order and task hierarchy.

## Accessibility intent

Visual hierarchy should agree with semantic reading, focus order, and relationships.

## Representative examples

- [#5797](https://github.com/facebook/astryx/pull/5797) keeps active and completed
  steps visible.
- [#5798](https://github.com/facebook/astryx/pull/5798) uses a constrained dialog
  for a short flow.

They are independent templates, not members of a shared wizard family.

## Visual references

The current
[Template Grading Rubric](https://github.com/facebook/astryx/wiki/Contributing-Templates#template-grading-rubric)
governs evaluation. Exact-commit scores and artifacts are evidence, not Design or
implementation approval.

## Component contract links

Templates must follow the public contracts of the components they compose.

## Decision log

### Proposed owner-review direction — 2026-09-02

Proposed by `cixzhang`: Design owns human intent; the separate
[authoring architecture](../architecture/template-authoring.md) owns implementation.
Behavior stays local absent an approved shared contract; #5797/#5798 create no
wizard family. This draft does not record approval.

## Open questions

None.

## Content boundary

Owns shared intent, not implementation, local behavior, rubric, or approval.
