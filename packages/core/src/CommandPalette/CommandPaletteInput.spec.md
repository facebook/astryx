---
schema_version: 3
template_version: 7
kind: component
id: component:CommandPaletteInput
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [public-api, behavior, layout, theming, accessibility]
verified_by:
  [
    packages/core/src/CommandPalette/CommandPaletteInput.test.tsx,
    apps/storybook/stories/CommandPaletteInput.stories.tsx,
    apps/storybook/rtl-audit/targets.json,
    packages/core/src/theme/themingTargets.test.ts,
    scripts/check-knowledge.mjs,
  ]
modules: []
families: []
design_specs: []
architecture:
  [
    architecture:component-test-sufficiency,
    architecture:component-theming-surface,
    architecture:interaction-modality,
    architecture:public-component-api,
  ]
contributing: []
system_specs: [spec:AST-020]
---

# CommandPaletteInput component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Public contract         | A query field with context-backed search state, optional trailing content, and a split wrapper/field attribute boundary.                   |
| Behavior                | Standalone use is a searchbox; CommandPalette context supplies combobox state, popup relationships, search state, and keyboard delegation. |
| End-user impact         | Screen-reader users receive role and popup state that match whether a controlled result popup exists.                                      |
| Builder impact          | Existing props remain available; component-owned popup semantics cannot be replaced through native passthrough props.                      |
| Compatibility/readiness | Accessibility correction is additive for supported use; primary callback naming remains unresolved.                                        |
| Review checks           | Reject unassociated standalone combobox state, clobberable owned popup semantics, empty trailing chrome, or changed input ref routing.     |
| Governing rules         | `architecture:public-component-api/INV2,INV5`; `spec:AST-020/FR1,FR2`; WCAG 2.2 4.1.2.                                                     |

This table is a review projection; the body below is authoritative.

## Intent

CommandPaletteInput presents the text query for a command palette. It can bind
to CommandPalette search and navigation context or act as an independent search
field when no result-popup context is present.

## Compatibility and migration

- Released default preserved: `yes`, except that standalone accessibility
  semantics describe the actual no-popup state instead of an expanded combobox
- Compatibility class: corrective semantic output; existing props, visual
  output, value flow, native change notification, and ref routing remain
- Controlled/uncontrolled behavior: unchanged
- Migration decision: the primary callback naming question remains OQ1

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The search glyph, native query field, pending indicator placement, and trailing
  content group.
- The query field's role and popup state when CommandPalette context is present.
- Context fallback for the search value, value updates, and keyboard navigation.

**Does not own / non-goals**

- The result popup, option collection, selection, or search orchestration — owned
  by `component:CommandPalette` and its list/item parts.
- Spinner and search-glyph rendering — delegated to Spinner and Icon.
- Caller-provided trailing content behavior — owned by the product callsite.

## Public concepts

| Concept         | Closed values or states                    | Meaning                                          | Availability by variant/orientation/state | Default              | Owner                           | Stability | Invalid-value behavior              |
| --------------- | ------------------------------------------ | ------------------------------------------------ | ----------------------------------------- | -------------------- | ------------------------------- | --------- | ----------------------------------- |
| Query binding   | explicit; CommandPalette context; native   | Source and destination of query text changes.    | All uses                                  | context, then native | `component:CommandPaletteInput` | Released  | Missing handlers leave native state |
| Popup semantics | standalone searchbox; contextual combobox  | Whether the query field controls a result popup. | Context-dependent                         | standalone searchbox | `component:CommandPaletteInput` | Released  | Consumer overrides are ignored      |
| Trailing group  | busy indicator; `endContent`; both; absent | Supporting status or caller content after query. | All uses                                  | absent               | `component:CommandPaletteInput` | Released  | Empty React nodes render no group   |

## Behavioral and layout contract

Draft requirements identify their basis so observed code is not mistaken for an
intentional decision.

| ID  | Candidate invariant                                                                                                                                                  | Basis                                                              | Draft review state                                         |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------- |
| FR1 | Explicit `value` and `onValueChange` take precedence; otherwise CommandPalette context supplies search state; native uncontrolled state remains when neither exists. | Released source, docs, and tests                                   | Verified current behavior                                  |
| FR2 | Consumer `onKeyDown` runs before contextual navigation; preventing the event prevents contextual delegation.                                                         | Released source and tests                                          | Verified current behavior                                  |
| FR3 | `ref` and native passthrough attributes reach the native query field; `xstyle`, `className`, and `style` customize the surrounding input region.                     | Released source and docs; `architecture:public-component-api/INV5` | Verified current routing                                   |
| FR4 | Pending state and renderable `endContent` share one trailing group; booleans, empty strings, null, and undefined do not create empty trailing chrome.                | React rendering semantics and current utility contract             | Verified corrective behavior                               |
| FR5 | Auto-focus is enabled by default and suppressed inside an inline Dialog; `hasAutoFocus={false}` suppresses both focus work and the autofocus marker.                 | Released source, docs, and tests                                   | Verified current behavior; browser timing evidence remains |

### Allowed variation

- **AV1 — Query content.** Value, placeholder, label, and caller-provided trailing
  content may vary without changing semantic ownership.
- **AV2 — Delegated visuals.** Icon and Spinner may change internal markup while
  preserving their public contracts.

### Representative states

| State                   | Required invariant                                              | Allowed variation                    |
| ----------------------- | --------------------------------------------------------------- | ------------------------------------ |
| Standalone              | Named searchbox with no popup-only ARIA state.                  | Explicit value and change handler.   |
| Contextual, closed      | Named combobox references the list and reports collapsed state. | Query value and trailing content.    |
| Contextual, open        | Named combobox references the list and reports expanded state.  | Highlighted option and result count. |
| Contextual, highlighted | Active descendant names the context-owned highlighted option.   | Highlighted index.                   |
| Pending or trailing     | Supporting content remains at the logical trailing edge.        | Spinner, caller content, or both.    |
| Inline Dialog           | Mount does not steal focus from the surrounding page.           | Query and result content.            |

### Transformation and precedence order

- **ORD1 — Search state.** Explicit props → CommandPalette context → native
  uncontrolled state.
- **ORD2 — Keyboard handling.** Consumer handler → default-prevented check →
  CommandPalette context handler.
- **ORD3 — Accessible name.** Native `aria-label` → `label` → visible
  placeholder text.

### Performance and resources

- **PR1 — Focus scheduling.** At most one animation-frame focus request is
  scheduled by a mounted eligible field; no listener or observer is retained.

## Accessibility contract

- **AR1 — Name.** The native query field has an explicit accessible name from
  ORD3, supporting WCAG 2.2 4.1.2.
- **AR2 — Role and popup state.** Standalone use exposes a `searchbox` without
  popup-only state. CommandPalette context exposes a `combobox` with context-owned
  expanded state, list relationship, autocomplete mode, and active descendant,
  following `spec:AST-020/FR1,FR2` and the WAI-ARIA combobox pattern.
- **AR3 — Semantic ownership.** Native passthrough props cannot overwrite the
  component-owned role or contextual popup relationships.

## Design relationships

| Anatomy or state | Design requirement                                      | Representation authority                  | Hierarchy role | Component contract |
| ---------------- | ------------------------------------------------------- | ----------------------------------------- | -------------- | ------------------ |
| Input region     | Arranges glyph, query field, and trailing group inline. | Current source and public docs            | Prominent      | FR3, FR4           |
| Search glyph     | Identifies the query affordance without adding a name.  | Icon component                            | Supporting     | AR1                |
| Query field      | Receives text, focus, name, and popup semantics.        | Current source and accessibility standard | Prominent      | FR1–FR3, AR1–AR3   |
| Trailing group   | Keeps status and caller content at logical inline-end.  | Current source and public docs            | Supporting     | FR4                |

## Family and system relationships

- `component:CommandPalette` owns the result-popup context and aggregate command
  palette composition; this component binds its query field to that context.
- `spec:AST-020` supplies the WCAG 2.2 and adopted-pattern evidence boundaries.

## Verification map

| Contract    | Verification                                                     | Representative states                    | Mutation or failure expectation                                     | Audit section                        |
| ----------- | ---------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------- | ------------------------------------ |
| FR1–FR3     | `CommandPaletteInput.test.tsx`                                   | explicit, context, prevented key, native | Reversing precedence or rerouting the ref fails focused DOM tests.  | `audit:CommandPaletteInput/testing`  |
| FR4         | `CommandPaletteInput.test.tsx`                                   | numeric, empty, busy, caller content     | Truthiness routing leaks content outside its trailing group.        | `audit:CommandPaletteInput/behavior` |
| FR5         | unit tests plus exact-head browser accessibility/visual evidence | standalone, modal, inline                | Inline mode steals focus or eligible mode loses focus.              | `audit:CommandPaletteInput/behavior` |
| AR1–AR3     | unit tests, exact-head axe/browser run, and source review        | standalone, open, closed, highlighted    | Wrong role/state or consumer clobbering fails semantics assertions. | `audit:CommandPaletteInput/a11y`     |
| Theming/RTL | target inventory, Storybook fixture, and RTL D2 audit            | standalone trailing content, contextual  | Target loss or physical ordering fails the owned fixture.           | `audit:CommandPaletteInput/theming`  |

## Decision log

No component-local decision is settled in this draft.

## Open questions

- **OQ1 — How should the released `onValueChange(value)` primary callback and
  native-event `onChange(event)` exception migrate to the shared `onChange`
  callback grammar without breaking existing consumers?** (`human-api`)
- **OQ2 — Should the native query field gain a separate public theme target, or
  remain intentionally reachable only through the surrounding Input region?**
  (`human-design`)

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit
results, implementation steps, or family/system rules. It links to their owners.
