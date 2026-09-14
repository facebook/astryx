---
schema_version: 3
template_version: 1
kind: module
id: module:Markdown/useMarkdownAnnotations
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [public-api, behavior, accessibility, performance]
verified_by: [scripts/check-knowledge.mjs]
parent_component: component:Markdown
references:
  [
    architecture:public-component-api,
    architecture:react-component-runtime,
    architecture:component-test-sufficiency,
    spec:AST-036/DEC-1,
    spec:AST-036/DEC-3,
  ]
---

# useMarkdownAnnotations module contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `useMarkdownAnnotations(config)` returns one live Markdown plugin using `decorations`. Config carries document identity/revision, immutable annotations, optional authoritative edit mapping, constrained decoration visuals, and a bounded stable-selection callback.                                                                                                                                                                                                                                                                                              |
| Behavior                | Core maps stable rendered selections to exact UTF-16 source ranges, segments existing prose for highlights without AST mutation, preserves overlapping annotation identities, and marks revision-mismatched anchors stale unless an authoritative edit map resolves them.                                                                                                                                                                                                                                                                                           |
| End-user impact         | Readers can see and navigate existing comments/highlights without losing normal browser selection/copy. Selecting text never automatically opens a competing popover; the host may put annotation actions in an existing toolbar, side panel, or mobile bottom sheet.                                                                                                                                                                                                                                                                                               |
| Builder impact          | The host supplies annotation state and owns permissions/storage/posting plus any action surface. Live annotation/action changes rerun only decoration work and do not reparse or remount unaffected Markdown.                                                                                                                                                                                                                                                                                                                                                       |
| Compatibility/readiness | Draft and unimplemented. Without the hook, Markdown and native selection UI remain unchanged. Browser, mobile-selection, overlap, stale-anchor, streaming, accessibility, allocation, and remount evidence is pending.                                                                                                                                                                                                                                                                                                                                              |
| Review checks           | Reject approximate/DOM anchors, silent text-based reattachment, collapsing overlaps, color-only highlights, selection callbacks on pointer movement, annotation-driven parsing, automatic floating selection popovers, plugin-selected action placement, obstruction of the native copy/paste menu, or product-specific diff/thread storage semantics.                                                                                                                                                                                                              |
| Governing rules         | [`component:Markdown`](../../Markdown.spec.md); [`spec:AST-036`](../../../../../../docs/specs/AST-036/spec.md); [`architecture:public-component-api`](../../../../../../docs/architecture/public-component-api.md); [AST-002 FR10 — Every supported state is independently correct](../../../../../../docs/specs/AST-002/spec.md); [AST-002 FR15 — Invalid states are prevented where practical](../../../../../../docs/specs/AST-002/spec.md); [AST-002 FR18 — Public primitives support composition intentionally](../../../../../../docs/specs/AST-002/spec.md). |

This table is a review projection; the body below is authoritative.

## Intent

`useMarkdownAnnotations` is the colocated live-state Markdown plugin for ordinary
source-range comments and highlights. It owns exact source anchoring, existing
highlight rendering, overlap identity/accessibility, stable selection requests,
streaming stability, and stale handling. The host owns action placement,
permissions, storage, posting, and thread lifecycle.

Consumer signatures and usage reference belong in the eventual
`useMarkdownAnnotations.doc.mjs`; this draft owns behavior and evidence only.

## Compatibility and migration

- Released default preserved: `yes`; the hook is opt-in.
- Compatibility class: additive live `decorations` module under AST-036.
- Migration decision: product annotation implementations may adopt after the module
  ships; no automatic migration is promised.
- UI decision: no default custom selection popover or action surface.

## Ownership boundary

**Owns**

- The `useMarkdownAnnotations` hook and its live decorations plugin entry.
- Document/revision/source-range identity, edit mapping, highlight segmentation,
  overlap order/hit testing, stable selection events, stale status, and streaming
  readiness.
- Existing highlight visuals, non-color identity, accessible overlap traversal, and
  module-specific browser/performance evidence.

**Does not own / non-goals**

- Shared plugin phase/order, identity, indexing, or zero-plugin behavior — owned by
  AST-036.
- Annotation permissions, persistence, posting, resolution workflow, or product
  thread models.
- Action-surface placement. Hosts may use a toolbar, side panel, or mobile bottom
  sheet.
- Semantic line/version anchors inside charts or interactive diffs.
- Arbitrary AST/DOM mutation, text-only silent reattachment, or a floating selection
  popover enabled by default.

## Public API and concepts

```ts
export interface MarkdownDocumentIdentity {
  readonly id: string;
  readonly revision: string;
}

export interface MarkdownAnnotation extends MarkdownDecorationContribution {
  readonly revision: string;
  readonly data: MarkdownPluginData;
}

export interface MarkdownEditMap {
  readonly fromRevision: string;
  readonly toRevision: string;
  readonly mapRange: (range: SourceRange) => SourceRange | null;
}

export interface MarkdownSourceSelection {
  readonly document: MarkdownDocumentIdentity;
  readonly range: SourceRange;
  readonly isFinal: true;
}

export interface MarkdownStaleAnnotation {
  readonly id: string;
  readonly revision: string;
  readonly reason: 'revision-mismatch' | 'mapping-failed' | 'out-of-range';
}

export interface UseMarkdownAnnotationsConfig {
  readonly document: MarkdownDocumentIdentity;
  readonly annotations: readonly MarkdownAnnotation[];
  readonly editMap?: MarkdownEditMap;
  readonly onSelectionChange?: (
    selection: MarkdownSourceSelection | null,
  ) => void;
  readonly onStaleAnnotationsChange?: (
    stale: readonly MarkdownStaleAnnotation[],
  ) => void;
}
```

The final names may be simplified during implementation if the emitted contract
preserves these responsibilities. The hook returns a stable `MarkdownPluginEntry`
with no `syntax` or `parseKey`; its live annotation values and callbacks update only
the decorations phase.

## Behavioral contract

| ID   | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                         | Evidence state                           |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| FR1  | Every annotation has a stable ID, document ID, source revision, and valid UTF-16 range. Duplicate IDs or out-of-source ranges fail validation.                                                                                                                                                                                                                                                                                    | Type/runtime evidence pending.           |
| FR2  | Core segments rendered built-in text at the union of valid annotation boundaries, preserves authored content in Core-owned noninteractive wrappers, and paints each annotation's constrained `visual` through Astryx tokens. The hook supplies no React segment renderer, DOM node, authored children, or AST mutation hook.                                                                                                      | DOM/source mapping evidence pending.     |
| FR3  | Array position is contribution order. Overlaps remain separate and layer by plugin order, annotation array order, then stable ID. Core hit testing and accessible traversal expose every overlap in that deterministic order; one annotation never erases another.                                                                                                                                                                | Overlap evidence pending.                |
| FR4  | Highlight identity is not color-only. Existing highlights and thread/list entries have accessible names; keyboard users can reach every overlap; markup does not create nested interaction inside authored links.                                                                                                                                                                                                                 | Accessibility evidence pending.          |
| FR5  | Core emits a selection only when rendered-to-source mapping is stable and final. An unstable streamed suffix is not selectable for annotation. Settled earlier ranges remain selectable while later source streams.                                                                                                                                                                                                               | Streaming/browser evidence pending.      |
| FR6  | `onSelectionChange` fires at most once for each stable selection-state transition and once with `null` when it clears; it does not fire for every pointer/touch movement. Each non-null event carries exact document identity, revision, range, and `isFinal: true`.                                                                                                                                                              | Event-bound evidence pending.            |
| FR7  | The hook never automatically opens a floating selection popover or chooses an action surface. Normal browser selection/copy and native selection UI remain unobstructed over annotated and unannotated prose.                                                                                                                                                                                                                     | Mobile/desktop browser evidence pending. |
| FR8  | The host may route a selection request to an existing toolbar, side panel, or mobile bottom sheet. Optional plugin chrome, if later offered, is off by default, explicitly host-selected, and cannot overlap the selected text or native selection menu.                                                                                                                                                                          | Composition evidence pending.            |
| FR9  | Adding, removing, resolving, or changing an annotation, permission callback, selection handler, or host action state reruns only decoration resolution/rendering. It does not change parse identity, rebuild AST, or remount unaffected syntax/fence output.                                                                                                                                                                      | Cache/remount evidence pending.          |
| FR10 | If an authoritative edit map covers the exact old/new revisions, Core maps each range or marks it stale when mapping fails. Without such a map, revision mismatch is stale. Exact/context matching may produce an explicit suggestion but never silently reattaches. `onStaleAnnotationsChange` exposes the stable stale-ID/revision/reason set to the host at most once per changed document/revision/annotation/edit-map input. | Revision evidence pending.               |
| FR11 | Product-specific semantic anchors, permissions, storage, posting, and thread lifecycle remain with the host or owning product renderer. This module carries opaque annotation data only.                                                                                                                                                                                                                                          | Ownership review pending.                |

### Streaming and source authority

- Stable settled-prefix ranges may render/interact before document finalization.
- A range touching unstable source is withheld or noninteractive until its mapping is
  final; finalization publishes it without reparsing settled content.
- Source edits never mutate annotation identity silently. Stale state remains visible
  to the host for resolution.

### Performance and resources

- Live annotation changes do not parse and do not remount unaffected Markdown.
- Segmentation work scales with rendered source plus sorted valid boundaries, not
  every annotation times every rendered character.
- Stable annotation/config identity avoids rebuilding the decorations index on
  unrelated host renders.
- Selection events are transition-bounded, not pointer-move streams.

## Accessibility contract

- Highlights provide non-color identity and meet forced-colors/high-contrast needs.
- Every overlap is discoverable through a keyboard-operable accessible list/thread
  surface even when visual layers occupy the same text.
- Browser selection, copy, and the native selection menu remain usable.
- Host action UI preserves focus and is outside this plugin's default rendering.
- Reduced-motion behavior applies to any highlight/state transition.

## Design relationships

| Anatomy or state    | Design requirement                                                                                     | Representation authority                                    | Module contract |
| ------------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- | --------------- |
| Highlight segment   | Preserves authored content while selecting a constrained non-color annotation visual that Core paints. | This module supplies visual data; Core owns segment wrapper | FR2–FR4         |
| Overlap target      | Exposes every annotation in deterministic order.                                                       | This module and Core hit testing                            | FR3–FR4         |
| Native selection    | Remains unobstructed; no default custom popover competes with browser UI.                              | Browser plus host                                           | FR5–FR8         |
| Host action surface | Toolbar, side panel, or bottom sheet chosen by the host.                                               | Product host                                                | FR7–FR8, FR11   |

No direct Markdown theme target or plugin-selected action placement is introduced by
this draft.

## Parent and system relationships

- AST-036 owns the shared decorations phase, plugin identity, indexing, and live
  no-reparse boundary.
- `component:Markdown` owns built-in rendered structure and source-range mapping.
- This module owns the annotation behavior above; the host owns workflows/actions.

## Verification map

| Contract   | Required evidence                                                | Representative states                                                                                   | Failure signal                                                                                                 |
| ---------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| FR1–FR3    | Type/runtime validation and exact source-segmentation tests      | valid/invalid/duplicate; nested formatting/link; disjoint/nested/crossing overlaps                      | Invalid anchors render, authored content changes, link markup breaks, or overlap order is unstable.            |
| FR4        | Axe, keyboard, forced-colors, and assistive-technology evidence  | single/multiple overlap; color modes; authored link                                                     | Identity is color-only, an overlap is unreachable/unnamed, or nested interaction appears.                      |
| FR5–FR6    | Streaming and selection event instrumentation                    | settled prefix; unstable tail; finalization; drag/touch selection; clear                                | Approximate/unstable ranges emit, pointer movement floods callbacks, or final mapping reparses settled source. |
| FR7–FR8    | Real mobile/desktop browser selection and host-composition suite | annotated/unannotated prose; native copy/paste menu; toolbar; side panel; bottom sheet; optional chrome | A custom overlay competes with native UI, copy/selection is blocked, or plugin chooses action placement.       |
| FR9        | Parse/remount instrumentation                                    | add/remove/update/resolve; permission/callback/action change                                            | Annotation state changes parse identity, rebuild AST, or remount unaffected output.                            |
| FR10–FR11  | Revision/edit-map/stale and ownership tests                      | mapped edit; failed map; no map; exact/context suggestion; product-specific diff                        | Anchor silently moves, mismatch renders as current, or product workflow semantics enter the generic module.    |
| Structural | `pnpm check:knowledge` and parent backlink                       | canonical colocated module/public name                                                                  | Module is orphaned, misnamed, or duplicated.                                                                   |

## Decision log

### DEC-1 — Emit stable source selections; do not choose an action surface

**Reference:** `module:Markdown/useMarkdownAnnotations/DEC-1`
**Direction owner:** `cixzhang`, `2026-09-13`; exact-head approval pending

The hook renders existing highlights and emits bounded exact stable-selection
requests. Hosts choose toolbar, side-panel, or bottom-sheet actions. The plugin does
not open a selection popover by default.

Rejected: custom floating UI under the browser's native copy/paste menu, plugin-owned
action placement, or unbounded pointer/touch selection events.

### DEC-2 — Preserve source/revision authority

**Reference:** `module:Markdown/useMarkdownAnnotations/DEC-2`
**Direction owner:** `cixzhang`, `2026-09-13`; exact-head approval pending

Annotations retain stable IDs and exact UTF-16 ranges at a document revision.
Authoritative edit mapping may move them; otherwise revision mismatch is stale and
text/context matching is suggestion-only.

Rejected: DOM anchors, approximate unstable ranges, arbitrary AST mutation, or
silent text-based reattachment.

## Open questions

None. The module remains draft and unimplemented pending exact-head approval.

## Content boundary

This record does not duplicate shared plugin pipeline/types, host workflow/storage,
consumer reference tables, or implementation architecture. Those stay with
AST-036, the host, eventual `.doc.mjs`, and implementation evidence.
