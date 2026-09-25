---
schema_version: 3
template_version: 2
kind: module
id: module:Markdown/entityReferences
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-09-24
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

| Area            | Contract                                                                                                                                                           |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Public contract | `markdownEntityReferencesPlugin({matchers, render?})` creates one typed plugin from an ordered, non-empty matcher list.                                            |
| Behavior        | Each global regex recognizes eligible prose; its synchronous resolver returns a validated reference or `null`. Earlier claimed spans are opaque to later matchers. |
| End-user impact | Readers get meaningful entity names and optional caller-rendered destinations without losing declined or protected source text.                                    |
| Builder impact  | Builders own source grammar and semantic resolution while Core owns traversal, ordering, validation, rendering fallback, and protected contexts.                   |
| Compatibility   | Additive and opt-in; omitted and empty plugin lists preserve released output.                                                                                      |
| Review checks   | Reject non-global or empty-match patterns, matching in protected contexts, unsafe resolved data, reordering, asynchronous resolution, or hidden fallback text.     |
| Governing rules | [`spec:AST-036` FR1–FR17, FR21–FR24, FR36, FR40](../../../../../docs/specs/AST-036/spec.md); [`component:Markdown`](../Markdown.spec.md).                          |

## Intent

Builders should be able to recognize several product-owned entity grammars and
resolve each match to readable data without preprocessing source or defining a
custom AST transform and renderer for every product.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: additive and opt-in
- Migration decision: `spec:AST-036/DEC-11`

## Ownership boundary

**Owns**

- Ordered matcher execution, regex and result validation, the typed entity node,
  visible label, optional renderer data, and deterministic text projection.
- Complete, streaming, SSR, Storybook, and paired performance evidence.

**Does not own / non-goals**

- Any permanent entity source grammar, finite entity catalog, fetching,
  asynchronous resolution, hover cards, avatars, or product-specific actions.
- Matching inside links, code, images, citations, math, or extension nodes.

## Public API and concepts

| Concept                          | Closed values or states                     | Meaning                                                                         | Default | Owner                              | Stability |
| -------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------- | ------- | ---------------------------------- | --------- |
| `MarkdownEntityReference`        | `id`, `label`, optional `href`              | Validated immutable data attached to one claimed source span.                   | none    | `module:Markdown/entityReferences` | stable    |
| `MarkdownEntityReferenceMatcher` | `pattern`, optional hints, `resolve(match)` | Recognizes one grammar and synchronously resolves or declines each regex match. | none    | `module:Markdown/entityReferences` | stable    |
| `markdownEntityReferencesPlugin` | `{matchers, render?}`                       | Creates one immutable ordered text-transform plugin.                            | none    | `module:Markdown/entityReferences` | stable    |
| `composeMarkdownTransforms`      | ordered transform array                     | Preserves transform order, validation trust, and source-claim fast paths.       | none    | `spec:AST-036`                     | stable    |
| Declined match                   | `resolve(match) === null`                   | Remains eligible for later matchers, then literal if none claim it.             | literal | `module:Markdown/entityReferences` | stable    |

## Behavioral contract

| ID  | Invariant                                                                                                                                          | Basis                     |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| FR1 | Configuration contains at least one matcher; every matcher pattern is global and cloned before use.                                                | `spec:AST-036` FR11       |
| FR2 | Matchers run in declaration order. A resolved span becomes an extension node and is opaque to later matchers; a `null` result remains eligible.    | `spec:AST-036` FR9, FR11  |
| FR3 | A matcher must consume source text. Optional `requiredSubstrings` are conservative skip hints and never change intended grammar.                   | `spec:AST-036` FR11       |
| FR4 | Resolution is synchronous. Every result has a non-empty id and label plus an optional safe href, and is copied and frozen before entering the AST. | `spec:AST-036` FR15, FR17 |
| FR5 | Code, links, images, citations, math, and extension nodes remain opaque; text declined by every matcher remains literal.                           | `spec:AST-036` FR7, FR12  |
| FR6 | The default renderer emits the resolved label; an optional pure renderer may use the validated entity data for product presentation.               | `spec:AST-036` FR14–FR16  |
| FR7 | Matching is deterministic and converges across streaming prefixes.                                                                                 | `spec:AST-036` FR36       |
| FR8 | The factory composes only public `createMarkdownPlugin`, `createMarkdownTextTransform`, and `composeMarkdownTransforms` APIs.                      | `spec:AST-036` FR40       |

## Accessibility contract

- Linked references are ordinary links with the resolved label as their accessible name.
- Unlinked references remain text and add no focus target by default.
- Declined references remain visible rather than disappearing.
- Applications that render interactive presentations own their accessible names,
  focus behavior, and activation semantics; the label remains the text fallback.

## Design relationships

Entity references inherit surrounding Markdown typography by default. Applications
own their grammars, resolution data, presentation, and navigation; Core owns safe
ordered recognition and the deterministic label projection.

## Parent and system relationships

- `component:Markdown` owns protected contexts, parsing, rendering, and fallback.
- `family:navigation-destinations` owns link destination behavior.
- `spec:AST-036` owns transform ordering and extension validation.

## Content boundary

Matchers are caller-owned global JavaScript regular expressions and must avoid
pathological backtracking. Resolution performs no I/O and returns complete entity
data synchronously. Core clones patterns and each accepted result before use.
Rejected promise-like results are observed before the plugin falls back, so an
invalid async resolver cannot create an unhandled rejection during SSR.

## Verification map

| Contract    | Verification                                            | Representative states                                             | Failure expectation                                                       |
| ----------- | ------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------- |
| FR1–FR4     | `entityReferences.test.tsx` AST and validation fixtures | multiple grammars, ordering, decline, cloning, invalid/async data | Wrong precedence, reused regex state, empty claims, or unsafe data fails. |
| FR5–FR6     | DOM and SSR fixtures                                    | links, labels, null renderer, code, authored links                | Protected claims, missing labels, or changed null semantics fail.         |
| FR7         | prefix-by-prefix parser fixture                         | opening marker, partial id, closing delimiter, suffix             | Oscillation or final mismatch fails.                                      |
| Performance | paired entity-reference Markdown Performance profile    | none, sparse, dense; complete and streaming                       | Different paired source or missing baseline delta fails.                  |

## Decision log

### DEC-1 — Keep resolution synchronous and application-owned

**Reference:** `module:Markdown/entityReferences/DEC-1`
**Decider:** `cixzhang`, `2026-09-22`

Synchronous resolution keeps parsing deterministic, server-safe, and easy to
benchmark. Applications may close over a finite catalog or derive data directly
from regex captures; asynchronous lookup happens outside Markdown rendering.

Rejected: asynchronous resolution, network access, and a global entity registry.

### DEC-2 — Configure ordered matchers instead of one permanent grammar

**Reference:** `module:Markdown/entityReferences/DEC-2`
**Decider:** `cixzhang`, `2026-09-24`

Products recognize several entity families with different source grammars. The
plugin therefore accepts ordered regex matchers: earlier successful matches win,
while `null` permits later matchers to try the same text. `@{id}` is an example,
not syntax owned by Astryx.

Rejected: permanently owning `@{id}`; requiring one finite catalog; separate
first-party plugins for each entity family.

### DEC-3 — Preserve helper guarantees when composing matchers

**Reference:** `module:Markdown/entityReferences/DEC-3`
**Decider:** `cixzhang`, `2026-09-24`

The public `composeMarkdownTransforms` helper retains source-claim skips and
validated-output trust only when every input transform carries those guarantees.
It also marks source as changed between transforms so later hints cannot skip text
introduced by an earlier transform. The entity factory uses this public helper;
first-party plugins receive no composition privilege unavailable to builders.

Rejected: a private first-party trust marker; a plain wrapper that revalidates the
whole tree and loses no-match fast paths.

## Open questions

None.
