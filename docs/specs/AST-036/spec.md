---
schema_version: 1
template_version: 1
kind: system-spec
id: spec:AST-036
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-09-15
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

| Area                 | Contract                                                                                                                                                                                                                                                                                                                                             |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract      | One additive `plugins` prop and `createMarkdownPlugin()`. A plugin exposes only `syntax`, immutable `transform`, and `renderers`. Text matching, semantic fences, and source decoration are helper-authored transforms, not separate protocol phases.                                                                                                |
| Behavior             | Core translates its private parser tree into one stable, strictly typed, MDAST-aligned transform AST. Ordered transforms return validated replacement trees; Core then translates back for rendering while retaining built-in semantics and readable fallback.                                                                                       |
| Remark compatibility | A separate adapter may run synchronous transform-only Remark plugins over the documented supported MDAST subset. Parser extensions, async plugins, compiler plugins, arbitrary `VFile` state, and unsupported node kinds are rejected rather than approximated.                                                                                      |
| End-user impact      | Readers may receive additional syntax and transformed document structure while ordinary Markdown, copyable fallback, heading and Outline identity, accessibility, navigation, images, lists, and tables retain canonical ownership.                                                                                                                  |
| Builder impact       | Existing builders do nothing. Opt-in builders pass one stable plugin list. Simple text, fence, and decoration use cases use helpers that compile to transforms.                                                                                                                                                                                      |
| Compatibility        | Omitted plugins and `plugins={[]}` are semantically the same empty pipeline. Core may skip empty preparation and allocation, but no separate behavior model exists. Existing `components`, `inlinePlugins`, math, citations, autolinks, and parser signatures retain their meaning.                                                                  |
| Review checks        | Reject a second plugin prop, public lifecycle-specific phases, mutable shared AST, raw-markup nodes, plugin override of Core semantics, unbounded parser hooks, silent Remark incompatibility, transform-driven reparsing, or work proportional to every plugin at every source character.                                                           |
| Governing rules      | [`architecture:public-component-api`](../../architecture/public-component-api.md); [`family:navigation-destinations`](../../families/navigation-destinations.md); [AST-002 FR4](../AST-002/spec.md); [AST-002 FR15](../AST-002/spec.md); [AST-002 FR17](../AST-002/spec.md); [AST-002 FR18](../AST-002/spec.md); [AST-002 FR20](../AST-002/spec.md). |

This section is a review projection; the body below is authoritative.

## Intent

Application authors should be able to add reusable Markdown behavior without rewriting source text, forking the parser, or replacing the whole renderer. One understandable model must cover new source syntax, document-level semantic transformation, and typed rendering.

The public concepts should remain fewer than the use cases. Prose replacement, semantic code fences, source decoration, callouts, frontmatter, TOCs, footnotes, and compatible Remark transforms all use the same immutable transform boundary rather than becoming independent protocol phases.

## Ownership boundary

AST-036 owns shared plugin admission, syntax and transform ordering, compatibility, validation, failure behavior, parse identity, Remark-adapter limits, and observable resource constraints. Markdown owns its concrete AST declarations, parser integration, aggregate rendering, and helpers. Outline owns its projection of Markdown heading identity. A first-party plugin owns its specific semantics and evidence in its own module record.

## Non-goals

- Adopt Unified, mutable MDAST, `VFile`, or Remark as Core runtime dependencies.
- Expose the private parser AST as public API or make parser implementation details
  compatibility constraints.
- Promise compatibility with arbitrary Remark parser, transform, compiler, async, or raw-HTML plugins.
- Expose mutable shared AST, unrestricted visitors, DOM access, package discovery, or a registry.
- Replace generic CodeBlock highlighting or Core-owned document, heading, navigation, image, list, or table semantics.
- Make a zero-plugin document a separate semantic mode.

## Current-state impact

| Current seam              | Preserved behavior                                                                     | New role                                                                                                      |
| ------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `components`              | Replaces supported built-in renderers, including the all-fence code renderer.          | Continues to win before plugin rendering.                                                                     |
| `inlinePlugins`           | Replaces matched prose with released traversal, overlap, callback, and error behavior. | Remains compatible; a later migration may adapt it through a helper-backed transform only after exact parity. |
| Parser and streaming APIs | Produce the released AST and reuse settled incremental output.                         | Accept syntax plugins and apply live transforms without making transforms part of parse identity.             |
| Markdown and Outline      | Share built-in heading text and slug behavior.                                         | Also share transformed heading projection and collision allocation.                                           |

## Semantic model

A plugin entry is an opaque value created by `createMarkdownPlugin()`. Its only public capabilities are `syntax`, `transform`, and `renderers`. A plain object cannot masquerade as an entry. Heterogeneous lists preserve the union of their extension-node kinds under strict TypeScript.

The public transform document is a stable, immutable Unist-shaped root with ordered
block children. Its discriminated node union intentionally aligns names and fields
with the supported MDAST subset (`root`, `children`, `value`, `url`, and
`position`) while adding Astryx-owned typed extension nodes. It is not the private
parser AST: Core translates at the boundary so parser structure may evolve without
breaking plugins. Built-in and extension nodes carry finite acyclic data plus
Core-authored source provenance.

The public module exports a closed `MarkdownAstNodeMap`, derived node unions, and a
typed visitor whose node-kind argument narrows the callback (`visitMarkdownNodes(
root, 'heading', node => …)`). Plugin-defined extension kinds augment the generic
node map without widening unrelated built-in callbacks. Transform input is deeply
readonly; a transform returns the original root or a replacement root, and Core
validates and freezes replacement structure before the next plugin observes it.

A syntax contribution declares non-empty literal prefixes, a finite pending bound, and a synchronous deterministic tokenizer. It may emit only its owning typed extension nodes. Syntax-bearing plugins declare `parseKey`; only ordered syntax identity participates in incremental parse identity.

A transform is synchronous and deterministic. It receives the immutable document and a readonly file context containing source text, finality, and diagnostics reporting. It may replace, insert, remove, or annotate representable nodes but cannot mutate its input, author source provenance, introduce raw markup or React values, or bypass Core validation. Transform changes rerun the ordered transform pipeline without reparsing settled source.

Renderers receive typed extension-node data only. Every extension node a plugin can introduce through syntax or transform has a renderer and deterministic perceivable-text projection. Core owns local error boundaries and exact readable-source fallback.

Text matching, semantic fences, and source decoration are optional helpers that return transform functions or plugin entries. Core may compile recognized helpers into indexed internal execution plans, but helper use does not add public phases or change transform ordering.

## Limited Remark compatibility profile

A Remark adapter accepts a synchronous transform-only plugin whose behavior is
confined to the public transform AST's MDAST-aligned subset. The adapter:

1. clones the immutable public transform tree into the mutable copy expected by
   Remark;
2. invokes the plugin with no parser/compiler registration and a constrained file
   object;
3. validates the returned or mutated copy and converts it back into an immutable
   public transform tree;
4. rejects unsupported nodes, raw HTML, promises, shared processor state, and
   unrepresentable metadata with a named diagnostic and readable fallback.

Compatibility is explicit per plugin. “Remark-compatible” means the adapter test matrix passes for that plugin; package shape alone is not evidence. Plugins using `this.data()`, micromark extensions, async work, arbitrary `VFile` messages/data, positional mutation outside representable source, or compiler hooks are outside the profile.

## Requirements

### Admission and compatibility

- **FR1 — One public plugin model.** `plugins` and `createMarkdownPlugin()` are the canonical extension seam. The only protocol capabilities are `syntax`, `transform`, and `renderers`; helper APIs may compile common use cases into transforms.
- **FR2 — One empty-pipeline behavior.** Omitted plugins and an empty list have identical AST, DOM, styling, targets, IDs, errors, and streaming behavior. Core may avoid empty normalization and allocation, but no behavior may depend on whether the empty list was explicit.
- **FR3 — Released seams remain compatible.** `components`, `inlinePlugins`, citations, opt-in GFM autolinking, math, sources, parser signatures, fields, optionality, mutability, and no-plugin result types retain their meaning.
- **FR4 — `inlinePlugins` migrates only after parity.** No deprecation occurs until a helper-backed transform preserves every released traversal context, overlap rule, callback result, `null`, throw, migration-doc, and codemod requirement.
- **FR5 — Entries are durable package values.** First-party plugins are colocated under Markdown and exported normally; third-party plugins are explicit package imports with a compatible Core peer range. No registry or discovery mechanism exists.

### Parsing and immutable transformation

- **FR6 — Fixed order.** Built-in and extension syntax parse first; transforms then run in plugin-array order; rendering runs last. A transform observes the validated result of every earlier transform.
- **FR7 — Built-in lexical shields win during syntax.** Escapes, inline and fenced code, links, images, citations, math, and accepted opaque syntax remain protected according to their current owners. Block extension syntax remains top-level unless a current owner explicitly broadens it.
- **FR8 — Ordered syntax claims.** Duplicate plugin names fail validation. Syntax contributions resolve in plugin and declaration order; first match wins, defer reserves the bounded candidate, and terminal parsing resolves all pending source.
- **FR9 — Transform AST is stable and strictly typed.** Core translates its private parser tree into a public Unist-shaped, MDAST-aligned subset with complete source positions. `MarkdownAstNodeMap`, generic extension augmentation, and `visitMarkdownNodes` provide discriminated narrowing by node kind without exposing parser internals.
- **FR10 — Transform input is immutable.** Core freezes the public input in development. A transform must return the same root or a replacement root and cannot mutate any input node, array, data object, or source position.
- **FR11 — Transform output is representable and validated.** Output is finite, acyclic, typed data. Core rejects raw HTML, React values, DOM nodes, functions in node data, invalid built-in structure, foreign extension ownership, and authored or shifted provenance.
- **FR12 — Transform failure is local to the plugin.** A throw, promise, invalid result, or unsupported adapter output reports one source-free diagnostic and passes the last valid root to later plugins and rendering.
- **FR13 — Live transforms do not reparse.** Adding, removing, reordering, or updating transforms reruns translation and transformation over retained parsed output. Only current parser options and ordered syntax `name`, protocol version, and `parseKey` invalidate parse caches.

### Rendering and cross-surface identity

- **FR14 — Extension rendering is complete and local.** Every extension kind a plugin may introduce has an owning renderer and perceivable-text projection. Missing or failed rendering preserves exact authored source and leaves siblings running.
- **FR15 — Core semantics remain authoritative.** Plugins cannot replace the document root or override Core-owned heading level/ID, navigation, image policy, list semantics, table semantics, or built-in accessibility behavior. Trusted renderer-created links and resources remain renderer-owned.
- **FR16 — One heading projection.** Markdown and Markdown-derived Outline use the same syntax list, transform list, text projection, slugger, and collision allocator. Renderer output cannot change identity; block extension nodes do not independently create Outline entries unless a later owner contract permits it.
- **FR17 — Existing code override remains compatible.** `components.code` remains the application-owned all-fence override. A semantic-fence helper transforms eligible code blocks only when that override is absent and always preserves ordinary copyable code fallback.

### Remark compatibility

- **FR18 — Adapter scope is explicit.** The adapter supports only synchronous transform-only plugins over the documented MDAST subset. It does not emulate Unified parser/compiler registration, async execution, processor state, or unrestricted `VFile` behavior.
- **FR19 — Translation is lossless or rejected.** Each adapted node and metadata field has a documented round trip. Unsupported input or output fails closed with readable source; the adapter never silently drops or approximates content.
- **FR20 — Compatibility is tested per plugin.** A package is called compatible only after fixtures prove equivalent supported-subset output, protected-context behavior, diagnostics, source preservation, and server rendering.

### Resources

- **FR21 — Stable preparation is reused.** Stable ordered lists prepare once. Core may compile helper transforms into prefix, language, node-kind, or range indexes and must not inspect every plugin at every source character.
- **FR22 — Existing parser budgets remain the floor.** Plugin-free full and incremental parsing retain their current absolute budgets.
- **FR23 — Focused overhead budgets remain.** Five zero-work plugins add at most 15 percent to 200- and 500-section medians. Representative trivial transforms add at most 25 percent. Measurements use paired batched samples robust to runner contention.
- **FR24 — Optional work stays optional.** Remark adapters and heavy renderers are tree-shakeable and absent from parser-only/server bundles unless imported.

## Public parser integration

Block, inline, incremental, Markdown, and Outline entrypoints accept the same ordered plugin configuration and infer the same extension-node union. Parser results include validated transforms. Incremental parsing caches raw settled parse output and reapplies live transforms to each returned snapshot without mutating prior snapshots.

## Verification

- **FR1–FR5:** public type/export fixtures, omitted/empty parity, exact released API fixtures, durable list reuse, and external-package imports.
- **FR6–FR13:** syntax claim matrices; private-to-public AST translation; typed visitor narrowing; immutable-input mutation attempts; ordered replacement, insertion, removal, and annotation; invalid/cyclic/raw/async outputs; streaming snapshots; transform-only live updates without tokenizer calls.
- **FR14–FR17:** every extension kind, renderer failure, code override, protected semantics, duplicate and cross-base heading IDs, Markdown/Outline parity, and server rendering.
- **FR18–FR20:** one real compatible Remark transform plus rejected async, parser-extension, raw-HTML, unsupported-node, and processor-state fixtures.
- **FR21–FR24:** empty path, stable preparation, zero-work and realistic transforms at 200/500 sections, streaming reuse, allocation/remount counts, bundle inspection, and parser-only import.
- **Repository integrity:** knowledge validation, public-content checks, typecheck, formatting, and changed-file review.

## Related owner prerequisites

Before implementation acceptance, current owner clauses must cover:

1. a stable public MDAST-aligned transform AST, typed node-map/visitor APIs,
   private-parser translation, and Core-owned semantic validation;
2. Markdown/Outline shared transformed heading identity;
3. parser cache separation between syntax identity and live transform state;
4. navigation/resource conformance for transformed nodes;
5. exact `inlinePlugins` compatibility before any migration.

## Decision log

### DEC-1 — Expose syntax, transform, and renderers only

**Reference:** `spec:AST-036/DEC-1`
**Direction owner:** `cixzhang`, `2026-09-15`

The public protocol has three concepts. Text matching, semantic fences, and decorations are transform helpers, not parallel lifecycle APIs. This keeps one mental model while permitting specialized internal execution.

Rejected: five independent public capability phases; a second transform prop; replacing simple local syntax with an unbounded document hook.

### DEC-2 — Make immutable AST transformation canonical

**Reference:** `spec:AST-036/DEC-2`
**Direction owner:** `cixzhang`, `2026-09-15`

Transforms receive a stable, MDAST-aligned public tree that is distinct from the
private parser tree. `MarkdownAstNodeMap` and `visitMarkdownNodes` provide strict
node-kind narrowing. Inputs are deeply readonly and transforms return validated
replacement roots. Core owns translation, provenance, structural validity,
fallback, and semantics. This admits document-wide behavior without freezing parser
implementation details or sharing mutable state.

Rejected: exposing the private parser AST, in-place mutation of Core's canonical
state, transform-driven reparsing, raw markup, weakly typed string visitors, and
renderer-controlled heading identity.

### DEC-3 — Support a limited Remark compatibility profile

**Reference:** `spec:AST-036/DEC-3`
**Direction owner:** `cixzhang`, `2026-09-15`

A tree-shakeable adapter may run synchronous transform-only Remark plugins over an explicit MDAST subset. Compatibility is per-plugin evidence, never inferred from package identity.

Rejected: adopting Unified/MDAST as Core's runtime, claiming arbitrary Remark compatibility, or silently approximating unsupported behavior.

### DEC-4 — Separate syntax identity from live transforms

**Reference:** `spec:AST-036/DEC-4`
**Direction owner:** `cixzhang`, `2026-09-15`

Only syntax and existing parser options determine parse identity. Transform and renderer updates reuse parsed output and rerun only their owning post-parse work.

Rejected: object identity as parse identity, transform-driven reparsing, a public render key, or repeated preparation for stable inputs.

## Open questions

None. The contract is current; implementation and compatibility evidence remain pending.

## Content boundary

This record does not duplicate consumer signatures, examples, private dispatch/cache design, repository layout, first-party plugin behavior, or current audit results. Those belong to their canonical owners.
