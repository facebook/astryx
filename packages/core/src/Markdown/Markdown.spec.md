---
schema_version: 3
template_version: 3
kind: component
id: component:Markdown
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-09-13
owners: [cixzhang]
review_triggers: [api, theming]
verified_by:
  [
    packages/core/src/Markdown/Markdown.test.tsx,
    packages/core/src/Markdown/Markdown.public.test.ts,
    packages/core/src/Markdown/parser.test.ts,
    packages/core/src/Markdown/incremental.test.ts,
    packages/core/src/theme/themingTargets.test.ts,
    scripts/check-knowledge.mjs,
  ]
modules: []
families: [family:navigation-destinations]
design_specs: []
architecture:
  [architecture:component-theming-surface, architecture:public-component-api]
contributing: []
system_specs:
  [
    spec:AST-002/DEC-1,
    spec:AST-002/DEC-5,
    spec:AST-005/DEC-1,
    spec:AST-005/DEC-2,
  ]
---

# Markdown component contract

## Intent

Markdown renders parsed content in a Document with stable default block parts and
constrained renderer seams. In addition to the existing element overrides and
prose-only inline plugins, a caller may opt a document into dollar-delimited math
by supplying one typed renderer for both inline and display expressions. The
parser exposes the same syntax only through an explicit option. Existing parsing,
rendering, styling, and streaming behavior remain unchanged when math is absent.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: additive, opt-in public API; existing parser nodes, DOM,
  styling, targets, and dollar-delimited text remain unchanged unless the caller
  supplies `components.math` or passes `{math: true}` to a parser.
- Controlled/uncontrolled behavior: not applicable
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The Document and its current `markdown` target in block and inline display.
- Default Heading, Paragraph, List, Code block, Blockquote, Table, Divider, and
  Image block presentation and the eight current block targets documented below.
- Applying block spacing and reflected density (plus Heading level) to those
  targets on the default render path.
- Opt-in recognition of `$…$` inline math and `$$…$$` display math, including
  delimiter boundaries, escape behavior, parser nodes, and streaming parity.
- Passing each recognized expression as inert text to the caller's one math
  renderer with an `inline` or `block` display value.

**Does not own / non-goals**

- Output supplied by custom renderers; each custom component owns its replacement's
  structure, styling, and accessibility semantics.
- Inline emphasis, link, inline-code, citation, plugin, or math-renderer output as
  additional default block anatomy.
- Nested anatomy or targets owned by CodeBlock, Blockquote, List, CheckboxList,
  or Table.
- Executing or sanitizing a renderer's math library output, raw HTML parsing,
  arbitrary AST plugins, or new list/table/inline-style override slots.

## Public concepts

`MarkdownComponents.math` is one optional renderer with the signature
`({value: string, display: 'inline' | 'block'}) => ReactNode`. Supplying it opts
the component into math parsing because the caller owns both whether dollar
syntax means math and how formulas are rendered. Direct parser callers make the
same choice with `MathParseOptions` (`{math: true}`); incremental callers pair
that option with `createIncrementalState<true>()`, which returns the exported
`IncrementalParseState<true>`. Default calls and values
annotated as `ParseOptions` keep the released `InlineNode` and `BlockNode`
unions. Enabled calls return the explicit `InlineNodeWithMath` and
`BlockNodeWithMath` supersets, whose added leaves are `MathInlineNode` and
`MathBlockNode`. Exact syntax and examples remain in `Markdown.doc.mjs`.

## Behavioral and layout contract

| ID   | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR1  | Block and inline displays render one Document root carrying the current `markdown` target. Inline display renders no block anatomy.                                                                                                                                                                                                                                                                                                                                                                                       |
| FR2  | On the default block render path, Heading, Paragraph, List, Code block, Blockquote, Table, Divider, and Image carry the eight current local block targets documented below.                                                                                                                                                                                                                                                                                                                                               |
| FR3  | A supplied `heading`, `paragraph`, `code`, `blockquote`, `hr`, or safe-URL `image` renderer replaces the corresponding default part, so Markdown does not impose that part's local target on the replacement.                                                                                                                                                                                                                                                                                                             |
| FR4  | The released Code block target remains `markdown-codeblock`; this compatibility anomaly is not renamed or aliased.                                                                                                                                                                                                                                                                                                                                                                                                        |
| FR5  | Density and Heading level remain reflected capabilities on their owning targets. Display mode, streaming state, and renderer selection do not become separate anatomy entries.                                                                                                                                                                                                                                                                                                                                            |
| FR6  | Without `components.math`, Markdown does not recognize math syntax. Default, legacy-set, `math: false`, and `ParseOptions`-annotated parser calls retain the released `InlineNode` / `BlockNode` result unions; only `MathParseOptions` returns the explicit math-enabled unions.                                                                                                                                                                                                                                         |
| FR7  | With math enabled, `$…$` produces an inline `math` node and `$$…$$` produces a block `math` node. The renderer receives the delimiter-free source as `value` and its placement as `display`.                                                                                                                                                                                                                                                                                                                              |
| FR8  | Inline math stays on one line, cannot have whitespace touching either delimiter, and cannot open immediately after a digit or close immediately before one. `$$` is reserved for display math. These boundaries keep paired currency amounts literal.                                                                                                                                                                                                                                                                     |
| FR9  | A backslash-escaped dollar is literal outside math and does not close math inside it. An unmatched inline or display delimiter remains literal in non-streaming output.                                                                                                                                                                                                                                                                                                                                                   |
| FR10 | Code spans and fenced code blocks are opaque to math parsing. Link destinations are opaque; link labels may contain inline math. Inline plugins run only on prose text and never inside math.                                                                                                                                                                                                                                                                                                                             |
| FR11 | Streaming converges to the same nodes as a full parse at every chunk boundary, including display math nested in ordinary lists, task lists, blockquotes, and their supported combinations, with LF or CRLF and with or without source ranges. Incomplete math is withheld only while its exact owning container remains open; a list/quote exit or quote-depth change restores literal parsing. Math-enabled incremental calls require `IncrementalParseState<true>`, so the cache and returned union share one contract. |

### Allowed variation

- **AV1 — Parsed content.** The number and ordering of block parts may vary with
  the Markdown source without changing their ownership.
- **AV2 — Lists.** Ordered, unordered, and task lists share the List anatomy and
  current `markdown-list` target.
- **AV3 — Custom renderers.** Supported custom block renderers may replace their
  default part and own its styling without receiving a Markdown block target.
- **AV4 — Nested primitives.** Astryx primitives used inside default blocks may
  change internal element shape while preserving their own public contracts and
  Markdown's outer block targets.
- **AV5 — Math renderer.** The caller may use any renderer that accepts the raw
  expression and display value. Its DOM, styles, typesetting engine, error UI,
  and accessibility representation are outside Markdown's ownership.

### Representative states

| State                  | Required invariant                                                                                                                            | Allowed variation                                                                            |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Default block content  | Every parsed block uses its corresponding current Markdown target.                                                                            | Block count, order, density, content width, and alignment.                                   |
| Custom block renderers | The replaced Heading, Paragraph, Code block, Blockquote, Divider, or Image lacks the corresponding Markdown target.                           | Replacement structure and styling.                                                           |
| Ordered/unordered list | List carries `markdown-list`.                                                                                                                 | Marker kind, start value, item count, and nested content.                                    |
| Task list              | The outer List part carries `markdown-list`.                                                                                                  | Checked values and item content.                                                             |
| Safe block image       | Default Image carries `markdown-image`, or a custom image renderer replaces it.                                                               | Source and alternative text.                                                                 |
| Unsafe block image URL | Markdown renders its fallback Image part with `markdown-image`; no custom image renderer receives the rejected URL.                           | Alternative text shown by the fallback.                                                      |
| Inline display         | Document carries `markdown`; no block target renders.                                                                                         | Inline text, links, code, citations, plugins, and opt-in inline math.                        |
| Math renderer absent   | Dollar-delimited source follows the released Markdown grammar and no `math` node or renderer output exists.                                   | Currency, unmatched delimiters, and ordinary prose.                                          |
| Math renderer present  | Complete supported delimiters are opaque to Markdown formatting and are passed to the renderer as inert text.                                 | Inline or block display and any renderer-owned output.                                       |
| Streaming math         | Incomplete math is withheld; once complete, the streamed nodes equal the full-parse nodes at top level and inside list/blockquote containers. | Delimiters and expression text may arrive in separate chunks; source ranges remain optional. |

### Transformation and precedence order

- Fenced and inline code claim their contents before math.
- Complete display math claims a block before headings, tables, lists, and
  paragraphs. Complete inline math claims its source before citations, links,
  emphasis, autolinks, and inline plugins.
- A custom renderer receives only the delimiter-free expression string and its
  display value. Markdown never turns it into HTML or executes it.
- Existing URL sanitization remains in force for links and images; math adds no
  navigation or raw-HTML sink.

### Performance and resources

- Math scanning is disabled unless requested.
- Inline matching is a bounded forward scan of one line. Display matching scans
  only from a candidate `$$` opener to its closer.
- The incremental parser keeps completed blocks cached, treats an open display
  expression like an open code fence, and tracks exact list and blockquote
  container depth so an indented closer cannot become a new opener and a depth
  transition cannot swallow literal content. The factory-created state carries
  the same legacy or math-enabled node contract as the parser call.

## Accessibility contract

The default document semantics, heading IDs, paragraph role, list semantics,
scrollable Table wrapper, and image alternative text remain unchanged. Math has
no Astryx-owned default output: the caller's renderer owns an accessible
representation appropriate to its typesetting engine (for example MathML or a
labelled `role="math"` element). Markdown adds no wrapper, ARIA attributes, or
HTML injection around renderer output.

## Design relationships

| Anatomy or state | Design requirement                                                                 | Representation authority       | Hierarchy role | Component contract |
| ---------------- | ---------------------------------------------------------------------------------- | ------------------------------ | -------------- | ------------------ |
| Document         | Contains block or inline rendered Markdown content.                                | Current source and public docs | Supporting     | FR1, FR5           |
| Heading          | Presents one parsed heading with its resolved level and optional generated ID.     | Current source and public docs | Prominent      | FR2, FR3, FR5      |
| Paragraph        | Presents one prose block using the default composition-safe paragraph structure.   | Current source and public docs | Prominent      | FR2, FR3           |
| List             | Presents ordered, unordered, or task-list items as one block.                      | Current source and public docs | Prominent      | FR2, FR5           |
| Code block       | Presents fenced code and owns the outer spacing target on the default path.        | Current source and public docs | Prominent      | FR2, FR3, FR4      |
| Blockquote       | Presents quoted block content on the default path.                                 | Current source and public docs | Prominent      | FR2, FR3           |
| Table            | Presents parsed rows and columns in a keyboard-scrollable block wrapper.           | Current source and public docs | Prominent      | FR2                |
| Divider          | Presents a horizontal separation between blocks.                                   | Current source and public docs | Supporting     | FR2, FR3           |
| Image            | Presents a safe block image or the fallback for a rejected image URL.              | Current source and public docs | Prominent      | FR2, FR3           |
| Math             | Delegates an explicitly enabled expression to the caller's renderer as inert text. | Component contract             | Supporting     | FR6–FR11           |

Custom renderers replace the existing default parts rather than becoming nested
Markdown anatomy. The opt-in math renderer is also not default anatomy and gets no
Markdown theme target or wrapper. Lists and Tables have no corresponding custom
block renderer. The Document remains Markdown-owned in every display mode.

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Document": {"target": "markdown"},
  "Heading": {"target": "markdown-heading"},
  "Paragraph": {"target": "markdown-paragraph"},
  "List": {"target": "markdown-list"},
  "Code block": {"target": "markdown-codeblock"},
  "Blockquote": {"target": "markdown-blockquote"},
  "Table": {"target": "markdown-table"},
  "Divider": {"target": "markdown-hr"},
  "Image": {"target": "markdown-image"}
}
```

The map records all nine current targets on Markdown's default render paths. For
Heading, Paragraph, Code block, Blockquote, Divider, and safe Image, a custom
renderer replaces the default part and therefore replaces its local target. The
`markdown-codeblock` spelling is a released compatibility anomaly: the current
naming rule would produce `markdown-code-block`, but shipped targets are frozen
and this change preserves the existing spelling exactly.

## Family and system relationships

- `architecture:component-theming-surface` owns anatomy qualification, target
  mapping, target-capability state, composition boundaries, and compatibility for
  frozen targets.
- `architecture:public-component-api` and `spec:AST-002/DEC-1` own API
  admission. The caller knows whether dollar syntax is math and must choose the
  renderer; Markdown cannot derive either from the source without changing the
  meaning of existing documents.
- `spec:AST-002/DEC-5` requires this accepted component-local contract to be
  current with the implementation.
- `family:navigation-destinations` owns the shared accept/block result for parsed
  links and every Astryx-owned navigation sink. `spec:AST-005/DEC-1` requires
  Markdown navigation to remain conformant with Core link plumbing.
- `spec:AST-005/DEC-2` keeps embedded-resource policy separate. Markdown may
  reject a broader set of image/resource URLs without narrowing the shared
  navigation contract.
- Nested Astryx primitives retain ownership of their own anatomy and targets;
  Markdown owns the outer block targets listed here.

## Verification map

| Contract               | Verification                                                               | Representative states                                                             | Failure signal                                                                                                                     |
| ---------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| FR1–FR5                | `Markdown.test.tsx`, theme-target tests, and `scripts/check-knowledge.mjs` | Default block/inline output and all current targets                               | Existing DOM, target, spacing, or renderer behavior changes.                                                                       |
| FR6–FR10               | `parser.test.ts` and `Markdown.test.tsx`                                   | Opt-out, inline/display math, escapes, currency, code, links, plugins             | A delimiter is claimed without opt-in, TeX is formatted as Markdown, or opaque contexts leak.                                      |
| FR11                   | `incremental.test.ts` and `Markdown.test.tsx`                              | Every-character top-level/list/task-list/blockquote splits, CRLF, source ranges   | Streaming diverges from a full parse, shows partial syntax, mistakes a nested closer for an opener, or crosses a closed container. |
| Public syntax/types    | `Markdown.public.test.ts`, core typecheck, and `Markdown.doc.mjs`          | Legacy exhaustive switches, component renderer, full and incremental math opt-ins | A legacy union widens, math-enabled results omit math nodes, or docs drift from declarations.                                      |
| Security/accessibility | `parser.test.ts`, `Markdown.test.tsx`, and renderer guidance               | Inert expression strings and renderer-owned semantics                             | Astryx executes math as HTML or silently claims renderer-owned accessibility.                                                      |

Focused tests continue to pin all nine current target names and default block
placement. Math intentionally adds no target and no default anatomy.

## Decision log

### DEC-1 — Math is an opt-in renderer contract

**Reference:** `component:Markdown/DEC-1`
**Decider:** `cixzhang`, `2026-09-13`

A caller that supplies `components.math` opts the component into the constrained
dollar-math grammar and receives every complete expression through one renderer
with its source value and inline/block placement. Direct parser callers use
`MathParseOptions`; incremental callers also create
`IncrementalParseState<true>` via `createIncrementalState<true>()` so the cache
and result expose the same math-enabled node union.

This passes API admission because otherwise identical dollar-delimited source may
be prose or math, only the document host knows which meaning applies, and Astryx
cannot choose a typesetting or accessibility implementation for the host. Tying
the opt-in to the required renderer prevents an enabled-but-unrenderable state.
The default remains exactly the released Markdown grammar.

Rejected: a generic AST/plugin escape hatch, raw HTML rendering, new list/table
slots without consumer evidence, or a separate boolean on the component that
could enable math without a renderer.

## Open questions

- **OQ1 — Which focused tests should pin target absence for the five remaining
  custom block replacement paths?** (`checkable`)

## Content boundary

This file does not duplicate consumer prop tables/examples, parser mechanics,
streaming implementation, nested primitive contracts, current audit results, or
system theming rules. It links to their owners.
