---
schema_version: 1
template_version: 1
kind: system-spec
id: spec:AST-036
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
| Public contract         | Keep one additive `plugins?: readonly MarkdownPluginEntry[]` prop and `createMarkdownPlugin()`. A plugin has capability-named optional `text`, `syntax`, `fences`, `renderers`, and `decorations`; parser APIs infer its data-only extension nodes and incremental callers explicitly finalize streamed input.                                                                                                                                                                                                                                                                                                                                                                                                     |
| Behavior                | Built-in syntax and protected contexts win. Plugins resolve in array/declaration order; syntax and fence conflicts use first claim, text conflicts use first claim with legacy `inlinePlugins` adapted last, and decorations compose in deterministic layers without changing the AST.                                                                                                                                                                                                                                                                                                                                                                                                                             |
| End-user impact         | Readers can receive semantic fences, comments/highlights, structured references, and block extensions while ordinary Markdown, CodeBlock highlighting, copyable fallbacks, heading/Outline identity, accessibility, and built-in link/image/list/table policy remain Core-owned.                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Builder impact          | Existing builders make no change. Opt-in builders explicitly import colocated or third-party plugins and keep the list stable. Plugin authors choose only the capabilities they need and may export a static plugin, `createXPlugin(options)`, or `useXPlugin(state)` through the Markdown surface.                                                                                                                                                                                                                                                                                                                                                                                                                |
| Compatibility/readiness | The record is draft and unimplemented. The zero-plugin path and released APIs stay unchanged. `inlinePlugins` is not soft-deprecated until `text` parity, an internal final adapter, migration docs, and a codemod exist. Runtime, browser, type, cache, allocation, and remount evidence remains pending.                                                                                                                                                                                                                                                                                                                                                                                                         |
| Review checks           | Reject a registry or separate Astryx plugin package family, lifecycle-grouped `parse/render/decorate`, unrestricted whole-document parse/render hooks, raw HTML or arbitrary AST mutation, plugin-state-driven reparsing, per-character/per-node scans of every plugin, a plugin replacement for existing CodeBlock highlighting, unsafe or non-copyable fence failure, decorations that affect parsing, or any plugin override of Core-owned document/link/image/list/table policy.                                                                                                                                                                                                                               |
| Governing rules         | [`component:Markdown`](../../../packages/core/src/Markdown/Markdown.spec.md); [`architecture:public-component-api`](../../architecture/public-component-api.md); [`family:navigation-destinations`](../../families/navigation-destinations.md); [AST-002 FR4 — Existing composition and styling seams come first](../AST-002/spec.md); [AST-002 FR15 — Invalid states are prevented where practical](../AST-002/spec.md); [AST-002 FR17 — Public module and utility function names disclose one atomic role](../AST-002/spec.md); [AST-002 FR18 — Public primitives support composition intentionally](../AST-002/spec.md); [AST-002 FR20 — Callsite impact and decision burden are explicit](../AST-002/spec.md). |

This table is a review projection; the body below is authoritative.

## Intent

Application authors should be able to add reusable Markdown behavior without
rewriting source text, forking the parser, or replacing the whole renderer. The
same model must cover simple text replacement, new inline/block syntax,
language-scoped fences, typed extension-node rendering, and source-range
annotations while preserving one understandable processing order.

The API follows the existing Table plugin precedent: public plugins and plugin
helpers are colocated under `Markdown/plugins/*`, re-exported through Markdown and
Core, and consumed through one `plugins` prop. Third parties may publish compatible
plugins through ordinary package imports, but Astryx does not create a separate
plugin package family or discovery registry.

This specification changes no runtime by itself. The requirements below define the
complete proposed behavior.

## Non-goals

- Implement the runtime, first-party modules, consumer docs, codemod, or release
  artifacts in this specification PR.
- Add a registry, discovery mechanism, separate Astryx plugin package family,
  unrestricted whole-document parser/renderer hook, raw-markup parser channel, or
  arbitrary AST mutation API.
- Replace generic CodeBlock highlighting or change built-in document, link, image,
  list, Table, heading, Outline, or focused syntax ownership.
- Duplicate Mermaid, annotation, or reference-link behavior owned by their colocated
  module records.
- Prescribe private dispatch/cache filenames or a universal repository schema.

## Current-state impact

| Need                            | Current support                                                                                                                    | Missing general contract                                                                                                     |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Replace known rendered elements | `components` replaces a fixed set of built-in elements.                                                                            | Independent capabilities cannot compose without one application-owned switch.                                                |
| Replace prose substrings        | `inlinePlugins` applies regex-based display replacements.                                                                          | No named contribution model, migration path, structured context, or phase identity.                                          |
| New inline/block syntax         | The exported AST is closed over built-in node kinds.                                                                               | No source-aware matcher, data-only extension node, renderer ownership, or streaming finalization.                            |
| Fenced content                  | Default CodeBlock already owns generic code syntax highlighting; `components.code` may replace every fence and branch on language. | No language-indexed composition for non-code semantic formats, completion/mode input, or Core-owned fallback/error contract. |
| Comments and highlights         | No source-range decoration capability exists.                                                                                      | No document revision, selection mapping, overlap, stale-anchor, or streaming-stability contract.                             |
| Reusable common behavior        | Consumers can write local code.                                                                                                    | No colocated static/factory/hook plugin authoring convention or lifecycle/performance contract.                              |
| Parsing and streaming           | Incremental parsing reuses immutable settled blocks.                                                                               | Plugin parse identity, live-state separation, indexing, invalidation, and finalization are undefined.                        |
| Outline interoperability        | Markdown and Outline share built-in slug utilities.                                                                                | Inline extension text has no required plain-text projection or shared parse configuration.                                   |

## Public concepts and TypeScript shape

### Shared data and extension nodes

```ts
export type MarkdownPluginData =
  | null
  | boolean
  | number
  | string
  | readonly MarkdownPluginData[]
  | {readonly [key: string]: MarkdownPluginData};

export interface MarkdownExtensionNode<
  PluginName extends string = string,
  NodeName extends string = string,
  Display extends 'inline' | 'block' = 'inline' | 'block',
  Data extends MarkdownPluginData = MarkdownPluginData,
> {
  readonly type: 'extension';
  readonly plugin: PluginName;
  readonly name: NodeName;
  readonly display: Display;
  readonly data: Data;
  readonly source: string;
  readonly range?: SourceRange;
}

export type InlineNode<Extension extends MarkdownExtensionNode = never> =
  | {type: 'text'; content: string}
  | {type: 'bold'; children: InlineNode<Extension>[]}
  | {type: 'italic'; children: InlineNode<Extension>[]}
  | {type: 'strikethrough'; children: InlineNode<Extension>[]}
  | {type: 'code'; content: string}
  | {type: 'link'; href: string; children: InlineNode<Extension>[]}
  | {type: 'image'; src: string; alt: string}
  | {type: 'citation'; sourceId: string}
  | {type: 'break'}
  | Extract<Extension, {display: 'inline'}>;

export type BlockNode<Extension extends MarkdownExtensionNode = never> =
  | {
      type: 'heading';
      level: 1 | 2 | 3 | 4 | 5 | 6;
      children: InlineNode<Extension>[];
    }
  | {type: 'paragraph'; children: InlineNode<Extension>[]}
  | {type: 'codeblock'; language: string; content: string}
  | {type: 'blockquote'; children: BlockNode<Extension>[]}
  | {
      type: 'list';
      ordered: boolean;
      start?: number;
      delimiter?: '.' | ')';
      loose?: boolean;
      items: ListItemNode<Extension>[];
    }
  | {
      type: 'table';
      headers: TableCellNode<Extension>[];
      alignments: TableAlignment[];
      rows: TableCellNode<Extension>[][];
    }
  | {type: 'hr'}
  | {type: 'image'; src: string; alt: string}
  | Extract<Extension, {display: 'block'}>;

export type ListItemNode<Extension extends MarkdownExtensionNode = never> = {
  checked?: boolean;
  children: BlockNode<Extension>[];
};

export type TableCellNode<Extension extends MarkdownExtensionNode = never> = {
  children: InlineNode<Extension>[];
};

export type ReferenceNode = MarkdownExtensionNode<
  'references',
  'reference',
  'inline',
  {readonly id: string}
>;

export type CalloutNode = MarkdownExtensionNode<
  'callouts',
  'callout',
  'block',
  {readonly label: string; readonly body: string}
>;

export type AppMarkdownNode = ReferenceNode | CalloutNode;
```

Core owns extension-node `source` and `range`. Every built-in AST arm above keeps the
released parser field names, optionality, and mutability exactly; the default generic
`never` is the released `InlineNode`/`BlockNode` surface. The `Extension` generic is
threaded through every recursive built-in container, so nested emphasis, link, list,
blockquote, and table traversal remains typed. Plugin callbacks return only finite,
acyclic `MarkdownPluginData`; they do not author source identity, built-in nodes,
React values, DOM nodes, functions, or raw markup in parser output.

### Capability-named plugin definition

```ts
export interface MarkdownPluginPostParseCapabilities<Name extends string> {
  readonly name: Name;
  readonly apiVersion: 1;
  readonly text?: readonly MarkdownTextContribution[];
  readonly fences?: readonly MarkdownFenceContribution[];
  readonly decorations?: MarkdownDecorationsCapability;
}

export type MarkdownPluginDefinition<
  Name extends string,
  Node extends MarkdownExtensionNode<Name> = never,
> =
  | (MarkdownPluginPostParseCapabilities<Name> & {
      readonly syntax: MarkdownSyntaxCapability<Node>;
      /** Required only for syntax that can change parser output. */
      readonly parseKey: string;
      /** Complete map: every emitted node kind has an owning renderer. */
      readonly renderers: MarkdownRendererMap<Node>;
    })
  | (MarkdownPluginPostParseCapabilities<Name> & {
      readonly syntax?: never;
      readonly parseKey?: never;
      readonly renderers?: never;
    });

export declare function createMarkdownPlugin<
  const Name extends string,
  const Node extends MarkdownExtensionNode<Name> = never,
>(definition: MarkdownPluginDefinition<Name, Node>): MarkdownPluginEntry<Node>;

export interface MarkdownProps {
  // existing props remain unchanged
  plugins?: readonly MarkdownPluginEntry[];
}
```

`MarkdownPluginEntry` is an opaque covariant value created by
`createMarkdownPlugin`; a plain structural object cannot masquerade as one.
Heterogeneous plugin lists preserve each plugin's extension-node union under strict
TypeScript. A syntax-bearing entry carries its required `parseKey`; an entry without
`syntax` cannot declare `parseKey`.

The capability names are deliberately shallow and searchable. The rejected
lifecycle-grouped alternative (`parse`, nested `render`, `decorate`) adds no
behavior or correctness and makes callers learn where a capability was nested.
There is no unrestricted `parse(source) => ast` or `render(ast) => output` plugin
hook.

### Text capability

```ts
export interface MarkdownTextContribution {
  readonly pattern: RegExp;
  readonly getEndIndex?: (
    text: string,
    match: RegExpMatchArray,
  ) => number | false;
  readonly render: (match: RegExpMatchArray, key: string) => React.ReactNode;
}
```

`text` is the general form of the released `inlinePlugins` subset. Public `text`
contributions run only on remaining built-in prose outside code, images, citations,
and existing link children; they do not receive or mutate arbitrary AST and do not
process extension nodes. Patterns must be global, advance on every match, and return
valid monotonic end positions. Core validates progress and bounds so a bad pattern
cannot hang or truncate rendering.

The internal synthetic adapter for released `inlinePlugins` is intentionally broader:
it preserves today's recursive traversal into existing link children as well as
emphasis, lists, and table cells, while still skipping inline/fenced code,
images, and citations. That compatibility-only context is not exposed to modern
`text` contributions and remains until a separate breaking compatibility decision.

### Syntax capability

```ts
export interface MarkdownTokenizerInput {
  readonly source: string;
  readonly offset: number; // UTF-16
  readonly end: number; // exclusive UTF-16
  readonly isFinal: boolean;
  readonly context: 'inline' | 'block';
  readonly lineStart: number;
  readonly column: number;
}

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
  ? Omit<T, Extract<keyof T, K>>
  : never;

export type MarkdownTokenizeResult<Node extends MarkdownExtensionNode> =
  | {readonly status: 'no-match'}
  | {readonly status: 'defer'}
  | {
      readonly status: 'match';
      readonly end: number;
      readonly node: DistributiveOmit<Node, 'source' | 'range'>;
    };

export interface MarkdownSyntaxContribution<
  Node extends MarkdownExtensionNode,
> {
  readonly startsWith: readonly [string, ...string[]];
  readonly maxPendingChars: number;
  readonly tokenize: (
    input: MarkdownTokenizerInput,
  ) => MarkdownTokenizeResult<Node>;
}

export type MarkdownSyntaxCapability<Node extends MarkdownExtensionNode> =
  | {
      readonly inline: readonly [
        MarkdownSyntaxContribution<Extract<Node, {display: 'inline'}>>,
        ...MarkdownSyntaxContribution<Extract<Node, {display: 'inline'}>>[],
      ];
      readonly block?: readonly MarkdownSyntaxContribution<
        Extract<Node, {display: 'block'}>
      >[];
      readonly toText: (node: Extract<Node, {display: 'inline'}>) => string;
    }
  | {
      readonly inline?: undefined;
      readonly block: readonly [
        MarkdownSyntaxContribution<Extract<Node, {display: 'block'}>>,
        ...MarkdownSyntaxContribution<Extract<Node, {display: 'block'}>>[],
      ];
      readonly toText?: never;
    };
```

A plugin with inline syntax must provide `toText`; block-only syntax does not.
`toText` supplies the same plain-text contribution to heading labels, slugging, and
Outline labels/targets. The concrete declaration uses distributive helpers so a
union of node kinds stays discriminated; helper aliases are declaration-private.

### Fence capability

```ts
export type MarkdownFenceMode = 'interactive' | 'passive' | 'inert';

export interface MarkdownFenceInput {
  readonly source: string;
  readonly language: string;
  readonly meta?: string;
  readonly range?: SourceRange;
  readonly isFinal: boolean;
  readonly mode: MarkdownFenceMode;
  readonly fallback: React.ReactElement;
}

export type MarkdownFenceResult =
  | {readonly status: 'enhance'; readonly content: React.ReactNode}
  | {readonly status: 'fallback'}
  | {readonly status: 'decline'};

export interface MarkdownFenceContribution {
  readonly languages: readonly [string, ...string[]];
  readonly enhance: (input: MarkdownFenceInput) => MarkdownFenceResult;
}
```

Fence enhancement is synchronous in v1. It may return a React lazy/Suspense subtree,
but async loading/rendering stays inside that subtree and Core's local fallback/error
boundary; the plugin protocol has no pending result or stale completion race.
`fallback` is Core's ordinary copyable CodeBlock for the exact source. `fallback`
explicitly selects it; `decline` lets a later language claimant run. A thrown
enhancer, rejected lazy subtree, invalid result, unsupported language, incomplete
source that the plugin refuses, or unsupported mode resolves to ordinary fallback
without losing source. Core does not execute or parse the fence body for the plugin.

### Renderer capability

```ts
export type MarkdownRendererMap<Node extends MarkdownExtensionNode> = Readonly<{
  [NodeName in Node['name']]: React.ComponentType<{
    node: Extract<Node, {name: NodeName}>;
  }>;
}>;
```

Every syntax node kind has one renderer owned by the same plugin. Plugins cannot
render another plugin's nodes or replace built-in document, heading, link, image,
list, or Table policy. Existing `components` remains the built-in override API.

### Decorations capability

```ts
export type MarkdownDecorationAppearance = 'highlight' | 'underline';
export type MarkdownDecorationTone =
  'neutral' | 'accent' | 'info' | 'positive' | 'warning' | 'critical';

export interface MarkdownDecorationVisual {
  readonly appearance: MarkdownDecorationAppearance;
  readonly tone: MarkdownDecorationTone;
  readonly accessibleLabel: string;
}

export interface MarkdownDecorationContribution {
  readonly id: string;
  readonly range: SourceRange;
  readonly visual: MarkdownDecorationVisual;
}

export interface MarkdownDecorationsCapability {
  readonly values: readonly MarkdownDecorationContribution[];
}
```

`decorations` is the live post-render capability. Core segments rendered built-in
text at the union of valid boundaries, preserves authored content in Core-owned
noninteractive wrappers, and paints each constrained `visual` through Astryx tokens.
Plugins receive no authored children, DOM node, React renderer slot, or AST mutation
hook. The capability does not participate in `parseKey`.

The concrete source-anchor, selection, overlap, staleness, highlight, and host-action
contract is owned by `module:Markdown/useMarkdownAnnotations`; compatible
third-party decoration plugins follow that module contract rather than duplicating
another generic annotation model.

## Requirements

### Admission, compatibility, and exports

- **FR1 — One public plugin model.** `plugins` and `createMarkdownPlugin` are the
  canonical general extension model. A plugin declares only the capability fields
  it uses. No second plugin prop, lifecycle-grouped API, registry, discovery
  mechanism, or unrestricted document hook is introduced.
- **FR2 — Exact zero-plugin compatibility.** When `plugins` is omitted or empty and
  `inlinePlugins` is absent, Markdown takes the current code path without plugin
  normalization, indexing, allocation, cache-key changes, renderer wrappers,
  remounts, AST/DOM/styling changes, or measurable performance regression.
- **FR3 — Released seams remain compatible.** Existing `components`, citations,
  opt-in GFM autolinking, sources, parser signatures, and any separately accepted
  focused syntax contract retain their meaning. Existing consumers do not migrate
  to adopt plugins.
- **FR4 — `inlinePlugins` migrates only after parity.** Until `text` has behavioral
  and type parity, migration docs, and a codemod, `inlinePlugins` is not deprecated.
  Core then adapts it internally as one final synthetic text contribution so current
  overlap/output behavior is preserved. The later soft deprecation adds guidance,
  not removal or a second runtime path; removal requires a separate breaking
  decision.
- **FR5 — Colocated Astryx modules follow Table.** Astryx-authored plugins live under
  `Markdown/plugins/*` and are re-exported through Markdown/Core. Public authors may
  export a static plugin, `createXPlugin(options)`, or `useXPlugin(state)` according
  to whether the capability is fixed, configured, or live. These names construct
  or return durable plugin entries; they are not registries.
- **FR6 — External publishing is ordinary package composition.** A third party may
  publish a compatible plugin with a peer dependency covering the supported Core
  semver range, explicit ESM/CJS conditional exports as needed, and tree-shakeable
  modules (`sideEffects: false` unless a documented side effect is required).
  Runtime `apiVersion` validates protocol compatibility. Astryx creates no separate
  plugin library/package family and performs no package discovery.

### Phase order and collisions

- **FR7 — One fixed phase order.** Core parses built-in syntax and `syntax`, renders
  built-in/extension nodes and `fences`/`renderers`, applies `text` to remaining
  built-in text nodes, then applies `decorations` to rendered source ranges.
  Decorations never change parsing; text never sees extension nodes.
- **FR8 — Built-in lexical shields win for modern contributions.** Escapes, inline
  code, fence bodies, existing links/images, citations, and any accepted focused
  opaque syntax remain protected from public `syntax` and `text` contributions.
  Inline syntax runs only on remaining literal source and may run inside built-in
  emphasis/strikethrough after those containers are recognized. Block syntax runs
  only at a top-level line boundary after built-in blocks decline and before
  paragraph fallback; it does not run inside list items or blockquotes. The internal
  legacy `inlinePlugins` adapter is the sole compatibility exception: FR20 preserves
  its current recursive traversal into existing link children.
- **FR9 — Ordered first claim resolves exclusive conflicts.** Duplicate plugin names
  fail validation. Syntax plugins and contributions are consulted in array and
  declaration order; the first `match` claims source, `no-match` continues, and
  `defer` reserves the offset until resolved. A proper prefix of an earlier matcher
  similarly reserves a non-final tail. Fence claimants use normalized
  case-insensitive languages; `decline` continues to the next claimant, while
  `enhance` or `fallback` resolves the fence. Text matches use the same ordered
  first-claim overlap rule, with the synthetic legacy contribution last.
- **FR10 — Decorations compose instead of claiming.** Every valid decoration
  contribution reaches the post-render phase in plugin order and its own representable
  contribution order; one contribution cannot suppress another. Concrete overlap,
  layering, hit-testing, and accessible traversal are owned by
  `module:Markdown/useMarkdownAnnotations`.

### Syntax validation and streaming

- **FR11 — Prefixes and matches advance.** Every `startsWith` entry is a non-empty
  literal string. Offsets and ranges use JavaScript UTF-16 units. Match end is
  greater than `offset` and no greater than `end`; plugin/name/display must match
  the owning definition. Invalid configuration or output fails validation rather
  than looping, truncating, or silently changing order.
- **FR12 — Tokenization is synchronous and deterministic.** A tokenizer depends only
  on its input and immutable parse configuration; it performs no I/O, time/random
  work, mutation, or async work. Core rejects promises but cannot sandbox trusted
  application code. Plugin callback complexity remains the plugin author's
  documented responsibility.
- **FR13 — Pending syntax is bounded and finalizable.** `maxPendingChars` is positive,
  finite, and at least the longest prefix length minus one. `defer` is accepted only
  on a non-final candidate ending at current input end and within that bound. Full
  parsing always uses `isFinal: true`. A terminal incremental call with
  `IncrementalParseOptions.isFinal: true` resolves every remaining prefix/defer as a
  match or literal, stores a final immutable snapshot, and produces the same AST as
  a full parse with the same options. Omitted `isFinal` remains false for released
  incremental-call compatibility.
- **FR14 — Core owns source provenance.** Core attaches exact consumed `source` and
  optional absolute `range`; callbacks do not author or shift them. Extension nodes
  are immutable data and cannot insert, delete, reorder, or mutate unrelated nodes.
  Each extension node is atomic for streaming fade boundaries and advances by its
  consumed source length.

### Fence completion and fallback

- **FR15 — Fence input states are explicit.** Every fence renderer receives literal
  source, normalized language, uninterpreted metadata, source range when enabled,
  `isFinal`, rendering `mode`, and Core's ordinary-code fallback. A plugin may
  enhance, explicitly show fallback, or decline. It cannot suppress source merely
  because input is incomplete or unsupported.
- **FR16 — Core owns error isolation and copyable fallback.** Unsupported languages,
  decline exhaustion, refusal, invalid results, throws/rejections, unavailable lazy
  dependencies, and incomplete final fences render ordinary copyable code. Error
  isolation is local to the fence; sibling Markdown continues rendering. Development
  diagnostics identify the plugin/fence once without exposing source contents.
- **FR17 — Mode bounds interactivity.** `interactive` permits the plugin's documented
  controls; `passive` renders perceivable output without requiring activation;
  `inert` supplies noninteractive output suitable for restricted/server contexts.
  A plugin that cannot satisfy the requested mode returns fallback or decline.
- **FR18 — Existing code override remains compatible.** When `components.code` is
  supplied, it keeps the existing application-owned all-fence override and wins
  before plugin fence resolution. Removing it exposes the ordered plugin chain and
  Core fallback; no consumer is silently migrated.

### Rendering, text, and Outline

- **FR19 — Extension rendering stays local and complete.** Every syntax-bearing
  plugin statically supplies a complete renderer map for every emitted node kind;
  missing or incomplete maps fail type checking/validation. Non-syntax plugins
  cannot provide a renderer-only branch. Renderers receive typed nodes only and
  cannot replace Core-owned document, heading/ID, link/image, list, or Table
  semantics.
- **FR20 — Text parity preserves legacy behavior.** Public `text` covers the released
  pattern, `(text, match) => number | false` end-index, and render callback shapes,
  but follows the modern protected-context default in FR8. The internal final
  synthetic `inlinePlugins` adapter preserves every released traversal context and
  overlap/output rule: it recurses through emphasis, existing link children, lists,
  and table cells, while skipping inline/fenced code, images, and citations. Regex
  progress/end bounds are validated without changing valid output. Exact fixtures,
  including a match inside authored link-child text, must remain byte/DOM-equivalent
  before soft deprecation.
- **FR21 — One text projection governs heading identity.** Inline syntax provides
  deterministic `toText`. Markdown and Outline use the same plugin list, parse
  options, projection, slugger, and collision allocator. Renderer output cannot
  change the ID. Block extension nodes do not create Outline entries in v1.
- **FR22 — Missing or failed capability preserves readable source.** Unknown or
  unmatched syntax remains literal and unknown/declined/failed fences use ordinary
  code. A tokenizer throw disables only that contribution for the current parse and
  continues ordered matching; if nothing claims the source it remains literal. A
  `toText` failure projects exact `node.source`. Core isolates each `text` callback
  and extension renderer: a throw renders the exact matched text or `node.source`
  locally and leaves sibling Markdown running. A plugin cannot make authored content
  disappear. Renderer-specific rich output has a perceivable text alternative when
  its visual representation is not equivalent to the source. Development identifies
  the failed plugin/capability once without logging source contents.

### Decorations phase

- **FR23 — Decorations are constrained live post-render contributions.**
  Decorations run after text output, never mutate the AST, and do not participate
  in `parseKey`. Core owns source segmentation, noninteractive wrappers, Astryx-token
  visual painting, contribution layering, and local failure isolation from the
  constrained descriptor above; plugins provide no React renderer or authored
  children. Core compiles phase/order separately so live values do not parse or
  remount unaffected syntax/fence output. Source anchoring, overlap/hit testing,
  selection, streaming, stale/edit mapping, and host-owned annotation actions belong
  to `module:Markdown/useMarkdownAnnotations`.

### Security and accessibility

- **FR24 — Markdown source is untrusted; installed plugins are trusted code.** Source
  may select only capabilities already imported by the application. It cannot name
  packages, discover a registry, load code, or grant parser callbacks capabilities.
  Renderers/hooks are ordinary trusted application code and are not sandboxed by
  Markdown.
- **FR25 — Core exposes no raw-markup parser channel.** Parser callbacks and accepted
  node/decoration data contain only finite, acyclic `MarkdownPluginData`. The API
  exposes no raw-HTML node, DOM-valued AST field, arbitrary AST visitor, or
  `dangerouslySetInnerHTML` helper. Trusted renderers remain responsible for their
  own safe React/SVG output.
- **FR26 — Navigation and embedded-resource owners remain authoritative.** URL-like
  plugin data is not trusted. Astryx-owned navigation uses
  `family:navigation-destinations`; embedded resources retain their separate stricter
  policy. Core does not claim to sanitize links/resources manufactured entirely by
  trusted renderer code.
- **FR27 — Plugin output has a documented semantic contract.** Each public plugin
  documents role/name/description, keyboard/focus behavior, reduced motion, forced
  colors, non-color meaning, and text fallback. Built-in document, heading, link,
  image, list, and Table semantics cannot be overridden. An interactive plugin owns
  its complete established ARIA pattern and does not create invalid nested
  interaction.

### Identity, cache, and performance

- **FR28 — Parse identity includes syntax contributors only.** Incremental parse
  identity is the ordered tuple `(name, apiVersion, parseKey)` for syntax-bearing
  plugins in plugin order, plus existing parse-affecting Markdown options. Text,
  fences, renderers, decorations, plugin object identity, permissions, selection,
  and other live state are excluded. Adding, removing, reordering, or updating a
  non-syntax plugin refreshes only its phase index/rendering and retains settled AST
  cache. A syntax plugin changes `parseKey` whenever its parser output can change;
  changing the filtered syntax order/key invalidates once. No separate `renderKey`
  is required: stable logical plugin/list identity plus phase-specific live indexes
  updates post-parse behavior.
- **FR29 — Stable live updates avoid reparse and remount.** A stable logical plugin
  may update renderer callbacks, lazy resources, annotation values, selection
  handlers, or permissions without reparsing or remounting unaffected output.
  Development warns when renders repeatedly recreate an equivalent plugin/list with
  the same logical keys where stable identity would avoid compilation/allocation;
  production behavior remains correct and warning-free.
- **FR30 — Core compiles a stable list once.** For a stable ordered plugin list, Core
  normalizes and indexes syntax by phase/prefix, fences by language, renderers by
  `(plugin,node kind)`, text by phase/order, and decorations by plugin/order. It does
  not loop through every plugin at every source character or rendered node.
  Recompilation is limited to list/protocol/parse-key changes; live renderer and
  decoration updates refresh only their indexes/state.
- **FR31 — Existing parser budgets remain the plugin-free floor.** Plugin-free full
  parse ceilings remain `<20 ms` for 10 generated sections, `<50 ms` for 50,
  `<100 ms` for 200, `<400 ms` for 500, and `<1,000 ms` for 2,000 under the existing
  benchmark. Existing streaming budgets and settled-tail reuse gates also remain.
- **FR32 — Core overhead has focused budgets.** Benchmarks cover exact plugin-free,
  five zero-work plugins, realistic text/syntax/fence plugins, streaming reuse,
  allocation counts, and remount counts. Zero-work dispatch adds at most 15% to
  200/500-section parse medians; realistic trivial callbacks add at most 25% while
  staying within absolute ceilings. These are Core indexing/dispatch budgets, not a
  promise about arbitrary plugin work.
- **FR33 — Optional work stays optional.** Heavy diagram and ANSI renderers are
  lazy/tree-shakeable and absent from Core's parser path and bundle unless imported.
  Parser-only/server use requires no DOM. Each shipped plugin documents and tests
  its own callback/resource budget.

## Parser signatures and finalization

`MarkdownParseOptions`, `MarkdownIncrementalParseOptions`, and
`MarkdownOutlineOptions` are exported named option shapes. `ParseOptions` remains a
compatible alias for ordinary parser callers and is available from both
`@astryxdesign/core/Markdown` and the server-safe
`@astryxdesign/core/Markdown/utils` entrypoint. Existing `ReadonlySet<string>` and
no-plugin overloads remain. Plugin overloads infer
`MarkdownExtensionsOf<Plugins>`.

```ts
export type MarkdownParseOptions<
  Plugins extends readonly MarkdownPluginEntry[] =
    readonly MarkdownPluginEntry[],
> = Omit<ParseOptions, 'plugins'> & {
  readonly plugins?: Plugins;
};

export type MarkdownIncrementalParseOptions<
  Plugins extends readonly MarkdownPluginEntry[] =
    readonly MarkdownPluginEntry[],
> = MarkdownParseOptions<Plugins> & {
  readonly isFinal?: boolean;
};

export type MarkdownOutlineOptions<
  Plugins extends readonly MarkdownPluginEntry[] =
    readonly MarkdownPluginEntry[],
> = MarkdownParseOptions<Plugins>;

export function parseMarkdown<
  const Plugins extends readonly MarkdownPluginEntry[],
>(
  source: string,
  options: MarkdownParseOptions<Plugins> & {readonly plugins: Plugins},
): BlockNode<MarkdownExtensionsOf<Plugins>>[];

export function parseInline<
  const Plugins extends readonly MarkdownPluginEntry[],
>(
  source: string,
  options: MarkdownParseOptions<Plugins> & {readonly plugins: Plugins},
): InlineNode<MarkdownExtensionsOf<Plugins>>[];

export function parseMarkdownIncremental<
  const Plugins extends readonly MarkdownPluginEntry[],
>(
  source: string,
  state: IncrementalState,
  options: MarkdownIncrementalParseOptions<Plugins> & {
    readonly plugins: Plugins;
  },
): BlockNode<MarkdownExtensionsOf<Plugins>>[];

export function parseOutlineFromMarkdown<
  const Plugins extends readonly MarkdownPluginEntry[],
>(
  source: string,
  options: MarkdownOutlineOptions<Plugins> & {readonly plugins: Plugins},
): MarkdownOutlineItem[];
```

The concrete declarations retain every released overload before these generic forms.
Private helper aliases do not become exports. All recursive built-in inline/block
containers carry the same `Extension` generic, so extension nodes remain typed inside
emphasis, links, headings, lists, blockquotes, and tables rather than only at the
top-level unions. `BuiltInLeafInlineNode` and `BuiltInLeafBlockNode` above stand for
the current non-recursive AST arms.

## Repository and export layout

Astryx-authored plugins follow the Table precedent and remain inside Core:

```text
packages/core/src/Markdown/
  pluginTypes.ts
  createMarkdownPlugin.ts
  resolveMarkdownPlugins.ts
  plugins/
    mermaid/
      index.ts
      createMarkdownMermaidPlugin.tsx
      createMarkdownMermaidPlugin.doc.mjs
      createMarkdownMermaidPlugin.spec.md
      tests colocated
    annotations/
      index.ts
      useMarkdownAnnotations.tsx
      useMarkdownAnnotations.doc.mjs
      useMarkdownAnnotations.spec.md
      tests colocated
    referenceLinks/
      index.ts
      createMarkdownReferenceLinksPlugin.tsx
      createMarkdownReferenceLinksPlugin.doc.mjs
      createMarkdownReferenceLinksPlugin.spec.md
      tests colocated
  index.ts
```

Exact private helper filenames may vary, but these observable layout rules do not:

- Every independently contractible first-party plugin lives at least one directory
  below the Markdown root, has a canonical module ID matching its public export, and
  is linked from `component:Markdown.modules`.
- Markdown/Core re-export the shared plugin types/factory and every accepted
  first-party plugin; private dispatch, indexing, cache, and normalization helpers
  need no module record or public export.
- Consumer signatures, reference tables, and usage belong in each eventual
  `.doc.mjs`; behavior and evidence belong in its module record.
- No plugin creates a separate Astryx package or global registry. Third-party
  packages are explicit compatible imports under FR6.
- Knowledge validation checks canonical filename/ID, parent backlink, and later
  consumer-doc projection without adding a universal schema or rewriting unrelated
  records.

## Candidate module records

The shared architecture links, but does not duplicate, the independently owned
initial modules:

- [`module:Markdown/createMarkdownMermaidPlugin`](../../../packages/core/src/Markdown/plugins/mermaid/createMarkdownMermaidPlugin.spec.md)
  owns the Astryx-themed finalized-fence renderer, fallback, lazy loading, and
  large-diagram interaction contract.
- [`module:Markdown/useMarkdownAnnotations`](../../../packages/core/src/Markdown/plugins/annotations/useMarkdownAnnotations.spec.md)
  owns source anchors, highlights, overlap, stable selection events, stale mapping,
  streaming, and host-owned action UI.
- [`module:Markdown/createMarkdownReferenceLinksPlugin`](../../../packages/core/src/Markdown/plugins/referenceLinks/createMarkdownReferenceLinksPlugin.spec.md)
  owns prefixed-number linkification and the canonical `inlinePlugins` migration
  example.

Callouts/directives and ANSI terminal output are the next common candidates after
these modules prove the model. Generic code syntax highlighting remains existing
CodeBlock behavior, not a plugin module. Product-specific references, charts, and
interactive diffs remain external compatible plugins unless a later admission review
promotes them.

## Migration and lifecycle

- Existing consumers make no change.
- Implement `text` parity and the synthetic-last adapter before adding a soft
  deprecation annotation to `inlinePlugins`.
- The same change that soft-deprecates it supplies consumer docs and a codemod from
  `inlinePlugins={items}` to an equivalent plugin entry. The adapter remains for
  compatibility; no removal timeline is implied.
- `apiVersion` changes only for incompatible protocol revisions. Package peer semver
  communicates which Core releases implement that protocol. Mixed unsupported
  runtime versions fail validation before parsing/rendering.
- Astryx-authored plugin modules, their docs, and their release notes land in
  separate atomic implementation PRs after this spec and each module contract are
  current.
- The implementation owns public exports, generated API evidence, tests, docs, and
  a package Changeset. This specification-only PR carries none.

## Verification

| Contract             | Required evidence                                                                                                             | Representative states                                                                                                                                                                                                                                              | Failure signal                                                                                                                                                                                                                                         |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| FR1–FR6              | Public type/export and compatibility fixtures                                                                                 | direct exported inline-only, block-only, and mixed node aliases; exact released built-in fields/mutability; nested emphasis/link/list/blockquote/table traversal; complete/incomplete renderer maps; static/factory/hook; Core-colocated/third-party; zero plugins | A released AST field/mutability changes, nested extension typing becomes `never`, syntax lacks a complete renderer map, a plain object masquerades as a plugin, or an external plugin cannot tree-shake/import explicitly.                             |
| FR7–FR10             | Phase/collision and modern-versus-legacy context matrix                                                                       | built-ins; authored link children; two syntax claims; decline chain; overlapping modern text; synthetic legacy-last adapter; overlapping decorations                                                                                                               | Phase order changes, modern text enters protected links, legacy link-child output changes, conflict depends on chunking, or one decoration erases another.                                                                                             |
| FR11–FR14            | Parser validation, full/incremental parity, immutable snapshot and source-range tests                                         | UTF-16; zero/backward/overrun; prefix split at every character; omitted/false/true `isFinal`; reorder/parse-key change                                                                                                                                             | A callback loops/truncates, final incremental differs from full parse, settled nodes mutate, or ranges cease matching exact source.                                                                                                                    |
| FR15–FR18            | Generic fence completion/mode/fallback/error matrix                                                                           | unsupported; incomplete; final; enhance; decline; fallback; throw; lazy subtree reject; all modes; `components.code`                                                                                                                                               | Authored source disappears, an error replaces sibling Markdown, async protocol state leaks into fence resolution, an unsupported mode remains interactive, or the released override loses precedence.                                                  |
| FR19–FR23            | Renderer/text/Outline/decoration local-fallback and legacy parity tests                                                       | every node kind; legacy linked-child text; emphasis/list/table traversal; code/image/citation skips; tokenizer/toText/text/renderer/decoration throw; non-ASCII/duplicates                                                                                         | A failure removes source/siblings/layers, modern text enters protected links, legacy linked-child/overlap output changes, heading/Outline diverges, or unmatched content vanishes.                                                                     |
| FR23                 | Decorations phase/order/no-reparse integration tests                                                                          | no decorations; two decoration contributions; stable/live entry; syntax/fence siblings                                                                                                                                                                             | Decoration changes parse/remount unaffected output, mutates AST, runs before text, or suppresses another valid contribution.                                                                                                                           |
| FR24–FR27            | Security, axe, keyboard, forced-colors, reduced-motion, and server-render evidence                                            | script-like source; cyclic/non-data values; URL obfuscation; interactive/passive/inert; light/dark/RTL                                                                                                                                                             | Source loads code, raw markup enters parser output, an Astryx-owned unsafe sink activates, or essential meaning becomes color/pointer-only.                                                                                                            |
| FR28–FR33            | Filtered parse-signature/cache instrumentation, phase-index, allocation/remount, performance, bundle, and server-import tests | exact zero; five no-op; add/remove/reorder text/fence/renderer/decoration plugins; live callback/decoration updates; syntax add/remove/reorder/`parseKey` change; streaming; equivalent recreation                                                                 | A non-syntax change reparses or drops settled AST, a syntax-signature change fails to invalidate exactly once, zero path allocates/indexes, Core scans all plugins per char/node, overhead exceeds budget, or optional code enters Core/server parser. |
| Repository integrity | `pnpm check:knowledge`, type checks, public-content scan, formatting, and changed-file audit                                  | AST-036 plus required canonical backlinks only                                                                                                                                                                                                                     | Invalid record shape, private context, unrelated component behavior, implementation, or Changeset enters this proposal.                                                                                                                                |

## Related owner prerequisites

Before implementation acceptance:

1. Markdown and Outline use one parse configuration and collision allocator for
   unique matching IDs, including citation-bearing headings and cross-base slug
   collisions.
2. Incremental parsing invalidates every current parse-affecting option before the
   ordered plugin parse key extends that mechanism.
3. Parser and renderer navigation/resource checks conform to their current family
   owners before plugins rely on shared outcomes.
4. `text` parity is proven against every released `inlinePlugins` fixture before
   soft deprecation or codemod publication.

Other current parser cleanup remains report-only unless its canonical owner makes it
an explicit dependency.

## Decision log

### DEC-1 — Keep one capability-named plugin model

**Reference:** `spec:AST-036/DEC-1`
**Direction owner:** `cixzhang`, `2026-09-13`; exact-head approval pending

The public model keeps `plugins` and `createMarkdownPlugin` with optional `text`,
`syntax`, `fences`, `renderers`, and `decorations`. This shape is shallower and more
searchable than lifecycle-grouped nesting and follows Table's composable plugin
precedent.

Rejected: replacing released seams immediately, adding parallel extension props,
using generic whole-document parse/render hooks, or organizing public concepts by
internal lifecycle rather than caller capability.

### DEC-2 — Colocate Astryx plugins; allow ordinary external packages

**Reference:** `spec:AST-036/DEC-2`
**Direction owner:** `cixzhang`, `2026-09-13`; exact-head approval pending

Astryx-authored plugins live under Markdown and export static, factory, or hook
forms through Markdown/Core. Third parties may publish explicit compatible imports
with peer semver and runtime `apiVersion`. No registry or separate Astryx plugin
package family exists.

Rejected: package discovery, central registration, a global plugin marketplace
contract, or separate first-party packages for the initial common plugins.

### DEC-3 — Separate parse identity from live renderer and annotation state

**Reference:** `spec:AST-036/DEC-3`
**Direction owner:** `cixzhang`, `2026-09-13`; exact-head approval pending

The filtered ordered syntax signature `(name, apiVersion, parseKey)` owns parsing.
Text, fences, renderers, decorations, callbacks, lazy resources, permissions,
selection, and other live state update only their owning phases and carry no
`parseKey`. Core compiles stable capabilities into phase-specific indexes and
preserves an exact zero-plugin fast path; no separate `renderKey` exists.

Rejected: object identity as parse identity, reparsing on comment/renderer changes,
or scanning every plugin at every character or node.

## Open questions

None. This proposed contract still requires exact-head owner approval and promotion
to `authority: current` before it governs implementation.
