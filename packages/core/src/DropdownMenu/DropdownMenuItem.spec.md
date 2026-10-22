---
schema_version: 3
template_version: 7
kind: component
id: component:DropdownMenuItem
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [public-api, behavior, accessibility, theming, testing]
verified_by:
  [
    packages/core/src/DropdownMenu/DropdownMenu.test.tsx,
    packages/core/src/DropdownMenu/__tests__/Menu.a11y.test.tsx,
    packages/core/src/theme/themingTargets.test.ts,
    apps/storybook/stories/DropdownMenuItem.stories.tsx,
    apps/storybook/rtl-audit/verified-not-applicable.json,
    scripts/check-knowledge.mjs,
  ]
modules: []
families: [family:navigation-destinations]
design_specs: []
architecture:
  [
    architecture:public-component-api,
    architecture:component-theming-surface,
    architecture:component-test-sufficiency,
    architecture:interaction-modality,
  ]
contributing: []
system_specs: [spec:AST-020, spec:AST-029]
---

# DropdownMenuItem component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                           |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | One compound pointer-menu row for an action or destination, with label, supporting content, disabled state, destructive paint, optional close suppression, root inputs, and a forwarded ref.       |
| Behavior                | The parent menu owns roving focus and keyboard activation; the row owns click order, disabled suppression, close-on-select, destination handoff, hover focus, and its visible content composition. |
| End-user impact         | Actions and destinations preserve keyboard, pointer, and browser link behavior while unavailable rows remain inert and destructive actions remain identifiable.                                    |
| Builder impact          | Destinations use `href`; supporting content stays non-interactive; `hasCloseOnSelect=false` is reserved for in-place result feedback.                                                              |
| Compatibility/readiness | Patch-compatible observational contract. Runtime, exports, defaults, and theme targets remain unchanged; authority stays `draft` until exact-head owner approval.                                  |
| Review checks           | Reject nested controls, disabled activation, lost destination safety, broken modified-click behavior, dropped root inputs, a second keyboard owner, or state/target reflection moved off the row.  |
| Governing rules         | `family:navigation-destinations/FR1–FR5`; `architecture:public-component-api/INV5–INV9`; `architecture:component-theming-surface/INV3–INV6`; `spec:AST-020/FR1,FR2,FR6,FR15`.                      |

This table is a review projection; the body below is authoritative.

## Intent

DropdownMenuItem renders one compound-mode row in the pointer presentation of
DropdownMenu. It owns the row element, content slots, action-versus-destination
branch, activation order, disabled and destructive state, root composition, and
`dropdown-menu-item` theme target. DropdownMenu owns the surrounding menu,
keyboard collection, focus movement, typeahead, presentation choice, and close
lifecycle.

## Compatibility and migration

- Released default preserved: yes.
- Compatibility class: observational patch; no behavior or public surface changes.
- Controlled/uncontrolled behavior: not applicable.
- Migration decision: none.

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- One `role="menuitem"` root and its label, description, icon, end content,
  disabled state, destructive variant, ref, supported host inputs, and styling inputs.
- Action callback order and `hasCloseOnSelect` behavior.
- Link-row rendering, destination handoff, modified/middle-click preservation,
  target and relationship handling, and disabled-link inertness.
- Pointer hover focus and the row's press/hover/focus paint.
- The `dropdown-menu-item` target and its size/variant state reflection.

**Does not own / non-goals**

- Menu naming, open/close state, focus entry, roving focus, typeahead, and keyboard
  click synthesis — owned by DropdownMenu and its shared hooks.
- Touch and bottom-sheet row rendering — the parent presentation delegates those
  rows to List.
- Destination acceptance and blocking — owned by `family:navigation-destinations`.
- Interactive controls inside label, description, or end content. Controls belong
  beside the menu or as separate rows.

## Public concepts

| Concept      | Closed values or states                             | Meaning                                                                        | Availability                | Default | Owner                           | Stability | Invalid-value behavior                                       |
| ------------ | --------------------------------------------------- | ------------------------------------------------------------------------------ | --------------------------- | ------- | ------------------------------- | --------- | ------------------------------------------------------------ |
| Row act      | action; destination                                 | Runs a callback or exposes a browser/router destination from the row itself.   | Every enabled row           | action  | component and navigation family | stable    | A blocked destination is inert; a disabled link has no href. |
| Availability | enabled; disabled                                   | Controls whether the row can receive focus or activate.                        | Every row                   | enabled | component and parent menu       | stable    | Disabled suppresses activation and destination.              |
| Close policy | close; remain open                                  | Whether successful activation closes the parent menu.                          | Action and destination rows | close   | component                       | stable    | Omission closes.                                             |
| Visual state | default; destructive; hover; focus; press; disabled | Paints row meaning and interaction state without changing menuitem semantics.  | Pointer row                 | default | component                       | stable    | Unknown variants are rejected by the public type.            |
| Root surface | ref; DOM/data/ARIA; class/style/xstyle/events       | Extends the row root while preserving component-owned role and keyboard state. | Every pointer row           | omitted | public component API            | stable    | Accepted inputs compose; owned role/tab stop remain fixed.   |

## Behavioral and layout contract

Draft requirements identify their basis so observed code is not mistaken for an
intentional decision.

| ID  | Candidate invariant                                                                                                                                                                                                                                  | Basis                                                            | Draft review state                                           |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------ |
| FR1 | The pointer row MUST expose one `role="menuitem"` root. Label, description, icon, and end content remain presentational content of that row rather than nested controls.                                                                             | WAI-ARIA menu pattern; released source/docs                      | verify                                                       |
| FR2 | Enabled activation MUST run the row callback before optional close. Disabled rows MUST expose `aria-disabled=true`, remove link destinations, and run neither callback nor close.                                                                    | Released behavior; focused tests                                 | verify                                                       |
| FR3 | A destination row MUST render as the link root through LinkProvider. Plain activation runs the callback then closes and navigates; modified and middle clicks preserve browser behavior without running the callback; blocked schemes are inert.     | `family:navigation-destinations/FR1–FR5`; released tests         | verify                                                       |
| FR4 | The parent menu MUST remain the only keyboard owner. It synthesizes click activation with modifiers, moves focus, and runs typeahead; the row MAY focus itself on pointer hover but MUST NOT create a second roving-focus model.                     | `architecture:interaction-modality`; current parent tests        | verify                                                       |
| FR5 | The visible root MUST carry `dropdown-menu-item`; size and destructive state MUST reflect through `themeProps`; semantic tokens own layout and paint before caller styling inputs compose.                                                           | `architecture:component-theming-surface/INV3–INV6`; source/tests | verify                                                       |
| FR6 | Ref, supported host attributes and handlers, `className`, `style`, and `xstyle` MUST reach or compose on the row root without replacing owned role, tab stop, disabled behavior, destination handling, or activation order.                          | `architecture:public-component-api/INV5–INV9`; focused tests     | verify                                                       |
| FR7 | Disabled menu rows remain inert. Whether the menu keyboard model should visit them is unresolved at the shared owner and MUST NOT be changed by a component-local audit.                                                                             | WAI-ARIA menu pattern; parent `component:DropdownMenu/OQ1`       | human API decision                                           |
| FR8 | Keyboard focus MUST remain perceivable, including in forced-colors mode. The current background-only treatment is an objective gap; a remediation must preserve modality and row-content visibility without inventing new ordinary-theme appearance. | WCAG 2.2 SC 1.4.11 and 2.4.7; current rendered behavior          | objective gap; owner must confirm the shared visual boundary |

### Allowed variation

- **AV1 — Content.** Non-interactive icons, text, descriptions, shortcuts, badges,
  and status text may vary without changing the row's menuitem semantics.
- **AV2 — Theme paint.** A theme may restyle the target's admitted properties while
  preserving visible state distinctions and forced-colors focus.
- **AV3 — Parent size.** The parent menu supplies `sm`, `md`, or `lg`; the row reflects
  that state and may vary its tokenized insets.

### Representative states

| State                  | Required invariant                                                                  | Allowed variation                            |
| ---------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------- |
| Enabled action         | Callback runs, then close follows the close policy.                                 | Content, size, and visual variant.           |
| In-place result action | Callback runs and the menu remains open.                                            | Label/end content may update.                |
| Disabled action        | `aria-disabled=true`; callback, hover focus, and close are suppressed.              | Content remains visible.                     |
| Destination            | One anchor root preserves safe destination and browser activation behavior.         | Target, rel, router provider, and content.   |
| Destructive            | Error-role paint applies to label, icon, and description without changing behavior. | Other row content remains consumer-authored. |
| Keyboard focus         | Parent focus lands on the row and remains visible.                                  | Exact theme-owned paint may vary.            |
| RTL / narrow viewport  | Logical insets and start alignment follow direction without horizontal overflow.    | Menu placement remains parent-owned.         |

### Transformation and precedence order

- **ORD1 — Activation.** Disabled guard → browser-navigation classification → row
  callback where applicable → close policy → browser/router navigation.
- **ORD2 — Root composition.** Parent size → base row styles → variant/disabled state
  → caller `xstyle`; target metadata and caller class/style compose on the same root.

### Performance and resources

- **PR1 — Shared press lifecycle.** DropdownMenuItem uses the shared counted press
  controller through `usePressFeedback`; the first mounted pressable installs the
  window listeners and the last removes them. The item adds no per-row listener,
  observer, timer, request, or local resource owner.

## Accessibility contract

- **AR1 — Menu item semantics.** The root is one named `menuitem`; supporting content
  does not introduce a nested interactive descendant.
- **AR2 — Disabled state.** Disabled rows expose state and cannot activate or navigate.
- **AR3 — Keyboard ownership.** DropdownMenu owns focus collection and activation;
  the item remains a single row in that model.
- **AR4 — Focus perception.** Focus remains visually perceivable in supported themes
  and platform accessibility modes; the open forced-colors gap remains explicit.

## Design relationships

| Anatomy or state | Design requirement                                                                  | Representation authority                                           | Hierarchy role | Component contract |
| ---------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------ | -------------- | ------------------ |
| Row              | One full-width action/destination target with tokenized insets and start alignment. | Current source and parent menu composition                         | prominent      | FR1–FR6            |
| Supporting text  | Description and end content remain subordinate to the row label.                    | Delegated Item layout and current consumer docs                    | supporting     | FR1                |
| Interaction      | Hover, focus, press, disabled, and destructive states remain distinguishable.       | Current source; forced-colors focus is an unresolved objective gap | prominent      | FR5, FR8, AR4      |

No new component-local visual decision is settled by this draft.

## Family and system relationships

- `family:navigation-destinations` owns destination acceptance and blocked-scheme
  behavior; this component supplies the destination-bearing row.
- `architecture:public-component-api` owns root input composition, refs, and released
  compatibility.
- `architecture:component-theming-surface` owns target placement and state reflection.
- `architecture:component-test-sufficiency` owns proportionate observable evidence.
- `architecture:interaction-modality` and DropdownMenu own parent keyboard behavior.
- `spec:AST-020` supplies WCAG/APG adoption and evidence-layer boundaries.
- `spec:AST-029` keeps this observational draft separate from the audit receipt.

## Verification map

| Contract         | Verification                                                                  | Representative states                                      | Mutation or failure expectation                                                                                       | Audit section                     |
| ---------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| FR1–FR4, AR1–AR3 | `DropdownMenu.test.tsx`; reusable Menu accessibility tests; scoped axe        | action, destination, disabled, keyboard, modified clicks   | A nested control, activation while disabled, lost browser affordance, or second keyboard owner fails observable tests | `audit:DropdownMenuItem/§1,§4,§6` |
| FR5, FR8, AR4    | theming-target tests; exact-head Neutral/Butter/RTL/narrow/focus/hover frames | default, destructive, disabled, focus, hover               | Target/state reflection disappears, paint is absent, or focus becomes unobservable                                    | `audit:DropdownMenuItem/§2,§5`    |
| FR6              | root/ref/handler tests; lint and typecheck                                    | ref, host attributes, class/style/xstyle, pointer handlers | An accepted input is dropped or overrides component-owned semantics                                                   | `audit:DropdownMenuItem/§3`       |
| RTL / responsive | source-hashed verified-N/A receipt plus exact-head browser frames             | LTR, RTL, 320px                                            | Physical direction leaks into the row or narrow layout overflows                                                      | `audit:DropdownMenuItem/§9,§10`   |

## Decision log

None. This draft records current facts and introduces no product decision.

## Open questions

- **OQ1 — Which shared keyboard owner should keep disabled menu items discoverable
  while preserving their inert behavior?** (`human-api`)
- **OQ2 — Should forced-colors focus use a component-specific system outline, or a
  shared row-focus treatment that also governs ordinary themes?** (`human-design`)

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit scores,
screenshot matrices, implementation steps, or family/system rules. The audit pull
request owns the closed run evidence required by `spec:AST-029/FR5`.
