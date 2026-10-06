---
schema_version: 4
template_version: 2
kind: system-spec
id: spec:AST-061
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
affects_consumer_docs: [Markdown, RichTextEditor, RichTextView]
---

# Markdown document surface parity system spec

<!-- Describe the system, not the project: present tense, what it does. No proposals, history, pull requests, or research in the record; see docs/contributing/spec-writing.md and report its rubric results in the pull request. -->

## Intent

A person reads a Markdown document in core `Markdown` and edits the same
document in `RichTextEditor`, or views it in `RichTextView`. They see one
document: the same typography, block spacing, measure, structure, and
direction on every surface. Switching between reading and editing in place
moves no block relative to the others and reflows no line; only editing
affordances appear or disappear.

## Non-goals

- Byte-identical DOM. Each surface keeps its own markup when the rendered
  result and its semantics match.
- The Markdown dialect itself, and how RichText imports and exports Markdown
  source. This record governs what a supported construct looks like and means
  once rendered, not which source text produces it or how source round-trips.
- Collaboration, persistence, document hosting, and plugin adapters between
  Markdown plugins and the editor.
- RichText's release channel. RichText stays canary-only.
- Equivalent internal implementations remain valid when they satisfy this
  contract.

## Requirements

- **FR1 — One contract decides, not either renderer.** Where `Markdown` and a
  RichText surface disagree for the same supported content, CommonMark
  semantics decide meaning and the shared type-scale, spacing, and color
  tokens decide presentation. Neither surface's current output is the
  reference: a mismatch is fixed on the side the contract says is wrong, which
  may be `Markdown`.
- **FR2 — Same typography.** Body text uses `--text-body-size` and
  `--text-body-leading`; heading level N uses `--text-heading-N-size`,
  `--text-heading-N-weight`, and `--text-heading-N-leading` with the heading
  font family, for levels 1–6. Strong text uses `--font-weight-semibold`.
  Inline code uses the same chip size, family, and padding on every surface.
- **FR3 — Same block spacing.** Blocks are separated by one spacing table per
  density. Default density: headings 1–3 `--spacing-6` before and
  `--spacing-3` after; headings 4–6 `--spacing-4` before and `--spacing-2`
  after; paragraphs and lists `--spacing-3` on both edges; fenced code,
  blockquotes, and tables `--spacing-4`; thematic breaks `--spacing-6`.
  Compact density uses the compact column of the same table. The first
  block's leading margin and the last block's trailing margin are zero.
- **FR4 — Same measure.** Prose blocks cap at the same content width,
  `680px` by default, and wide blocks (fenced code, tables) span the
  available width on every surface.
- **FR5 — Same structure.** Paragraph soft line breaks join into one line of
  flowing text; hard breaks break. A blockquote's lines continue one
  paragraph. Ordered and unordered lists nest by CommonMark indentation, show
  one marker per item with the marker style of its depth, and indent each
  level by the same amount. Task-list items, fenced code, tables, and
  thematic breaks render as those structures, never as their literal source.
- **FR6 — Same direction.** Content blocks lay out in the direction of the
  surrounding Internationalization provider on every surface. A surface does
  not choose a block's direction from its text.
- **FR7 — Same semantics.** Strong, emphasis, strikethrough, inline code, and
  links expose the same element semantics on every surface. A link's
  destination never contains its title; a title is exposed as the link's
  title. Named and numeric character references in text, such as `&copy;`
  and `&#169;`, render as the characters they name on every surface; inside
  inline code and fenced code they stay literal. Rendering decodes them; the
  authored source keeps them as written.
- **FR8 — Same code block frame.** A fenced code block shows the same header,
  its language label and copy action, at the same height in read and edit
  mode, so the switch does not move the code. In edit mode the header sits
  outside the editable text: it is not part of the document and cannot be
  edited.
- **FR9 — Reading and editing in place.** Edit mode may add a caret,
  selection, placeholder, focus ring, field border and inset, and a toolbar.
  Together these offset the whole document by one constant amount: after that
  offset, every block's top and height match read mode within 2 px and every
  paragraph keeps its line count. The toolbar either overlays content or holds
  space that read mode reserves too, so the offset does not change while
  editing.
- **FR10 — Scroll position survives the switch.** The block at the top of
  the view before a switch between reading and editing is still at the top of
  the view after it, within the FR9 offset.

### Platform support

- Supported feature/engine floor: the repository's browser support matrix.
- Unsupported behavior: a construct a surface cannot yet render as a
  structure renders as its literal source text. It is never dropped.
- Browser evidence: real-browser block geometry for the shared parity
  fixture at phone and desktop widths, light and dark, left-to-right and
  right-to-left, and a long document switched between reading and editing
  halfway down.

## Current-state impact

`Markdown` already renders FR2–FR6 for its own output except where FR7 names
a link title and FR7 names character references. `RichTextEditor` and
`RichTextView` adopt FR2–FR10 for the
constructs they render, and their default editor theme follows FR2 and FR3.

## Verification

| Contract | Verification                                                                                    | Representative states                                                                                    | Mutation or failure expectation                                                                                     |
| -------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| FR2–FR4  | Real-browser computed style and block geometry of the parity fixture on `Markdown` and RichText | 390px and 1440px; light and dark; default density                                                        | Restoring a hard-coded heading size or a different block margin moves a block past 2 px and fails                   |
| FR5      | Real-browser structure and line counts of the parity fixture                                    | Nested lists at 2- and 3-space indentation; soft breaks; blockquote continuation                         | Flattening a nested list or turning a soft break into a line break fails                                            |
| FR6      | Real-browser computed direction per block                                                       | Right-to-left provider with left-to-right text, and the reverse                                          | Per-block automatic direction fails                                                                                 |
| FR7      | Semantic DOM of inline marks, links, and character references on every surface                  | Titled link, bare link, strong, emphasis, strikethrough; `&amp;`, `&copy;`, `&#169;` in text and in code | A title inside a destination, a styled span in place of a semantic element, or an undecoded reference in text fails |
| FR8      | Real-browser code block header geometry in both modes                                           | Fenced code with an info string                                                                          | A header missing from one mode moves the code and fails                                                             |
| FR9–FR10 | Real-browser read/edit switch of the parity fixture and a long document                         | Short document at the top; long document halfway down                                                    | A per-block shift beyond the constant offset, or an anchor block leaving the top of the view, fails                 |

## Decision log

### DEC-1 — Parity is a shared contract, not a copy of `Markdown`

**Reference:** `spec:AST-061/DEC-1`
**Decider:** cixzhang, 2026-10-06

Readers move between the read and edit surfaces of the same document, so the
document has to look and mean the same on both. The contract is CommonMark
semantics plus the shared tokens, because those are what a reader's
expectations come from. When `Markdown` is the side that departs from them,
`Markdown` changes.
Rejected: treating current `Markdown` output as the reference, because it
would copy its defects into every editor surface.

### DEC-2 — Editing affordances offset the document but never reflow it

**Reference:** `spec:AST-061/DEC-2`
**Decider:** cixzhang, 2026-10-06

An editor needs a caret, a toolbar, and a field frame, so edit mode cannot be
pixel-identical to read mode. A constant offset keeps the reader's place:
every line stays where it was relative to the others, and the scroll anchor
stays at the top of the view. 2 px absorbs subpixel rounding between
renderers; it does not admit a different spacing value.

### DEC-3 — Character references render decoded; source keeps them

**Reference:** `spec:AST-061/DEC-3`
**Decider:** cixzhang, 2026-10-06

A reader who sees `&copy;` on one surface and `©` on the other is looking at
two documents. CommonMark renders references as the characters they name, so
both surfaces do; code shows exactly what was typed. Decoding is a rendering
fact, not a rewrite: the authored Markdown keeps the reference.

### DEC-4 — Read and edit share the code block header

**Reference:** `spec:AST-061/DEC-4`
**Decider:** cixzhang, 2026-10-06

The language label tells a reader what the code is in both modes, and a
header present in only one mode moves every line of code on the switch. The
header is a frame around the document, not document content, so editing never
reaches it.

## Open questions

- None.
