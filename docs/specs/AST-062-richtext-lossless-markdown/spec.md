---
schema_version: 4
template_version: 2
kind: system-spec
id: spec:AST-062
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-10-06
phase: accepted
owners: [cixzhang]
affects_architecture: []
affects_families: []
affects_contributing: []
affects_consumer_docs: [RichTextEditor, RichTextView]
---

# Lossless Markdown round trip in RichText system spec

<!-- Describe the system, not the project: present tense, what it does. No proposals, history, pull requests, or research in the record; see docs/contributing/spec-writing.md and report its rubric results in the pull request. -->

## Intent

A person opens Markdown in a RichText editor and exports it again. If they
changed nothing, they get back exactly the bytes they opened. If they changed
one part, every part they did not touch comes back exactly as they wrote it.
No source text disappears because the editor could not represent it.

## Non-goals

- Which editor engine serves document editing, and the stored value an editor
  reads and writes. This record governs what RichText's Markdown import and
  export return, not whether a product stores Markdown, editor state, or
  something else.
- Which constructs render as structures. `spec:AST-061` owns how supported
  constructs look and what they mean once rendered.
- The form of content a person writes or changes. Regenerated Markdown uses the
  canonical form of the transformer that writes it.
- Collaboration, persistence, and document hosting.
- Equivalent internal implementations remain valid when they satisfy this
  contract.

## Requirements

- **FR1 — Exporting unchanged content returns the authored bytes.** Markdown
  imported into RichText and exported with no edit is identical to the input,
  byte for byte, for any input: supported, unsupported, and malformed. This
  holds for `markdownToEditorStateJSON` followed by `editorStateJSONToMarkdown`,
  and for an editor's `getMarkdown()` after it loads imported content.
- **FR2 — An edit regenerates only what it changed.** After an edit, every
  top-level block whose content the edit did not change exports exactly as
  authored, including the blank lines and whitespace that follow it. Only the
  blocks the edit changed or created export in canonical form.
- **FR3 — Unsupported source is kept, never dropped.** Source that RichText
  cannot represent as a structure imports as visible literal text. Untouched,
  it exports as authored (FR1, FR2); edited, it exports with every character a
  person did not delete.
- **FR4 — Every shipped transformer conforms.** FR1–FR3 hold for every
  transformer and node RichText ships by default. A caller's custom
  transformer gets the same preservation for blocks it does not change.

### Platform support

- Supported feature/engine floor: wherever RichText's Markdown import and
  export run, including headless in Node.
- Unsupported behavior: none; FR1 and FR3 cover every input.
- Browser evidence: not required; the contract is string in, string out.

## Current-state impact

RichText's Markdown import and export adopt FR1–FR4. Content imported before
this contract carries no record of its authored form and exports in canonical
form until it is imported again.

## Verification

| Contract | Verification                                                                    | Representative states                                                                                                                                                                                                                                                                | Mutation or failure expectation                                           |
| -------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| FR1      | Conformance corpus of at least 30 documents, imported and exported with no edit | Nested lists at 2- and 3-space indentation; backslash escapes such as `\#`; character references such as `&#169;`; fenced code with an info string and metadata; tables; unsupported HTML, reference definitions, and setext headings; trailing whitespace and missing final newline | Exporting any block in canonical form instead of its authored bytes fails |
| FR2      | The same corpus with one block edited                                           | An edit in the first, a middle, and the last block; a new block inserted; a block deleted                                                                                                                                                                                            | Any untouched block changing a byte fails                                 |
| FR3      | Unsupported constructs edited and untouched                                     | Raw HTML block; reference definition; footnote                                                                                                                                                                                                                                       | A character the edit did not delete missing from the export fails         |
| FR4      | The corpus run with the default transformers, including tables                  | Every shipped transformer represented                                                                                                                                                                                                                                                | A shipped transformer that bypasses preservation fails                    |

## Decision log

### DEC-1 — Keep the author's bytes

**Reference:** `spec:AST-062/DEC-1`
**Decider:** cixzhang, 2026-10-06

A document that changes when nobody edited it breaks diffs, review, and trust
in the editor, and canonical form loses what the author chose: indentation,
escapes, references, fence metadata. RichText keeps the authored form of what
it did not change and writes canonical Markdown only for what it did.
Rejected: normalizing on import, because every save would rewrite untouched
lines.

### DEC-2 — The top-level block is the unit of preservation

**Reference:** `spec:AST-062/DEC-2`
**Decider:** cixzhang, 2026-10-06

People edit one paragraph, list, table, or code block at a time, and a
top-level block can be regenerated without touching its neighbours. An edit
anywhere in a block regenerates that block; preserving finer spans inside a
changed block is a compatible refinement, not a requirement.

## Open questions

- None.
