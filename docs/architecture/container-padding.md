---
schema_version: 1
template_version: 1
kind: architecture
id: architecture:container-padding
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-09-22
owners: [cixzhang, imdreamrunner]
applies_to:
  [
    packages/core/src/Layout/container.stylex.ts,
    packages/core/src/Layout/padding.stylex.ts,
    packages/core/src/Layout/edgeCompensation.stylex.ts,
    packages/core/src/Card/,
    packages/core/src/Dialog/,
    packages/core/src/BottomSheet/,
    packages/core/src/Lightbox/,
    packages/core/src/MobileNav/,
    packages/core/src/Section/,
    packages/core/src/ScrollableArea/,
    packages/core/src/Layout/,
    packages/core/src/Divider/,
    packages/core/src/Item/,
    packages/core/src/List/,
    packages/core/src/TabList/,
    packages/core/src/Table/,
    packages/core/src/Toolbar/,
    packages/core/src/Layer/,
  ]
verified_by:
  [
    packages/core/src/Section/Section.test.tsx,
    packages/core/src/ScrollableArea/ScrollableArea.test.tsx,
    packages/core/src/Layout/Layout.test.tsx,
    packages/core/src/Layout/LayoutSlots.test.tsx,
    packages/core/src/Layout/overlayPaddingReset.test.tsx,
    packages/core/src/Layout/__tests__/edgeCompensation.test.tsx,
    packages/core/src/List/List.test.tsx,
    packages/core/src/TabList/TabList.test.tsx,
  ]
deciding_specs: [spec:AST-002/DEC-1, spec:AST-002/DEC-2, spec:AST-025/DEC-2]
---

# Container padding architecture

<!-- review-applicability:v1 -->

```json
{
  "scope": "global",
  "triggers": {
    "layout": ["INV1", "INV3", "INV6", "INV8", "INV9", "INV10", "INV11"],
    "public-api": ["INV3", "INV7", "INV9", "INV10", "INV11"]
  }
}
```

## Purpose

Padded containers and their descendants need one shared account of the inset at
each logical edge. Without it, a full-bleed child cannot cancel the padding it
actually received, a nested region cannot preserve one content line, and an
overlay can inherit geometry from a visual box it no longer occupies.

This record describes the shared internal protocol. It does not make its CSS
variables public API. `spec:AST-025/DEC-2` adds ScrollableArea as an explicit
participant with no padding and no bleed by default.

## System model

The protocol has four layers:

1. **Public component inputs and theme properties.** Component props use the
   public spacing scale. Theme component overrides may set supported padding
   properties. `architecture:theme-authoring-contract` and
   `architecture:component-theming-surface` own those public surfaces.
2. **Container lowering.** `container()` resolves Card, Section, and Dialog
   padding into internal logical-edge variables. An explicit component padding
   prop may publish the same geometry through the maps in `padding.stylex.ts`.
3. **Descendant geometry.** Four inherited `--container-padding-*` variables
   carry the inset that bleed descendants subtract. Container publishers and
   explicit region-padding paths couple those variables to their padding.
   Layout also carries an outer/inner split through
   `--layout-padding-outer-*` and `--layout-padding-inner-*`; automatic region
   placement applies that split, but not every current path republishes the
   resulting edge exactly (see the conformance gap below).
4. **Boundary reset.** An overlay leaves its ancestor's visual box while
   remaining a DOM descendant. `overlayPaddingReset` zeroes values descendants
   subtract and invalidates values descendants add, so readers fall through to
   their own defaults. It does not clear public theme properties.

### Current and admitted publishers and consumers

| Role                       | Participants                                           | Contract responsibility                                                                                                                                                  |
| -------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Container publisher        | Card, Section, Dialog, ScrollableArea                  | Resolve component padding or publish explicit content-box padding as logical-edge and Layout inset variables                                                             |
| Region publisher           | LayoutHeader, LayoutContent, LayoutFooter, LayoutPanel | Publish baseline or explicit-padding geometry; automatic outer-edge publication has the conformance gap below                                                            |
| Bleed consumer             | Section, ScrollableArea, Layout, Divider, Table        | Subtract inherited inset on the edges each component is designed to escape; ScrollableArea does so only with `isFullBleed`                                               |
| Edge-compensation consumer | TabList; List/ListItem rows (admitted)                 | Move visible content toward the container content line while retaining component-owned interaction padding; exact alignment depends on each component's bounded geometry |
| Alignment consumer         | Toolbar and edge-compensating child components         | Read the current inline inset to align visible content rather than stacked touch-target padding                                                                          |
| Boundary owner             | Layer surfaces and dialog-based overlay roots          | Apply `overlayPaddingReset` before descendants read inherited page geometry                                                                                              |

The participant list is the shared container system, not a Layout-owned family:
Section and ScrollableArea publish content inset, Section and opt-in full-bleed
ScrollableArea instances consume inherited inset, Layout redistributes inset,
Table and Divider consume bleed geometry, TabList consumes current edge-
compensation geometry, List is the admitted next consumer, and Toolbar consumes
alignment geometry. Participation here does not by itself make any of those
components a member of `family:layout-regions`.

Edge compensation is a two-sided geometry contract, not a token contract:

1. **Host side.** An eligible container or region state publishes the padding
   currently available at each logical edge through the existing private
   `--container-padding-*` variables. Those values must match that state's
   applied padding and follow nesting and overlay reset; missing values mean zero.
   A state with a known publication mismatch is ineligible. Publication does not
   itself opt a descendant into compensation.
2. **Component side.** A participating component owns the inset retained around
   its content and derives that inset from the same density- and theme-aware
   source as its normal padding. The component consumes only the logical edges
   its public value selects and never requires the container to understand its
   component tokens.

For a new self-compensating row or surface, the default eligible host state is
visually neutral: it contributes no background, border, clipping, or interactive
paint whose boundary would be undermined by the adjustment. A visibly bounded or
clipping state requires a component-specific contract and evidence for that host.
Controls and cards whose outer box is already the intended alignment boundary,
static content outside an admitted collection, and surfaces intended to reach the
outer container edge are otherwise ineligible. TabList is the existing specialized
projection: INV11 owns its wider host and overflow geometry.

The repository also has a container-owned slot-compensation mechanism. Ghost
Buttons and Tabs mark their transparent padding, while Banner and Toolbar move an
edge slot by their own known inset. It shares the content-alignment intent but
does not read inherited container padding or give those children a
caller-controlled compensation API. This revision leaves that mechanism
unchanged.

A component with a documented anatomy container that applies edge compensation
MAY expose an anatomy-targeted `<anatomy>EdgeCompensation` prop to modify that
container's compensation. The prop MUST use the shared axis values `inline`,
`block`, or `all`, preserve the component's documented omission behavior, and
keep the compensation amount component-owned. `inline` means the named
container's logical inline edge, `block` means both block edges, and `all`
combines them. These values do not extend the self-compensation vocabulary below.
`endContentEdgeCompensation` is DialogHeader's projection of this rule.

`edgeCompensation` names the caller's intent: reduce component-owned inset at
selected ancestor container content edges while keeping the component's own paint
or interaction inset. The component contract states when that bounded adjustment
reaches the host content line. Omission means no compensation. The shared logical
value vocabulary is:

- `start`: compensate only the logical inline-start edge;
- `end`: compensate only the logical inline-end edge; and
- `inline`: compensate both logical inline edges independently.

A component exposes only the values its current contract and evidence support.
This mode does not promise that the component box reaches the container's outer
edge. Reserve `isFullBleed` for components such as ScrollableArea whose visible
surface consumes the full inherited container inset. New self-compensation APIs
use `edgeCompensation` rather than exposing margin values or inventing a second
name.

### Edge-compensation ledger

| Participant                       | Source requirement                                                                                                                                                                                      | Canonical owner                  | Why it belongs                                                                                                          | Done criteria                                                                                                                                                                         | Status                            |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| Container and region publishers   | The host owns the actual padding available at each logical edge                                                                                                                                         | `architecture:container-padding` | A consumer cannot compensate safely without a per-edge upper bound from the host                                        | Eligible states publish values matching applied padding, nesting, and overlay reset; missing values resolve to zero; known mismatch states remain excluded                            | current where conformant          |
| TabList / Tab                     | The strip moves its first and last visible tab content toward the host lines while retaining tab interaction padding, focus-ring room, overflow controls, its divider rail, and its selection indicator | `component:TabList`              | The shipped behavior is edge compensation despite its current name                                                      | Preserve bounded content movement, full host-inset consumption, divider span, overflow, clipping, scroll controls, indicator geometry, logical direction, compatibility, and defaults | current behavior; rename deferred |
| List / ListItem, using Item inset | An optional List header is not horizontally inset, while every row keeps Item's density- and theme-aware inline padding                                                                                 | `component:List`                 | The caller knows whether the List sits in a neutral container beside content that should share its logical content line | Default unchanged; every row respects its own inset and the available host padding; header and row-local paint stay in place; required geometry evidence passes                       | accepted; implementation pending  |
| Button                            | An uncontained ghost Button may need its icon or label aligned while retaining its interaction inset                                                                                                    | No current component projection  | Its transparent interaction padding can create the same alignment need                                                  | Exclude filled and bordered presentations; prove composition, focus/hover paint, logical direction, and unchanged defaults; obtain owner approval                                     | candidate only                    |

`component:List` owns the only new API projection admitted by this revision.
`component:TabList` owns its existing behavior and the separately scoped public
rename and deprecation path. Button remains a candidate and cannot authorize
implementation; a future projection requires a component contract, evidence, and
the named owner's explicit approval.

This record adds no EdgeAlignment wrapper or new token vocabulary. Existing
container-padding participation remains the single host provider, and each
component contract owns its local retained inset and public projection.

`--_section-padding-propagated` is separate from the public
`--astryx-section-padding` property. The private value carries one ancestor
Section's explicit padding. An overlay can therefore drop ancestor geometry
without dropping the active theme's Section default.

## Boundaries and invariants

- **INV1 — Internal geometry is not theme API.** `--container-padding-*`,
  `--layout-padding-*`, and `--_section-padding-propagated` are implementation
  protocol. Themes use documented component properties instead of setting or
  depending on these names.
- **INV2 — Coupled publication paths stay coupled.** Where current source
  publishes geometry alongside a padding declaration—container lowering,
  Section's logical-edge overrides, explicit Layout-region padding, and
  full-bleed reset—the matching variable changes with that declaration. This
  invariant does not claim parity for every automatic Layout-region edge.
- **INV3 — Bleed is opt-in and edge-specific.** A descendant escapes padding
  only when its component contract opts into bleed, and only on the edges that
  contract covers. The presence of an inherited variable does not make every
  descendant full bleed.
- **INV4 — Layout distinguishes outer and inner edges.** Named Layout regions
  apply outer inset where they touch the shell and inner inset where they meet
  another region. Slot presence and each region's explicit padding select the
  applied edge styles. Exact descendant-variable parity for automatic outer
  edges is not guaranteed by this invariant.
- **INV5 — Section propagation has narrower authority than theme defaults.** An
  ancestor Section's explicit padding may propagate to nested Sections, but it
  does not replace the public theme property and does not cross an overlay
  boundary.
- **INV6 — Overlay boundaries terminate stale geometry.** The outermost styled
  overlay root zeroes `--container-padding-*`, invalidates
  `--layout-padding-*` and `--_section-padding-propagated`, and leaves public
  theme properties intact.
- **INV7 — Composition keeps component ownership.** This protocol carries
  geometry only. Section variants, Layout region semantics, Toolbar behavior,
  Table structure, Divider presentation, and component theming remain with
  their component or family contracts.
- **INV8 — Participation is explicit.** Padding alone does not enroll a
  component. Stack and Center currently apply local padding without publishing
  this protocol, so descendants cannot assume full-bleed compensation there.
- **INV9 — Edge compensation has two geometry owners, not shared tokens.** A
  participating host publishes only the padding currently available at each
  logical edge. A participating component owns the inset retained around its
  content and derives compensation from the same component-owned source as its
  applied padding. Neither side names or duplicates the other's theme tokens.
- **INV10 — The public vocabulary names intent.** `edgeCompensation` means reduce
  component-owned inset at selected logical host content edges while preserving
  component-owned interaction or paint inset. Each component contract states the
  bounded geometry and when content reaches the host line. Omission means no
  compensation. `start` selects logical inline-start, `end` selects logical
  inline-end, and `inline` selects both independently. A component exposes only
  the values its current component contract admits. `isFullBleed` remains for a
  surface whose public promise is to consume the full available host inset.
- **INV11 — Participation and host eligibility are explicit.** A new
  self-compensating row or surface requires a component contract and defaults to
  visually neutral host states. A component-specific contract may admit a bounded
  or clipping host only with evidence for that geometry. A host state whose
  published inset does not match its applied padding is ineligible until that
  conformance gap is fixed. Container publication alone never opts a child in,
  and arbitrary consumer CSS that changes a component's padding is outside the
  shared alignment guarantee.

### Known conformance gap

LayoutContent and LayoutPanel do not currently republish every automatic
outer-edge inset they apply:

- LayoutContent's no-start path changes inline-start padding and writes the outer
  value to both inline geometry variables, while its no-end path changes
  inline-end padding without changing the matching variable.
- LayoutPanel changes padding on shell-facing inline and block edges while its
  baseline geometry variables remain on the inner values.

A full-bleed descendant in those states can therefore compensate against a value
that differs from the region's applied padding. Explicit region padding and
`padding={0}` do update/reset the geometry variables. No current browser matrix
covers every slot and descendant-bleed combination, so this record does not claim
exact region parity. Correcting the mismatch is runtime work with compatibility
evidence, not part of this documentation stack.

## Change coupling

- Changing a publisher's padding precedence, logical edges, or container vars
  updates its declarations and the matching bleed/alignment evidence together.
- Adding a protocol participant identifies whether it publishes, consumes, or
  resets geometry and adds a focused cross-component regression before its
  contract relies on that role.
- An edge-compensation host publishes actual available inset per logical edge;
  it does not publish a token choice or infer a child's retained padding.
- A component exposing edge compensation uses `edgeCompensation`, declares only
  the logical values it currently supports, and keeps its effective inset and
  compensation on one derived source. Adding another value requires per-edge,
  asymmetric, zero-padding, RTL, and theme-override evidence.
- Renaming an existing compensation API preserves the old name as a deprecated
  alias through its approved compatibility window, moves maintained examples to
  the canonical name, and tests both paths before removal.
- Changing `container()` or the public-to-private padding lowering reviews Card,
  Section, Dialog, Layout regions, and overlay behavior together.
- Changing overlay hosting or adding an overlay root verifies that stale page
  geometry stops at the new boundary without suppressing public theme values.
- A component that wants a new public full-bleed mode or padding prop follows
  its component/family API review; this architecture does not authorize that
  API. `component:List` owns List's first new projection, and
  `component:TabList` owns its existing behavior and migration. This record does
  not authorize another component projection.

## Owning code

- `packages/core/src/Layout/container.stylex.ts` — lowers container theme and
  explicit padding into internal geometry.
- `packages/core/src/Layout/padding.stylex.ts` — owns public spacing-step maps,
  logical-edge setters, Section propagation, and the overlay reset.
- `packages/core/src/Layout/edgeCompensation.stylex.ts` — owns the container-side
  alignment adjustment for marked edge content.
- Card, Section, Dialog, ScrollableArea, and Layout region implementations —
  publish their current geometry.
- Section, ScrollableArea, Layout, Divider, Table, TabList, and Toolbar
  implementations — consume the current geometry for bleed or alignment.
- TabList currently lowers its component-owned projection; List owns its admitted
  next projection. `component:TabList` and `component:List` define their local
  padding, row/strip geometry, and private propagation.
- Overlay roots — apply the reset at the visual boundary.

## Deciding specs

- `spec:AST-002/DEC-1` and `spec:AST-002/DEC-2` require the caller-owned
  opt-in and its name to describe a dependable result rather than the margin or
  token mechanism.
- `spec:AST-025/DEC-2` and `component:ScrollableArea/FR5` establish the
  contrasting full-bleed contract: ScrollableArea consumes the full inherited
  inset only through explicit `isFullBleed`. List cancels at most its own Item
  inset and may stop inside the container padding; TabList consumes the full host
  inset but restores `max(host inset - edge-tab padding, 0)` inside its strip, so
  tab content may likewise stop short of the host line. Both are edge compensation
  rather than content-level full bleed.

## Verification

| Invariant        | Evidence                                                                       | Failure signal                                                                                                                                       |
| ---------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| INV2, INV5       | `Section.test.tsx` per-edge and nested-propagation tests                       | A per-edge prop leaves a stale geometry variable, or nested Sections lose the shipped propagation order                                              |
| INV2, INV3, INV8 | `ScrollableArea.test.tsx` padding and full-bleed tests                         | The content box publishes inset different from its applied padding, or the viewport escapes inherited padding without explicit full bleed            |
| INV4             | Layout source review plus `Layout.test.tsx` and `LayoutSlots.test.tsx`         | Slot presence stops selecting the shipped applied outer/inner edge styles; exact republished geometry remains limited by the named conformance gap   |
| INV6             | `overlayPaddingReset.test.tsx`                                                 | An overlay inherits page inset, loses its theme's Section padding, or lets ancestor Section propagation cross the boundary                           |
| INV3, INV7       | `Layout/__tests__/edgeCompensation.test.tsx` plus component tests              | An unmarked child is compensated, or marked edge content loses direct-child discoverability                                                          |
| INV9, INV10      | `List.test.tsx` plus real-browser geometry evidence                            | The header moves; a row reads the wrong logical edge, diverges from themed/density padding, applies the wrong bounded movement, or loses paint inset |
| INV10, INV11     | `TabList.test.tsx` plus real-browser overflow, divider, and indicator evidence | Full host-inset consumption, bounded content movement, divider span, interaction, focus, overflow, scroll controls, or indicator geometry regresses  |

The List evidence must cover its neutral root with the optional header,
interactive and static rows, all densities, a theme `item.paddingInline`
override, LTR and RTL, host inset smaller than/equal to/larger than Item inset,
uniform/asymmetric/zero/missing container padding, and hover/selection paint
geometry. TabList uses its separately scoped evidence; Buttons, menu rows, and
toolbar items are not admitted or verified by List's evidence.
