---
schema_version: 3
template_version: 1
kind: module
id: module:Outline/parseOutlineFromMarkdown
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-09-15
owners: [cixzhang]
review_triggers: [public-api, behavior]
verified_by: [packages/core/src/Outline/parseOutlineFromMarkdown.test.ts]
parent_component: component:Outline
references:
  [architecture:public-component-api, component:Markdown, spec:AST-036]
---

# parseOutlineFromMarkdown module contract

## Intent

`parseOutlineFromMarkdown` and `useOutlineFromMarkdown` derive same-document
heading navigation from the same Markdown parse configuration, ordered immutable
transforms, text projection, and collision allocator used by the rendered document.
This focused module owns that utility behavior without deciding the draft Outline
component's anatomy or theming.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: additive parser options; calls without plugins preserve
  released labels, levels, IDs, and return types
- Migration decision: `spec:AST-036`

## Ownership boundary

**Owns**

- Deriving ordered `OutlineItem` values from Markdown headings.
- Accepting the same parser-affecting options and ordered plugin list as Markdown.
- Applying the same validated immutable transforms before selecting headings.
- Using the same extension text projection and collision-safe slug allocation as
  Markdown heading rendering.

**Does not own / non-goals**

- Outline component structure, active state, targets, layout, or theming.
- Plugin rendering, block-extension navigation entries, or renderer-derived text.
- A second parser, plugin registry, or independent heading-ID policy.

## Public API and concepts

`parseOutlineFromMarkdown(source, options?)` performs direct derivation.
`useOutlineFromMarkdown(source, options?)` memoizes the same derivation for React
callers. `options.plugins` uses the canonical opaque Markdown plugin entries. The
same ordered transforms run before heading selection; inline extension-node `toText`
projections then contribute to heading labels and IDs.

## Behavioral contract

| ID  | Invariant                                                                                                                                                             | Basis                          | Acceptance and implementation state |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ----------------------------------- |
| FR1 | Both utilities accept the same Markdown parser options and ordered plugin list as the rendered Markdown document.                                                     | `spec:AST-036` FR13, FR16      | pending implementation              |
| FR2 | Both utilities apply the same validated immutable transforms before selecting headings, without allowing renderer output to affect identity.                          | `spec:AST-036` FR13, FR16      | pending implementation              |
| FR3 | Plugin-enabled labels and IDs use the same extension `toText` projection, slugger, and cross-base collision allocator as Markdown, producing unique matching targets. | `spec:AST-036` FR16            | pending implementation              |
| FR4 | Block extension nodes do not independently create Outline entries unless a later current owner contract permits it.                                                   | `spec:AST-036` FR16            | pending implementation              |
| FR5 | Omitting plugins and passing an empty list preserve released heading selection, labels, levels, IDs, return type, and memoization behavior.                           | `spec:AST-036` FR2             | pending implementation              |
| FR6 | The hook memoizes against source and every parse-affecting or transform-affecting option so changed configuration cannot return stale headings.                       | `component:Markdown` FR15–FR16 | pending implementation              |

### Transformation and precedence order

Markdown parse configuration → ordered immutable transforms → heading nodes →
shared perceivable-text projection → shared slug normalization → document-order
collision allocation → Outline items.

### Performance and resources

- The hook recomputes only when source or parser/transform configuration changes.
- Renderer output does not enter heading identity.
- No DOM, renderer mount, registry, Remark runtime, or optional plugin resource is
  required.

## Accessibility contract

Each derived label is the same perceivable heading text used for Markdown identity,
and each derived ID targets the matching rendered heading. This module adds no
interaction or ARIA behavior; the Outline component owns navigation presentation.

## Design relationships

No visual representation is owned by this parser utility.

## Parent and system relationships

- `component:Markdown` owns aggregate parsing, heading rendering, and the shared
  projection/collision rules.
- `spec:AST-036` owns the canonical plugin protocol and cross-surface parity.
- Draft `component:Outline` owns presentation only after its separate anatomy and
  theming decisions become current.

## Verification map

| Contract | Verification                                                            | Representative states                                                                                 | Mutation or failure expectation                                                                           |
| -------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| FR1–FR6  | Outline parser tests, plugin transform parity tests, and Core typecheck | transformed, formatted, and extension headings; duplicate and cross-base slugs; omitted/empty plugins | A transform is skipped, a label/ID diverges from Markdown, duplicates survive, or default output changes. |

## Decision log

### DEC-1 — Markdown owns heading identity; Outline projects it

**Reference:** `module:Outline/parseOutlineFromMarkdown/DEC-1`
**Decider:** cixzhang, 2026-09-15

Outline utilities consume Markdown's parse configuration, ordered transforms, text
projection, and collision allocator rather than defining a second heading-identity
system. This keeps labels and link targets aligned without coupling plugin renderer
output to navigation identity.

## Open questions

None.

## Content boundary

This file does not duplicate plugin protocol details, Markdown parser mechanics,
consumer examples, or the draft Outline component's anatomy and theming contract.
