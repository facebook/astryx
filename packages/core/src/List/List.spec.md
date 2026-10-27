---
schema_version: 3
template_version: 5
kind: component
id: component:List
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-09-21
owners: [cixzhang]
review_triggers: [public-api, behavior, layout, theming]
verified_by:
  [
    packages/core/src/List/List.test.tsx,
    packages/core/src/Item/Item.test.tsx,
    packages/core/src/theme/derivedVarRegistry.test.ts,
    packages/core/src/theme/generateThemeRules.test.ts,
    apps/storybook/stories/List.stories.tsx,
    scripts/check-knowledge.mjs,
  ]
modules: []
families: []
design_specs: []
architecture:
  [architecture:container-padding, architecture:public-component-api]
contributing: [contributing:api-conventions]
system_specs:
  [
    spec:AST-002/DEC-1,
    spec:AST-002/DEC-2,
    spec:AST-017/FR4,
    spec:AST-057/FR9,
    spec:AST-094,
    spec:AST-103,
    spec:AST-105,
  ]
---

# List component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                                                               |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | Optional `edge?: 'padded' \| 'flush' \| 'outset' \| 'bleed'`, default `'padded'`. Deprecated `edgeCompensation?: 'inline'` resolves to `'outset'`. Optional `reorderable` takes the object `createReorderable` returns, and ListItem's `itemKey` identifies each row (`spec:AST-103`). |
| Behavior                | One edge treatment applies to every ListItem row and decides where row content and row paint sit relative to the list's edges and the host's padding. With `reorderable`, rows reorder by dragging a handle or through reorder mode (`spec:AST-103` FR3, FR4).                         |
| End-user impact         | Row text can share the line of the list header and a heading above, with row paint stopping at the text, reaching into the host padding, or reaching the host edges.                                                                                                                   |
| Builder impact          | One `edge` choice per list. `flush` works anywhere; `outset` and `bleed` act only inside a host that publishes container padding.                                                                                                                                                      |
| Compatibility/readiness | Additive; omission keeps current geometry; `edgeCompensation` keeps working with a codemod to `edge`. `reorderable` and `itemKey` are additive and stable, specified and not implemented yet; without them nothing changes.                                                            |
| Review checks           | Reject header movement, row paint past the host's padding edge, duplicated padding values, physical-edge logic, automatic opt-in, a ListItem-level edge prop, or a second prop that can contradict `edge`.                                                                             |
| Governing rules         | `architecture:container-padding/INV3`, `INV9–INV11`; `spec:AST-002/DEC-1–DEC-2`; `spec:AST-017/FR4`; `spec:AST-057/FR9`. `spec:AST-103`.                                                                                                                                               |

This table is a review projection; the body below is authoritative.

## Intent

Every ListItem keeps Item's inline inset so hover, press, and selection paint has
room around row content. That inset leaves row text off the line of the List
header, a heading above the list, and the host container's padding. How a
collection resolves that depends on its rows and its host: static rows need no
room around paint, interactive rows do, and a list inside a padded container can
reach into that padding. The caller knows which applies; List cannot derive it
from its rows, and the choice must hold for the whole collection.

## Compatibility and migration

- Released default preserved: `yes`; omission keeps current List and ListItem geometry.
- Compatibility class: additive optional prop; `edgeCompensation` is a deprecated
  alias with the same meaning as `edge="outset"`. Its `@deprecated` type reports
  plain use; development warns only when both props are set, naming
  `astryx upgrade` (`spec:AST-017` FR29–FR29b).
- Controlled/uncontrolled behavior: not applicable.
- Migration decision: `component:List/DEC-3`; an `astryx upgrade` codemod renames
  static `edgeCompensation="inline"` to `edge="outset"`, removes
  `edgeCompensation` beside an `edge` string that no later spread can override,
  and keeps the old prop with a TODO where `edge` is computed, on a dynamic value,
  and where the List also spreads props (`spec:AST-017` FR29c–FR29d). A spread onto a
  List that never writes `edgeCompensation` stays unchanged (`spec:AST-040` FR1);
  the `@deprecated` type reports a typed use where the props are written.

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The collection-wide `edge` treatment and its application to every ListItem row.
- The deprecated `edgeCompensation` alias and its resolution.
- Keeping the optional header in place for every treatment.
- The relationship between row geometry and Item's density- and theme-aware
  inline inset.

**Does not own / non-goals**

- Container padding values, nesting, or overlay resets — owned by
  `architecture:container-padding`.
- A ListItem-level edge prop, per-edge or arbitrary inset values, automatic host
  detection, or block-axis bleed.
- TabList or Button projections.

## Public concepts

| Concept                        | Closed values or states              | Meaning                                                                                                                                          | Availability by variant/orientation/state                                                | Default  | Owner            | Stability  | Invalid-value behavior                       |
| ------------------------------ | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- | -------- | ---------------- | ---------- | -------------------------------------------- |
| Edge treatment                 | `padded`, `flush`, `outset`, `bleed` | Where row content and row paint sit relative to the list's edges and the host's padding                                                          | Every density, marker style, and divider setting; `outset` and `bleed` read host padding | `padded` | `component:List` | accepted   | Other values are rejected by the public type |
| Edge compensation (deprecated) | omitted, `inline`                    | Same as `edge="outset"`                                                                                                                          | As `outset`                                                                              | omitted  | `component:List` | deprecated | Other values are rejected by the public type |
| Animated layout                | absent, a `useAnimatedLayout` handle | Inserted, removed, and moved rows animate, and the rows after a change glide to their new places (FR14)                                          | Every density, marker style, edge treatment, and divider setting                         | absent   | `spec:AST-105`   | proposed   | Other values are rejected by the public type |
| Edit mode                      | `false`, `true`                      | Every row makes room at its leading edge for an editing control, and its trailing content leaves (FR15)                                          | Every density, marker style, edge treatment, and divider setting                         | `false`  | `component:List` | proposed   | Other values are rejected by the public type |
| Editing control                | omitted, `select`                    | The control edit mode shows in each row's leading room: `select` is a selection indicator, checked while the row is selected (FR16)              | Edit mode only; nothing shows outside it                                                 | omitted  | `component:List` | proposed   | Other values are rejected by the public type |
| Reordering                     | absent, a `createReorderable` object | Rows can be reordered by handle, keyboard, and assistive technology; `onReorder` receives the moved row's key and its new index (`spec:AST-103`) | Every density, marker style, edge treatment, and divider setting                         | absent   | `spec:AST-103`   | accepted   | Other values are rejected by the public type |

## Behavioral and layout contract

| ID   | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Basis                                                                                    | Status                                                |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| FR1  | List MUST own `edge` and apply one treatment to every ListItem row, interactive or not; ListItem MUST NOT expose a parallel public prop. A defined `edge` MUST win over `edgeCompensation`, and `edgeCompensation="inline"` with `edge` undefined MUST resolve to `outset`.                                                                                                                                                                                                                                                                                                                                                                                                     | `component:List/DEC-1`, `component:List/DEC-3`                                           | Accepted contract                                     |
| FR2  | `padded` MUST preserve current header, list, and row geometry, apart from FR10's hit target under a coarse pointer. No treatment MAY move the header or change row block padding, gap, markers, start and end content, semantics, or hit target relative to the row box.                                                                                                                                                                                                                                                                                                                                                                                                        | Owner direction                                                                          | Accepted contract                                     |
| FR3  | `flush` MUST resolve each row's inline inset to zero through the private source that supplies Item's applied inline padding, so row content and row paint share the list's inline edges. It reads no host padding. A theme override of row inline padding takes precedence over the zero (FR7).                                                                                                                                                                                                                                                                                                                                                                                 | `component:List/DEC-3`                                                                   | Accepted contract                                     |
| FR4  | `outset` MUST place each row so it reaches past the host content line by the smaller of its own inline inset and the matching host inset, per logical edge, keeping its inset inside. Content reaches the host line when the host inset is at least the row inset.                                                                                                                                                                                                                                                                                                                                                                                                              | `architecture:container-padding/INV9–INV10`; `component:List/DEC-2`                      | Accepted contract                                     |
| FR5  | `bleed` MUST place each row so it reaches the host's padding edge on each logical edge, with square corners. Row content sits on the host content line, or at the row's own inset from its edge when the host inset is smaller. A theme override of row inline padding sets the content's inset instead (FR7).                                                                                                                                                                                                                                                                                                                                                                  | `architecture:container-padding/INV3`; `component:List/DEC-4`                            | Accepted contract                                     |
| FR6  | Missing or reset host inset MUST resolve to zero, so `outset` and `bleed` place content as `padded` does outside a padded host. No row paint MAY reach past the host's padding edge.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | `architecture:container-padding/INV6`, `INV9`                                            | Accepted contract                                     |
| FR7  | Each row's retained inset MUST come from the same private density- and theme-derived source as Item's applied inline padding. A theme `item.paddingInline` override takes precedence over every treatment's row padding, as it does over density. A consumer override of row padding through `xstyle`, `className`, or `style` is outside the alignment guarantee.                                                                                                                                                                                                                                                                                                              | Shared two-owner geometry contract                                                       | Accepted contract                                     |
| FR8  | `outset` and `bleed` are valid only under a host state whose published inline inset matches its applied padding: a visually neutral host, such as a Layout region with explicit padding or a padded ScrollableArea, or the content area of a Card, Section (any variant), Dialog, or BottomSheet. Those hosts bound their padding with a border, background, or clip; FR6 keeps row paint inside the padding edge, so it never covers the border or changes the host's outline. Automatic LayoutContent/LayoutPanel states with a known publication mismatch are not eligible until that gap is fixed, and Drawer's content area is not admitted until it has its own evidence. | `architecture:container-padding/INV8–INV11`; real-browser evidence in each admitted host | Accepted contract                                     |
| FR9  | The list element containing the rows MUST clip in the inline axis with `overflow-inline: clip`, never `hidden`. Under `outset` and `bleed` its inline edges MUST reach the host's padding edge, so the clip never cuts resting row paint and a swiped row paints no further than that edge.                                                                                                                                                                                                                                                                                                                                                                                     | `spec:AST-057/FR9`                                                                       | Verified by `List.test.tsx` and real-browser geometry |
| FR10 | Under a coarse primary pointer (`spec:AST-094` FR13), every ListItem row MUST offer a hit target at least 44 px tall, through its padding or an invisible hit area, with no visual change, where its neighbors leave room: the hit area never overlaps a neighboring row's or control's target, and between close neighbors it is clamped to half the gap; row height and geometry stay as they are at every density. A fine pointer keeps today's hit target.                                                                                                                                                                                                                  | Owner decision, 2026-10-26: no row-height change, a 44 px touch target                   | Accepted contract                                     |
| FR11 | Under a coarse primary pointer (`spec:AST-094` FR13), while a row of a List with `hasDividers` is pressed (FR12) or held (FR13), its own divider and the divider above it MUST NOT paint across its highlight. Both return at the release while the highlight fades, and in the frame the highlight drops when the page takes the touch for a scroll. A fine pointer keeps every divider.                                                                                                                                                                                                                                                                                       | UIKit `UITableView` separators beside a highlighted cell, iOS 26.2                       | Proposed; awaiting an engineering owner's approval    |
| FR12 | Under a coarse primary pointer, an interactive row's press MUST paint through one press layer on the row's `::before`, above its background and below its content, at the cell press strength, and its release MUST fade on the cell release curve on the compositor (`spec:AST-094` FR11). At rest the row's `::before` and stacking are as they were; while the row is pressed or held, the layer replaces a caller's decoration on its `::before`, so decoration that stays through a press belongs on a child.                                                                                                                                                              | `spec:AST-094` FR11, the cell press model                                                | Proposed; awaiting an engineering owner's approval    |
| FR13 | A navigation container MAY keep the row whose activation pushed it selected while the pushed content covers it. The held row's highlight MUST stay at full strength, MUST deselect with the pop's progress (an interactive pop scrubs it), MUST return at once when the pop cancels, and focus MUST return to the row when the pop ends. The hold applies under a coarse primary pointer; with a fine pointer the press releases at the lift.                                                                                                                                                                                                                                   | UIKit table cells under a navigation push, iOS 26.2                                      | Proposed; awaiting an engineering owner's approval    |
| FR14 | List MUST take an `animatedLayout` handle (`spec:AST-105` FR1) and report each row inserted, removed, or moved between renders. With a handle, an inserted row fades in once rows moving past have cleared it, a removed row collapses in place and leaves within one second, a row crossing rows that move the other way rides above them on the list's surface, and the rows after a change glide to their new places (`spec:AST-105` FR3), all on the shared motion role (`spec:AST-105` FR4). Without a handle the list changes at once (`spec:AST-105` FR2). Rows need stable keys.                                                                                        | `spec:AST-105` FR1–FR5; UIKit `UITableView` batch updates, iOS 26.2                      | Proposed; awaiting an engineering owner's approval    |
| FR15 | With `isEditing`, every row MUST make room at its leading edge for an editing control: its content moves inline by the editing indent (40 px) beyond the row's applied inline inset, a theme `item.paddingInline` override included (FR7), and its trailing content leaves. Under a coarse primary pointer, entering and leaving MUST move the content on the list's edit motion role (`spec:AST-094` FR4) and fade the trailing content in place; under a fine pointer the list switches at once. A row's activation and its one tab stop are unchanged.                                                                                                                       | UIKit `UITableView` editing mode, iOS 26.2                                               | Proposed; awaiting an engineering owner's approval    |
| FR16 | `editingControl="select"` MUST show, in edit mode, a selection indicator in each row's leading room, checked while the row is selected, entering and leaving with the row's content (FR15). Activating a row runs its action as outside edit mode, for the caller to toggle its selection, and the row keeps its one tab stop (AR3). The prop's public type is exported as `ListEditingControl`.                                                                                                                                                                                                                                                                                | UIKit multiple selection during editing, iOS 26.2                                        | Proposed; awaiting an engineering owner's approval    |

### Allowed variation

- Density and `item.paddingInline` theme overrides may change the retained inset;
  every treatment follows the same derived value. A theme override of row inline
  padding takes precedence over every treatment, as it does over density.
- Host padding may be uniform, asymmetric, zero, or absent; each logical edge
  resolves independently.
- Labels, descriptions, markers, start/end content, interactivity, and selection
  may vary without changing the collection-wide treatment.
- Under a coarse primary pointer, a row's hit target grows toward 44 px where
  its neighbors leave room (FR10); row geometry and appearance are unchanged.
- Under a fine pointer, rows keep their dividers through a press (FR11) and edit
  mode switches at once (FR15).

### Representative states

| State                                                  | Required invariant                                                                     | Allowed variation                   |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------- | ----------------------------------- |
| `padded` (default)                                     | Header and every row keep current geometry.                                            | Any content, density, or host.      |
| `flush`                                                | Row content and paint share the list's inline edges with the header and divider ends.  | Any host, including none.           |
| `outset`, host inset at least row inset                | Row content reaches the host content line; row paint reaches past it by the row inset. | Uniform or asymmetric host padding. |
| `bleed`, host inset at least row inset                 | Row paint reaches the host's padding edge; row content sits on the host content line.  | Uniform or asymmetric host padding. |
| `outset` or `bleed`, host inset smaller than row inset | Row paint stops at the host's padding edge; content keeps the row inset.               | Either logical edge independently.  |
| `outset` or `bleed`, no host inset                     | Content placed as `padded`; `bleed` rows are square.                                   | Standalone lists and overlays.      |
| LTR or RTL                                             | Logical start/end mapping follows direction.                                           | Writing direction.                  |
| A divided list, a row pressed under a finger           | The row's own divider and the one above it hide; they return as the highlight fades.   | Middle or last row.                 |
| `animatedLayout`, rows change                          | Staying rows move to their new places; a removed row collapses; new rows fade in.      | Reduced motion: the role's policy.  |
| `isEditing`                                            | Content moves by the editing indent beyond the applied inset; trailing content leaves. | Theme `item.paddingInline`.         |
| `isEditing` with `editingControl="select"`             | Each row shows a selection indicator, checked while the row is selected.               | Selected and unselected rows.       |

### Transformation and precedence order

- **ORD1 — Treatment.** Resolve `edge`, else `outset` for `edgeCompensation="inline"`,
  else `padded`.
- **ORD2 — Host bound.** Read the matching published host inset for each logical
  edge, with missing values falling back to zero.
- **ORD3 — Local inset.** Resolve Item's inline inset through the private value
  that supplies applied padding: density sets it, `flush` replaces it with zero,
  and a theme `item.paddingInline` override replaces either.
- **ORD4 — Placement.** Apply the treatment's geometry from those values; then
  compose supported consumer styles without claiming alignment for a consumer
  override of row inline padding.

### Performance and resources

- **PR1 — CSS geometry only.** Every treatment MUST add no measurement, observer,
  listener, state, Effect, or render pass. Deprecation warnings are dev-only.
- **PR2 — Motion only where it applies.** FR11–FR13 and FR15–FR16 add no
  listener, observer, measurement, or animation under a fine pointer; FR14
  measures rows only with a handle, and FR15 only in edit mode. Every motion
  runs on transform and opacity.

## Accessibility contract

- **AR1 — Interaction geometry remains local.** No treatment MAY change the
  interactive element, accessible role/name/state, focus target, or tab order.
- **AR2 — Direction remains logical.** Each treatment MUST produce the mirrored
  geometry under RTL without changing DOM order.
- **AR3 — Edit-mode selection is announced.** With the selection control, each
  row's activation MUST expose the row's selection as a checked state
  (`role="checkbox"` with `aria-checked`), so assistive technology announces it
  as it toggles; the indicator itself MUST be hidden from the accessibility
  tree. Outside edit mode a row's semantics are unchanged.

## Design relationships

| Anatomy or state   | Design requirement                                                                                                                                                                      | Representation authority | Hierarchy role     | Component contract |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | ------------------ | ------------------ |
| Optional header    | Stays on the host content line for every treatment.                                                                                                                                     | `component:List/DEC-1`   | Context            | FR2                |
| ListItem row paint | Stops at the content (`flush`), reaches past it by the row inset (`padded`, `outset`), or reaches the host edge (`bleed`).                                                              | `component:List/DEC-3`   | Supporting surface | FR3–FR6            |
| Row content        | The row's first content (its marker, start content, or label) sits inside the row inset (`padded`) or on the host content line when the host inset allows (`flush`, `outset`, `bleed`). | `component:List/DEC-3`   | Prominent          | FR2–FR5            |

## Family and system relationships

- `architecture:container-padding` owns host publication, eligibility,
  logical-edge semantics, overlay reset, and the shared `edge` vocabulary. List's
  `edge` projects all four values onto both inline edges of every row.
- `architecture:public-component-api`, `spec:AST-002`, and `spec:AST-017` own
  public API admission and the deprecation lifecycle.
- Item remains the implementation owner of row padding and interaction paint;
  List owns only the collection-level treatment and row placement.
- `spec:AST-057` owns swipe actions on `Item` and the rule that the element
  containing swipe-capable rows clips in the inline axis; List carries that clip
  (FR9) and `ListItem` passes `swipeActions` and `swipeBehavior` through to
  `Item` unchanged.
- `spec:AST-094` owns the touch presentation gate (FR13), the press model
  (FR11), and motion roles (FR4); FR11–FR13 and FR15 apply them to list rows.
- `spec:AST-105` owns the animated layout handle and its shared motion; List
  adopts it for row updates (FR14) and owns only its rows' own entering,
  exiting, and crossing.
- A navigation container owns when a push and a pop happen; the selection hold
  (FR13) owns only the held row's highlight and its focus return.
- `spec:AST-103` owns reordering. List is its first adopter: it
  takes the `reorderable` object, a row's key is its `ListItem`'s `itemKey`
  and its position is its index, and the
  handle is the one element reordering adds to a row, at its trailing edge
  (`spec:AST-103` FR5).

## Verification map

| Contract                  | Verification                                                    | Representative states                                                                                                                                                                                                                                                                                                                | Mutation or failure expectation                                                                                                                                                                             | Audit section       |
| ------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| FR1–FR7, FR9              | List, Item, and theme-registry tests                            | every treatment; all densities; static and interactive rows; header; deprecated alias alone and with `edge`; ListItem outside a List                                                                                                                                                                                                 | Removing context propagation, using one host edge for both inline edges, zeroing padding without the shared inset source, or dropping the list's reach or clip fails                                        | `audit:List/layout` |
| FR2–FR6, FR8–FR9, AR1–AR2 | Real-browser List geometry evidence                             | each treatment in a Card at two paddings, a Section, an inline Dialog with and without Layout, a BottomSheet, a padded ScrollableArea scrolling vertically and in both axes, a LayoutContent with explicit padding, and standalone; header and dividers; LTR/RTL; hovered and selected rows; a swiped row under `outset` and `bleed` | Header movement, content off the expected line, paint past the host's padding edge, clipped resting paint, or a changed row box fails                                                                       | `audit:List/visual` |
| FR10                      | List tests of the touch hit target and real-browser hit-testing | every density; a row with a description; compact rows packed closer than 44 px; a row with an end control; a coarse and a fine pointer; a theme row padding                                                                                                                                                                          | A coarse-pointer row whose target stays at its box where its neighbors leave room, a target that reaches a neighboring row's or control's target, a changed row box, or a changed fine-pointer target fails | `audit:List/layout` |
| FR11                      | Real-browser divider evidence under a finger and a mouse        | a middle row and the last row pressed; a press the page takes for a scroll; dark mode; RTL; a mouse                                                                                                                                                                                                                                  | A divider painted across a pressed row's highlight under a finger, or a divider hidden for a mouse, fails                                                                                                   | `audit:List/visual` |
| FR12                      | Item press-layer tests and real-browser pixel evidence          | press, hold, and release; a release while the main thread is blocked; a mouse                                                                                                                                                                                                                                                        | A release that stops while script runs, a layer painted at rest, or a stacking context at rest fails                                                                                                        | `audit:List/visual` |
| FR13, AR1                 | Selection-hold tests and real-browser navigation evidence       | a programmatic pop; an interactive pop, scrubbed and cancelled; reduced motion; a keyboard pop; a mouse                                                                                                                                                                                                                              | A row deselected before the pop, a cancelled pop that leaves the row deselected, or focus not returned to the row fails                                                                                     | `audit:List/visual` |
| FR14                      | List update-motion tests and real-browser frame evidence        | an insert, a removal, and a reorder, with and without a handle; reduced motion; a mouse                                                                                                                                                                                                                                              | A staying row that jumps with a handle, motion without one, a removed row left in place past one second, or layout or paint per frame fails                                                                 | `audit:List/visual` |
| FR15–FR16, AR3            | List edit-mode tests and real-browser evidence                  | entering and leaving; a theme `item.paddingInline` override; selected and unselected rows with the selection control; a screen reader's reading of a row; a mouse                                                                                                                                                                    | Content that does not clear the editing control, a jump with no room made, a lost tab stop, or a selection that assistive technology does not announce fails                                                | `audit:List/layout` |
| Migration                 | `astryx upgrade` codemod tests                                  | static, aliased, already-migrated, dynamic, and computed-`edge` callsites; a second run                                                                                                                                                                                                                                              | A dynamic value or a computed `edge` rewritten, a static one missed, or a second run that changes output fails                                                                                              | `audit:List/docs`   |
| Documentation             | `List.doc.mjs`, Storybook, and `scripts/check-knowledge.mjs`    | public prop, values, default, deprecation, and representative composition                                                                                                                                                                                                                                                            | Missing or stale contract, docs, or example fails                                                                                                                                                           | `audit:List/docs`   |

## Decision log

### DEC-1 — List owns the collection-wide opt-in

**Reference:** `component:List/DEC-1`

**Decider:** cixzhang, 2026-09-21

The List header and ListItem rows otherwise begin on different content lines.
Only the caller knows when the containing composition requires alignment, while
List can apply one consistent decision to every row without exposing Item-level
configuration.

### DEC-2 — Compensation is row-local and bounded

**Reference:** `component:List/DEC-2`

**Decider:** cixzhang, 2026-09-21

Each row cancels no more than its own component-owned inline inset or the
matching host inset. When the host inset is at least the row inset, content
reaches the host content line. When it is smaller, content moves toward that line
without pulling row paint beyond the host boundary.

Rejected: `isFullBleed`, because the row may stop inside the host padding and the
name would promise outer-edge bleed that the component does not provide.

### DEC-3 — One edge prop names every row edge treatment

**Reference:** `component:List/DEC-3`

**Decider:** cixzhang, 2026-10-15

`padded`, `flush`, `outset`, and `bleed` are mutually exclusive answers to one
question, so one closed-value prop carries them and no combination can
contradict. The names are the shared edge vocabulary of
`architecture:container-padding`. `outset` is the bounded compensation of DEC-2;
`edgeCompensation` remains its deprecated alias.

Rejected: separate boolean props beside `edgeCompensation`, because they could
request two treatments at once.

### DEC-4 — Bleed reaches the host edge and keeps content on its padding line

**Reference:** `component:List/DEC-4`

**Decider:** cixzhang, 2026-10-15

`bleed` matches Table rows in a padded host: row paint reaches the host's padding
edge with square corners, and content sits on the host content line, never closer
to the row edge than the row's own inset. It is opt-in, so existing lists keep
their geometry.

Rejected: bleed as the default inside padded hosts, because it would move every
existing list in a container.

### DEC-5 — A touch list behaves as a UIKit table under a finger only

**Reference:** `component:List/DEC-5`

**Decider:** pending an engineering owner

Under a coarse primary pointer a list row follows the UIKit table cell, read on
iOS 26.2: its separators give way to its highlight, a row tapped to push stays
selected until the pop, and edit mode makes room for its control. Under a fine
pointer the list keeps the web's own behavior (`spec:AST-094` FR13). Row
updates are the one exception: they animate through the shared animated layout
handle under every pointer (`spec:AST-105` FR5). Each motion plays a motion
role, never a literal curve (`spec:AST-094` FR4), and edit mode's room is
measured from the row's applied inset, so a theme's row padding moves the
control with the text.

Rejected: the same motion for a mouse, which the web does not expect.

## Open questions

- **OQ1 — Edit mode and reorder mode.** How `isEditing` composes with
  `reorderable` (`spec:AST-103`): (a) independently, so a reorderable list in
  edit mode shows both the editing control at the leading edge and the reorder
  handle at the trailing edge, as a UIKit table does; or (b) edit mode hides
  the reorder handles until it ends.

## Content boundary

This claim-scoped contract does not duplicate List's complete prop table,
container-padding internals, consumer examples, implementation steps, or future
TabList/Button projections. Those remain with their named owners.
