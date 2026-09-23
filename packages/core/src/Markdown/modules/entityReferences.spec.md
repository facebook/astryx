---
schema_version: 3
template_version: 2
kind: module
id: module:Markdown/entityReferences
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-09-22
owners: [cixzhang]
review_triggers: [public-api, behavior, accessibility, navigation]
verified_by:
  [
    packages/core/src/Markdown/plugins/entityReferences.test.tsx,
    apps/sandbox/src/app/(fullscreen)/pages/markdown-perf/benchmarkProfiles.test.ts,
  ]
parent_component: component:Markdown
references: [spec:AST-036/DEC-1, spec:AST-036/DEC-11]
---

# Markdown entity-references module contract

## Contract at a glance

| Area            | Contract                                                                                                                                      |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract | `createMarkdownEntityReferencesPlugin({references, render?})` creates one typed plugin for a caller-owned entity catalog.                     |
| Behavior        | Eligible `@{id}` prose becomes the configured label and optional caller-rendered destination; unknown ids remain literal.                     |
| End-user impact | Readers get meaningful entity names and, when configured by the application, destinations without losing unresolved source text.              |
| Builder impact  | Builders provide unique ids, non-empty labels, optional data, and an optional pure renderer; no custom parser or AST transform is required.   |
| Compatibility   | Additive and opt-in; omitted and empty plugin lists preserve released output.                                                                 |
| Review checks   | Reject matching in code, links, images, citations, math, or extension nodes; unsafe mutation; duplicate/invalid ids; or hidden fallback text. |
| Governing rules | [`spec:AST-036` FR1–FR17, FR21–FR24, FR36, FR40](../../../../../docs/specs/AST-036/spec.md); [`component:Markdown`](../Markdown.spec.md).     |

## Intent

Builders should be able to resolve stable entity identifiers to readable labels
and optional destinations without preprocessing source or defining a custom AST
transform and renderer for each product.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: additive and opt-in
- Migration decision: `spec:AST-036/DEC-11`

## Ownership boundary

**Owns**

- The `@{id}` reference grammar, catalog validation, typed node, visible label, optional renderer data, and deterministic text projection.
- Complete, streaming, SSR, Storybook, and paired performance evidence.

**Does not own / non-goals**

- Fetching, asynchronous resolution, hover cards, avatars, product-specific actions, or arbitrary syntax.
- Matching inside links, code, images, citations, math, or extension nodes.

## Public API and concepts

| Concept                                | Closed values or states        | Meaning                                                                | Default | Owner                              | Stability |
| -------------------------------------- | ------------------------------ | ---------------------------------------------------------------------- | ------- | ---------------------------------- | --------- |
| `MarkdownEntityReference`              | `id`, `label`, optional `href` | One caller-owned entity mapping.                                       | none    | `module:Markdown/entityReferences` | stable    |
| `createMarkdownEntityReferencesPlugin` | `{references, render?}`        | Creates an immutable text-transform plugin with a label-only fallback. | none    | `module:Markdown/entityReferences` | stable    |
| Unknown id                             | literal `@{id}`                | Preserves unresolved authored text.                                    | literal | `module:Markdown/entityReferences` | stable    |

## Behavioral contract

| ID  | Invariant                                                                                                                                    | Basis                     |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| FR1 | Only exact configured `@{id}` references in eligible prose become entity nodes.                                                              | `spec:AST-036` FR1, FR11  |
| FR2 | Unknown, malformed, or protected-context references remain literal.                                                                          | `spec:AST-036` FR7, FR12  |
| FR3 | The default renderer emits the configured label; an optional pure renderer may use the entity data to create a link or product presentation. | `spec:AST-036` FR14–FR15  |
| FR4 | Labels provide the visible, accessible, and text-projection value.                                                                           | `spec:AST-036` FR14, FR16 |
| FR5 | Matching is synchronous, deterministic, and converges across streaming prefixes.                                                             | `spec:AST-036` FR36       |
| FR6 | The factory composes only public `createMarkdownPlugin` and `createMarkdownTextTransform` APIs.                                              | `spec:AST-036` FR40       |

## Accessibility contract

- Linked references are ordinary links with the configured label as their accessible name.
- Unlinked references remain text and add no focus target.
- Unknown references remain visible rather than disappearing.

## Design relationships

Entity references inherit surrounding Markdown typography by default. Applications
that provide a renderer own its presentation and navigation while the configured
label remains the deterministic text projection.

## Parent and system relationships

- `component:Markdown` owns protected contexts, parsing, rendering, and fallback.
- `family:navigation-destinations` owns link destination behavior.
- `spec:AST-036` owns transform ordering and extension validation.

## Content boundary

The factory copies a finite caller-provided catalog. Matching is limited to one
line between `@{` and `}` and performs no I/O or asynchronous lookup.

## Verification map

| Contract    | Verification                                           | Representative states                             | Failure expectation                                                       |
| ----------- | ------------------------------------------------------ | ------------------------------------------------- | ------------------------------------------------------------------------- |
| FR1–FR4     | `entityReferences.test.tsx` AST, DOM, and SSR fixtures | linked, unlinked, unknown, code, link             | Wrong claim, missing label, unsafe destination, or hidden fallback fails. |
| FR5         | prefix-by-prefix parser fixture                        | opening marker, partial id, closing brace, suffix | Oscillation or final mismatch fails.                                      |
| Performance | paired entity-reference Markdown Performance profile   | none, sparse, dense; complete and streaming       | Different paired source or missing baseline delta fails.                  |

## Decision log

### DEC-1 — Configure a finite catalog, not a runtime resolver

**Reference:** `module:Markdown/entityReferences/DEC-1`
**Decider:** `cixzhang`, `2026-09-22`

A finite catalog keeps parsing synchronous, deterministic, serializable, and
easy to benchmark. Products that need asynchronous lookup can build the catalog
before rendering.

Rejected: asynchronous resolution, network access, and global entity registries.

## Open questions

None.
