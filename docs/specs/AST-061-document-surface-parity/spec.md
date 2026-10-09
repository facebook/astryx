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

When core `Markdown` and the RichText surfaces, `RichTextEditor` and
`RichTextView`, show the same Markdown document, a person sees one document:
the same typography, block spacing, measure, structure, and direction on
every surface. Where a product switches between reading and editing that
document in place, the switch moves no block relative to the others and
reflows no line; only editing affordances appear or disappear.

## Non-goals

- Byte-identical DOM. Each surface keeps its own markup when the rendered
  result and its semantics match.
- The Markdown dialect itself, and how RichText imports and exports Markdown
  source. This record governs what a supported construct looks like and means
  once rendered, not which source text produces it or how source round-trips.
  The one exception is the character reference decoder that DEC-5 shares.
- Collaboration, persistence, document hosting, and plugin adapters between
  Markdown plugins and the editor.
- Which editor engine serves document editing, and the stored value an editor
  reads and writes. This record governs how the surfaces render the same
  document, not which surface a product chooses to edit documents with.
- RichText's release channel. The release policy and the package's
  Changesets decide it, not this record.
- Equivalent internal implementations remain valid when they satisfy this
  contract, except the character reference decoder, which DEC-5 makes one
  shared public function.

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
  one marker per item with the marker style of its depth (DEC-6), and indent
  each level by the same amount. Task-list items, fenced code, tables, and
  thematic breaks render as those structures, never as their literal source.
- **FR6 — Same direction.** Content blocks lay out in the direction of the
  surrounding Internationalization provider on every surface. A surface does
  not choose a block's direction from its text; text that runs against the
  provider direction follows normal bidirectional ordering inside its
  block.
- **FR7 — Same semantics.** Strong, emphasis, strikethrough, inline code, and
  links expose the same element semantics on every surface. A link's
  destination never contains its title; a title is exposed as the link's
  title. Named and numeric character references in text, such as `&copy;`
  and `&#169;`, render as the characters they name on every surface; inside
  inline code and fenced code they stay literal. Every surface decodes them
  with the one decoder `Markdown` exports (DEC-5).
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
`@astryxdesign/core/Markdown/parser` and `@astryxdesign/core/Markdown` export
`decodeMarkdownCharacterReferences`, the DEC-5 decoder the RichText surfaces
import with.
`Markdown` draws disc and decimal markers at every depth, and RichText draws
the second bulleted level as a disc; both adopt the DEC-6 marker cycle.

## Verification

| Contract   | Verification                                                                                    | Representative states                                                                                                                                            | Mutation or failure expectation                                                                                     |
| ---------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| FR2–FR4    | Real-browser computed style and block geometry of the parity fixture on `Markdown` and RichText | 390px and 1440px; light and dark; default density                                                                                                                | Restoring a hard-coded heading size or a different block margin moves a block past 2 px and fails                   |
| FR5        | Real-browser structure and line counts of the parity fixture                                    | Nested lists at 2- and 3-space indentation; soft breaks; blockquote continuation                                                                                 | Flattening a nested list or turning a soft break into a line break fails                                            |
| FR6        | Real-browser computed direction per block                                                       | Right-to-left provider with left-to-right text, and the reverse                                                                                                  | Per-block automatic direction fails                                                                                 |
| FR7        | Semantic DOM of inline marks, links, and character references on every surface                  | Titled link, bare link, strong, emphasis, strikethrough; `&amp;`, `&copy;`, `&#169;` in text and in code                                                         | A title inside a destination, a styled span in place of a semantic element, or an undecoded reference in text fails |
| FR7, DEC-5 | Shared conformance cases through `Markdown` rendering and RichText import                       | Named, decimal, and hexadecimal references; an unknown name; a missing semicolon; an invalid code point                                                          | A second reference table, or a decoder that changes an unknown name or an unterminated reference, fails             |
| FR5, DEC-6 | Real-browser marker style per depth on both surfaces                                            | Bulleted and numbered lists nested 0–8 deep and of mixed types; starts of 0, −1, 26, 27, 3999, and 4000 at alpha and roman depths; right-to-left; light and dark | A level that draws another level's marker, or one surface differing from the other, fails                           |
| FR8        | Real-browser code block header geometry in both modes                                           | Fenced code with an info string                                                                                                                                  | A header missing from one mode moves the code and fails                                                             |
| FR9–FR10   | Real-browser read/edit switch of the parity fixture and a long document                         | Short document at the top; long document halfway down                                                                                                            | A per-block shift beyond the constant offset, or an anchor block leaving the top of the view, fails                 |

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

### DEC-3 — Character references render decoded

**Reference:** `spec:AST-061/DEC-3`
**Decider:** cixzhang, 2026-10-06

A reader who sees `&copy;` on one surface and `©` on the other is looking at
two documents. CommonMark renders references as the characters they name, so
both surfaces do; code shows exactly what was typed.

### DEC-4 — Read and edit share the code block header

**Reference:** `spec:AST-061/DEC-4`
**Decider:** cixzhang, 2026-10-06

The language label tells a reader what the code is in both modes, and a
header present in only one mode moves every line of code on the switch. The
header is a frame around the document, not document content, so editing never
reaches it.

### DEC-5 — One decoder for character references

**Reference:** `spec:AST-061/DEC-5`
**Decider:** cixzhang, 2026-10-06

`decodeMarkdownCharacterReferences(text)`, exported from the server-safe
`@astryxdesign/core/Markdown/parser` subpath and from
`@astryxdesign/core/Markdown`, returns `text` with every valid named or
numeric character reference replaced by the characters it names, and a
numeric reference to NUL, a surrogate, or a code point past U+10FFFF replaced
by U+FFFD, as CommonMark specifies; an unknown name, a reference without its
semicolon, and all other text stay as written.
It works on plain text and knows nothing of Markdown: each caller decides
where it applies, so backslash escapes and code stay literal. It is the
decoder `Markdown` itself renders with: one implementation and one named
reference table, private to `Markdown`, so the surfaces cannot drift apart.
This is the narrow exception to this record's non-goals on import mechanism
and equivalent internals; every other internal stays free, and no general
HTML entity utility is exported.

### DEC-6 — List markers cycle by depth

**Reference:** `spec:AST-061/DEC-6`
**Decider:** cixzhang, 2026-10-06

A list's depth is the number of lists, bulleted or numbered, that enclose it;
a top-level list has depth 0. A bulleted list draws disc, circle, or square
markers when its depth modulo 3 is 0, 1, or 2; a numbered list writes its
numbers as decimal, lower-alpha, or lower-roman the same way. The cycle
repeats without end, so each level differs from the levels beside it and a
reader can tell depth apart on every surface. Numbering keeps the list's
start value and counts the same items; only how each number is written
changes. Letters past `z` continue as `aa`, `ab`, and so on. A number outside
its style's range — zero or a negative number under lower-alpha or
lower-roman, as a start of 0 or below gives, or a number past 3999 under
lower-roman — is written in decimal, as the CSS counter styles fall back; the
start value and the items stay as written. Task list items show checkboxes
instead of markers. Markers are presentation: the
list keeps its list semantics, and the source does not change.

## Open questions

- None.
