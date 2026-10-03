---
schema_version: 3
template_version: 3
kind: module
id: module:Table/useTableActivation
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers:
  [public-api, behavior, layout, theming, accessibility, interaction]
verified_by:
  [
    packages/core/src/Table/plugins/activation/useTableActivation.test.tsx,
    packages/core/src/Table/__tests__/TableActivation.a11y.chromium.spec.ts,
    packages/core/src/Table/Table.perf.test.tsx,
    scripts/check-knowledge.mjs,
  ]
parent_component: component:Table
references:
  [
    architecture:component-theming-surface,
    architecture:interaction-modality,
    architecture:public-component-api,
    spec:AST-002,
  ]
---

# useTableActivation module contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                                                                                                                                                     |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | Candidate `useTableActivation<T>` hook returning one `TablePlugin<T>` from controlled `activeKey`, `onActivate`, optional row eligibility, and an interaction mode. The module consumes Table's canonical resolved row key rather than introducing a second extractor.                                                                                                       |
| Behavior                | Eligible rows expose controlled active state and request activation through composed row interactions. Activation remains independent from selection, navigation, expansion, and focus.                                                                                                                                                                                      |
| End-user impact         | People can keep one current row visually anchored while it drives adjacent detail or preview content, without losing cell controls or other Table behavior.                                                                                                                                                                                                                  |
| Builder impact          | Builders own the active key and response to activation. The plugin owns row-state reflection and interaction composition; it does not own routing, detail content, or selection.                                                                                                                                                                                             |
| Compatibility/readiness | Additive, unreleased module. This draft is not implementation authority. Exact keyboard semantics, hover admission, current-row semantics, and active-state paint require owner decisions before promotion.                                                                                                                                                                  |
| Review checks           | Reject selection coupling, a second row-key extractor, duplicate keys activating multiple rows, implicit navigation, incorrect button/link roles, default `aria-current`, pointer-only activation, clobbered handlers, activation from nested controls or an in-row selection gesture, active paint that fails on pinned cells, and plugin identity churn for stable inputs. |
| Governing rules         | `component:Table` FR9-FR12 and ORD1-ORD4 own plugin composition; `architecture:interaction-modality` owns shared input-modality rules; `architecture:public-component-api` and `spec:AST-002` own public caller burden.                                                                                                                                                      |

This table is a review projection; the body below is authoritative.

## Intent

`useTableActivation` gives a data-driven Table one controlled current-row state for
master-detail, preview, and inspector layouts. It owns how a row is identified,
requests activation, reflects active state, composes with existing row behavior, and
keeps that state visually coherent through pinned cells.

Activation means “this row currently drives adjacent product state.” It is not a
selected-set operation, a navigation promise, or focus ownership. Those distinctions
are part of the module contract rather than left to each product implementation.

## Compatibility and migration

- Released default preserved: `yes`; Table behavior remains unchanged unless the new plugin is supplied.
- Compatibility class: additive public hook, types, documentation, and examples.
- Migration decision: `module:Table/useTableActivation/DEC-1` after the open interaction decisions are approved.

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The public `useTableActivation` hook, its configuration, and the controlled active-row contract.
- Consumption of Table's canonical resolved row key, row eligibility, activation request boundaries, and active-state reflection.
- Composition with existing row handlers and first-party Table plugins.
- Suppression of accidental activation from nested interactive content and active text selection.
- Keyboard and pointer parity for every admitted interaction mode.
- Active-row paint, pinned-cell coherence, accessibility, performance, and evidence.

**Does not own / non-goals**

- Aggregate `TablePlugin` protocol, transform order, failure isolation, or plugin-array identity — owned by `component:Table`.
- Selection state, checkbox semantics, or `aria-selected` — owned by `useTableSelection` and its caller.
- Routing, URLs, link semantics, or `aria-current="page"` — owned by a navigation surface, not activation.
- Adjacent detail content, preview loading, prefetching, or focus movement — owned by the product or another module.
- Cell controls. Buttons, links, inputs, and editable content remain independently operable and do not activate their row as a side effect.
- Children-mode rows. The plugin pipeline applies to data-driven rows only.
- A new public theme target. The active row remains part of the existing `table-row` anatomy unless a separate theming proposal proves another owner is necessary.

## Public API and concepts

The candidate public shape is:

```ts
export type TableActivationMode = 'press' | 'hover';

export interface UseTableActivationConfig<T extends Record<string, unknown>> {
  activeKey: string | number | null;
  onActivate: (item: T, key: string | number) => void;
  getIsItemActivatable?: (item: T) => boolean;
  mode?: TableActivationMode;
}

export function useTableActivation<T extends Record<string, unknown>>(
  config: UseTableActivationConfig<T>,
): TablePlugin<T>;
```

The exact mode surface is blocked on OQ1-OQ3. Consumer docs own final signatures,
defaults, imports, and examples after promotion.

| Concept              | Closed values or states                     | Meaning                                                                                   | Default                  | Owner                             | Stability |
| -------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------ | --------------------------------- | --------- |
| Active key           | Stable unique `string`, `number`, or `null` | Matches Table's one validated canonical row key; `null` means no active row.              | Controlled `null`        | Caller through this module        | Candidate |
| Row eligibility      | Activatable or inert                        | Decides whether the module contributes interaction and active presentation to one row.    | Every data row eligible  | `module:Table/useTableActivation` | Candidate |
| Activation request   | `(item, key)` callback                      | Asks the caller to update controlled state; the plugin never mutates `activeKey`.         | No implicit state update | Caller through this module        | Candidate |
| Interaction mode     | Candidate `press` or `hover`                | Selects admitted intent signals while preserving keyboard parity.                         | Candidate `press`        | `module:Table/useTableActivation` | Unsettled |
| Active presentation  | Inactive or active                          | Reflects controlled state on the existing row anatomy and through pinned cells.           | Inactive                 | `module:Table/useTableActivation` | Unsettled |
| Selection/navigation | Independent                                 | Activation neither changes selection nor claims a route, destination, or navigation role. | Unchanged                | Their respective owners           | Required  |

## Behavioral contract

| ID   | Candidate invariant                                                                                                                                                                                                                                                                                                                                                                                                                             | Basis                                                                    | Draft review state                                           |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------ |
| FR1  | One mounted hook instance returns one stable `TablePlugin`, and each mounted row keeps a stable composed activation handler while controlled keys or current callbacks change.                                                                                                                                                                                                                                                                  | `component:Table` FR12 and PR1; existing stable-identity plugin evidence | Settled candidate                                            |
| FR2  | `activeKey` is fully controlled and matches the stable, unique canonical `rowKey` already validated by Table for reconciliation. Activation requires an explicit `idKey`; the parent passes the validated key to the row transform, and this module adds no second extractor or fallback active key. Duplicate canonical keys make every row sharing that key inert for activation in all builds and emit one deduplicated development warning. | One row identity across parent and module                                | Parent API decision required                                 |
| FR3  | An eligible row whose validated canonical key equals `activeKey` exposes a stable `data-active` state and component-owned active presentation; all other rows remove both. No default `aria-current` or `aria-selected` is inferred.                                                                                                                                                                                                            | Activation/selection/navigation boundary                                 | Settled candidate                                            |
| FR4  | An ineligible row contributes no activation handler, keyboard affordance, active paint, or active-state attribute even if its key equals the controlled key.                                                                                                                                                                                                                                                                                    | Disabled interaction boundary                                            | Verify whether controlled active state should remain visible |
| FR5  | An admitted activation gesture calls `onActivate(item, key)` once. The module runs the accumulated row handler in documented order and respects cancellation through `preventDefault`; it never replaces a handler already present when its transform runs.                                                                                                                                                                                     | Parent sequential plugin contract; event composition                     | Human API decision on order                                  |
| FR6  | A gesture originating in a nested button, link, input, select, textarea, editable surface, or equivalent interactive role does not activate the row. Text selection suppresses activation only when the non-collapsed selection associated with that gesture intersects the activated row.                                                                                                                                                      | Accidental-activation prevention                                         | Settled candidate                                            |
| FR7  | Every admitted pointer activation path has an equivalent keyboard path with visible focus and no incorrect replacement of the row's native semantic role.                                                                                                                                                                                                                                                                                       | WCAG 2.2 SC 2.1.1, 2.4.7, and 2.4.11                                     | Human interaction decision                                   |
| FR8  | If hover intent is admitted, keyboard focus supplies an equivalent activation signal; touch-only environments do not depend on hover; moving a pointer across descendants does not repeatedly activate one row.                                                                                                                                                                                                                                 | Shared modality and WCAG 2.2 SC 2.1.1                                    | Human decision whether hover belongs in v1                   |
| FR9  | Activation is independent from selection, expansion, tree controls, context menus, sorting, and row navigation. Nested controls retain their own handlers, and activation never changes another plugin's controlled state.                                                                                                                                                                                                                      | Module boundary and plugin composition                                   | Settled candidate                                            |
| FR10 | Active presentation uses component-owned fallback paint on the existing row anatomy and publishes the same effective overlay to pinned cells. Striping, hover, focus indication, and active state have one explicit precedence order; no theme-authored `active` state is implied.                                                                                                                                                              | Current private row overlay and theming-surface boundaries               | Human visual decision                                        |
| FR11 | Children mode, empty state, and rows excluded by upstream transforms remain unchanged. Any module-owned resource usage is bounded by mounted rows, fully released when the owning row or Table detaches, and produces no activation or global side effect after release.                                                                                                                                                                        | Observable resource limits; implementation freedom                       | Settled candidate                                            |
| FR12 | For valid unique canonical keys, changing only `activeKey` does not replace the plugin array, row handlers, columns, or product data and does not React-rerender unrelated rows. At most the previously active and newly active mounted rows change their reflected state/presentation.                                                                                                                                                         | Issue performance requirement and parent row memoisation                 | Settled candidate                                            |

### Transformation and precedence order

- **ORD1 — Eligibility before state.** Resolve row eligibility first. Ineligible rows return the prior accumulated row props unchanged.
- **ORD2 — Controlled state.** Consume the validated canonical row key supplied by Table and compare it with `activeKey`; never derive a second identity or derive active state from focus, hover, or a prior event. Rows sharing an invalid duplicate key remain inert.
- **ORD3 — Existing handler.** Run the accumulated row handler before the module's activation request. A cancelled event does not activate.
- **ORD4 — Nested-content guard.** Interactive descendants and a non-collapsed selection intersecting the activated row suppress the module request without suppressing descendant behavior; an unrelated selection elsewhere does not.
- **ORD5 — Presentation.** Apply inactive or active state after eligibility while preserving prior classes, styles, refs, attributes, and children.
- **ORD6 — Parent pipeline.** Relative order with other plugins remains the order supplied by `component:Table`; this module creates no private second pipeline.

### Performance and resources

- **PR1 — Constant module overhead.** Canonical-key comparison, state reflection, and handler guards add O(1) module-owned work per relevant row update. The module invokes `getIsItemActivatable` at most once when resolving that row update; caller callback complexity is outside the module's guarantee and is measured separately by call count.
- **PR2 — Stable public identities.** The returned plugin object, Table's resolved plugin array, and mounted row activation handlers stay referentially stable across `activeKey`, callback, and eligibility-function changes while still observing their current values.
- **PR3 — Bounded active update.** For valid unique keys, changing only `activeKey` changes reflected state/presentation on at most the previously active and newly active mounted rows and does not React-rerender unrelated rows.
- **PR4 — Bounded lifetime.** Module-owned retained resources scale no faster than mounted rows, are released when their owning row/Table detaches, and leave no post-release callback or global side effect. Equivalent implementations that meet those observable bounds remain valid.

## Accessibility contract

- **AR1 — Native table semantics.** Body rows retain their native row role; the module does not claim button, link, option, or gridcell semantics it cannot fulfil.
- **AR2 — Keyboard parity.** Every user who can activate a row with a pointer can do so from the keyboard with visible, unobscured focus and a documented key gesture (WCAG 2.2 SC 2.1.1, 2.4.7, and 2.4.11).
- **AR3 — Nested controls.** Interactive descendants remain reachable and operable without activating the row (WCAG 2.2 SC 2.1.1).
- **AR4 — State honesty.** The module does not emit `aria-selected` or default `aria-current`; active presentation alone does not claim selection or navigation semantics.
- **AR5 — Non-colour state.** If active state communicates current position required to use an adjacent view, its focus/current treatment cannot rely on colour alone (WCAG 2.2 SC 1.4.1). The exact representation is blocked on OQ3.
- **AR6 — Hover parity.** Any admitted hover mode has focus parity and remains usable on devices without hover (WCAG 2.2 SC 2.1.1 and 1.4.13 where additional hover/focus content exists).
- **AR7 — Proportionate evidence.** Unit, DOM, accessibility-tree, axe, and real-browser keyboard evidence prove static semantics, nested-control isolation, focus, and reflected state. Real AT is added only if an approved outcome depends on announcement, browse/virtual-cursor behavior, or a recorded AT/browser divergence, as required by `spec:AST-009`.

## Design relationships

| Anatomy or state     | Design requirement                                                                   | Representation authority                                           | Module contract    |
| -------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------ | ------------------ |
| Activatable row      | Communicates availability without replacing native table structure or cell controls. | This module plus `architecture:interaction-modality`               | FR5-FR9, AR1-AR3   |
| Active row           | Remains visually traceable through normal and pinned cells.                          | Component-owned fallback; public theme-state admission remains OQ3 | FR3, FR10, AR4-AR5 |
| Focused row          | Shows keyboard focus independently from controlled active state.                     | Shared focus rules and existing row anatomy                        | FR2, FR7, AR2, AR5 |
| Nested cell control  | Keeps its own interaction, focus, and semantic contract.                             | The nested component                                               | FR6, FR9, AR3      |
| Selection/navigation | Never inferred from activation.                                                      | Selection or navigation owner                                      | FR2, FR3, FR9, AR4 |

No new public theme target or theme-authored `active` state is proposed by default. The module owns a component fallback and must propagate its effective overlay to pinned cells. OQ3 may admit an `active` state on the existing `table-row` target only if it defines the fallback, guaranteed paint properties, state precedence, and pinned-overlay projection required by `architecture:component-theming-surface`. A separate direct target still requires another theming proposal.

## Parent and system relationships

- `component:Table` owns the aggregate `TablePlugin` protocol, canonical ordering, sequential transforms, failure isolation, stable plugin-array identity, and canonical row identity. This module requires the parent to validate one explicit stable unique `idKey`, expose its resolved key and validity to `transformBodyRow`, and make duplicate-key rows inert rather than adding another extractor.
- `architecture:interaction-modality` owns cross-component keyboard/pointer modality rules; this module owns only their row-activation projection.
- `architecture:public-component-api` and `spec:AST-002` own additive API discipline and caller burden. The module exposes controlled product state rather than routing or data-fetching dependencies.
- `useTableSelection`, tree, expansion, context-menu, sticky-column, and future navigation modules retain their independent state and semantics.

## Verification map

| Contract                     | Verification                                                                                                                                                                   | Representative states                                                                         | Mutation or failure expectation                                                                                                                         |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR1-FR4, FR11-FR12, PR1-PR4  | Public plugin/handler identity, controlled render/mutation/callback counts, invalid-key fallback, and resource-lifetime tests                                                  | Active, inactive, `null`, eligible, ineligible, duplicate keys, callback changes, key changes | Plugin/handlers churn, duplicate-key rows activate, unrelated rows rerender, more than two valid-key rows mutate, callbacks overrun, or resources leak. |
| FR5-FR9, ORD1-ORD6           | Unit/browser interaction tests with prior handlers and selection, expansion, tree, sticky, context-menu, and custom plugins                                                    | Pointer, keyboard, nested controls, in-row and unrelated text selection, cancellation         | Handlers are replaced, callbacks fire twice, unrelated selection blocks activation, nested controls activate rows, or state crosses.                    |
| FR10, AR5-AR6                | Real-browser screenshots in light/dark, striped, hover, pinned-column, keyboard-focus, touch emulation, and forced-colors states                                               | Active/inactive/focused rows with and without hover and pinned cells                          | Component fallback or approved theme state disappears under pinned cells, relies on colour alone, or loses focus indication.                            |
| AR1-AR7                      | Unit/DOM/accessibility-tree tests, axe, and real-browser keyboard automation; real AT only for an adopted AT-dependent outcome                                                 | Native traversal, focus, activation, nested link/button/input, state update                   | Row semantics are replaced, keyboard lacks parity, focus is lost, or selection/navigation semantics are falsely exposed.                                |
| Plugin composition           | Focused integration matrix plus existing Table selection/tree/expansion/sticky/context-menu suites                                                                             | Every supported first-party combination and custom row handler order                          | Enabling activation breaks another plugin, changes column order, or loses accumulated row props.                                                        |
| Public API and documentation | Public-subpath compile fixture including required explicit `idKey` and parent-supplied validated canonical row key, generated inventory, `.doc.mjs`, Storybook, and one recipe | Generic row type, controlled update, eligibility, duplicate keys, admitted modes              | A second extractor appears, duplicate behavior is undefined, the hook/types are unavailable, or docs promise an unapproved mode.                        |
| Performance                  | Extend `Table.perf.test.tsx` with plugin/handler identity, render and DOM-mutation counts, eligibility-callback counts, stable no-op, and adjacent valid-key changes           | Large representative data, same key, adjacent key, callbacks changed                          | One key change replaces the plugin path, rerenders unrelated rows, mutates more than old/new rows, over-invokes eligibility, or exceeds budgets.        |
| Structural ownership         | `pnpm check:knowledge`                                                                                                                                                         | Draft module and parent backlink                                                              | A missing, orphaned, misnamed, wrong-kind, or duplicate module record passes validation.                                                                |

## Decision log

### DEC-1 — Activation is controlled and independent

**Reference:** `module:Table/useTableActivation/DEC-1`
**Decider:** pending owner approval

Activation represents one caller-owned current row. It requires an explicit stable unique `idKey`, consumes Table's validated canonical resolved key, reflects the controlled key, and emits requests; duplicate-key rows are inert rather than multiply active. The module never owns product state, selection, routing, focus, detail content, or prefetching.

Rejected: a second activation-specific key extractor, deriving activation from selection or focus, storing an internal fallback key, or combining row navigation and activation into one hook.

### DEC-2 — Preserve native row semantics

**Reference:** `module:Table/useTableActivation/DEC-2`
**Decider:** pending owner approval

Whole-row convenience must not replace a semantic table row with a button or link role.
Keyboard parity and an honest affordance are release requirements, not reasons to claim an
incorrect role.

Rejected: `role="button"` or `role="link"` on `<tr>`, pointer-only activation, and
implicit `aria-selected` or `aria-current`.

### DEC-3 — Active state uses existing row anatomy

**Reference:** `module:Table/useTableActivation/DEC-3`
**Decider:** pending owner approval

The module reflects active state through the existing row anatomy, owns a component fallback, and publishes the same effective overlay to pinned cells. A second target is not justified. Theme-authored `active` state is admitted only if OQ3 defines its fallback, properties, precedence, and pinned projection.

Rejected: styling only transparent row backgrounds that disappear under pinned cells, implying that the current `table-row` target already accepts an undeclared `active` state, and adding a public `table-row-activation` target without an independent theme-author need.

## Open questions

- **OQ1 — What is the v1 keyboard interaction?** (`human-api`) Decide between making every eligible row a tab stop with Enter/Space activation, a roving row focus model, or requiring one explicit cell control while keeping whole-row pointer activation as a convenience. The decision must preserve native table semantics and remain usable at large row counts.
- **OQ2 — Is hover activation admitted in v1?** (`human-design`) If yes, define focus parity, dwell versus immediate activation, pointer descendant transitions, touch behavior, and whether focus-driven activation may replace adjacent detail without an explicit press.
- **OQ3 — How is required current state communicated?** (`human-design`) Decide the component-owned fallback paint, focus-versus-active precedence, non-colour cue, and whether an `active` state is admitted on the existing `table-row` theme target. Any admitted state must define guaranteed paint properties, a theme-independent fallback, precedence, and how theme paint reaches the private pinned-cell overlay. Decide separately whether an opt-in caller-supplied `aria-current` value is warranted for genuinely current-item sets; default selection/navigation semantics remain forbidden.
- **OQ4 — What cancels composed activation?** (`human-api`) Confirm existing-handler-first order and `event.defaultPrevented` as the cancellation contract, or choose another explicit composition rule that works across plugin orderings.
- **OQ5 — Should an ineligible row matching `activeKey` remain visibly active?** (`human-api`) Decide whether eligibility governs interaction only or both interaction and controlled presentation.
- **OQ6 — How does Table expose validated canonical row identity?** (`human-api`) Approve an additive canonical row-key context/argument for `transformBodyRow` that requires an explicit stable unique `idKey`, reports whether the resolved key is valid, and makes every row sharing a duplicate key inert for activation in all builds with one deduplicated development warning. Decide the parent mechanism without adding an activation-specific extractor.

## Content boundary

This record does not duplicate consumer signatures/examples, the parent Table plugin
protocol or ordering, shared input-modality rules, current usage audits, implementation
steps, or navigation/selection/prefetch contracts. It links to their canonical owners.
