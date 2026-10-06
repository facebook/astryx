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
same syntax becomes the same node, drawn by the same renderer, whether a
person reads the document in `Markdown`, views it in `RichTextView`, or
edits it in `RichTextEditor`. Each surface uses only the plugins its caller
gives it, and a plugin RichText cannot honor exactly is refused rather than
half applied. Syntax a surface does not adopt stays as the author wrote it.

## Non-goals

- Editing inside an extension node, plugin-supplied editing commands or
  toolbars, and inserting new extension nodes from the editor's interface.
- Running a plugin's immutable document transform while editing, and
  plugin-derived heading projection or outlines. Plugins that need them are
  refused (FR3).
- Block extension syntax nested inside a list item, a quote, or a table cell.
  RichText recognizes block extension syntax at the top level of the
  document; nested block syntax stays literal text.
- Exposing the editor engine's own plugin, node, or extension types through
  RichText's public API.
- Package discovery, global registration, and plugin ordering across
  surfaces.
- Streaming input. RichText imports complete documents.

## Requirements

- **FR1 — One definition.** A plugin is the entry core's
  `createMarkdownPlugin` returns. RichText adopts that same entry through
  `createRichTextExtension(plugin)`, exported from `@astryxdesign/richtext`,
  which returns an opaque `RichTextMarkdownExtension`. RichText recognizes
  syntax with the plugin's own tokenizers through core's parser and draws
  nodes with the plugin's own renderers; there is no RichText-specific plugin
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
- **FR4 — Same recognition.** With the same plugin, RichText recognizes the
  spans core `Markdown` recognizes, in the contexts this record covers —
  inline syntax wherever inline content imports, block syntax at the top
  level: the same start, end, display, node name, and data, and nothing
  inside code, after an escaping backslash, or anywhere else core shields from
  plugins. A span core does not recognize stays text.
- **FR5 — Extension nodes are atomic.** A recognized span is one node in the
  editor that cannot be typed into. The caret moves over it in one step; it is
  selected, deleted, cut, copied, pasted, moved, undone, and redone whole. An
  inline node sits in its line of text; a block node is a top-level block.
  Assistive technology meets each node once, in document order, with the
  semantics its renderer gives it; the node adds no tab stop of its own.
- **FR6 — Same rendering, same fallback.** A node renders through its
  plugin's renderer for its node name in both RichText surfaces, exactly as
  core `Markdown` renders it. If the renderer throws, returns nothing, or the
  surface was not given the plugin, the node shows its readable text — the
  renderer's `toText` when the plugin is present, its source otherwise — in
  place, and the rest of the surface keeps working.
- **FR7 — Plugin syntax is kept losslessly.** An extension node exports
  exactly its source bytes wherever it is, so documents with plugin syntax
  keep `spec:AST-062` FR1–FR5: an unchanged document round-trips byte for
  byte; editing around a node never rewrites it; moving it moves its bytes. A
  document imported without the plugin keeps the syntax as literal text and
  exports it unchanged. Stored editor state carries each node's source and
  data, so it exports, and renders its fallback, without the plugin.
- **FR8 — Server and client agree.** `RichTextView` renders extension nodes
  the same on the server and in the browser, and `createRichTextExtension`
  does no browser-only work.

### Platform support

- Supported feature/engine floor: wherever RichText renders; recognition and
  export also run headless in Node.
- Unsupported behavior: none beyond the non-goals.
- Browser evidence: required for FR5 and FR6 (keyboard, selection,
  clipboard, history, and assistive-technology order in the editor).

## Current-state impact

RichText does not adopt Markdown plugins: plugin syntax imports as literal
text and exports as authored (`spec:AST-062` FR5), and `RichTextEditor`,
`RichTextView`, and `markdownToEditorStateJSON` take no Markdown plugins.
Their `nodes` and `plugins` props, which take editor-engine nodes and React
plugins, are unchanged and separate from `markdownExtensions`.

## Verification

| Contract | Verification                                                                                  | Representative states                                                                                                                                                             | Mutation or failure expectation                                                                                       |
| -------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| FR1      | The same plugin entry passed to `Markdown` and to `createRichTextExtension`                   | A plugin with inline and block contributions and data                                                                                                                             | A RichText-only definition, or a second tokenizer or renderer, fails                                                  |
| FR2      | Two surfaces on one page, one with the extension and one without; import with and without it  | Editor and view; `markdownToEditorStateJSON` with and without `extensions`                                                                                                        | One surface's extension changing the other, or any recognition without an explicit extension, fails                   |
| FR3      | `createRichTextExtension` over the capability matrix                                          | Syntax with renderers; a transform; a transform with syntax; a node name without a renderer; a refused plugin's syntax in a document                                              | Accepting an unsupported capability, a refusal without the plugin and capability named, or dropped syntax fails       |
| FR4      | Conformance corpus parsed by core and imported by RichText with the same plugin, node by node | Inline and block matches; a deferred and a failed match; syntax in inline code and fenced code; an escaped start; adjacent nodes; inline syntax in lists, quotes, and table cells | Any span, display, node name, or data that differs from core fails                                                    |
| FR5      | Real-browser editing of inline and block nodes                                                | Arrow keys across, Shift-selection, Backspace and Delete, cut, copy, paste into another editor with and without the extension, undo, redo, typing beside a node                   | A caret inside a node, a partial deletion, or a node split by an edit fails                                           |
| FR6      | Rendering in both surfaces                                                                    | A renderer that returns content; one that throws; one that returns nothing; a surface without the extension                                                                       | Output that differs from core's, a fallback other than `toText` or source, or a failure that breaks the surface fails |
| FR7      | `spec:AST-062`'s conformance corpus with plugin syntax added                                  | Unchanged documents; an edit beside a node; a node moved; import without the plugin; stored state exported and rendered without the plugin                                        | Any byte of a node's source changing, or source lost without the plugin, fails                                        |
| FR8      | Server render and hydration of `RichTextView` with an extension                               | Inline and block nodes; a renderer fallback                                                                                                                                       | Different server and client output, or browser-only work in `createRichTextExtension`, fails                          |

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

### DEC-4 — Extension nodes are atomic and keep their source

**Reference:** `spec:AST-064/DEC-4`
**Decider:** pending

Core's protocol reads syntax into nodes and renders them; it has no way to
write a changed node back to Markdown. An atomic node that keeps its source
exports exactly what was read and never needs to. Rejected: editable
extension content, which would need a serializer per plugin that the
protocol does not have.

## Open questions

- None.
