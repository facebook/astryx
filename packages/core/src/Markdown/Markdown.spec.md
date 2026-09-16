---
schema_version: 3
template_version: 3
kind: component
id: component:Markdown
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-09-15
owners: [cixzhang]
review_triggers: [api, theming]
verified_by:
  [
    packages/core/src/Markdown/Markdown.test.tsx,
    packages/core/src/Markdown/Markdown.public.test.ts,
    packages/core/src/Markdown/parser.test.ts,
    packages/core/src/Markdown/incremental.test.ts,
    packages/core/src/Markdown/remark.test.tsx,
    packages/core/src/Outline/parseOutlineFromMarkdown.test.ts,
    packages/core/src/theme/themingTargets.test.ts,
    scripts/check-knowledge.mjs,
  ]
modules: [module:Markdown/remark]
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
    spec:AST-036/DEC-1,
    spec:AST-036/DEC-2,
    spec:AST-036/DEC-3,
    spec:AST-036/DEC-4,
  ]
---

# Markdown component contract

## Intent

Markdown renders parsed content in a Document with stable default block parts and
constrained renderer seams. Callers may opt into the canonical plugin protocol for
bounded source syntax, immutable document transformation, and typed extension
rendering. They may separately opt into dollar-delimited math by supplying one typed
renderer for both inline and display expressions. The parser accepts matching
explicit options. Existing parsing, rendering, styling, and streaming behavior
remain unchanged when plugins and math are absent.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: additive, opt-in public API; existing parser nodes, DOM,
  styling, targets, dollar-delimited text, `components`, and `inlinePlugins` remain
  unchanged unless the caller supplies `plugins`, supplies `components.math`, or
  passes the matching explicit parser option.
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
- Applying the canonical `plugins` protocol in the fixed syntax → immutable
  transform → render order while preserving built-in lexical shields, Core-owned
  semantics, and local readable fallback.
- Validating and freezing replacement document roots before later transforms or
  rendering observe them.
- Sharing plugin-enabled parse configuration, transformed heading projection, and
  collision-safe heading IDs with Markdown-derived Outline utilities.

**Does not own / non-goals**

- Output supplied by custom renderers; each custom component owns its replacement's
  structure, styling, and accessibility semantics.
- Inline emphasis, link, inline-code, citation, plugin, or math-renderer output as
  additional default block anatomy.
- Nested anatomy or targets owned by CodeBlock, Blockquote, List, CheckboxList,
  or Table.
- Executing or sanitizing a renderer's math or plugin output, raw HTML parsing,
  mutable or unrestricted AST plugins, package discovery, or new
  list/table/inline-style override slots.

## Public concepts

`plugins` is one optional ordered list of opaque entries created by
`createMarkdownPlugin()`. A plugin declares only the `syntax`, `transform`, and
`renderers` capabilities it uses. Syntax-bearing entries supply stable parse
identity. Parsing, transforms, rendering, and Outline use one stable, strictly typed,
MDAST-aligned canonical tree; `MarkdownAstNodeMap` and `visitMarkdownNodes` provide
node-kind narrowing. Released parser functions preserve their existing result shape
through a compatibility projection. Transforms return validated replacement roots
without entering parse identity. Every extension node introduced
by syntax or transformation has complete renderer ownership and a deterministic
text projection. Text matching, semantic fences, and source decoration are helpers
that compile to transforms rather than separate protocol phases. `spec:AST-036`
owns the shared protocol and limited Remark compatibility profile,
`module:Markdown/remark` owns that profile's adapter, and this component owns
aggregate application and fallback.

### Acceptance and implementation state

The plugin clauses below are the accepted target contract for the AST-036 rollout,
not a claim that the APIs already ship. Until every clause's implementation and
verification land, the currently released no-plugin, parser, `components`, and
`inlinePlugins` behavior remains the only available contract. Each implementation PR
must identify the clauses it completes without weakening the zero-breaking baseline.

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
| FR12 | Omitting `plugins` and passing an empty list are one semantic empty pipeline with identical parser unions, AST, DOM, styling, targets, IDs, and streaming behavior. Core may skip empty preparation and allocation without creating a separate behavior model. `components`, `inlinePlugins`, citations, autolinking, sources, and math retain their released meaning.                                                                                                                                                    |
| FR13 | Plugin-enabled parsing follows built-in lexical shields and ordered syntax claims, then uses one stable, strictly typed, MDAST-aligned canonical tree for transforms, rendering, and Outline. `MarkdownAstNodeMap` and `visitMarkdownNodes` narrow callbacks by node kind. Released parser functions preserve their existing result shape through a compatibility projection. Every returned root is finite, acyclic, representable, validated, and frozen before later plugins or rendering observe it.                  |
| FR14 | Plugin failures preserve the last valid document and readable authored source. Core retains heading, navigation, image, list, table, and document semantics and exposes no raw-markup parser channel, registry, package discovery, mutable shared AST, or unrestricted DOM hook. URL-like plugin data remains untrusted; Astryx-owned sinks follow `family:navigation-destinations`.                                                                                                                                      |
| FR15 | Incremental parse identity contains every parse-affecting Markdown option and only ordered syntax-bearing plugin name, protocol version, and `parseKey`. Transform or renderer changes reuse settled parse output, rerun transformation, and do not remount unaffected extension output.                                                                                                                                                                                                                                  |
| FR16 | Plugin-enabled Markdown and Markdown-derived Outline use the same parse options, ordered transforms, extension text projection, slugger, and collision allocator so every visible heading, Outline label, heading ID, and target agree. A limited Remark adapter may run only synchronous transform plugins whose input and output round-trip through the documented supported MDAST subset.                                                                                                                              |

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
- **AV6 — Installed plugins.** A host may supply any ordered set of compatible
  opaque plugin entries. Syntax, immutable transform behavior, renderer-owned
  output, and helper implementation may vary while validation, readable fallback,
  Core semantics, and heading identity stay fixed.

### Representative states

| State                  | Required invariant                                                                                                                                      | Allowed variation                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Default block content  | Every parsed block uses its corresponding current Markdown target.                                                                                      | Block count, order, density, content width, and alignment.                                      |
| Custom block renderers | The replaced Heading, Paragraph, Code block, Blockquote, Divider, or Image lacks the corresponding Markdown target.                                     | Replacement structure and styling.                                                              |
| Ordered/unordered list | List carries `markdown-list`.                                                                                                                           | Marker kind, start value, item count, and nested content.                                       |
| Task list              | The outer List part carries `markdown-list`.                                                                                                            | Checked values and item content.                                                                |
| Safe block image       | Default Image carries `markdown-image`, or a custom image renderer replaces it.                                                                         | Source and alternative text.                                                                    |
| Unsafe block image URL | Markdown renders its fallback Image part with `markdown-image`; no custom image renderer receives the rejected URL.                                     | Alternative text shown by the fallback.                                                         |
| Inline display         | Document carries `markdown`; no block target renders.                                                                                                   | Inline text, links, code, citations, plugins, and opt-in inline math.                           |
| Math renderer absent   | Dollar-delimited source follows the released Markdown grammar and no `math` node or renderer output exists.                                             | Currency, unmatched delimiters, and ordinary prose.                                             |
| Math renderer present  | Complete supported delimiters are opaque to Markdown formatting and are passed to the renderer as inert text.                                           | Inline or block display and any renderer-owned output.                                          |
| Streaming math         | Incomplete math is withheld; once complete, the streamed nodes equal the full-parse nodes at top level and inside list/blockquote containers.           | Delimiters and expression text may arrive in separate chunks; source ranges remain optional.    |
| Plugins omitted        | Released parser unions, AST, DOM, targets, heading IDs, and performance remain unchanged.                                                               | Omitted or empty list; both are one empty transform pipeline.                                   |
| Plugins enabled        | Fixed syntax → immutable transform → render order, validated roots, readable fallback, and matching Markdown/Outline heading identity remain invariant. | Syntax, transforms, renderers, helper execution plans, plugin order, and live post-parse state. |

### Transformation and precedence order

- Fenced and inline code claim their contents before math.
- Complete display math claims a block before headings, tables, lists, and
  paragraphs. Complete inline math claims its source before citations, links,
  emphasis, autolinks, and inline plugins.
- A custom renderer receives only the delimiter-free expression string and its
  display value. Markdown never turns it into HTML or executes it.
- Existing URL sanitization remains in force for links and images; math adds no
  navigation or raw-HTML sink.
- Built-in syntax and protected contexts claim first; extension syntax claims only
  eligible source; ordered transforms then receive deeply readonly document roots;
  Core validates each returned root before rendering.
- Text matching, semantic fences, and source decorations use transform helpers. Core
  may compile those helpers into indexed internal plans without exposing additional
  public phases.

### Performance and resources

- Math scanning is disabled unless requested.
- Inline matching is a bounded forward scan of one line. Display matching scans
  only from a candidate `$$` opener to its closer.
- The incremental parser keeps completed blocks cached, treats an open display
  expression like an open code fence, and tracks exact list and blockquote
  container depth so an indented closer cannot become a new opener and a depth
  transition cannot swallow literal content. The factory-created state carries
  the same legacy or math-enabled node contract as the parser call.
- Stable plugin lists reuse prepared syntax and transform plans. Only syntax enters
  parse identity; transform and renderer changes reuse parsed output. Zero-work and
  representative transforms remain within `spec:AST-036` FR20–FR23 budgets.
- Remark compatibility adapters and optional renderers stay outside Core bundles
  unless explicitly imported.

## Accessibility contract

The default document semantics, heading IDs, paragraph role, list semantics,
scrollable Table wrapper, and image alternative text remain unchanged. Math has
no Astryx-owned default output: the caller's renderer owns an accessible
representation appropriate to its typesetting engine (for example MathML or a
labelled `role="math"` element). Markdown adds no wrapper, ARIA attributes, or
HTML injection around renderer output. Plugin renderers likewise own their
complete documented semantic pattern, while Core preserves its own document,
heading, navigation, image, list, and table semantics. Transforms cannot erase
required accessible meaning or make meaning color-only.

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
- `spec:AST-036` owns the opaque syntax/transform/renderer protocol, immutable AST
  validation, limited Remark compatibility, performance, and resource boundaries.
  This record owns aggregate Markdown behavior in FR12–FR16;
  `module:Markdown/remark` owns the separately imported Remark adapter's
  supported subset, rejections, and diagnostics; and
  `module:Outline/parseOutlineFromMarkdown` owns the corresponding Outline
  projection.
- Nested Astryx primitives retain ownership of their own anatomy and targets;
  Markdown owns the outer block targets listed here.

## Verification map

| Contract               | Verification                                                               | Representative states                                                                                                      | Failure signal                                                                                                                                       |
| ---------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR1–FR5                | `Markdown.test.tsx`, theme-target tests, and `scripts/check-knowledge.mjs` | Default block/inline output and all current targets                                                                        | Existing DOM, target, spacing, or renderer behavior changes.                                                                                         |
| FR6–FR10               | `parser.test.ts` and `Markdown.test.tsx`                                   | Opt-out, inline/display math, escapes, currency, code, links, plugins                                                      | A delimiter is claimed without opt-in, TeX is formatted as Markdown, or opaque contexts leak.                                                        |
| FR11                   | `incremental.test.ts` and `Markdown.test.tsx`                              | Every-character top-level/list/task-list/blockquote splits, CRLF, source ranges                                            | Streaming diverges from a full parse, shows partial syntax, mistakes a nested closer for an opener, or crosses a closed container.                   |
| FR12–FR16              | plugin, transform, adapter, performance, and Outline parser tests          | omitted/empty lists, immutable transforms, invalid outputs, live updates, one compatible Remark plugin, duplicate headings | Empty behavior forks, input mutates, invalid structure escapes, transforms reparse, adapter loses content, budgets fail, or heading targets diverge. |
| Public syntax/types    | `Markdown.public.test.ts`, core typecheck, and `Markdown.doc.mjs`          | Legacy exhaustive switches, math opt-ins, inferred extension-node unions                                                   | A released union widens, an enabled union loses nodes, or docs drift from declarations.                                                              |
| Security/accessibility | `parser.test.ts`, `Markdown.test.tsx`, and renderer guidance               | Inert expression strings and renderer-owned semantics                                                                      | Astryx executes math as HTML or silently claims renderer-owned accessibility.                                                                        |

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

### DEC-2 — Immutable transformation is the canonical Markdown extension seam

**Reference:** `component:Markdown/DEC-2`
**Decider:** `cixzhang`, `2026-09-15`

Markdown accepts one ordered `plugins` list whose opaque entries are created by
`createMarkdownPlugin()`. The public protocol exposes only bounded `syntax`,
immutable `transform`, and typed `renderers`. Core owns deep-readonly input,
validation and freezing of replacement roots, readable fallback, syntax-only parse
identity, preparation reuse, and shared heading identity in FR12–FR16. Existing
`components`, `inlinePlugins`, math, citations, autolinking, and parser calls remain
compatible.

Text matching, semantic fences, and source decoration are transform helpers rather
than separate protocol phases. A tree-shakeable adapter may run only synchronous
transform-only Remark plugins over the documented MDAST subset; unsupported behavior
fails closed rather than being approximated.

This projects `spec:AST-036/DEC-1` through `DEC-4` into the component owner. It
rejects a registry, package discovery, mutable shared AST, raw markup, a second
plugin prop, or an unrestricted Unified runtime.

## Open questions

- **OQ1 — Which focused tests should pin target absence for the five remaining
  custom block replacement paths?** (`checkable`)

## Content boundary

This file does not duplicate consumer prop tables/examples, parser mechanics,
streaming implementation, nested primitive contracts, current audit results, or
system theming rules. It links to their owners.
