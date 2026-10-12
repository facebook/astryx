---
schema_version: 4
template_version: 2
kind: system-spec
id: spec:AST-077
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
phase: proposed
owners: [cixzhang]
affects_architecture: [architecture:layer-runtime, architecture:theme-tokens]
affects_families: []
affects_contributing: []
affects_consumer_docs:
  [useLayer, Popover, DropdownMenu, Tooltip, HoverCard, theme]
---

# Layer anchor clearance system spec

<!-- Describe the system, not the project: present tense, what it does. No proposals, history, pull requests, or research in the record; see docs/contributing/spec-writing.md and report its rubric results in the pull request. -->

## Intent

An anchored layer, such as a menu, a popover, a tooltip, or a selector's panel,
floats a small gap away from the control that opened it. The size of that gap
belongs to a product's design language: one product floats its layers 4px from
their triggers and another 8px. Every Astryx layer that keeps a gap from its
anchor keeps the same anchor clearance, and a theme sets it once, so all of a
product's layers float the same distance from their triggers, including the
layers the product draws itself.

## Non-goals

- The viewport gutter, the size caps, the fallback order, and the app-declared
  inset, which `spec:AST-059` owns.
- Layers that sit flush with their anchor: ContextMenu at the pointer,
  TopNavMegaMenu, TabMenu, DateInput, DateRangeInput, DateTimeInput, Selector's
  panel when it overlays its selected item, and layers placed at fixed
  coordinates. Whether any of them gains the clearance is outside this record.
- Keyboard hints, which keep their own 8px gap below the control they label.
- A clearance chosen per component or per instance.
- The `offset` option of `useLayer`, which keeps its meaning and its flush
  default for direct callers.
- Equivalent internal implementations remain valid when they satisfy this
  contract.

## Requirements

- **FR1 — One clearance.** Every component that keeps a gap between an
  anchor-mode layer and its anchor MUST keep the same anchor clearance. No
  component defines its own value.
- **FR2 — The theme sets it.** The anchor clearance MUST be a theme token with a
  semantic name and a default of the 4px spacing step. A theme that sets it
  moves every such layer in the theme's scope, wherever the layer is hosted; a
  theme that does not set it leaves every layer at the default.
- **FR3 — Placement keeps it.** The clearance MUST stay on the anchor-facing edge
  after a flip and after a slide, and a position option that cannot fit with the
  clearance is not taken, as the Positioning section of
  `architecture:layer-runtime` describes for the clearance a layer carries: the
  margin box is what must fit a position option, a flip swaps the margins with
  the area, and a slide carries the clearance-and-gutter pair of the side it
  lands on.

### Platform support

- Supported feature/engine floor: unchanged. The clearance rides the placement
  margins that anchor mode applies.
- Unsupported behavior: unchanged. Where CSS Anchor Positioning is absent there
  is no anchored placement to clear (`spec:AST-003` FR21–FR23).
- Browser evidence: the rendered gap between trigger and layer in real Chromium
  and WebKit, at the default and at a themed value, before and after a flip.

## Current-state impact

- `architecture:layer-runtime`: Positioning states that components keep one
  theme-set anchor clearance; Owning code names where its token is consumed.
- `architecture:theme-tokens`: the token vocabulary gains the clearance token,
  projected into the CLI theme template and the generated token documentation.
- The components that keep a 4px gap from their anchor read the token instead.
  Popover, DropdownMenu and its sub-menus, Selector outside its overlay mode,
  MultiSelector, ComplexSelector, BaseTypeahead, PowerSearch, Tooltip,
  HoverCard, TopNavMenu, the chat trigger menu, and the lab Schedule's month and
  time-grid views pass it as the layer's clearance. The flyouts of SideNavItem
  and of a collapsed SideNavHeading, and BreadcrumbItem's menu, set it as
  margins on their own layers. Their geometry at the default is unchanged.

## Verification

| Contract | Verification                                                                                                                                | Representative states                                                                                                                                                      | Mutation or failure expectation                                                                                  |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| FR1      | Source review of every anchor-mode layer call site and of layer margins set by components; component unit tests of the anchor-facing margin | Each component in Current-state impact, including the SideNav flyouts, BreadcrumbItem's menu and the lab Schedule views, every placement                                   | A component passing or setting a length or spacing step of its own as its clearance                              |
| FR2      | Theme compilation test; real-browser geometry in Chromium and WebKit                                                                        | Default theme; a theme setting the token to 8px; Popover, DropdownMenu, ComplexSelector, Tooltip, HoverCard; a layer portaled out of its JSX position under a nested theme | A gap other than 4px under the default, or a gap that ignores the themed value, including for the portaled layer |
| FR3      | Real-browser geometry after a block flip and after a slide, LTR and RTL                                                                     | A trigger near the bottom edge; a layer wider than the room beside its trigger                                                                                             | The clearance moving to the far edge, vanishing after a flip, or a layer that fits only without it               |

## Decision log

### DEC-1 — The anchor clearance is one theme value

**Reference:** `spec:AST-077/DEC-1`
**Decider:** pending owner review

The gap between a layer and its trigger is design language, and every app that
shares a theme wants the same gap, unlike a floating bar, which differs between
two apps on one theme (`spec:AST-059/DEC-4`). One token keeps every layer
component on the same gap and lets a theme move all of them together.

Rejected: a per-component `offset` prop, which restates an implementation value at every call site (`spec:AST-002/FR3`); a `layer` theme target (`spec:AST-059/DEC-4`); and a `LayerProvider` setting, which would make a design value app state.

## Open questions

- **OQ1 — The token's name and family** (`human-api`): a member of a new layer
  family, or a semantic member of an existing family, as `--focus-outline-offset`
  is of the focus family.
