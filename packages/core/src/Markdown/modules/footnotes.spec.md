---
schema_version: 3
template_version: 2
kind: module
id: module:Markdown/footnotes
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [public-api, behavior, accessibility, navigation, theming]
verified_by:
  [
    packages/core/src/Markdown/parser.test.ts,
    packages/core/src/Markdown/incremental.test.ts,
    packages/core/src/Markdown/Markdown.test.tsx,
    packages/core/src/Markdown/Markdown.public.test.ts,
    packages/core/src/Markdown/preparedDocument.public.test.ts,
    packages/core/src/Markdown/remark.test.tsx,
  ]
parent_component: component:Markdown
references:
  [family:navigation-destinations, spec:AST-036/DEC-2, spec:AST-036/DEC-10]
---

# Markdown footnotes module contract

## Contract at a glance

| Area            | Contract                                                                                                                                                                                                                                                                                  |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract | `footnotes="github"` enables Core-owned block footnotes; matching parser and prepared-document options expose explicit footnote-enabled result unions.                                                                                                                                    |
| Behavior        | Resolved `[^label]` references link to one end-of-document definition numbered by first rendered reference; every occurrence has one backlink.                                                                                                                                            |
| End-user impact | Readers get native, keyboard-operable, localized footnote navigation without raw HTML, generated custom-renderer markup, or a second scrolling model.                                                                                                                                     |
| Builder impact  | Builders opt in explicitly. Omission leaves every source byte, parser union, AST value, DOM node, heading ID, and streaming cache on the released path.                                                                                                                                   |
| Compatibility   | Additive and block-only. Existing headings allocate IDs first; authored links keep `components.link`, while generated footnote links compose the configured `LinkProvider` and `onLinkClick`.                                                                                             |
| Review checks   | Reject implicit enablement, inline display, plugin-owned footnotes, unresolved-reference swallowing, duplicate-definition data loss, heading-ID changes, unstable repeated-reference IDs, missing backlinks, source-order numbering drift, Remark approximation, or streaming divergence. |
| Governing rules | [`spec:AST-036` FR3, FR7, FR9–FR16, FR24, FR32, FR36, FR41](../../../../../docs/specs/AST-036/spec.md); [`component:Markdown`](../Markdown.spec.md); [`family:navigation-destinations`](../../../../../docs/families/navigation-destinations.md).                                         |

This table is a review projection; the body below is authoritative.

## Intent

Long-form Markdown should support conventional note references without requiring
raw HTML, source preprocessing, a plugin-specific AST, or hand-authored fragment
links. Footnote parsing, identity, navigation, fallback, and accessibility stay in
Core because they coordinate the whole document and share its ID namespace.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: additive, explicit, and block-only
- Migration decision: `spec:AST-036/DEC-10`

No existing caller migrates. A builder opts in only where `[^label]` should be
interpreted as footnote syntax.

## Ownership boundary

**Owns**

- The `footnotes="github"` component mode and matching parser option.
- Footnote definition/reference grammar, normalization, canonical nodes, released
  opt-in projections, streaming invalidation, and prepared-document reuse.
- Document-global numbering, fragment IDs, repeated-reference backlinks, native
  navigation, localized accessible names, and the `markdown-footnotes` theme target.
- Literal fallback for unresolved references, malformed definitions, and duplicate
  definitions after the first.

**Does not own / non-goals**

- Inline Markdown display, nested definition declarations, raw HTML notes, named or
  inline notes, citations, link-reference definitions, endnotes imported from another
  document, or arbitrary CommonMark/GFM conformance outside the grammar below.
- A footnote renderer slot or plugin capability. Core owns the semantic structure and
  navigation; custom renderers cannot replace only part of it.
- Remark footnote compatibility. The separate adapter continues to reject
  `footnoteDefinition` and `footnoteReference` trees rather than approximating them.
- Programmatic focus or scrolling, history mutation, tooltip previews, popovers, or
  disclosure behavior.

## Public API and concepts

| Concept                         | Closed values or states                                          | Meaning                                                                                      | Default        | Owner                       | Stability |
| ------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------- | --------------------------- | --------- |
| `Markdown.footnotes`            | absent or `'github'`                                             | Enables block definition/reference parsing and Core rendering.                               | absent         | `module:Markdown/footnotes` | stable    |
| Parser `footnotes`              | absent or `'github'`                                             | Selects explicit footnote-enabled parser result families.                                    | absent         | `module:Markdown/footnotes` | stable    |
| Canonical reference             | `{type: 'footnoteReference', identifier, label}`                 | One resolved source reference; `identifier` is normalized and `label` preserves source text. | none           | `module:Markdown/footnotes` | stable    |
| Canonical definition            | `{type: 'footnoteDefinition', identifier, label, children}`      | One first-wins top-level definition with ordinary block children.                            | none           | `module:Markdown/footnotes` | stable    |
| Released opt-in result families | footnotes, or math plus footnotes                                | Preserve narrow default unions while representing the two new node kinds recursively.        | legacy unions  | `module:Markdown/footnotes` | stable    |
| Prepared document               | `PrepareMarkdownDocumentOptions.footnotes: 'github'`             | Stores the parsed nodes and matching identity projection once.                               | absent         | `component:Markdown`        | stable    |
| Footnote section theme target   | `markdown-footnotes`                                             | Reaches the generated end-of-document section; links retain Link ownership.                  | absent section | `module:Markdown/footnotes` | stable    |
| Remark adapter                  | unsupported for a tree containing either canonical footnote node | Fails closed to the pre-adapter document with one adapter diagnostic.                        | rejected       | `module:Markdown/remark`    | stable    |

`FootnoteParseOptions` and `MathFootnoteParseOptions` are distinct from
`ParseOptions` and `MathParseOptions`. Their incremental forms pair with
`createIncrementalState<false, true>()` and
`createIncrementalState<true, true>()`. The exported recursive result aliases are
`InlineNodeWithFootnotes`, `BlockNodeWithFootnotes`,
`InlineNodeWithMathAndFootnotes`, and `BlockNodeWithMathAndFootnotes`. A boolean
or widened string is not an accepted opt-in.

## Source grammar

1. A definition opener is a top-level block-boundary line with zero to three leading
   spaces, `[^`, a non-empty label, `]:`, and optional first-line content.
2. Labels are at most 999 source characters, contain no unescaped `[` or `]`, and
   contain no line ending. Backslash escapes preserve the escaped label character.
3. Matching trims leading/trailing Unicode whitespace, collapses internal whitespace
   runs to one ASCII space, lowercases without locale input, and NFC-normalizes. An
   empty normalized identifier is invalid.
4. A definition continues across immediately following lines indented by at least two
   spaces or one tab. A blank line belongs only when the next nonblank line is such an
   indented continuation. The continuation indent is removed before its body is parsed.
5. The combined body must contain non-whitespace content. It is parsed as ordinary
   block Markdown under the same citations, autolinks, math, and native plugin syntax,
   but nested footnote declarations and references remain literal.
6. Definitions inside a list item, blockquote, table, fenced code block, display math,
   or another definition are literal source. A definition cannot interrupt a paragraph.
7. Definitions match case-insensitively after normalization. The first valid definition
   wins; a later duplicate and all of its source remain ordinary Markdown rather than
   disappearing.
8. A reference is `[^label]` in eligible phrasing. It becomes a node only when a winning
   definition exists. Unresolved, malformed, escaped, code-contained, image-contained,
   link-label, and definition-body forms remain literal.

This profile uses GitHub's familiar marker and two-space continuation form; the name
selects that source dialect, not a promise that every GitHub rendering extension is
part of Astryx Markdown.

## Behavioral contract

| ID   | Invariant                                                                                                                                                                                                                                                           | Basis                          |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| FR1  | Footnote syntax is recognized only with the exact `'github'` opt-in and only for block documents; inline display rejects the option.                                                                                                                                | additive API                   |
| FR2  | Canonical nodes use MDAST-aligned `footnoteReference` and `footnoteDefinition` names and fields. Default released parser calls stay on their existing unions; explicit opt-ins return recursive footnote or math-plus-footnote families.                            | `spec:AST-036` FR3, FR9, FR32  |
| FR3  | Grammar and protected contexts follow the eight source rules above. Unresolved references and later duplicate definitions remain literal, copyable Markdown.                                                                                                        | readable fallback              |
| FR4  | Numbering follows the first rendered resolved reference after native transforms. Repeated references share one number and definition; unreferenced definitions produce no rendered section item.                                                                    | document semantics             |
| FR5  | Every rendered reference has one unique fragment target and every rendered definition has backlinks to all of its references, in source/render order. Navigation uses native fragments and does not move focus or call `scrollIntoView`.                            | accessibility, navigation      |
| FR6  | Top-level heading IDs allocate first and remain byte-for-byte unchanged. Footnote definition and reference IDs then reserve the same document-global namespace, use normalized Unicode slugs with deterministic fallback/suffixes, and never collide with headings. | `spec:AST-036` FR15–FR16       |
| FR7  | Generated reference and backlink controls use Core Link, the configured `LinkProvider`, and `onLinkClick`; `components.link` remains limited to authored Markdown links.                                                                                            | navigation ownership           |
| FR8  | A native transform may read, move, or remove parsed footnote nodes and transform definition descendants, but cannot mint, duplicate, or change a reference/definition's Core-owned identifier or label.                                                             | `spec:AST-036` FR10–FR15       |
| FR9  | The Remark adapter remains fail-closed for either footnote node, including an otherwise no-op plugin. It never translates footnotes into ordinary links or drops definitions.                                                                                       | `spec:AST-036` FR18–FR20, FR41 |
| FR10 | Prepared documents retain their footnote projection and render without reparsing. Source and prepared rendering produce identical numbering, IDs, DOM semantics, and navigation.                                                                                    | `component:Markdown` FR26      |
| FR11 | Incremental output converges at every character boundary. A definition remains in the mutable tail until its continuation is closed; changes to the effective definition-label set invalidate settled references, while unchanged settled nodes retain reuse.       | `spec:AST-036` FR13, FR36      |
| FR12 | Omission preserves current parse work and output. Enabled definition collection is linear in the mutable/full input, and identity projection visits the transformed tree once; there is no per-reference document scan.                                             | optional-work contract         |

## Rendering and navigation contract

- A resolved reference renders as one superscript native fragment Link whose visible
  text is the assigned number and whose localized accessible name identifies that
  footnote.
- Referenced definitions render once in an ordered list inside a labelled semantic
  section after all ordinary visible blocks, ordered by first reference rather than
  definition placement.
- Definition children use the same built-in block renderers, density, content width,
  content alignment, plugin renderers, authored-link override, and math renderer as
  the owning document. Definition declaration nodes never render at their source
  position.
- Each definition ends with one Core backlink Link per reference occurrence. A repeated
  occurrence receives a distinct localized accessible name and stable target.
- `onLinkClick` may prevent default navigation by returning `false`, exactly as for
  existing Markdown links and heading permalinks.
- If a transform removes a once-resolved definition, surviving references render their
  literal `[^label]` source. If it removes every reference, the definition stays hidden.

## Accessibility contract

- **AR1 — native relationships.** Every reference and backlink is an ordinary `href`
  fragment pair with a unique target; keyboard, assistive technology, browser history,
  and no-JavaScript behavior use native navigation.
- **AR2 — named region.** The generated footnote section is a labelled semantic region
  containing one ordered list. The label, reference names, and backlink names are
  localized.
- **AR3 — stable reading order.** Definition order follows first reference order and
  definition content preserves its authored block order. Repeated references do not
  duplicate definition prose.
- **AR4 — no surprise focus.** Activating a link never programmatically moves focus.
  The browser owns fragment scrolling and focus behavior.
- **AR5 — no replacement seam.** Core keeps the list and navigation semantics intact;
  authored content may still use existing block and inline renderer seams inside each
  definition.

## Design relationships

| Anatomy          | Design requirement                                                                   | Theme ownership              |
| ---------------- | ------------------------------------------------------------------------------------ | ---------------------------- |
| Reference        | Compact superscript number, visually subordinate but visibly interactive.            | Link + Markdown local layout |
| Footnote section | Separated from body content, readable at the same prose measure, compact by default. | `markdown-footnotes`         |
| Definition       | Ordered marker aligns with multi-block note content and wraps without overflow.      | Footnote section             |
| Backlink         | Compact secondary action after definition content; repeated links stay distinct.     | Link + Markdown local layout |

The section adds one public Markdown target, `markdown-footnotes`. Reference and
backlink Links retain Link's existing target and do not create separate Markdown
theme targets.

## Parent and system relationships

- `component:Markdown` owns aggregate parsing/rendering, block presentation, existing
  custom renderer precedence, and prepared documents.
- `spec:AST-036` owns canonical AST and plugin validation. Footnote nodes are Core-owned
  built-ins, never plugin extension nodes.
- `module:Markdown/remark` remains intentionally narrower and rejects footnote trees.
- `module:Outline/parseOutlineFromMarkdown` continues to project only top-level
  headings. Footnote definitions and headings nested inside them never create Outline
  items.
- `family:navigation-destinations` owns native-link and LinkProvider behavior.

## Content boundary

This module reads only the Markdown string supplied to the current parse or render.
Normalized labels and generated fragment IDs remain in the returned in-process tree or
DOM; Astryx performs no lookup, persistence, network request, or cross-document
resolution.

## Verification map

| Contract       | Verification                                                                                          | Representative states                                                                                                                        | Failure expectation                                                                                            |
| -------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Grammar/AST    | Parser canonical and released-projection fixtures                                                     | omitted/enabled, escaped/malformed, multiline, LF/CRLF, protected contexts, nested declarations, duplicates, unresolved, math/plugins        | Default union/output widening, swallowed source, wrong first winner, or invalid placement fails.               |
| Identity       | Deterministic projection fixtures                                                                     | duplicate labels, repeated references, Unicode/punctuation labels, heading collisions, transformed order, removed definitions                | Changed heading ID, duplicate DOM ID, unstable suffix, wrong number, or nonliteral orphan fails.               |
| Rendering/a11y | DOM, role/name, focusability, LinkProvider, `onLinkClick`, theme-target, SSR, and accessibility tests | one/many/unreferenced notes, repeated references, custom authored-link/heading/paragraph renderers, default/document variants, RTL-ready CSS | Missing region/list/link semantics, custom-link takeover, imperative scroll/focus, or inaccessible link fails. |
| Streaming      | Every-character full/incremental parity and reuse fixtures                                            | reference before definition, growing continuation, definition removal/replacement, terminal incomplete input, LF/CRLF, math/plugins          | Prefix oscillation, stale settled reference, premature definition settlement, or final mismatch fails.         |
| Prepared       | Prepared-document public and DOM fixtures                                                             | footnotes alone, math plus footnotes, plugins/transforms, heading collisions                                                                 | Reparse, projection drift, or source/prepared DOM difference fails.                                            |
| Remark         | Adapter rejection fixtures                                                                            | source and plugin-authored footnote nodes, no-op and mutating plugins                                                                        | Acceptance, silent drop, ordinary-link approximation, or lost readable fallback fails.                         |
| Repository     | Typecheck, lint, formatting, knowledge, changeset, package-boundary, and client-boundary checks       | every implementation change                                                                                                                  | Internal content, stale docs/types, or a new parser-to-client dependency blocks merge.                         |

## Decision log

### DEC-1 — Make footnotes an explicit Core syntax mode

**Reference:** `module:Markdown/footnotes/DEC-1`
**Proposed direction owner:** `cixzhang`

Footnotes coordinate parsing, numbering, document-global IDs, native navigation,
localization, streaming invalidation, and end-of-document rendering. One exact string
opt-in leaves room for future dialects without treating a presentation variant or a
plugin as grammar authority.

Rejected: default enablement; `variant="document"` enablement; a boolean with no dialect;
a first-party plugin; raw HTML; caller-provided definition/reference renderers.

### DEC-2 — Number resolved references, preserve everything else literally

**Reference:** `module:Markdown/footnotes/DEC-2`
**Proposed direction owner:** `cixzhang`

First valid definitions win and resolved references are numbered by first rendered
reference. Unresolved references and duplicate definitions remain ordinary Markdown,
so an opt-in never silently destroys authored content.

Rejected: numbering definitions by source order; rendering unreferenced definitions;
dropping duplicates; producing dead links for unresolved references.

### DEC-3 — Allocate headings before footnotes

**Reference:** `module:Markdown/footnotes/DEC-3`
**Proposed direction owner:** `cixzhang`

All current heading IDs reserve the shared namespace first. Footnote definition and
reference IDs allocate afterward, preserving every released Outline and permalink
target while guaranteeing unique DOM IDs.

Rejected: one mixed source-order pass that renumbers headings; independent ID spaces
that can collide; renderer-authored IDs.

### DEC-4 — Keep Remark footnotes outside the adapter profile

**Reference:** `module:Markdown/footnotes/DEC-4`
**Proposed direction owner:** `cixzhang`

Native Core parsing and rendering can guarantee the navigation contract. The Remark
adapter has no renderer or identity phase, so even a pass-through footnote tree remains
outside its lossless profile and fails closed.

Rejected: translating Remark footnotes to ordinary links; silently removing definitions;
letting an adapted plugin mint Core navigation nodes.

## Open questions

Owner approval is required before this draft becomes authoritative. No product decision
is intentionally left open in the proposed contract.
