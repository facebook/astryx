---
schema_version: 4
template_version: 2
kind: system-spec
id: spec:AST-064
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
phase: proposed
owners: [cixzhang]
affects_architecture: []
affects_families: []
affects_contributing: []
affects_consumer_docs: [RichTextEditor, RichTextView]
---

# Markdown plugins in RichText system spec

<!-- Describe the system, not the project: present tense, what it does. No proposals, history, pull requests, or research in the record; see docs/contributing/spec-writing.md and report its rubric results in the pull request. -->

## Intent

A product that extends Markdown with a plugin writes the plugin once. The
same inline syntax, and the same block syntax at the top level of a document,
becomes the same node, drawn by the same renderer, whether a person reads the
document in `Markdown`, views it in `RichTextView`, or edits it in
`RichTextEditor`. Each surface uses only the plugins its caller gives it, and
a plugin RichText cannot honor exactly is refused rather than half applied.
Syntax a surface does not adopt stays as the author wrote it.

## Non-goals

- Block extension syntax nested inside a list item, a quote, or a table cell.
  It stays literal text in RichText.
- Editing inside an extension node, plugin-supplied editing commands or
  toolbars, and inserting new extension nodes from the editor's interface.
- Running a plugin's immutable document transform while editing, and
  plugin-derived heading projection or outlines. Plugins that need them are
  refused (FR3).
- Moving RichText's own Markdown import onto core's parser. Core's parser
  recognizes adopted plugin syntax only (FR4); RichText's transformers import
  everything else.
- Deprecating or removing the `transformers` prop and option.
- A public theme target for extension nodes; each plugin's renderer owns its
  node's visuals.
- Server-rendering `RichTextView`'s content, which stays filled in the
  browser.
- Exposing the editor engine's own plugin, node, or extension types through
  RichText's public API; package discovery; global registration; streaming
  input.

## Requirements

- **FR1 — One definition.** A plugin is the entry core's
  `createMarkdownPlugin` returns. RichText adopts that same entry through
  `createRichTextExtension(plugin)`, exported from `@astryxdesign/richtext`,
  which returns an opaque `RichTextMarkdownExtension`. RichText recognizes the
  plugin's syntax through core's parser and plugin protocol and draws its
  nodes with the plugin's renderers; there is no RichText-specific plugin
  format and no second copy of a plugin's parsing or rendering.
- **FR2 — Adopted per surface, never globally.** A RichText surface uses
  exactly the extensions its caller passes it: `markdownExtensions` on
  `RichTextEditor` and `RichTextView`, and the `extensions` option of
  `markdownToEditorStateJSON`. Nothing registers on import, globally, or by
  discovery. Surfaces with different extensions on one page do not affect
  each other.
- **FR3 — Default-deny.** `createRichTextExtension` accepts a plugin whose
  every capability RichText honors exactly: inline and block syntax
  contributions, with a renderer for every node name they produce. A plugin
  with any other capability — an immutable transform, or a node name without
  a renderer — is refused: `createRichTextExtension` throws a
  `RichTextExtensionError` naming the plugin and the capability, before any
  surface uses it. A refused or absent plugin's syntax imports as literal text
  (`spec:AST-062` FR5).
- **FR4 — Core recognizes plugin syntax first.** Before RichText's own
  Markdown import reads a top-level block, core's parser, given exactly the
  adopted plugins, finds their nodes in it. Each node's exact source is
  shielded from RichText's import and becomes one extension node; RichText's
  transformers import everything else as they do without plugins. Where core
  recognizes plugin syntax, the plugin's node wins for that range. The
  recognized spans are the spans core `Markdown` recognizes with the same
  plugins — the same start, end, display, node name, and data, and nothing
  inside code, after an escaping backslash, or anywhere else core shields
  from plugins — for inline syntax wherever inline content imports and block
  syntax at the top level.
- **FR5 — Extensions and transformers never both claim source.**
  `markdownExtensions` run before the `transformers` prop or option. If a
  transformer claims what an adopted extension claims — its import pattern
  matches the source of a span the extension recognized, or it imports or
  exports the extension's nodes — the surface or serializer throws a
  `RichTextExtensionError` naming the plugin and the transformer. Neither
  silently wins.
- **FR6 — Extension nodes are atomic.** A recognized span is one node in the
  editor that cannot be typed into. The caret moves over it in one step; it is
  selected, deleted, cut, copied, pasted, moved, undone, and redone whole. An
  inline node sits in its line of text; a block node is a top-level block.
  Assistive technology meets each node once, in document order, with the
  semantics its renderer gives it; the node adds no tab stop of its own.
- **FR7 — Rendering matches core.** A node renders through its plugin's
  renderer for its node name, exactly as core `Markdown` renders an extension
  node. A renderer that returns nothing renders nothing. If the renderer
  throws when called or while rendering, the node shows its readable text in
  place — its source, or the renderer's `toText` for a node with no source —
  and shows the same text while the renderer suspends. A surface without the
  node's plugin shows its source. A failure never breaks the rest of the
  surface.
- **FR8 — Diagnostics match core.** RichText reports a plugin's failures
  through core's plugin failure reporting, as `Markdown` does: once per plugin
  and phase, `plugin "<name>" failed in <phase>; rendered readable fallback.`
  It adds no diagnostics channel of its own.
- **FR9 — The authored source is authoritative.** An extension node exports
  exactly its source bytes wherever it is, so documents with plugin syntax
  keep `spec:AST-062` FR1–FR5: an unchanged document round-trips byte for
  byte; editing around a node never rewrites it; moving it moves its bytes. A
  document imported without the plugin keeps the syntax as literal text and
  exports it unchanged.
- **FR10 — Stored state is re-derived from source.** Stored editor state
  keeps each extension node's exact source, its plugin's name, `parseKey`,
  and protocol version, and the data derived for rendering. When a surface
  loads stored state, it derives each node again from its source with the
  adopted plugin and never renders stored data on its own. A node whose
  source the adopted plugin no longer recognizes as that node — the plugin's
  syntax, `parseKey`, or protocol version changed without a migration, or the
  plugin is absent — loads as its source, literal text that exports
  unchanged.
- **FR11 — Headless and hydration safe.** Recognition, import, and export,
  `createRichTextExtension` included, run headless in Node and in server code
  with no DOM. `RichTextView` keeps its client boundary: its content fills in
  the browser, and a server-rendered page that contains it hydrates without
  mismatches when extensions are adopted.

### Platform support

- Supported feature/engine floor: wherever RichText renders; recognition,
  import, and export also run headless in Node.
- Unsupported behavior: none beyond the non-goals.
- Browser evidence: required for FR6 and FR7 (keyboard, selection,
  clipboard, history, rendering, and assistive-technology order in the
  editor) and for FR11's hydration.

## Current-state impact

RichText does not adopt Markdown plugins: plugin syntax imports as literal
text and exports as authored (`spec:AST-062` FR5), and `RichTextEditor`,
`RichTextView`, and `markdownToEditorStateJSON` take no Markdown plugins.
Their `nodes`, `plugins`, and `transformers` props and options, which take
editor-engine nodes, React plugins, and editor-engine Markdown transformers,
keep working beside `markdownExtensions`.

## Verification

| Contract | Verification                                                                              | Representative states                                                                                                                                                                                                                                                     | Mutation or failure expectation                                                                                                              |
| -------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| FR1      | The same plugin entry passed to `Markdown` and to `createRichTextExtension`               | A plugin with inline and block contributions and data                                                                                                                                                                                                                     | A RichText-only definition, or a second tokenizer or renderer, fails                                                                         |
| FR2      | Two surfaces on one page, one with the extension and one without; import with and without | Editor and view; `markdownToEditorStateJSON` with and without `extensions`                                                                                                                                                                                                | One surface's extension changing the other, or recognition without an explicit extension, fails                                              |
| FR3      | `createRichTextExtension` over the capability matrix                                      | Syntax with renderers; a transform; a transform with syntax; a node name without a renderer; a refused plugin's syntax in a document                                                                                                                                      | Accepting an unsupported capability, a refusal that does not name the plugin and capability, or dropped syntax fails                         |
| FR4      | A corpus parsed by core and imported by RichText with the same plugins, node by node      | Inline and block matches; a deferred and a failed match; syntax inside inline code and fenced code; an escaped start; plugin syntax that base Markdown would also read (an emphasis-like delimiter); inline syntax in lists, quotes, and table cells; nested block syntax | A span, display, node name, or data that differs from core, base Markdown read inside a plugin span, or nested block syntax recognized fails |
| FR5      | Extensions with transformers that overlap and that do not                                 | A transformer whose pattern matches a recognized span; one that handles the extension's nodes; an unrelated custom transformer                                                                                                                                            | An overlap that does not throw, a thrown error without both names, or an unrelated transformer refused fails                                 |
| FR6      | Real-browser editing of inline and block nodes                                            | Arrow keys across, Shift-selection, Backspace and Delete, cut, copy, paste into another editor with and without the extension, undo, redo, typing beside a node                                                                                                           | A caret inside a node, a partial deletion, or a node split by an edit fails                                                                  |
| FR7      | Rendering in both surfaces against core's output for the same nodes                       | A renderer that returns content; one that returns nothing; one that throws when called; one whose component throws; one that suspends; a node with no source; a surface without the extension                                                                             | Output that differs from core's, or a fallback other than source, `toText`, or nothing as core shows, fails                                  |
| FR8      | Failure reporting from both surfaces                                                      | A syntax failure; a render failure, repeated                                                                                                                                                                                                                              | A report that differs from core's message or frequency, or a RichText-only diagnostic, fails                                                 |
| FR9      | `spec:AST-062`'s conformance corpus with plugin syntax added                              | Unchanged documents; an edit beside a node; a node moved; import without the plugin                                                                                                                                                                                       | Any byte of a node's source changing, or source lost without the plugin, fails                                                               |
| FR10     | Stored state loaded under changed plugins                                                 | The same plugin; a changed `parseKey`; a changed protocol version; changed syntax that no longer matches; stored data edited to disagree with the source; no plugin                                                                                                       | Rendering stale stored data, or a lost or changed source byte, fails                                                                         |
| FR11     | Headless runs and a server-rendered page hydrating a `RichTextView` with extensions       | Node import and export with extensions; `createRichTextExtension` without a DOM; hydration with inline and block nodes                                                                                                                                                    | Browser-only work during creation, import, or export, or a hydration mismatch, fails                                                         |

## Decision log

### DEC-1 — A plugin is written once, in core's protocol

**Reference:** `spec:AST-064/DEC-1`
**Decider:** pending

Core's plugin protocol already bounds syntax, shields built-in constructs,
validates nodes, and renders with fallbacks. RichText adopts those entries
as they are, recognizing syntax through core's parser and drawing nodes with
the plugin's renderers, so a plugin cannot mean one thing when read and
another when edited. Rejected: a RichText plugin format, which would copy
each plugin's parsing and rendering and let them drift.

### DEC-2 — Each surface adopts plugins explicitly

**Reference:** `spec:AST-064/DEC-2`
**Decider:** pending

A surface's extensions are the ones its caller passes, as `Markdown`'s
`plugins` are. Rejected: a global registry, which lets one product's plugin
change another surface's documents and makes behavior depend on import
order.

### DEC-3 — Default-deny: adopt only what RichText honors exactly

**Reference:** `spec:AST-064/DEC-3`
**Decider:** pending

An editor that silently skipped part of a plugin — its transform, say —
would show a different document than `Markdown` shows for the same source.
RichText adopts a plugin only when it honors every capability, and refuses
it loudly otherwise, leaving its syntax as text. Rejected: partial adoption
with a warning.

### DEC-4 — Core recognizes plugin syntax; RichText imports the rest

**Reference:** `spec:AST-064/DEC-4`
**Decider:** pending

Plugin syntax means what core's parser says it means, so core finds it
first and its range is closed to RichText's import; base Markdown stays with
RichText's transformers, and an overlap between an extension and a
transformer is an error, not an ordering accident. Rejected: moving all of
RichText's import onto core's parser in this record, and last-one-wins
between extensions and transformers.

### DEC-5 — Extension nodes are atomic, and their source is the truth

**Reference:** `spec:AST-064/DEC-5`
**Decider:** pending

Core's protocol reads syntax into nodes and renders them; it has no way to
write a changed node back to Markdown. An atomic node keeps its authored
source, exports exactly that, and is derived again from it whenever it
loads, so stored data can never drift from the document. Rejected: editable
extension content, which would need a serializer per plugin, and trusting
stored data across plugin versions.

## Open questions

- None.
