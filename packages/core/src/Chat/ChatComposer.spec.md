---
schema_version: 3
template_version: 5
kind: component
id: component:ChatComposer
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [public-api, behavior, layout, theming, accessibility]
verified_by:
  [
    packages/core/src/Chat/ChatComposer.test.tsx,
    packages/core/src/Chat/ChatComposerInput.test.tsx,
    packages/core/src/Chat/ChatSendButton.test.tsx,
    apps/storybook/stories/ChatComposer.stories.tsx,
    apps/storybook/stories/ChatComposerCustomInput.stories.tsx,
  ]
modules: []
families: []
design_specs: []
architecture:
  [
    architecture:component-test-sufficiency,
    architecture:component-theming-surface,
    architecture:public-component-api,
    architecture:interaction-modality,
    architecture:react-component-runtime,
    architecture:component-style-authoring,
    architecture:knowledge-contracts,
  ]
contributing: []
system_specs:
  [
    spec:AST-002,
    spec:AST-009,
    spec:AST-017,
    spec:AST-020,
    spec:AST-027,
    spec:AST-029,
  ]
---

# ChatComposer component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                      |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | No new API shape or default. The exported context submits its supplied value; the default disabled editor exposes its disabled state; and an explicitly shown Stop action remains operable while message editing is disabled. |
| Behavior                | ChatComposer coordinates a controlled or uncontrolled draft, trims a submitted value, clears through the existing value channel, composes caller slots, and keeps the default send/stop action synchronized with context.     |
| End-user impact         | Screen-reader users can identify the disabled editor, pointer and touch users can stop an interruptible response, and users of a custom editor send the draft that editor supplied instead of stale composer state.           |
| Builder impact          | None. Existing props, defaults, exports, and slot shapes remain; custom inputs can rely on the published `onSubmit(value)` context operation.                                                                                 |
| Compatibility/readiness | Patch-compatible corrections to released behavior. This observational draft is non-authoritative; body theming, BaseProps ownership, spacious density, and a stop state without `onStop` remain unresolved owner choices.     |
| Review checks           | Reject ignored context submission arguments, a disabled state hidden from the default textbox, an ancestor that blocks an enabled Stop action, or any change that presents the open questions below as settled policy.        |
| Governing rules         | `architecture:interaction-modality/INV4, INV7, INV9`; `architecture:public-component-api/INV5–INV6, INV9, INV12`; `architecture:component-theming-surface/INV4, INV6`; `spec:AST-020/FR1`; `spec:AST-029/DEC-4`.              |

This table is a review projection; the body below is authoritative.

## Intent

ChatComposer is the message-entry shell for a chat surface. It coordinates the
current draft and submission operation, lays out an optional drawer, header,
status, footer, and send-area content around a default or caller-supplied input,
and owns keyboard-only editor focus indication. Products own message transport,
streaming state, validation policy, and the content placed in each slot.

## Compatibility and migration

- Released default preserved: yes for ordinary editing, submission, layout, and visual defaults.
- Compatibility class: patch-compatible behavioral correction; the public context operation now uses the value its caller supplies, and disabled-plus-stop restores the already enabled Stop path.
- Controlled/uncontrolled behavior: unchanged; a successful submission still clears through `onChange` in controlled mode and local state otherwise.
- Migration decision: `spec:AST-029/DEC-4`; each behavior correction was reproduced by a failing test before implementation changed.

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- Coordinating a controlled or uncontrolled serialized draft value with the input and submit action.
- Providing the default token-capable editor and send/stop action while allowing either to be replaced.
- Laying out the drawer, header, input, footer, send, and status regions.
- Applying composer density, elevation, disabled presentation, and keyboard-only editor focus indication.
- Publishing the composition context used by custom inputs and send controls.

**Does not own / non-goals**

- Sending, retrying, cancelling, or persisting a message — owned by the product callsite.
- Deciding when a response is streaming or whether it is interruptible — owned by the product callsite.
- Attachment data, model selection, speech recognition, or validation policy — owned by the supplied slot components and product callsite.
- A product's accessible conversation transcript or live response announcements — owned by the surrounding chat surface.

## Public concepts

| Concept                 | Closed values or states                                      | Meaning                                                                                          | Availability by variant/orientation/state        | Default                     | Owner                               | Stability | Invalid-value behavior                                                        |
| ----------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | ------------------------------------------------ | --------------------------- | ----------------------------------- | --------- | ----------------------------------------------------------------------------- |
| Draft ownership         | uncontrolled; controlled `value` + `onChange`                | Selects where the serialized input draft is stored and how clearing is reported.                 | Every ChatComposer                               | uncontrolled empty string   | `component:ChatComposer`            | stable    | Controlled `value` without an updating owner remains caller-controlled.       |
| Submission              | input submit; default send; custom context `onSubmit(value)` | Delivers one trimmed, non-empty supplied value and clears the draft through the current channel. | Enabled composer with a non-empty supplied value | no submission               | `component:ChatComposer`            | stable    | Empty values and submissions while disabled are ignored.                      |
| Input composition       | default ChatComposerInput; custom React node                 | Supplies the editing surface and optional registered focus control.                              | Every ChatComposer                               | ChatComposerInput           | `component:ChatComposer`            | stable    | A custom input without a registered control gets textarea focus fallback.     |
| Editing availability    | enabled; disabled                                            | Controls whether the draft can be edited or submitted.                                           | Every ChatComposer                               | enabled                     | `component:ChatComposer`            | stable    | Disabled submission is ignored.                                               |
| Primary action          | send; stop                                                   | Sends the current draft or requests interruption.                                                | Default ChatSendButton or a custom sendButton    | send                        | `component:ChatComposer`            | stable    | A shown Stop action without `onStop` is currently rendered but inert.         |
| Density                 | compact; balanced; spacious                                  | Selects composer spacing.                                                                        | Every ChatComposer                               | balanced                    | `component:ChatComposer`            | stable    | Unknown values are rejected by TypeScript.                                    |
| Elevation               | low; none                                                    | Selects a raised body or a flat bordered body.                                                   | Every ChatComposer                               | low                         | `component:ChatComposer`            | stable    | Unknown values are rejected by TypeScript.                                    |
| Status                  | absent; error; warning; top; bottom                          | Adds semantic feedback before or after the body.                                                 | Optional status object                           | absent; bottom when present | `component:ChatComposer`            | stable    | An omitted message currently leaves the semantic status region empty.         |
| Named composition slots | drawer; header actions/context; input; footer/send actions   | Lets callers compose supporting controls and information around the draft.                       | Optional, independently supplied                 | omitted                     | `component:ChatComposer`            | stable    | Omitted slot groups emit no empty header; footer remains for the send action. |
| BaseProps surface       | ref; DOM props/events; className/style; xstyle               | Extends the component with DOM identity, behavior, and styling.                                  | Every ChatComposer                               | omitted                     | `architecture:public-component-api` | stable    | These surfaces currently have split root/body ownership; see OQ2.             |

## Behavioral and layout contract

Draft requirements identify their basis so observed code is not mistaken for an
intentional decision. A `current` contract contains no unresolved rows.

| ID   | Candidate invariant                                                                                                                                                                                                                                    | Basis                                                                                                 | Draft review state |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- | ------------------ |
| FR1  | Controlled mode MUST report changes through `onChange`; uncontrolled mode MUST retain them locally. Every successful submit MUST trim and deliver the value supplied to that operation, then clear through the same value channel.                     | public types and docs; `architecture:public-component-api/INV3, INV9, INV12`; focused tests           | settled            |
| FR2  | The default editor MUST serialize its current text/tokens, submit Enter without Shift, preserve Shift+Enter, defer during IME composition, and allow a caller key handler to prevent the default operation.                                            | implementation, docs, and focused tests                                                               | verify             |
| FR3  | `isDisabled` MUST prevent draft edits and submissions and MUST expose `aria-disabled="true"` on the default textbox; removing the prop MUST remove that state.                                                                                         | `spec:AST-020/FR1` (WCAG 2.2 4.1.2); `architecture:interaction-modality/INV5`; red/green focused test | settled            |
| FR4  | When `isStopShown` is true, the default primary action MUST remain an enabled, named Stop button and call `onStop`; if editing is also disabled, ancestor styling MUST NOT block its pointer, touch, or keyboard activation.                           | `architecture:interaction-modality/INV4, INV7, INV9`; red/green focused and browser-story tests       | settled            |
| FR5  | Omitted header slots MUST omit the header row; the drawer precedes the body; input fills the body between header and footer; footer actions precede send actions and the primary action; status follows `statusPosition`.                              | implementation, props, stories, and blocks                                                            | verify             |
| FR6  | Compact currently reduces body padding and gap. Balanced and spacious currently use the same body spacing. Whether spacious needs distinct output MUST remain unresolved until a component/design owner decides it.                                    | implementation and published union; no current owner selects distinct spacious geometry               | human decision     |
| FR7  | `low` currently applies low rest and medium hover/focus-within elevation; `none` applies no shadow and a border. Public theme reachability MUST cover the painting body or the public target/model MUST change through an approved compatibility path. | implementation; `architecture:component-theming-surface/INV4, INV6`; existing public issue            | human decision     |
| FR8  | Keyboard focus entering the registered/default editor MUST add the shared focus indication to the body; pointer focus MUST not add that extra ring. Clicking non-interactive body space MUST focus the registered control, then a textarea fallback.   | implementation; `architecture:interaction-modality/INV1–INV3, INV9`; focused tests                    | verify             |
| FR9  | Error status currently renders an alert; warning status renders a status; both pair a semantic icon with color and can render above or below the body.                                                                                                 | implementation, docs, and stories; `spec:AST-020/FR1`                                                 | verify             |
| FR10 | BaseProps currently split across elements: ref, DOM props/events, `className`, and `style` reach the outer frame while `xstyle` reaches the painted body. The owning element MUST remain unresolved pending compatibility review.                      | implementation; `architecture:public-component-api/INV5–INV6, INV8`                                   | human decision     |
| FR11 | The exported context MUST expose the current value, change and submit operations, placeholder, disabled/stop/send state, stop callback, and mutable input focus control to custom composition.                                                         | public export, types, docs, stories, and focused tests; `architecture:public-component-api/INV12`     | verify             |

### Allowed variation

- **AV1 — Slot content.** Callers may omit or replace each named slot while preserving the composer's value, submit, focus, and disabled contracts.
- **AV2 — Product workflow.** Callers decide when to show status or Stop and what their callbacks do; ChatComposer owns only the local affordance and dispatch.
- **AV3 — Editor implementation.** A custom input may be a textarea, contenteditable editor, or other control when it follows the exported context and focus-control contract.

### Representative states

| State                        | Required invariant                                                                                  | Allowed variation                                            |
| ---------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Empty draft                  | Default send action is disabled and submission does not fire.                                       | Placeholder and optional slots vary.                         |
| Non-empty draft              | Enter or Send submits one trimmed value and clears through the active ownership channel.            | Serialized token representation and transport behavior vary. |
| Controlled draft             | Caller value remains authoritative; onChange receives edits and clear requests.                     | The caller may accept or defer each update.                  |
| Custom input                 | Context operations act on the supplied value and body click uses its registered focus control.      | DOM/editor implementation varies.                            |
| Disabled editing             | Default textbox exposes disabled state and cannot edit or submit.                                   | Supporting content remains visible.                          |
| Disabled, interruptible work | Stop remains named, enabled, and reachable by pointer, touch, and keyboard.                         | Product cancellation behavior varies.                        |
| Flat elevation               | Body has no shadow and uses its bordered presentation; keyboard focus indication remains available. | Theme tokens vary.                                           |
| Status above or below        | Semantic role, icon, color, and selected placement remain synchronized.                             | Message content and status type vary.                        |
| Narrow viewport              | Composer remains within its containing inline size and the primary action remains operable.         | Available inline size and optional slot content vary.        |

### Transformation and precedence order

- **ORD1 — Value update.** Receive an editor value → publish through `onChange` when controlled or update local state when uncontrolled → derive current context value and send availability.
- **ORD2 — Submission.** Receive the operation's supplied value → trim → reject empty or disabled submission → call public `onSubmit` once → request clearing through the current value channel.
- **ORD3 — Primary action.** Resolve `isStopShown` → expose Stop and dispatch `onStop`, otherwise derive send availability from current draft and disabled state → submit the current context value.
- **ORD4 — Composition order.** Optional top status → drawer → body header → input → footer actions → send actions → primary action → optional bottom status.

### Performance and resources

- **PR1 — Context stability.** The exported context value SHOULD retain referential stability while none of its public members changes.
- **PR2 — Focus coordination.** The component MUST NOT add document listeners or observers to implement body-click focus or modality-specific focus indication.

## Accessibility contract

- **AR1 — Editing state.** The default contenteditable surface acts as the textbox and MUST expose disabled state through `aria-disabled` when editing is unavailable.
- **AR2 — Native actions.** The default Send and Stop controls remain native buttons with translated accessible names; disabled Send uses native disabled behavior, while explicit Stop remains operable.
- **AR3 — Keyboard editing.** Enter submission MUST preserve Shift+Enter newline behavior, IME composition, and caller cancellation through `preventDefault()`.
- **AR4 — Focus indication.** Keyboard focus in the editor MUST produce the shared visible focus treatment; pointer focus does not claim keyboard modality, and focus on an internal action remains owned by that action.
- **AR5 — Status feedback.** Error feedback uses `role="alert"`; warning feedback uses `role="status"`; visible icon and color do not replace the caller's message content.

## Design relationships

| Anatomy or state    | Design requirement                                                  | Representation authority                                                                 | Hierarchy role | Component contract |
| ------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | -------------- | ------------------ |
| Composer frame      | Groups body and optional status into one compositional shell.       | observed implementation                                                                  | container      | FR5                |
| Composer body       | Provides the painted rounded input/action surface and elevation.    | elevation is shipped; public theme reachability is unsettled                             | prominent      | FR7                |
| Drawer              | Places attachment/context content before the body.                  | delegated to `component:ChatComposerDrawer`                                              | supporting     | FR5                |
| Header              | Places caller actions at start and caller context at end.           | observed implementation                                                                  | supporting     | FR5                |
| Input               | Owns or hosts the editing surface and its focus control.            | delegated to `component:ChatComposerInput` or caller custom input                        | prominent      | FR1–FR3, FR8, FR11 |
| Footer              | Places caller actions and the primary action on the final body row. | observed implementation                                                                  | supporting     | FR4–FR5            |
| Send or stop action | Presents the current primary operation.                             | delegated to `component:ChatSendButton` or caller custom send button                     | prominent      | FR1, FR4           |
| Status message      | Adds error or warning feedback before or after the body.            | semantic role/color are shipped; separate public theme reachability is not asserted here | supporting     | FR5, FR9, AR5      |

The aggregate Chat record currently owns the public `chat-composer` target. That
target sits on the frame and cannot select the body's non-inherited elevation and
border properties. This draft records the reachability gap without opting into a
machine theming map, selecting a new target name, or moving the released target.

## Family and system relationships

- No current family or design record governs ChatComposer-specific behavior.
- `architecture:public-component-api` owns BaseProps element ownership, callback semantics, and the exported composition context.
- `architecture:interaction-modality` owns modality parity, focus ownership, and the requirement that enabled Stop remain reachable.
- `architecture:component-theming-surface` owns the anatomy-to-target disposition and makes the current body reachability mismatch blocking without deciding its repair shape.
- `architecture:component-test-sufficiency` owns public-state partitions, negative assertions, observable output, and the exact-head browser boundary.
- `architecture:react-component-runtime` owns render-derived state and browser/server boundaries.
- `architecture:knowledge-contracts` keeps consumer syntax in `ChatComposer.doc.mjs` and observed system behavior in this draft.
- `spec:AST-020/FR1` carries the current WCAG 2.2 accessibility baseline.
- `spec:AST-029/DEC-4` owns red-before-green behavior remediation; the broader Night Watch contract owns this observational backfill, finite evidence inventory, and fail-closed readiness report.

## Verification map

| Contract     | Verification                                                                       | Representative states                                                          | Mutation or failure expectation                                                                                       | Audit section                       |
| ------------ | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| FR1, FR11    | `ChatComposer.test.tsx`; `ChatSendButton.test.tsx`; custom-input stories           | controlled/uncontrolled, context-supplied value, default/custom send           | Ignoring the context argument submits stale state; default Send passes no draft; clearing skips the active channel.   | `audit:ChatComposer/api-behavior`   |
| FR2          | `ChatComposerInput.test.tsx`                                                       | Enter, Shift+Enter, composing, cancelled keydown, text and token serialization | A key path sends during IME, loses newline behavior, bypasses caller cancellation, or emits the wrong string.         | `audit:ChatComposer/input-behavior` |
| FR3          | red/green disabled-state assertion; focused input tests; exact-head axe            | disabled and re-enabled default textbox                                        | The textbox loses its ARIA state, remains editable, or accepts a disabled submit.                                     | `audit:ChatComposer/accessibility`  |
| FR4          | red/green pointer assertion; disabled-streaming Storybook play; exact-head test-ui | enabled send, shown Stop, disabled-plus-shown Stop                             | An ancestor blocks pointer hit-testing, Stop becomes native-disabled, or `onStop` does not fire.                      | `audit:ChatComposer/modality`       |
| FR5, FR9     | ChatComposer stories, CLI block examples, production Storybook build               | omitted/full slots, attachments, top/bottom status, error/warning              | Slot order changes, an empty header appears, or status semantics and placement disagree.                              | `audit:ChatComposer/composition`    |
| FR6          | source and future owner-selected density comparison                                | compact, balanced, spacious                                                    | The audit invents distinct spacious styling without authority or silently changes one public density.                 | `audit:ChatComposer/design-gap`     |
| FR7          | elevation focused test; flat story; current theming guards; owner review pending   | low rest/hover/focus, none, public target                                      | Elevation output disappears or the reachability gap is represented as solved without an approved target mapping.      | `audit:ChatComposer/theming`        |
| FR8, AR4     | `ChatComposer.test.tsx`; exact-head browser/visual gates                           | keyboard, pointer, programmatic focus, internal action, body click             | Pointer focus gains the keyboard ring, editor keyboard focus loses it, or body click bypasses the registered control. | `audit:ChatComposer/focus`          |
| FR10         | source/DOM ownership review; owner decision pending                                | ref, DOM props, className/style, xstyle                                        | A compatibility-affecting root/body move is made without deciding one public owner.                                   | `audit:ChatComposer/api-gap`        |
| narrow state | disabled-streaming mobile Storybook fixture and exact-head test-ui                 | 320px viewport with default input and Stop                                     | The composer widens its viewport or the primary action becomes unreachable.                                           | `audit:ChatComposer/responsive`     |

## Decision log

None. This draft records shipped behavior plus corrections already required by
current shared authority. It does not approve new ChatComposer policy.

## Open questions

- **OQ1 — Body theming reachability.** Should a new stable body target be added, should the released `chat-composer` target move, or should elevation be projected through the existing root target by another compatible mechanism? (`human-api`)
- **OQ2 — BaseProps owner.** Should ref, neutral DOM props/events, `className`, `style`, and `xstyle` all own the outer frame or the painted body, and what compatibility path preserves existing consumers? (`human-api`)
- **OQ3 — Spacious density.** Should `spacious` intentionally alias `balanced`, or should it receive distinct spacing selected by design? (`human-design`)
- **OQ4 — Stop callback invariant.** When `isStopShown` is true without `onStop`, should the component reject the combination, disable or hide Stop, or keep the currently inert action? (`human-api`)

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit
results, implementation steps, or shared system rules. It links to their owners.
