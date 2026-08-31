---
schema_version: 1
template_version: 3
kind: component
id: component:Markdown
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [theming]
verified_by:
  [
    packages/core/src/Markdown/Markdown.test.tsx,
    packages/core/src/theme/themingTargets.test.ts,
    scripts/check-knowledge.mjs,
  ]
families: []
design_specs: []
architecture: [architecture:component-theming-surface]
contributing: []
system_specs: []
---

# Markdown component contract

## Intent

Markdown renders parsed content in a Document with stable default block parts.
This draft records the nine current Markdown targets and the custom-renderer
boundary without changing parsing, runtime behavior, styling, targets, or public
API.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: additive documentation only; runtime, DOM, styling,
  targets, aliases, and public API remain unchanged
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

**Does not own / non-goals**

- Output supplied by custom `heading`, `paragraph`, `code`, `blockquote`, `hr`,
  or `image` renderers; the custom component owns that replacement's structure
  and styling.
- Inline emphasis, link, inline-code, citation, or plugin output as additional
  block anatomy.
- Nested anatomy or targets owned by CodeBlock, Blockquote, List, CheckboxList,
  or Table.
- New block types, custom-renderer behavior, target names, public API, or runtime
  behavior.

## Public concepts

No new public concept is introduced. Consumer props, renderer hooks, defaults,
and usage remain documented in `Markdown.doc.mjs`.

## Behavioral and layout contract

| ID  | Candidate invariant                                                                                                                                                                                                                            | Basis                                                  | Draft review state                                     |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------ |
| FR1 | Block and inline displays render one Document root carrying the current `markdown` target. Inline display renders no block anatomy.                                                                                                            | Current source, docs, and tests                        | Verified current behavior; no new behavior decided     |
| FR2 | On the default block render path, Heading, Paragraph, List, Code block, Blockquote, Table, Divider, and Image carry the eight current local block targets documented below.                                                                    | Current source, docs, tests, and history               | Verified current inventory and placement               |
| FR3 | A supplied `heading`, `paragraph`, `code`, `blockquote`, `hr`, or safe-URL `image` renderer replaces the corresponding default part, so Markdown does not impose that part's local target on the replacement.                                  | Current source, docs, and history                      | Verified behavior; focused absence coverage is partial |
| FR4 | The released Code block target is spelled `markdown-codeblock`. Although this runs together a compound name and predates the current naming rule, it is a frozen public target and this factual backfill neither renames it nor adds an alias. | Current source, docs, tests, history, and architecture | Verified compatibility constraint; no target change    |
| FR5 | Density and Heading level remain reflected capabilities on their owning targets. Display mode, density, Heading level, streaming state, list kind, and custom-renderer selection do not become separate anatomy entries.                       | Current source, docs, tests, and architecture          | Verified current model; no new anatomy or state target |

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

### Representative states

| State                  | Required invariant                                                                                                  | Allowed variation                                          |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Default block content  | Every parsed block uses its corresponding current Markdown target.                                                  | Block count, order, density, content width, and alignment. |
| Custom block renderers | The replaced Heading, Paragraph, Code block, Blockquote, Divider, or Image lacks the corresponding Markdown target. | Replacement structure and styling.                         |
| Ordered/unordered list | List carries `markdown-list`.                                                                                       | Marker kind, start value, item count, and nested content.  |
| Task list              | The outer List part carries `markdown-list`.                                                                        | Checked values and item content.                           |
| Safe block image       | Default Image carries `markdown-image`, or a custom image renderer replaces it.                                     | Source and alternative text.                               |
| Unsafe block image URL | Markdown renders its fallback Image part with `markdown-image`; no custom image renderer receives the rejected URL. | Alternative text shown by the fallback.                    |
| Inline display         | Document carries `markdown`; no block target renders.                                                               | Inline text, links, code, citations, and plugin output.    |

### Transformation and precedence order

- No new parsing, sanitization, heading-level, renderer-selection, spacing, or
  styling precedence rule is introduced.

### Performance and resources

- No new parsing, streaming, render, or resource requirement is introduced.

## Accessibility contract

This draft does not change or extend Markdown's existing document semantics,
heading IDs, paragraph role, list semantics, scrollable Table wrapper, image
alternative text, or custom-renderer responsibilities.

## Design relationships

| Anatomy or state | Design requirement                                                               | Representation authority       | Hierarchy role | Component contract |
| ---------------- | -------------------------------------------------------------------------------- | ------------------------------ | -------------- | ------------------ |
| Document         | Contains block or inline rendered Markdown content.                              | Current source and public docs | Supporting     | FR1, FR5           |
| Heading          | Presents one parsed heading with its resolved level and optional generated ID.   | Current source and public docs | Prominent      | FR2, FR3, FR5      |
| Paragraph        | Presents one prose block using the default composition-safe paragraph structure. | Current source and public docs | Prominent      | FR2, FR3           |
| List             | Presents ordered, unordered, or task-list items as one block.                    | Current source and public docs | Prominent      | FR2, FR5           |
| Code block       | Presents fenced code and owns the outer spacing target on the default path.      | Current source and public docs | Prominent      | FR2, FR3, FR4      |
| Blockquote       | Presents quoted block content on the default path.                               | Current source and public docs | Prominent      | FR2, FR3           |
| Table            | Presents parsed rows and columns in a keyboard-scrollable block wrapper.         | Current source and public docs | Prominent      | FR2                |
| Divider          | Presents a horizontal separation between blocks.                                 | Current source and public docs | Supporting     | FR2, FR3           |
| Image            | Presents a safe block image or the fallback for a rejected image URL.            | Current source and public docs | Prominent      | FR2, FR3           |

Custom renderers replace six default parts rather than becoming nested Markdown
anatomy. Lists and Tables have no corresponding custom block renderer. The
Document remains Markdown-owned in every display mode.

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

## Family and system relationships

- `architecture:component-theming-surface` owns anatomy qualification, target
  mapping, target-capability state, composition boundaries, and compatibility for
  frozen targets.
- Nested Astryx primitives retain ownership of their own anatomy and targets;
  Markdown owns the outer block targets listed here.

## Verification map

| Contract            | Verification                                                                                           | Representative states                                        | Mutation or failure expectation                                                                                       | Audit section            |
| ------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| FR1                 | `Markdown.test.tsx` root-class, block-root, inline-root, and base-prop suites                          | Block and inline Document                                    | Removing or moving the root target fails focused root assertions or the global inventory.                             | `audit:Markdown/anatomy` |
| FR2, FR4, FR5       | `Markdown.test.tsx` block-spacing-target, density, Heading-level, task-list, and render suites         | All eight default block types, both densities, Heading level | Removing, renaming, or moving a block target fails focused class or reflected-property assertions.                    | `audit:Markdown/theming` |
| FR3                 | `Markdown.test.tsx` custom Heading and custom Image suites plus source and target-introduction history | Six replaceable default block parts                          | Imposing a target on a custom replacement violates the owner boundary; only Heading absence is directly pinned today. | `audit:Markdown/theming` |
| Theming anatomy map | `scripts/check-knowledge.mjs`                                                                          | Canonical anatomy and all nine current targets               | Missing, extra, prefixed, stale, or multiply assigned mappings fail repository validation.                            | `audit:Markdown/theming` |

Focused tests pin all nine current target names and default block placement. They
pin target absence only for a custom Heading; custom Paragraph, Code block,
Blockquote, Divider, and Image replacement paths currently rely on source and
history for the same ownership rule.

## Decision log

None. This draft records current facts and introduces no component-local design,
API, behavior, or theming decision.

## Open questions

- **OQ1 — Which focused tests should pin target absence for the five remaining
  custom block replacement paths?** (`checkable`)

## Content boundary

This file does not duplicate consumer prop tables/examples, parser mechanics,
streaming implementation, nested primitive contracts, current audit results, or
system theming rules. It links to their owners.
