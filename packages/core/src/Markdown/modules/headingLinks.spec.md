---
schema_version: 3
template_version: 2
kind: module
id: module:Markdown/headingLinks
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-10-03
owners: [cixzhang]
review_triggers: [public-api, behavior]
verified_by:
  [
    packages/core/src/Markdown/plugins/headingLinks.test.tsx,
    packages/core/src/Markdown/plugins/headingLinks.ssr.test.tsx,
    packages/core/src/Markdown/Markdown.public.test.ts,
    packages/core/src/Outline/parseOutlineFromMarkdown.test.ts,
  ]
parent_component: component:Markdown
references:
  [
    component:Markdown/DEC-2,
    module:Outline/parseOutlineFromMarkdown,
    spec:AST-002/DEC-8,
    spec:AST-036/DEC-11,
  ]
---

# Markdown heading-links identity contract

## Contract at a glance

| Area            | Contract                                                                                                                                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract | `createMarkdownHeadingLinks(options?)` returns one first-party entry exported from `@astryxdesign/core/Markdown/plugins`.                                                                                           |
| Behavior        | Installing the entry gives every rendered h1–h6 a deterministic, collision-safe ID after transforms.                                                                                                                |
| End-user impact | Documents gain stable fragment targets at every heading depth without changing heading content, semantics, or visual anatomy.                                                                                       |
| Builder impact  | Builders explicitly install one entry and may supply a stable heading namespace. The same entry keeps Markdown-derived Outline IDs aligned and root-only.                                                           |
| Compatibility   | Additive and default-off. Without this module, released Markdown/Outline heading traversal, IDs, DOM, styling, and custom heading ownership remain unchanged.                                                       |
| Review checks   | Reject default-on behavior, a Markdown prop, an Outline-only namespace, runtime IDs, module-local entry state, unvalidated lookalikes, imposed visual anatomy, product identity, or host-specific navigation logic. |

This table is a review projection; the body below is authoritative.

## Intent

Builders who publish documents should be able to opt into one portable heading
identity projection without turning document identity into a permanent Markdown prop.
This foundation owns the public factory, Unicode slugging, collision allocation, and
Markdown/Outline integration. It intentionally adds no permalink renderer or visual UI.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: additive and opt-in
- Migration decision: `spec:AST-002/DEC-8`
- Existing builders do nothing. A builder that wants all-depth heading identities
  creates one stable entry and passes it to Markdown and any Outline derivation of the
  same source.

## Ownership boundary

**Owns**

- `createMarkdownHeadingLinks()` and `MarkdownHeadingLinksOptions`.
- The stable internal plugin name and a frozen, versioned, structurally validated
  configuration carried by the opaque entry across compatible Core package copies.
- NFKC Unicode slugging, fallback, emitted-ID reservation, namespace composition,
  and all-depth post-transform projection.
- The shared IDs and labels consumed by Markdown and Markdown-derived Outline.
- The built-in renderer extension's observable copy/reveal contract: an honest
  `type="button"` shows an inline trailing `#`, copies the canonical permalink without
  navigating, scrolling, or mutating the hash, and is visually hidden at fine-pointer
  rest. The heading row owns the standard `useContainerReveal` trigger; row hover and
  focus-within reveal the mounted button; keyboard and coarse-pointer behavior follow
  that hook's accessibility contract.
- Module-focused unit, integration, SSR, and delegated renderer browser evidence.

**Does not own / non-goals**

- Markdown's generic plugin protocol, parser, transform order, default heading styles,
  or released no-plugin root-heading projection.
- Outline's root-only item selection, hook API, or memoization framework.
- A caller's custom `components.heading` DOM, styling, or accessibility.
- Permalink rendering, interaction, i18n, styles, and browser evidence belong to the
  renderer extension, which obeys the module-owned reveal contract below without
  changing this public API.
- Product-specific document identity, versioning, host URL construction, viewer
  scrolling, callbacks, or routing.

## Public API and concepts

| Concept                        | Closed values or states                            | Meaning                                                                                  | Default    | Owner                          | Stability |
| ------------------------------ | -------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------- | ------------------------------ | --------- |
| `createMarkdownHeadingLinks()` | one factory returning `MarkdownPluginEntry<never>` | Installs a portable module entry recognized by compatible Core copies.                   | absent     | `module:Markdown/headingLinks` | stable    |
| `headingIdPrefix`              | string or omitted                                  | Caller-owned stable namespace prepended as `<prefix>--<slug>`.                           | unprefixed | caller                         | stable    |
| Heading projection             | absent or installed                                | Released root-only identity when absent; module-owned all-depth identity when installed. | absent     | module                         | stable    |
| Custom heading renderer        | caller replacement                                 | Receives the generated ID at every depth and otherwise keeps complete output ownership.  | built-in   | caller                         | stable    |

## Behavioral contract

| ID  | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Basis                                      |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| FR1 | The factory and options type are exported only through the server-safe `@astryxdesign/core/Markdown/plugins` entry point. The ordinary opaque `MarkdownPluginEntry<never>` carries a frozen, versioned module configuration inside the shared structurally validated `Symbol.for` protocol envelope, so a compatible Core copy can recognize it without module-local identity or state.                                                                                                                                                                                                                                                                                                                                                                             | `spec:AST-036` FR1–FR5, DEC-11             |
| FR2 | `headingIdPrefix` accepts only a string when present and travels on the entry. It is caller-owned stable data, not derived from runtime tree position or React `useId`. Consumers recognize only the exact compatible module configuration. A valid generic same-name plugin with malformed, missing, older, or newer module data remains subject to ordinary plugin ordering but is not treated as heading links, so its configuration cannot affect IDs. A malformed generic entry follows the existing consumer fail-soft path: Markdown and Outline report the configuration failure and preserve released behavior rather than throwing during render. Direct invalid factory arguments may still throw. Another valid plugin is never treated as this module. | `spec:AST-002/DEC-8`                       |
| FR3 | After transforms, every heading at every depth participates once in document order. Labels use the canonical extension text projection. Slugs use NFKC, lowercase Unicode letters/numbers, quote removal, collapsed hyphens, and `section`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | `component:Markdown` FR13, FR16            |
| FR4 | Every emitted ID is reserved. A natural numeric suffix can never collide with or re-emit an earlier generated ID.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | module identity ownership                  |
| FR5 | Omitting the module preserves released root-heading IDs, nested-heading behavior, DOM, styles, Outline results, and custom-renderer ownership.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | `component:Markdown` FR12                  |
| FR6 | Passing the same entry to Markdown and Markdown-derived Outline shares one projection. Nested headings consume identity and collisions, while Outline continues to select root headings only.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | `module:Outline/parseOutlineFromMarkdown`  |
| FR7 | Built-in and custom headings receive the projected ID at every depth without an imposed wrapper or sibling UI.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | `component:Markdown` FR2–FR3               |
| FR8 | IDs are deterministic across synchronous SSR, hydration, multiple namespaced instances, reordering, and independent rendering.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | module identity ownership                  |
| FR9 | The public entry remains server-safe and tree-shakeable. Product identity, URL/version/scroll/callback/routing logic never enters the factory or projection.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | package export and side-effect conventions |

## Accessibility contract

- **AR1 — semantics stay intact.** The foundation changes only the `id` attribute on
  existing semantic h1–h6 output; heading role, level, content, and accessible name do
  not change.
- **AR2 — custom ownership stays intact.** A custom heading receives identity only and
  remains responsible for all anatomy, styling, and accessibility beyond the ID.
- **AR3 — the renderer extension uses the canonical reveal primitive.** Its copy
  button stays mounted, named, in the accessibility tree, and in tab order while
  visually hidden at fine-pointer rest. Hovering anywhere in the heading row or moving
  keyboard focus into it reveals the marker immediately. Coarse-pointer/touch
  visibility, reduced motion, and focus safeguards follow `useContainerReveal`; the
  module must not add a parallel media-query, marker, token, or public reveal API.

## Copy-button reveal extension contract

The renderer extension spreads
`useContainerReveal().getContainerProps()` on the built-in heading row (the reveal
owner) and `getContentRevealProps({isLayoutPreserved: true})` on its honest sibling
`type="button"`. This produces the exact observable states: hidden at fine-pointer
rest; visible when any part of the heading row is hovered; visible when the button or
another row descendant owns focus; keyboard reachable without `display: none` or
`visibility`; and visible on coarse/touch input under the hook's existing supported
semantics. The in-flow control box has the computed block-size of its adjacent heading
line, so it never raises the heading line-height or changes wrapping. One stable logical
inline slot at the final visual line end keeps heading text, the control, and adjacent
controls disjoint in either direction; reveal and the `#`/check swap change no row
geometry or spacing. On coarse input, the interactive and focus geometry meets the
24px AA target minimum, centered on that line-height box through overflow-visible
internal geometry rather than block-size in flow. The extension remains unclipped and cannot overlap or
steal input from heading text, neighboring controls, or preceding/following lines.
Pointer activation does not paint a keyboard focus-visible ring; keyboard focus paints
exactly one canonical, unclipped Astryx ring.

Unmodified click, tap, Enter, or Space copies the canonical absolute permalink and
never navigates, scrolls, or mutates the current hash. The heading ID remains the
incoming fragment target. Success replaces `#` with Astryx's check icon for 1.5
seconds and announces localized `Link copied` once through the canonical polite live
region; failure stays silent and leaves `#` unchanged. Modified/non-primary pointer
activation does not copy, and the button exposes no anchor, open-in-new-tab, or link
context-menu semantics. Custom headings remain outside this renderer contract.

## Design relationships

| State              | Design requirement                                                              | Representation authority    | Module contract |
| ------------------ | ------------------------------------------------------------------------------- | --------------------------- | --------------- |
| Built-in heading   | Preserve existing anatomy and styles while adding the projected `id`.           | Current source and Markdown | FR5, FR7        |
| Custom heading     | Forward the projected `id` without wrapping or adding sibling presentation.     | Caller                      | FR7             |
| No-plugin Markdown | Preserve released root-only identity and nested-heading behavior byte-for-byte. | Current source and Markdown | FR5             |

The foundation adds no visual part, private layout, theme target, i18n message, or
interaction state.

## Parent and system relationships

- `component:Markdown` owns the generic plugin seam, transformed tree, built-in
  heading part, default no-plugin projection, and custom-renderer replacement seam.
- `module:Outline/parseOutlineFromMarkdown` owns root-only item selection and consumes
  this module's projection only when the same entry is installed.
- `spec:AST-036` owns the opaque plugin protocol; this first-party module uses it
  without a privileged public capability.
- `spec:AST-002/DEC-8` admits this factory instead of a broad Markdown prop because
  installation and namespace are caller decisions Astryx cannot derive.

## Implementation plan and boundaries

1. Keep the server-safe factory and identity projection in
   `plugins/headingLinks.ts`; carry normalized module configuration inside the shared
   portable plugin envelope, and export only the factory and options type from
   `plugins/index.ts`.
2. Let Markdown's existing built-in and custom heading paths consume the projected ID
   without visual composition. Keep the default path unchanged.
3. Keep identity tests, SSR proof, and Outline integration named and located with the
   module; keep generic/no-plugin tests in Markdown and root selection in Outline.

## Verification map

| Contract   | Verification                                                                                             | Representative states                                                                                                                                                                      | Failure expectation                                                                                                                                             |
| ---------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR1–FR4    | `plugins/headingLinks.test.tsx`, core typecheck, export/package checks                                   | public entry/type, duplicate Core copies, lookalike/malformed/other plugins, h1–h6, Unicode, empty label, suffix collisions                                                                | Export drift, lost options, false recognition, unstable slug, duplicate ID, or non-server-safe construction fails.                                              |
| FR5–FR7    | module tests plus Markdown and Outline integration tests                                                 | omitted/installed plugin, root/nested, custom heading, namespace, root ID                                                                                                                  | Default behavior changes, custom output is wrapped, or Markdown/Outline IDs diverge.                                                                            |
| FR8–FR9    | `plugins/headingLinks.ssr.test.tsx`, package checks, plus delegated renderer Storybook/Chromium evidence | duplicate Core copy, two namespaces, SSR/hydration, honest button, no navigation/hash/scroll, copy/check/announcement, hidden rest, row hover, keyboard focus, coarse/touch hook semantics | IDs/options drift, hydration recovers, construction imports a client boundary, the control fakes link semantics, or the renderer bypasses `useContainerReveal`. |
| Repository | formatting, ESLint, knowledge/sync, Changeset validation, core typecheck, focused tests, pre-commit      | module files, Markdown/Outline seams, docs/specs                                                                                                                                           | Stale authority, duplicate ownership, type/lint failure, or unrelated diff blocks.                                                                              |

## Decision log

### DEC-1 — Ship one first-party plugin factory

**Reference:** `module:Markdown/headingLinks/DEC-1`
**Decider:** `cixzhang`, `2026-10-03`

One factory preserves the opaque plugin list while exposing only installation and an
optional stable namespace. Its configuration rides the existing portable, versioned
plugin envelope rather than a creating module's WeakMap or object identity, so duplicate
compatible Core copies agree. A broad Markdown prop or separate Outline option would
make one projection into permanent parallel API and could drift across surfaces.

Compatible duplicate copies consume the exact envelope. A valid generic same-name plugin
with absent or incompatible module data stays an ordinary plugin in the caller's declared
order, but never gains this module's ID projection. A malformed generic envelope follows
the existing consumer fail-soft path, so Markdown and Outline preserve released behavior
instead of throwing during render. Invalid direct factory arguments remain programmer
errors.

Rejected: module-local option state; elevating same-name lookalikes into this module;
render-time crashes for package-version skew; default-on behavior; a Markdown boolean or
namespace prop; a separate Outline identity option; product-specific factory options.

### DEC-2 — Own one all-depth identity projection

**Reference:** `module:Markdown/headingLinks/DEC-2`
**Decider:** `cixzhang`, `2026-10-03`

Every transformed heading participates depth-first so rendered targets and root
Outline entries share one collision sequence. NFKC Unicode slugging and emitted-ID
reservation produce durable readable fragments. Caller namespace is stable data;
runtime tree position and `useId` are not.

Rejected: root-only plugin allocation; separate Markdown/Outline sluggers; ASCII-only
slugs; collision counting that can re-emit a natural numeric suffix; runtime IDs.

### DEC-3 — The renderer extension is an honest revealed copy button

**Reference:** `module:Markdown/headingLinks/DEC-3`
**Decider:** `cixzhang`, `2026-10-03`

The renderer extension uses an inline trailing `#` sibling with baseline/logical
spacing, secondary color, and inherited typography. Its primary action is copy, so it is
a real button rather than an anchor that suppresses navigation. `useContainerReveal`
owns fine-pointer rest, heading-row hover, focus-within, coarse/touch, and motion
semantics. The heading ID remains the incoming fragment target.

Rejected: native fragment navigation; a copy-plus-navigation anchor hybrid; bespoke
reveal media logic; product routing; a new public reveal API.

## Content boundary

The module reads only transformed heading nodes and the caller-supplied configuration
carried by the validated plugin entry for the current document invocation. It does not
persist document content, labels, options, or generated IDs in module-local state.

## Open questions

None.
