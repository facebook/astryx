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
| Public contract         | One controlled, named single-selection group of `DropdownMenuRadioItem` children with value, change callback, close policy, root inputs, and an explicit React 19 ref.                            |
| Behavior                | The group supplies selection and close-policy context; radio items emit values; the parent DropdownMenu owns keyboard navigation and menu lifecycle.                                              |
| End-user impact         | Assistive technology encounters one named group with exactly one current choice when a value matches, while pointer and keyboard selection stay aligned.                                          |
| Builder impact          | Keep the value controlled, provide a stable accessible label, and place only DropdownMenuRadioItem options inside the group.                                                                      |
| Compatibility/readiness | Patch-compatible additive `ref` prop on the existing group root. Existing runtime behavior, exports, defaults, and theme surfaces remain unchanged; authority stays `draft` until owner approval. |
| Review checks           | Reject unnamed groups, local selection state, dropped root inputs, a second keyboard owner, or a close policy that bypasses the controlled callback.                                              |
| Governing rules         | WAI-ARIA menu pattern; `architecture:public-component-api/INV5–INV9`; `architecture:component-test-sufficiency/INV1–INV7`; `spec:AST-020/FR1,FR2,FR6`.                                            |

This table is a review projection; the body below is authoritative.

## Intent

DropdownMenuRadioGroup renders one named `role="group"` wrapper inside the
pointer presentation of DropdownMenu. It owns controlled selection context,
close policy, root composition, and the tokenized gap between children.
DropdownMenuRadioItem owns each `menuitemradio` row and its checked state;
DropdownMenu owns focus movement, typeahead, keyboard activation, presentation,
and menu open/close lifecycle.

## Compatibility and migration

- Released default preserved: yes (`hasCloseOnSelect=true`).
- Compatibility class: additive patch; declares and forwards the React 19 `ref`
  prop to the existing group root without changing existing behavior.
- Controlled behavior: `value` is caller-owned and `onChange` is the only commit path.
- Migration decision: none.

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- One `role="group"` root with an `aria-label` from the required `label` prop.
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
| Accessible name | required label; optional labelledby           | Names the group; `aria-labelledby` may point at visible text.        | label    | group root               | stable    | `label` remains required by the public type.          |
| Root surface    | ref; DOM/data/ARIA; class/style/xstyle/events | Extends the group root while preserving its role and name.           | omitted  | public component API     | stable    | Accepted inputs compose; owned role and label win.    |

## Behavioral and layout contract

Draft requirements identify their basis so observed code is not mistaken for an
intentional decision.

| ID  | Candidate invariant                                                                                                                                                          | Basis                                                       | Draft review state |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------ |
| FR1 | The root MUST expose `role="group"` and a non-empty accessible name. The required `label` supplies `aria-label`; caller `aria-labelledby` MAY reference visible text.        | WAI-ARIA menu pattern; released source/docs                 | verify             |
| FR2 | The group MUST remain controlled. It MUST compare each radio item's value with caller `value` and MUST emit a selected child value only through caller `onChange`.           | Released public API and focused tests                       | verify             |
| FR3 | `hasCloseOnSelect` MUST default to true. When false, successful selection MUST update through `onChange` while the parent menu remains open.                                 | Released behavior and focused tests                         | verify             |
| FR4 | DropdownMenu MUST remain the only keyboard owner. The group adds no tab stop, key handler, typeahead, or click synthesis; it only provides context to child rows.            | `architecture:interaction-modality`; parent tests           | verify             |
| FR5 | Ref, supported host attributes and handlers, `className`, `style`, and `xstyle` MUST reach or compose on the group root without replacing the owned role or `aria-label`.    | `architecture:public-component-api/INV5–INV9`; source/tests | verify             |
| FR6 | The wrapper MUST remain a logical column whose tokenized gap matches the surrounding menu's item rhythm; it MUST NOT add component-specific directional paint or navigation. | Current source; token and bidirectionality rules            | verify             |

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

- **PR1 — Context only.** The group memoizes a small context value and owns no
  Effect, listener, observer, timer, request, DOM read, or resource lifecycle.

## Accessibility contract

- **AR1 — Named group.** The wrapper is one named `group` inside the parent menu.
- **AR2 — Radio rows.** Child items own `menuitemradio` and `aria-checked`; the
  group does not add nested native inputs or duplicate row semantics.
- **AR3 — Keyboard ownership.** DropdownMenu owns focus collection and activation;
  the group itself never enters the tab or arrow-key sequence.

## Design relationships

| Anatomy or state | Design requirement                                               | Representation authority           | Hierarchy role | Component contract |
| ---------------- | ---------------------------------------------------------------- | ---------------------------------- | -------------- | ------------------ |
| Group wrapper    | Logical column with the menu's semantic inter-item gap.          | Current source and spacing tokens  | structural     | FR1, FR5, FR6      |
| Selected child   | One child reflects caller value through `aria-checked`.          | DropdownMenuRadioItem              | prominent      | FR2, AR2           |
| Direction/narrow | Child order and gap hold without physical-direction assumptions. | Bidirectionality and parent layout | structural     | FR6                |

No new component-local visual decision is settled by this draft.

## Family and system relationships

- `architecture:public-component-api` owns root input composition and released compatibility.
- `architecture:component-test-sufficiency` owns proportionate observable evidence.
- `architecture:interaction-modality` and DropdownMenu own keyboard behavior.
- `spec:AST-020` supplies WCAG/APG adoption and evidence-layer boundaries.
- `spec:AST-029` keeps this observational draft separate from the audit receipt.

## Verification map

| Contract       | Verification                                                                   | Representative states                | Mutation or failure expectation                                                           | Audit section                               |
| -------------- | ------------------------------------------------------------------------------ | ------------------------------------ | ----------------------------------------------------------------------------------------- | ------------------------------------------- |
| FR1–FR4, AR1–3 | `DropdownMenuSelectable.test.tsx`; reusable Menu contracts; scoped axe         | matching, none, close, retained-open | An unnamed group, wrong checked row, skipped callback, unwanted close, or key owner fails | `audit:DropdownMenuRadioGroup/§1,§4,§6`     |
| FR5            | root/ref/handler tests; lint and typecheck                                     | ref, host attributes, class/style    | An accepted input is dropped or overrides the owned role/name                             | `audit:DropdownMenuRadioGroup/§3`           |
| FR6            | source-hashed RTL N/A receipt plus exact-head Neutral/Butter/RTL/narrow frames | LTR, RTL, 320px, light/dark          | Physical direction, lost tokenized gap, collapsed geometry, or horizontal overflow fails  | `audit:DropdownMenuRadioGroup/§2,§5,§9,§10` |

## Decision log

None. This draft records current facts and introduces no product decision.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit scores,
screenshot matrices, implementation steps, or parent/item contracts. The audit
pull request owns the closed run evidence required by `spec:AST-029/FR5`.
