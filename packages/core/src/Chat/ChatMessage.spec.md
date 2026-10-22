---
schema_version: 3
template_version: 6
kind: component
id: component:ChatMessage
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [public-api, behavior, layout, theming, accessibility, testing]
verified_by:
  [
    packages/core/src/Chat/ChatMessage.test.tsx,
    packages/core/src/theme/themingTargets.test.ts,
    apps/storybook/stories/ChatMessage.stories.tsx,
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
    architecture:react-component-runtime,
    architecture:component-test-sufficiency,
    architecture:knowledge-contracts,
  ]
contributing: []
system_specs: [spec:AST-020, spec:AST-029]
---

# ChatMessage component contract

This record is an **observational backfill** written during the 2026-09-24
component audit under `spec:AST-029/FR3–FR4`. Rows marked `verify` describe the
audit base's released contract. Rows marked `proposed` describe the empty-slot
behavior (FR3, FR6, ORD2, AR1–AR2, DEC-1) and await owner approval: `null`,
booleans, and empty strings create no slot; any other slot content that renders
nothing collapses its wrapper through CSS; and a name that renders no text falls
back to the translated sender label. Slot content is never inspected to decide
any of this. Unresolved questions remain open rather than becoming policy.

## Contract at a glance

| Area                    | Contract                                                                                                                                                                         |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `sender`, `children`, `avatar`, `name`, `metadata`, `density`, plus `BaseProps<HTMLElement>` and `ref` on the message article.                                                   |
| Behavior                | Sender controls logical alignment and system-message suppression; density resolves explicit prop → message-list context → `balanced`; descendants receive the resolved context.  |
| End-user impact         | People reading a conversation can distinguish user, assistant, and system messages while names and translated fallback labels preserve each article's sender identity.           |
| Builder impact          | No new caller choice. Slot content that renders nothing leaves no empty space and no unnamed article.                                                                            |
| Compatibility/readiness | Draft. No public API, default, or theming target changes; the empty-slot rows are a patch fix. Authority remains `draft` until exact-head owner approval.                        |
| Review checks           | Reject a row that states unshipped behavior, changes sender or density meaning, treats caller content as component-owned, or turns the unresolved theming question into new API. |
| Governing rules         | `architecture:public-component-api/INV1, INV3, INV5–INV6, INV8–INV9`; `architecture:component-theming-surface/INV3–INV6`; `spec:AST-029/FR3–FR6`.                                |

This table is a review projection; the body below is authoritative.

## Intent

ChatMessage is the sender-aware article wrapper for one message in a
conversation. It owns logical alignment, optional sender identity slots, the
resolved density context supplied to message descendants, and the article's
accessible name. Message content and its own interactions remain caller-owned.

Consumer syntax and examples belong in `ChatMessage.doc.mjs` and the Chat family
document.

## Compatibility and migration

- Released default preserved: yes — the published `./Chat` subpath exports
  `ChatMessage`, `ChatMessageProps`, `ChatMessageSender`, and `ChatDensity`.
- Compatibility class: patch fix. Slot content that renders nothing creates no
  visible slot, and a name that renders no text leaves the translated fallback
  label; a name that renders text labels the article.
- Controlled/uncontrolled behavior: not applicable; the component owns no
  controllable value.
- Migration decision: none.

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- One semantic `<article>` root and its public ref, DOM, data, ARIA, class, and
  style passthrough.
- Logical start, end, or centered alignment selected by `sender`.
- Optional avatar, name, and metadata placement for non-system messages,
  including collapsing a slot whose content renders nothing (DEC-1).
- Density resolution and the `ChatMessageContext` value supplied to descendants.
- The `chat-message` target with its `sender` and resolved `density` axes.
- The article's visible-name or translated fallback accessible label.

**Does not own / non-goals**

- Bubble presentation, grouping, width, name, or metadata — owned by
  `component:ChatMessageBubble` when a bubble supplies them.
- Avatar appearance — owned by the caller's supplied node, commonly
  `component:Avatar`.
- Metadata content, timestamp formatting, status, or footer actions — owned by
  the supplied node and its components.
- Message-list ordering, spacing between messages, streaming announcements, or
  scroll behavior — owned by `component:ChatMessageList` and
  `component:ChatLayout`.
- Interactions inside `children`; descendants retain their own semantic and
  accessibility contracts.

## Public concepts

| Concept      | Closed values or states                                   | Meaning                                                                                 | Availability by variant/orientation/state | Default   | Owner                  | Stability | Invalid-value behavior          |
| ------------ | --------------------------------------------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------- | --------- | ---------------------- | --------- | ------------------------------- |
| `sender`     | `assistant`; `user`; `system`                             | Selects logical alignment, article identity, and whether auxiliary identity slots show. | required in every message                 | required  | component              | stable    | closed union; rejected by types |
| `children`   | any `ReactNode`                                           | Message body passed through inside the aligned content column.                          | every sender                              | required  | caller                 | stable    | n/a — required                  |
| `avatar`     | renders content; renders nothing; skipped scalar; omitted | Optional identity node beside a non-system message.                                     | assistant and user; suppressed for system | omitted   | caller                 | stable    | renders nothing: slot collapses |
| `name`       | renders text; renders nothing; skipped scalar; omitted    | Optional visible sender name and article label source.                                  | assistant and user; suppressed for system | omitted   | caller/component       | stable    | renders no text: fallback label |
| `metadata`   | renders content; renders nothing; skipped scalar; omitted | Optional content below the message body.                                                | assistant and user; suppressed for system | omitted   | caller                 | stable    | renders nothing: slot collapses |
| `density`    | `compact`; `balanced`; `spacious`; omitted                | Selects gaps and becomes descendant message context.                                    | every sender                              | inherited | component/list context | stable    | closed union; rejected by types |
| root surface | `ref`; DOM/data/ARIA props; `className`/`style`/`xstyle`  | Extends the message article.                                                            | every sender                              | omitted   | public component API   | stable    | n/a                             |

## Behavioral and layout contract

Draft requirements identify their basis so observed code is not mistaken for an
intentional decision.

| ID  | Candidate invariant                                                                                                                                                                                                                                                                                         | Basis                                                                  | Draft review state |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------ |
| FR1 | `assistant` MUST align to inline start, `user` to inline end, and `system` to the centre; the root MUST reflect the sender on the `chat-message` target.                                                                                                                                                    | shipped implementation; consumer docs; focused tests                   | verify             |
| FR2 | `system` MUST suppress the supplied avatar, name, and metadata while continuing to render `children`.                                                                                                                                                                                                       | shipped implementation; Chat family anatomy; focused tests             | verify             |
| FR3 | A non-system message MUST render supplied avatar, name, children, and metadata in that visual order. `null`, boolean, and empty-string auxiliary values MUST NOT create wrappers; a wrapper whose content renders nothing MUST collapse (DEC-1).                                                            | owner direction; focused tests                                         | proposed           |
| FR4 | Density MUST resolve explicit `density` → nearest `ChatMessageList` density → `balanced`, and the resolved value MUST reflect on the root target.                                                                                                                                                           | shipped implementation; consumer docs; focused tests; theming metadata | verify             |
| FR5 | Descendants MUST receive the resolved `{sender, density}` value through `ChatMessageContext`.                                                                                                                                                                                                               | shipped implementation; descendant composition                         | verify             |
| FR6 | The article MUST carry the translated sender fallback as `aria-label`, and a non-system `name` that is not a skipped scalar MUST also label it through `aria-labelledby`. A name that renders text names the article; one that renders none leaves the fallback (accessible name computation 1.2, step 2B). | owner direction; accessible name computation 1.2; focused tests        | proposed           |
| FR7 | Accepted `ref`, DOM/data/ARIA props, `className`, `style`, and `xstyle` MUST reach and compose on the same article that carries the `chat-message` target.                                                                                                                                                  | `architecture:public-component-api/INV5–INV6, INV8`; focused tests     | settled            |

### Allowed variation

- **AV1 — Message content.** `children` may be bubbles, rich content, tool output,
  media, or any other caller-owned React node.
- **AV2 — Identity content.** Avatar, name, and metadata are caller-owned nodes
  passed to React unchanged; the wrapper controls placement, system suppression,
  and collapse of a slot whose content renders nothing.
- **AV3 — Density geometry.** Resolved gaps follow the active theme's spacing
  scale; the compact → balanced → spacious ordering is fixed.

### Representative states

| State                                       | Required invariant                                                | Allowed variation                                   |
| ------------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------- |
| Assistant with avatar, name, and metadata   | Inline-start layout; visible name labels the article              | Any caller-owned node may fill the slots            |
| Skipped scalar auxiliary values             | No slot or naming reference is created                            | `null`, booleans, empty strings                     |
| Auxiliary content that renders nothing      | The slot collapses; a name of this kind leaves the fallback label | Empty array or Fragment, component returning `null` |
| Numeric auxiliary values                    | `0` remains visible and a numeric name labels the article         | Any non-system sender                               |
| User without a name                         | Inline-end layout; translated sender fallback labels the article  | Avatar and metadata may be present or omitted       |
| System with auxiliary props supplied        | Centre layout; avatar, name, and metadata remain suppressed       | Any children continue to render                     |
| Standalone message                          | Resolved density is `balanced`                                    | Any sender and content                              |
| Message inside a density-providing list     | Inherits the list density                                         | Any sender and content                              |
| Message with explicit density inside a list | Explicit density wins                                             | Any supported density                               |
| Narrow container with long content          | Root stays within the container and content remains available     | Descendant content chooses its own wrap policy      |
| RTL container                               | Logical user/assistant alignment mirrors with document direction  | System remains centred                              |

### Transformation and precedence order

- **ORD1 — Density.** Resolve the explicit message prop first, then the nearest
  message-list context, then `balanced`; use that single result for layout,
  target reflection, and descendant context.
- **ORD2 — Accessible name.** A system `name` or a skipped scalar creates no
  name wrapper. Otherwise the article references the name wrapper's generated
  id; the rendered text there names the article, and empty text yields to the
  translated fallback carried as `aria-label`.

### Performance and resources

- **PR1 — No external resources.** ChatMessage installs no listener, timer,
  observer, request, or Effect.
- **PR2 — Stable broadcast.** The descendant context value changes only when the
  resolved sender or density changes.

## Accessibility contract

- **AR1 — Article naming mechanism.** Every article carries the translated
  sender fallback as `aria-label`. A name wrapper, when present, is referenced
  through `aria-labelledby`; its rendered text names the article, and when it
  renders no text the accessible name falls back to `aria-label`.
- **AR2 — No inspection.** Slot content is never inspected, cloned, or
  executed to decide whether it renders; collapse and the naming fallback follow
  the rendered DOM.
- **AR3 — Descendant ownership.** ChatMessage is non-interactive and introduces no
  keyboard model. Interactive descendants remain responsible for their own roles,
  names, states, focus, and activation.

## Design relationships

| Anatomy or state | Design requirement                                      | Representation authority | Hierarchy role | Component contract |
| ---------------- | ------------------------------------------------------- | ------------------------ | -------------- | ------------------ |
| Assistant        | Align the message column to logical start               | observed                 | content        | FR1                |
| User             | Align the message column to logical end                 | observed                 | content        | FR1                |
| System           | Centre the content column and suppress identity slots   | observed                 | supporting     | FR1–FR2            |
| Name             | Use supporting type and secondary text colour tokens    | observed                 | supporting     | FR3                |
| Density          | Increase root and child gaps across the three-step axis | observed                 | structure      | FR4                |

No component-local design decision is settled by this draft.

### Theming reachability (observed)

| Anatomy part | Disposition                                                                                                                                                 |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Message root | `target` — the `chat-message` target sits on the article and reflects `sender` and resolved `density`; the Chat family document owns its consumer metadata. |
| Avatar       | `delegatesTo` the supplied node, commonly the `avatar` target owned by `component:Avatar`.                                                                  |
| Name         | `none` — reachability-gap: the built-in name paints explicit supporting type and secondary colour on an untargeted descendant; see OQ1.                     |
| Content      | `delegatesTo` caller-owned children and their targets; custom content has no component-owned target.                                                        |
| Metadata     | `none` — intentional current boundary: the caller supplies the complete rendered node, while the wrapper contributes placement only.                        |

## Family and system relationships

- There is no current `family:chat` record. `Chat.doc.mjs` is the consumer-facing
  family document and owns the shared target inventory; it is not product authority.
- `component:ChatMessageList` supplies optional density context and owns list
  spacing, log semantics, streaming state, and message ordering.
- `component:ChatMessageBubble` consumes sender and density context when present
  and owns bubble presentation.
- There is no current direct owner for ChatMessage's
  `compact | balanced | spacious` density vocabulary or ordering. FR4–FR5 record
  the shipped axis and precedence observationally; routed global layout claims do
  not settle that component-specific vocabulary.
- `spec:AST-029` permits this observational draft and keeps the closed audit
  inventory outside the component contract.

## Verification map

| Contract     | Verification                                                    | Representative states                                                                      | Mutation or failure expectation                                                     | Audit section          |
| ------------ | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- | ---------------------- |
| FR1–FR3      | `ChatMessage.test.tsx`; `ChatMessage.stories.tsx`               | all senders; skipped scalar, renders-nothing, numeric, content, and suppressed slot states | Removing the scalar skip or the CSS collapse leaves an empty slot or a gap          | `audit:ChatMessage/§4` |
| FR4–FR5      | `ChatMessage.test.tsx`; `themingTargets.test.ts`                | standalone; inherited density; explicit override                                           | Changing precedence or reflection gives descendants and themes a different density  | `audit:ChatMessage/§2` |
| FR6, AR1–AR2 | `ChatMessage.test.tsx`; Chromium accessibility tree             | visible, omitted, skipped-scalar, renders-nothing, and system names                        | Dropping the fallback `aria-label` or the name reference leaves an article unnamed  | `audit:ChatMessage/§1` |
| FR7          | `ChatMessage.test.tsx`; public export and theming-target checks | ref; data prop; class; style                                                               | Moving passthrough or ref off the target article breaks the public root contract    | `audit:ChatMessage/§3` |
| AR3          | Source review plus component-scoped accessibility audit         | rich and interactive descendants                                                           | The wrapper introduces an interactive role or takes ownership away from descendants | `audit:ChatMessage/§1` |
| RTL          | `ChatMessage.stories.tsx`; component-scoped RTL audit           | all senders; narrow long content                                                           | Physical direction keeps user or assistant on the same side in both directions      | `audit:ChatMessage/§9` |

## Decision log

- **DEC-1 — Slot emptiness follows the rendered DOM.** (`proposed`, awaiting
  owner approval) ChatMessage skips only `null`, boolean, and empty-string
  slot values. Any other content is passed to React unchanged; its wrapper
  collapses with `:empty` when it renders nothing, and the article's naming
  falls back to `aria-label` when the referenced name renders no text.
  Rejected: inspecting arrays, Fragments, or iterables, which cannot see
  component output and consumes one-shot iterators.

## Open questions

- **OQ1 — Should the built-in name become a separately themeable anatomy part?**
  (`human-api`) The released family inventory exposes only the aggregate
  `chat-message` target, while the name's explicit type and colour prevent a root
  override from reaching it by inheritance. Adding or splitting a target changes
  public theming API, so this draft records the reachability gap without choosing a
  remedy.

## Content boundary

This file does not duplicate consumer prop tables or examples, current audit
scores, screenshot matrices, or shared-system rules. The audit PR owns the closed
run evidence required by `spec:AST-029/FR5`.
