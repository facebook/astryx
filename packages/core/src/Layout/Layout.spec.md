---
schema_version: 3
template_version: 3
kind: component
id: component:Layout
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [public-api, behavior, layout, theming, accessibility]
verified_by:
  [
    packages/core/src/Layout/Layout.test.tsx,
    packages/core/src/Layout/LayoutSlots.test.tsx,
    packages/core/src/Layout/__tests__/childrenAsContent.test.tsx,
    packages/core/src/Layout/__tests__/contentWidth.test.tsx,
    packages/core/src/theme/themingTargets.test.ts,
    scripts/check-knowledge.mjs,
  ]
modules: []
families: [family:layout-regions]
design_specs: []
architecture:
  [
    architecture:container-padding,
    architecture:component-theming-surface,
    architecture:public-component-api,
  ]
contributing: []
system_specs: []
---

# Layout component contract

## Intent

Layout is a general layout primitive that arranges five optional named slots:
Header, logical-start Panel, Content area, logical-end Panel, and Footer. It can
structure regions within a page or bounded container, while AppShell owns the
page shell. This draft records the aggregate consumer anatomy, theming
ownership, and the region-level scroll ownership coordinated by Layout.

## Compatibility and migration

- Released defaults preserved: `yes`; LayoutContent and LayoutPanel keep
  `isScrollable=true`, and the new `height` prop defaults to `fill`
- Compatibility class: additive opt-in; existing `isScrollable={false}` keeps
  its released overflow behavior, while `height="auto"` joins the fill-height
  Layout middle scrollport
- Controlled/uncontrolled behavior: not applicable
- Migration decision: none; all existing callers retain their sizing and
  overflow behavior

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The Layout container and its current `layout` target.
- The five named slot positions: `header`, `start`, `content`, `end`, and
  `footer`; each accepts caller-provided ReactNode content.
- The aggregate optional Header, Panel, Content area, and Footer anatomy when the
  caller composes the corresponding Layout region components, and their current
  `layout-header`, `layout-panel`, `layout-content`, and `layout-footer` targets.
- One LayoutPanel concept and `layout-panel` target shared by instances supplied
  to the logical-start and logical-end slots.
- The fill-height middle scrollport that coordinates top-level LayoutContent and
  LayoutPanel region roots whose `height="auto"` opts into natural sizing.

**Does not own / non-goals**

- The page shell, app-wide navigation, responsive shell substitution, skip link,
  or main landmark, which are owned by AppShell.
- Product meaning or content supplied to any slot, which is owned by the caller.
- Automatic responsive substitution of regions outside AppShell, which is owned
  by the caller or another higher-level composition.
- Resize interaction, which is owned by useResizable and ResizeHandle.
- Correcting current container-padding publication mismatches or preventing two
  adjacent divider owners from both painting; those remain current gaps and
  caller obligations recorded below.

## Public concepts

The current public topology has five independent ReactNode slots. Slot position
is not rendered anatomy and does not add a target to arbitrary content.

| Concept        | Current values                                | Meaning                                                                                                  |
| -------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| slot topology  | `header`, `start`, `content`, `end`, `footer` | Positions caller content in the five-slot arrangement; omitted slots render no area wrapper.             |
| slot content   | any ReactNode                                 | The caller may supply Layout region components or unrelated content.                                     |
| panel anatomy  | LayoutPanel in `start` and/or `end`           | Both positions use one optional Panel anatomy concept and one `layout-panel` target.                     |
| region height  | `fill` or `auto`                              | Fill keeps the region pinned to the middle viewport; auto uses natural height and joins the middle flow. |
| local overflow | scrollable or clipped                         | `isScrollable` independently preserves the released overflow toggle.                                     |

Consumer syntax, defaults, and recommended region components remain documented
in `Layout.doc.mjs` and the region subcomponent docs. `family:layout-regions`
owns the shared region vocabulary, while `architecture:container-padding` owns
the broader container system shared with Section, Table, Toolbar, and Divider.

## Behavioral and layout contract

| ID  | Candidate invariant                                                                                                                                                                                                                                                                                                                                                                                                                               | Basis                                   | Draft review state                                         |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ---------------------------------------------------------- |
| FR1 | Layout renders one general Layout container carrying the current `layout` target and places arbitrary caller-provided ReactNode content in the `header`, `start`, `content`, `end`, and `footer` slots. Slot placement alone adds no region component or target.                                                                                                                                                                                  | Current source, docs, and tests         | Verified current behavior; no new behavior decided         |
| FR2 | When the caller supplies LayoutHeader, LayoutContent, or LayoutFooter, that component carries its current `layout-header`, `layout-content`, or `layout-footer` target; Layout does not add those targets to arbitrary slot content.                                                                                                                                                                                                              | Current source and target metadata      | Verified current inventory; no target change               |
| FR3 | LayoutPanel instances supplied to logical start or end share one aggregate Panel anatomy part and the current `layout-panel` target; slot position does not create a second anatomy part or target.                                                                                                                                                                                                                                               | Current source, docs, tests, and family | Verified current ownership; no API change                  |
| FR4 | `Layout.doc.mjs` is the canonical aggregate consumer document for the five current `layout*` targets and maps each target once; region subcomponent docs continue to document their own props and usage.                                                                                                                                                                                                                                          | Current documentation organization      | Verified current ownership                                 |
| FR5 | LayoutContent and LayoutPanel retain their shipped automatic container-padding publication behavior, including the mismatches recorded by `architecture:container-padding`; this documentation does not claim exact parity.                                                                                                                                                                                                                       | Current source and architecture record  | Current conformance gap; not fixed here                    |
| FR6 | When an adjacent ResizeHandle owns a panel divider, the caller must keep `LayoutPanel hasDivider={false}`; current composition does not prevent both components from painting the same boundary. Auto-height panels stretch across the shared row so their panel-owned divider spans the full middle region.                                                                                                                                      | Current source, docs, tests, and family | Caller obligation preserved; auto-height geometry proposed |
| FR7 | LayoutContent and LayoutPanel preserve their released `isScrollable` overflow behavior. Their new `height` prop defaults to `fill`; in a fill-height Layout, top-level region roots with `height="auto"` participate in the focusable middle scrollport while fill-height sibling slots remain pinned. Multiple region roots in one slot must agree; mixed heights keep that slot pinned. In auto-height Layout, no middle scrollport is created. | Current source, docs, tests, and family | Proposed additive behavior; defaults preserved             |

### Current evidence and gaps

- LayoutContent does not republish a matching inline-end container-padding value
  on its automatic no-end path, and its no-start path writes the outer inline
  value to both inline geometry variables. LayoutPanel applies automatic outer
  Layout-edge padding while retaining baseline inner geometry variables. A
  full-bleed descendant can therefore compensate against a published value that
  differs from the region's applied padding. This is shipped evidence and a
  runtime conformance gap, not behavior corrected or approved by this draft.
- LayoutPanel and an adjacent ResizeHandle can both draw the same content-facing
  divider. The current caller obligation is to set
  `LayoutPanel hasDivider={false}` when ResizeHandle owns that line. This draft
  does not add coordination or duplicate-divider prevention.

### Allowed variation

- **AV1 — Slot presence and content.** Header, start, content, end, and footer may
  be independently present or absent and may contain any caller-provided
  ReactNode. Slot content does not become Layout anatomy by position alone.
- **AV2 — Region composition.** Callers may supply LayoutHeader, LayoutContent,
  LayoutFooter, or LayoutPanel in the matching slot when they need those region
  components and targets; Layout does not insert them automatically.
- **AV3 — Panel position.** LayoutPanel may occupy logical start or end, or both
  positions may be supplied; all instances remain one Panel anatomy concept and
  target.
- **AV4 — Height and overflow.** Direct LayoutContent and LayoutPanel regions
  preserve their independent `isScrollable` overflow toggle. `height` defaults
  to `fill`; `height="auto"` participates in the fill-height middle scrollport.
  Multiple region roots in one slot must agree on height, otherwise the slot
  stays pinned. Auto-height Layouts remain page/ancestor-scrolled.

### Representative states

| State                          | Required invariant                                                                         | Allowed variation                                           |
| ------------------------------ | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| Arbitrary content only         | Layout container carries `layout`; arbitrary content gains no region target from its slot. | Caller content and current height/width configuration.      |
| Composed header/content/footer | Supplied Layout region components retain their own anatomy and targets.                    | Any region may instead be absent or arbitrary content.      |
| Start or end LayoutPanel       | Either logical position uses the one Panel anatomy part and `layout-panel` target.         | Position, width, scrolling, padding, and caller role.       |
| Two LayoutPanels               | Both instances remain repetitions of the same Panel anatomy part and target.               | Fill or natural height may be selected per panel.           |
| Mixed heights                  | Auto regions move in the middle scrollport; fill regions remain pinned.                    | Any direct content/start/end subset may use natural height. |
| ResizeHandle-adjacent          | Divider ownership follows the current caller obligation in FR6.                            | Resize state remains owned by the resize components.        |

### Transformation and precedence order

- Region `height` defaults to `fill`. In a fill-height Layout, explicit `auto`
  opts a top-level rendered region root into the middle scrollport; in an
  auto-height Layout, the page/ancestor remains the scroll owner.
- Region `isScrollable` retains its released, independent overflow behavior.
- No new slot, padding, content-width, divider, sizing, or styling precedence
  rule is introduced.

### Performance and resources

- No new performance or resource rule is introduced.

## Accessibility contract

This draft does not add inferred landmark semantics to individual regions.
LayoutHeader, LayoutContent, LayoutFooter, and LayoutPanel retain their current
explicit caller-supplied role and label behavior. An active middle scrollport is
keyboard focusable and exposed as a named group, using the first participating
region label when available and a localized fallback otherwise.

## Design relationships

| Anatomy or state | Design requirement                                                                       | Representation authority                  | Hierarchy role | Component contract |
| ---------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------- | -------------- | ------------------ |
| Layout container | Places arbitrary caller content in the five named slots without becoming the page shell. | Current source, docs, and family contract | Supporting     | FR1                |
| Header           | Presents an optional caller-supplied LayoutHeader region.                                | Current source, docs, and family contract | Supporting     | FR2                |
| Panel            | Presents a caller-supplied LayoutPanel at logical start or end.                          | Current source, docs, and family contract | Supporting     | FR3, FR6           |
| Content area     | Presents an optional caller-supplied LayoutContent region.                               | Current source, docs, and family contract | Prominent      | FR2, FR5           |
| Footer           | Presents an optional caller-supplied LayoutFooter region.                                | Current source, docs, and family contract | Supporting     | FR2                |

Slot position is topology, not anatomy. Arbitrary ReactNode content supplied to
a slot does not acquire the corresponding region part or target.

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Layout container": {"target": "layout"},
  "Header": {"target": "layout-header"},
  "Panel": {"target": "layout-panel"},
  "Content area": {"target": "layout-content"},
  "Footer": {"target": "layout-footer"}
}
```

The exact map records each current public target once. Panel represents every
caller-supplied LayoutPanel instance, whether placed at logical start, logical
end, or both. It does not map the `start` and `end` slots themselves.

## Family and system relationships

- `family:layout-regions` owns the shared named-region topology, logical
  direction, boundaries, scrolling, and component ownership. Layout adopts that
  vocabulary without owning the page shell.
- `architecture:container-padding` owns the broader container system shared by
  Section, Layout and its regions, Table, Toolbar, and Divider, including the
  current LayoutContent/LayoutPanel conformance gap. Participation in that
  system does not make Table or Divider Layout regions.
- `architecture:component-theming-surface` owns anatomy qualification and exact
  target mapping rules.
- `architecture:public-component-api` owns the stable slots, props, exports, and
  compatibility boundary; the additive height prop preserves existing defaults
  and behavior.

## Verification map

| Contract      | Verification                                                                                         | Representative states                                                                                                               | Mutation or failure expectation                                                                                                                                                       | Audit section                |
| ------------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| FR1–FR3       | Layout render, slot-context, children-as-content, region-component, and target inventory tests       | Arbitrary slot content, optional region components, logical start/end LayoutPanels                                                  | Removing slot placement, a composed region, or a current target fails existing structure, context, or target assertions; arbitrary slot content is not asserted to gain a target.     | `audit:Layout/anatomy`       |
| FR4           | `scripts/check-knowledge.mjs`                                                                        | Canonical aggregate doc and exact five-target map                                                                                   | Missing, extra, prefixed, or stale target mappings fail repository validation.                                                                                                        | `audit:Layout/theming`       |
| FR5           | Source inspection plus `architecture:container-padding` verification evidence                        | Automatic outer-edge Content area and Panel paths                                                                                   | This draft adds no parity assertion; a runtime correction requires separate compatibility evidence.                                                                                   | `audit:Layout/layout`        |
| FR6           | LayoutPanel source/docs, `contentWidth.test.tsx`, plus `family:layout-regions` verification evidence | Fill and auto panel-owned dividers, including auto stretch across the shared row, plus a panel beside a divider-owning ResizeHandle | Removing full-height auto-panel stretch fails focused tests; duplicate ResizeHandle divider ownership remains a caller obligation.                                                    | `audit:Layout/layout`        |
| FR7           | `Layout.test.tsx`, `LayoutSlots.test.tsx`, `contentWidth.test.tsx`, and Storybook browser evidence   | Content-only, one-panel, and mixed three-region height modes in fill/auto Layouts                                                   | Changing defaults, `isScrollable` compatibility, auto-region participation, fill-region pinning, focusability, or contentWidth containment fails focused structure or browser checks. | `audit:Layout/layout`        |
| Accessibility | `LayoutSlots.test.tsx` landmark assertions and the Layout Storybook accessibility audit              | Header, Content area, Footer, Panel, and active middle scrollport                                                                   | Supplied region semantics stop forwarding, or the middle scrollport loses its focus stop or accessible name.                                                                          | `audit:Layout/accessibility` |

## Decision log

### DEC-1 — AppShell owns the page shell; Layout owns five-slot arrangement

**Reference:** `component:Layout/DEC-1`
**Decider:** `cixzhang`, `2026-08-31`

AppShell is the page shell. Layout is the general layout primitive for arranging
the `header`, `start`, `content`, `end`, and `footer` slots within a page or
bounded container. Container-padding participation by Section, Table, Toolbar,
and Divider does not make those components Layout-owned anatomy.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables or examples, family region
rules, container-padding mechanics, resize interaction, implementation steps,
or system rules. It links to their owners.
