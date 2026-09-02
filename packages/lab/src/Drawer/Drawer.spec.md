---
schema_version: 3
template_version: 4
kind: component
id: component:Drawer
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [public-api, behavior, theming]
verified_by:
  [packages/lab/src/Drawer/Drawer.test.tsx, scripts/check-knowledge.mjs]
modules: []
families: []
design_specs: []
architecture: [architecture:component-theming-surface]
contributing: []
system_specs: [spec:AST-002]
---

# Drawer component contract

## Intent

Drawer presents caller-provided content in a side panel that overlays the page
instead of reflowing it. This draft records the one local semantic concept the
stack recede adds — a buried drawer's depth, and the geometry that expresses it
— so the public surface it introduces has a canonical owner rather than living
only in a pull request.

It is a draft: it is review context, not policy.

## Compatibility and migration

- Released default preserved: `not yet released` — `@astryxdesign/lab` is
  private and unpublished
- Compatibility class: additive. `hasStackRecede` defaults to `true`, so a
  single drawer, the overwhelmingly common case, is byte-identical; a drawer
  with siblings open on its own edge gains a transform
- Controlled/uncontrolled behavior: unchanged
- Migration decision: none

## Ownership boundary

**Owns**

- The panel's resting geometry and its receded geometry, including the
  transform origin and the buried corner radius.
- The rule that decides which open drawers form one stack.
- `data-stack-depth` on the panel.

**Does not own / non-goals**

- Which drawer Escape closes, and the non-modal z-order. Both are the existing
  chronological registry order and are unchanged by this contract.
- Container-scoped drawers, modality, and scrim paint — proposed separately in
  [#5550](https://github.com/facebook/astryx/pull/5550) and not owned here.
- Caller content inside the panel.

## Public concepts

| Concept                     | Closed values or states | Meaning                                                                  | Availability by variant/orientation/state | Default | Owner              | Stability      | Invalid-value behavior           |
| --------------------------- | ----------------------- | ------------------------------------------------------------------------ | ----------------------------------------- | ------- | ------------------ | -------------- | -------------------------------- |
| `hasStackRecede`            | `true`, `false`         | Whether this drawer recedes when another opens on top of it, on its edge | Any open drawer                           | `true`  | `component:Drawer` | `experimental` | Type-checked boolean             |
| `--drawer-stack-peek`       | Any CSS length          | Distance a buried drawer withdraws from its closing edge, per level      | While buried                              | `40px`  | `component:Drawer` | `experimental` | CSS fallback to the declared var |
| `--drawer-stack-scale-step` | Unitless ratio          | Shrink per level                                                         | While buried                              | `0.04`  | `component:Drawer` | `experimental` | CSS fallback to the declared var |
| `--drawer-stack-min-scale`  | Unitless ratio          | Floor for the cumulative shrink                                          | While buried                              | `0.8`   | `component:Drawer` | `experimental` | CSS fallback to the declared var |
| `data-stack-depth`          | Integer ≥ 1, or absent  | How many drawers are stacked on this drawer's edge above it              | While buried                              | absent  | `component:Drawer` | `experimental` | Emitted, never read              |

`--_drawer-stack-radius` is private under `architecture:component-theming-surface`
INV11 and is not a public concept. See DEC-2.

## Behavioral and layout contract

| ID  | Candidate invariant                                                                                                                                                      | Basis                               | Draft review state |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------- | ------------------ |
| FR1 | A drawer with `n` drawers open above it **on the same `side`** withdraws toward its own closing edge by `n × peek` and scales by `1 − n × step`, floored at `min-scale`. | This change                         | settled            |
| FR2 | Drawers anchored to opposite edges are separate stacks: neither contributes to the other's depth.                                                                        | Review of #5652 (cixzhang)          | settled            |
| FR3 | The transform origin is the drawer's own closing edge, so the shrink reads as withdrawal into the page.                                                                  | This change                         | settled            |
| FR4 | FR1 and FR3 mirror under RTL.                                                                                                                                            | Existing logical-direction standard | settled            |
| FR5 | Closing a drawer returns every drawer below it to the geometry it had at that depth; the unwind is the wind, reversed.                                                   | This change                         | settled            |
| FR6 | `hasStackRecede={false}` holds the panel at rest at any depth. It does not remove the drawer from its stack, so drawers below it still count it.                         | This change                         | settled            |
| FR7 | Changing an open drawer's `side` re-scopes its depth without changing its position in the registry, so Escape still closes the last-opened drawer.                       | This change                         | settled            |

### Allowed variation

- **AV1 — Depth source.** Depth is read from the existing chronological
  registry. Any mechanism producing the same per-edge ordering satisfies FR1.
- **AV2 — Exit overlap.** A closing drawer leaves its stack at the start of its
  exit transition, so the drawer below begins returning while the front panel is
  still sliding out. The overlap is not pinned.

### Representative states

| State                                       | Required invariant                  | Allowed variation |
| ------------------------------------------- | ----------------------------------- | ----------------- |
| One drawer open                             | No transform, no `data-stack-depth` | —                 |
| Three deep on one edge                      | FR1, FR3, FR5                       | AV2               |
| One `start` and one `end` drawer open       | FR2 — both at rest                  | —                 |
| Buried drawer with `hasStackRecede={false}` | FR6                                 | —                 |

### Transformation and precedence order

The recede transform composes after the open/closed slide transform: an open
panel at depth 0 resolves to the identity matrix, and the recede replaces it
while buried. `xstyle` still applies last.

### Performance and resources

The recede is CSS `transform` and `border-radius` only. Depth is an integer read
from module state through `useSyncExternalStore`; no element is measured, so
there is no `ResizeObserver` and no layout read. See DEC-1.

## Accessibility contract

The recede is decorative. It changes no name, role, focus order, or dismissal
behavior, and `data-stack-depth` is not exposed to assistive technology. A
buried drawer stays in the accessibility tree exactly as before this change; a
modal drawer's own `showModal()` semantics are unchanged.

## Design relationships

| Anatomy or state | Design requirement                                                                   | Representation authority | Hierarchy role | Component contract |
| ---------------- | ------------------------------------------------------------------------------------ | ------------------------ | -------------- | ------------------ |
| Panel, buried    | Reads as a layered page behind the one in front, with its leading edge still visible | Current source and tests | Supporting     | FR1–FR6            |

A full consumer anatomy inventory for Drawer is not backfilled here, so this
draft carries no `anatomy-theming:v1` map. That map is optional during
migration, and Lab anatomy backfill is stage two of the theming-surface
migration.

## Family and system relationships

- `architecture:component-theming-surface` owns target qualification and the
  public-variable admission bar (INV10, INV11). Drawer already declares
  `theming.targets`, so it is a capability-participating Lab component under
  INV1 and is **not** exempt.
- `spec:AST-002` owns the public-API admission argument. See the decision log.

## Verification map

| Contract | Verification                                                                                 | Representative states   | Mutation or failure expectation                                               | Audit section        |
| -------- | -------------------------------------------------------------------------------------------- | ----------------------- | ----------------------------------------------------------------------------- | -------------------- |
| FR1, FR5 | `Drawer.test.tsx` "buries each drawer one level deeper", "returns each drawer to rest"       | One, two, three deep    | Counting the whole registry, or not unregistering on close, fails both.       | `audit:Drawer/stack` |
| FR2      | `Drawer.test.tsx` "does not bury a drawer anchored to the opposite edge"                     | `start` beside `end`    | Reverting to a global depth count fails this.                                 | `audit:Drawer/stack` |
| FR6      | `Drawer.test.tsx` "stays at rest with hasStackRecede={false}"                                | Three deep, opted out   | Ignoring the prop fails this.                                                 | `audit:Drawer/stack` |
| FR7      | `Drawer.test.tsx` "keeps Escape on the last-opened drawer when a buried drawer changes edge" | Pair, edge flipped live | Re-registering on `side` change promotes the buried drawer and fails this.    | `audit:Drawer/stack` |
| FR3, FR4 | Chromium measurement of the computed transform, origin and radius                            | Three deep, LTR and RTL | A centre origin or an unmirrored translate is visible in the measured matrix. | `audit:Drawer/paint` |

## Decision log

### DEC-1 — The stack geometry is three public theme variables, not props

Under `spec:AST-002` FR1 the caller must own information the component cannot
derive. How far a stack fans out is **not** per-call information: it is one
resolved design decision for a whole product surface, and a call site that set
it would be tuning the design system from the wrong layer (FR4 — existing
styling seams come first).

It is, however, information a **theme** owns, and a theme has no other way to
reach it: `transform` is outside the guaranteed-property catalog in
`architecture:component-theming-surface`, which explicitly excludes positioning
and sizing, so no guaranteed CSS property can express a translate-and-scale.
That is the INV10 admission: caller-owned (theme-owned) intent that the target's
guaranteed set cannot express. The precedent is `--spinner-diameter`, which is
public for the same reason — its ring is an SVG circle, so no standard property
on the target reaches it.

The three are separate because they are independently chosen: how far to fan out,
how fast to shrink, and where to stop are three answers, and one input carrying
all three would violate FR16.

Rejected alternative: a `stackRecede={{peek, step}}` prop. It puts a system-wide
design decision on every call site and gives two call sites in one product a way
to disagree.

### DEC-2 — The buried corner radius is private

`borderRadius` **is** in the guaranteed catalog, and every other Astryx component
routes a radius through a private `--_*` variable with a `theming.derived` entry
rather than exposing a second public one. A public `--drawer-stack-radius` would
therefore fail the INV10 admission on its face: a guaranteed property already
expresses corner radius.

It cannot simply become a derived `borderRadius` mapping either, because the
drawer's resting radius is `0` — flush with three viewport edges — and only the
buried state is rounded; one mapping cannot carry two values. So the variable
stays, as private `--_drawer-stack-radius`, seeded from the theme's
`--radius-element` token: a theme retuning its radius scale moves it, and nothing
promises more than that.

An earlier revision of this change exposed it publicly. That was wrong on INV10
and is corrected here.

### DEC-3 — One stack per edge

A drawer recedes to say "you are on top of me". Only a drawer that actually
covers it can say that, and two drawers anchored to opposite edges never overlap.
Escape order stays chronological across every open drawer, because "the last
thing I opened" is not an edge-local question. One registry, two orderings, each
answering the question it is for.

## Open questions

- **OQ1 — Do container-scoped drawers need a third scope?** (`human-api`) If
  [#5550](https://github.com/facebook/astryx/pull/5550) lands, two drawers on the
  same edge in _different_ containers will not overlap either, and the stack key
  becomes `(host, side)` rather than `side`. This contract deliberately does not
  pre-build that: there are no containers on `main`, so the code would be
  unreachable and untestable. It is a one-line change to the registry key when
  the capability exists.
- **OQ2 — Should the three variables stay public at promotion?**
  (`human-api`) They are marked `experimental`. Lab is not a stable public
  promise, and promotion is the point at which the admission argument in DEC-1
  should be re-run against real theme demand.

## Content boundary

Consumer syntax, defaults, and examples stay in `Drawer.doc.mjs`. The
guaranteed-property catalog and the admission bar stay in
`architecture:component-theming-surface` and `spec:AST-002`.
