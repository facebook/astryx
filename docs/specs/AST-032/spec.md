---
schema_version: 4
template_version: 1
kind: system-spec
id: spec:AST-032
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-09-22
phase: accepted
owners: [cixzhang, imdreamrunner]
affects_architecture: [architecture:icon-resolution-and-component-slots]
affects_families: []
affects_contributing: []
affects_consumer_docs: [FileInput, ChatSendButton]
---

# Component-owned upload and send icon slots

## Intent

Let themes choose the artwork used by FileInput's upload affordance and
ChatSendButton's send action independently, without widening the shared icon
vocabulary or changing either component's default appearance.

## Non-goals

- Adding `upload` or `send` to the shared `IconName` registry.
- Changing the meaning or artwork of the shared `arrowUp` icon.
- Changing FileInput or ChatSendButton interaction, layout, sizing, or
  accessibility.
- Removing or changing ChatSendButton's existing `sendIcon` prop.
- Changing ChatSendButton's stop-state icon.
- Prescribing a particular upload, send, or directional drawing.

## Requirements

- **FR1 — Upload is a FileInput role.** `ComponentIconSlotMap` MUST include
  `file-input-upload`. FileInput's upload affordance MUST resolve that slot with
  `arrowUp` as its fallback.
- **FR2 — Send is a ChatSendButton role.** `ComponentIconSlotMap` MUST include
  `chat-send-button-send`. ChatSendButton's send state MUST resolve that slot
  with `arrowUp` as its fallback.
- **FR3 — Existing instance configuration keeps precedence.** An explicit
  `ChatSendButton.sendIcon` MUST continue to win over the active theme's
  component-slot mapping. FileInput gains no new instance prop in this change.
- **FR4 — Themes configure roles, not global meanings.** A theme MAY map each
  component slot independently through `componentIcons` to an existing shared
  `IconName`, to a namespaced icon key whose artwork the theme or a library
  supplies, or to `null` (DEC-2). This change MUST NOT add `upload`, `send`, or
  another component-specific synonym to `IconName`.
- **FR5 — Defaults preserve every shipped surface.** With no component-slot
  mapping, or with a namespaced mapping that resolves to no artwork, both
  components MUST render the same `arrowUp` artwork, size, placement, and
  accessible behavior they render today. Sortable Table and every other `arrowUp`
  consumer MUST remain unchanged.
- **IR1 — Owner surfaces stay synchronized.** The public component-slot map,
  FileInput and ChatSendButton source, their component documentation and current
  contracts, and focused resolver/component tests MUST change together in the
  implementation.

### Platform support

- Supported feature/engine floor: unchanged from the current component-icon
  resolver.
- Unsupported behavior: unchanged; themes that omit these slots use each
  component's fallback.
- Browser evidence: not required for the default because the rendered artwork
  and geometry do not change. Resolver and rendered-component tests cover slot
  precedence and fallback; existing visual gates protect the unchanged default.

## Current-state impact

Current `main` uses the shared `arrowUp` name directly for both component roles:

| Owner                       | Existing instance override | Proposed theme slot     | Fallback  |
| --------------------------- | -------------------------- | ----------------------- | --------- |
| FileInput upload affordance | none                       | `file-input-upload`     | `arrowUp` |
| ChatSendButton send state   | `sendIcon`                 | `chat-send-button-send` | `arrowUp` |

Each meaning currently belongs to one component and has no demonstrated
cross-component shared-name contract. The current icon architecture therefore
routes both through component-owned slots. If a reusable upload or send meaning
later meets the separate shared-icon admission bar, a future decision may add a
shared name and change a slot's fallback or recommended mapping through the
normal compatibility process.

The before-to-after behavior is: each component currently reads `arrowUp`
directly; each will instead resolve its own stable role, while an omitted theme
mapping still resolves to `arrowUp`.

## Verification

| Contract | Verification                                                       | Representative states                                                           | Mutation or failure expectation                                                                                                        |
| -------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| FR1–FR2  | component-slot type and resolver tests; rendered component tests   | default theme, mapped name, explicit `null`                                     | A missing or misspelled slot, direct `arrowUp` lookup, or ignored mapping fails.                                                       |
| FR3      | ChatSendButton precedence tests                                    | explicit `sendIcon`, theme mapping, fallback                                    | A theme overrides caller content or caller content stops replacing the default fails.                                                  |
| FR4      | Icon public-type tests and theme normalization tests               | two independent component mappings; a namespaced mapping with theme artwork     | Adding shared names, coupling the two role mappings, or rejecting a namespaced mapping fails the contract.                             |
| FR5      | existing FileInput, ChatSendButton, Table, and visual evidence     | unthemed and shipped themes; send/upload/sort; an unresolved namespaced mapping | Default artwork, geometry, accessible output, or unrelated `arrowUp` use changes, or an unresolved namespaced mapping renders nothing. |
| IR1      | `pnpm check:knowledge`, focused docs/source consistency assertions | component docs, current contracts, public types                                 | A stale owner surface or undocumented slot blocks the implementation.                                                                  |

## Decision log

### DEC-1 — Theme component roles before expanding shared icon names

**Reference:** `spec:AST-032/DEC-1`
**Decider:** `cixzhang`, `2026-09-22`

FileInput upload and ChatSendButton send are component-owned roles. They receive
`file-input-upload` and `chat-send-button-send` slots under the current component
icon architecture, with `arrowUp` as the compatibility fallback. The existing
ChatSendButton instance prop remains the highest-precedence choice.

Rejected for this change: adding global `upload` and `send` names. Each proposed
name currently serves one owning component, so the evidence does not establish a
reusable shared vocabulary entry. Also rejected: continuing to read `arrowUp`
directly, because that leaves themes unable to choose these component roles
independently.

### DEC-2 — A slot may name theme-supplied artwork

**Reference:** `spec:AST-032/DEC-2`
**Decider:** pending owner approval

A theme can have artwork for these roles that no shared name describes, such as
an upload tray rather than an arrow. With only shared names available, it can
show that artwork only by repainting one: repainting `arrowUp` re-couples every
consumer this spec separates, and repainting any other name changes that name's
own consumers. A theme MAY therefore map either slot to a namespaced key and
supply the key's artwork through `icons`. The key stays outside `IconName`, so
DEC-1 is unchanged, and each component still resolves its role only through its
slot. A namespaced mapping that resolves to no artwork behaves as an absent
mapping, so a typo or a missing registration cannot remove the affordance; only
`null` suppresses it.

Rejected: requiring a shared `upload` or `send` name before a theme can use its
own artwork, because DEC-1's evidence bar still applies. Also rejected: rendering
nothing for an unresolved namespaced key, because it silently removes an
affordance.

## Open questions

None.
