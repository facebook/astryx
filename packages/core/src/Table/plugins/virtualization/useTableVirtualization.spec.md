---
schema_version: 3
template_version: 3
kind: module
id: module:Table/useTableVirtualization
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers:
  [
    public-api,
    behavior,
    layout,
    theming,
    accessibility,
    interaction,
    performance,
    react-runtime,
  ]
verified_by:
  [
    packages/core/src/Table/plugins/virtualization/useTableVirtualization.test.tsx,
    packages/core/src/Table/__tests__/TableVirtualization.a11y.chromium.spec.ts,
    packages/core/src/Table/Table.perf.test.tsx,
    scripts/check-knowledge.mjs,
  ]
parent_component: component:Table
references:
  [
    architecture:component-theming-surface,
    architecture:interaction-modality,
    architecture:public-component-api,
    architecture:react-component-runtime,
    spec:AST-002,
    spec:AST-009,
    spec:AST-020,
  ]
---

# useTableVirtualization module contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                                                                                                                                                                             |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | Candidate fixed-height row-windowing module with caller-owned data, one validated stable unique Table row identity, a vertical viewport, row height, and an explicit server-rendered initial range. Caller-configurable overscan is not admitted unless OQ12 proves a semantic need.                                                                                                                 |
| Behavior                | Render one contiguous visible row window plus an internally bounded overscan and, when necessary, one separately bounded retained-focus row subtree, while preserving native table structure, full-table row metadata, scroll geometry, stable identity, and supported plugin/core appearance.                                                                                                       |
| End-user impact         | Large tables keep bounded DOM and responsive scrolling while preserving supported row state and keyboard focus. The accessibility tree exposes truthful full-table positions for mounted rows; this contract does not claim virtual-cursor discovery of unmounted rows.                                                                                                                              |
| Builder impact          | Builders opt into a fixed-height contract, identify the vertical viewport, and supply stable row keys. Variable-height content and unsupported plugin combinations remain explicit rather than silently degrading.                                                                                                                                                                                   |
| Compatibility/readiness | Additive, unreleased module. This draft is not implementation authority. Parent window/spacer/identity metadata, full-table ARIA correction, viewport ownership, enforceable fixed-height mode, SSR range, focus island, data anchoring, row-index/striping/divider compatibility, and measurable budgets require owner decisions before promotion.                                                  |
| Review checks           | Reject invalid table DOM, block rewrites of semantic elements, render-then-hide, mismatched/duplicate/index keys, body-relative ARIA totals, unenforceable fixed height, silent clipping/drift, lost focus, unbounded focus retention, spacer-relative striping/dividers, recycled uncontrolled state, scroll jumps, unsupported combinations that appear to work, or unmeasured performance claims. |
| Governing rules         | `component:Table` owns shared plugin phases and row rendering; `architecture:react-component-runtime` owns measurement/resource lifetime; `architecture:public-component-api` and `spec:AST-002` own public caller burden.                                                                                                                                                                           |

This table is a review projection; the body below is authoritative.

## Intent

`useTableVirtualization` bounds the number of mounted body rows in a large data-driven
Table while preserving semantic table structure and the caller's row identities. It owns
visible-range calculation, overscan, spacer geometry, absolute row-position metadata,
focus retention, supported-plugin composition, resize/scroll coordination, performance
budgets, and implementation evidence.

Row virtualization is distinct from infinite loading and pagination. It limits mounted DOM
for data the caller already owns; it does not fetch, page, cache, or discard product data.
Column virtualization is a separate contract.

## Compatibility and migration

- Released default preserved: `yes`; Table renders every supplied row unless the new module is explicitly enabled.
- Compatibility class: additive public module plus the smallest approved extension to the parent Table rendering protocol.
- Migration decision: `module:Table/useTableVirtualization/DEC-1` after the protocol and interaction questions are approved.

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The public virtualization hook/result and its fixed-height row-window contract.
- Visible-range and overscan calculation, top/bottom spacer geometry, and vertical viewport coordination.
- Stable row identity through window changes and explicit DOM-recycling policy.
- Absolute `aria-rowindex`, total `aria-rowcount`, focus retention, keyboard/assistive-technology behavior, and evidence.
- Compatibility declarations for selection, sorting, filtering, activation, expansion/tree/grouping, sticky columns, context menus, and infinite loading.
- Resize/scroll resource lifetime and measurable performance budgets.

**Does not own / non-goals**

- Aggregate plugin protocol and shared render phases — owned by `component:Table`.
- Product data, fetching, caching, pagination, infinite loading, or server cursors.
- Column virtualization.
- Variable-height row measurement in v1 unless owner evidence admits it explicitly.
- Product scroll restoration, route state, or imperative navigation to arbitrary data not owned by the caller.
- Cell renderer correctness for unstable keys or content that violates the declared fixed-height contract.
- A new theme target. Spacer geometry is not theme anatomy, and visible rows use existing Table targets.

## Public API and concepts

No TypeScript shape is admitted yet. OQ1 must choose either a parent-integrated
windowing seam or one atomic Table-compatible props bundle. The approved result MUST:

- carry a mutable-compatible `T[]` data value accepted by current `TableProps<T>`;
- carry the exact same validated stable unique `idKey` used for window identity and Table reconciliation, so callers cannot accidentally omit or disagree with it;
- carry one canonical logical offset/count source consumed by ARIA metadata and `useTableRowIndex` rather than requiring duplicate caller-maintained offsets; and
- define duplicate/invalid-key behavior before exposing the hook.

The current parent protocol cannot safely express data windowing, semantic spacer rows,
identity, and full-table metadata without an approved extension; OQ1 owns that boundary.

| Concept             | Closed values or states                               | Meaning                                                                                                   | Default                     | Owner                                 | Stability |
| ------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------- | ------------------------------------- | --------- |
| Data ownership      | Complete caller-owned ordered `T[]`                   | Supplies the logical dataset from which mounted rows are derived.                                         | Required                    | Caller through this module            | Candidate |
| Row identity        | Validated stable unique `string` or `number` key      | Drives both window identity and Table reconciliation; duplicate/invalid keys follow one fail-safe policy. | Required                    | Parent/module boundary                | Unsettled |
| Row measurement     | Positive finite total row block size in CSS pixels    | Defines deterministic geometry under an enforceable fixed-height content/appearance mode.                 | Required in v1              | `module:Table/useTableVirtualization` | Unsettled |
| Visible range       | Contiguous half-open logical index interval           | Names the rows intersecting the viewport before internal overscan.                                        | Derived                     | `module:Table/useTableVirtualization` | Candidate |
| Focus island        | Absent or one separately bounded retained row subtree | Keeps the currently focused row/detail mounted without stretching the visible range across the dataset.   | Absent without remote focus | `module:Table/useTableVirtualization` | Unsettled |
| Overscan            | Internally bounded non-negative row count             | Absorbs ordinary scroll/keyboard movement without becoming a caller tuning API unless OQ12 admits it.     | Internal                    | `module:Table/useTableVirtualization` | Unsettled |
| Spacer geometry     | One or more inaccessible logical-space segments       | Preserves full scroll extent around the visible range and optional focus island.                          | Derived                     | `module:Table/useTableVirtualization` | Candidate |
| Initial range       | Explicit positive row count or other approved seed    | Provides deterministic server/hydration output before a client viewport is measurable.                    | Unsettled                   | Caller/module boundary                | Unsettled |
| Recycling policy    | Stable keyed mount/unmount; no cross-key DOM reuse    | Avoids moving uncontrolled/focused state between logical rows.                                            | No cross-key recycling      | `module:Table/useTableVirtualization` | Candidate |
| Appearance metadata | Absolute logical parity and logical-final-row state   | Preserves striping/dividers independently of spacer/window DOM position.                                  | Derived                     | Parent/module boundary                | Unsettled |

## Behavioral contract

| ID   | Candidate invariant                                                                                                                                                                                                                                                                                                                                              | Basis                                       | Draft review state                    |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ------------------------------------- |
| FR1  | Stable callbacks, data identity, viewport, valid row height, initial-range inputs, and unchanged internal overscan preserve stable module output where their observable result is unchanged.                                                                                                                                                                     | Parent identity and runtime architecture    | Settled candidate                     |
| FR2  | Mounted data consists of one contiguous visible range plus internally bounded overscan and, when focus would otherwise unmount, at most one separately bounded retained-focus row subtree. Empty data mounts no data/spacer/focus-island row.                                                                                                                    | Window and focus bounds                     | Human interaction decision            |
| FR3  | Spacer segments plus mounted row heights equal the full logical body height, including around an optional focus island. The same logical offset before/after a no-op render produces the same visible range without a jump.                                                                                                                                      | Scroll continuity                           | Settled candidate                     |
| FR4  | Native `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, and `<td>` semantics remain valid. Spacer representation is absent from accessibility semantics and does not require block/absolute/role rewrites of structural table elements.                                                                                                                          | HTML and accessibility boundary             | Architecture decision pending         |
| FR5  | Full-table ARIA metadata includes represented header rows: the header row has its absolute index, each mounted data row uses `headerRowCount + logicalDataIndex + 1`, `aria-rowcount` is `headerRowCount + logicalDataRowCount`, and inaccessible spacers count as neither. Existing body-relative APIs require a standards-conformance correction before reuse. | WAI-ARIA row metadata; parent compatibility | Parent API correction required        |
| FR6  | One validated stable unique canonical key drives both window identity and Table reconciliation. The approved result makes that key inseparable from its data props. Duplicate/invalid keys disable virtualization and fall back to full rendering in all builds, with one development warning.                                                                   | React identity and fail-safe behavior       | Parent/API decision required          |
| FR7  | A focused row or focused owned detail subtree that leaves the ordinary window becomes the one bounded focus island rather than stretching the contiguous range or moving focus to the document body. The island is released on blur, removal, or return to the ordinary range.                                                                                   | Keyboard/focus correctness                  | Human interaction decision            |
| FR8  | Sorting/filtering/data replacement recompute current logical order and reconcile scroll/focus anchors according to one explicit policy. Stale geometry or prior indices cannot expose another row under a retained key.                                                                                                                                          | Controlled data and identity                | Scroll-anchor policy unsettled        |
| FR9  | Sticky columns, selection, activation, sorting, filtering, context menus, and `useTableRowIndex` preserve state/meaning for mounted rows. One parent logical-offset source drives ARIA and visible row numbering. Expansion/tree/grouping/infinite loading/custom rows are explicit compatibility decisions.                                                     | Plugin composition                          | Compatibility matrix decision pending |
| FR10 | Server and first client render the same explicit initial range. Hydration does not render the full dataset then collapse it or render an empty body and repair it in an Effect.                                                                                                                                                                                  | SSR/hydration and runtime architecture      | Initial-range policy unsettled        |
| FR11 | Viewport resize, row-height/data-length change, and scroll events update the range without synchronous layout read/write loops. Stable no-op renders do not reconnect resources or reset scroll.                                                                                                                                                                 | Runtime/performance boundary                | Settled candidate                     |
| FR12 | Imperative scrolling, if admitted, targets a logical canonical key/index with defined alignment and unavailable-row behavior. It remains separate from activation, focus, navigation, and fetching.                                                                                                                                                              | Public responsibility boundary              | Human API decision                    |
| FR13 | Completion proves bounded mounted data rows and recorded frame/render/memory budgets. Hiding offscreen mounted rows or rendering all rows before slicing is not virtualization.                                                                                                                                                                                  | Performance outcome                         | Settled candidate                     |
| FR14 | V1 accepts only a positive finite total row block size and an owner-approved fixed-height Table mode that defines text overflow, density/theme padding, custom cell content, interactive controls, plugin output, precedence, overflow detection, and explicit rejection/fallback. Invalid height disables virtualization and falls back to full rendering.      | Enforceable geometry contract               | Human API/design decision             |
| FR15 | If striping or row dividers are supported, their parity/final-row treatment derives from absolute logical row metadata, not spacer-relative `:nth-child`/`:last-child`; middle windows match the equivalent full Table. Otherwise the options are explicitly rejected.                                                                                           | Core Table appearance compatibility         | Parent appearance decision            |
| FR16 | Accessibility-tree claims cover truthful metadata for mounted rows only. This contract does not claim that virtual-cursor users can discover unmounted rows; any admitted AT navigation/announcement outcome requires its own interaction and `spec:AST-009` matrix.                                                                                             | Evidence boundary                           | Settled limitation                    |

### Transformation and precedence order

- **ORD1 — Logical data and identity.** Approved sorting/filtering/data-order owners establish the logical `T[]`; the parent validates one canonical stable unique key and exposes one logical offset/count source.
- **ORD2 — Admission inputs.** Validate viewport, positive finite row block size, approved fixed-height mode/content, dataset length, initial range, and internal overscan before calculating a window. Invalid identity/height falls back to full rendering.
- **ORD3 — Mounted set.** Derive the contiguous visible range from current scroll geometry, expand by internal overscan, and add at most one separately bounded focus island when required.
- **ORD4 — Semantic body.** Render inaccessible spacer segments, keyed data rows with full-table indices, and any focus island through an approved parent phase that preserves valid table semantics and excludes spacers from row counts.
- **ORD5 — Element plugins.** Existing row/cell transforms run only for mounted logical data/focus-island rows unless their current contracts explicitly include spacer anatomy; `useTableRowIndex` consumes the same logical offset as ARIA metadata.
- **ORD6 — Core appearance.** Virtualized row rendering receives absolute logical parity/final-row metadata before striping/divider styles resolve, so spacers and window edges do not alter appearance.
- **ORD7 — State changes.** Data/order/height/viewport changes apply the approved anchor policy before exposing the next range; stale work cannot overwrite current geometry.
- **ORD8 — Parent protocol.** The module does not privately bypass BaseTable. Any new data/body/identity/appearance phase belongs to `component:Table` and must be approved before implementation.

### Performance and resources

- **PR1 — Bounded DOM.** Mounted data is bounded by visible rows plus internal overscan and at most one separately bounded focus-retained row subtree, independent of total dataset length.
- **PR2 — Fixed-height arithmetic.** Correct range/geometry behavior uses the validated declared block size and viewport geometry and does not require per-row measurement or observer fan-out; diagnostics/fallback for contract violations remain an OQ10 outcome.
- **PR3 — One viewport subscription.** At most one scroll subscription and one resize/viewport observer exist per mounted instance; updates are scheduled without more than one pending frame of range work.
- **PR4 — Stable no-op.** Unchanged inputs and a scroll offset that remains within the current effective range do not rebuild every row or reset the plugin/result identity.
- **PR5 — Measured budgets.** Implementation records mounted row count, initial render cost, no-op rerender cost, scroll-frame work, memory trend, and supported-plugin overhead at representative 1k, 10k, and 100k logical rows.
- **PR6 — Cleanup.** Unmount and viewport replacement release listeners, observers, animation-frame work, retained elements, and stale geometry.

## Accessibility contract

- **AR1 — Semantic table.** Native table structure and header/cell associations remain intact; virtualization does not convert Table into an ARIA grid or generic block list.
- **AR2 — Full-table position exposure.** The browser accessibility tree exposes each represented header/data row's absolute full-table `aria-rowindex` and full-table `aria-rowcount`; mounted data rows never use window-relative ordinals, and spacers count as neither. This is a computed-semantics claim, not a promise that unmounted rows are discoverable by virtual cursor.
- **AR3 — Hidden spacers.** Spacer geometry has no accessible row/cell content, name, selection, current state, or focus stop.
- **AR4 — Focus retention.** One focused row or focused owned detail subtree may remain as the separately bounded focus island through range shifts; it is released on blur/removal/return and never causes an unbounded range or silent focus move to the document body.
- **AR5 — Keyboard traversal.** Supported Table controls and row interactions remain reachable without requiring pointer scrolling or exposing thousands of tab stops.
- **AR6 — Announcements.** Scrolling does not generate live-region noise. Any explicit “row X of Y” claim uses the semantic row metadata rather than repeated status messages.
- **AR7 — Zoom, reflow, and fixed-height admission.** At supported zoom/text settings, the approved fixed-height mode cannot silently clip required content. Content or plugin output outside that mode follows the explicit rejection/full-render fallback chosen in OQ10.
- **AR8 — Evidence boundary.** DOM/accessibility-tree and real-browser keyboard tests prove static semantics, focus, and computed full-table metadata. Real AT is added only if an approved outcome depends on announcement, virtual-cursor advancement/discovery, or a recorded divergence under `spec:AST-009`; no such unmounted-row discovery claim exists in this draft.

## Design relationships

| Anatomy or state       | Design requirement                                                                                  | Representation authority                             | Module contract   |
| ---------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ----------------- |
| Mounted data row       | Looks and behaves like the same logical row in a non-virtualized Table.                             | Existing row/cell targets and supported plugins      | FR2-FR16, AR1-AR8 |
| Spacer segments        | Preserve geometry without becoming visible/accessibility data anatomy.                              | This module; not a public theme target               | FR3-FR5, AR1-AR3  |
| Vertical viewport      | Owns block scroll offset/size without conflicting with Table's inline scroll region.                | Parent/caller boundary pending OQ2                   | FR3, FR11, PR3    |
| Focus island           | Keeps at most one focused row/owned-detail subtree mounted outside the ordinary window.             | This module plus the focused descendant/detail owner | FR2, FR7, AR4-AR5 |
| Logical row appearance | Preserves striping parity and final-row dividers from absolute logical metadata.                    | Parent Table appearance plus this module             | FR15, ORD6        |
| Unsupported tall row   | Uses the explicit rejection/full-render fallback rather than clipping under a fixed-height promise. | Parent/module boundary pending OQ10                  | FR14, AR7         |

No new theming target is proposed. Data rows retain current Table targets. Spacer geometry
is structural implementation detail and cannot accept arbitrary theme paint or sizing.

## Parent and system relationships

- `component:Table` owns BaseTable's data/render phases, semantic body/header construction, canonical key reconciliation, row memoization, plugin ordering, core striping/divider appearance, and existing body-relative `rowIndexStart`/`rowCount` behavior. This module requires an approved parent window/spacer/identity/appearance seam and a standards-conformance correction so full-table ARIA counts/indices include represented headers and exclude spacers.
- `architecture:react-component-runtime` owns scroll/resize resource lifetime, current values, scheduling, node replacement, StrictMode replay, and cleanup.
- `architecture:public-component-api` and `spec:AST-002` require intent-named inputs and reject leaking an internal virtualizer or tuning knob without proven caller need.
- `spec:AST-009` and `spec:AST-020` own the evidence boundary. This draft claims computed accessibility-tree metadata for mounted rows, not AT discovery of unmounted rows.
- `useTableRowIndex` and every supported state plugin consume the same parent-owned canonical identity/logical offset rather than a caller-maintained duplicate. Tree/grouping/infinite-loading/custom-row modules compose only if their current contracts and OQ6 explicitly admit them.

## Verification map

| Contract                      | Verification                                                                                                                                                     | Representative states                                                                            | Mutation or failure expectation                                                                                                           |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| FR1-FR6, FR14-FR15, ORD1-ORD6 | Deterministic range/geometry/identity/appearance tests plus Table renders inspecting native DOM, keys, spacer semantics, full-table ARIA, striping, and dividers | Empty; first/middle/last window; focus island; duplicate keys; invalid height; striped/divided   | Visible rows drop, geometry drifts, DOM is invalid, keys recycle, ARIA excludes headers, fallback fails, or appearance shifts.            |
| FR7-FR9, FR12, FR16, AR1-AR8  | Real-browser keyboard/accessibility-tree tests for scrolling, focus island, data replacement, zoom, controls, row index, and approved plugins                    | Focus in row/detail/control; offscreen scroll; sort/filter; sticky/selection/activation/index    | Focus/body/semantics/state/numbering fail, unmounted discovery is overclaimed, clipping is silent, or unsupported combos appear valid.    |
| FR10, SSR/hydration           | Server markup plus hydration tests at explicit initial ranges and viewport changes                                                                               | Empty, smaller/larger than initial, changed client viewport                                      | Full data renders then collapses, markup mismatches, initial rows disappear, or an Effect repairs known-wrong output.                     |
| FR11, PR2-PR4, PR6            | Fake viewport/scroll/resize harness under StrictMode, no-op rerenders, viewport replacement, unmount, and rapid scroll                                           | Stable, changed and detached viewport; repeated scroll events                                    | Resources leak/churn, stale work commits, scroll resets, or events cause synchronous layout loops.                                        |
| FR13, PR1, PR5                | Performance suite and browser trace recording visible/overscan/focus-island DOM, commits, frame work, and memory at 1k/10k/100k logical rows                     | Core-only and every supported plugin/appearance combination                                      | Mounted rows scale with total data, focus retention is unbounded, budgets regress, or claimed support adds unbounded work.                |
| Public API and docs           | Public-subpath compile fixture for atomic Table-compatible data/identity/offset props, `.doc.mjs`, generated inventory, Storybook, and fixed-height recipes      | Mutable-compatible `T[]`, unique key, viewport, initial range, fixed-height mode, support matrix | Caller can omit/disagree on identity, readonly data mismatches Table, tuning leaks without admission, or docs imply unsupported behavior. |
| Structural ownership          | `pnpm check:knowledge`                                                                                                                                           | Draft module and parent backlink                                                                 | A missing, orphaned, misnamed, wrong-kind, or duplicate module record passes validation.                                                  |

## Decision log

### DEC-1 — V1 is fixed-height row virtualization

**Reference:** `module:Table/useTableVirtualization/DEC-1`
**Decider:** pending owner approval

V1 must prove bounded DOM and semantic correctness from one positive finite total row block size under an owner-approved fixed-height Table mode. That mode defines text overflow, density/theme padding, custom content/controls, plugin output, precedence, diagnostics, and full-render fallback. Variable-height measurement remains a separate contract.

Rejected: silently measuring some rows, assuming an average height, clipping arbitrary Table content without an admitted mode, and calling hidden or `content-visibility` rows virtualized while they remain mounted.

### DEC-2 — Preserve native table semantics

**Reference:** `module:Table/useTableVirtualization/DEC-2`
**Decider:** pending owner approval

Virtualization must use valid semantic table structure and truthful full-table row metadata: represented header rows are indexed and included in `aria-rowcount`; data rows use their absolute full-table index; inaccessible spacers are excluded. The existing body-relative `rowIndexStart`/`rowCount` behavior requires a standards-conformance correction before virtualization can reuse it. Structural elements remain native rather than block-positioned or role-replaced.

Rejected: body-only totals presented as full-table counts, `display:block` on `<table>/<tbody>/<tr>`, absolutely positioned generic row divs, and spacer rows announced as data.

### DEC-3 — Stable keys; no cross-row DOM recycling

**Reference:** `module:Table/useTableVirtualization/DEC-3`
**Decider:** pending owner approval

V1 uses one validated stable unique canonical key for both window identity and Table reconciliation. The approved parent seam or atomic props bundle makes that key inseparable from its data. Duplicate/invalid keys disable virtualization and fall back to normal full rendering in every build, with one development warning. Rows outside the approved mounted set may unmount, but no keyed DOM/component instance is reused for another logical key.

Rejected: separate window/Table extractors, optional identity that falls back to window-local indices, duplicate keys that recycle multiple rows, and recycling uncontrolled input, focus, or component state across logical rows.

## Open questions

- **OQ1 — Which parent protocol represents windowing, identity, metadata, and spacers?** (`human-api`) Choose parent-owned phases, a dedicated component, or one atomic Table-compatible props bundle. The result must carry mutable-compatible `T[]`, the exact validated unique `idKey`, logical offset/count, and semantic spacer ownership so callers cannot omit or disagree with identity/metadata.
- **OQ2 — Who owns the vertical viewport?** (`human-api`) Table's current wrapper owns inline scrolling. Decide caller ref versus a Table-owned block viewport, nested scroller behavior, and how inline and block scrolling compose without conflicting owners.
- **OQ3 — What is the initial SSR range?** (`human-api`) Decide whether an initial row count is required, has a documented default, or derives from explicit server-known geometry. Full-render-then-collapse and empty-then-repair are rejected.
- **OQ4 — How is the bounded focus island represented?** (`human-design`) Define at most one discontiguous retained row plus its module-owned detail subtree, spacer segmentation, release on blur/removal/return, scroll/focus behavior, and what happens when another off-window row receives focus.
- **OQ5 — What happens when data order changes?** (`human-api`) Decide start-offset, focused/active-key, first-visible-key, or another scroll-anchor policy for sorting, filtering, insertion, deletion, and replacement.
- **OQ6 — Which plugins and core appearance modes compose in v1?** (`human-api`) Confirm sticky columns, selection, activation, sorting, filtering, context menus, and `useTableRowIndex` with one logical offset. Decide whether expansion, tree, grouped rows, infinite loading, custom rows, striping, and each divider mode are supported, constrained, or rejected with dedicated evidence.
- **OQ7 — Is imperative `scrollToRow` public in v1?** (`human-api`) Admit it only if callers need an operation beyond setting scroll position, and define canonical key/index, alignment, unavailable-row, focus, and data-not-loaded behavior.
- **OQ8 — What objective budgets gate completion?** (`human-api`) Approve mounted-row, focus-island, render, frame, and memory budgets at representative data sizes so “smooth” cannot substitute for evidence.
- **OQ9 — How does the parent correct full-table ARIA indexing?** (`human-api`) Define header-row indices/count, data-row offset, spacer exclusion, and migration from current body-relative `rowIndexStart`/`rowCount` docs/behavior before virtualization reuses them.
- **OQ10 — What exactly constitutes fixed-height mode?** (`human-api`) Define positive-finite validation, total block-size semantics, `textOverflow`, density/theme padding precedence, allowed custom renderers/interactive content/plugins, overflow diagnostics, and the explicit rejection or full-render fallback. Native row height is a minimum, so a numeric prop alone is insufficient.
- **OQ11 — How are striping and dividers made logical-position-aware?** (`human-design`) If supported, replace spacer-relative `:nth-child`/`:last-child` meaning with parent-supplied absolute parity/final-data-row state while preserving ordinary non-virtualized CSS behavior and middle-window pixels.
- **OQ12 — Is caller-configurable overscan admitted?** (`human-api`) Keep overscan internal unless two non-derivable caller situations prove an API need under `spec:AST-002`; if admitted, define semantic outcome, bounds, invalid values, default, and decision burden rather than exposing an engine-tuning knob.

## Content boundary

This record does not duplicate consumer signatures/examples, the parent Table pipeline,
general virtualizer algorithms, current usage audits, implementation steps, data-fetching,
column virtualization, or variable-height contracts. It links to their canonical owners.
