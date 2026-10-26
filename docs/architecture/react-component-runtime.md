---
schema_version: 1
template_version: 1
kind: architecture
id: architecture:react-component-runtime
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-10-24
owners: [cixzhang]
applies_to: [packages/core/src/, packages/lab/src/]
verified_by:
  [
    packages/core/src/Layer/useLayer.test.tsx,
    packages/core/src/utils/sharedResizeObserver.test.ts,
  ]
deciding_specs: [spec:AST-086/DEC-2, spec:AST-099/DEC-1]
---

# React component runtime architecture

<!-- review-applicability:v1 -->

```json
{
  "scope": "global",
  "triggers": {
    "react-runtime": [
      "INV1",
      "INV2",
      "INV3",
      "INV4",
      "INV5",
      "INV6",
      "INV8",
      "INV10",
      "INV11"
    ]
  }
}
```

## Purpose

Astryx components should preserve their documented behavior through render,
interaction, node replacement, lifecycle replay, and unmount. This record assigns
shared runtime roles to render, handlers, refs, Effects, external resources, and
private behavior seams.

It defines correctness and ownership boundaries. It does not ban React features or
require one implementation pattern whenever several preserve the same contract.

## System model

A component runtime has four distinct roles:

1. **Render derives output.** Props, state, and context determine current rendered
   semantics.
2. **Handlers process discrete intent.** Pointer, keyboard, handle, and other
   commands perform the work caused by one action.
3. **Refs retain non-rendering mutable data.** Refs may hold DOM nodes, resources,
   latest values, or other coordination data that does not itself drive output.
4. **Effects synchronize external systems.** Effects connect React state to
   browser APIs, subscriptions, timers, observers, network activity, and other
   systems whose lifetimes are outside render.

Component and family contracts continue to own public state semantics, controlled
and optimistic behavior, focus, announcements, gestures, and other user-facing
outcomes. This record owns only the shared React lifecycle boundary used to fulfill
those contracts.

## Boundaries and invariants

- **INV1 — Render starts from a valid state.** Rendered output MUST derive from
  current props, state, and context. A component MUST NOT render a known-wrong
  initial state and repair it in a follow-up Effect. State stores information that
  cannot be derived during render or directly from the current interaction. DOM
  nodes and whole DOM collections MUST NOT be stored in React state; store only the
  minimal rendering key or own the node through a ref.
- **INV2 — Discrete intent stays discrete.** Work caused by one user or imperative
  action MUST NOT be deferred to an Effect when the originating handler can perform
  it, including calling a consumer callback such as `onChange`, `onOpenChange`, or
  `onSave`: the callback fires from the handler that caused the change, never from
  an Effect reacting to the resulting state. Using the same state for rendered
  output does not make an Effect-owned copy of the action valid. Deferral MUST NOT
  delay, repeat, or couple the action to unrelated rendering.
- **INV3 — Effects synchronize external systems.** A new or changed Effect MUST
  name the external system it synchronizes. When setup acquires, installs, or
  starts a resource, cleanup MUST release that resource. Synchronization that
  acquires no resource MUST instead be idempotent and safe under dependency
  changes, node replacement, unmount, and StrictMode replay. Ordinary rerender
  synchronization MUST NOT duplicate consumer-visible callbacks or other one-time
  work.
- **INV4 — Mutable refs do not become hidden rendered state.** Refs MAY hold general
  non-rendering mutable data. A ref mutation MUST NOT be the sole source for a value
  later read to produce React-rendered output. A callback ref MAY synchronously
  update an owned DOM node when that DOM update is itself the observable operation
  and attach, detach, replacement, and consumer override behavior preserve the
  current contract. Ref-backed coordination MUST preserve the current component,
  family, accessibility, and API contracts.
- **INV5 — Resource ownership is complete.** Every listener, timer, animation frame,
  observer, request, subscription, and imperative browser resource has one declared
  lifecycle owner. Component- or node-owned resources are removed, aborted, or
  released when disabled, replaced, or unmounted. A document-owned singleton MAY
  persist across consumer gaps when current authority names that lifetime and
  tests prove one shared installation. A persistent singleton without current
  authority is an authority gap, not by itself proof of an implementation leak.
  Optional behavior SHOULD acquire local resources only while enabled.
- **INV6 — Node replacement is a lifecycle event.** A callback ref or other node
  owner handles attachment, `null` detachment, and replacement with another node.
  Cleanup for the old node completes before the new node becomes the active owner.
- **INV7 — Observation preserves one semantic owner.** When JavaScript behavior
  genuinely needs browser geometry, observation stores only the minimal React
  state needed for that behavior and follows INV5–INV6. A repeated row, item, or
  cell path MUST NOT create unbounded observer fan-out when one shared owner can
  provide the same browser fact.
- **INV8 — Behavior stays with its stable lifecycle owner.** Current component,
  family, interaction, and layer authority identifies the behavior owner and the
  documented replacement/composition seams; this record does not choose a new
  owner. A state machine, gesture, timing protocol, or interaction algorithm is
  owned by the component or primitive whose lifetime spans every documented
  replacement and composition seam. Replacing a render prop, slot, child, or
  visual subpart MUST NOT silently remove owner behavior. Internal hook or utility
  extraction is not required by this invariant.
- **INV9 — Broadcast identity follows the broadcast contract.** Context values and
  external-store snapshots MUST NOT change identity while the semantic broadcast
  payload is unchanged when that change would broadcast work to consumers. Public
  hook-result identity remains owned by `architecture:public-component-api` and
  the hook's current contract. Ordinary local objects and callbacks have no shared
  identity promise.
- **INV10 — Own-content announcements live in one module.** In
  `@astryxdesign/core`, announcing a component's own rendered content
  (`spec:AST-086` FR11) is done by one shared internal module, which is not
  exported; making it public needs `spec:AST-002` admission. Packages outside
  core cannot import it and keep one well-behaved Effect per adopter. Core
  adopting components hold no Effect, observer, timer, or
  listener of their own to detect page load, read rendered text, or write that
  announcement. The module follows INV3 and INV5.
- **INV11 — The on-screen keyboard has one owner.** In `@astryxdesign/core`,
  one shared internal hook in the keyboard module (`packages/core/src/keyboard/`)
  measures the on-screen keyboard, keeps the page
  from panning on focus, and dismisses the keyboard when a surface moves
  (`spec:AST-099`); it is not exported. The keyboard height and each keyboard
  change's transition (start time, resting value, curve) reach styles only as
  the hook's value and live only in the hook: each consumer applies them
  through a StyleX functional style on its own element, and no CSS custom
  property on the document root or a shared ancestor carries them. No Core
  component keeps its own visual-viewport listener for the keyboard. The hook
  publishes each keyboard change as one transition: a start time, a resting
  value, and a curve. Every Core consumer that rides the keyboard rides that
  transition with compositor animations, a translate to the resting value,
  never JavaScript per frame, and the hook makes at most one layout read per
  keyboard change. A component outside Core does not ride; it commits the
  resting value once. Packages outside Core cannot import the hook; a
  component there that responds to the keyboard keeps one listener that
  measures as `spec:AST-099` FR2 defines, keeps focus from panning as FR4
  does, blurs as FR5 does, applies the height through a functional style on
  its own elements, and follows INV3 and INV5. The hook follows INV3 and
  INV5.
- **INV12 — Size changes inside a container have one module.** When something inside an area changes
  size, the changed element animates itself using timing the area provides,
  and the content after it follows in step instead of jumping. The
  measuring, the walk, and the translate all live inside one internal module;
  the public hook only marks the area where the walk stops, and the internal
  `reportLayoutChange` only tells the module that a size is about to change. In
  `@astryxdesign/core`, the module animates the layout shift around any
  element whose size changes inside a container: a disclosure opening, content
  loading in, a message appearing, an item inserted or removed. It measures the
  layout before and after the change and moves the shifted content with a
  compositor-only translate from its old place to its new one, played through
  the shared rectangle morph (`architecture:layer-runtime` INV15;
  `spec:AST-094` FR5); it never animates height, which lays out every frame.
  An area is any container element registered by ref: ScrollableArea
  registers its scrolling element itself, and an app registers its own scroll
  container or panel with `useAnimatedLayout(containerRef)`. An element whose
  size changes reports the change, around its commit, to its nearest
  registered ancestor area. From that element, the module walks up each
  ancestor to the area: at every level, each following in-flow sibling moves
  by the distance layout moved it, measured before and after. The walk visits
  only the following element siblings at each ancestor level, through
  `parentElement` and `nextElementSibling`, never descending into a subtree,
  so its cost grows with depth plus following siblings and it needs no
  TreeWalker, which visits subtrees and text nodes. It stops at the area and
  never passes it, so content outside the area takes its final place at once.
  The walk only collects candidates; an element moves only when its layout
  rectangle changed between the two measurements and it intersects the
  area's visible part, so the setup cost is bounded by what the person can
  see. Which elements move is listed under Size-change coverage below. The module owns the shared timing: `reportLayoutChange(ref)` returns the
  motion to use, a spring or a duration and curve, taken from the area's
  generic theme motion role (`spec:AST-094` FR4) with Reduce Motion already
  applied. The changed element plays its own animation, entering, exiting, or
  resizing, with that motion, so it decides what animates, and the module
  moves only the content after it, starting on the same frame with the same
  motion. The timing is themeable in the motion role, never per component. Shifted
  content may mix Astryx components and plain app elements, and none of it
  opts in. Several changes, nested or not, compose without wrappers: changes
  in one area in the same frame are measured together before and after, so
  each element moves once, by its total change. Each moving element is one
  the page already renders, so the module adds no elements
  (`architecture:component-style-authoring` INV7). Under Reduce Motion,
  shifted content changes as `design:reduced-motion` DR1–DR3 require: a
  cross-fade under a coarse primary pointer, an immediate change otherwise.
  The glide applies under every pointer, a mouse included: it fixes a layout
  jump that people using a fine pointer see too, not a touch gesture, so it is
  a named fine-pointer change under `spec:AST-017` FR59, and its adopting pull
  requests show fine-pointer evidence before and after. The container area,
  the bounded walk, the changed-and-visible rule, every-pointer scope, the
  area's shared timing, and the name `useAnimatedLayout` are decided by
  `cixzhang`, 2026-10-25. TreeList
  and Collapsible adopt the module first, and any Core component whose size
  changes in place uses it rather than its own layout animation.
  `useAnimatedLayout` is the one public piece: it takes the container's ref
  and returns nothing, because which container scopes the motion is the
  caller's intent (`spec:AST-002` FR1), and no other API does that job.
  `reportLayoutChange` stays internal. Its documentation reads: "When
  something inside this area changes size, the changed element animates
  itself using timing this area provides, and the content after it follows in
  step. Fixed and sticky elements stay put, Reduce Motion is
  respected, ScrollableArea applies it automatically, and List rows use the
  same module."

  Usage:

  ```tsx
  // Public: an app container opts in as a boundary. ScrollableArea does this itself.
  const panelRef = useRef(null);
  useAnimatedLayout(panelRef);
  <div ref={panelRef}>
    <TreeList items={items} />
    <p>Notes</p>
  </div>;

  // Internal: an element whose size changes measures before its commit; the module
  // returns the area's motion, and the element plays its own animation with it.
  const change = reportLayoutChange(groupRef);
  const toggle = () => {
    change.measureBefore();
    setExpanded(open => !open);
  };
  useLayoutEffect(() => {
    const motion = change.animate();
    playOwnExpand(groupRef.current, motion);
  }, [expanded]);
  ```

### Size-change coverage

What INV12 moves inside an area, each case with its test:

| Case                                                                                        | Behavior                                                                                           | Test                                                                 |
| ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Normal-flow block siblings after the changed element, at each ancestor level up to the area | Moves when its rectangle changed                                                                   | Nested changed element with block siblings at three levels           |
| An element with `display: contents`                                                         | Has no box; its children are taken in its place                                                    | A following `display: contents` wrapper with two children            |
| Absolutely positioned or fixed elements                                                     | Skipped and take their final place; an absolute child of a moving element rides with it            | One of each, plus an absolute badge on a moving row                  |
| Sticky elements                                                                             | In flow while unstuck, so moves when its rectangle changed; a stuck element takes its final place  | A sticky header above and below its stuck point                      |
| Floats                                                                                      | Moves when its rectangle changed                                                                   | A float after the changed element                                    |
| Flex and grid items after the changed element, including wrap and row direction             | Moves when its rectangle changed                                                                   | A wrapping flex row and a row-direction neighbor that does not shift |
| Hidden, `display: none`, or zero-size elements                                              | Skipped                                                                                            | One of each after the changed element                                |
| Changed elements outside the area's visible part                                            | Take their final place without animation                                                           | A long list with changed rows above and below the fold               |
| Elements under a scaled or transformed ancestor                                             | Moves by its layout change, corrected for the ancestor's scale                                     | A moving row inside a scaled panel                                   |
| Portals and top-layer content                                                               | Never moved                                                                                        | A popover open from a following row                                  |
| Elements already moving                                                                     | Keep their running motion and add the new move to it                                               | Two changes 100 ms apart                                             |
| Nested registered areas                                                                     | The change stops at its nearest registered area; an inner area moves as one unit of the outer walk | An area inside an area, changed in the inner one                     |

Out of coverage, each taking its final place at once:

- content outside the area, and content in another document or an iframe;
- inline text and other non-replaced inline content, which cannot take a
  transform;
- flex or grid items earlier in the DOM that `order` places after the change,
  since the walk visits only following siblings;
- text reflowing inside a paragraph beside a float;
- elements the app moves itself with its own transforms;
- an anchored popover tied to a moving element, which layer anchoring keeps
  in place (`architecture:layer-runtime`).

## Authoring guidance

The following are preferred techniques, not independent compatibility promises:

- The size-change hook's documentation states what callers ask about: the
  changed element animates itself with timing the area provides and the module
  moves only content after it, in step; fixed elements and stuck sticky elements stay put;
  Reduce Motion is handled; List rows use the same module; nesting stops at
  the nearest area, so nothing animates twice; and the scroll position is
  kept.
- Use an Effect Event when an external-system Effect needs a stable callback that
  reads the latest props or state without making those reads reactive. Do not use
  an Effect Event to hide a value whose change should resynchronize the system.
- Keep callback refs reference-stable when practical so React does not detach and
  reattach an unchanged node solely because the callback identity changed.
- Prefer CSS for presentational responsiveness. Style authoring owns when container
  queries, media queries, structural selectors, and other CSS mechanisms replace
  JavaScript observation.
- Reuse Astryx's shared observer owner when it supplies the required browser fact.
  Tooling owns the required import and enforcement; INV7 owns the runtime outcome.
- Give a separately nameable state machine, gesture, timing protocol, or
  interaction algorithm a private hook or pure utility when that creates a useful
  focused test seam. Small behavior inseparable from rendering may remain inline;
  do not extract a hook per callback.
- Do not add memoization ceremony without a measured broadcast boundary or a
  current identity contract.

Violating guidance becomes an architecture violation only when it crosses an
invariant above or another current owner.

## Controlled and optimistic state

`architecture:public-component-api`, component records, and family records own
controlled, uncontrolled, and optimistic semantics.

The runtime implementation MUST preserve that current owner:

- a controlled prop is not casually mirrored into a second source of truth;
- a separately named optimistic or pending value follows its current owner's
  applicable settlement and lifetime contract; undefined branches remain with that
  owner;
- callbacks distinguish requested intent from owner-accepted state; and
- whether controlled and uncontrolled ownership may switch after mount remains
  component-owned unless current shared authority says otherwise.

## DOM and imperative API boundary

React state owns rendered semantics. DOM reads are limited to browser-owned facts
such as geometry, focus, selection, event boundaries, native dialog or popover
state, and pointer capture, plus imperative browser operations on an owned node.
Component and API authority owns any narrower composition or introspection rule.

`architecture:public-component-api` also owns public ref admission and naming. A
component may expose both of these distinct surfaces when that authority admits
them:

- `ref` for the documented primary DOM element and its native capabilities; and
- `handleRef` for a component-defined semantic imperative API implemented with
  `useImperativeHandle`.

This runtime record requires only that either surface preserve lifecycle ownership
and current controlled-state semantics. It does not admit a handle, require handle
identity, or decide its members.

## Audit-row routing

This record supplies shared authority for:

- **C5, C6:** derived state and ref-backed hidden state through INV1 and INV4;
- **C19:** complete external-resource cleanup through INV5–INV6; and
- durable runtime outcomes from **C1, C9, C10, C16, C22** through INV1–INV3,
  INV5, and INV8.

It supplies a narrow runtime mechanism boundary informed by **C7–C8** through
INV7, while style authoring and tooling own CSS preference, the shared observer
API, and mechanical enforcement.

Other rows keep their canonical owners:

- **C2, C13:** public API, controlled semantics, public hook identity, and public
  ref/handle contracts belong to `architecture:public-component-api`, families,
  and component records;
- **C3, C17:** focus, announcements, analytics semantics, and focus-preserving
  visibility belong to accessibility, interaction, family, and component records;
- **C4, C11, C18, C21:** callback-ref preference, ref-read purity,
  presentational-component classification, and comment quality remain lint or
  contributor guidance unless a concrete invariant above is violated;
- **C12:** the applicable accessibility, layer, interaction, family, or component
  owner decides which existing primitive must be composed;
- **C14:** this record defines the React/DOM state boundary, while public
  composition and child introspection remain API/component-owned;
- **C15:** each registry or data source keeps its own canonical owner; and
- **C20:** numeric provenance belongs to style, token, component, or interaction
  authority according to the value's purpose.

## Change coupling

Focused runtime review triggers when a change adds or alters:

- an Effect, state mirror, ref mutation, or callback ref;
- a listener, timer, observer, request, subscription, or imperative browser
  resource;
- controlled or optimistic reconciliation mechanics;
- context or external-store broadcast identity; or
- ownership, lifetime, or observable behavior of a state machine, gesture, timing
  protocol, or interaction algorithm.

Review covers initial render, update, interruption, cleanup, node replacement,
unmount, and StrictMode replay where applicable. It also verifies representative
unchanged behavior through the current component, family, API, and accessibility
contracts.

## Owning code

- `packages/core/src/` — stable Core component and hook runtimes.
- `packages/lab/src/` — experimental component runtimes using the same lifecycle
  correctness boundary without receiving stable public API status.
- `packages/core/src/utils/sharedResizeObserver.ts` — current shared Core resize
  observation mechanism; tooling and utility tests own its concrete API.

## Deciding specs

- `spec:AST-086/DEC-2` — own-content announcements behave the same in every
  component that announces its own rendered content (INV10).
- `spec:AST-099/DEC-1` — one keyboard height for every component, kept
  internal and applied through functional styles (INV11).

Component, family, API, accessibility, layer, interaction, and style records
remain authoritative for the other user-facing outcomes delegated above.

## Verification

Lint and focused tests are one-way evidence. A lint failure means the construct
violates the invariant that rule enforces. A passing lint run does not prove the
full runtime contract because many ownership, lifecycle, composition, and
observable-behavior predicates require review or runtime evidence. Likewise, a
focused test proves only its named behavior and mutation expectation; a green
component suite is not blanket conformance with every invariant.

| Invariant           | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                       | Failure signal                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| INV1–INV2           | Initial-render and interaction tests                                                                                                                                                                                                                                                                                                                                                                                           | Output flashes a known-wrong state, or one action is delayed or repeated through an Effect                                                                                                                                                                                                                                                                                                                             |
| INV3, INV5          | StrictMode setup/cleanup and dependency-change tests                                                                                                                                                                                                                                                                                                                                                                           | Duplicate callback, leaked work, stale subscription, or missing resynchronization                                                                                                                                                                                                                                                                                                                                      |
| INV1, INV4, INV6    | Ref attach/null/replacement, DOM-in-state rejection, and old-node cleanup-before-new-attach mutations                                                                                                                                                                                                                                                                                                                          | A DOM node or collection enters state, old node remains active, cleanup misses replacement, or ref mutation changes semantics silently                                                                                                                                                                                                                                                                                 |
| INV7                | Real-browser geometry plus N-consumer observer-instance/subscription mutations                                                                                                                                                                                                                                                                                                                                                 | Geometry is invalid, observer instances grow with repeated consumers, one unsubscribe silences peers, or cleanup removes another subscriber                                                                                                                                                                                                                                                                            |
| INV8                | Owner-observable behavior across documented composition replacement; optional focused internal mechanism tests                                                                                                                                                                                                                                                                                                                 | Behavior disappears or changes owner when a documented subpart is replaced                                                                                                                                                                                                                                                                                                                                             |
| INV9                | Provider/external-store identity and render-count tests                                                                                                                                                                                                                                                                                                                                                                        | Unchanged semantic payload changes identity, or snapshot identity creates a render loop                                                                                                                                                                                                                                                                                                                                |
| INV10               | Shared test over every adopter of the announcement module                                                                                                                                                                                                                                                                                                                                                                      | An adopter holding its own Effect, observer, timer, or listener for its own-content announcement                                                                                                                                                                                                                                                                                                                       |
| INV11               | Source boundary check plus hook tests across StrictMode replay and unmount                                                                                                                                                                                                                                                                                                                                                     | A second keyboard listener or measurement in Core; a consumer reading a CSS custom property on the root or a shared ancestor for the height; an export of the hook; a component outside Core measuring by a rule other than AST-099 FR2, or riding the keyboard; a listener left after unmount; a Core rider driven by JavaScript per frame or by its own transition; or more than one layout read per keyboard change |
| INV12 (proposed)    | Real-browser tests on a throttled phone profile plus a source boundary check, over a disclosure and an inserted item nested several levels inside a parent with following siblings at each level, mixed Astryx and plain elements, a fixed element, an unstuck sticky header, a nested boundary, content outside the boundary, two disclosures toggled in one frame, a 10-level by 50-sibling tree for cost, and Reduce Motion | A per-frame height or layout, a walk past the boundary, a moved out-of-flow element, a following sibling at any level that jumps, an element moved twice for one frame, an added element, or travel under Reduce Motion fails                                                                                                                                                                                          |
| INV12 coverage      | Real-browser tests, one per Size-change coverage row                                                                                                                                                                                                                                                                                                                                                                           | Any case behaving other than its row says fails                                                                                                                                                                                                                                                                                                                                                                        |
| INV12 timing        | Real-browser frame capture of a changed element and its followers, with and without Reduce Motion, and with a theme overriding the area's motion role                                                                                                                                                                                                                                                                          | The element and its followers starting on different frames or with different durations or curves, a component-specific timing, or Reduce Motion applied to one and not the other, fails                                                                                                                                                                                                                                |
| INV12 pointer scope | Fine-pointer before-and-after evidence on each adopting pull request (`spec:AST-017` FR59), from the demo or a story                                                                                                                                                                                                                                                                                                           | A glide missing under a mouse, or an adopting pull request without fine-pointer evidence, fails                                                                                                                                                                                                                                                                                                                        |
