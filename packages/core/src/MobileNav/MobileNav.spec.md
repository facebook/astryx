---
schema_version: 3
template_version: 3
kind: component
id: component:MobileNav
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [behavior, theming, accessibility]
verified_by:
  [
    packages/core/src/MobileNav/MobileNav.test.tsx,
    packages/core/src/MobileNav/MobileNavToggle.test.tsx,
    packages/core/src/MobileNav/MobileNavCloseEdgeCases.test.tsx,
    packages/core/src/theme/themingTargets.test.ts,
    scripts/check-knowledge.mjs,
  ]
modules: []
families: [family:overlay-dismissal]
design_specs: []
architecture:
  [
    architecture:component-theming-surface,
    architecture:layer-runtime,
    architecture:public-component-api,
  ]
contributing: []
system_specs: []
---

# MobileNav component contract

## Intent

MobileNav presents mobile navigation in a modal drawer and exports an AppShell-
aware Toggle button for opening and closing it. This draft records the aggregate
consumer anatomy and theming ownership of both exports without changing runtime
behavior, styling, targets, or public API.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: additive documentation only; runtime, DOM, styling,
  targets, aliases, and public API remain unchanged
- Controlled/uncontrolled behavior: unchanged
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The Navigation overlay and its current `mobile-nav` target.
- Drawer placement and motion, the stable Header and Content regions, and the
  connection between AppShell state, MobileNav, and MobileNavToggle.
- Canonical anatomy for both exported components. `component:MobileNav` is the
  parent owner; MobileNavToggle does not have a separate component contract.

**Does not own / non-goals**

- The Close and Toggle button surfaces — delegated to `component:Button`.
- Header or navigation content supplied by the caller.
- A public target for the painted Drawer, Header, or Content region; none exists
  on current `main`.
- AppShell responsive policy or shared layer and dismissal policy.

## Public concepts

No new public concept is introduced. Consumer props, exports, and usage remain
documented in `MobileNav.doc.mjs`.

## Behavioral and layout contract

| ID  | Candidate invariant                                                                                                                                                               | Basis                           | Draft review state                                 |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | -------------------------------------------------- |
| FR1 | MobileNav renders one Navigation overlay containing a Drawer with a stable Header, Close button, and scrollable Content region.                                                   | Current source, docs, and tests | Verified current behavior; no new behavior decided |
| FR2 | Navigation overlay carries the current `mobile-nav` target. Drawer, Header, and Content carry no MobileNav public target.                                                         | Current source and public docs  | Verified current reachability; no target change    |
| FR3 | Close button and the separately exported Toggle button use Button's `button` target; Toggle renders only when AppShell mobile context enables it and references the drawer by ID. | Current source, docs, and tests | Verified current delegation; no ownership change   |

### Allowed variation

- **AV1 — Drawer edge.** The Drawer may resolve to logical start or end through
  the current explicit or trigger-derived side behavior.
- **AV2 — Header content.** Header may contain a string rendered through Heading,
  caller-provided content, or only the Close button.
- **AV3 — Navigation content.** Caller-provided navigation content may vary
  without becoming MobileNav-owned anatomy.
- **AV4 — Toggle presence.** Toggle button is absent outside an enabled AppShell
  mobile context.

### Representative states

| State                    | Required invariant                                                     | Allowed variation                                  |
| ------------------------ | ---------------------------------------------------------------------- | -------------------------------------------------- |
| Standalone drawer        | Navigation overlay contains Drawer, Header, Close button, and Content. | Caller controls open state and may choose an edge. |
| AppShell drawer          | The same drawer anatomy consumes AppShell mobile state.                | Header and navigation content remain caller-owned. |
| AppShell mobile toggle   | Toggle button controls and references the current drawer.              | Custom button content may replace the menu glyph.  |
| Non-mobile/disabled host | Toggle button does not render.                                         | MobileNav remains owned by the parent contract.    |

### Transformation and precedence order

- No new side resolution, open-state, close timing, or styling precedence rule is
  introduced.

### Performance and resources

- No new performance or resource rule is introduced.

## Accessibility contract

This draft does not change or extend MobileNav's existing dialog naming, focus,
Toggle relationship, Button labels, modal behavior, or dismissal behavior.

## Design relationships

| Anatomy or state   | Design requirement                                                    | Representation authority       | Hierarchy role | Component contract |
| ------------------ | --------------------------------------------------------------------- | ------------------------------ | -------------- | ------------------ |
| Navigation overlay | Hosts the modal navigation layer and its backdrop.                    | Current source and public docs | Supporting     | FR1, FR2           |
| Drawer             | Paints the sliding mobile navigation surface.                         | Current source and public docs | Prominent      | FR1, FR2           |
| Header             | Arranges optional header content with the persistent Close button.    | Current source and public docs | Supporting     | FR1, FR2           |
| Content            | Provides the scrolling region for caller-supplied navigation content. | Current source and public docs | Prominent      | FR1, FR2           |
| Close button       | Dismisses the current drawer.                                         | `component:Button`             | Supporting     | FR1, FR3           |
| Toggle button      | Opens or closes the AppShell-owned mobile drawer state.               | `component:Button`             | Supporting     | FR3                |

Drawer is the primary painted surface, but the only current MobileNav target is
on the full-viewport dialog overlay. Its `none` disposition is a factual
reachability gap, not a decision that the Drawer must remain unthemeable. Header
and Content likewise have no current local target. Close and Toggle retain Button
ownership.

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Navigation overlay": {"target": "mobile-nav"},
  "Drawer": {
    "none": {
      "reason": "reachability-gap: No current public target is applied to the painted drawer panel"
    }
  },
  "Header": {
    "none": {
      "reason": "reachability-gap: No current public target is applied to the stable header row"
    }
  },
  "Content": {
    "none": {
      "reason": "reachability-gap: No current public target is applied to the scrollable content region"
    }
  },
  "Close button": {
    "delegatesTo": {"owner": "component:Button", "target": "button"}
  },
  "Toggle button": {
    "delegatesTo": {"owner": "component:Button", "target": "button"}
  }
}
```

## Family and system relationships

- `architecture:component-theming-surface` owns anatomy qualification, target
  mapping, delegation, and factual `none` dispositions.
- `architecture:layer-runtime` owns the current native-dialog host and shared
  layer plumbing; MobileNav retains its current drawer motion and backdrop path.
- `family:overlay-dismissal` owns shared Escape and platform-close ordering and
  records MobileNav as a current adopter.
- `architecture:public-component-api` owns the shared API boundary; this draft
  changes neither MobileNav nor MobileNavToggle API.
- AppShell remains the higher-level responsive owner. This parent component
  record owns the two MobileNav exports' shared anatomy only.

## Verification map

| Contract            | Verification                                                                  | Representative states                       | Mutation or failure expectation                                                                                  | Audit section              |
| ------------------- | ----------------------------------------------------------------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------- |
| FR1                 | `MobileNav.test.tsx` content/header/close assertions plus source inspection   | Standalone open and closed drawer           | Removing dialog content or the Close action fails tests; distinct Drawer/Header/Content wrappers rely on review. | `audit:MobileNav/anatomy`  |
| FR2                 | Source inspection and `themingTargets.test.ts`                                | Overlay, Drawer, Header, and Content        | Removing the root target or documenting an unshipped child target fails evidence or inventory.                   | `audit:MobileNav/theming`  |
| FR3                 | `MobileNavToggle.test.tsx`, `MobileNavReopen.test.tsx`, and source inspection | Closed/open AppShell drawer and toggle      | Breaking Button delegation or the ID/state relationship fails focused toggle coverage.                           | `audit:MobileNav/anatomy`  |
| Close lifecycle     | `MobileNavCloseEdgeCases.test.tsx` and related close/visibility suites        | Escape, backdrop, close, reopen, unmount    | Leaving the modal open or disconnecting state fails existing lifecycle assertions.                               | `audit:MobileNav/behavior` |
| Theming anatomy map | `scripts/check-knowledge.mjs`                                                 | Canonical parent anatomy and current target | Missing, extra, prefixed, stale, or multiply assigned mappings fail repository validation.                       | `audit:MobileNav/theming`  |

Current tests find header and navigation content by text and the Close action by
role, but do not identify the distinct Drawer, Header, or Content elements. Their
existence and nesting are source-inspected; merging or reordering those wrappers
currently lacks focused regression evidence.

## Decision log

None. This draft records current facts and introduces no component-local design,
API, theming, responsive, or layer-system decision.

## Open questions

- **OQ1 — Should Drawer gain a stable public theming target?** (`human-api`) The
  current target reaches the Navigation overlay rather than the primary painted
  drawer surface; this is an audit gap, not settled intent.

## Content boundary

This file does not duplicate consumer prop tables/examples, AppShell responsive
policy, close-timing mechanics, shared layer rules, current audit results, or
implementation steps. It links to their owners.
