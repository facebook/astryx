---
schema_version: 3
template_version: 4
kind: component
id: component:BreadcrumbItem
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [public-api, behavior, layout, theming, accessibility]
verified_by:
  [
    packages/core/src/Breadcrumbs/Breadcrumbs.test.tsx,
    apps/storybook/stories/BreadcrumbItem.stories.tsx,
    packages/core/src/theme/themingTargets.test.ts,
    scripts/check-knowledge.mjs,
  ]
modules: []
families: [family:navigation-destinations, family:overlay-dismissal]
design_specs: []
architecture:
  [
    architecture:component-style-authoring,
    architecture:component-test-sufficiency,
    architecture:component-theming-surface,
    architecture:interaction-modality,
    architecture:layer-runtime,
    architecture:public-component-api,
    architecture:react-component-runtime,
  ]
contributing: [contributing:api-conventions]
system_specs: [spec:AST-002, spec:AST-005, spec:AST-029]
---

# BreadcrumbItem component contract

## Intent

BreadcrumbItem presents one destination, action, current location, or sibling-menu
trigger inside a Breadcrumbs trail. This observational draft records verified
released behavior and current shared obligations without changing public API,
defaults, or the component's visual design.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: additive observational documentation plus bug fixes that
  preserve the released public surface
- Controlled/uncontrolled behavior: not applicable
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The list-item root, the item-content branch selected from current public inputs,
  and forwarding the documented item ref and `BaseProps` surface to that root.
- The decorative separator container rendered for its position in the trail.
- The link-styled action or menu trigger and BreadcrumbItem-specific menu surface,
  including their current theme targets.
- Deriving the menu-item size from the parent Breadcrumbs variant when no explicit
  menu size is supplied.

**Does not own / non-goals**

- The navigation landmark, ordered list, trail label, separator value, or visual
  variant — owned by `component:Breadcrumbs` through the public parent component.
- Destination acceptance and custom-router handoff — owned by
  `family:navigation-destinations` and the shared link owner.
- Generic top-layer hosting, focus containment, positioning, and light dismissal —
  owned by `component:Popover` and `architecture:layer-runtime`.
- Shared Escape/platform-close ordering — owned by
  `family:overlay-dismissal`.
- Menu-item data, row semantics, selection, or submenu behavior — delegated to the
  DropdownMenu item pipeline.
- Caller-provided icon artwork or arbitrary child content.

## Public concepts

| Concept       | Closed values or states                            | Meaning                                                                                                                         | Availability by variant/orientation/state | Default                                         | Owner                                          | Stability                                       | Invalid-value behavior                                                                     |
| ------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ----------------------------------------------- | ---------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Item content  | required `ReactNode`                               | Supplies the visible item label and may contain caller-owned content.                                                           | Every item branch                         | Required                                        | `component:BreadcrumbItem`                     | Released                                        | React renders the supplied node.                                                           |
| Destination   | supplied or absent `href`                          | Selects the shared link path when the item is not explicitly current and has no menu.                                           | Default and supporting variants           | Absent                                          | `family:navigation-destinations`               | Released                                        | Shared link handling decides accepted destinations.                                        |
| Action        | supplied or absent `onClick`                       | Selects a native link-styled button when no destination or menu is supplied, or augments the link path when `href` is supplied. | Non-current items                         | Absent                                          | `component:BreadcrumbItem`                     | Released                                        | `menu` currently suppresses this input and warns in development.                           |
| Current page  | `true`, `false`, or omitted                        | `true` explicitly marks the item current; `false` opts it out; omission makes the item an auto-current candidate.               | Every branch, including a menu trigger    | Omitted                                         | `component:BreadcrumbItem`                     | Released observation; intent review pending     | When no item is explicitly current, the omitted final item receives `aria-current="page"`. |
| Link renderer | per-item `as`, provider renderer, or native anchor | Selects the component that receives an accepted destination.                                                                    | Non-current link path                     | Provider renderer, then native anchor           | `family:navigation-destinations`               | Released                                        | Explicitly current and menu paths do not use it.                                           |
| Start content | supplied or absent `startIcon`                     | Renders caller content before the item label.                                                                                   | Every item branch                         | Absent                                          | Caller                                         | Released                                        | Caller content remains caller-owned.                                                       |
| Sibling menu  | data array, composed menu content, or absent       | Replaces the link/action content branch with a menu button and menu surface.                                                    | Current or non-current item               | Absent                                          | `component:BreadcrumbItem`; menu rows delegate | Released observation; precedence review pending | Currently suppresses `href` or `onClick` and warns in development.                         |
| Menu size     | `sm`, `md`, or `lg`                                | Selects the delegated menu-row size.                                                                                            | Menu branch                               | `sm` for supporting Breadcrumbs; otherwise `md` | `component:BreadcrumbItem`                     | Released                                        | TypeScript rejects unsupported values.                                                     |

## Behavioral and layout contract

Draft requirements identify their basis so observed code is not mistaken for an
intentional decision.

| ID  | Candidate invariant                                                                                                                                                                                                                   | Basis                                                                                  | Draft review state                                                                                          |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| FR1 | The item root MUST remain one `<li>` carrying the public ref, item theme target, variant reflection, styling escape hatches, and neutral DOM pass-throughs.                                                                           | Released types, source, docs, and tests; `architecture:public-component-api`           | Verified current behavior; no API change proposed                                                           |
| FR2 | A non-current item with `href` and no menu MUST use the shared link renderer; an item with only `onClick` MUST use a native button; an item with neither MUST render text content.                                                    | Released source, docs, and tests                                                       | Verified current behavior                                                                                   |
| FR3 | Explicit `isCurrent=true` MUST expose `aria-current="page"`; explicit `false` MUST opt out; when every item omits the prop, the final item MUST receive the same current-page state.                                                  | Released source, docs, and tests                                                       | Verified current behavior; whether auto-detection remains the intended long-term default needs owner review |
| FR4 | Every item MUST render one decorative separator container; the first item hides it. The built-in slash mirrors exactly once in RTL, while caller-provided separators remain caller-owned.                                             | Source, focused tests, and objective bidi behavior                                     | Verified current behavior                                                                                   |
| FR5 | A menu item MUST expose one named menu button, current expanded state, control relationship, and one named `role="menu"` surface. Click, Enter, Space, and ArrowDown open it and focus its first item; Escape and selection close it. | APG Menu Button pattern, current Popover contract, source, tests, and browser evidence | Settled objective behavior                                                                                  |
| FR6 | Closing the menu MUST preserve a newly focused outside control. Focus returns to the trigger only when the closing surface would otherwise strand focus.                                                                              | `component:Popover/AR4` and browser focus behavior                                     | Settled objective behavior                                                                                  |
| FR7 | The menu branch MUST delegate item rendering, selection, typeahead, row focus, and submenu content to the shared DropdownMenu pipeline.                                                                                               | Released source and focused tests                                                      | Verified current behavior; DropdownMenu's draft contract remains context only                               |
| FR8 | Omitted `menuSize` MUST resolve from the parent variant before entering DropdownMenu context.                                                                                                                                         | Released source and consumer docs                                                      | Verified current behavior                                                                                   |
| FR9 | The current local targets MUST remain `breadcrumb-item`, `breadcrumb-item-menu-trigger`, and `breadcrumb-menu`, each on its current visible style owner with `variant` reflected where applicable.                                    | Released docs, source, and theming tests                                               | Verified current inventory; no target change proposed                                                       |

### Allowed variation

- **AV1 — Link renderer.** Native anchors and custom router components may differ in
  DOM implementation while preserving the shared destination contract.
- **AV2 — Caller content.** Labels and start content may be any renderable React
  content; the item owns surrounding semantics, not caller artwork or markup.
- **AV3 — Menu content.** Data-driven and composed content may produce actions,
  sections, dividers, selectable items, or submenus through the delegated pipeline.
- **AV4 — Theme.** Current targets and semantic tokens may change paint while item
  roles, focus ownership, and branch behavior remain stable.

### Representative states

| State            | Required invariant                                                                                            | Allowed variation                                             |
| ---------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Destination link | Shared link path, visible keyboard focus, and accepted destination behavior remain available.                 | Native or custom router renderer; optional start content.     |
| Action button    | Native button semantics and supplied click handling remain available.                                         | Default or supporting typography.                             |
| Explicit current | Current-page state is exposed on the rendered content owner.                                                  | Plain content or menu trigger.                                |
| Auto-current     | The final omitted item receives current-page state only when no explicit current item exists.                 | Link or text content remains in its released branch.          |
| Closed menu      | Trigger exposes `aria-haspopup="menu"`, controls the menu, and reports collapsed state.                       | Data-driven or composed rows; current or non-current trigger. |
| Open menu        | Named menu is top-layer reachable and focus enters its first eligible row.                                    | Row kinds, submenu content, and explicit menu size.           |
| Dismissed menu   | One dismissal closes the surface; valid outside focus is preserved and stranded focus returns to the trigger. | Escape, selection, Tab, or native light dismiss.              |

### Transformation and precedence order

- **ORD1 — Content branch.** Explicit current is evaluated first; within either
  current or non-current state, `menu` selects the menu branch. Otherwise `href`
  selects the link branch, then `onClick` selects the action branch, then plain
  content remains.
- **ORD2 — Link renderer.** Per-item `as` wins over LinkProvider, which wins over
  the native anchor.
- **ORD3 — Menu size.** Explicit `menuSize` wins; otherwise supporting resolves to
  `sm` and every other parent variant resolves to `md`.

### Performance and resources

- **PR1 — Delegated layer resources.** BreadcrumbItem creates no independent global
  listeners or observers; menu lifecycle and focus resources remain delegated to
  Popover and shared menu hooks.
- **PR2 — Auto-current reconciliation.** Current source reconciles omitted current
  state by inspecting the rendered sibling list after render. This is a known
  runtime-authority gap under `architecture:react-component-runtime`, not an
  approved implementation requirement.

## Accessibility contract

- **AR1 — Trail semantics.** The parent Breadcrumbs landmark and ordered list own
  aggregate breadcrumb semantics; each item remains one list item.
- **AR2 — Current state.** The content owner for a current item exposes
  `aria-current="page"`; the list-item wrapper does not duplicate it.
- **AR3 — Native interaction.** Links use link semantics, action-only items use a
  native button, and menu items use the APG Menu Button relationship.
- **AR4 — Menu name.** The menu surface is labelled by its trigger, including when
  the visible item content is a non-string React node.
- **AR5 — Focus.** Keyboard focus is visible on links and menu/action buttons. Menu
  entry, containment, Escape return, and outside-focus preservation follow FR5–FR6.
- **AR6 — Separator.** Separator content is hidden from assistive technology while
  remaining directionally correct for sighted readers.

## Design relationships

| Anatomy or state       | Design requirement                                                                               | Representation authority                                         | Hierarchy role    | Component contract |
| ---------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- | ----------------- | ------------------ |
| Item root              | Carries current typography and the `breadcrumb-item` target.                                     | Current source and public docs                                   | Supporting        | FR1, FR9           |
| Link or action content | Uses native semantics and the shared focus indicator without introducing another content target. | Current source; `architecture:interaction-modality`              | Supporting        | FR2, AR3, AR5      |
| Current content        | Uses the released non-color text emphasis alongside current-page semantics.                      | Current source and objective non-color communication             | Prominent         | FR3, AR2           |
| Separator              | Remains decorative to assistive technology and mirrors by contextual bidi role.                  | Objective bidi behavior                                          | Supporting        | FR4, AR6           |
| Menu trigger           | Paints the menu-trigger target on the native focus owner.                                        | Current source and public docs                                   | Supporting        | FR5, FR9, AR3–AR5  |
| Menu surface           | Paints the `breadcrumb-menu` refinement inside Popover's shared layer surface.                   | `component:Popover` plus current BreadcrumbItem target inventory | Prominent         | FR5–FR9            |
| Start content          | Renders caller content without claiming its artwork or semantics.                                | Caller content; `component:Icon` when composed                   | Context-dependent | AV2                |

## Family and system relationships

- `family:navigation-destinations` owns destination inspection and handoff for
  native and custom link paths. BreadcrumbItem composes the shared link owner.
- `family:overlay-dismissal` owns topmost Escape/platform-close routing.
  BreadcrumbItem participates through Popover.
- `component:Popover` owns generic menu-surface hosting, focus containment, and
  stranded-focus return; BreadcrumbItem owns its trigger and refinement target.
- `architecture:component-theming-surface` owns target qualification, placement,
  and state reflection.
- `architecture:public-component-api` and `spec:AST-002` own released API,
  precedence, invalid-state prevention, and compatibility review.

## Verification map

| Contract         | Verification                                                               | Representative states                                                                      | Mutation or failure expectation                                                                     | Audit section                                 |
| ---------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| FR1–FR3, AR1–AR3 | `Breadcrumbs.test.tsx` branch, ref, pass-through, and current-state suites | Link, action, explicit current, omitted final, explicit false                              | A branch changes semantic element, loses current state, or moves the public root contract.          | `audit:BreadcrumbItem/api-behavior`           |
| FR4, AR6         | `Breadcrumbs.test.tsx`, `BreadcrumbItem.stories.tsx`, and RTL audit        | Built-in slash, bidi-mirrored glyph, explicit icon mirror, LTR and RTL                     | A contextual separator fails to mirror exactly once or becomes exposed to AT.                       | `audit:BreadcrumbItem/rtl`                    |
| FR5–FR8, AR3–AR5 | `Breadcrumbs.test.tsx` plus real-browser story evidence                    | String and ReactNode labels, click/keyboard open, rows, selection, Escape, outside dismiss | A menu loses its name/state, focus enters the wrong owner, or dismissal steals valid outside focus. | `audit:BreadcrumbItem/accessibility-behavior` |
| FR9              | `themingTargets.test.ts`, source inspection, and rendered theme evidence   | Item, menu trigger, menu surface; default/supporting                                       | A target disappears, moves to non-painting plumbing, or loses variant reflection.                   | `audit:BreadcrumbItem/theming`                |
| Draft structure  | `scripts/check-knowledge.mjs`                                              | Required schema and current relationship links                                             | Missing sections, stale links, or accidental current authority fail validation.                     | `audit:BreadcrumbItem/knowledge`              |

## Decision log

None. This draft records observed released behavior and objective shared
requirements; it makes no component-local API, default, compatibility, ownership,
or visual-design decision.

## Open questions

- **OQ1 — Conflicting interaction props.** Should the released `menu` + `href` or
  `menu` + `onClick` combinations remain warning-based precedence, or should a
  compatibility plan make them unrepresentable? (`human-api`)
- **OQ2 — Auto-current ownership.** Should omitted `isCurrent` remain an
  auto-detected current candidate, and if so which React-owned mechanism should
  replace post-render DOM reconciliation? (`human-api`)

## Content boundary

This file does not duplicate the consumer prop table, menu-item API, audit scores,
run evidence, screenshots, implementation steps, or shared navigation, layer,
dismissal, and theming rules. It links to their owners.
