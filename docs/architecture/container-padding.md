---
schema_version: 1
template_version: 1
kind: architecture
id: architecture:container-padding
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-08-30
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
    packages/core/src/Layout/,
    packages/core/src/Divider/,
    packages/core/src/Table/,
    packages/core/src/Toolbar/,
    packages/core/src/Layer/,
  ]
verified_by:
  [
    packages/core/src/Section/Section.test.tsx,
    packages/core/src/Layout/Layout.test.tsx,
    packages/core/src/Layout/LayoutSlots.test.tsx,
    packages/core/src/Layout/overlayPaddingReset.test.tsx,
    packages/core/src/Layout/__tests__/edgeCompensation.test.tsx,
  ]
deciding_specs: []
---

# Container padding architecture

## Purpose

Padded containers and their descendants need one shared account of the inset at
each logical edge. Without it, a full-bleed child cannot cancel the padding it
actually received, a nested region cannot preserve one content line, and an
overlay can inherit geometry from a visual box it no longer occupies.

This record describes the shipped internal protocol. It does not add a public
prop, CSS variable, theme capability, or new participant.

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

### Shipped publishers and consumers

| Role                | Current participants                                   | Shipped responsibility                                                                                        |
| ------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| Container publisher | Card, Section, Dialog                                  | Resolve component padding and publish logical-edge and Layout inset variables through `container()`           |
| Region publisher    | LayoutHeader, LayoutContent, LayoutFooter, LayoutPanel | Publish baseline or explicit-padding geometry; automatic outer-edge publication has the conformance gap below |
| Bleed consumer      | Section, Layout, Divider, Table                        | Subtract inherited inset on the edges each component is designed to escape                                    |
| Alignment consumer  | Toolbar and edge-compensating child components         | Read the current inline inset to align visible content rather than stacked touch-target padding               |
| Boundary owner      | Layer surfaces and dialog-based overlay roots          | Apply `overlayPaddingReset` before descendants read inherited page geometry                                   |

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
  component contract relies on that role.
- Changing `container()` or the public-to-private padding lowering reviews Card,
  Section, Dialog, Layout regions, and overlay behavior together.
- Changing overlay hosting or adding an overlay root verifies that stale page
  geometry stops at the new boundary without suppressing public theme values.
- A component that wants a new public bleed mode or padding prop follows its
  component/family API review; this architecture does not authorize that API.

## Owning code

- `packages/core/src/Layout/container.stylex.ts` — lowers container theme and
  explicit padding into internal geometry.
- `packages/core/src/Layout/padding.stylex.ts` — owns public spacing-step maps,
  logical-edge setters, Section propagation, and the overlay reset.
- `packages/core/src/Layout/edgeCompensation.stylex.ts` — owns the container-side
  alignment adjustment for marked edge content.
- Card, Section, Dialog, and Layout region implementations — publish their
  current geometry.
- Section, Layout, Divider, Table, and Toolbar implementations — consume the
  current geometry for bleed or alignment.
- Overlay roots — apply the reset at the visual boundary.

## Deciding specs

None. This record names the already shipped protocol and its current ownership
boundaries.

## Verification

| Invariant  | Evidence                                                               | Failure signal                                                                                                                                     |
| ---------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| INV2, INV5 | `Section.test.tsx` per-edge and nested-propagation tests               | A per-edge prop leaves a stale geometry variable, or nested Sections lose the shipped propagation order                                            |
| INV4       | Layout source review plus `Layout.test.tsx` and `LayoutSlots.test.tsx` | Slot presence stops selecting the shipped applied outer/inner edge styles; exact republished geometry remains limited by the named conformance gap |
| INV6       | `overlayPaddingReset.test.tsx`                                         | An overlay inherits page inset, loses its theme's Section padding, or lets ancestor Section propagation cross the boundary                         |
| INV3, INV7 | `Layout/__tests__/edgeCompensation.test.tsx` plus component tests      | An unmarked child is compensated, or marked edge content loses direct-child discoverability                                                        |

The current suite does not provide one browser matrix that compares computed
padding and bleed across every publisher and consumer. Component tests and the
overlay regression prove the listed paths; broader cross-component parity
remains verification work rather than an implied guarantee.
