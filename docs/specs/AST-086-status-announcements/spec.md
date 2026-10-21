---
schema_version: 4
template_version: 2
kind: system-spec
id: spec:AST-086
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-10-15
phase: accepted
owners: [cixzhang]
affects_architecture: [architecture:react-component-runtime]
affects_families: [family:input-fields]
affects_contributing: []
affects_consumer_docs:
  [
    useAnnounce,
    Toast,
    ChatSystemMessage,
    ChatTypingIndicator,
    Comments,
    FieldStatus,
    Banner,
  ]
---

# Status announcement delivery system spec

## Intent

A screen-reader user hears each status change once, when it happens, at the
right urgency. A message is never lost because its live region appeared
together with its text, and never heard twice because two parts of the page
both claim it.

Builders get one rule for every component that reports status: name the one
owner of the message, and deliver transient messages through the shared
announcement channel.

## Non-goals

- Which events a component reports. Component and family records decide what
  is a status message; this record decides how it is delivered.
- Exact wording. Text comes from `architecture:internationalization`.
- Focus movement. A status message never moves focus; focus rules stay with
  `architecture:interaction-modality` and component records.
- Modal alerts that take focus, such as AlertDialog. They are not status
  messages.
- Spoken output on a specific screen reader. `spec:AST-009` owns that evidence.
- Where the channel is hosted while a native modal makes the rest of the page
  inert. `spec:AST-003` (FR15, FR18, FR20) owns hosting.
- Equivalent internal implementations remain valid when they satisfy this
  contract.

## Requirements

- **FR1 — One owner per message.** Every status message Astryx announces has
  exactly one announcement owner. No other element that shows the same words
  carries a live role (`status`, `alert`, `log`) or `aria-live`.
- **FR2 — Transient messages use the shared channel.** When the element that
  shows a message mounts, unmounts, or is replaced together with its text, the
  owner announces through the shared announcement channel, except as FR4 and
  FR10 provide. The new element
  MUST NOT carry a live role or `aria-live`.
- **FR3 — Live roles only on persistent containers.** A component MAY own a
  live role only on an element that stays mounted while its content changes.
  It MUST NOT mount that element already holding the text to announce.
- **FR4 — A live container owns content added inside it.** Content added inside
  a mounted live container is delivered by that container, at its urgency. An
  element added with that content MUST NOT carry its own live role or announce
  the same content through the channel. A persistent component region that FR3
  allows, such as Button's loading region or an input's invalid-entry region,
  keeps its own role and delivers its own content at its own urgency.
- **FR5 — Urgency.** Outside a live container, errors and time-critical
  failures use the assertive channel. All other status messages use the polite
  channel. Inside a mounted live container, FR4 applies.
- **FR6 — Once per occasion.** An occasion is one state transition or one user
  action. The owner announces once per occasion. Rerender, StrictMode replay,
  and an update to the same value do not repeat it. A new occasion with the
  same words announces again.
- **FR7 — Shown words stay readable.** Delivering through the channel does not
  hide the visible message from assistive technology. The visible element stays
  available for browse mode and `aria-describedby`. The announced words match
  the shown words.
- **FR8 — Indicators inside an owner are silent.** A visual indicator composed
  inside a component that owns the task, such as a Spinner in a busy control,
  announces nothing and carries no live role. The owning component announces its busy state once per busy start (FR6), through the channel or through a persistent region that FR3 allows.
  A standalone indicator is its own owner and follows FR2.
- **FR9 — One shared channel per document.** The channel is one polite and one
  assertive region per document. They are created empty, stay mounted for the
  document's lifetime, and clear their text shortly after each announcement so
  stale text does not linger. `useAnnounce` is the public way to reach it.
- **FR10 — Modal-hosted owners keep their own channel.** While the shared
  channel is not admitted to modal hosting, a globally hosted owner that
  `spec:AST-003` rehosts above native modals (FR16, FR18) announces through its
  own persistent polite and assertive containers, which move with it. FR3, FR5,
  and FR6 apply to those containers.

### Platform support

- Supported feature/engine floor: the package's supported browsers.
- Unsupported behavior: without a document (server render), announcing is a
  no-op and renders nothing.
- While a native modal dialog is open, the shared channel on the page body is
  not exposed to assistive technology until `spec:AST-003` admits it to modal
  hosting. Owners rehosted above the modal use their own containers (FR10).
  Until then, a busy owner rendered inside a native modal announces its busy
  state through a persistent region inside that modal (FR3, FR8). Other
  delivery inside native modals is outside this record.
- Browser evidence: DOM and accessibility-tree checks prove routing (FR1–FR5,
  FR7–FR10). Spoken timing, order, and repetition (FR6 on real AT) require
  `spec:AST-009` FR4 evidence.

## Current-state impact

- `component:FieldStatus` AR1 and `component:Banner` FR8 defer to FR4 inside a
  mounted live container; elsewhere they already match FR2, FR5, and FR7.
- `architecture:react-component-runtime` INV5 gains the authority it requires
  for the document-owned channel (FR9). INV2 and INV3 already require FR6.
- Toast: the viewport announces each toast through the body-level channel, and
  each visible card also carries `role="status"`/`role="alert"` with
  `aria-live`. Under FR1 and FR10 the viewport's own persistent live containers,
  which `spec:AST-003` rehosts above native modals, is the one owner, and the
  card drops its live role. A toast shown over a Dialog stays announced.
- Switch: busy is announced through the channel, and the thumb Spinner also
  mounts with `role="status"`. Under FR8 the thumb Spinner is silent. Under FR6
  StrictMode replay does not repeat the busy announcement.
- Spinner (standalone): mounts with `role="status"` and its name. Under FR2 it
  announces its label through the channel when it appears. The role and name it
  exposes without a live role are outside this record.
- `family:input-fields` members and other busy controls (TextInput, TextArea,
  Selector, MultiSelector, ComplexSelector, Typeahead, Tokenizer, the date and
  time inputs, FileInput, CheckboxInput, CommandPaletteInput,
  DropdownMenuSubMenu, Thumbnail, and the lab EmojiPicker, Schedule, and
  Comments history loaders): each composes a Spinner with
  `role="status"` inside the busy control. Under FR8 that Spinner is silent and
  each control announces its own busy state through the channel. Switch
  already does. CommandPalette opens as a native modal, so it announces each busy
  start, including its load on opening or clearing the query, through a
  persistent region inside its dialog (FR3).
- ChatMessageList: its top loading Spinner is a `role="status"` child of the
  log. Under FR4 and FR8 it is silent, and ChatMessageList announces its loading
  through the channel.
- EmptyState, the ChatComposer status bar, and the chat trigger menu's loading
  row: each mounts a live role together with its text. Under FR2 the message
  goes through the channel and the element carries no live role.
- Button: its persistent loading region fits FR3, except when a Button first
  renders loading and the region mounts holding its text. Inside a live
  container it keeps its role and urgency (FR4).
- DateInput, DateTimeInput, TimeInput, and NumberInput: their persistent
  assertive invalid-entry regions fit FR3 and, inside a live container, keep
  their role and urgency (FR4).
- ChatSystemMessage: forces `role="status"` inside the `role="log"` list. Under
  FR4 the log delivers it; dividers and dates are ordinary log content.
- ChatTypingIndicator (lab): mounts with `role="status"` and text. It follows
  FR4 inside a live log, otherwise FR2.
- Comments (lab): its error banners and progress label mount live roles
  together with their text. Inside a live log they follow FR4; otherwise FR2.
- `spec:AST-037` FR9 (Timer adds no unsolicited live region) already conforms.
- Consumer tests that query these elements by `status` or `alert` role change.
  Release notes name each affected component.

## Verification

| Contract | Verification                                                            | Representative states                                                                                                                                        | Mutation or failure expectation                                                                              |
| -------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| FR1, FR4 | Shared test: one live owner per announced message                       | Toast shown; busy Switch; system notice, FieldStatus error, and failure Banner inside a chat log; busy Button and invalid DateInput inside a chat log (pass) | A live role on a second element, or a channel announcement of content added inside a live container, fails   |
| FR2, FR3 | Shared test: no live element mounts holding its text                    | Conditional status, toast card, standalone Spinner                                                                                                           | Mounting `role="status"` with text fails                                                                     |
| FR5      | Channel routing tests                                                   | Error, warning, success, loading                                                                                                                             | Routing an error to polite, or a success to assertive, fails                                                 |
| FR6      | StrictMode and rerender tests on the channel spy                        | Busy start, repeated rerender, same-value update, new occasion                                                                                               | Two announcements for one occasion, or none for a new one, fails                                             |
| FR7      | Accessibility-tree check of the visible message                         | FieldStatus attached/detached, toast card                                                                                                                    | Hiding the visible text or a word mismatch fails                                                             |
| FR8      | Shared test: no live role inside a busy owner; channel spy on the owner | Busy TextInput, Selector, Switch thumb, ChatMessageList loader, busy CommandPalette (region inside its dialog)                                               | A composed indicator with a live role or its own announcement, or a busy owner that announces nothing, fails |
| FR9      | `useAnnounce` tests                                                     | First use, many components, region removed, server render                                                                                                    | A second region pair, or stale text after the clear delay, fails                                             |
| FR10     | Accessibility-tree check with a Dialog open                             | Info and error toast shown over an open Dialog                                                                                                               | A toast that reaches only the body-level channel, or no exposed live container, fails                        |
| FR6 (AT) | `spec:AST-009` real-AT receipt                                          | Toast, busy Switch, chat notice                                                                                                                              | Missing, repeated, or out-of-order speech fails                                                              |

## Decision log

### DEC-1 — One owner per message, delivered through the shared channel

**Reference:** `spec:AST-086/DEC-1`
**Decider:** cixzhang, 2026-10-15

Several components show status while also claiming it in a second place, or
mount a live region already holding its text. Screen-reader users then hear a
message twice or not at all. One owner and one shared, always-mounted channel
removes both failures with a single rule, and matches the delivery
`component:FieldStatus` already uses.
Owners that `spec:AST-003` rehosts above native modals keep their own containers
until the shared channel can be hosted there (FR10).

Rejected: delivering transient messages through each component's own live
region — the page gains many competing regions and two-owner duplicates recur.

## Open questions

None.
