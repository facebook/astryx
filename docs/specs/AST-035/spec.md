---
schema_version: 1
template_version: 1
kind: system-spec
id: spec:AST-035
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
phase: proposed
owners: [cixzhang]
affects_architecture:
  [
    architecture:public-component-api,
    architecture:react-component-runtime,
    architecture:component-test-sufficiency,
  ]
affects_families: [family:navigation-destinations]
affects_contributing: []
affects_consumer_docs: [Markdown, Outline]
---

# General Markdown plugin system spec

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Public contract         | Add opt-in `plugins?: readonly MarkdownPluginEntry[]`, `defineMarkdownPlugin()` fence and typed syntax forms, data-only extension nodes, inferred parser AST unions, exported `ParseOptions`, and `IncrementalParseOptions.isFinal`; preserve every released Markdown API.                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Behavior                | Built-in syntax and protected contexts win; plugins resolve in declared order; `defer` reserves its offset; `components.code` wins over a matching fence plugin, then the first language claim, then the default CodeBlock; unmatched syntax stays readable.                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| End-user impact         | Readers can receive syntax highlighting, diagrams, ANSI output, structured references, and block extensions while ordinary Markdown, safe fallbacks, heading identity, accessibility, and built-in Table behavior remain intact.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Builder impact          | Existing builders make no changes. Builders who opt in choose an ordered plugin list and stable `cacheKey`; syntax plugins define bounded prefixes, typed data, and renderers; plugins with inline contributions also define text projection; incremental callers finalize the terminal snapshot.                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Compatibility/readiness | The contract is additive, draft, and unimplemented. Plugin-free output and released `components`, `inlinePlugins`, citations, opt-in GFM autolinks, and parser overloads remain unchanged; component-owned heading/Outline, cache, URL-policy, and Table prerequisites plus runtime/browser evidence remain pending.                                                                                                                                                                                                                                                                                                                                                                                               |
| Review checks           | Reject proposals that replace released renderer APIs, expose raw HTML/arbitrary AST or content-loaded code, weaken deterministic first-result/defer/fallback order, use async tokenization or exceed declared pending bounds, or let plugins replace Core-owned headings, links, lists, document root, or Table.                                                                                                                                                                                                                                                                                                                                                                                                   |
| Governing rules         | [`component:Markdown`](../../../packages/core/src/Markdown/Markdown.spec.md); [`architecture:public-component-api`](../../architecture/public-component-api.md); [`family:navigation-destinations`](../../families/navigation-destinations.md); [AST-002 FR4 — Existing composition and styling seams come first](../AST-002/spec.md); [AST-002 FR15 — Invalid states are prevented where practical](../AST-002/spec.md); [AST-002 FR17 — Public module and utility function names disclose one atomic role](../AST-002/spec.md); [AST-002 FR18 — Public primitives support composition intentionally](../AST-002/spec.md); [AST-002 FR20 — Callsite impact and decision burden are explicit](../AST-002/spec.md). |

This table is a review projection; the body below is authoritative.

## Intent

Application authors should be able to add reusable Markdown syntax that the fixed
Astryx dialect cannot express—such as diagrams, terminal output, structured
references, and product-neutral block directives—without rewriting source text,
forking the parser, or replacing the whole renderer.

AST-035 owns only that missing general extension contract. The current support
boundary is recorded below; the requirements below define the complete proposed
behavior. This specification changes no runtime by itself.

## Non-goals

- Runtime implementation, consumer documentation, release artifacts, and bundled
  optional engines remain follow-up work; see FR37 and Migration and lifecycle.
- Existing renderer/parser seams are not replaced or deprecated; see FR1–FR3 and
  DEC-1.
- Raw HTML, executable or content-selected code, generic AST mutation, and unchecked
  renderer replacement are excluded by FR4, FR12, and FR21–FR24.
- Async parsing, network/worker orchestration, cancellation, and v1 version
  negotiation are outside the synchronous contract in FR9 and the lifecycle below.
- Custom block nodes do not create Outline entries in v1; see FR19 and OQ1.
- Baseline parser defects remain with their canonical owners under Related
  component-owned dependencies.

## Current-state impact

| Need                            | Current support                                                                                                                         | Missing contract                                                                                                                                                       |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Replace known rendered elements | `components` replaces code, inline code, citation, link, heading, paragraph, image, blockquote, and horizontal rule.                    | No new contract needed; preserve it.                                                                                                                                   |
| Replace prose substrings        | `inlinePlugins` finds regular-expression matches in rendered text nodes and returns React output.                                       | It has no parser context, source range, structured node, block support, or safety services.                                                                            |
| Syntax-highlight a fence        | `components.code` can inspect the language and replace every code block.                                                                | No language-scoped, composable fence registration or default fallback.                                                                                                 |
| Diagrams or ANSI fences         | A consumer can replace all code blocks and branch manually.                                                                             | No typed language claim or deterministic composition among independent renderers.                                                                                      |
| Math                            | A separately accepted focused contract may add an opt-in math renderer and parser option.                                               | No general replacement is proposed; when such a contract is current, plugins compose around it.                                                                        |
| Citations                       | `sources`, `citationStyle`, and `components.citation` are built in.                                                                     | No general change is needed.                                                                                                                                           |
| Entity-style autolinking        | `inlinePlugins` handles simple display-only replacements; source preprocessing handles more complex cases.                              | No structured parser node with source provenance and protected-context rules.                                                                                          |
| Custom inline/block syntax      | The exported AST is closed over built-in node kinds.                                                                                    | No typed syntax matcher, custom node envelope, renderer ownership, or fallback contract.                                                                               |
| Streaming                       | Incremental parsing reuses immutable settled blocks and reparses the unsettled suffix; open built-in constructs can retain more source. | Plugin/config identity, partial-match deferral, source-length accounting, and cache invalidation are undefined.                                                        |
| Outline interoperability        | Markdown and Outline share slug utilities for built-in headings.                                                                        | Plugins have no plain-text projection, and parse options can diverge between Markdown and Outline.                                                                     |
| Built-in tables                 | A labelled focusable horizontal wrapper and character-count width buckets exist.                                                        | Width is inferred from JavaScript string length rather than intrinsic/min-content layout, and the readable narrow-screen invariant is not fully specified or verified. |

There is one repository callsite of `inlinePlugins`, in the Markdown story. Existing
product and documentation callsites primarily use `components`, citations,
compact density, or source preprocessing. This supports adding one narrow parser
capability rather than replacing released APIs.

## Public API

### Additive entry points

The proposed public surface is:

```ts
export type MarkdownPluginData =
  | null
  | boolean
  | number
  | string
  | readonly MarkdownPluginData[]
  | {readonly [key: string]: MarkdownPluginData};

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
  ? Omit<T, Extract<keyof T, K>>
  : never;

export interface MarkdownExtensionNode<
  PluginName extends string = string,
  NodeName extends string = string,
  Data extends MarkdownPluginData = MarkdownPluginData,
> {
  readonly type: 'extension';
  readonly plugin: PluginName;
  readonly name: NodeName;
  readonly display: 'inline' | 'block';
  readonly data: Data;
  readonly source: string;
  readonly range?: SourceRange;
}

export interface MarkdownTokenizerInput {
  readonly source: string;
  /** UTF-16 offset into source. */
  readonly offset: number;
  /** Exclusive UTF-16 end offset currently available to the scanner. */
  readonly end: number;
  readonly isFinal: boolean;
  readonly context: 'inline' | 'block';
  readonly lineStart: number;
  readonly column: number;
}

export type MarkdownTokenizeResult<Node extends MarkdownExtensionNode> =
  | {readonly status: 'no-match'}
  | {readonly status: 'defer'}
  | {
      readonly status: 'match';
      readonly end: number;
      readonly node: DistributiveOmit<Node, 'source' | 'range'>;
    };

export interface MarkdownInlineSyntax<Node extends MarkdownExtensionNode> {
  readonly startsWith: readonly [string, ...string[]];
  readonly maxPendingChars: number;
  tokenize(input: MarkdownTokenizerInput): MarkdownTokenizeResult<Node>;
}

export interface MarkdownBlockSyntax<Node extends MarkdownExtensionNode> {
  readonly startsWith: readonly [string, ...string[]];
  readonly maxPendingChars: number;
  tokenize(input: MarkdownTokenizerInput): MarkdownTokenizeResult<Node>;
}

export type MarkdownSyntaxDefinition<Node extends MarkdownExtensionNode> =
  | {
      readonly inline: readonly [
        MarkdownInlineSyntax<Extract<Node, {display: 'inline'}>>,
        ...MarkdownInlineSyntax<Extract<Node, {display: 'inline'}>>[],
      ];
      readonly block?: readonly MarkdownBlockSyntax<
        Extract<Node, {display: 'block'}>
      >[];
      toText(node: Extract<Node, {display: 'inline'}>): string;
    }
  | {
      readonly inline?: undefined;
      readonly block: readonly [
        MarkdownBlockSyntax<Extract<Node, {display: 'block'}>>,
        ...MarkdownBlockSyntax<Extract<Node, {display: 'block'}>>[],
      ];
      readonly toText?: never;
    };

export interface MarkdownFenceRenderer {
  readonly languages: readonly [string, ...string[]];
  readonly component: React.ComponentType<{
    value: string;
    language: string;
    meta: string | undefined;
    range: SourceRange | undefined;
  }>;
}

export interface MarkdownSyntaxPluginDefinition<
  Name extends string,
  Node extends MarkdownExtensionNode<Name>,
> {
  readonly name: Name;
  readonly apiVersion: 1;
  /** Stable caller-authored identity for every parse-affecting option. */
  readonly cacheKey: string;
  readonly syntax: MarkdownSyntaxDefinition<Node>;
  readonly fences?: readonly MarkdownFenceRenderer[];
  readonly renderers: Readonly<{
    [NodeName in Node['name']]: React.ComponentType<{
      node: Extract<Node, {name: NodeName}>;
    }>;
  }>;
}

export interface MarkdownFencePluginDefinition<Name extends string> {
  readonly name: Name;
  readonly apiVersion: 1;
  readonly cacheKey: string;
  readonly syntax?: never;
  readonly renderers?: never;
  readonly fences: readonly [MarkdownFenceRenderer, ...MarkdownFenceRenderer[]];
}

export type MarkdownPluginDefinition<
  Name extends string,
  Node extends MarkdownExtensionNode<Name>,
> =
  | MarkdownSyntaxPluginDefinition<Name, Node>
  | MarkdownFencePluginDefinition<Name>;

declare const markdownPluginNode: unique symbol;

/** Opaque, covariant entry safe to store in heterogeneous plugin lists. */
export interface MarkdownPluginEntry<
  Node extends MarkdownExtensionNode = MarkdownExtensionNode,
> {
  readonly name: string;
  readonly apiVersion: 1;
  readonly cacheKey: string;
  readonly [markdownPluginNode]: Node;
}

export declare function defineMarkdownPlugin<const Name extends string>(
  definition: MarkdownFencePluginDefinition<Name>,
): MarkdownPluginEntry<never>;

export declare function defineMarkdownPlugin<
  const Name extends string,
  const Node extends MarkdownExtensionNode<Name>,
>(
  definition: MarkdownSyntaxPluginDefinition<Name, Node>,
): MarkdownPluginEntry<Node>;

export type MarkdownNodeOf<Entry> =
  Entry extends MarkdownPluginEntry<infer Node> ? Node : never;

export type MarkdownExtensionsOf<
  Plugins extends readonly MarkdownPluginEntry[],
> = MarkdownNodeOf<Plugins[number]>;
```

`MarkdownProps` adds only one new prop:

```ts
plugins?: readonly MarkdownPluginEntry[];
```

The existing parser option object adds the same optional `plugins` field. The
`ParseOptions` type becomes reachable from both `@astryxdesign/core/Markdown` and
the server-safe `@astryxdesign/core/Markdown/utils` entry point. Public AST aliases
accept an extension-node generic whose default is `never`, so existing annotations
remain unchanged:

```ts
export type InlineNode<Extension extends MarkdownExtensionNode = never> =
  BuiltInInlineNode | Extract<Extension, {display: 'inline'}>;

export type BlockNode<Extension extends MarkdownExtensionNode = never> =
  BuiltInBlockNode | Extract<Extension, {display: 'block'}>;
```

The parser retains the released `ReadonlySet<string>` and option-object overloads,
then adds a tuple-inferred plugin overload. Incremental parsing uses an additive
finalization option:

```ts
export interface IncrementalParseOptions extends ParseOptions {
  /** False while more source may arrive; true for the terminal snapshot. */
  readonly isFinal?: boolean;
}

type IncrementalParseOptionsWithoutPlugins = Omit<
  IncrementalParseOptions,
  'plugins'
>;

type ParseOptionsWithoutPlugins = Omit<ParseOptions, 'plugins'>;

export function parseMarkdown(
  source: string,
  sourceIds?: ReadonlySet<string>,
): BlockNode[];

export function parseMarkdown(
  source: string,
  options: ParseOptionsWithoutPlugins,
): BlockNode[];

export function parseMarkdown<
  const Plugins extends readonly MarkdownPluginEntry[],
>(
  source: string,
  options: ParseOptionsWithoutPlugins & {plugins: Plugins},
): BlockNode<MarkdownExtensionsOf<Plugins>>[];

export function parseMarkdownIncremental(
  source: string,
  state: IncrementalState,
  sourceIds?: ReadonlySet<string>,
): BlockNode[];

export function parseMarkdownIncremental(
  source: string,
  state: IncrementalState,
  options: IncrementalParseOptionsWithoutPlugins,
): BlockNode[];

export function parseMarkdownIncremental<
  const Plugins extends readonly MarkdownPluginEntry[],
>(
  source: string,
  state: IncrementalState,
  options: IncrementalParseOptionsWithoutPlugins & {plugins: Plugins},
): BlockNode<MarkdownExtensionsOf<Plugins>>[];
```

`parseInline` retains its released `ReadonlySet<string>` and option-object overloads
before adding the same inferred plugin form; direct calls are final parses.
`parseMarkdownIncremental` retains its released overloads, accepts
`IncrementalParseOptionsWithoutPlugins`, and adds the inferred plugin form with
`isFinal`. Omitted `isFinal` is `false` for backward compatibility. A direct caller
MUST either make its terminal incremental call with `isFinal: true` or perform one
final `parseMarkdown` call. Outline parsing and `useOutlineFromMarkdown` accept the
same parse options so one ordered plugin list and one citation/autolink
configuration can produce one heading identity.

The helper erases callback parameter variance only after checking one concrete
plugin definition; heterogeneous `readonly MarkdownPluginEntry[]` lists are then
safe under strict TypeScript. Core runtime validation rejects duplicate plugin
names, invalid prefixes/ranges, and cyclic or non-data node payloads before a node
is cached or rendered. The public types exclude React elements, functions, DOM
nodes, symbols, and `bigint`; plugins still own the truthfulness and immutability of
the data they return.

## Requirements

### Admission and compatibility

- **FR1 — Plugins are explicit and additive.** Omission or `[]` MUST produce the
  same parser output, incremental cache behavior, rendered DOM, styling,
  accessibility tree, heading IDs, Outline, and performance gates as current
  Markdown.
  `plugins` MUST NOT enable a Core plugin registry or implicit default plugins.
- **FR2 — Existing seams remain stable.** `components`, `inlinePlugins`, citations,
  opt-in GFM autolinking, legacy parser signatures, and any focused math contract
  that becomes current MUST retain their source and runtime contracts. No existing
  consumer must migrate to use plugins.
- **FR3 — Plugins own only missing parser capability.** A new plugin is admitted
  only when the need requires fenced-language selection, structured source
  provenance, protected syntax context, a custom AST node, or block parsing that
  existing seams cannot express. Product-specific rendering remains a recipe or
  external package.
- **FR4 — Public nodes use one closed envelope.** Syntax callbacks MAY return only
  the data-only `MarkdownExtensionNode` envelope. They MUST NOT return built-in
  nodes, arbitrary objects added to the built-in union, React output, executable
  callbacks, raw HTML, or a replacement document tree.

### Parsing phases and precedence

- **FR5 — Built-in lexical shields win.** Core invokes inline syntax during its
  source-aware scan, before literal text is coalesced, so escape and source-offset
  provenance is still available. Escapes, inline code, fenced code, existing
  links/images, citations, and any accepted opt-in math syntax remain opaque.
  Inline syntax runs only on remaining literal source outside existing link labels
  and destinations. It may run inside built-in emphasis/strikethrough children
  after those containers are recognized.
- **FR6 — Block plugins fill the top-level paragraph fallback gap.** Built-in
  fences, headings, quotes, lists, tables, horizontal rules, images, and definitions
  claim their existing syntax first. In v1, block plugins run only at a top-level
  line boundary, after at most the indentation already accepted for an ordinary
  top-level paragraph, when no built-in block owns that position. They do not run
  inside list items or blockquotes. A match may consume multiple complete lines;
  otherwise the source becomes the existing paragraph fallback.
- **FR7 — Ordered first result wins.** Duplicate plugin names are invalid. At one
  candidate offset, plugins are consulted in array order and each plugin's
  contributions are consulted in declaration order. A full prefix invokes its
  tokenizer; `match` claims the source, `no-match` continues, and `defer` reserves
  that candidate and stops later dispatch until more input resolves it. On a
  non-final chunk, a trailing proper prefix of an earlier contribution likewise
  reserves the candidate before a later contribution can match. This preserves
  full/incremental parity. No longest-match, priority number, or registration-time
  reordering exists in v1.
- **FR8 — Prefixes and matches advance.** Every `startsWith` value is a non-empty
  literal string. Offsets and ranges use JavaScript UTF-16 code units, matching
  `String.prototype.slice`. A match end MUST be greater than the current offset and
  no greater than the supplied end. Extension node `plugin` MUST equal its owner's
  name and node display MUST match the phase. Invalid configuration or callback
  output fails validation rather than looping, truncating, or silently reordering
  content.
- **FR9 — Tokenization is synchronous and deterministic by contract.** A compliant
  tokenizer depends only on its input, immutable declared configuration, and local
  data. It performs no I/O, time/random work, settled-node mutation, or async work.
  Core rejects a returned promise but cannot sandbox or prove the complexity of
  trusted application code; plugin-specific compliance remains the plugin author's
  responsibility.

### Fenced renderers and renderer precedence

- **FR10 — Fence language selection is narrow.** The built-in parser continues to
  own fence boundaries and inert code text. A fence contribution claims one or
  more case-insensitive normalized language aliases; it receives the literal body,
  normalized language, uninterpreted metadata, and source range. It does not parse
  or execute the body.
- **FR11 — Existing code override wins.** When `components.code` is supplied, it
  receives every fenced block exactly as today and no fence plugin renders it.
  Otherwise the first matching fence contribution renders the block. With no
  match, the existing CodeBlock renders unchanged.
- **FR12 — Custom-node rendering stays local.** A custom node is rendered only by
  its owning plugin's renderer for that node name. Plugins cannot override the
  document root, built-in Table, headings/IDs, links, lists, or another plugin's
  nodes. Existing `components` remains the built-in renderer override API.
  Post-parse `inlinePlugins` continue to process only remaining built-in text nodes;
  they do not process extension nodes.
- **FR13 — Missing capability preserves source.** An unknown fence uses the default
  CodeBlock. A final parse with no syntax match leaves the source literal. Syntax
  plugins are invalid unless every declared custom node has an owning renderer, so
  `<Markdown>` has no silent unknown-node path. Exceptions thrown by trusted plugin
  code remain application errors and are not misrepresented as malformed Markdown.

### Streaming and source provenance

- **FR14 — Partial syntax can defer only a declared live suffix.** Full
  `parseMarkdown`/`parseInline` calls always invoke tokenizers with `isFinal: true`.
  Incremental parsing passes its explicit finalization state; omitted
  `IncrementalParseOptions.isFinal` remains `false` for compatibility. Core retains
  a trailing proper prefix of `startsWith` without invoking the tokenizer. Each
  contribution's positive finite `maxPendingChars` MUST be at least one less than
  its longest prefix's UTF-16 length. A tokenizer may return `defer` only when
  `isFinal` is false, the candidate reaches the current input end, and the retained
  suffix is no longer than that bound. A terminal incremental call with
  `isFinal: true` resolves every remaining prefix/defer as match or literal,
  produces the same AST as a full parse with the same options, stores that final
  immutable snapshot, and leaves no hidden pending source. Exceeding the bound or
  later invalidation likewise converts the bytes to literal text unless a valid
  match is returned.
- **FR15 — Explicit configuration identity invalidates cache.** The incremental
  signature includes the ordered plugin entries' object identities plus each
  `name`, `apiVersion`, and caller-authored `cacheKey`, along with every existing
  parse-affecting option. A new entry object, order, or key invalidates incompatible
  settled output. A plugin MUST change `cacheKey` when immutable closure/config data
  changes. Stable entries preserve immutable settled-node reuse and fresh result
  arrays; Core does not attempt to hash or introspect closures.
- **FR16 — Ranges remain source truth.** Core attaches `source` and optional
  absolute `range` from the accepted span; plugin callbacks do not author or shift
  them. A plugin cannot insert, delete, or reorder unrelated built-in nodes. When
  source ranges are disabled, their absence remains the default.
- **FR17 — Streaming presentation uses source length.** Each extension node is one
  atomic render unit for fade boundaries, and its consumed source length advances
  the streaming cursor. Plugins cannot report a separate rendered-character length
  or request character-by-character splitting in v1. Plugin deferral is bounded by
  `maxPendingChars`; this does not claim to bound existing open built-in constructs
  such as an unclosed fence, whose current streaming behavior remains separate.

### Heading IDs and Outline

- **FR18 — One textual projection governs heading identity.** An inline extension
  used inside a built-in heading MUST provide a deterministic `toText` result. The
  same projection, parse options, slugger, and collision allocator MUST generate
  the Markdown heading ID and Outline label/target. Renderer output cannot change
  the ID.
- **FR19 — Built-in headings exclusively own Outline entries in v1.** Block
  extension nodes do not create heading levels or Outline entries. A block plugin
  may contain prose or render a labelled region, but it cannot manufacture a
  navigation target that competes with the shared heading sequence. OQ1 asks
  whether a later version should add a constrained outline contribution.
- **FR20 — Shared heading identity is a component-owned prerequisite.** Before the
  plugin API ships, the canonical Markdown/Outline owner must guarantee that one
  parse configuration and one collision allocator produce unique matching IDs,
  including cross-base duplicates such as `setup`, `setup-1`, `setup` and
  citation-bearing headings. AST-035 depends on that result but does not own the
  baseline remediation.

### Sanitization and security boundary

- **FR21 — Source is untrusted; installed plugin code is trusted application code.**
  Markdown content can select only syntax already installed by the application. Core
  does not dynamically load a package, evaluate source, or grant parser callbacks
  network/filesystem capabilities. A renderer is ordinary application React code
  with the application's authority; Astryx does not sandbox it or claim to prevent
  its own I/O or unsafe DOM behavior.
- **FR22 — Core exposes no raw-HTML channel.** Syntax callbacks and accepted node
  data contain only finite, acyclic `MarkdownPluginData`; Core validates that
  boundary. The plugin API exposes no HTML parser, raw-markup field, DOM node,
  React-valued AST field, or `dangerouslySetInnerHTML` helper. A trusted renderer
  remains ordinary application code and can choose behavior outside this guarantee;
  an HTML/SVG string is never considered safe merely because a plugin produced it.
- **FR23 — Navigation/resource policies keep their owners.** Plugin nodes carrying
  URL-like strings do not become trusted URLs. Any Astryx-owned navigation sink
  must use `family:navigation-destinations`; embedded resources remain a distinct
  stricter policy under `spec:AST-005/DEC-2`. Core MUST NOT claim to sanitize raw
  links or resources manufactured by arbitrary renderer code.
- **FR24 — Parser and renderer policy must agree.** The existing parser/renderer
  disagreement for empty and `data:` destinations must be reconciled before plugin
  nodes can rely on shared URL semantics. Conformance tests, not duplicated local
  blocklists, own the accepted/rejected matrix.

### Accessibility

- **FR25 — Core semantics stay core-owned.** The document role, heading level/ID,
  link behavior, list/table semantics, image fallback, direction, and streaming
  reduced-motion behavior cannot be overridden by plugins.
- **FR26 — Custom nodes require a semantic contract.** Each public plugin documents
  its role, name/description source, keyboard/focus behavior, reduced-motion
  behavior, forced-colors behavior, and non-color meaning. A renderer that creates
  an interactive surface owns its complete established ARIA pattern and must not
  nest interaction inside an existing link.
- **FR27 — Text projection must match perceivable meaning.** `toText` supplies an
  inline extension node's plain-text contribution to built-in heading labels, slug
  generation, and matching Outline labels/targets. It must not hide text that the
  renderer makes essential or add text unavailable to users.
- **FR28 — Fallback remains understandable.** Without a matching fence renderer,
  diagrams, highlighted code, and ANSI examples remain readable as ordinary code.
  Without a valid inline/block syntax match, source remains readable literal text.

### Built-in Markdown table invariant

- **FR29 — Table layout is not a plugin responsibility.** Built-in Markdown tables
  retain one semantic Table and a Markdown-owned overflow wrapper. No generic
  renderer or syntax plugin may replace that structure or require hosts to repair
  its layout. The readable intrinsic column floor, bounded horizontal overflow,
  keyboard/touch scrolling, accessible labelling, overflow affordance, RTL/CJK
  behavior, and unchanged fitting-desktop behavior are owned by
  `component:Markdown/FR6`–`FR8`.

The detailed table requirements and their browser evidence live in the colocated
Markdown component record and land through a separate atomic implementation. This
system spec owns only the extension boundary: plugins cannot bypass that contract.

### Performance and resources

- **FR33 — Plugin-free budgets do not move.** The existing full-parse ceilings remain
  `<20 ms` for 10 generated sections, `<50 ms` for 50, `<100 ms` for 200,
  `<400 ms` for 500, and `<1,000 ms` for 2,000 under the existing best-of-three
  benchmark. The existing 50/500-section cumulative streaming ceilings and
  `1.1×` incremental-versus-full 200-section gate also remain unchanged.
- **FR34 — Core candidate dispatch is bounded.** Core indexes inline/block
  contributions by declared `startsWith` prefixes and fence contributions by
  normalized language. With five no-match plugins whose tokenizers immediately
  return `no-match`, Core dispatch adds no more than 15% to the 200- and
  500-section full-parse medians and stays inside the existing absolute ceilings.
  This measures Core overhead, not arbitrary plugin work.
- **FR35 — Core scanning stays linear.** With trivial deterministic tokenizers and
  one inline extension match per 200 source characters plus one extension block per
  20 blocks, Core scanning/validation/render dispatch adds no more than 25% to the
  equivalent full parse. Plugin authors own their callback complexity; Astryx does
  not claim a global bound for trusted third-party code.
- **FR36 — Streaming reuse remains bounded by declared plugin state.** With stable
  no-match plugins, the existing median/worst new-block counts per 50-character
  chunk remain `[1, 1, 1]` and `[3, 3, 3]` across 50/200/500-section fixtures. For
  matched plugin syntax, extra retained work is bounded by the winning
  contribution's `maxPendingChars`. Existing unclosed built-in constructs retain
  their separately owned behavior. A configuration change may invalidate once; it
  must not cause every later chunk to reparse settled content.
- **FR37 — Optional dependencies stay optional.** Core does not depend on a syntax
  highlighter, diagram engine, ANSI parser, math engine, citation resolver, or
  entity client. Plugin packages remain separately importable and tree-shakeable;
  parser-only use does not require a browser DOM.

## Concrete examples

The examples are API-shape evidence. They do not add these packages to Core.

### Syntax highlighting

```tsx
const highlightedCode = defineMarkdownPlugin({
  name: 'highlighted-code',
  apiVersion: 1,
  cacheKey: 'highlighted-code@1',
  fences: [
    {
      languages: ['js', 'jsx', 'ts', 'tsx'],
      component: HighlightedCode,
    },
  ],
});

<Markdown plugins={[highlightedCode]}>{source}</Markdown>;
```

FR11 governs `components.code`, language-claim, and default-CodeBlock precedence.

### Mermaid-like diagrams

```tsx
const diagrams = defineMarkdownPlugin({
  name: 'diagrams',
  apiVersion: 1,
  cacheKey: 'diagrams@1',
  fences: [{languages: ['diagram'], component: Diagram}],
});
```

FR21–FR28 govern inert input, trusted renderer scope, accessible output,
reduced-motion behavior, and readable fallback.

### ANSI terminal output

```tsx
const terminalOutput = defineMarkdownPlugin({
  name: 'terminal-output',
  apiVersion: 1,
  cacheKey: 'terminal-output@1',
  fences: [{languages: ['ansi', 'terminal'], component: TerminalOutput}],
});
```

This renderer maps ANSI spans to semantic theme tokens while preserving copyable
plain text and reading order; FR21–FR28 keep control sequences inert and require
accessible output.

### Math

If a separately accepted focused math renderer becomes current, math remains on
that built-in contract rather than being migrated into the general plugin layer:

```tsx
<Markdown components={{math: MathRenderer}}>
  {'Inline $x^2$ and display: $$\\int_0^1 x\\,dx$$'}
</Markdown>
```

If that focused API becomes current, the renderer receives inert TeX text and owns
presentation/accessibility. Code, escaped delimiters, and unmatched delimiters
remain literal under that contract. If it does not land, this example is
non-authoritative and AST-035 does not create an equivalent plugin or migration.

### Citations

Citations also remain built in:

```tsx
<Markdown sources={{paper: {title: 'A public source', href: '/paper'}}}>
  {'A supported claim [paper].'}
</Markdown>
```

A plugin is not admitted merely to duplicate `sources`, `citationStyle`, or
`components.citation`.

### Entity-style autolinking

A structured reference that needs source provenance can emit a data-only node:

```tsx
interface ReferenceNode extends MarkdownExtensionNode<
  'references',
  'reference',
  {kind: 'issue' | 'document'; id: string}
> {}

const references = defineMarkdownPlugin<'references', ReferenceNode>({
  name: 'references',
  apiVersion: 1,
  cacheKey: 'references@1',
  syntax: {
    inline: [referenceSyntax],
    toText: node => node.source,
  },
  renderers: {reference: ReferenceLink},
});
```

FR5, FR18, and FR23 govern protected contexts, heading text projection, and
navigation ownership. A display-only regex replacement should continue using
`inlinePlugins` under FR3.

### Block syntax

```tsx
interface NoteNode extends MarkdownExtensionNode<
  'notes',
  'note',
  {label: string; body: string}
> {}

const notes = defineMarkdownPlugin<'notes', NoteNode>({
  name: 'notes',
  apiVersion: 1,
  cacheKey: 'notes@1',
  syntax: {block: [noteBlockSyntax]},
  renderers: {note: NoteBlock},
});
```

FR4, FR6, FR8, and FR16 govern this top-level block's matching, positive source
range, and data-only output.

## Migration and lifecycle

FR2 preserves existing consumers without migration: `components` and
`inlinePlugins` are neither deprecated nor wrapped by an adapter in v1. For opt-in
use:

- Choose `components.code` when one application renderer owns all fences; choose a
  fence plugin only for language-scoped package composition and default fallback.
- Keep display-only prose substitutions on `inlinePlugins`; choose inline syntax
  only for parser context, source ranges, protected contexts, typed nodes, or
  Outline projection.
- Keep citations and any separately accepted focused math renderer on their owning
  APIs.
- A future breaking change to a released plugin shape requires the ordinary Core
  compatibility process, migration evidence, and a new `apiVersion`; v1 does not
  negotiate mixed versions.

The implementation PR owns public exports, consumer docs, examples, tests, and a
package Changeset. This specification-only PR carries none.

## Verification

| Contract             | Required evidence                                                                                  | Representative states                                                                                                                      | Failure signal                                                                                                                                                    |
| -------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR1–FR4              | Existing parser/render snapshots plus public type fixtures                                         | no prop, `[]`, legacy citation set, current components/inlinePlugins, generic default inference                                            | No-plugin output/type changes, an existing callback moves phase, or extension data accepts executable/render values.                                              |
| FR5–FR9              | Parser precedence and invalid-plugin suites                                                        | escapes, emphasis, links, code, images, citations, math, same-prefix plugins, zero-length/backward/overrun results                         | A plugin enters a protected context, built-in syntax loses, order is unstable, or invalid output loops/truncates.                                                 |
| FR10–FR13            | Fence/renderer matrix                                                                              | alias case, metadata, duplicate claims, components.code, unknown language                                                                  | Existing code override loses, unmatched code disappears, a plugin lacks an owned renderer, or one plugin renders another's node.                                  |
| FR14–FR17            | Full/incremental parity and snapshot tests                                                         | delimiters split at every character, omitted/false/true `isFinal`, defer/no-match/final, plugin reorder/config change, sourceRanges on/off | A terminal incremental snapshot differs from full parse, hides pending source, mutates settled nodes, keeps stale cache, or loses exact source ranges.            |
| FR18–FR20            | Markdown/Outline parity suite                                                                      | formatting, extension text, duplicate/cross-base slugs, citations, non-ASCII, plugin order                                                 | Visible heading, ID, Outline label, and target diverge or duplicate.                                                                                              |
| FR21–FR24            | Core boundary/security matrix and public-type/runtime validation fixtures                          | raw HTML payloads, cyclic/non-data nodes, script-like text, URL obfuscation, unknown data schemes, external AST                            | Core interprets source/node HTML as markup, accepts invalid data, hands an unsafe destination to an Astryx-owned sink, or parser/renderer policies disagree.      |
| FR25–FR28            | Component, axe, keyboard, forced-colors, reduced-motion, and assistive-technology evidence         | inline/block nodes, interactive references, diagram fallback, ANSI/plain copy, LTR/RTL                                                     | Core semantics are replaced, interaction nests, meaning is color-only, fallback loses content, or text projection lies.                                           |
| FR29                 | Cross-record ownership check against `component:Markdown/FR6`–`FR8`                                | built-in table with syntax/fence plugins present                                                                                           | A plugin can replace/bypass the table shell, or the system spec duplicates the component-owned layout contract.                                                   |
| FR33–FR37            | Existing budgets plus Core-only synthetic plugin benchmarks, bundle inspection, server import test | no plugins, five zero-work no-match plugins, trivial regular matches, 50/200/500/2,000 sections, stable/config-changed streaming           | Existing ceiling moves, Core overhead exceeds budget, plugin deferral exceeds its declaration, heavy optional dependency enters Core, or parser import needs DOM. |
| Repository integrity | `pnpm check:knowledge`, public-content scan, formatting, and changed-file audit                    | one draft system spec plus the linked Markdown component record                                                                            | Invalid record shape, private context, runtime file, Changeset, or unrelated change enters this proposal.                                                         |

### Related component-owned dependencies

The plugin implementation depends on three separately owned Markdown outcomes:

1. the canonical Markdown/Outline owner closes cross-base heading collisions and
   citation-aware ID parity before plugins can contribute heading text;
2. the incremental parser invalidates settled output for every current
   parse-affecting option, including citation source IDs, before plugin cache
   identity extends that mechanism; and
3. the navigation and embedded-resource owners close the current parser/renderer
   policy disagreement before plugins can rely on those shared results.

The built-in table invariant linked by FR29 remains pending implementation and
verification in a separate `component:Markdown` change. Other audit findings—streaming cleanup of
ordinary bracket text, indentation parity, and legacy `inlinePlugins` regex/link
behavior—remain report-only and do not block or expand AST-035 unless their
canonical owners make them explicit dependencies.

## Decision log

### DEC-1 — Add a parser plugin layer without replacing renderer APIs

**Reference:** `spec:AST-035/DEC-1`
**Direction owner:** `cixzhang`, `2026-09-13`; exact-head approval pending

DEC-1 adopts FR1–FR3 and FR10–FR13: use one additive parser/fence plugin layer
only for capabilities the released render and text-substitution seams cannot
express. Existing consumers do not migrate.

Rejected alternatives are the replacement/deprecation paths in Non-goals; they
would turn one parser gap into a broad compatibility break and could supersede a
separately accepted focused contract.

### DEC-2 — Extension nodes are data-only and locally rendered

**Reference:** `spec:AST-035/DEC-2`
**Direction owner:** `cixzhang`, `2026-09-13`; exact-head approval pending

DEC-2 adopts FR4, FR8, FR12–FR16, and FR21–FR24: syntax emits only the owning
plugin's discriminated data node, and its renderer receives that node after Core
adds source identity.

Rejected alternatives are the generic mutation/raw-markup paths in Non-goals;
they cannot preserve the required ordering, streaming, provenance, security, and
AST compatibility boundaries.

## Open questions

- **OQ1 — Should a later plugin API allow custom block nodes to contribute
  constrained Outline entries, or should Outline permanently remain
  built-in-heading-only?** (`human-api`)

  **Recommended v1 answer:** keep Outline built-in-heading-only. It preserves one
  heading/slug owner and avoids permanent ordering, collision, and accessibility
  semantics before a demonstrated custom-heading use case exists.
