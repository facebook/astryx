---
schema_version: 3
template_version: 1
kind: module
id: module:Markdown/createMarkdownMermaidPlugin
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers:
  [public-api, behavior, layout, theming, accessibility, performance]
verified_by: [scripts/check-knowledge.mjs]
parent_component: component:Markdown
references:
  [
    architecture:public-component-api,
    architecture:react-component-runtime,
    architecture:component-test-sufficiency,
    spec:AST-036/DEC-1,
    spec:AST-036/DEC-2,
    spec:AST-036/DEC-3,
  ]
---

# createMarkdownMermaidPlugin module contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `createMarkdownMermaidPlugin(options)` returns one Markdown plugin claiming only normalized `mermaid` fences through the shared `fences` capability. It is colocated under Markdown and re-exported through Markdown/Core; no separate package or registry exists.                                                                                                                                                                                                                                                                                                      |
| Behavior                | Final, valid Mermaid source lazy-loads the runtime and renders an Astryx-themed diagram in a bounded local viewport. Disabled, streaming, invalid, oversized, unsupported-mode, load-failed, or render-failed input uses Core's ordinary copyable CodeBlock fallback.                                                                                                                                                                                                                                                                                                   |
| End-user impact         | Readers get accessible themed diagrams, visible zoom/fit/reset controls, touch/pan support, and full-size inspection without page overflow or loss of source/copy access.                                                                                                                                                                                                                                                                                                                                                                                               |
| Builder impact          | Builders opt in by creating/importing one plugin and passing it through `plugins`; they may provide accessible naming/configuration but do not manage Mermaid loading, fallback, theming, or viewport mechanics.                                                                                                                                                                                                                                                                                                                                                        |
| Compatibility/readiness | Draft and unimplemented. Plugin-free Markdown, non-Mermaid fences, unfinalized Mermaid fences, default CodeBlock highlighting, and `components.code` precedence remain unchanged. Browser, bundle, failure, theming, and interaction evidence is pending.                                                                                                                                                                                                                                                                                                               |
| Review checks           | Reject eager Mermaid loading, non-final streaming renders, source execution, a non-copyable failure state, page-level overflow, inaccessible/missing viewport controls, trapped page scroll, zoom reset on unrelated rerender, raw injected SVG/HTML, or a separate Mermaid package.                                                                                                                                                                                                                                                                                    |
| Governing rules         | [`component:Markdown`](../../Markdown.spec.md); [`spec:AST-036`](../../../../../../docs/specs/AST-036/spec.md); [`architecture:public-component-api`](../../../../../../docs/architecture/public-component-api.md); [AST-002 FR2 — Derivable differences stay internal](../../../../../../docs/specs/AST-002/spec.md); [AST-002 FR10 — Every supported state is independently correct](../../../../../../docs/specs/AST-002/spec.md); [AST-002 FR17 — Public module and utility function names disclose one atomic role](../../../../../../docs/specs/AST-002/spec.md). |

This table is a review projection; the body below is authoritative.

## Intent

`createMarkdownMermaidPlugin` is the first concrete Astryx-authored fence plugin. It
turns finalized `mermaid` fences into accessible Astryx-themed diagrams while
preserving ordinary Markdown, CodeBlock highlighting, source access, and a reliable
fallback in every non-success state.

Consumer signatures, option reference, and usage examples belong in the eventual
`createMarkdownMermaidPlugin.doc.mjs`; this draft owns behavior and evidence only.

## Compatibility and migration

- Released default preserved: `yes`; the module is opt-in.
- Compatibility class: additive colocated module under the shared AST-036 protocol.
- Migration decision: none; generic code highlighting stays with CodeBlock.
- Package decision: export through Markdown/Core, not a separate Astryx package.

## Ownership boundary

**Owns**

- The `createMarkdownMermaidPlugin` factory and normalized `mermaid` fence claim.
- Final-only validation, lazy runtime loading, safe React/SVG rendering, Astryx
  theming, accessible text, local error handling, and ordinary-code fallback.
- Large-diagram viewport, zoom/pan/fit/reset state, full-size inspection, source/copy
  access, and module-specific performance/browser evidence.

**Does not own / non-goals**

- Shared plugin ordering, collision, `apiVersion`, syntax-only `parseKey` rules,
  fence input/result, Core fallback, or error-boundary protocol — owned by
  `spec:AST-036`.
- Generic code syntax highlighting or default CodeBlock presentation.
- Arbitrary fence languages, charts, interactive diffs, raw HTML/SVG injection, or
  source-selected code/runtime configuration.
- A separate package, registry, or global Mermaid configuration.

## Public API and concepts

| Concept     | States                             | Meaning                                                                     | Default                            |
| ----------- | ---------------------------------- | --------------------------------------------------------------------------- | ---------------------------------- |
| Fence claim | normalized `mermaid` only          | Selects this semantic renderer after built-in/`components.code` precedence. | No claim for any other language.   |
| Completion  | final or streaming                 | Only final source may start Mermaid validation/rendering.                   | Streaming uses fallback.           |
| Viewport    | fit, user-zoomed/panned, full-size | Keeps large diagrams inspectable without page overflow.                     | Fit within bounded local viewport. |
| Runtime     | unloaded, loading, ready, failed   | Heavy Mermaid code is loaded only for a valid finalized claimed fence.      | Unloaded.                          |
| Fallback    | ordinary CodeBlock                 | Preserves exact source and copy access for every non-success state.         | Core-owned.                        |

## Behavioral contract

| ID   | Invariant                                                                                                                                                                                                                                                            | Evidence state                   |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| FR1  | The factory returns one shared-protocol plugin named for Mermaid, claims only normalized `mermaid`, and is exported from Markdown/Core.                                                                                                                              | Type/export evidence pending.    |
| FR2  | Plugin-free Markdown, non-Mermaid fences, and unfinalized Mermaid fences do not import, initialize, or request the Mermaid runtime.                                                                                                                                  | Bundle/runtime evidence pending. |
| FR3  | Disabled, streaming, invalid, oversized, unsupported-mode, load-failed, render-failed, and rejected source renders Core's exact ordinary copyable CodeBlock fallback; sibling Markdown continues.                                                                    | Failure matrix pending.          |
| FR4  | Final accepted source is inert data. Source cannot choose modules/configuration or execute code. Validation is size/time bounded before lazy loading. Generated output is safe React/SVG; raw generated markup is never injected merely because Mermaid returned it. | Security evidence pending.       |
| FR5  | Diagram colors, typography, borders, surfaces, focus, and controls use Astryx semantic tokens and remain perceivable in light, dark, high contrast, and forced colors.                                                                                               | Theme/browser evidence pending.  |
| FR6  | The diagram has an accessible name and description or equivalent perceivable text representation. Source/fallback remains available for reading and copying. Meaning does not depend on color alone.                                                                 | Axe/AT evidence pending.         |
| FR7  | A valid large diagram stays inside a bounded local viewport; it never creates page-level horizontal overflow. Visible accessibly named zoom-in, zoom-out, and fit/reset controls are keyboard operable.                                                              | Browser evidence pending.        |
| FR8  | Touch/pinch/pan works where supported without trapping ordinary page scroll. A full-size view is explicitly available for detailed inspection and has operable entry/exit/focus behavior.                                                                            | Mobile/browser evidence pending. |
| FR9  | Zoom/pan state is keyed to the finalized fence identity and survives unrelated Markdown rerenders and settled-prefix updates. Source or semantic identity change resets state intentionally; live theme changes do not.                                              | State/remount evidence pending.  |
| FR10 | `components.code` retains its released all-fence precedence. Removing it exposes the shared plugin chain; disabling/removing this plugin restores default CodeBlock behavior without migration.                                                                      | Compatibility evidence pending.  |

### Performance and resources

- The Mermaid runtime is absent from plugin-free, non-Mermaid, and unfinalized paths.
- Validation completes within the module's documented size/time bound before load.
- Lazy-load and render failure are cached only as appropriate to the runtime identity;
  a transient failure does not corrupt Markdown or permanently hide source.
- Unrelated Markdown updates do not recreate the runtime, remount a settled diagram,
  or reset viewport state.

## Accessibility contract

- Controls use visible labels/icons with accessible names and logical direction.
- Keyboard users can reach controls, pan/inspect without a pointer, enter/exit the
  full-size view, and return focus intentionally.
- Touch gestures do not suppress normal page scrolling outside an active intentional
  diagram gesture.
- Reduced-motion behavior avoids unnecessary animated zoom/pan transitions.
- At 200% page zoom and narrow widths, controls and source access remain reachable.

## Design relationships

| Anatomy or state | Design requirement                                                                 | Representation authority                  | Module contract |
| ---------------- | ---------------------------------------------------------------------------------- | ----------------------------------------- | --------------- |
| Diagram viewport | Contains large output locally without page overflow.                               | This module                               | FR7–FR9         |
| Diagram controls | Visible zoom/fit/reset and full-size inspection remain operable across modalities. | This module with shared controls          | FR7–FR8         |
| Diagram content  | Uses Astryx tokens and carries accessible text meaning.                            | This module; active theme supplies values | FR4–FR6         |
| Fallback         | Preserves exact source in ordinary CodeBlock.                                      | `component:Markdown` / AST-036            | FR2–FR3, FR10   |

No direct Markdown theme target or public width/zoom prop is introduced by this
draft. Any future direct target follows the normal theming admission process.

## Parent and system relationships

- `component:Markdown` owns the document and built-in CodeBlock boundary.
- `spec:AST-036` owns fence ordering, input, mode, fallback, error isolation,
  identity, indexing, and external plugin compatibility.
- This module owns only Mermaid behavior after its fence claim wins.

## Verification map

| Contract    | Required evidence                                                         | Representative states                                                                                                                    | Failure signal                                                                                        |
| ----------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| FR1, FR10   | Public export/type and precedence tests                                   | plugin absent/present; `components.code`; other language; removal                                                                        | A separate package appears, wrong fence is claimed, or existing override/default changes.             |
| FR2–FR4     | Bundle/load instrumentation and failure/security matrix                   | plugin-free; other fence; streaming/final; disabled; invalid/oversized; load/render failure; script-like source                          | Mermaid loads early, source executes, failure removes source, or sibling Markdown breaks.             |
| FR5–FR6     | Real-browser theme, forced-colors, axe, and assistive-technology evidence | light/dark; forced colors; high contrast; textual and visual diagram                                                                     | Output becomes unreadable, unnamed, color-only, or source/copy access disappears.                     |
| FR7–FR9     | Real-browser interaction/state suite                                      | small/large; narrow/desktop; 200% zoom; RTL; keyboard; touch/pinch/pan/page scroll; full-size; unrelated rerender; settled-prefix update | Page overflows, controls fail, page scroll traps, full-size/focus fails, or zoom resets unexpectedly. |
| Performance | Bundle, load, allocation, remount, validation, and render budgets         | no plugin; non-Mermaid; unfinalized/final; repeated settled rerender                                                                     | Heavy runtime enters a free path, work exceeds module budget, or settled diagrams remount.            |
| Structural  | `pnpm check:knowledge` and parent backlink                                | colocated module and canonical public name                                                                                               | Module is orphaned, misnamed, or duplicated.                                                          |

## Decision log

### DEC-1 — Mermaid is a colocated finalized-fence enhancement

**Reference:** `module:Markdown/createMarkdownMermaidPlugin/DEC-1`
**Direction owner:** `cixzhang`, `2026-09-13`; exact-head approval pending

The first concrete fence module is exported through Markdown/Core, lazy-loads only
for a valid finalized `mermaid` fence, and otherwise preserves ordinary code.

Rejected: a separate package, eager/global Mermaid runtime, source-selected code,
or replacing generic CodeBlock highlighting.

### DEC-2 — Large diagrams own a local viewport

**Reference:** `module:Markdown/createMarkdownMermaidPlugin/DEC-2`
**Direction owner:** `cixzhang`, `2026-09-13`; exact-head approval pending

The module provides bounded local inspection with accessible zoom/fit/reset,
touch/pan where supported, and full-size view while preserving page scroll and
viewport state across unrelated Markdown updates.

Rejected: page-level overflow, controls delegated to every host, pointer-only
inspection, or resetting zoom on ordinary rerenders.

## Open questions

None. The module remains draft and unimplemented pending exact-head approval.

## Content boundary

This record does not duplicate shared fence protocol/types, consumer option tables,
or implementation architecture. Those remain with AST-036, the eventual `.doc.mjs`,
and implementation evidence.
