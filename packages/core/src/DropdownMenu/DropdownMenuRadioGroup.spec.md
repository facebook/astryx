---
schema_version: 3
template_version: 7
kind: component
id: component:DropdownMenuRadioGroup
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [public-api, behavior, accessibility, theming, testing]
verified_by:
  [
    packages/core/src/DropdownMenu/DropdownMenuSelectable.test.tsx,
    packages/core/src/DropdownMenu/DropdownMenu.test.tsx,
    packages/core/src/DropdownMenu/__tests__/Menu.a11y.test.tsx,
    packages/core/src/DropdownMenu/__tests__/RadioGroupTitle.a11y.chromium.spec.ts,
    apps/storybook/stories/DropdownMenuRadioGroup.stories.tsx,
    apps/storybook/rtl-audit/verified-not-applicable.json,
    scripts/check-knowledge.mjs,
  ]
modules: []
families: []
design_specs: []
architecture:
  [
    architecture:public-component-api,
    architecture:component-test-sufficiency,
    architecture:interaction-modality,
  ]
contributing: []
system_specs: [spec:AST-020, spec:AST-029]
---

# DropdownMenuRadioGroup component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                          |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | One controlled, named single-selection group of `DropdownMenuRadioItem` children with value, change callback, close policy, root inputs, an explicit React 19 ref, and an optional visible title. |
| Behavior                | The group supplies selection and close-policy context; radio items emit values; the parent DropdownMenu owns keyboard navigation and menu lifecycle.                                              |
| End-user impact         | Assistive technology encounters one named group with exactly one current choice when a value matches, while pointer and keyboard selection stay aligned.                                          |
| Builder impact          | Keep the value controlled, provide a visible title or a stable accessible label, and place only DropdownMenuRadioItem options inside the group.                                                   |
| Compatibility/readiness | Additive `ref` and proposed `title` props on the group root. Existing runtime behavior, exports, defaults, and theme surfaces remain unchanged; authority stays `draft` until owner approval.     |
| Review checks           | Reject unnamed groups, a name that leaves out a visible title, local selection state, dropped root inputs, a second keyboard owner, or a close policy that bypasses the controlled callback.      |
| Governing rules         | WAI-ARIA menu pattern; `architecture:public-component-api/INV5–INV9`; `architecture:component-test-sufficiency/INV1–INV7`; `spec:AST-020/FR1,FR2,FR6`.                                            |

This table is a review projection; the body below is authoritative.

## Intent

DropdownMenuRadioGroup renders one named `role="group"` wrapper inside the
pointer presentation of DropdownMenu. It owns controlled selection context,
close policy, root composition, the tokenized gap between children, and an
optional visible title that names the group. DropdownMenuRadioItem owns each
`menuitemradio` row and its checked state; DropdownMenu owns focus movement,
typeahead, keyboard activation, presentation, and menu open/close lifecycle.

## Compatibility and migration

- Released default preserved: yes (`hasCloseOnSelect=true`).
- Compatibility class: additive patch; declares and forwards the React 19 `ref`
  prop to the existing group root without changing existing behavior. Proposed
  FR7–FR9 add an optional `title`; without one the group renders as before, and
  `label` becomes optional beside one.
- Controlled behavior: `value` is caller-owned and `onChange` is the only commit path.
- Migration decision: none.

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- One `role="group"` root named by its visible title (proposed FR8) or, without
  one, by an `aria-label` from `label`.
- The title heading: plain text with the menu's group-heading treatment and its
  `dropdown-menu-section-heading` target, outside the rows (proposed FR7).
- Controlled `value`, `onChange`, and `hasCloseOnSelect` context for radio items.
- Composition of `children`, supported host inputs, ref, `className`, `style`, and
  `xstyle` on the group root.
- Column layout and the semantic menu inter-item gap.

**Does not own / non-goals**

- The `menuitemradio` role, `aria-checked`, disabled behavior, indicator paint,
  label, description, icon, or end content — owned by DropdownMenuRadioItem.
- Focus entry, arrow-key navigation, typeahead, Enter/Space synthesis, and menu
  close implementation — owned by DropdownMenu and shared menu hooks.
- Touch and bottom-sheet selectable-row rendering — owned by the parent presentation.
- Uncontrolled selection state or child-value registration.

## Public concepts

| Concept         | Closed values or states                       | Meaning                                                              | Default  | Owner                    | Stability | Invalid-value behavior                                |
| --------------- | --------------------------------------------- | -------------------------------------------------------------------- | -------- | ------------------------ | --------- | ----------------------------------------------------- |
| Selection       | matching value; no matching value             | Controls which child reports checked.                                | none     | caller and radio item    | stable    | No match leaves every child unchecked.                |
| Commit          | child value                                   | Emits the selected child value through `onChange`.                   | required | group context            | stable    | Children outside the group throw from the item owner. |
| Close policy    | close; remain open                            | Controls whether an item asks DropdownMenu to close after selection. | close    | group context and parent | stable    | Omission closes.                                      |
| Accessible name | title, else label; optional labelledby        | Names the group; a visible title names it first (FR8).               | label    | group root               | stable    | With no name of any kind, warns in development.       |
| Title           | `title`: any React node                       | A visible heading, first in the group, that names it (FR7–FR9).      | none     | group root               | proposed  | Rendering no text counts as none (FR9).               |
| Root surface    | ref; DOM/data/ARIA; class/style/xstyle/events | Extends the group root while preserving its role and name.           | omitted  | public component API     | stable    | Accepted inputs compose; owned role and label win.    |

## Behavioral and layout contract

Draft requirements identify their basis so observed code is not mistaken for an
intentional decision.

| ID  | Candidate invariant                                                                                                                                                          | Basis                                                       | Draft review state |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------ |
| FR1 | The root MUST expose `role="group"` and a non-empty accessible name. Without a title (FR8), `label` supplies `aria-label`; caller `aria-labelledby` MAY name it too.         | WAI-ARIA menu pattern; released source/docs                 | verify             |
| FR2 | The group MUST remain controlled. It MUST compare each radio item's value with caller `value` and MUST emit a selected child value only through caller `onChange`.           | Released public API and focused tests                       | verify             |
| FR3 | `hasCloseOnSelect` MUST default to true. When false, successful selection MUST update through `onChange` while the parent menu remains open.                                 | Released behavior and focused tests                         | verify             |
| FR4 | DropdownMenu MUST remain the only keyboard owner. The group adds no tab stop, key handler, typeahead, or click synthesis; it only provides context to child rows.            | `architecture:interaction-modality`; parent tests           | verify             |
| FR5 | Ref, supported host attributes and handlers, `className`, `style`, and `xstyle` MUST reach or compose on the group root without replacing the owned role or `aria-label`.    | `architecture:public-component-api/INV5–INV9`; source/tests | verify             |
| FR6 | The wrapper MUST remain a logical column whose tokenized gap matches the surrounding menu's item rhythm; it MUST NOT add component-specific directional paint or navigation. | Current source; token and bidirectionality rules            | verify             |
| FR7 | With `title`, a heading renders first in the group: plain text with `dropdown-menu-section-heading`, skipped by roving focus and typeahead, a focusable node in it included. | Proposed DEC-1; `component:DropdownMenu` FR14, DEC-6        | proposed           |
| FR8 | A visible title MUST name the group by `aria-labelledby`, a caller's `aria-labelledby` after it; `label` and `aria-label` are ignored, warning if they differ from its text. | Proposed DEC-1; radio-group pattern, label in name          | proposed           |
| FR9 | A `title` that renders no text (`true`, an empty fragment, a component returning `null`) counts as none: no heading shows, FR1 names the group, and an unnamed group warns.  | Proposed DEC-1                                              | proposed           |

### Allowed variation

- **AV1 — Children.** The number, labels, descriptions, icons, and supporting
  content of DropdownMenuRadioItem children may vary.
- **AV2 — Selection.** Any string value, including no matching value, may be
  caller-controlled without adding local group state.
- **AV3 — Root styling.** Caller style inputs may extend the wrapper while the
  role, accessible label, column flow, and child semantics remain intact.

### Representative states

| State             | Required invariant                                                         | Allowed variation                    |
| ----------------- | -------------------------------------------------------------------------- | ------------------------------------ |
| Titled            | One group named by its visible title; a label beside it is ignored.        | Title content, label or none.        |
| Matching value    | Exactly the matching child reports `aria-checked=true`.                    | Child content and menu size.         |
| No matching value | Every child reports `aria-checked=false`.                                  | Empty or unmatched caller value.     |
| Default close     | Selection emits the value and closes through the parent.                   | Pointer or synthesized keyboard act. |
| Retained open     | Selection emits the value, updates controlled state, and leaves menu open. | Result copy and selected child.      |
| RTL / narrow      | Column order and tokenized gap hold with no horizontal overflow.           | Parent menu placement.               |

### Transformation and precedence order

- **ORD1 — Selection.** Child activation → disabled guard in the item owner →
  group `onChange(value)` → optional parent close.
- **ORD2 — Root composition.** Base column/gap → caller `xstyle`; supported host
  inputs and class/style compose while owned role and label remain fixed.

### Performance and resources

- **PR1 — Context, and the title's text.** The group memoizes a small context
  value. Only while a `title` is given, it reads its heading's text after each
  commit, before paint, and again through one `MutationObserver` on the heading,
  disconnected on cleanup, so a title that changes its own text is read again
  (proposed FR9). It owns no other Effect, listener, timer, request, or resource
  lifecycle.

## Accessibility contract

- **AR1 — Named group.** The wrapper is one named `group` inside the parent menu;
  a visible title names it, so its name holds the text a speech-input user reads
  (proposed FR8; the radio-group pattern's label-in-name rule).
- **AR2 — Radio rows.** Child items own `menuitemradio` and `aria-checked`; the
  group does not add nested native inputs or duplicate row semantics.
- **AR3 — Keyboard ownership.** DropdownMenu owns focus collection and activation;
  the group itself, and its title heading, never enter the tab or arrow-key
  sequence.

## Design relationships

| Anatomy or state | Design requirement                                               | Representation authority           | Hierarchy role | Component contract |
| ---------------- | ---------------------------------------------------------------- | ---------------------------------- | -------------- | ------------------ |
| Group wrapper    | Logical column with the menu's semantic inter-item gap.          | Current source and spacing tokens  | structural     | FR1, FR5, FR6      |
| Title heading    | Plain text first in the group, drawn as a group heading.         | `component:DropdownMenu` FR14      | supporting     | FR7                |
| Selected child   | One child reflects caller value through `aria-checked`.          | DropdownMenuRadioItem              | prominent      | FR2, AR2           |
| Direction/narrow | Child order and gap hold without physical-direction assumptions. | Bidirectionality and parent layout | structural     | FR6                |

No new component-local visual decision is settled by this draft.

## Family and system relationships

- `architecture:public-component-api` owns root input composition and released compatibility.
- `architecture:component-test-sufficiency` owns proportionate observable evidence.
- `architecture:interaction-modality` and DropdownMenu own keyboard behavior.
- `component:DropdownMenu` owns the group-heading treatment the title reuses
  (FR14, DEC-6).
- `spec:AST-020` supplies WCAG/APG adoption and evidence-layer boundaries.
- `spec:AST-029` keeps this observational draft separate from the audit receipt.

## Verification map

| Contract       | Verification                                                                   | Representative states                | Mutation or failure expectation                                                           | Audit section                               |
| -------------- | ------------------------------------------------------------------------------ | ------------------------------------ | ----------------------------------------------------------------------------------------- | ------------------------------------------- |
| FR1–FR4, AR1–3 | `DropdownMenuSelectable.test.tsx`; reusable Menu contracts; scoped axe         | matching, none, close, retained-open | An unnamed group, wrong checked row, skipped callback, unwanted close, or key owner fails | `audit:DropdownMenuRadioGroup/§1,§4,§6`     |
| FR7–FR9        | `DropdownMenuSelectable.test.tsx` title suite; `RadioGroupTitle` Chromium spec | titled, label beside, empty, late    | An unnamed titled group, a heading in the arrow order, or a missing warning fails         | `audit:DropdownMenuRadioGroup/§1,§4,§6`     |
| FR5            | root/ref/handler tests; lint and typecheck                                     | ref, host attributes, class/style    | An accepted input is dropped or overrides the owned role/name                             | `audit:DropdownMenuRadioGroup/§3`           |
| FR6            | source-hashed RTL N/A receipt plus exact-head Neutral/Butter/RTL/narrow frames | LTR, RTL, 320px, light/dark          | Physical direction, lost tokenized gap, collapsed geometry, or horizontal overflow fails  | `audit:DropdownMenuRadioGroup/§2,§5,§9,§10` |

## Decision log

### DEC-1 (proposed) — A radio set titles itself

**Reference:** `component:DropdownMenuRadioGroup/DEC-1`
**Decider:** proposed by `vjeux`, 2026-10-14; pending owner review

A section that holds one radio set was titled with a `DropdownMenuGroup`
around a `DropdownMenuRadioGroup`. Each renders a `role="group"` and each needs
a name, so the set read as two nested groups with the same name. The radio
group therefore takes the `title` a `DropdownMenuGroup` takes, renders the same
heading, and is named by it; `label` stays for a set without a visible heading,
and a menu section that holds one radio set takes the set's `title` rather than
a `DropdownMenuGroup` around it. Beside a title, `label` and a caller's
`aria-label` are ignored and a caller's `aria-labelledby` is read after the
title, so the group's name always holds the heading a speech-input user reads,
as the radio-group pattern requires. `title` is `ReactNode`, as
`DropdownMenuGroup`'s is (`component:DropdownMenu/DEC-6`): a focusable node
inside it lands in the group but outside the roving focus order, so the arrow
keys cannot reach it, and a case pins that. Whether the title renders text is
read from the heading itself, because a component title may render nothing.
Rejected: a `DropdownMenuGroup` that stops naming its group when its only child
is a named set, which needs it to inspect its children; an `aria-hidden`
heading beside the radio group's `label`, which lets the visible text and the
name drift apart; and a `label` that names a titled group over its heading,
which fails the pattern's label-in-name rule whenever the two differ.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit scores,
screenshot matrices, implementation steps, or parent/item contracts. The audit
pull request owns the closed run evidence required by `spec:AST-029/FR5`.
