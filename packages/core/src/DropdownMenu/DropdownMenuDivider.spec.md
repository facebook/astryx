---
schema_version: 3
template_version: 7
kind: component
id: component:DropdownMenuDivider
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [public-api, behavior, theming, accessibility, testing]
verified_by:
  [
    packages/core/src/DropdownMenu/DropdownMenu.test.tsx,
    packages/core/src/ContextMenu/ContextMenu.test.tsx,
    packages/core/src/Breadcrumbs/Breadcrumbs.test.tsx,
    packages/core/src/theme/themingTargets.test.ts,
    apps/storybook/stories/DropdownMenuDivider.stories.tsx,
    scripts/check-knowledge.mjs,
  ]
modules: []
families: []
design_specs: []
architecture:
  [
    architecture:public-component-api,
    architecture:component-theming-surface,
    architecture:component-test-sufficiency,
  ]
contributing: []
system_specs: [spec:AST-020, spec:AST-029]
---

# DropdownMenuDivider component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                           |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `DropdownMenuDivider` / `DropdownMenuDividerProps`, plus the `ContextMenuDivider` and `BreadcrumbMenuDivider` aliases and their props; `BaseProps<HTMLDivElement>` minus caller-owned `role` and `aria-orientation`; a root `ref`. |
| Behavior                | One unlabelled horizontal separator divides pointer-menu rows and stays out of arrow-key order; data and compound pointer modes render the same component.                                                                         |
| End-user impact         | Pointer-menu sections remain visually separated without adding a focus stop or changing row operation.                                                                                                                             |
| Builder impact          | No new caller choice. Host attributes, handlers, and styling inputs continue to compose on the separator.                                                                                                                          |
| Compatibility/readiness | Patch-compatible observational contract. Runtime behavior, exports, defaults, and target names remain unchanged; authority stays `draft` until exact-head owner approval.                                                          |
| Review checks           | Reject a focusable separator, changed role/orientation, pointer data/compound divergence, dropped root inputs, or a target moved off the visible separator.                                                                        |
| Governing rules         | `architecture:public-component-api/INV1,INV5–INV9`; `architecture:component-theming-surface/INV3–INV6`; WCAG 2.2 SC 1.3.1 and 4.1.2 through `spec:AST-020/FR1`.                                                                    |

This table is a review projection; the body below is authoritative.

## Intent

DropdownMenuDivider provides the visual and programmatic boundary between groups
of rows in pointer-menu presentations. It ships directly under the DropdownMenu
name and through ContextMenu and Breadcrumbs aliases. It owns the separator
semantics, menu spacing, root input composition, and the
`dropdown-menu-divider` theme target. The surrounding DropdownMenu, ContextMenu,
or BreadcrumbItem owns menu lifecycle and row navigation; Divider supplies the
base rule geometry and paint.

Consumer syntax and examples belong in `DropdownMenuDivider.doc.mjs`.

## Compatibility and migration

- Released default preserved: yes — one horizontal, unlabelled separator.
- Compatibility class: observational patch; no behavior or public surface changes.
- Controlled/uncontrolled behavior: not applicable.
- Migration decision: none.

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- One horizontal separator root and its public ref, DOM/data/ARIA, class, style,
  event, and `xstyle` composition.
- Menu-specific block-axis spacing.
- The `dropdown-menu-divider` target on the same visible root.
- Pointer-menu data/compound rendering parity for the divider row across
  DropdownMenu, ContextMenu, and breadcrumb menus.

**Does not own / non-goals**

- Menu open state, focus entry, row activation, or arrow-key navigation — owned by
  DropdownMenu, ContextMenu, BreadcrumbItem, and their shared hooks.
- Touch and bottom-sheet data dividers — those presentations render Divider
  directly and are owned by their parent menu surface.
- Base separator rule geometry and token paint — delegated to Divider.
- Caller-authored grouping meaning — owned by the product callsite.

## Public concepts

| Concept       | Closed values or states                       | Meaning                                                                        | Availability by variant/orientation/state | Default                | Owner                | Stability | Invalid-value behavior                                                          |
| ------------- | --------------------------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------- | ---------------------- | -------------------- | --------- | ------------------------------------------------------------------------------- |
| Separator row | one horizontal unlabelled separator           | Divides adjacent pointer-menu row groups without becoming a row or focus stop. | Data and compound pointer-menu modes      | present where authored | component            | stable    | Role and orientation are excluded from caller props and remain component-owned. |
| Root surface  | ref; DOM/data/ARIA; class/style/xstyle/events | Extends the separator root while preserving component semantics.               | Every separator row                       | omitted                | public component API | stable    | Accepted inputs compose; role and orientation remain authoritative.             |

## Behavioral and layout contract

Draft requirements identify their basis so observed code is not mistaken for an
intentional decision.

| ID  | Candidate invariant                                                                                                                                                                | Basis                                                            | Draft review state |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------ |
| FR1 | The component MUST render one unlabelled horizontal separator with pointer-menu-specific block spacing.                                                                            | Released source/docs and focused tests                           | verify             |
| FR2 | The root MUST expose `role="separator"` and `aria-orientation="horizontal"`, remain outside menu-item collection and arrow-key order, and never become focusable.                  | WCAG 2.2 SC 1.3.1 and 4.1.2; focused tests                       | verify             |
| FR3 | In pointer-menu presentation, `{type: "divider"}` in the data API and the compound divider component or alias MUST render the same component DOM, spacing, semantics, and targets. | Released docs/source; data/compound parity test                  | verify             |
| FR4 | The visible root MUST carry both the delegated `divider` target and the menu-specific `dropdown-menu-divider` target; menu spacing applies before caller `xstyle`.                 | `architecture:component-theming-surface/INV3–INV6`; source/tests | verify             |
| FR5 | Accepted ref, DOM/data/ARIA, class, style, events, and `xstyle` MUST reach or compose on the separator root without replacing component-owned role or orientation.                 | `architecture:public-component-api/INV5–INV8`                    | verify             |

### Allowed variation

- **AV1 — Theme paint.** The delegated Divider and menu-specific targets may restyle
  their owned surface without changing separator semantics or focus behavior.
- **AV2 — Caller root inputs.** Supported host attributes, handlers, and styling
  inputs may vary while the owned role and orientation remain fixed.

### Representative states

| State                     | Required invariant                                                   | Allowed variation                                             |
| ------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------- |
| Pointer data-mode divider | One horizontal separator between data-driven rows.                   | Adjacent row content and active theme may vary.               |
| Pointer compound divider  | DOM and behavior match the pointer data-mode divider.                | Host attributes and supported styling inputs may be supplied. |
| Public aliases            | ContextMenuDivider and BreadcrumbMenuDivider render this component.  | The containing menu owns lifecycle and navigation.            |
| Touch data divider        | Outside this component; the parent surface renders Divider directly. | Touch-menu layout follows the parent contract.                |
| RTL                       | The horizontal, full-width rule remains direction-neutral.           | Surrounding text and menu alignment may mirror.               |
| Narrow viewport           | The rule remains inside the menu without horizontal overflow.        | Menu width follows its owner.                                 |

### Transformation and precedence order

- **ORD1 — Root composition.** Apply menu spacing, then caller `xstyle`; combine the
  menu-specific target class with caller `className`; preserve caller `style` and
  host props; keep role and orientation component-owned.

### Performance and resources

- **PR1 — No external lifecycle.** DropdownMenuDivider installs no listener,
  observer, timer, request, state machine, or Effect.

## Accessibility contract

- **AR1 — Separator semantics.** The root exposes a horizontal separator and no
  interactive role or tab stop.
- **AR2 — Navigation exclusion.** Menu navigation collects menu-item roles only, so
  ArrowDown and ArrowUp pass across the separator without focusing it.

## Design relationships

| Anatomy or state | Design requirement                                                              | Representation authority                                                              | Hierarchy role | Component contract |
| ---------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | -------------- | ------------------ |
| Menu separator   | Visually separates adjacent menu row groups without competing with row content. | Current source and delegated Divider tokens; no component-local visual decision added | supporting     | FR1–FR4            |

No component-local visual decision is settled by this draft.

## Family and system relationships

- `architecture:public-component-api` owns exports and root input composition.
- `architecture:component-theming-surface` owns target placement and composed target
  ownership.
- `architecture:component-test-sufficiency` owns proportionate, observable evidence.
- DropdownMenu exports the implementation directly. ContextMenu and Breadcrumbs
  re-export it as `ContextMenuDivider` and `BreadcrumbMenuDivider`, with matching
  props aliases; their pointer presentations retain the same component contract.
- Touch and bottom-sheet data dividers bypass this component and delegate directly
  to Divider under the parent menu contract.
- Divider provides the base separator implementation; its draft record is
  observational context, not authority for this contract.
- `spec:AST-029` keeps this observational draft separate from the audit receipt.

## Verification map

| Contract         | Verification                                                                                            | Representative states                                         | Mutation or failure expectation                                                                                     | Audit section                           |
| ---------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| FR1–FR3, AR1–AR2 | `DropdownMenu.test.tsx`; ContextMenu and Breadcrumbs alias tests; dedicated Storybook state; scoped axe | pointer data/compound, aliases, open menu, keyboard traversal | Pointer DOM modes drift, an alias disappears, the role/orientation changes, or the separator enters arrow-key order | `audit:DropdownMenuDivider/§1,§3,§4,§6` |
| FR4              | Focused root-composition test; exact-head Neutral/Butter browser frames                                 | light/dark themes; menu and delegated targets                 | A target leaves the visible root or caller `xstyle` stops composing after menu spacing                              | `audit:DropdownMenuDivider/§2,§5`       |
| FR5              | Focused root-composition test; lint and typecheck                                                       | ref, host attributes, class/style/xstyle/events               | An accepted input is dropped or owned semantics are overwritten                                                     | `audit:DropdownMenuDivider/§3`          |
| PR1              | Source review                                                                                           | every state                                                   | A lifecycle mechanism appears without a resource contract                                                           | `audit:DropdownMenuDivider/§7`          |

## Decision log

None. This draft records current facts and introduces no product decision.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit scores,
screenshot matrices, implementation steps, or system rules. The audit pull request
owns the closed run evidence required by `spec:AST-029/FR5`.
