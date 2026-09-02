---
schema_version: 1
template_version: 1
kind: family
id: family:navigation-destinations
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-08-31
owners: [cixzhang, imdreamrunner]
review_triggers: [behavior, accessibility, public-api]
verified_by:
  [
    packages/core/src/Markdown/parser.test.ts,
    packages/core/src/Markdown/Markdown.test.tsx,
    packages/core/src/Link/useLinkComponent.test.tsx,
    packages/core/src/ClickableCard/ClickableCard.test.tsx,
  ]
members:
  [
    component:Avatar,
    component:BreadcrumbItem,
    component:Button,
    component:Citation,
    component:ClickableCard,
    component:Item,
    component:Link,
    component:ListItem,
    component:Markdown,
    component:NavHeadingMenuItem,
    component:SideNavHeading,
    component:SideNavItem,
    component:Tab,
    component:Token,
    component:TopNavHeading,
    component:TopNavItem,
    component:TopNavMenu,
    component:TopNavMegaMenuItem,
    component:TopNavMegaMenuFeaturedCard,
    component:TreeListItem,
  ]
architecture: [architecture:public-component-api]
contributing: []
deciding_specs: [spec:AST-005/DEC-1, spec:AST-005/DEC-2]
---

# Navigation destinations contract

## Intent

People should receive the same safe navigation behavior from every Astryx
component that accepts or derives a destination. A component's visual role,
router integration, or enlarged click target must not determine whether a
blocked destination can execute.

## Membership rule

A component belongs when Astryx accepts or derives a destination that the
component can render, delegate, or activate as navigation. Membership follows
that observable responsibility rather than the component's visual category or
which shared hook it currently uses.

A component that only lays out caller-owned links does not join. A component that
creates a fixed same-document link from an Astryx-owned ID does not join unless
it also accepts caller-controlled destination text. Caller-owned JSX, plugin
renderers, and callbacks are outside the boundary after Astryx hands over
control.

- **Current members:** Avatar; BreadcrumbItem; Button link mode; Citation;
  ClickableCard; Item; Link; ListItem; Markdown links; NavHeadingMenuItem;
  SideNavHeading and SideNavItem; navigation-mode Tab; Token link mode;
  TopNavHeading, TopNavItem, TopNavMenu, TopNavMegaMenuItem, and
  TopNavMegaMenuFeaturedCard; and TreeListItem.
- **Collaborators:** `useLinkComponent`, `LinkProvider`,
  `useClickableContainer`, React DOM's native-anchor sanitizer, and Markdown's
  parser/render boundary.
- **Excluded:** Outline's Astryx-generated `#id` links; AppShell's fixed
  skip-to-content fragment; arbitrary links supplied as children; Markdown
  plugin output; image/media/resource URLs; and components that only compose a
  member without accepting or deriving its destination.

Membership is open-ended. A newly shipped Core component that meets the rule
must be added here even when it delegates to an existing member or shared hook.

## Shared owner

- `useLinkComponent` owns destination handoff to native and custom link
  components, including the router-facing `href` and `to` seams.
- `useClickableContainer` owns imperative navigation from enlarged surfaces,
  including same-tab, new-tab, modifier-click, and middle-click paths.
- Markdown owns parsing untrusted source into a destination and preserves the
  shared navigation policy at its render boundary.
- React DOM is the supported native-anchor sanitizer. Astryx owns every path
  React does not mediate.

## Canonical concepts

| Concept            | Values or states                                           | Default semantics                                                                        | Stability |
| ------------------ | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------- | --------- |
| destination source | caller prop, parsed content, Astryx-derived                | caller/parsed values require inspection; fixed Astryx fragments are safe by construction | current   |
| sink               | native anchor, custom router, imperative browser API       | every Astryx-owned sink enforces the same navigation decision                            | current   |
| decision           | accepted or blocked                                        | accepted destinations keep existing behavior; blocked destinations do not navigate       | current   |
| activation         | plain, new-tab, modified, middle-click, programmatic proxy | activation method does not change the decision                                           | current   |
| resource kind      | navigation or embedded/fetched resource                    | this family owns navigation only                                                         | current   |

## Cross-component invariants

- **FR1 — Every caller-controlled navigation destination is decided before its
  sink.** No member may pass a destination to a custom router or imperative
  browser API before the shared rule runs.
- **FR2 — Alternate rendering keeps the rule.** Replacing a native anchor through
  `LinkProvider` or `as` does not bypass destination handling.
- **FR3 — Alternate activation keeps the rule.** `_blank`, Cmd/Ctrl-click,
  middle-click, same-tab assignment, and delegated surface clicks produce the
  same accept/block decision.
- **FR4 — Blocked schemes cannot execute.** After browser-compatible scheme
  normalization, `javascript:`, `vbscript:`, and `data:text/html` do not become
  navigation.
- **FR5 — Accepted destinations retain browser behavior.** Relative paths,
  fragments, protocol-relative destinations, and ordinary schemes continue to
  support native and router navigation, targets, and browser affordances.
- **FR6 — Both custom-router props are sinks.** A supplied `href` and explicit
  `to` are checked independently; neither can bypass the rule through prop
  precedence or rest-prop ordering.
- **FR7 — Disabled and rejected are distinct.** Members keep their own disabled
  semantics. Rejecting a destination prevents navigation without inventing a
  disabled state, label, or visual treatment.
- **FR8 — Resource handling does not inherit navigation policy.** Images, media,
  downloads, CSS URLs, and fetch targets use their own sink-specific contracts.
  A member that handles both navigation and resources applies this family only
  to its navigation path.

## Allowed component variation

- **AV1 — Rejected presentation.** Markdown may render rejected source as text;
  a custom-link member may render without destination props; an enlarged surface
  may simply omit imperative navigation. Each member preserves its own
  non-navigation structure and accessibility contract.
- **AV2 — Native versus router navigation.** Members may use React DOM anchors,
  provider-level router components, per-component `as` overrides, or imperative
  browser APIs when their public contract requires that mode.
- **AV3 — Destination vocabulary.** Public APIs may expose `href`, structured
  item data containing `href`, a Citation `url`, or parsed Markdown syntax. The
  shared behavior does not require renaming released props.
- **AV4 — Target and relationship.** Members retain their existing `target`,
  `rel`, referrer, download, and external-link presentation behavior after a
  destination is accepted.
- **AV5 — Embedded resources.** Markdown and Citation may separately own image
  or resource policy; those decisions do not alter this family's navigation
  matrix.

## Representative matrix

| Member and state                                    | Shared invariant                                          | Deliberate variation                                                      |
| --------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------- |
| `component:Link` / native anchor                    | blocked destination does not execute                      | React DOM performs the native sink sanitization                           |
| `component:Link` / custom provider or `as`          | blocked `href`/`to` does not reach the router             | router owns accepted client-side navigation                               |
| `component:ClickableCard` / plain or modified click | every imperative or delegated exit uses the same decision | visible Card structure and nested-interactive handling remain local       |
| `component:Token` / link with remove action         | surface activation and hidden link agree                  | remove action remains an independent sibling control                      |
| `component:Markdown` / parsed link                  | blocked source does not become navigation                 | rejected source may render as text; resource policy remains separate      |
| navigation aggregate / member item                  | item destination uses the shared owner                    | tree, tab, breadcrumb, side-nav, top-nav, and menu semantics remain local |
| `component:Citation` / linked source                | blocked URL does not execute                              | native-anchor path and citation presentation remain local                 |

## Adoption and exceptions

| Components or surface                             | Adoption                                     | Current deviation or limitation                                                                                |
| ------------------------------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Markdown parsed and rendered links                | shared contract through parser/render checks | parser and renderer maintain separate implementations; conformance must keep navigation decisions aligned      |
| Native React anchors, including Citation          | platform owner                               | relies on the supported React DOM sanitizer rather than the Core predicate                                     |
| `useLinkComponent` custom provider and `as` paths | pending shared owner                         | current `main` forwards raw `href`/`to`; #5524 is the accepted implementation                                  |
| `useClickableContainer` imperative paths          | pending shared owner                         | current `main` sends raw destinations to `window.open`/`window.location`; #5524 is the accepted implementation |
| Components composing the two shared hooks         | inherited                                    | complete only when the relevant shared-owner gap above closes                                                  |

The pending rows are adoption gaps against FR1–FR6, not approved exceptions.
When #5524 lands with exact-head evidence, this table must record shared adoption
and include the new focused tests in `verified_by`.

## Verification map

| Contract           | Verification                                                     | Representative members and states                                                             | Mutation or failure expectation                                                                        |
| ------------------ | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| FR1, FR2, FR6      | `useLinkComponent.test.tsx`                                      | Link, Button, navigation members; provider and `as`; `href` and explicit `to`                 | A custom link receives a blocked destination or rest-prop order restores it                            |
| FR1, FR3, FR4, FR5 | focused `useClickableContainer` tests required by `spec:AST-005` | ClickableCard and Token; plain, target, modified, middle click                                | A blocked imperative call occurs or an ordinary destination loses an activation mode                   |
| FR4, FR5           | `parser.test.ts` and `Markdown.test.tsx`                         | parsed links, reference links, autolinks, mixed case, controls, relative and ordinary schemes | Markdown accepts a blocked scheme or rejects an ordinary navigation destination                        |
| FR1, IR3           | source/member audit required by `spec:AST-005`                   | every caller-controlled Core navigation destination                                           | A new sink or destination-bearing component ships outside this member snapshot                         |
| FR7, FR8           | member-focused behavior and resource suites                      | disabled link modes; Markdown links versus images; Citation link versus image                 | Destination rejection changes disabled semantics or navigation policy silently becomes resource policy |

## Decision links

- `spec:AST-005/DEC-1` — destination safety follows every navigation sink.
- `spec:AST-005/DEC-2` — embedded resources remain a separate policy.

## Open questions

None.

## Content boundary

This file owns navigation-destination membership, the cross-component
accept/block result, and adoption of the shared sinks. It does not duplicate
component prop tables, router implementation details, component-local disabled
or rendering behavior, embedded-resource policy, current audit results, or the
system-spec rationale.
