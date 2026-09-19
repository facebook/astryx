---
schema_version: 1
template_version: 1
kind: system-spec
id: spec:AST-036
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-09-14
phase: accepted
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

| Area                        | Contract                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Public contract             | Proposes one additive `plugins` prop and `createMarkdownPlugin()`. Entries may contribute `text`, `syntax`, `fences`, `renderers`, or `decorations`. Every syntax entry also carries stable parse identity and a complete owning renderer set. Exact declarations belong to Markdown and its module API surfaces.                                                                                                                                                                                                                                                                                                                    |
| Behavior                    | Built-in syntax and protected contexts win. Plugins resolve in array and declaration order. Syntax and text use first claim; fence fallback or enhancement resolves a fence while decline continues; decorations compose in deterministic layers without changing the AST.                                                                                                                                                                                                                                                                                                                                                           |
| End-user impact             | Readers may receive additional prose presentation, source syntax, semantic fence output, and source-range decoration. Ordinary Markdown, copyable failure fallbacks, heading and Outline identity, accessibility, generic CodeBlock highlighting, and built-in document, navigation, image, list, and table policy remain owned by their canonical surfaces.                                                                                                                                                                                                                                                                         |
| Builder impact              | Existing builders do nothing. Opt-in builders pass a stable plugin list. Astryx-authored modules may expose static, factory, or hook forms through Markdown and Core; third-party plugins remain explicit ordinary package imports.                                                                                                                                                                                                                                                                                                                                                                                                  |
| Compatibility and readiness | This contract is current; implementation is pending. The zero-plugin path and released APIs stay unchanged. `inlinePlugins` is not soft-deprecated until modern text contributions have behavioral and type parity, an internal final adapter, migration docs, and a codemod. Runtime, browser, type, cache, allocation, bundle, performance, and remount evidence remains pending.                                                                                                                                                                                                                                                  |
| Review checks               | Reject a registry or separate Astryx plugin package family; lifecycle-grouped public capabilities; unrestricted whole-document parse or render hooks; raw markup or arbitrary AST mutation; plugin-state-driven reparsing; work proportional to every plugin at every source character or rendered node; replacement of existing generic CodeBlock highlighting; unsafe or non-copyable fence failure; parsing-affecting decorations; or plugin override of Core-owned document, heading, navigation, image, list, or table policy.                                                                                                  |
| Governing rules             | [`architecture:public-component-api`](../../architecture/public-component-api.md); [`family:navigation-destinations`](../../families/navigation-destinations.md); [AST-002 FR4 — Existing composition and styling seams come first](../AST-002/spec.md); [AST-002 FR15 — Invalid states are prevented where practical](../AST-002/spec.md); [AST-002 FR17 — Public module and utility function names disclose one atomic role](../AST-002/spec.md); [AST-002 FR18 — Public primitives support composition intentionally](../AST-002/spec.md); [AST-002 FR20 — Callsite impact and decision burden are explicit](../AST-002/spec.md). |

This section is a review projection; the body below is authoritative.

## Intent

Application authors should be able to add reusable Markdown behavior without rewriting source text, forking the parser, or replacing the whole renderer. One model must cover prose replacement, inline or block extension syntax, language-scoped semantic fences, typed extension rendering, and source-range decoration while preserving an understandable processing order.

The system decision owns shared plugin admission, capability boundaries, composition, collision rules, compatibility, failure behavior, parse identity, and observable resource constraints. It does not own exact TypeScript declarations, consumer syntax, private dispatch or cache design, or the independent behavior of first-party plugin modules.

This specification changes no runtime by itself. The requirements below define the complete proposed behavior.

## Ownership boundary

AST-036 owns the shared plugin protocol and its cross-surface guarantees. The Markdown component contract owns aggregate public component and parser behavior. Outline owns its public outline behavior while using the shared projection required here. Any independently contractible first-party plugin will own its API, behavior, accessibility, fallback, and evidence in a module record created with that plugin. Consumer documentation owns signatures, prop and option references, examples, and migration recipes. Architecture owns private dispatch, indexing, cache, invalidation, allocation, and repository mechanisms.

## Non-goals

- Implement the runtime, first-party modules, consumer docs, codemod, or release artifacts in this specification change.
- Add a registry, discovery mechanism, separate Astryx plugin package family, unrestricted whole-document parser or renderer hook, raw-markup parser channel, or arbitrary AST mutation API.
- Replace generic CodeBlock highlighting or change built-in document, heading, navigation, image, list, table, Outline, or focused-syntax ownership.
- Define any concrete first-party plugin; its module record is added only when that plugin is proposed.
- Prescribe private dispatch, cache, index, invalidation, file, manifest, or repository mechanisms.

## Current-state impact

| Current seam              | Preserved behavior                                                            | Missing shared contract                                                                                   |
| ------------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `components`              | Replaces supported built-in renderers, including the all-fence code renderer. | Cannot add typed syntax or compose independent language-scoped fence behavior.                            |
| `inlinePlugins`           | Replaces matched text in rendered prose.                                      | Has no named general-plugin identity, typed source node, block syntax, or source provenance.              |
| Parser and streaming APIs | Produce the released closed AST and reuse settled incremental output.         | Have no typed extension union, bounded plugin deferral, finalization rule, or syntax-only cache identity. |
| Markdown and Outline      | Share built-in heading text and slug behavior.                                | Have no plain-text projection for inline extension nodes.                                                 |

The proposal adds the missing shared protocol without replacing these seams.

## Semantic model

A plugin entry is an opaque capability-named value created by the public plugin factory. The closed capability names are `text`, `syntax`, `fences`, `renderers`, and `decorations`. A plain structural object cannot masquerade as a plugin entry. Heterogeneous lists preserve the union of their extension-node kinds under strict TypeScript.

An extension node identifies its owning plugin, node kind, inline or block display, finite data, exact consumed source, and optional source range. Core authors source provenance. Plugin data is limited recursively to null, booleans, numbers, strings, arrays, and string-keyed objects. It is finite and acyclic and contains no React values, DOM nodes, functions, or raw markup.

A syntax-bearing entry declares stable parse identity through its ordered `name`, `apiVersion`, and `parseKey`, plus a complete renderer set for every extension-node kind it may emit. An entry without syntax cannot declare `parseKey` or renderers. Extension typing propagates through emphasis, links, headings, lists, blockquotes, tables, and every other recursive built-in container. The default no-extension type remains the released parser surface.

A text contribution supplies a global regular-expression pattern, may compute a later match end, and renders only the claimed text. Every match must advance. A computed end must be monotonic and within the available text. Public text contributions run only on eligible remaining built-in prose outside code, images, citations, and existing link children, and never process extension nodes. The internal legacy adapter alone retains the broader traversal required by FR20.

A syntax contribution declares one or more non-empty literal prefixes, a finite pending bound, and a synchronous tokenizer. The tokenizer receives the source, UTF-16 offset and exclusive end, finality, inline or block context, line start, and column. It may report no match, bounded defer, or a match that advances and supplies plugin data without source provenance. Inline syntax supplies one deterministic plain-text projection. Block-only syntax does not.

A fence contribution declares one or more languages and synchronously enhances, explicitly falls back, or declines. Rendering mode is exactly interactive, passive, or inert. Core supplies the exact source, normalized language, uninterpreted metadata, optional source range, finality, mode, and ordinary copyable fallback. Asynchronous loading may exist only inside returned render output under FR16.

A decoration contribution has a stable identifier, source range, constrained visual description, and accessible label. Appearance is exactly highlight or underline. Tone is exactly neutral, accent, info, positive, warning, or critical. Decorations supply no authored children, renderer, DOM access, or parsing behavior.

Full and incremental parsing use the same plugin configuration. Incremental callers explicitly finalize input, and finalized incremental output equals full-parse output for the same source and options.

## Requirements

### Admission, compatibility, and publication

- **FR1 — One public plugin model.** `plugins` and `createMarkdownPlugin` are the canonical general extension model. A plugin declares only the capabilities it uses. No second plugin prop, lifecycle-grouped API, registry, discovery mechanism, or unrestricted document hook is introduced. Entries are opaque rather than accepted as arbitrary structural objects. A syntax-bearing entry must provide stable parse identity and a complete renderer set; an entry without syntax cannot declare either. Extension typing must remain discriminated through every recursive built-in container.
- **FR2 — Exact zero-plugin compatibility.** When `plugins` is omitted or empty and `inlinePlugins` is absent, Markdown takes the current code path without plugin normalization, indexing, allocation, cache-key changes, renderer wrappers, remounts, AST changes, DOM changes, styling changes, or measurable performance regression. Released no-plugin node unions and overloads retain their exact meaning.
- **FR3 — Released seams remain compatible.** Existing `components`, citations, opt-in GFM autolinking, sources, parser signatures, and any separately accepted focused-syntax contract retain their meaning. Existing consumers do not migrate to adopt plugins. Exact released field names, optionality, mutability, and no-plugin result types remain unchanged.
- **FR4 — `inlinePlugins` migrates only after parity.** Until modern text contributions have behavioral and type parity, migration docs, and a codemod, `inlinePlugins` is not deprecated. Core then adapts it internally as one final synthetic text contribution so current traversal, overlap, callback results, and error behavior are preserved—including `null` render output and thrown callbacks. The later soft deprecation adds guidance, not removal or a second runtime path. Removal or safer callback semantics require a separate breaking decision.
- **FR5 — Astryx-authored modules follow the Table precedent.** Each independently contractible first-party plugin is colocated under Markdown, has a canonical module record matching its public export, and is re-exported through Markdown and Core. Public authors may export a static plugin, a named factory, or a named hook according to whether the capability is fixed, configured, or live. Those exports construct or return durable plugin entries; they are not registries. Private dispatch, indexing, cache, and normalization helpers require neither module records nor public exports.
- **FR6 — External publishing is ordinary package composition.** A third party may publish a compatible plugin with a peer dependency covering the supported Core semver range, explicit module-system exports as needed, and tree-shakeable modules unless a documented side effect is required. Runtime protocol version validates compatibility. Astryx creates no separate plugin library or package family and performs no package discovery.

### Phase order and collisions

- **FR7 — One fixed phase order.** Core recognizes built-in syntax and extension syntax; renders built-in and extension nodes and resolves semantic fences; applies text contributions only to remaining eligible built-in prose; then applies decorations to rendered source ranges. Decorations never change parsing. Text contributions never process extension nodes.
- **FR8 — Built-in lexical shields win for modern contributions.** Escapes, inline code, fence bodies, existing links and images, citations, and any accepted focused opaque syntax remain protected from public syntax and text contributions. Inline extension syntax runs only on remaining literal source and may run inside built-in emphasis or strikethrough after those containers are recognized. Block extension syntax runs only at a top-level line boundary after built-in blocks decline and before paragraph fallback; it does not run inside list items or blockquotes. The internal legacy `inlinePlugins` adapter is the sole compatibility exception: FR20 preserves its current recursive traversal into existing link children.
- **FR9 — Ordered first claim resolves exclusive conflicts.** Duplicate plugin names fail validation. Syntax plugins and their contributions are consulted in plugin-array and declaration order. The first match claims source; no-match continues; defer reserves the current offset until resolved. A proper prefix of an earlier matcher similarly reserves a non-final tail. Fence claimants use normalized case-insensitive language names: decline continues, while enhancement or explicit fallback resolves the fence. Text matches use the same ordered first-claim overlap rule, with the synthetic legacy contribution last.
- **FR10 — Decorations compose instead of claiming.** Every valid decoration contribution reaches the post-render phase in plugin order and its own representable contribution order. One contribution cannot suppress another. This shared protocol does not define capability-specific source anchoring, overlap presentation, selection, stale mapping, or host actions; those behaviors remain outside scope until a concrete module is proposed.

### Syntax validation and streaming

- **FR11 — Prefixes and matches advance.** Every declared prefix is a non-empty literal string. Offsets and ranges use JavaScript UTF-16 units. A match end is greater than the current offset and no greater than the available end. Emitted plugin, node name, and display kind must match the owning definition. Invalid configuration or output fails validation rather than looping, truncating content, or silently changing resolution order.
- **FR12 — Tokenization is synchronous and deterministic.** A tokenizer depends only on its supplied source window, position, finality, context, and immutable parse configuration. It performs no I/O, time-dependent work, random work, mutation, or asynchronous work. Core rejects promises but cannot sandbox trusted application code. Callback complexity remains the plugin author's documented responsibility.
- **FR13 — Pending syntax has one bounded decision span.** Every syntax contribution declares a positive finite UTF-16 span at least as large as its longest prefix. Core exposes at most that span from a candidate in both full and incremental parsing. The tokenizer must return match or no-match within it; defer is accepted only while non-final input has not yet filled the span. A match end remains inside the supplied span. A terminal incremental call resolves every remaining candidate under the same bound as full parsing, stores a final immutable snapshot, and produces the same AST for the same source and options. Omitting finality remains equivalent to false for released incremental-call compatibility.
- **FR14 — Core owns source provenance.** Core attaches the exact consumed source and optional absolute range. Plugin callbacks do not author or shift provenance. Extension nodes are immutable finite acyclic data. They cannot contain React values, DOM nodes, functions, or raw markup, and cannot insert, delete, reorder, or mutate unrelated nodes. Each extension node is atomic for streaming fade boundaries and advances by its consumed source length.

### Fence completion and fallback

- **FR15 — Fence input states are explicit.** Every semantic fence renderer receives the literal source, normalized language, uninterpreted metadata, source range when enabled, finality, rendering mode, and Core's ordinary-code fallback for that exact source. A plugin may enhance, explicitly select fallback, or decline so a later claimant can run. It cannot suppress source because input is incomplete or unsupported.
- **FR16 — Core owns error isolation and copyable fallback.** Unsupported languages, exhausted declines, refusal, invalid results, thrown errors, rejected lazy subtrees, unavailable lazy dependencies, incomplete final fences, and unsupported modes render ordinary copyable code. Error isolation is local to the fence, and sibling Markdown continues rendering. Development diagnostics identify the plugin and fence once without exposing source contents. The protocol remains synchronous; asynchronous loading or rendering may occur only inside a returned lazy or Suspense subtree and Core's local fallback and error boundary, so no pending protocol state or stale-completion race exists.
- **FR17 — Mode bounds interactivity.** Interactive mode permits the plugin's documented controls. Passive mode renders perceivable output without requiring activation. Inert mode supplies noninteractive output suitable for restricted or server contexts. A plugin that cannot satisfy the requested mode returns fallback or decline.
- **FR18 — Existing code override remains compatible.** When the released custom code renderer is supplied, it keeps the application-owned all-fence override and wins before plugin fence resolution. Removing that override exposes the ordered plugin chain and Core fallback. No consumer is silently migrated. Generic CodeBlock syntax highlighting remains existing CodeBlock behavior, not a plugin responsibility.

### Rendering, text, and Outline

- **FR19 — Extension rendering stays local and complete.** Every syntax-bearing plugin statically supplies a complete renderer set for every node kind it can emit. Missing or incomplete ownership fails type checking or validation. Non-syntax plugins cannot provide a renderer-only branch. Renderers receive typed extension-node data only and cannot replace Core-owned document, heading or heading-ID, navigation, image, list, or table semantics.
- **FR20 — Text parity preserves legacy behavior.** Public text contributions cover the released regular-expression pattern, end-index, and render-callback capabilities but follow FR8's modern protected-context and failure defaults. The internal final synthetic `inlinePlugins` adapter preserves every released traversal context, overlap rule, callback result, and error behavior: it recurses through emphasis, existing link children, lists, and table cells; skips inline code, fenced code, images, and citations; preserves a valid `null` result; and does not add local recovery for a thrown legacy callback. Core validates progress and bounds without changing valid output. Exact fixtures, including linked-child text, `null`, and thrown callbacks, must remain equivalent before soft deprecation.
- **FR21 — One text projection governs plugin-enabled heading identity.** When inline extension nodes can contribute to headings, Markdown and Outline use the same plugin list, parse options, text projection, slugger, and collision allocator, producing unique matching IDs for that plugin-enabled document. Renderer output cannot change the generated ID. Block extension nodes do not create Outline entries in the first protocol version. The zero-plugin path retains its released heading-ID behavior under FR2.
- **FR22 — Missing or failed modern capability preserves readable source.** Unknown or unmatched syntax remains literal. Unknown, declined, refused, invalid, or failed fences render ordinary code. A tokenizer throw disables only that contribution for the current parse and continues ordered matching; if nothing claims the source, it remains literal. A plain-text projection failure uses the exact node source. Core isolates each modern text callback and extension renderer: a throw renders the exact matched text or node source locally and leaves sibling Markdown running. Modern plugins cannot make authored content disappear. Renderer-specific rich output has a perceivable text alternative when its visual representation is not equivalent to the source. Development diagnostics identify the failed plugin and capability once without logging source contents. The legacy adapter follows FR4 and FR20 instead.

### Decorations

- **FR23 — Decorations are constrained live post-render contributions.** Decorations run after text output, never mutate the AST, and do not participate in parse identity. Core owns source segmentation, noninteractive wrappers, Astryx-token visual painting, contribution ordering, and local failure isolation for the constrained decoration descriptors. Plugins receive no authored children, DOM node, React renderer slot, or AST mutation hook. A decoration change must not reparse content or remount unaffected syntax or fence output. Capability-specific anchoring, overlap presentation, selection, streaming, stale mapping, and host actions remain outside scope until a concrete module is proposed.

### Security and accessibility

- **FR24 — Markdown source is untrusted; installed plugins are trusted code.** Source may select only capabilities already imported by the application. It cannot name packages, discover a registry, load code, or grant parser callbacks additional capabilities. Renderers and hooks are ordinary trusted application code and are not sandboxed by Markdown.
- **FR25 — Core exposes no raw-markup parser channel.** Parser callbacks and accepted extension-node or decoration data contain only finite acyclic data. The protocol exposes no raw-HTML node, DOM-valued AST field, arbitrary AST visitor, or `dangerouslySetInnerHTML` helper. Trusted renderers remain responsible for their own safe React or SVG output.
- **FR26 — Navigation and embedded-resource owners remain authoritative.** URL-like plugin data is not trusted. Astryx-owned navigation follows [`family:navigation-destinations`](../../families/navigation-destinations.md). Embedded resources retain their separate stricter policy. Core does not claim to sanitize links or resources manufactured entirely by trusted renderer code.
- **FR27 — Plugin output has a documented semantic contract.** Each public plugin documents role, accessible name and description, keyboard and focus behavior, reduced-motion behavior, forced-colors behavior, non-color meaning, and text fallback. Built-in document, heading, navigation, image, list, and table semantics cannot be overridden. An interactive plugin owns its complete established ARIA pattern and must not create invalid nested interaction.

### Identity, updates, and resources

- **FR28 — Parse identity includes syntax contributors only.** Incremental parse identity is the ordered tuple of plugin name, protocol version, and `parseKey` for syntax-bearing plugins in plugin order, plus existing parse-affecting Markdown options. Text, fences, renderers, decorations, plugin object identity, permissions, selection, and other live state are excluded. Adding, removing, reordering, or updating a non-syntax plugin refreshes only its post-parse behavior and retains settled AST cache. A syntax plugin changes its `parseKey` whenever its parser output can change. Changing the filtered syntax order or key invalidates once. No separate render key is required.
- **FR29 — Stable live updates avoid reparse and remount.** A stable logical plugin may update non-parse callbacks, lazy resources, or other live post-parse state without reparsing or remounting unaffected output. Development warns when renders repeatedly recreate an equivalent plugin or list with the same logical keys where stable identity would avoid preparation or allocation. Production behavior remains correct and warning-free.
- **FR30 — Stable plugin preparation is reused.** For a stable ordered plugin list, Core must prepare plugin dispatch once and reuse it across parsing and rendering. It must not repeat list-wide preparation unless the ordered list, protocol version, or syntax parse identity changes, and it must not inspect every plugin at every source character or rendered node. Live non-syntax updates refresh only their affected post-parse behavior and preserve the no-reparse and no-remount guarantees in FR28–FR29.
- **FR31 — Existing parser budgets remain the plugin-free floor.** Plugin-free full parsing remains below 20 milliseconds for 10 generated sections, 50 milliseconds for 50, 100 milliseconds for 200, 400 milliseconds for 500, and 1,000 milliseconds for 2,000 under the existing benchmark. Existing streaming budgets and settled-tail reuse gates also remain in force.
- **FR32 — Core overhead has focused budgets.** Evidence covers the exact plugin-free path, five zero-work plugins, realistic text, syntax, and fence plugins, streaming reuse, allocation counts, and remount counts. Zero-work dispatch adds at most 15 percent to 200- and 500-section parse medians. Realistic trivial callbacks add at most 25 percent while remaining within the absolute FR31 ceilings. These are Core preparation and dispatch budgets, not promises about arbitrary plugin work.
- **FR33 — Optional work stays optional.** Heavy optional renderers are lazy and tree-shakeable and remain absent from Core's parser path and bundle unless explicitly imported. Parser-only and server use requires no DOM. Each shipped plugin documents and tests its own callback and resource budget.

## Public parser integration

Markdown's block, inline, incremental, and Outline parsing entrypoints must accept the same plugin configuration and infer the same extension-node union. Every released no-plugin name, overload, return type, field, and mutability guarantee remains unchanged. Full and incremental parsing use the same plugin configuration; only incremental parsing exposes finality. Exact type names, overload declarations, and private mapping helpers belong to their owning API declarations and records.

## Compatibility, migration, and lifecycle

Existing consumers make no change.

Modern text parity and the synthetic-last compatibility adapter must exist before adding a soft-deprecation annotation to `inlinePlugins`. The same release that soft-deprecates it supplies consumer migration documentation and a codemod to an equivalent plugin entry. The adapter remains for compatibility, and no removal timeline is implied.

Protocol version changes only for incompatible protocol revisions. Package peer-semver ranges communicate which Core releases implement a protocol version. Mixed unsupported runtime versions fail validation before parsing or rendering.

Astryx-authored plugin modules, their consumer docs, and their release notes land as separate atomic implementation changes only after AST-036 and the corresponding module contract are current. Each implementation owns public exports, generated API evidence, tests, docs, and a package Changeset. This specification-only change carries none.

## Future plugin ownership

No first-party plugin is proposed by this record. When a first-party plugin is designed, its public export and module record are added together; this shared protocol is linked rather than copied. Generic code syntax highlighting remains existing CodeBlock behavior.

## Verification

- **FR1–FR6:** Public type, export, and compatibility evidence must cover direct exported inline-only, block-only, and mixed extension aliases; exact released built-in fields and mutability; nested emphasis, link, list, blockquote, and table typing; complete and incomplete renderer ownership; static, factory, and hook modules; first-party colocation and explicit third-party imports; and the zero-plugin path. Failure includes changing a released AST field or mutability, losing nested extension typing, accepting syntax without complete renderers, accepting a plain object as an entry, or preventing explicit tree-shakeable third-party import.
- **FR7–FR10:** Phase and collision evidence must cover built-ins; authored link children; competing syntax claims; fence decline chains; overlapping modern text; the synthetic legacy-last adapter; and overlapping decorations. Failure includes changing phase order, allowing modern text into protected links, changing legacy link-child output, making conflict resolution depend on chunking, or allowing one decoration to erase another.
- **FR11–FR14:** Parser validation and full-versus-incremental evidence must cover UTF-16 offsets; zero, backward, and overrun results; every-character prefix splits; omitted, false, and true finality; syntax reorder and `parseKey` changes; immutable snapshots; and exact source ranges. Failure includes callback loops or truncation, finalized incremental output differing from full parsing, mutation of settled nodes, or ranges no longer matching exact source.
- **FR15–FR18:** Fence evidence must cover unsupported, incomplete, and final input; enhancement, decline, explicit fallback, throws, lazy-subtree rejection, every mode, and the released all-fence custom-code override. Failure includes lost authored source, a fence error replacing sibling Markdown, asynchronous protocol state leaking into fence resolution, an unsupported mode remaining interactive, or the released override losing precedence.
- **FR19–FR23:** Rendering, text, Outline, and decoration evidence must cover every extension-node kind; legacy linked-child text, `null` output, and thrown callbacks; emphasis, list, and table traversal; code, image, and citation shields; modern callback failures; non-ASCII source; plugin-enabled duplicate headings; released no-plugin heading IDs; no decorations; two decoration contributions; stable live updates; and unaffected syntax and fence siblings. Failure includes removal of source, siblings, or valid layers; modern text entering protected links; changed legacy behavior; plugin-enabled heading and Outline identity diverging; no-plugin IDs changing; unmatched content disappearing; decoration changes reparsing or remounting unaffected output; AST mutation; decoration before text; or one valid decoration suppressing another.
- **FR24–FR27:** Security and accessibility evidence must cover script-like source; cyclic or non-data values; obfuscated URL-like data; interactive, passive, and inert output; keyboard operation; forced colors; reduced motion; light and dark themes; RTL; axe checks; and server rendering. Failure includes source loading code, raw markup entering parser output, an Astryx-owned unsafe sink activating, or essential meaning becoming color-only or pointer-only.
- **FR28–FR33:** Identity, cache, allocation, remount, performance, bundle, and server-import evidence must cover the exact zero-plugin path; five no-op plugins; adding, removing, reordering, and updating text, fence, renderer, and decoration entries; live callback and decoration updates; syntax add, remove, reorder, and `parseKey` changes; streaming; stable-list preparation reuse; and equivalent recreation. Failure includes a non-syntax change reparsing or dropping settled AST, a syntax-signature change failing to invalidate exactly once, repeated preparation for an unchanged list, zero-path allocation or indexing, work proportional to all plugins per character or node, budget overruns, or optional plugin code entering Core or the server parser.
- **Repository integrity:** Knowledge validation, type checks, public-content checks, formatting, and changed-file review must confirm that this proposal contains AST-036 and only required canonical backlinks. Failure includes invalid record shape, private context, unrelated component behavior, implementation, or a Changeset entering this proposal.

## Related owner prerequisites

Before implementation acceptance, each prerequisite must exist in its canonical current owner and be linked by exact clause. This section records dependency status; it does not become a second owner.

1. Plugin-enabled Markdown and Outline must use one parse configuration and collision allocator for unique matching IDs, including citation-bearing headings and collisions across slug bases; the zero-plugin path retains released heading-ID behavior under FR2.
2. Incremental parsing must invalidate every current parse-affecting option before the ordered plugin parse identity extends that mechanism.
3. Parser and renderer navigation or embedded-resource behavior must conform to its current family owner before plugins rely on a shared result.
4. Modern text behavior must be proven against every released `inlinePlugins` fixture before soft deprecation or codemod publication; FR4 and FR20 remain the normative owner of that condition.

If an exact current owner clause does not yet exist for prerequisites 1–3, the item remains an unresolved dependency. AST-036 does not silently create parallel Markdown, Outline, parser, navigation, or resource authority. Other parser cleanup remains report-only unless its canonical owner makes it an explicit dependency.

## Decision log

### DEC-1 — Keep one capability-named plugin model

**Reference:** `spec:AST-036/DEC-1`
**Direction owner:** `cixzhang`, `2026-09-14`

Adopts FR1. Capability names expose caller choices directly, remain shallow and searchable, and follow the existing Table composition precedent.

Rejected: immediately replacing released seams; adding parallel extension props; adding a registry or discovery mechanism; exposing unrestricted whole-document parse or render hooks; or organizing the public model around internal lifecycle stages.

### DEC-2 — Colocate Astryx plugins; allow ordinary external packages

**Reference:** `spec:AST-036/DEC-2`
**Direction owner:** `cixzhang`, `2026-09-14`

Adopts FR5–FR6. First-party modules stay with Markdown and use ordinary public static, factory, or hook exports. Third parties use explicit package imports with protocol and package-version compatibility rather than an Astryx-controlled registry.

Rejected: package discovery, central registration, a global plugin-marketplace contract, or separate first-party packages for the initial common plugins.

### DEC-3 — Separate parse identity from live non-parse state

**Reference:** `spec:AST-036/DEC-3`
**Direction owner:** `cixzhang`, `2026-09-14`

Adopts FR28–FR30. Only ordered syntax contributors and existing parse-affecting Markdown options determine parse identity. Non-syntax capabilities, callbacks, lazy resources, and other live state update only their owning post-parse behavior. Equivalent internal implementations remain free to meet the observable cache, preparation, reparse, remount, and resource guarantees.

Rejected: object identity as parse identity; reparsing on live non-parse state changes; a separate public render key; repeated list-wide preparation for stable inputs; or work proportional to every plugin at every source character or rendered node.

## Open questions

None. This contract is current; implementation and its required evidence remain pending.

## Content boundary

This record does not duplicate consumer signatures, prop or option references, examples, migration recipes, private parser or renderer mechanisms, repository file layouts, module-specific behavior, current audit results, or implementation steps. It links those facts to their canonical owners.
