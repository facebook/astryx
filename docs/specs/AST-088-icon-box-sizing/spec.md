---
schema_version: 4
template_version: 2
kind: system-spec
id: spec:AST-088
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
phase: proposed
owners: [cixzhang, imdreamrunner]
affects_architecture: [architecture:component-theming-surface]
affects_families: [family:buttons]
affects_contributing: []
affects_consumer_docs: [Icon, Button]
---

# Component icon boxes follow the theme icon size system spec

<!-- Describe the system, not the project: present tense, what it does. No proposals, history, pull requests, or research in the record; see docs/contributing/spec-writing.md and report its rubric results in the pull request. -->

## Intent

When a theme changes an icon size's dimension, the boxes Astryx components
reserve for icons change with it, so a glyph and its box always match:

- A component that reserves a box for an icon at a semantic size sizes that box
  with the active theme's dimension for that size.
- Astryx components render the default glyphs they supply through `Icon`, so
  theme dimensions, color, and variant reach them.

## Non-goals

- How a theme sets an icon size's dimension, which the Icon stylesheet target
  owns.
- Control height, touch targets, and family geometry, which stay with each
  component and family.
- New Icon size names.
- Icon components that a caller passes in; they keep their caller's styling.
- Equivalent internal implementations remain valid when they satisfy this
  contract.

## Requirements

- **FR1 — Component icon boxes use the theme dimension.** A component that
  reserves a box for an icon at a semantic size, such as the Button family's icon
  slot, sizes the box with the active theme's dimension for that size, so the
  glyph and its box match. This includes a size a theme slot request selects.
  Control height and touch targets remain set by the component (`family:buttons`
  FR7).
- **FR2 — Family outer dimensions stay fixed.** Where a family contract fixes
  outer dimensions across states, a state-dependent icon size changes only the
  glyph and its box.
- **FR3 — Astryx default glyphs render through `Icon`.** A Core or first-party
  component that supplies a default registry glyph, including one passed into
  another component's icon prop, renders it through `Icon`, so theme dimensions,
  color, and variant apply to it.

### Platform support

- Supported floor: every React, server-rendering, and browser target supported by
  Astryx Core.
- Browser evidence: theme switching, nested themes, component states, and each
  Icon size keep glyph and icon-box dimensions equal, and control height and
  touch targets unchanged.

## Current-state impact

A theme without icon size styles renders the same boxes. When this ships:

- `family:buttons` — FR7's owned icon slot sizes its box with the theme
  dimension (FR1, FR2).
- `architecture:component-theming-surface` — component-owned icon boxes follow
  the Icon target's size dimension (FR1).
- Consumer `Icon` and `Button` docs describe how icon boxes follow theme sizes.

## Verification

| Contract | Verification                                  | Representative states                                                             | Mutation or failure expectation                                    |
| -------- | --------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| FR1–FR2  | Theme styling and real-browser geometry tests | each size with and without theme styles; Button family icon slot; pressed state   | glyph and box dimensions differ, or a state changes the outer size |
| FR3      | Default-glyph render tests                    | default glyphs supplied by Core components, including ones passed into icon props | a default glyph renders outside `Icon` or ignores the theme size   |

## Decision log

### DEC-1 — Owned icon boxes follow the theme dimension

**Reference:** `spec:AST-088/DEC-1`
**Decider:** pending

A glyph and the box reserved for it use one dimension per size, so theming a
size never leaves a glyph overflowing or floating in its box.

Rejected: a separate box size setting beside the Icon target, because two places
would set the same dimension.

## Open questions

- **OQ1 — Should owned icon boxes follow the theme's icon dimensions at all,
  rather than keep component-set boxes?** (`human-design`)
- **OQ2 — Which relationships between icon sizes does a theme keep, and how does
  a theme author see which component sizes map to each icon size?**
  (`human-design`)
