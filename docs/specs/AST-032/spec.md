---
schema_version: 1
template_version: 1
kind: system-spec
id: spec:AST-032
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
phase: proposed
owners: [cixzhang, imdreamrunner]
affects_architecture: [architecture:icon-resolution-and-component-slots]
affects_families: []
affects_contributing: []
affects_consumer_docs: [Icon, FileInput, ChatSendButton]
---

# Shared upload and send icon semantics system spec

## Intent

Give each built-in icon name one stable semantic responsibility. Upload and send
are reusable actions, while `arrowUp` is a direction. They may share artwork by
default, but a theme must be able to customize one meaning without changing the
others.

## Non-goals

- Prescribing a particular upload, send, or directional drawing.
- Adding component-owned icon slots or changing their resolution contract.
- Changing `arrowDown`, `arrowsUpDown`, or sortable Table behavior.
- Changing FileInput or ChatSendButton interaction, layout, or accessibility.
- Adding synonyms for every component-specific icon role.

## Requirements

- **FR1 — `arrowUp` remains directional.** The built-in `arrowUp` name MUST
  represent upward direction, including ascending sort. It MUST NOT be the
  canonical name for upload or send actions.
- **FR2 — Shared action names are distinct.** `IconName` MUST include `upload`
  and `send` as separate shared semantic names. Themes MUST be able to map each
  name independently through the existing icon registry.
- **FR3 — Defaults preserve every shipped theme.** The core default registry and
  every shipped theme registry MUST initially define `upload` and `send` with
  that registry's current `arrowUp` artwork. Adopting the new names MUST preserve
  both the unthemed default and each shipped theme's current rendering.
- **FR4 — Existing action callsites adopt their meaning.** FileInput's upload
  affordance MUST resolve `upload`, ChatSendButton's default send state MUST
  resolve `send`, and sortable Table MUST continue to resolve `arrowUp` for
  ascending direction.
- **IR1 — Registry surfaces stay synchronized.** The `IconName` union, complete
  core default registry, every shipped theme registry, Icon consumer
  documentation in every maintained language, icon reference documentation, and
  focused registry/callsite tests MUST change together.

### Platform support

- Supported feature/engine floor: unchanged from the current Icon registry.
- Unsupported behavior: unchanged; namespaced extension keys continue to use
  their existing resolution path.
- Browser evidence: not required because the default SVG and rendered geometry
  do not change; registry and rendered-callsite tests provide the evidence.

## Current-state impact

Current `main` uses `arrowUp` for three meanings:

| Owner                                  | Current meaning     | Required result  |
| -------------------------------------- | ------------------- | ---------------- |
| FileInput upload affordance            | upload action       | resolve `upload` |
| ChatSendButton send state              | send action         | resolve `send`   |
| sortable Table indicator and menu item | ascending direction | keep `arrowUp`   |

This change affects the shared icon vocabulary owned by
`architecture:icon-resolution-and-component-slots`. It does not replace that
architecture's component-owned slot layer. A later component slot may map a
specific role to one of these shared names without changing their meaning.

The icon resolver performs an exact lookup by semantic name. It does not fall back
from a missing `upload` or `send` entry to a theme's `arrowUp` entry. The
implementation therefore updates every shipped theme registry together with the
core default; otherwise a themed callsite would silently fall back to core
artwork and lose that theme's current arrow treatment.

The semantic before → after is: one key currently means upload, send, and upward
direction; three keys will each own one meaning while preserving the same default
artwork.

## Verification

| Contract | Verification                                                | Representative states                    | Mutation or failure expectation                                                            |
| -------- | ----------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------ |
| FR1, FR4 | FileInput, ChatSendButton, and sortable Table source/tests  | upload, send, ascending                  | Reusing `arrowUp` for either action or changing sort's directional key fails.              |
| FR2      | Icon registry type and complete-registry tests              | default, global override, theme override | Omitting either key or coupling their overrides fails type or resolution assertions.       |
| FR3      | Core and shipped-theme registry preservation tests          | Unthemed plus every shipped theme        | A new action name resolves different artwork than that registry's current `arrowUp` entry. |
| IR1      | `pnpm check:repo`, Icon docs tests, focused component tests | English, Chinese, dense/reference docs   | A stale union, registry, consumer list, or callsite fails repository checks.               |

## Decision log

### DEC-1 — Shared actions receive names separate from direction

**Reference:** `spec:AST-032/DEC-1`
**Decider:** pending owner approval

`upload`, `send`, and upward direction are independently themeable meanings.
They receive separate shared names even while the default registry draws all
three with the same upward arrow. This preserves the current appearance and lets
future themes choose action-specific artwork without changing sort indicators or
another action.

Rejected: keeping all three meanings under `arrowUp`, because a theme override
then has unrelated observable effects. Also rejected: component-owned slots as
the only answer, because slots choose among shared meanings and do not themselves
provide reusable upload or send semantics.

## Open questions

None.
