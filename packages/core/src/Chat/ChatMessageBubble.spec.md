---
schema_version: 3
template_version: 6
kind: component
id: component:ChatMessageBubble
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [public-api, behavior, layout, theming, accessibility, testing]
verified_by:
  [
    packages/core/src/Chat/ChatMessageBubble.test.tsx,
    packages/core/src/Chat/__tests__/ChatMessageBubble.a11y.chromium.spec.ts,
    apps/storybook/stories/ChatMessageBubble.stories.tsx,
    apps/storybook/rtl-audit/targets.json,
    packages/core/src/theme/themingTargets.test.ts,
  ]
modules: []
families: []
design_specs: []
architecture:
  [
    architecture:public-component-api,
    architecture:component-style-authoring,
    architecture:component-theming-surface,
    architecture:theme-tokens,
    architecture:component-test-sufficiency,
    architecture:knowledge-contracts,
  ]
contributing: []
system_specs: [spec:AST-029]
---

# ChatMessageBubble component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                              |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | Required `children`; optional `variant`, `name`, `metadata`, `group`, and `width`; root `div` passthrough, styles, and ref. This audit changes no public API, default, or compatibility promise.                                                      |
| Behavior                | The bubble derives sender and density from Chat message context, falls back to assistant/balanced, paints filled or ghost content, groups sender-side corners, and aligns optional name/metadata wrappers with bubble text.                           |
| End-user impact         | Current visual and composition behavior gains direct light/dark, a11y, RTL, and narrow-layout evidence. A remaining slot-content ambiguity is made explicit instead of being silently guessed.                                                        |
| Builder impact          | None. Existing props, values, defaults, rendered root, ref target, target name, and content ownership stay unchanged.                                                                                                                                 |
| Compatibility/readiness | Observational only. `@astryxdesign/core@0.6.3` already ships this surface through `./Chat`. The draft records current behavior and evidence gaps; it is not current authority, and unresolved slot-content and visual-owner questions remain open.    |
| Review checks           | Reject a dropped root passthrough/ref, missing target metadata, physical grouped-corner logic, an explicit width that retains the default cap, evidence that cannot identify this component directly, or a claim that settles the open slot boundary. |
| Governing rules         | `architecture:public-component-api/INV1, INV5, INV6, INV8–INV9`; `architecture:component-theming-surface/INV4, INV6–INV8`; `architecture:component-test-sufficiency/INV1–INV7, INV10–INV11`; WCAG 2.2 SC 1.4.10.                                      |

This table is a review projection; the body below is authoritative.

## Intent

ChatMessageBubble is the optional sender-aware painted content surface inside a
ChatMessage. It gives conversation content a bubble boundary, text inset,
grouped-corner treatment, and aligned name/metadata placement that raw message
content does not have.

This record is an observational backfill written during the 2026-09-24
whole-component audit. It describes verified shipped behavior. It does not
decide new visual direction, expand the variant axis, or decide how the
component should inspect composite or asynchronous React content.

## Compatibility and migration

- Released default preserved: yes — `@astryxdesign/core@0.6.3` ships the `./Chat`
  subpath, all six component props, the assistant/balanced fallback, and the
  filled default.
- Compatibility class: no consumer-visible behavior change in this audit.
- Controlled/uncontrolled behavior: unchanged — the component owns no state.
- Migration decision: none. Existing consumers need no code change.

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The bubble root's fill, text color, typography, radius, padding, wrapping, and
  width cap.
- Mapping message sender and density context to bubble paint and geometry.
- Grouped corner geometry on the sender side, using logical corners.
- The aligned wrappers around optional `name` and `metadata` content.
- Root DOM passthrough, consumer style composition, and the root ref.

**Does not own / non-goals**

- Message semantics, sender layout, avatar placement, or message-level names and
  metadata — owned by ChatMessage or the shared Chat composition surface.
- Timestamp, delivery status, and footer semantics — owned by
  ChatMessageMetadata.
- The meaning, accessibility, lifetime, or eventual rendered output of
  caller-supplied React nodes.
- List scrolling, transcript semantics, composer behavior, or system notices —
  owned by their Chat components.

## Public concepts

| Concept                      | Closed values or states                                                                                           | Meaning                                                                                  | Availability by variant/orientation/state | Default                | Owner                                    | Stability     | Invalid-value behavior                                    |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------- | ---------------------- | ---------------------------------------- | ------------- | --------------------------------------------------------- |
| `children`                   | any `ReactNode`                                                                                                   | Content rendered inside the bubble root                                                  | always                                    | required               | caller                                   | stable        | n/a — required                                            |
| `variant`                    | `filled`, `ghost`                                                                                                 | Selects a filled sender-aware boundary or transparent aligned content                    | always                                    | `filled`               | component                                | stable        | closed union; rejected by types                           |
| `name`                       | omitted; any `ReactNode`                                                                                          | Optional content above the bubble in an aligned wrapper                                  | always                                    | omitted                | caller/component wrapper                 | stable        | current truthiness guard; see FR7 and OQ1                 |
| `metadata`                   | omitted; any `ReactNode`                                                                                          | Optional content below the bubble in an aligned wrapper                                  | always                                    | omitted                | caller/component wrapper                 | stable        | current truthiness guard; see FR7 and OQ1                 |
| `group`                      | omitted, `first`, `middle`, `last`                                                                                | Tightens sender-side corners for consecutive bubbles                                     | filled, ghost                             | omitted                | component                                | stable        | omitted keeps full radius; other values rejected by types |
| `width`                      | omitted; any `SizeValue`                                                                                          | Replaces the default width cap with an explicit width                                    | filled, ghost                             | omitted                | caller                                   | stable        | numbers become CSS pixels; strings pass through           |
| message context              | sender `user`, `assistant`, `system`; density `compact`, `balanced`, `spacious`; absent                           | Selects reflected sender/density and corresponding paint and geometry                    | when nested or standalone                 | assistant and balanced | Chat context / this projection           | observational | absent context uses component fallbacks                   |
| root `div`                   | `BaseProps<HTMLDivElement>` and `ref`                                                                             | Extends and references the element carrying children, paint, target, and bubble geometry | always                                    | none                   | `architecture:public-component-api`      | stable        | component target data and consumer styling compose        |
| `chat-message-bubble` target | sender, variant, and density reflected as `data-*`; exact guaranteed-property set not separately declared in docs | Public selector for the painting bubble root                                             | always                                    | one target per bubble  | `architecture:component-theming-surface` | stable        | undeclared generic properties remain best effort          |

Consumer syntax and prop defaults remain in `ChatMessageBubble.doc.mjs`.

## Behavioral and layout contract

Draft requirements identify their basis so observed code is not mistaken for an
intentional decision. A `current` contract contains no unresolved rows.

| ID  | Candidate invariant                                                                                                                                                                                   | Basis                                                                                     | Draft review state       |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------ |
| FR1 | The component MUST always render one root `div` for `children`, including when the caller supplies non-rendering child content.                                                                       | shipped implementation and required `children` public seam                                | verified observation     |
| FR2 | The root MUST reflect the resolved sender. `user` selects user paint; `assistant`, `system`, and absent context use the non-user paint path; absent context reflects `assistant`.                     | shipped implementation and browser/unit evidence                                          | verified observation     |
| FR3 | The root MUST reflect the resolved density. `compact` uses the compact radius and inset; `balanced` is the fallback; `spacious` uses its wider block and inline inset.                                | shipped implementation and browser/unit evidence                                          | verified observation     |
| FR4 | `filled` MUST paint sender-aware bubble styles; `ghost` MUST remove the fill and block-axis padding while preserving inline alignment.                                                                | shipped implementation, consumer docs, and rendered evidence                              | verified observation     |
| FR5 | `first`, `middle`, and `last` MUST tighten the logical sender-side end, both, and start corner respectively. User uses inline-end; every non-user sender uses inline-start.                           | shipped implementation plus real-browser LTR/RTL evidence                                 | verified observation     |
| FR6 | Omitted `width` MUST keep `max(80%, 280px)`. An explicit number or string MUST set width and replace the default cap with `none`.                                                                     | shipped consumer docs, implementation, and unit evidence                                  | verified observation     |
| FR7 | The current implementation uses JavaScript truthiness for `name` and `metadata`: `0`, empty string, false, null, and undefined omit the wrapper; true and object-like React nodes create the wrapper. | shipped implementation and red test evidence; conflicts with ordinary scalar React output | **unresolved violation** |
| FR8 | Root `ref`, neutral DOM/data/ARIA props, class, style, and `xstyle` MUST reach or combine on the painting root without losing the component target or owned styles.                                   | `architecture:public-component-api/INV5, INV6, INV8`                                      | settled obligation       |
| FR9 | Exactly one `chat-message-bubble` target MUST ride the painting root and reflect sender, variant, and density.                                                                                        | `architecture:component-theming-surface/INV4, INV6–INV8`; public Chat docs                | settled obligation       |

FR7 is a real reachable mismatch: a caller may pass numeric `0`, which React
renders as visible content, but the truthiness guard removes it from these two
slots. Conversely `true` produces a wrapper even though React paints no child.
A scalar-only repair is mechanically possible, but the public type also admits
arrays, fragments, elements, one-shot iterables, lazy content, and promises.
Inspecting those can consume caller data or disagree with eventual React output.
Because the sibling ChatMessage audit already exposed that exact ownership
boundary, this audit records one owner question instead of silently choosing a
second slot policy.

### Allowed variation

- **AV1 — Theme tokens.** Resolved colors, radii, spacing, and typography may vary
  by theme while the semantic token roles remain.
- **AV2 — Caller content.** Child, name, and metadata node structure and semantics
  remain caller-owned.
- **AV3 — Absolute geometry.** Token-resolved padding and radius may vary; logical
  sender-side grouping and width precedence do not.

### Representative states

| State                     | Required invariant                                                            | Allowed variation                |
| ------------------------- | ----------------------------------------------------------------------------- | -------------------------------- |
| standalone                | assistant sender and balanced density fallback; one painting target           | caller content                   |
| assistant/system, filled  | non-user paint; inline-start grouped corners                                  | token-resolved paint             |
| user, filled              | user paint; inline-end grouped corners                                        | token-resolved paint             |
| any sender, ghost         | transparent surface; inline inset retained; block inset removed               | themed text and padding          |
| compact/balanced/spacious | reflected density and corresponding padding/radius path                       | resolved token scale             |
| group first/middle/last   | logical sender-side corner sequence in LTR and RTL                            | token-resolved radii             |
| numeric slot `0`          | current implementation omits content and wrapper; recorded FR7 violation      | none — open owner decision       |
| boolean `true` slot       | current implementation emits an empty aligned wrapper; recorded FR7 violation | none — open owner decision       |
| opaque name/metadata      | current truthy inputs emit wrappers without child inspection                  | eventual React output            |
| width omitted/explicit    | default cap retained / explicit width replaces cap                            | valid CSS length                 |
| narrow/long text          | text wraps with no horizontal overflow at 320 CSS px                          | line breaks and resulting height |

### Transformation and precedence order

- **ORD1 — Context to paint.** Resolve sender/density from the nearest message
  context or local fallback, select paint and geometry, then merge component
  theme props, StyleX output, and consumer styling inputs through the shared
  `mergeProps` contract.
- **ORD2 — Width.** Apply the default maximum width when omitted; when explicit,
  set width and replace that cap before consumer styling composition.
- **ORD3 — Grouping.** Resolve sender side first, then group position, then use
  logical corner properties so CSS direction mirrors the physical edge.

### Performance and resources

- **PR1 — Pure render derivation.** The component owns no state, Effect, event
  listener, observer, timer, or animation frame. Every output derives from props
  and context during render.
- **PR2 — Caller content is not inspected.** The current implementation does not
  traverse, clone, consume, await, or materialize caller-supplied React nodes.
  Whether to preserve that boundary or normalize selected inputs is OQ1.

## Accessibility contract

- **AR1 — Display surface.** ChatMessageBubble adds no widget role, tab stop,
  keyboard behavior, focus management, announcement, or accessible name of its
  own. Semantics belong to the enclosing ChatMessage and caller content.
- **AR2 — Content preservation.** Caller DOM and ARIA passthrough reach the bubble
  root under FR8; component target metadata MUST NOT overwrite neutral caller ARIA.
- **AR3 — Reflow.** At a 320 CSS-px parent width, long content and the documented
  full-width case MUST wrap without horizontal page overflow (WCAG 2.2 SC 1.4.10).
- **AR4 — Color.** Bubble text remains meaningful content and requires WCAG 2.2
  AA text contrast against the final rendered bubble/backdrop in light and dark.
  The component uses semantic token pairs; rendered measurement remains the audit
  oracle.

## Design relationships

| Anatomy or state | Design requirement                                    | Representation authority | Hierarchy role | Component contract |
| ---------------- | ----------------------------------------------------- | ------------------------ | -------------- | ------------------ |
| bubble content   | sender-aware filled boundary or aligned ghost surface | unsettled                | primary        | FR2–FR4            |
| grouped corners  | visually connect consecutive bubbles on sender side   | unsettled                | supporting     | FR5                |
| name             | align auxiliary content with bubble text inset        | unsettled                | supporting     | FR7                |
| metadata         | align auxiliary content with bubble text inset        | unsettled                | supporting     | FR7                |

No `authority: current` design record owns ChatMessageBubble's local
representation today. These rows record shipped appearance for review; they do
not authorize a redesign or convert rendered judgment into policy.

## Family and system relationships

- The shared Chat consumer docs own composition guidance across message, bubble,
  metadata, list, layout, and composer components.
- `architecture:public-component-api` owns export, passthrough, styling-input,
  and ref behavior.
- `architecture:component-theming-surface` owns the painting target and reflected
  axes. It does not independently require this closed variant axis to become
  extensible; that would need a component-level public API decision.
- `architecture:component-test-sufficiency` owns the closed, risk-based evidence
  inventory and the red-before-green requirement for any future slot repair.
- `spec:AST-029` owns the Night Watch observational backfill and remediation flow.

## Verification map

| Contract | Verification                                                         | Representative states                                          | Mutation or failure expectation                                                                 | Audit section                           |
| -------- | -------------------------------------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------- |
| FR1–FR3  | `ChatMessageBubble.test.tsx`; dedicated Storybook fixture            | standalone; user/assistant; compact/balanced/spacious          | removing fallback/reflection or a density path fails DOM or browser state evidence              | `audit:ChatMessageBubble/behavior`      |
| FR4, FR9 | `themingTargets.test.ts`; scoped axe report; Chromium evidence       | filled; ghost; user/assistant/density                          | dropping reflection or moving the target fails DOM, generated, or rendered evidence             | `audit:ChatMessageBubble/theming`       |
| FR5      | dedicated RTL target plus Chromium LTR/RTL frames                    | user/assistant × first/middle/last                             | physical corner logic or wrong sender side fails mirrored geometry and pixels                   | `audit:ChatMessageBubble/rtl`           |
| FR6      | `ChatMessageBubble.test.tsx`; narrow browser fixture                 | omitted; string `100%`; number `420`                           | retaining the cap or changing numeric CSS semantics fails the width assertions                  | `audit:ChatMessageBubble/behavior`      |
| FR7      | archived red test output; source derivation; no standing oracle      | zero; true; empty/nullish; arrays/fragments/iterables/promises | current mismatch is preserved as an open violation rather than locked in by a test              | `audit:ChatMessageBubble/behavior`      |
| FR8      | public-API checks and existing `data-testid`/style composition tests | ref; DOM/data/ARIA; class; style                               | removing rest/ref forwarding or replacing consumer styling fails shared or focused checks       | `audit:ChatMessageBubble/public-api`    |
| AR1–AR4  | scoped axe report; Chromium receipts and pixels; narrow fixture      | all visible states, light/dark, RTL, 320px                     | a semantic violation, low-contrast pair, or horizontal overflow fails its owning evidence layer | `audit:ChatMessageBubble/accessibility` |

## Decision log

No component-local decision has been approved. This draft records only verified
shipped behavior and the evidence routes added by the audit.

## Open questions

- **OQ1 — Should ChatMessageBubble treat one-shot iterables and promised
  `ReactNode` name/metadata content as caller-owned opaque content, or normalize
  them into a stable, rerender-safe slot contract that also defines scalar,
  array, and Fragment emptiness?** (`human-api`)
- **OQ2 — Should the aligned name and metadata wrappers become independently
  themeable, inherit a current owner, or remain intentionally unreachable?**
  (`human-api`)
- **OQ3 — Which current design owner, if any, should make filled/ghost usage and
  grouped-corner representation durable rather than observational?**
  (`human-design`)

## Content boundary

This file does not duplicate the consumer prop table/examples, current audit
scores, implementation steps, or shared architecture rules. Those remain in
`ChatMessageBubble.doc.mjs`, the audit report, and their canonical owners.
