---
schema_version: 3
template_version: 5
kind: component
id: component:ChatComposerInput
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [public-api, behavior, accessibility, interaction, theming]
verified_by:
  [
    packages/core/src/Chat/ChatComposerInput.test.tsx,
    apps/storybook/stories/ChatComposerInput.stories.tsx,
    apps/storybook/rtl-audit/verified-not-applicable.json,
  ]
modules: []
families: []
design_specs: []
architecture:
  [
    architecture:interaction-modality,
    architecture:public-component-api,
    architecture:knowledge-contracts,
  ]
contributing: []
system_specs: [spec:AST-002, spec:AST-029]
---

# ChatComposerInput component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                     |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | No API or default change. ChatComposerInput remains the optional rich editing surface for ChatComposer, with controlled draft, trigger, history, paste, file, and imperative seams.                                          |
| Behavior                | Every edit path keeps the serialized draft observable. Files pasted or dropped reach `onFiles`; consumer `onPaste` receives first refusal over plain text before optional paste-as-token conversion.                         |
| End-user impact         | Dictated or otherwise programmatically inserted text becomes sendable and does not remain hidden behind the empty placeholder; dropped files reach the product attachment flow.                                              |
| Builder impact          | Existing props, callback signatures, defaults, exports, and token serialization stay unchanged. Builders relying on the documented `onPaste` and `onFiles` paths now receive those callbacks consistently.                   |
| Compatibility/readiness | Patch-compatible correction to released behavior. This observational record adds no public concept or visual decision.                                                                                                       |
| Review checks           | Reject an edit path that mutates the DOM without updating the serialized draft, a file drop that can navigate away or bypass `onFiles`, a text paste that bypasses consumer interception, or changed submit/token semantics. |
| Governing rules         | `architecture:public-component-api/INV1`; `architecture:interaction-modality/INV1–INV4`; `architecture:knowledge-contracts/INV11, INV16`; `spec:AST-002`; `spec:AST-029`; rubric B15.                                        |

This table is a review projection; the body below is authoritative.

## Intent

ChatComposerInput supplies ChatComposer's rich editing surface when a plain custom
textarea is insufficient. It owns contenteditable text and selection, serialized
inline tokens, trigger menus, history recall, paste and file intake, and the
imperative editing handle.

## Compatibility and migration

- Released default preserved: yes
- Compatibility class: patch-compatible behavior correction; no public type or default changes
- Controlled and composition behavior: unchanged
- Migration decision: none

## Ownership boundary

**Owns**

- The contenteditable surface, its accessible editing semantics, and serialization.
- Trigger-menu invocation and token insertion inside the editor.
- Enter submission, history navigation, paste precedence, file intake, and imperative edit observability.
- Registration of the editing focus control with ChatComposer.

**Does not own / non-goals**

- ChatComposer layout, send-button state, status placement, or shell elevation.
- Product validation, upload, progress, or error handling for files.
- Search result data, custom token meaning, or custom token interaction semantics supplied by callers.
- A new visual representation for the editor, token, menu, or drop target.

## Public concepts

| Concept            | Closed values or states                                        | Meaning                                                                                     | Availability by state           | Default                     | Owner                         | Stability | Invalid-value behavior                                                |
| ------------------ | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------- | --------------------------- | ----------------------------- | --------- | --------------------------------------------------------------------- |
| draft storage      | DOM-owned; `value` controlled; ChatComposer context controlled | Selects the serialized draft source and observable change channel.                          | every editor                    | context or empty DOM        | `component:ChatComposerInput` | stable    | Explicit `value` wins; unsupported values are rejected by TypeScript. |
| submission         | Enter; Shift+Enter; IME Enter; consumer-cancelled Enter        | Submits one trimmed non-empty draft only on uncancelled Enter without Shift or composition. | enabled editor                  | Enter submits               | `component:ChatComposerInput` | stable    | Empty or composing submission is ignored.                             |
| trigger menu       | omitted; one or more trigger definitions                       | Opens suggestions at a configured character and inserts text or a serialized token.         | when triggers are configured    | omitted                     | `component:ChatComposerInput` | stable    | Unknown trigger characters remain ordinary text.                      |
| history            | enabled; disabled                                              | Recalls submitted drafts at text boundaries with ArrowUp and ArrowDown.                     | when enabled and history exists | enabled                     | `component:ChatComposerInput` | stable    | Mid-text arrow keys retain native caret behavior.                     |
| text paste         | consumer-handled; paste-as-token; plain text                   | Gives `onPaste` first refusal, then optional token conversion, then inserts plain text.     | enabled editor                  | long-paste token conversion | `component:ChatComposerInput` | stable    | A handled callback stops later insertion paths.                       |
| file intake        | pasted; dropped                                                | Prevents browser navigation and passes the files to `onFiles`.                              | when files are supplied         | no callback                 | `component:ChatComposerInput` | stable    | Empty drops do nothing; disabled input does not emit files.           |
| imperative editing | insert token; expand token; insert text; focus; get value      | Lets composing features such as dictation operate through the editor's owned behavior.      | while mounted                   | none                        | `component:ChatComposerInput` | stable    | Calls without a mounted editor are no-ops or return an empty value.   |

## Behavioral and layout contract

| ID  | Candidate invariant                                                                                                                                                   | Basis                                                                       | Draft review state |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------ |
| FR1 | Every user or imperative edit that changes serialized content MUST update empty state and emit the effective value through the active `onChange` channel.             | Shipped `onChange` contract, imperative handle, and ChatDictation callsite. | settled            |
| FR2 | Enter without Shift MUST submit one trimmed non-empty draft and clear it unless the event is composing, the trigger menu consumes it, or a consumer prevents default. | Shipped implementation and consumer docs.                                   | verify             |
| FR3 | Shift+Enter and mid-text history arrows MUST retain native multiline editing behavior.                                                                                | Shipped implementation and focused tests.                                   | verify             |
| FR4 | `value` supplied directly on ChatComposerInput MUST win over ChatComposer context, while an emitted echo MUST NOT rebuild the DOM or move the caret.                  | Shipped controlled precedence and regression tests.                         | verify             |
| FR5 | Plain-text paste precedence MUST be consumer `onPaste` → configured/default paste-as-token → plain insertion.                                                         | Public callback meaning and objective callback composition.                 | settled            |
| FR6 | File paste and file drop MUST prevent native insertion/navigation and deliver the same ordered `File[]` to `onFiles`; disabled editors MUST NOT emit file callbacks.  | Shipped public `onFiles` contract and consumer docs.                        | settled            |
| FR7 | Trigger-menu keyboard handling MUST run before consumer and built-in editor handling; IME composition MUST never submit.                                              | Shipped interaction contract and tests.                                     | verify             |
| FR8 | History recall MUST operate only at the draft boundaries and MUST restore the pending draft after stepping past the newest item.                                      | Shipped behavior and tests.                                                 | verify             |
| FR9 | The root MUST keep forwarding its ref, BaseProps attributes, and styling seams; the imperative handle remains separate in `handleRef`.                                | Released public API and `architecture:public-component-api`.                | verify             |

### Allowed variation

- **AV1 — Search content.** Builders own trigger characters, search sources, item rendering, and inserted values.
- **AV2 — Token content.** Builders may use the structured Badge form or the custom render escape hatch and own custom semantics.
- **AV3 — Product file workflow.** Builders own accepted types, validation, upload, progress, and errors after `onFiles` receives the files.

### Representative states

| State                               | Required invariant                                                                                     | Allowed variation                      |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------- |
| empty                               | Placeholder is visible and the serialized value is empty.                                              | Placeholder copy.                      |
| typed or imperatively inserted text | Placeholder is absent and the same serialized value is observable to ChatComposer and callbacks.       | Draft content.                         |
| controlled update                   | External value is reflected without corrupting a live caret or treating a stale echo as authoritative. | Parent update timing.                  |
| trigger menu open                   | Combobox semantics and active option wiring are exposed; menu interaction owns its keys.               | Search source and item rendering.      |
| file paste or drop                  | Native insertion/navigation is prevented and files reach `onFiles` once.                               | File types and product handling.       |
| disabled                            | Editing and file callbacks are unavailable and disabled state is exposed.                              | Product reason and surrounding status. |

### Transformation and precedence order

- **ORD1 — Draft source.** Explicit `value` → ChatComposer context value → editor DOM.
- **ORD2 — Change channel.** Explicit controlled input callback when `value` is explicit → ChatComposer context callback → distinct local callback.
- **ORD3 — Key handling.** Trigger menu → consumer `onKeyDown` → IME/submit/history behavior.
- **ORD4 — Plain paste.** Consumer `onPaste` → paste-as-token behavior → plain insertion.
- **ORD5 — File intake.** Files on clipboard or data transfer → prevent native behavior → emit `onFiles` when enabled.

### Performance and resources

- **PR1 — Selection work.** Selection reads and writes are scoped to the mounted editable and run only for direct editing actions or controlled synchronization.
- **PR2 — Async trigger work.** Search cancellation and debounce ownership remain in `useTriggerMenu` and the supplied `SearchSource`.
- **PR3 — Portal cleanup.** Token portals are cleaned through the existing token hook when content changes or unmounts.

## Accessibility contract

- **AR1 — Editing semantics.** Without triggers, the surface is a named multiline textbox; with triggers, it exposes the adopted combobox semantics without invalid multiline ARIA.
- **AR2 — Disabled state.** Disabled editing is exposed with `aria-disabled` and cannot accept content or file callbacks.
- **AR3 — Keyboard ownership.** IME, trigger-menu keys, consumer cancellation, Enter submission, and boundary-only history do not steal one another's keys.
- **AR4 — Focus visibility.** When composed in ChatComposer, the semantic editor focus owner drives the shell's shared keyboard focus indicator.

## Design relationships

| Anatomy or state | Design requirement                 | Representation authority | Hierarchy role | Component contract |
| ---------------- | ---------------------------------- | ------------------------ | -------------- | ------------------ |
| input root       | existing themed target             | observed implementation  | supporting     | FR9                |
| editable surface | ordinary composer editing surface  | ChatComposer family      | prominent      | FR1–FR4, AR1–AR4   |
| placeholder      | secondary text while empty         | current token role       | supporting     | FR1                |
| trigger menu     | delegated Typeahead behavior       | Typeahead owner          | floating       | FR7                |
| inline token     | structured Badge or caller content | Badge or caller owner    | supporting     | AV2                |

The existing `chat-composer-input` target remains on the root. This observational
draft does not add a theming target or decide a new visual state.

## Family and system relationships

- `component:ChatComposer` owns layout, submission orchestration, send state, and the shell focus ring; this component owns the editing surface and its change channel.
- Typeahead and SearchSource own result collection behavior; ChatComposerInput owns when the trigger menu participates in editor key precedence.
- `architecture:interaction-modality` owns the shared focus-visibility mechanics.
- `spec:AST-029` owns the observational audit-backfill boundary.

## Verification map

| Contract              | Verification                                                                       | Representative states                                                        | Mutation or failure expectation                                                           | Audit section                           |
| --------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------- |
| FR1, ORD1–ORD2        | focused imperative insertion and controlled-sync tests; `ImperativeInsertion` play | empty → inserted text; controlled echo; external override                    | Text appears only in the DOM, placeholder remains, callback is stale, or the caret jumps. | `audit:ChatComposerInput/behavior`      |
| FR2–FR3, FR7–FR8, AR3 | focused keyboard, IME, trigger, and history tests                                  | Enter; Shift+Enter; composition; cancelled key; boundary and mid-text arrows | A key submits twice, submits during composition, or steals native editing.                | `audit:ChatComposerInput/interaction`   |
| FR5, ORD4             | focused long-paste interception tests                                              | consumer handled; token conversion; plain insertion                          | Consumer interception is skipped or multiple insertion paths run.                         | `audit:ChatComposerInput/behavior`      |
| FR6, ORD5, AR2        | focused paste/drop tests and `FileDrop` play                                       | paste; drop; disabled                                                        | Files navigate away, insert into the editor, bypass `onFiles`, or emit while disabled.    | `audit:ChatComposerInput/behavior`      |
| AR1, AR4              | role/name/ARIA tests plus exact-head accessibility and visual gates                | textbox; combobox; disabled; keyboard focus                                  | Name, role, multiline, expanded, disabled, or visible focus semantics regress.            | `audit:ChatComposerInput/accessibility` |
| FR9                   | ref, target, package, and repository checks                                        | ref; BaseProps; xstyle; className; style                                     | Root ownership or a styling seam moves or disappears.                                     | `audit:ChatComposerInput/api`           |

## Decision log

No component-local policy decision is created by this observational draft.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables, examples, current audit scores,
or visual design rationale. It records shipped behavior and objective corrections
without expanding the public API or deciding a new visual representation.
