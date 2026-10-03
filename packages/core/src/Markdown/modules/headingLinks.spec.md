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
review_triggers: [public-api, behavior, accessibility, layout]
verified_by:
  [
    packages/core/src/Markdown/plugins/headingLinks.test.tsx,
    packages/core/src/Markdown/plugins/headingLinks.ssr.test.tsx,
    packages/core/src/Markdown/Markdown.public.test.ts,
    packages/core/src/Markdown/plugins/headingLinks.a11y.chromium.spec.ts,
    packages/core/src/Outline/parseOutlineFromMarkdown.test.ts,
    apps/storybook/stories/MarkdownHeadingLinks.stories.tsx,
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

# Markdown heading-links module contract

## Contract at a glance

| Area            | Contract                                                                                                                                                                                                                                                                                                                                |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract | `createMarkdownHeadingLinks(options?)` returns one durable first-party entry exported from `@astryxdesign/core/Markdown/plugins`.                                                                                                                                                                                                       |
| Behavior        | Installing the entry gives every rendered h1–h6 a deterministic collision-safe ID and gives each built-in heading an inline trailing `#` copy button.                                                                                                                                                                                   |
| End-user impact | Readers can copy a durable heading URL with immediate confirmation without changing the current hash, scroll position, or page; incoming fragment URLs still target the heading ID.                                                                                                                                                     |
| Builder impact  | Builders explicitly install one entry and may supply a stable heading namespace and safe URL base. The same entry keeps Markdown-derived Outline IDs aligned while Outline selection stays root-only.                                                                                                                                   |
| Compatibility   | Additive and default-off. Without this module, released Markdown/Outline heading traversal, IDs, DOM, styling, and custom heading ownership remain unchanged.                                                                                                                                                                           |
| Review checks   | Reject default-on behavior, a Markdown prop, an Outline-only namespace, runtime IDs, module-local entry state, unvalidated lookalikes, an anchor or fake link for the copy action, bespoke reveal media logic, product URL/version/scroll/callback logic, imposed custom-renderer anatomy, or a button hidden from required modalities. |
| Governing rules | [`component:Markdown` FR12–FR16](../Markdown.spec.md); [`module:Outline/parseOutlineFromMarkdown`](../../Outline/modules/parseOutlineFromMarkdown.spec.md); [`spec:AST-002` DEC-8](../../../../../docs/specs/AST-002/spec.md); [`spec:AST-036` DEC-11](../../../../../docs/specs/AST-036/spec.md).                                      |

This table is a review projection; the body below is authoritative.

## Intent

Builders who publish documents should be able to opt into portable, durable heading
links without turning product identity or navigation policy into a permanent Markdown
prop. The module owns one complete first-party composition: identity projection,
permalink copy-button rendering, interaction behavior, localization, and cross-surface
evidence.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: additive and opt-in
- Migration decision: `spec:AST-002/DEC-8`
- Existing builders do nothing. A builder that wants linkable headings creates one
  stable entry and passes it to Markdown and any Outline derivation of the same source.

## Ownership boundary

**Owns**

- `createMarkdownHeadingLinks()` and `MarkdownHeadingLinksOptions`.
- The stable internal plugin name and a frozen, versioned, structurally validated
  configuration carried by the opaque entry across compatible Core package copies.
- NFKC Unicode slugging, fallback, emitted-ID reservation, namespace composition,
  and all-depth post-transform projection.
- Safe permalink-base handling and canonical copy-URL construction.
- The built-in sibling copy-button renderer, `useContainerReveal` composition, i18n
  keys/catalog messages, interaction styles, RTL/theme/motion behavior, Storybook
  example, SSR proof, and browser receipt.
- Module-focused unit, integration, and browser tests.

**Does not own / non-goals**

- Markdown's generic plugin protocol, parser, transform order, default heading styles,
  or released no-plugin root-heading projection.
- Outline's root-only item selection, hook API, or memoization framework.
- A caller's custom `components.heading` DOM, styling, accessibility, or permalink UI.
- Product-specific document identity, versioning, host URL construction, viewer
  scrolling, Outline callbacks, or product routing.

## Public API and concepts

| Concept                        | Closed values or states                            | Meaning                                                                                                    | Default                | Owner                          | Stability |
| ------------------------------ | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------- | ------------------------------ | --------- |
| `createMarkdownHeadingLinks()` | one factory returning `MarkdownPluginEntry<never>` | Installs a portable module entry recognized by compatible Core copies.                                     | absent                 | `module:Markdown/headingLinks` | stable    |
| `headingIdPrefix`              | string or omitted                                  | Caller-owned stable namespace prepended as `<prefix>--<slug>`.                                             | unprefixed             | caller                         | stable    |
| `permalinkBaseUrl`             | safe navigation URL or omitted                     | Caller-owned URL base whose existing fragment is replaced by the generated fragment.                       | same-document fragment | caller                         | stable    |
| Heading projection             | absent or installed                                | Released root-only identity when absent; module-owned all-depth identity when installed.                   | absent                 | module                         | stable    |
| Built-in copy control          | honest sibling `type="button"`                     | Shows `#`; unmodified activation copies the canonical URL without navigation, then shows a check for 1.5s. | absent                 | module                         | stable    |
| Custom heading renderer        | caller replacement                                 | Receives the generated ID at every depth but receives no wrapper or permalink from the module.             | built-in heading       | caller                         | stable    |

## Behavioral contract

| ID   | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Basis                                      |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------ |
| FR1  | The factory and options type are exported only through the established server-safe `@astryxdesign/core/Markdown/plugins` entry point. The ordinary opaque `MarkdownPluginEntry<never>` carries a frozen, versioned module configuration inside the shared structurally validated `Symbol.for` protocol envelope, so compatible Core copies recognize identical options without module-local identity or state.                                                                                                                                                                                                                                                                                                                                                           | `spec:AST-036` FR1–FR5, DEC-11             |
| FR2  | `headingIdPrefix` and `permalinkBaseUrl` accept strings only and travel on the entry. The URL base uses Markdown's navigation sanitizer, rejects unsafe destinations, and drops any existing fragment. Consumers recognize only the exact compatible module configuration. A valid generic same-name plugin with malformed, missing, older, or newer module data remains subject to ordinary plugin ordering but is not treated as heading links. A malformed generic entry follows the existing Markdown/Outline fail-soft path instead of throwing during render. Direct invalid factory arguments may still throw. Another valid plugin is never treated as this module.                                                                                              | `family:navigation-destinations`           |
| FR3  | After transforms, every heading at every depth participates once in document order. Labels use the canonical extension text projection. Slugs use NFKC, lowercase Unicode letters/numbers, quote removal, collapsed hyphens, and `section` fallback; every emitted ID is reserved against suffix collisions.                                                                                                                                                                                                                                                                                                                                                                                                                                                             | `component:Markdown` FR13, FR16            |
| FR4  | Omitting the module preserves released root-heading IDs, nested-heading behavior, DOM, styles, Outline results, and custom-renderer ownership, and emits no permalink UI.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | `component:Markdown` FR12                  |
| FR5  | Passing the same entry to Markdown and Markdown-derived Outline shares the module projection. Nested headings consume identity and collisions but Outline continues to return root headings only. A namespace change invalidates the hook result through the existing plugin-list dependency.                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | `module:Outline/parseOutlineFromMarkdown`  |
| FR6  | A built-in heading remains one semantic h1–h6 and gains one honest sibling `type="button"`; authored links remain inside the heading and no fragment anchor is emitted. A custom heading receives the generated ID at every depth and no imposed wrapper or copy control.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | `component:Markdown` FR2–FR3               |
| FR7  | Unmodified click, tap, Enter, or Space copies the canonical absolute permalink and never navigates, scrolls, or mutates the current hash. The heading ID remains the incoming fragment target. Modified/non-primary pointer activation does not copy. Clipboard API failure stays silent.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | module interaction ownership               |
| FR8  | The heading row is the canonical `useContainerReveal` owner and the button uses its layout-preserved content props: hidden at fine-pointer rest; visible on row hover and focus-within; mounted, named, and keyboard reachable throughout; coarse/touch, forced-colors, and reduced-motion behavior follows the hook without bespoke media queries. The in-flow control box equals the adjacent heading line-height and never changes row height or wrapping. One stable logical-end slot prevents text/control overlap and state-swap shift. On coarse input, overflow-visible hit/focus geometry meets the 24px AA minimum without overlapping adjacent content. Pointer activation paints no keyboard focus ring; keyboard focus paints one canonical unclipped ring. | module accessibility and layout ownership  |
| FR9  | IDs and canonical copy URLs are deterministic across synchronous SSR, hydration, multiple namespaced instances, reordering, and independent rendering; runtime tree position and React `useId` are never identity inputs.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | module identity ownership                  |
| FR10 | The public plugin entry remains server-safe and tree-shakeable. Its client renderer and StyleX side effects are internal to Markdown rendering and are not re-exported from the plugin construction entry point.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | package export and side-effect conventions |
| FR11 | Product identity, versioning, scrolling, callbacks, routing, and host-specific URL construction never enter the factory, projection, renderer, docs, story, or evidence.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | module ownership boundary                  |

### Activation contract

- **Honest control:** The inline trailing `#` is a `type="button"`, not an anchor.
  It has no `href`, does not use `LinkProvider` or Markdown `onLinkClick`, and exposes
  no open-in-new-tab or link context-menu promise. The semantic heading keeps the ID
  and remains the valid target for incoming fragment URLs.
- **Unmodified activation:** Pointer click, tap, keyboard Enter, or Space attempts to
  copy the canonical absolute permalink URL. It never navigates, scrolls, reloads, or
  mutates the current hash. Success replaces `#` with Astryx's check icon for exactly
  1.5 seconds in fixed inline space, then restores it.
- **Modified/failure/lifecycle:** Modified and non-primary pointer activation does not
  copy. Clipboard absence or rejection is handled silently: `#` remains and no success
  is announced. Each button owns at most one restartable feedback timer and clears it
  on unmount or re-activation.

## Accessibility contract

- **AR1 — heading semantics stay intact.** The button is a sibling, so the h1–h6
  role and accessible name exclude the visible `#` and authored heading links remain
  valid.
- **AR2 — the action and confirmation are named.** In its resting state the button
  uses the public module i18n message `Copy link to {heading}`, falling back to the
  generated ID when the label has no perceivable slug text. After a successful copy
  its accessible name becomes localized `Link copied`, announced exactly once through
  Astryx's canonical polite live region, then returns with the visual `#`; failures
  produce no success announcement.
- **AR3 — the affordance uses the canonical reveal primitive.** It remains mounted,
  named, and in tab order while visually hidden at fine-pointer rest. Hover anywhere
  in the heading row and focus-within reveal it immediately. Coarse/touch visibility,
  forced-colors focus safeguards, and reduced motion follow `useContainerReveal`.
  The module adds no bespoke reveal media query, marker, token, or public API.

## Design relationships

| Anatomy or state | Design requirement                                                                                                                                                             | Representation authority                              | Hierarchy role | Module contract |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------- | -------------- | --------------- |
| Heading row      | Keeps the semantic heading and sibling copy button aligned and owns the standard reveal trigger.                                                                               | Current source, `useContainerReveal`, module contract | Supporting     | FR6, FR8        |
| Copy button      | Reuses Button semantics/focus treatment; its inline trailing `#`/check aligns within the heading line box, while overflow-visible coarse hit geometry meets the 24px AA floor. | Button contract plus this module                      | Supporting     | FR6–FR8         |

The module adds no Markdown-local theme target. The button carries Button's existing
target; the row is private layout. Custom heading output is outside this anatomy.

## Parent and system relationships

- `component:Markdown` owns the generic plugin seam, transformed tree, built-in
  heading part, default no-plugin projection, and custom-renderer replacement seam.
  It contains one narrow integration reference to this module and no duplicate
  heading-links behavior clauses.
- `module:Outline/parseOutlineFromMarkdown` owns root-only item selection and consumes
  this module's projection only when the same entry is installed.
- `spec:AST-036` owns the public opaque plugin protocol and the rule that first-party
  modules use it without a privileged public capability.
- `spec:AST-002/DEC-8` admits this factory instead of a broad Markdown prop because
  installation, namespace, and URL base are caller decisions Astryx cannot derive.
- `family:navigation-destinations` owns URL accept/block policy; this module owns
  sanitizing the optional base and copying the resulting canonical URL.

## Implementation plan and boundaries

1. Keep the server-safe factory and projection in `plugins/headingLinks.ts`; carry
   normalized module configuration inside the shared portable plugin envelope, and
   export only the factory and options type from `plugins/index.ts`.
2. Keep rendering and StyleX in private module files under `plugins/`; compose the
   heading row and button through `useContainerReveal` rather than module-local reveal
   media logic. Markdown's built-in heading path invokes that renderer only when the
   projection supplies a canonical permalink URL. The default and custom-renderer
   paths stay unchanged.
3. Keep module tests, SSR proof, Storybook example, and Playwright evidence named and
   located with the module. Keep only no-plugin/generic seam tests in Markdown and
   root-selection integration tests in Outline.

## Verification map

| Contract   | Verification                                                                                                                   | Representative states                                                                                                                                                                                            | Failure expectation                                                                                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR1–FR3    | `plugins/headingLinks.test.tsx`, core typecheck, export/package checks                                                         | public entry/type, duplicate Core copies, lookalike/malformed/other plugins, h1–h6, root/nested, Unicode, empty label, suffix collisions, valid/invalid URL base                                                 | Export drift, lost options, false recognition, unsafe URL, unstable slug, duplicate ID, or non-server-safe construction fails.                                          |
| FR4–FR7    | module tests plus Markdown and Outline integration tests                                                                       | omitted/installed plugin, honest button, success/failure/unavailable clipboard, no hash/scroll/navigation, modifiers, Enter, timer cleanup, custom heading, routing                                              | Default changes, the control fakes link semantics, location mutates, copy failure is surfaced, feedback lies/leaks, routing intercepts, or IDs diverge.                 |
| FR8        | module Storybook interaction and `plugins/headingLinks.a11y.chromium.spec.ts`                                                  | hidden rest, row hover, pointer/keyboard focus modality, #→check, line-height rows, 24px coarse target, non-overlap, no state shift, forced colors, reduced motion, light/dark, LTR/RTL, wrapped/zoomed headings | Reveal semantics drift, heading layout grows, hit targets overlap, feedback shifts geometry, pointer paints a keyboard ring, motion persists, or RTL geometry reverses. |
| FR9–FR10   | `plugins/headingLinks.ssr.test.tsx`, package side-effect/export checks, Storybook production build                             | duplicate Core copy, two namespaces, server markup, hydration diagnostics, tree-shaken construction                                                                                                              | IDs/options drift, hydration recovers, construction imports a client boundary, or styles disappear from the rendered bundle.                                            |
| FR11       | changed-file audit, public-content checks, module spec/docs/Changeset review                                                   | factory options, examples, story, evidence manifest                                                                                                                                                              | Product identity, URL/version/scroll/callback/routing logic enters the public module.                                                                                   |
| Repository | formatting, ESLint, knowledge/sync, i18n runtime/catalog, Changeset validation, core typecheck, focused tests, full pre-commit | module files, Markdown/Outline seams, docs/specs, 31 locale catalogs, Storybook, workflow                                                                                                                        | Stale authority, duplicate ownership, untranslated contract drift, type/lint failure, or unrelated diff blocks landing.                                                 |

## Decision log

### DEC-1 — Ship one configurable first-party plugin factory

**Reference:** `module:Markdown/headingLinks/DEC-1`
**Decider:** `cixzhang`, `2026-10-03`

One factory preserves the established opaque plugin list while exposing only the
three decisions the caller owns: installation, optional stable namespace, and an
optional safe URL base. Its configuration rides the existing portable, versioned
plugin envelope rather than a creating module's WeakMap or object identity, so duplicate
compatible Core copies agree. A broad Markdown prop or separate Outline option would
make one composition into permanent parallel API and could drift across surfaces.

Compatible duplicate copies consume the exact envelope. A valid generic same-name plugin
with absent or incompatible module data stays an ordinary plugin in the caller's declared
order, but never gains this module's ID projection or renderer. A malformed generic
envelope follows the existing Markdown/Outline fail-soft path, preserving released
behavior instead of throwing during render. Invalid direct factory arguments remain
programmer errors.

Rejected: module-local option state; elevating same-name lookalikes into this module;
render-time crashes for package-version skew; default-on behavior; parallel Markdown or
Outline identity APIs; product-specific factory options.

### DEC-2 — The module owns one all-depth identity projection

**Reference:** `module:Markdown/headingLinks/DEC-2`
**Decider:** `cixzhang`, `2026-10-03`

Every transformed heading participates depth-first so rendered targets and root
Outline entries share one collision sequence. NFKC Unicode slugging and emitted-ID
reservation produce durable readable fragments. Caller namespace is stable data;
runtime tree position and `useId` are not.

Rejected: root-only plugin allocation; separate Markdown/Outline sluggers; ASCII-only
slugs; collision counting that can re-emit a natural numeric suffix; runtime IDs.

### DEC-3 — Built-in headings receive an honest sibling copy button

**Reference:** `module:Markdown/headingLinks/DEC-3`
**Decider:** `cixzhang`, `2026-10-03`

The rendered control is an inline trailing `#` sibling with baseline/logical spacing,
secondary color, and inherited typography. Existing Astryx copy patterns establish the
interaction: a real button copies, flips to a check for 1.5 seconds, and announces
success politely. It is not an anchor because its primary action must not navigate,
scroll, or mutate the hash; the semantic heading's ID remains the incoming fragment
target. The control's in-flow box matches the heading line-height; stable logical-end
space prevents text overlap and state shift. Coarse hit and focus geometry overflows that
box only to the 24px AA minimum, never into adjacent content. Pointer activation paints
no keyboard focus ring; keyboard focus paints one canonical ring. The heading row and
button compose through `useContainerReveal`, which owns coarse/touch, focus, and motion
semantics. A custom heading remains a complete replacement and receives identity only.

Rejected: native fragment navigation; an anchor that copies while suppressing primary
navigation; bespoke reveal markers/media queries; a 44px in-flow control; overlapping hit
targets; wrapping heading content or custom headings; product router interception;
hover-only discovery; a new Markdown-local theme target.

## Content boundary

The module reads only transformed heading nodes and caller-supplied configuration
carried by the validated plugin entry for the current document invocation. It does not
persist document content, labels, destinations, options, or generated IDs in
module-local state.

## Open questions

None.
