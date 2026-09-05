---
schema_version: 1
template_version: 1
kind: family
id: family:layout-regions
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-08-31
owners: [cixzhang, imdreamrunner]
review_triggers: [public-api, behavior, layout, accessibility, theming]
verified_by:
  [
    packages/core/src/Section/Section.test.tsx,
    packages/core/src/Layout/Layout.test.tsx,
    packages/core/src/Layout/LayoutSlots.test.tsx,
    packages/core/src/Layout/__tests__/childrenAsContent.test.tsx,
    packages/core/src/Layout/__tests__/contentWidth.test.tsx,
    packages/core/src/Toolbar/Toolbar.test.tsx,
  ]
members:
  [
    component:Section,
    component:Layout,
    component:LayoutHeader,
    component:LayoutContent,
    component:LayoutFooter,
    component:LayoutPanel,
    component:Toolbar,
  ]
architecture:
  [architecture:container-padding, architecture:public-component-api]
contributing: []
deciding_specs: []
---

# Layout regions contract

## Intent

A page or bounded work area should have predictable structural regions before
its product content is added. Builders can use a generic Section, a five-slot
Layout primitive, or a contextual Toolbar without each surface inventing its
own inset, boundary, region direction, or content ownership. AppShell owns the
page shell that composes these lower-level regions with application navigation.

## Membership rule

A component belongs when its primary public purpose is defining a stable
structural region: a generic page/content region, a named position in Layout's
five-slot topology, or a contextual action region. Members may compose shared
layout primitives, but they own a stronger boundary than arbitrary-child
arrangement alone.

- **Members:** Section; Layout and its Header, Content, Footer, and Panel regions;
  Toolbar.
- **Collaborators:** `family:layout-primitives` supplies arbitrary-child
  arrangement utilities; `architecture:container-padding` supplies the broader
  inset and bleed system used by Section, Layout and its regions, Table, Toolbar,
  and Divider; useResizable and ResizeHandle may drive a panel's size; AppShell
  owns the page shell and composes Layout with application navigation; component
  theming owns visual targets.
- **Excluded:** Stack, Grid, Center, and their modifiers arrange arbitrary
  children without claiming a structural region. FormLayout owns field-specific
  arrangement and optionality. Card is a discrete-item surface. AppShell owns
  page-shell and navigation semantics rather than this reusable region grammar.
  Table owns structured data, and Divider owns separation; their participation
  in `architecture:container-padding` does not make either a layout-region
  member.

A component does not join because it happens to render a flex row, a padded
wrapper, or a header-like visual treatment.

## Shared owner

- Section owns the generic painted page/content region, including its variant,
  selected divider edges, component padding, and nested Section behavior.
- Layout owns its five-slot topology, slot presence, region position, shared
  outer/inner inset, height mode, content-width propagation, the fill-height
  middle scrollport, and default header/footer divider context. It does not own
  the page shell.
- LayoutHeader, LayoutContent, LayoutFooter, and LayoutPanel own their region
  element, optional landmark role/name, local padding, region-specific size,
  and whether they scroll independently or participate in Layout's middle
  scrollport.
- Toolbar owns the contextual action region, its start/center/end lanes,
  toolbar semantics, keyboard movement, and size cascade. It delegates its
  painted surface, variant, and selected divider edges to Section.
- `architecture:container-padding` owns inherited inset and bleed mechanics.
- useResizable and ResizeHandle own resize state and interaction. LayoutPanel
  only accepts their current size as an alternative width owner.

## Canonical concepts

| Concept               | Values or states                                                    | Default semantics                                                                                                                      | Stability              |
| --------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| generic region        | Section                                                             | Related page/content area with an optional painted treatment                                                                           | current                |
| five-slot topology    | header, start, content, end, footer                                 | Layout places provided regions in logical reading direction                                                                            | current                |
| contextual actions    | start, optional center, end                                         | Toolbar groups controls within a bounded content region                                                                                | current                |
| outer and inner inset | Layout edge or adjacent-region edge                                 | A Layout region uses the inset appropriate to the edges it touches                                                                     | current                |
| boundary              | absent or divider                                                   | A member may draw only the edges its component contract exposes                                                                        | current                |
| region scroll         | independent, middle-owned, or page-owned where exposed              | `height="fill"` keeps a bounded region; `height="auto"` joins the fill-height middle flow; `isScrollable` only controls local overflow | component/Layout-owned |
| landmark              | no explicit role, or caller-supplied role and label                 | A region does not infer page-level landmark semantics from visual placement                                                            | current                |
| region size           | intrinsic, fixed, fill/auto, capped, or resize-driven where exposed | Each member owns its applicable size axis                                                                                              | component-owned        |
| responsive adaptation | retained, omitted, or replaced by caller composition                | No shared automatic region swap exists                                                                                                 | caller/component-owned |

## Cross-component invariants

- **FR1 — A region owns structure, not product meaning.** A member establishes a
  spatial boundary and renders caller content without adopting the content's
  product semantics, state, or component contracts.
- **FR2 — Region direction is logical.** Start and end follow writing direction.
  Divider placement and panel adjacency use the same logical region position.
- **FR3 — Layout selects geometry from slot presence.** Header, Content, Footer,
  and Panel apply outer inset where they touch the Layout boundary and inner
  inset where they meet another region. Omitted slots do not leave an area
  wrapper. The inherited geometry republished to full-bleed descendants is
  subject to the current LayoutContent/LayoutPanel conformance gap in
  `architecture:container-padding`.
- **FR4 — Explicit region padding replaces the automatic applied inset.**
  Section publishes its component inset; Layout distributes outer and inner
  inset across its named slots; a region's explicit padding or zero-padding
  path selects its local styles. This does not claim that every automatic
  Layout edge currently republishes an exact matching descendant variable.
- **FR5 — Boundary ownership is caller-selected where composition permits two
  owners.** LayoutHeader and LayoutFooter each own their implied edge. Section
  and Toolbar expose selected edges. LayoutPanel may draw its content-facing
  edge, and ResizeHandle may also draw it; current code does not prevent both.
  A resizable panel composition must set `LayoutPanel hasDivider={false}` when
  the adjacent ResizeHandle owns the divider. Auto-height panels stretch across
  the shared row so their panel-owned divider spans the full middle region.
- **FR6 — Divider absence may change spacing.** Layout regions currently collapse
  the interior spacing associated with an absent header, footer, or panel
  divider; an explicit divider preserves the fenced boundary.
- **FR7 — Scrolling is explicit and composable.** LayoutContent and LayoutPanel
  default `height` to `fill`, preserving their released bounded sizing, and
  default `isScrollable` to true, preserving local scrollable overflow. In a
  fill-height Layout, each slot whose top-level rendered region has
  `height="auto"` participates in the focusable Layout middle scrollport;
  fill-height sibling slots and non-region slot content remain pinned. Multiple
  top-level region roots within one slot must agree on `height`; mixed values
  conservatively keep that slot pinned. In an auto-height Layout, the page or
  ancestor remains the scroll owner and no middle scrollport is created. Section
  and Toolbar do not become scroll containers through family membership.
- **FR8 — Landmark semantics remain explicit.** Named visual placement does not
  automatically assign `banner`, `main`, `navigation`, `complementary`, or
  `contentinfo`. A caller supplies a supported role and label for the context.
- **FR9 — Responsive substitution is not automatic.** Section and Toolbar keep
  their current presentation. Layout renders the regions supplied by the
  caller. AppShell, product composition, or another component-specific owner
  decides when a region is omitted or replaced at a narrower width.
- **FR10 — Resize ownership remains delegated.** A LayoutPanel with `resizable`
  uses the hook-provided current size instead of its `width` prop. The region
  family does not redefine snapping, persistence, collapse, keyboard, or pointer
  behavior.
- **FR11 — Theming remains component-owned.** Structural membership does not
  create family targets. Current `.doc.mjs` metadata documents shipped targets
  and capabilities, runtime `themeProps()` emits them, and
  `architecture:component-theming-surface` owns the cross-component rules. A
  component spec may add optional anatomy-mapping metadata when one exists.

## Allowed component variation

- **AV1 — Region strength.** Section is a generic region; Layout members are
  position-aware slots in the five-slot primitive; Toolbar is a semantic action
  bar.
- **AV2 — Surface treatment.** Section and Toolbar may use Section variants and
  selected edges. Layout regions use their existing divider and padding
  treatments. Family membership does not unify their visual API.
- **AV3 — Region content.** Header, footer, panel, content, and toolbar lanes may
  hold any content allowed by their component contracts.
- **AV4 — Size and scroll model.** Layout owns fill/auto container height,
  content-width propagation, and the fill-height middle scrollport; individual
  regions own applicable height, width, padding, and whether they scroll
  independently or participate in that middle scrollport. Section owns its
  box-size props.
- **AV5 — Interaction.** Toolbar owns roving focus and keyboard hints. Other
  members add no toolbar behavior. Resizable owns resize interaction.
- **AV6 — Composition mechanism.** Members may use Stack utilities, direct CSS
  layout, contexts, or component composition. The observable region contract is
  the owned surface.
- **AV7 — Responsive policy.** Callers may omit, replace, or externally adapt
  regions. The family sets no breakpoint.

## Representative matrix

| Member and state                                 | Shared invariant                                                | Deliberate variation                                                                                                         |
| ------------------------------------------------ | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Section / default, transparent, or muted         | Owns one generic region and publishes its applied inset         | Variant and selected divider edges are Section-local                                                                         |
| Layout / content only                            | Slot presence selects Layout-edge inset                         | Content defaults to fill height with its released local overflow; `height="auto"` opts into the full-width middle scrollport |
| Layout / all regions                             | Start/end stay logical; named regions receive outer/inner inset | Each region independently chooses pinned fill height or natural-height participation in the middle scrollport                |
| LayoutHeader or LayoutFooter / divider inherited | One boundary owner and explicit landmark semantics              | Parent `defaultHasDividers` supplies the default; local false may override it                                                |
| LayoutContent / fill, auto, or page-owned        | Region height composes with Layout height                       | Fill is pinned by default; auto joins the fill-height middle flow; `isScrollable` controls local overflow                    |
| LayoutPanel / fixed or resize-driven             | Panel position selects edge treatment                           | A fill panel stays pinned in middle-scroll mode; useResizable may replace width ownership                                    |
| Toolbar / two or three lanes                     | Contextual action region delegates its surface to Section       | Center content switches internal arrangement; toolbar alone owns keyboard behavior                                           |

## Adoption and exceptions

| Component or concern | Adoption                                                          | Current gap or exception                                                                                                                                                                                                                                                                                                                                |
| -------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Section              | Generic region and container-padding publisher                    | Its nested escape is always inline but only first/last child on the block axis                                                                                                                                                                                                                                                                          |
| Layout container     | Five-slot region owner with slot contexts                         | `contentWidth` always contains the complete middle composition. In fill height, a slot whose top-level rendered region has `height="auto"` activates the focusable middle scrollport; known arithmetic widths let it span the Layout while preserving the centered frame, and intrinsic or unresolved-variable widths keep that scrollport constrained. |
| LayoutContent        | Reads slot presence and applies outer/inner inset                 | Its no-start path writes the outer value to both inline geometry variables, while no-end changes padding without the matching variable update                                                                                                                                                                                                           |
| LayoutPanel          | Applies position-aware padding and may accept resize-driven width | Automatic Layout-edge padding leaves baseline inner geometry variables; an adjacent `ResizeHandle hasDivider` can double the line unless the caller sets panel `hasDivider={false}`. Auto-height panels stretch their panel-owned divider across the shared row.                                                                                        |
| LayoutHeader/Footer  | Region-specific inset, boundary, and landmarks                    | Cross-region computed-style parity is not covered by one browser matrix                                                                                                                                                                                                                                                                                 |
| Toolbar              | Section-backed surface plus toolbar behavior                      | Inline inset and edge compensation follow the composed Section's current padding context                                                                                                                                                                                                                                                                |
| Responsive regions   | Caller/AppShell composition                                       | LayoutPanel has no current shared responsive visibility contract                                                                                                                                                                                                                                                                                        |

These rows describe shipped behavior and verification gaps. They are not approved
exceptions to silently change in a documentation pull request.

## Change coupling

- Adding or changing a structural-region component checks membership and updates
  this contract only when the shared boundary changes.
- Changing Layout slot presence, area context, inset distribution, divider
  inheritance, height mode, or content-width propagation updates the
  corresponding region tests and browser evidence.
- Changing Section padding, nested escape, variant, or divider behavior updates
  its component contract and reviews `architecture:container-padding` when
  inherited geometry changes.
- Changing Toolbar lanes, semantics, keyboard behavior, or size cascade remains
  Toolbar work; changing its Section-backed surface or inset relationship also
  reviews this family and the container-padding architecture.
- Changing LayoutPanel resize integration reviews Resizable's component contract
  without copying resize mechanics into this family.
- Adding responsive hide/swap behavior requires a component or higher-level
  owner and compatibility evidence; family membership does not authorize a new
  breakpoint prop.

## Verification map

| Contract             | Verification                                                                   | What the evidence proves                                                                                                                                                                                                    | Missing evidence                                                                                                                                     |
| -------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR1                  | Section/Layout/Toolbar render and slot tests                                   | Caller content renders inside the current region structure; Toolbar exposes its current lanes                                                                                                                               | Tests do not independently prove that product semantics remain caller-owned                                                                          |
| FR2                  | Logical-property source review plus Layout area-context tests                  | Start/end slots are identified logically and source selects logical divider/padding properties                                                                                                                              | No real-browser LTR/RTL geometry matrix covers every region                                                                                          |
| FR3                  | `Layout.test.tsx` and `childrenAsContent.test.tsx`                             | Slot presence/context and content precedence are pinned; omitted slots do not render area providers                                                                                                                         | Tests do not assert computed outer/inner inset or exact descendant geometry; the published-variable mismatch is a named conformance gap              |
| FR4                  | Section padding class-set tests and Layout region source                       | Section's explicit edge overrides move matching variables; region source has automatic, explicit, and zero-padding branches                                                                                                 | Layout tests mostly assert acceptance/rendering, not computed padding or automatic-variable parity                                                   |
| FR5, FR6             | `Layout.test.tsx` and `LayoutSlots.test.tsx`                                   | Header/footer divider defaults and explicit false overrides are reflected in `data-divider`; source contains collapse styles                                                                                                | No rendered test prevents a LayoutPanel and adjacent ResizeHandle from both drawing a divider, or proves computed collapse spacing                   |
| FR7                  | Layout/LayoutContent/LayoutPanel unit tests plus Storybook mixed-scroll states | Defaults preserve fill sizing and released local overflow; auto-height top-level region roots activate middle scrolling only in fill-height Layouts; fill siblings remain pinned                                            | Browser evidence verifies actual scroll motion, independent-region pinning, keyboard focusability, and scrollbar placement across mixed combinations |
| FR8                  | `LayoutSlots.test.tsx` landmark assertions                                     | Supplied roles and labels reach Header, Content, Footer, and Panel elements                                                                                                                                                 | No family-wide accessibility-tree test covers repeated landmarks                                                                                     |
| Layout content width | `contentWidth.test.tsx` and Storybook content-width states                     | Header/footer retain aligned wrappers; every region remains inside the shared width; arithmetic widths allow the opted-in middle scrollport to span Layout gutters while intrinsic widths preserve a constrained scrollport | Browser evidence verifies computed alignment, scrollbar placement, and mixed pinned/moving regions                                                   |
| Toolbar variation    | `Toolbar.test.tsx`                                                             | Lanes, role/name/orientation, Section variant delegation, and current keyboard behavior have focused assertions                                                                                                             | No computed inset/edge-compensation test covers non-default parent padding                                                                           |
| FR10                 | LayoutPanel coverage in `LayoutSlots.test.tsx`                                 | Hook-provided `_size` overrides the fixed width prop                                                                                                                                                                        | Resize interaction, persistence, snapping, and collapse are verified only by Resizable's own tests                                                   |

The current tests prove selected structure, attributes, callbacks, and class/style
branches. They do not prove one computed visual alignment across every Section,
Layout, Toolbar, and ResizeHandle composition; the adoption table names those
limits explicitly.

## Decision links

### DEC-1 — Structural regions and composition primitives have separate owners

**Decider:** `cixzhang`, `2026-08-30`

Section, Layout and its named regions, and Toolbar form the layout-regions
family. Stack, Grid, Center, and their modifiers have a separate
layout-primitives owner. This keeps shared region rules focused on structural
boundaries without turning every flex/grid container into a page region.

### DEC-2 — AppShell owns the page shell

**Decider:** `cixzhang`, `2026-08-31`

AppShell owns the page shell and application-navigation composition. Layout is
the general five-slot primitive used to arrange `header`, `start`, `content`,
`end`, and `footer` regions within a page or bounded container. The broader
container-padding participants retain their own component ownership.

## Open questions

None. The adoption table contains checkable source and browser work, not
unresolved family policy.

## Content boundary

This record owns only shared structural-region behavior. It does not repeat
component prop tables, define arbitrary-child composition, own product or
navigation semantics, prescribe visual design, assign responsive breakpoints,
redefine resize interaction, or own component theming anatomy and targets.
