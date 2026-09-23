---
schema_version: 3
template_version: 2
kind: module
id: module:Markdown/callouts
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-09-22
owners: [cixzhang]
review_triggers: [public-api, behavior, accessibility]
verified_by:
  [
    packages/core/src/Markdown/plugins/callouts.test.tsx,
    packages/core/src/Markdown/plugins/protocol.test.tsx,
    apps/sandbox/src/app/(fullscreen)/pages/markdown-perf/benchmarkProfiles.test.ts,
  ]
parent_component: component:Markdown
references: [spec:AST-036/DEC-5, spec:AST-036/DEC-11]
---

# Markdown callouts module contract

## Contract at a glance

| Area            | Contract                                                                                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract | `markdownCalloutsPlugin`, `MarkdownCalloutNode`, and `MarkdownCalloutVariant` are exported from `@astryxdesign/core/Markdown/plugins`.                              |
| Behavior        | Complete-line `:::note`, `:::tip`, `:::warning`, and `:::danger` fences create flow containers with an optional plain-text title and Core-parsed Markdown children. |
| End-user impact | Readers get visually distinct, readable supplementary content without static documents announcing it as a live alert.                                               |
| Builder impact  | Builders add one fixed plugin; authored source owns the variant and optional title.                                                                                 |
| Compatibility   | Additive and opt-in; omitted and empty plugin lists preserve released parsing, DOM, accessibility, and streaming behavior.                                          |
| Review checks   | Reject raw child parsing by the plugin, unbounded or partial-line claims, live-region semantics, lost child fallback, or special first-party protocol privileges.   |
| Governing rules | [`spec:AST-036` FR1–FR17, FR21–FR25, FR36, FR40](../../../../../docs/specs/AST-036/spec.md); [`component:Markdown`](../Markdown.spec.md).                           |

## Intent

Builders need a stable way to place rich Markdown inside notes, tips, warnings,
and danger callouts without preprocessing source or weakening Markdown's parser,
rendering, and accessibility guarantees.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: additive and opt-in
- Migration decision: `spec:AST-036/DEC-11`

## Ownership boundary

**Owns**

- The four callout variants, optional title grammar, static presentation, and text projection.
- Complete, streaming, SSR, Storybook, and paired performance evidence.

**Does not own / non-goals**

- Live alerts, dismissible notifications, arbitrary variants, Markdown in titles, or product-specific actions.
- Parsing child nodes inside plugin code; Core exclusively parses and validates the declared source range.

## Public API and concepts

| Concept                  | Closed values or states               | Meaning                                                   | Default             | Owner                      | Stability |
| ------------------------ | ------------------------------------- | --------------------------------------------------------- | ------------------- | -------------------------- | --------- |
| `markdownCalloutsPlugin` | one fixed plugin value                | Enables callout block syntax and rendering.               | absent              | `module:Markdown/callouts` | stable    |
| `MarkdownCalloutVariant` | `note`, `tip`, `warning`, `danger`    | Selects the semantic label and themed static treatment.   | none                | `module:Markdown/callouts` | stable    |
| Title                    | optional plain text after the variant | Names the visible callout and its complementary landmark. | capitalized variant | `module:Markdown/callouts` | stable    |

## Behavioral contract

| ID  | Invariant                                                                                                    | Basis                     |
| --- | ------------------------------------------------------------------------------------------------------------ | ------------------------- |
| FR1 | Openers and closers occupy complete lines; up to three leading spaces and LF, CRLF, or lone CR are accepted. | `spec:AST-036` FR7, FR25  |
| FR2 | Nested callouts balance; fence-looking lines inside backtick or tilde code fences stay code.                 | `spec:AST-036` FR7, FR25  |
| FR3 | Core parses the exact inner source range as flow content and validates children and container depth.         | `spec:AST-036` DEC-5      |
| FR4 | An unclosed final callout stays literal; an unfinished stream defers and converges when closed.              | `spec:AST-036` FR12, FR36 |
| FR5 | Missing or failed rendering preserves validated Markdown children.                                           | `spec:AST-036` FR14       |
| FR6 | The plugin uses only the public syntax and renderer contracts.                                               | `spec:AST-036` FR40       |

## Accessibility contract

- The visible title names an `aside`; source order and nested Markdown semantics remain intact.
- Static callouts never add `alert`, `status`, or `aria-live` behavior.
- Variant is communicated by title text, not color alone.

## Design relationships

Callouts use Markdown spacing and Astryx theme tokens. Their static document
semantics are intentionally distinct from Banner's event-driven live-region
behavior.

## Parent and system relationships

- `component:Markdown` owns child parsing, rendering, fallback, and streaming.
- `spec:AST-036` owns extension-container validation and plugin ordering.
- Outline keeps its released top-level heading scope; headings inside callouts do not become Outline entries.

## Content boundary

A callout may contain up to 100,000 UTF-16 code units from opener to closer.
Titles are plain text; child content is parsed only by Core using the active
Markdown configuration.

## Verification map

| Contract      | Verification                                        | Representative states                                                  | Failure expectation                                            |
| ------------- | --------------------------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------- |
| FR1–FR3       | `callouts.test.tsx` and protocol container fixtures | all variants, custom/default titles, CRLF, nesting, lists, links, code | Invalid boundaries, wrong children, or code-fence claims fail. |
| FR4–FR5       | streaming and renderer-fallback fixtures            | every prefix, unclosed final, failed renderer                          | Oscillation, swallowed source, or lost children fails.         |
| Accessibility | DOM and SSR assertions plus Storybook               | warning content, link, list, static render                             | Live-region roles or inaccessible title fails.                 |
| Performance   | paired callout profile in Markdown Performance      | none, sparse, dense; complete and streaming                            | Different paired source or missing baseline delta fails.       |

## Decision log

### DEC-1 — Ship one fixed static callout plugin

**Reference:** `module:Markdown/callouts/DEC-1`
**Decider:** `cixzhang`, `2026-09-22`

A constrained grammar and fixed renderer keep authored callouts portable and
predictable. Product-specific actions and event announcements remain outside
Markdown.

Rejected: Banner composition with live-region behavior; arbitrary renderer
configuration; raw child parsing in the plugin; Markdown titles.

## Open questions

None.
