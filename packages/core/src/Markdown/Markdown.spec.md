---
schema_version: 3
template_version: 3
kind: component
id: component:Markdown
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-09-25
owners: [cixzhang]
review_triggers: [api, theming, behavior, layout, accessibility]
verified_by:
  [
    packages/core/src/Markdown/Markdown.test.tsx,
    packages/core/src/Markdown/Markdown.renderBoundary.test.tsx,
    packages/core/src/Markdown/Markdown.public.test.ts,
    packages/core/src/Markdown/parser.test.ts,
    packages/core/src/Markdown/incremental.test.ts,
    packages/core/src/Markdown/remark.test.tsx,
    packages/core/src/Markdown/plugins/softBreaks.test.tsx,
    packages/core/src/Outline/parseOutlineFromMarkdown.test.ts,
    packages/core/src/theme/themingTargets.test.ts,
    scripts/check-knowledge.mjs,
  ]
modules: [module:Markdown/remark, module:Markdown/softBreaks]
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
bounded source syntax, immutable document transformation, typed extension
rendering, and native typed document-start frontmatter. They may separately opt into dollar-delimited math by supplying one typed
renderer for both inline and display expressions. The parser accepts matching
explicit options. Existing parsing, rendering, styling, and streaming behavior
remain unchanged when plugins and math are absent. A table wider than its
container declares that it overflows and may offer the whole table in a viewer;
a consumer does not need a table override to get either.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: additive, opt-in public API; existing parser nodes, DOM,
  styling, targets, dollar-delimited text, `components`, and `inlinePlugins` remain
  unchanged unless the caller supplies `plugins`, supplies `components.math`, or
  passes the matching explicit parser option. The Table overflow indicator is a
  default-path addition that renders only while a table overflows; the Table
  viewer is opt-in through `tableViewer`.
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
- Declaring Table overflow inside the effective scroll region, the opt-in Table
  viewer trigger, focus return from a Markdown-owned viewer, and the honest
  min-content contribution of table cells on its default path, overriding
  Table's wrap-mode cell sizing for that part only.
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
- Decoding an optional document-start frontmatter block into caller-defined typed
  metadata, withholding unfinished frontmatter while streaming, and excluding
  completed frontmatter syntax from rendered content.

**Does not own / non-goals**

- Output supplied by custom renderers; each custom component owns its replacement's
  structure, styling, and accessibility semantics.
- Inline emphasis, link, inline-code, citation, plugin, or math-renderer output as
  additional default block anatomy.
- Nested anatomy or targets owned by CodeBlock, Blockquote, List, CheckboxList,
  or Table, including Table's Scroll region behavior under `spec:AST-025`.
- A host-supplied Table viewer's surface, dismissal, and focus return; Markdown
  hands the host the content and a focus-restoration callback.
- Executing or sanitizing a renderer's math or plugin output, raw HTML parsing,
  mutable or unrestricted AST plugins, package discovery, or new
  list/table/inline-style override slots.

## Public concepts

`plugins` is one optional ordered list of opaque entries created by
`createMarkdownPlugin()`. A plugin declares only the `syntax`, `transform`, and
`renderers` capabilities it uses. Syntax-bearing entries supply stable parse
identity. Parsing, transforms, rendering, and Outline use one stable, strictly typed,
MDAST-aligned canonical tree; `parseMarkdownAst()` and `parseInlineAst()` expose
that tree from the server-safe `@astryxdesign/core/Markdown/parser` subpath while
`@astryxdesign/core/Markdown/plugins` remains server-safe for constructing and
running plugins in server or RSC code. The rendered `Markdown` component remains a
client entry: function-bearing plugin entries are not serializable props and cannot
cross an RSC boundary. `MarkdownAstNodeMap` and `visitMarkdownNodes` provide
node-kind narrowing. Released parser functions preserve their existing result shape
through a compatibility projection. Transforms return validated replacement roots
without entering parse identity. Every extension node introduced
by syntax or transformation has complete renderer ownership and a deterministic
text projection. Text matching, semantic fences, source decoration, and native
frontmatter are helpers that compile to transforms rather than separate protocol
phases. Frontmatter is document metadata: it has no renderer, uses a bounded
first-party key/value grammar rather than Remark compatibility, and exposes typed
metadata through the helper that created it. `spec:AST-036`
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

`tableViewer` is one optional prop with the closed values `'none'` and
`'dialog'` or one host callback. `'none'` is the default: the Table overflow
indicator renders alone. `'dialog'` opens the same rendered table content in a
Markdown-owned Dialog. A callback receives one request — the rendered table
content, the table's accessible label, and a focus-restoration callback — and
the host supplies its own viewer. The prop is admitted because whether a host
has a viewer surface of its own, and where it lives in the host's layer stack,
is host-owned information Markdown cannot derive; the indicator needs no prop
because Markdown can derive overflow from the scroll region itself. The Table
overflow clauses (FR26–FR29) follow the same acceptance convention as the plugin
clauses above: they are the accepted target contract, not a claim that
`tableViewer` or the `markdown-table-overflow-indicator` target already ships.

## Behavioral and layout contract

| ID   | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR1  | Block and inline displays render one Document root carrying the current `markdown` target. Inline display renders no block anatomy.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| FR2  | On the default block render path, Heading, Paragraph, List, Code block, Blockquote, Table, Divider, and Image carry the eight current local block targets documented below.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| FR3  | A supplied `heading`, `paragraph`, `code`, `blockquote`, `hr`, or safe-URL `image` renderer replaces the corresponding default part, so Markdown does not impose that part's local target on the replacement.                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| FR4  | The released Code block target remains `markdown-codeblock`; this compatibility anomaly is not renamed or aliased.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| FR5  | Density and Heading level remain reflected capabilities on their owning targets. Display mode, streaming state, and renderer selection do not become separate anatomy entries.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| FR6  | Without `components.math`, Markdown does not recognize math syntax. Default, legacy-set, `math: false`, and `ParseOptions`-annotated parser calls retain the released `InlineNode` / `BlockNode` result unions; only `MathParseOptions` returns the explicit math-enabled unions.                                                                                                                                                                                                                                                                                                                                                                                          |
| FR7  | With math enabled, `$…$` produces an inline `math` node and `$$…$$` produces a block `math` node. The renderer receives the delimiter-free source as `value` and its placement as `display`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| FR8  | Inline math stays on one line, cannot have whitespace touching either delimiter, and cannot open immediately after a digit or close immediately before one. `$$` is reserved for display math. These boundaries keep paired currency amounts literal.                                                                                                                                                                                                                                                                                                                                                                                                                      |
| FR9  | A backslash-escaped dollar is literal outside math and does not close math inside it. An unmatched inline or display delimiter remains literal in non-streaming output.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| FR10 | Code spans and fenced code blocks are opaque to math parsing. Link destinations are opaque; link labels may contain inline math. Inline plugins run only on prose text and never inside math.                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| FR11 | Streaming converges to the same nodes as a full parse at every chunk boundary, including display math nested in ordinary lists, task lists, blockquotes, and their supported combinations, with LF or CRLF and with or without source ranges. Incomplete math is withheld only while its exact owning container remains open; a list/quote exit or quote-depth change restores literal parsing. Math-enabled incremental calls require `IncrementalParseState<true>`, so the cache and returned union share one contract.                                                                                                                                                  |
| FR12 | Omitting `plugins` and passing an empty list are one semantic empty pipeline with identical parser unions, AST, DOM, styling, targets, IDs, and streaming behavior. Core may skip empty preparation and allocation without creating a separate behavior model. `components`, `inlinePlugins`, citations, autolinking, sources, and math retain their released meaning.                                                                                                                                                                                                                                                                                                     |
| FR13 | Plugin-enabled parsing follows built-in lexical shields and ordered syntax claims, then uses one stable, strictly typed, MDAST-aligned canonical tree for transforms, rendering, and Outline. `MarkdownAstNodeMap` and `visitMarkdownNodes` narrow callbacks by node kind. Released parser functions preserve their existing result shape through a compatibility projection. Every returned root is finite, acyclic, representable, validated, and frozen before later plugins or rendering observe it.                                                                                                                                                                   |
| FR14 | Plugin failures preserve the last valid document and readable authored source. Core retains heading, navigation, image, list, table, and document semantics and exposes no raw-markup parser channel, registry, package discovery, mutable shared AST, or unrestricted DOM hook. URL-like plugin data remains untrusted; Astryx-owned sinks follow `family:navigation-destinations`.                                                                                                                                                                                                                                                                                       |
| FR15 | Incremental parse identity contains every parse-affecting Markdown option and only ordered syntax-bearing plugin name, protocol version, and `parseKey`. Transform or renderer changes reuse settled parse output, rerun transformation, and do not remount unaffected extension output.                                                                                                                                                                                                                                                                                                                                                                                   |
| FR16 | Plugin-enabled Markdown and Markdown-derived Outline use the same parse options, ordered transforms, extension text projection, slugger, and collision allocator so every visible heading, Outline label, heading ID, and target agree. A limited Remark adapter may run only synchronous transform plugins whose input and output round-trip through the documented supported MDAST subset.                                                                                                                                                                                                                                                                               |
| FR17 | An extension node declares `content` as `'none'`, `'phrasing'`, `'flow'`, or an explicit `{allow, min?, max?}` allowlist that narrows the category its `display` implies. Markdown parses every container's inner source span under the same grammar and shields, validates children at each transform boundary, renders children through the same built-in renderers and `components` seams, counts nesting toward the built-in depth bound, leaves FR16 heading traversal unchanged, and renders children in place when a container renderer fails.                                                                                                                      |
| FR18 | A transform may read and remove another plugin's extension nodes, including a subtree containing them, and may insert or remove headings; it may not create, edit, internally reorder, or duplicate another plugin's nodes, change a source heading's depth, or forge or duplicate heading identity. `dependsOn` is validated at preparation; an unmet or misordered dependency skips only that plugin's transform. Every rejection names the rule and owning plugin.                                                                                                                                                                                                      |
| FR19 | `onPluginDiagnostic` is available on the component and parser options and receives one source-free event — plugin, phase, stable code, severity — per failure, advisory, or silent degradation, in development and production, rate-limited with a suppression code. Admission, duplicate-name, and protocol-version failures behave identically through the component and every parser entrypoint: the call succeeds with the last valid configuration and never throws into the caller.                                                                                                                                                                                  |
| FR20 | `parseMarkdownAst()` and `parseInlineAst()` return the canonical tree and accept the same options and plugin list as the component; `@astryxdesign/core/Markdown/parser` exposes parsing, canonical AST types, and plugin admission with no client boundary. `createMarkdownPlugin()` infers the extension-node union, so no callsite needs explicit type arguments, and a declaration that yields no usable extension type is a type error rather than a silent `never`.                                                                                                                                                                                                  |
| FR21 | A transform runs again for every streamed update and must be idempotent and convergent; transforms whose effect requires complete input use the final-input signal. Semantically equal plugin lists reuse prepared work whether or not the array reference is stable, and development reports one diagnostic when a recreated list prevents reuse.                                                                                                                                                                                                                                                                                                                         |
| FR22 | An extension renderer may opt into the Markdown-owned extension theme target so themes reach plugin output. Opting out leaves output untargeted. The target adds no default styling or anatomy beyond the block spacing and content width Core already applies.                                                                                                                                                                                                                                                                                                                                                                                                            |
| FR23 | Markdown owns an explicit supported dialect rather than claiming full CommonMark or GFM conformance. Adjacent compatible ordered or unordered items remain one list regardless of task-marker presence; each item independently preserves its checked state or ordinary list-item semantics, including at nested levels. The default grammar keeps its released task-list and table support, while `autolink: 'gfm'` adds only the documented autolink behavior and does not toggle any other syntax.                                                                                                                                                                      |
| FR24 | `createMarkdownFrontmatter()` recognizes only a leading `---` block of unique `key: value` lines, decodes it through the caller's typed parser, stores finite JSON-like metadata on the canonical document, and removes the syntax from rendered content. An unfinished leading block yields no visible Markdown while streaming; malformed or unfinished final input remains ordinary Markdown. Frontmatter has no renderer and requires no Remark compatibility.                                                                                                                                                                                                         |
| FR25 | The canonical parser and plugin-construction subpaths remain server-safe and can run function-bearing plugins entirely within server or RSC code. The client-owned `Markdown` component supports traditional and streaming SSR, but plugin entries containing functions cannot be serialized from a Server Component into that client boundary; direct RSC rendering requires a future additive server renderer rather than weakening the plugin protocol.                                                                                                                                                                                                                 |
| FR26 | While a Table's effective scroll region can scroll on the inline axis, the default render path shows one Table overflow indicator; otherwise none renders. Visibility resolves in CSS from that region's scroll state (`@container scroll-state`, scrollable at either inline edge): no observer, layout read, re-render, or layout shift. The indicator is a descendant of the region, sticks to its inline-start edge while the table scrolls under it and carries `markdown-table-overflow-indicator`. Without scroll-state queries, none renders.                                                                                                                      |
| FR27 | The Table viewer is opt-in through `tableViewer`; its default `'none'` renders no viewer control. When enabled, the indicator line holds one plain button as a sibling of the `<table>`, never an interactive ancestor around it. It presents the same React children the block already rendered — not a serialized or re-parsed copy — in a viewer scrolling on both axes, with the viewer's own controls outside the scrolled area. `'dialog'` is Markdown-owned and returns focus to the trigger on close; a callback hands the host the content and a focus-restoration callback.                                                                                      |
| FR28 | On the default path a table column is never narrower than its min-content — the longest unbreakable token it holds — so when the columns' min-contents exceed the container the table grows past it and FR26–FR27 take over; columns do not shrink to fit. The floor is content-derived, not a fixed width bucket. Markdown's default Table part sizes its own header and body cells over Table's wrap-mode defaults: no `max-width`, wrapping with `overflow-wrap: break-word`, and neither `overflow-wrap: anywhere` nor its `word-break: break-word` equivalent. A column holding one long unbroken token widens to that token rather than collapsing to one character. |
| FR29 | The indicator and viewer trigger add nothing to the `<table>` or its cells: the released `role="group"` wrappers and their labels (Markdown's `markdown-table` block and Table's Scroll region), native table semantics, cell text selection, link activation, and keyboard order are unchanged. The indicator's text is localized through the component's message catalog and is not color-only.                                                                                                                                                                                                                                                                          |

FR23 includes table-level escaping inside inline-code spans: `\|` keeps the pipe
inside its authored cell, contributes only `|` to the code value and rendered
text, and produces the same result in full and incremental parsing. A completed
inline-code span excludes its delimiting backticks from the parsed value and
renders only that value inside `<code>`; an unmatched backtick remains literal
text. Outside a table cell, inline code retains its authored backslashes.

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
- **AV7 — Table overflow.** The indicator's glyph, wording, and typography may
  vary; the `'dialog'` viewer's control may be withheld where the viewport
  offers a viewer no room beyond the reading column, while a callback host is
  always offered the trigger and decides for itself; a host viewer's surface,
  insets, and dismissal are host-owned. Visibility from scroll state, placement inside the scroll
  region, the sibling-button rule, and same-children presentation stay fixed.

### Representative states

| State                  | Required invariant                                                                                                                                                                             | Allowed variation                                                                               |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Default block content  | Every parsed block uses its corresponding current Markdown target.                                                                                                                             | Block count, order, density, content width, and alignment.                                      |
| Custom block renderers | The replaced Heading, Paragraph, Code block, Blockquote, Divider, or Image lacks the corresponding Markdown target.                                                                            | Replacement structure and styling.                                                              |
| Ordered/unordered list | List carries `markdown-list`.                                                                                                                                                                  | Marker kind, start value, item count, and nested content.                                       |
| Task list              | Each task-marked item carries its own checked state; mixed task/plain items stay in one compatible list and preserve document order and nesting.                                               | Checked values, item content, and adjacent plain items.                                         |
| Safe block image       | Default Image carries `markdown-image`, or a custom image renderer replaces it.                                                                                                                | Source and alternative text.                                                                    |
| Unsafe block image URL | Markdown renders its fallback Image part with `markdown-image`; no custom image renderer receives the rejected URL.                                                                            | Alternative text shown by the fallback.                                                         |
| Inline display         | Document carries `markdown`; no block target renders.                                                                                                                                          | Inline text, links, code, citations, plugins, and opt-in inline math.                           |
| Math renderer absent   | Dollar-delimited source follows the released Markdown grammar and no `math` node or renderer output exists.                                                                                    | Currency, unmatched delimiters, and ordinary prose.                                             |
| Math renderer present  | Complete supported delimiters are opaque to Markdown formatting and are passed to the renderer as inert text.                                                                                  | Inline or block display and any renderer-owned output.                                          |
| Streaming math         | Incomplete math is withheld; once complete, the streamed nodes equal the full-parse nodes at top level and inside list/blockquote containers.                                                  | Delimiters and expression text may arrive in separate chunks; source ranges remain optional.    |
| Plugins omitted        | Released parser unions, AST, DOM, targets, heading IDs, and performance remain unchanged.                                                                                                      | Omitted or empty list; both are one empty transform pipeline.                                   |
| Plugins enabled        | Fixed syntax → immutable transform → render order, validated roots, readable fallback, and matching Markdown/Outline heading identity remain invariant.                                        | Syntax, transforms, renderers, helper execution plans, plugin order, and live post-parse state. |
| Native frontmatter     | A complete leading block is absent from rendered content and yields typed metadata; unfinished streaming input is withheld.                                                                    | Metadata schema and values are caller-defined finite data.                                      |
| Table fits             | Table carries `markdown-table`; no overflow indicator or viewer control renders; the scroll wrapper keeps its released semantics.                                                              | Column count, alignment, cell content, and density.                                             |
| Table overflows        | One indicator with `markdown-table-overflow-indicator` renders inside the scroll region and stays at the inline-start edge at every scroll offset; no column is narrower than its min-content. | Indicator wording and glyph; viewer control present only when `tableViewer` is not `'none'`.    |
| Table expanded         | The viewer shows the same rendered children and scrolls on both axes; on close, focus returns to the trigger or the host gets the restoration callback.                                        | Dialog or host viewer; viewer insets and chrome.                                                |

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
- A configured native frontmatter helper claims only the document-start delimiter.
  It withholds an unfinished block during streaming, removes a completed block
  before later transforms render the document, and makes typed metadata available
  to those later transforms and to callers of that helper.
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
- Stable and semantically equal plugin lists reuse prepared syntax and transform plans. Only syntax enters parse identity; transform and renderer changes reuse parsed output. Zero-work and representative transforms remain within `spec:AST-036` FR21–FR23 budgets, including the plugin-authored and streaming paths.
- Remark compatibility adapters, the conformance kit, and optional renderers stay outside Core bundles unless explicitly imported.
- Table overflow detection is CSS-only. The indicator adds no `ResizeObserver`,
  scroll listener, measured width, or per-table state beyond the shared
  observer Table's Scroll region already owns under `component:Table/DEC-1`; a
  document of many tables adds nothing for the indicator. The Markdown-owned
  Dialog mounts only while a viewer is open.

## Accessibility contract

The default document semantics, heading IDs, paragraph role, list semantics,
scrollable Table wrapper, and image alternative text remain unchanged. Math has
no Astryx-owned default output: the caller's renderer owns an accessible
representation appropriate to its typesetting engine (for example MathML or a
labelled `role="math"` element). Markdown adds no wrapper, ARIA attributes, or
HTML injection around renderer output. Plugin renderers likewise own their
complete documented semantic pattern, while Core preserves its own document,
heading, navigation, image, list, and table semantics. Transforms cannot erase
required accessible meaning or make meaning color-only. The Table overflow
indicator is text, not a control; the viewer trigger is one ordinary button in
the indicator line, so the `<table>` gains no interactive ancestor and keeps its
table semantics for assistive technology. A Markdown-owned viewer follows
`component:Dialog` for modal focus and returns focus to the trigger on close.

## Design relationships

| Anatomy or state         | Design requirement                                                                 | Representation authority       | Hierarchy role | Component contract |
| ------------------------ | ---------------------------------------------------------------------------------- | ------------------------------ | -------------- | ------------------ |
| Document                 | Contains block or inline rendered Markdown content.                                | Current source and public docs | Supporting     | FR1, FR5           |
| Heading                  | Presents one parsed heading with its resolved level and optional generated ID.     | Current source and public docs | Prominent      | FR2, FR3, FR5      |
| Paragraph                | Presents one prose block using the default composition-safe paragraph structure.   | Current source and public docs | Prominent      | FR2, FR3           |
| List                     | Presents ordered, unordered, or task-list items as one block.                      | Current source and public docs | Prominent      | FR2, FR5           |
| Code block               | Presents fenced code and owns the outer spacing target on the default path.        | Current source and public docs | Prominent      | FR2, FR3, FR4      |
| Blockquote               | Presents quoted block content on the default path.                                 | Current source and public docs | Prominent      | FR2, FR3           |
| Table                    | Presents parsed rows and columns in a keyboard-scrollable block wrapper.           | Current source and public docs | Prominent      | FR2, FR28, FR29    |
| Table overflow indicator | Says columns continue past the edge and hosts the opt-in viewer trigger.           | Component contract             | Supporting     | FR26, FR27, FR29   |
| Table viewer             | Presents the same rendered table whole, scrolling on both axes, when opted in.     | `component:Dialog` or host     | Supporting     | FR27               |
| Divider                  | Presents a horizontal separation between blocks.                                   | Current source and public docs | Supporting     | FR2, FR3           |
| Image                    | Presents a safe block image or the fallback for a rejected image URL.              | Current source and public docs | Prominent      | FR2, FR3           |
| Math                     | Delegates an explicitly enabled expression to the caller's renderer as inert text. | Component contract             | Supporting     | FR6–FR11           |

Custom renderers replace the existing default parts rather than becoming nested
Markdown anatomy. The opt-in math renderer is also not default anatomy and gets no
Markdown theme target or wrapper. Lists and Tables have no corresponding custom
block renderer; Table overflow is built into the default Table part instead of
becoming an override slot. The Document remains Markdown-owned in every display
mode.

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

The accepted Table overflow indicator target is `markdown-table-overflow-indicator`,
spelled by the current naming rule. It is not yet in the map above because the
map is validated against the current `Markdown.doc.mjs` inventory and
`architecture:component-theming-surface` requires a new `themeProps()` target to
enter its spec map, doc metadata, discovery, and validation together; the
implementation PR that adds the `themeProps()` call adds the `Table overflow
indicator` entry and its target in the same change. The Table viewer's
Markdown-owned surface delegates to `component:Dialog` targets and gets no
Markdown target; a host viewer is outside Markdown's theming surface.

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
  Markdown parsing and link rendering to preserve the same normalized navigation
  decision as other Core links. Rejected links remain inert and do not reach a
  custom link renderer; accepted links retain their ordinary behavior.
- `spec:AST-005/DEC-2` keeps embedded-resource policy separate. Markdown may
  reject a broader set of image/resource URLs without narrowing the shared
  navigation contract.
- `spec:AST-036` owns the opaque syntax/transform/renderer protocol, immutable AST
  validation, limited Remark compatibility, performance, and resource boundaries.
  This record owns aggregate Markdown behavior in FR12–FR22;
  `module:Markdown/remark` owns the separately imported Remark adapter's
  supported subset, rejections, and diagnostics; and
  `module:Outline/parseOutlineFromMarkdown` owns the corresponding Outline
  projection.
- Nested Astryx primitives retain ownership of their own anatomy and targets;
  Markdown owns the outer block targets listed here.
- `spec:AST-025` and `component:Table/DEC-1` own the Scroll region's effective
  scroll axis, keyboard reachability, and containment. Table's Scroll region
  (`table-scroll-wrapper`) is the effective scroller for a Markdown table:
  Markdown's `markdown-table` block is exactly as wide as that region, so the
  block's own inline overflow never engages. FR26 reads Table's region through
  Table's scroll-wrapper plugin phase, which places content inside the region
  and styles the region itself, and adds no parallel overflow detector.
  `component:Dialog` owns the modal focus lifecycle a `'dialog'` viewer relies
  on.

## Verification map

| Contract               | Verification                                                                  | Representative states                                                                                                                                                           | Failure signal                                                                                                                                                                      |
| ---------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR1–FR5                | `Markdown.test.tsx`, theme-target tests, and `scripts/check-knowledge.mjs`    | Default block/inline output and all current targets                                                                                                                             | Existing DOM, target, spacing, or renderer behavior changes.                                                                                                                        |
| FR6–FR10               | `parser.test.ts` and `Markdown.test.tsx`                                      | Opt-out, inline/display math, escapes, currency, code, links, plugins                                                                                                           | A delimiter is claimed without opt-in, TeX is formatted as Markdown, or opaque contexts leak.                                                                                       |
| FR11                   | `incremental.test.ts` and `Markdown.test.tsx`                                 | Every-character top-level/list/task-list/blockquote splits, CRLF, source ranges                                                                                                 | Streaming diverges from a full parse, shows partial syntax, mistakes a nested closer for an opener, or crosses a closed container.                                                  |
| FR12–FR16              | plugin, transform, adapter, performance, and Outline parser tests             | omitted/empty lists, immutable transforms, invalid outputs, live updates, one compatible Remark plugin, duplicate headings                                                      | Empty behavior forks, input mutates, invalid structure escapes, transforms reparse, adapter loses content, budgets fail, or heading targets diverge.                                |
| FR17–FR18              | container parse/validation, ownership, and dependency tests                   | leaf/container declarations, nested containers, foreign read/remove/mint/edit, unmet/misordered dependencies                                                                    | Plugin-built parsed children, invalid content, lost fallback children, foreign mint/edit, or generic ownership codes.                                                               |
| FR19                   | diagnostic-channel tests in development and production                        | every phase, advisory reports, rate suppression, no handler, malformed list, duplicate Core, version skew                                                                       | A silent production failure, document content in a diagnostic, or one entrypoint throwing where another recovers.                                                                   |
| FR20–FR22              | canonical/server imports, inference, streaming, preparation, theming tests    | server imports, no explicit type args, chunk boundaries, recreated lists, themed/unthemed extensions                                                                            | Client references, explicit-type workarounds, oscillation, per-render re-preparation, or unreachable opted-in output.                                                               |
| FR23                   | parser, incremental, renderer, nesting, and public option tests               | mixed lists; escaped prose/code table cells, nested inline code, full/streaming parity; autolink omitted/enabled                                                                | A mixed list splits or loses state, an escaped table pipe changes cells or exposes its backslash, or autolink changes other syntax.                                                 |
| FR24                   | `plugins/frontmatter.test.tsx`, Storybook, and server rendering               | complete, malformed, non-leading, LF/CRLF, unfinished streaming, full plugin stack                                                                                              | Metadata syntax renders after completion, unfinished syntax leaks while streaming, typing is lost, or later plugins stop composing.                                                 |
| FR25                   | `parser.public.test.ts`, plugin SSR tests, and package export checks          | server/RSC parsing with plugins, synchronous SSR, suspending renderer streaming boundary                                                                                        | A server import gains `use client`, plugin execution needs serialization, SSR loses fallback, or direct RSC rendering is misrepresented as supported.                               |
| FR26–FR29              | `Markdown.test.tsx`, browser scroll-state test, Storybook, theme-target tests | Fitting table; overflow at start/middle/end offsets; `'none'`/`'dialog'`/callback viewers; long unbroken token; many short columns in a narrow container; no scroll-state query | Indicator shows while fitting or hides at an edge, trigger wraps the table, viewer re-parses, focus is lost, a column collapses or squashes below min-content, or semantics change. |
| Public syntax/types    | `Markdown.public.test.ts`, core typecheck, and `Markdown.doc.mjs`             | Legacy exhaustive switches, math opt-ins, inferred extension-node unions                                                                                                        | A released union widens, an enabled union loses nodes, or docs drift from declarations.                                                                                             |
| Navigation contract    | `parser.test.ts`, `Markdown.test.tsx`, and `Markdown.renderBoundary.test.tsx` | Parsed and rendered links, including transformed built-in links; accepted ordinary schemes; rejected destinations; links versus images                                          | A blocked destination reaches navigation or a custom link renderer, or resource policy narrows accepted navigation.                                                                 |
| Security/accessibility | `parser.test.ts`, `Markdown.test.tsx`, and renderer guidance                  | Inert expression strings and renderer-owned semantics                                                                                                                           | Astryx executes math as HTML or silently claims renderer-owned accessibility.                                                                                                       |

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
identity, preparation reuse, shared heading identity, containers, diagnostics, canonical/server parsing, and theming in FR12–FR22. Existing
`components`, `inlinePlugins`, math, citations, autolinking, and parser calls remain
compatible.

Text matching, semantic fences, and source decoration are transform helpers rather
than separate protocol phases. A tree-shakeable adapter may run only synchronous
transform-only Remark plugins over the documented MDAST subset; unsupported behavior
fails closed rather than being approximated.

This projects `spec:AST-036/DEC-1` through `DEC-4` into the component owner. It rejects a registry, package discovery, mutable shared AST, raw markup, a second plugin prop, or an unrestricted Unified runtime.

### DEC-3 — Containers, diagnostics, and canonical APIs are Markdown-owned

**Reference:** `component:Markdown/DEC-3`
**Decider:** `cixzhang`, `2026-09-16`

Markdown parses every extension container's inner span itself and validates children against the plugin's declared content shape, so a callout holds real Markdown while heading identity, protected contexts, navigation policy, and Outline scope stay Core-owned. Containers change what a document can express, not which headings have identity: the released top-level traversal shared by heading IDs and Outline is untouched. A failed container renderer shows its children rather than literal source. Ownership rejections name the rule and owner; removal of another plugin's nodes is permitted and only minting, editing, internal reordering, duplication, and identity forgery are not.

Markdown also owns the protocol's observability and entry surface: `onPluginDiagnostic` makes every failure visible in production without carrying document content, admission failures degrade instead of throwing at any entrypoint, canonical parse entrypoints and a server-safe parser entry exist beside the released projection, extension types are inferred, and extension output may opt into one theme target without becoming default anatomy.

This projects `spec:AST-036/DEC-5` through `DEC-11` into the component owner in FR17–FR22. It rejects leaf-only extensions, plugin-authored parsed children, independent document shells, development-only or free-text diagnostics, parsers reachable only through a client barrel, required hand-written extension aliases, and default anatomy for plugin output.

### DEC-4 — Own an explicit Markdown dialect, not a profile switch

**Reference:** `component:Markdown/DEC-4`
**Decider:** `cixzhang`, `2026-09-19`

Markdown's released grammar is an explicit Astryx-owned subset. Task-list markers are item semantics inside the ordinary ordered or unordered list structure, so mixed task and plain items stay in one compatible list and each item retains its own state at every nesting level. Released table and task-list syntax remains enabled by default. A backslash-escaped pipe inside a table cell is structural source syntax: it keeps the pipe in that cell and contributes only the literal pipe to rendered prose or inline code, with the same result in full and incremental parsing. The optional `autolink: 'gfm'` value adds only the documented autolink behavior; it neither enables another syntax feature nor changes list structure.

This keeps documents stable as Astryx adds or declines individual ecosystem features. It rejects a blanket CommonMark or GFM conformance claim, aggregate all-task/all-plain classification, an implicit whole-grammar mode switch, and silently enabling future GFM features under the existing autolink option.

### DEC-5 — Frontmatter is typed document metadata

**Reference:** `component:Markdown/DEC-5`
**Decider:** `cixzhang`, `2026-09-19`

Native frontmatter is a first-party helper in the ordered plugin pipeline. It
recognizes only a leading delimited block, parses a deliberately small key/value
grammar through a caller-provided typed decoder, and removes the syntax from the
rendered document. It does not create a visual extension node or require Remark's
frontmatter format. During streaming, incomplete frontmatter is withheld so raw
metadata never flashes as content; once closed, later plugins can consume the
metadata and the remaining document normally.

### DEC-6 — Table overflow is built in, declared from scroll state, and never wraps the table

**Reference:** `component:Markdown/DEC-6`
**Decider:** `cixzhang`, `2026-09-25`

A table cut at its container's edge looks exactly like a table that ends there:
overlay scrollbars paint nothing until the reader is already scrolling, so the
columns past the edge are reachable but unannounced. Markdown owns the fix
instead of opening a `components.table` slot. A slot would hand every host the
whole default Table part — semantics, targets, escaping, alignment, streaming
parity — to get a cue Markdown can derive from the scroll region, so it fails
API admission as a caller-owned concept. Visibility is read in CSS from the
region's scroll state; the indicator therefore lives inside the region and
sticks to its inline-start edge, because the query styles only descendants of
the scroller and anything unsticky would slide away with the table. Querying
either inline edge keeps it visible at the end of scroll, where it is still
true.

The way into the whole table is one button in a plain sibling line, not an
interactive ancestor around `<table>`. A clickable wrapper intercepts cell
selection and link activation and flattens the table for a screen reader; a
sibling leaves all of those untouched by construction rather than by guarding.
Only the viewer is opt-in, because whether a host has a viewer surface and where
it sits in the host's layer stack is host-owned; `'dialog'` gives a host without
one a Markdown-owned default.

Columns keep a content-derived floor. Table's wrap mode sizes cells with
`max-width: 0` and `word-break: break-word`, which zeroes each cell's
min-content contribution, so automatic layout divides the container equally and
a six-column table in a narrow column squashes every cell to a few characters
without ever overflowing — the indicator and viewer then have nothing to
declare. A fixed per-column width bucket is not a substitute: it under-sizes
any column whose longest token exceeds the bucket. Markdown's default Table
part overrides that sizing on its own cells so the longest token sets the
column floor and the table overflows instead.

Rejected: a `components.table` or `components.list` override slot; a
`ResizeObserver`, measured-width, or Table-scroll-state-driven detector (the
region's JS state would cost a render per transition and couple the indicator
to Table internals rather than to the region itself); a fixed width bucket as
the column floor; a change to Table's released wrap-mode sizing for data-driven
tables; an interactive wrapper or whole-canvas click target around the table; a
viewer that re-serializes and re-parses the table; a viewer control that is on
by default.

## Open questions

- **OQ1 — Which focused tests should pin target absence for the five remaining
  custom block replacement paths?** (`checkable`)
- **OQ2 — Should Markdown's `markdown-table` block stop being a second
  `role="group"` tab stop around Table's Scroll region?** Table's region is the
  effective scroller (see Family and system relationships); the block's own
  `overflow-x`, `tabIndex`, `role`, and label never engage, so a fitting table
  keeps one dead tab stop and an overflowing table presents two consecutive
  stops both named "Table". Released DOM; out of scope for the overflow
  clauses and left for a follow-up. (`checkable`)

## Content boundary

This file does not duplicate consumer prop tables/examples, parser mechanics,
streaming implementation, nested primitive contracts, current audit results, or
system theming rules. It links to their owners.
