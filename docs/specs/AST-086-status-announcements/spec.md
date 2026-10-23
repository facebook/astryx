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
  owner announces through the shared announcement channel, except as FR4, FR10,
  and FR11 provide. The new element
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
  stale text does not linger. Messages written to a region before the previous
  one is exposed are joined in order into one announcement; none is dropped. An
  empty message clears the region, including messages joined but not yet
  exposed.
  `useAnnounce` is the public way to reach it.
- **FR10 — Modal-hosted owners keep their own channel.** While the shared
  channel is not admitted to modal hosting, a globally hosted owner that
  `spec:AST-003` rehosts above native modals (FR16, FR18) announces through its
  own persistent polite and assertive containers, which move with it. FR3, FR5,
  and FR6 apply to those containers.
- **FR11 — A message announces when it appears after the page loads.** Page
  load covers everything committed until the document finishes loading,
  including the page's first render from the server or the client. A message
  present during page load is not announced. A message inserted after the
  document finishes loading, or whose text changes after that, is announced
  once. That includes a message brought in by a client-rendered route change and
  a server-rendered message inserted by client navigation. A message that
  reaches assistive technology only through its announcement, such as a picker's
  empty-panel message under `spec:AST-056` FR3, announces even during page load.
  FR4 applies inside a mounted live container, and FR6 governs repeats. FR11
  covers components that announce their own rendered content;
  `component:FieldStatus`, a grouped field's status message (as in TimeInput
  inside an input group), and `component:Banner` keep their own announcement
  rules.
- **FR12 — Own-content announcements behave the same everywhere.** Every
  component FR11 covers announces the element's
  rendered text, or its accessible name when it renders no text, leaving out
  `aria-hidden` content. It stays silent for text present during page load
  (except as FR11 provides for announcement-only messages), announces once per later appearance or text change, and re-arms when
  the element is hidden. During a server render it announces nothing and adds no
  live role, and a server-renderable adopter stays server-renderable and passes
  the server-safe component boundary check. Any mechanism that satisfies this is
  valid; `architecture:react-component-runtime` INV10 places it.
- **FR13 — Own-content announcements are well behaved.** Announcing a
  component's own rendered content (FR11) happens once per occasion under
  rerender, dependency change, and StrictMode replay, does no work while the
  element is hidden, and leaves nothing behind after unmount. Action
  announcements, such as a result count from a query handler or FR8 busy
  starts, keep their own owner. `architecture:react-component-runtime` INV10
  owns where this work lives.

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
  FR7–FR10). Spoken timing, order, and repetition on real AT are
  recommended `spec:AST-009` follow-up, not a merge or release requirement.

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
- Spinner (standalone): mounts with `role="status"` and its name. Under FR2 and
  FR11 it announces its label through the channel when it appears after page
  load, and stays silent when present at page load. The role and name it
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
- EmptyState: its root mounts a live role together with its text. Under FR2,
  FR11, and FR12 it carries no live role and announces when it appears
  after page load. EmptyState stays server-renderable.
- The ChatComposer status bar carries no live role and announces the caller's
  status message from its own Effect. That is own content, so under
  `architecture:react-component-runtime` INV10 it moves onto the shared module.
- The chat trigger menu's loading row carries no live role. Its "Searching…"
  announcement is the menu's busy start under FR8 and keeps its own owner.
- Button: its persistent loading region fits FR3, except when a Button first
  renders loading and the region mounts holding its text. Inside a live
  container it keeps its role and urgency (FR4).
- DateInput, DateTimeInput, TimeInput, and NumberInput: their persistent
  assertive invalid-entry regions fit FR3 and, inside a live container, keep
  their role and urgency (FR4).
- ChatSystemMessage: forces `role="status"` inside the `role="log"` list. Under
  FR4 the log delivers it; dividers and dates are ordinary log content.
- ChatTypingIndicator (lab): announces its label from its own Effect. Inside a
  live log it follows FR4; otherwise it follows FR11 through FR13. It keeps its
  own Effect because the core module is not published to lab (INV10).
- Comments (lab): its error banners and progress label mount live roles
  together with their text. Inside a live log they follow FR4; otherwise FR2.
- Selector and MultiSelector render their empty-panel message as
  `role="presentation"`, so it reaches assistive technology only through the
  announcement and announces even at page load (FR11, `spec:AST-056`
  FR3). Typeahead and CommandPalette announce their empty state after page load and are otherwise unchanged.
- `component:FieldStatus` AR1 is unchanged: a field message announces on first
  mount, because it reports the field's state when the field appears.
- `component:Banner` FR8 is unchanged: the caller announces an async outcome
  from its transition handler, because only the caller knows whether a Banner
  is a new outcome or persistent content. FR11 and FR12 cover components that
  announce their own content.
- `useAnnounce`: messages written in the same frame are joined instead of the
  last one replacing the others (FR9).
- `spec:AST-037` FR9 (Timer adds no unsolicited live region) already conforms.
- Consumer tests that query these elements by `status` or `alert` role change.
  Release notes name each affected component.

## Verification

| Contract      | Verification                                                              | Representative states                                                                                                                                                                                                                                                                                                                                         | Mutation or failure expectation                                                                                                                                                                                                                                                                                                             |
| ------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR1, FR4      | Shared test: one live owner per announced message                         | Toast shown; busy Switch; system notice, FieldStatus error, and failure Banner inside a chat log; busy Button and invalid DateInput inside a chat log (pass)                                                                                                                                                                                                  | A live role on a second element, or a channel announcement of content added inside a live container, fails                                                                                                                                                                                                                                  |
| FR2, FR3      | Shared test: no live element mounts holding its text                      | Conditional status, toast card, standalone Spinner                                                                                                                                                                                                                                                                                                            | Mounting `role="status"` with text fails                                                                                                                                                                                                                                                                                                    |
| FR5           | Channel routing tests                                                     | Error, warning, success, loading                                                                                                                                                                                                                                                                                                                              | Routing an error to polite, or a success to assertive, fails                                                                                                                                                                                                                                                                                |
| FR6           | StrictMode and rerender tests on the channel spy                          | Busy start, repeated rerender, same-value update, new occasion                                                                                                                                                                                                                                                                                                | Two announcements for one occasion, or none for a new one, fails                                                                                                                                                                                                                                                                            |
| FR7           | Accessibility-tree check of the visible message                           | FieldStatus attached/detached, toast card                                                                                                                                                                                                                                                                                                                     | Hiding the visible text or a word mismatch fails                                                                                                                                                                                                                                                                                            |
| FR8           | Shared test: no live role inside a busy owner; channel spy on the owner   | Busy TextInput, Selector, Switch thumb, ChatMessageList loader, busy CommandPalette (region inside its dialog)                                                                                                                                                                                                                                                | A composed indicator with a live role or its own announcement, or a busy owner that announces nothing, fails                                                                                                                                                                                                                                |
| FR9           | `useAnnounce` tests                                                       | First use, many components, region removed, server render, two messages in one frame, clear after a joined message                                                                                                                                                                                                                                            | A second region pair, stale text after the clear delay, a dropped same-frame message, or a joined message surviving a clear fails                                                                                                                                                                                                           |
| FR10          | Accessibility-tree check with a Dialog open                               | Info and error toast shown over an open Dialog                                                                                                                                                                                                                                                                                                                | A toast that reaches only the body-level channel, or no exposed live container, fails                                                                                                                                                                                                                                                       |
| FR11, FR12    | Helper and component tests                                                | EmptyState present at page load, server-rendered, inserted later, text changed, hidden and shown again, brought in by a client-rendered route change, inside a chat log, empty Selector panel open at page load, server-rendered message inserted by client navigation, message inserted after first render but before the document finishes loading (silent) | Announcing at page load or during a server render (other than an announcement-only message), missing a later insertion or a server-rendered message inserted by client navigation, a client-rendered route change, or an empty Selector panel at page load, repeating one occasion, or also using the channel inside a live container fails |
| FR12 (server) | Server-safe component boundary check plus a server render of each adopter | EmptyState rendered on the server and hydrated                                                                                                                                                                                                                                                                                                                | An adopter that fails the boundary check, or emits an announcement or live role from a server render, fails                                                                                                                                                                                                                                 |
| FR13          | Helper StrictMode, hide/show, and unmount tests on each adopter           | EmptyState, Spinner, ChatComposer status bar, ChatTypingIndicator                                                                                                                                                                                                                                                                                             | A duplicate announcement under StrictMode, work while hidden, or a resource left after unmount fails                                                                                                                                                                                                                                        |
| FR6 (AT)      | Recommended `spec:AST-009` real-AT follow-up                              | Toast, busy Switch, chat notice                                                                                                                                                                                                                                                                                                                               | Missing, repeated, or out-of-order speech fails                                                                                                                                                                                                                                                                                             |

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

### DEC-2 — A message announces when it appears after the page loads

**Reference:** `spec:AST-086/DEC-2`
**Decider:** cixzhang, 2026-10-22

A message that is on the page when it loads is read with the page. Announcing it
interrupts people with something they are about to read. A message that appears
later is news and is announced once. Page load is the boundary because it is the
one every app shares without extra code.
Every self-announcing component behaves the same way (FR12).

Rejected: announcing on every mount — page loads would speak every empty state
and spinner on screen.

## Open questions

None.
