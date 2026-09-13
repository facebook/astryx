---
schema_version: 1
template_version: 1
kind: system-spec
id: spec:AST-005
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-08-31
phase: accepted
owners: [cixzhang, imdreamrunner]
affects_architecture: [architecture:public-component-api]
affects_families: [family:navigation-destinations]
affects_contributing: []
affects_consumer_docs:
  [Link, Button, ClickableCard, Item, List, Token, Markdown]
---

# Safe navigation destinations

## Intent

A person activating an Astryx link should get the same destination safety no
matter which component drew it, whether navigation is native or imperative, and
whether a framework router replaced the native anchor. Component composition
must not create a path around the shared rule.

This spec accepts the shared navigation-destination contract. Current `main`
already protects Markdown and native React anchors, but custom `LinkProvider`
components and `useClickableContainer` imperative navigation do not yet apply the
same rule. `family:navigation-destinations` records those adoption gaps until the
implementation and verification land.

## Non-goals

- Validating URL syntax, requiring absolute URLs, or restricting destinations to
  an allowlist of hosts.
- Defining policy for image, media, download, CSS, fetch, or other embedded
  resource URLs. Those sinks have different capabilities and content-type risks.
- Sanitizing caller-owned JSX, custom Markdown plugin output, or arbitrary
  consumer callbacks after control has left Astryx.
- Replacing Content Security Policy, router authorization, server validation, or
  application-level access control.
- Adding a public prop that lets a component bypass or configure the rule.
- Changing link labels, target/rel behavior, disabled semantics, or ordinary URL
  resolution.

## Requirements

- **FR1 — One rule covers every Astryx-owned navigation exit.** Before Astryx
  renders, delegates, or imperatively activates a caller-controlled navigation
  destination, the destination MUST pass the contract in this spec. Moving from
  a native anchor to a router component or enlarged clickable surface MUST NOT
  weaken that contract.
- **FR2 — Inspection follows browser scheme normalization.** Scheme inspection
  MUST remove ASCII control characters `U+0000–U+001F` and `U+007F`, trim outer
  whitespace, and compare ASCII scheme text case-insensitively. This prevents a
  blocked scheme from being hidden by characters the browser ignores.
- **FR3 — Executable document schemes are blocked.** A normalized navigation
  destination beginning with `javascript:`, `vbscript:`, or `data:text/html`
  MUST NOT become executable navigation. The check applies before query, hash,
  target, modifier-key, or pointer-button differences can select another sink.
- **FR4 — Ordinary destinations keep working.** Relative paths, same-document
  fragments, protocol-relative URLs, and ordinary schemes such as `http:`,
  `https:`, `mailto:`, and `tel:` MUST retain their existing navigation behavior.
  This contract does not rewrite, resolve, or host-filter accepted destinations.
- **FR5 — Native, custom, and imperative paths are all covered.** The contract
  MUST hold for React DOM anchors, a custom component supplied through
  `LinkProvider` or an `as` seam, and imperative exits including `window.open`
  and `window.location`. Middle-click and Cmd/Ctrl-click are not exceptions.
- **FR6 — Rejection fails closed at the navigation boundary.** A blocked
  destination MUST NOT be handed to a navigation-capable custom-router prop or
  imperative browser API. The component MAY preserve non-navigation rendering
  and consumer callbacks when doing so cannot activate the rejected destination.
- **FR7 — Router destination props are independent sinks.** When a custom link
  component can receive both `href` and `to`, each supplied value MUST pass the
  rule independently. An explicit safe `to` MAY retain its documented precedence;
  an unsafe explicit `to` MUST NOT ride through a rest-prop spread or fall back to
  an unrelated unchecked value.
- **FR8 — Parser and rendering checks agree for navigation.** Markdown parsing,
  Markdown link rendering, and shared Core navigation plumbing MUST reject the
  same blocked navigation schemes after the same normalization. Markdown MAY use
  a stricter policy for embedded resource URLs without narrowing this navigation
  contract.
- **IR1 — Shared exits use a shared owner.** Core components that delegate links
  or navigate imperatively MUST use one shared policy owner rather than maintain
  component-local blocked-scheme lists. Parser-local implementations MAY remain
  separate only while conformance tests pin the same navigation matrix.
- **IR2 — Every distinct sink has mutation-sensitive coverage.** Verification
  MUST fail when the guard is removed from custom `href`, custom `to`, new-tab,
  modified-click, middle-click, plain imperative navigation, or Markdown link
  parsing/rendering.
- **IR3 — New navigation surfaces join the family.** A new component or hook that
  accepts a caller-controlled navigation destination MUST join
  `family:navigation-destinations` and reuse the shared owner before shipping.

### Platform support

- Supported feature/engine floor: every browser and framework-link integration
  supported by Astryx Core.
- Unsupported behavior: a custom component that ignores the filtered destination
  props or manufactures a destination from other caller data is outside the
  guarantee; Astryx MUST NOT claim that caller-owned behavior is sanitized.
- Browser evidence: real Chromium verifies that blocked native and imperative
  destinations do not execute and that ordinary relative, external, modified,
  and middle-click navigation remains available. Unit integration tests verify
  custom router props without requiring a particular router package.

## Current-state impact

`family:navigation-destinations` is the complete shared owner for the behavior.
Its membership covers every current Core component that accepts or derives a
navigation destination, including aggregate component records whose public
members own the actual `href`.

Current `main` has three implementations:

1. React DOM protects native anchor `href` values.
2. Markdown checks parsed and rendered destinations before creating links.
3. Custom `LinkProvider` components and `useClickableContainer` imperative exits
   currently receive raw destinations; this is the gap addressed by #5524.

Implementation of this accepted spec must:

1. add one shared Core navigation predicate for custom-link and imperative exits;
2. apply it to `href` and explicit `to` before custom link delegation;
3. apply it before every `window.open` and `window.location` assignment in
   `useClickableContainer`;
4. preserve the existing safe ordinary-destination behavior and the delegated
   `interactiveRef.click()` path;
5. keep Markdown's navigation rule conformant while leaving embedded-resource
   policy separate; and
6. update `family:navigation-destinations` from partial adoption to shared
   adoption when exact-head verification is green.

No component-local public prop is added. Consumer documentation should state the
shared outcome where a component documents an `href` or router seam; it should
link to the shared rule rather than reproduce a scheme list in every prop row.

## Verification

| Contract           | Verification                                       | Representative states                                                                                           | Mutation or failure expectation                                                                       |
| ------------------ | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| FR2, FR3, FR4, FR8 | Shared predicate and Markdown parser/render suites | mixed case; embedded controls; relative/hash; http(s); mailto/tel; blocked schemes                              | Removing normalization or changing one blocked prefix makes the navigation matrices disagree          |
| FR5, FR6, FR7      | `useLinkComponent` integration tests               | native anchor; provider component; `as`; safe/unsafe `href`; safe/unsafe explicit `to`                          | A blocked value reaches `href` or `to`, or an ordinary explicit `to` loses precedence                 |
| FR1, FR3, FR5, FR6 | `useClickableContainer` integration tests          | plain click; `_blank`; Cmd/Ctrl-click; middle-click; delegated interactive ref                                  | A blocked value reaches `window.open`/`window.location`, or an ordinary navigation path stops working |
| FR1, IR1, IR3      | Family membership and source-usage audit           | every current `useLinkComponent`, `useClickableContainer`, Markdown, and direct native-anchor destination owner | A new caller-controlled navigation sink ships outside the family or duplicates a local rule           |
| Browser contract   | Real Chromium probe                                | native anchor, custom-router stand-in, imperative same-tab/new-tab, modified and middle click                   | Script executes, blocked navigation occurs, or ordinary browser affordances regress                   |

### Completion criteria

This spec moves from `accepted` to `shipped` only when:

- every adoption gap in `family:navigation-destinations` is closed or documented
  as an explicit owner-approved exception;
- exact-head tests cover each distinct custom and imperative sink;
- a source/member audit finds no caller-controlled Core navigation exit outside
  the family; and
- consumer docs describe the shared outcome without implying that embedded
  resources or caller-owned renderers receive the same policy.

## Decision log

### DEC-1 — Destination safety follows the navigation sink

**Reference:** `spec:AST-005/DEC-1`
**Decider:** `cixzhang`, `2026-08-31`

Every Astryx-owned path that can activate a caller-controlled navigation
destination follows one normalized blocked-scheme rule. The guarantee survives
component composition, custom framework routers, modified clicks, middle clicks,
and imperative navigation because those are alternate exits for the same user
intent.

Rejected: relying only on React DOM. React can protect an `href` it renders, but
it does not inspect props handed to a custom router and does not mediate
`window.open` or `window.location`.

### DEC-2 — Embedded resources remain a separate policy

**Reference:** `spec:AST-005/DEC-2`
**Decider:** `cixzhang`, `2026-08-31`

Navigation destinations and embedded resources are separate sink families. This
spec blocks executable document schemes for navigation without deciding which
`data:` media types, image sources, downloads, or fetched resources are allowed.
Markdown may therefore reject a broader resource set while matching the shared
navigation matrix.

Rejected: one undifferentiated “safe URL” boolean for every URL-shaped value.
That hides material differences between navigating a document and embedding or
fetching a resource, and would accidentally broaden or narrow unrelated public
behavior.

## Open questions

None.
