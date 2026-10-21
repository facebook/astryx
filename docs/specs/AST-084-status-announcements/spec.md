---
schema_version: 4
template_version: 2
kind: system-spec
id: spec:AST-084
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-10-15
phase: accepted
owners: [cixzhang]
affects_architecture: [architecture:react-component-runtime]
affects_families: []
affects_contributing: []
affects_consumer_docs: [hook:useAnnounce]
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
- Equivalent internal implementations remain valid when they satisfy this
  contract.

## Requirements

- **FR1 — One owner per message.** Every status message Astryx announces has
  exactly one announcement owner. No other element that shows the same words
  carries a live role (`status`, `alert`, `log`) or `aria-live`.
- **FR2 — Transient messages use the shared channel.** When the element that
  shows a message mounts, unmounts, or is replaced together with its text, the
  owner announces through the shared announcement channel. The new element
  MUST NOT carry a live role or `aria-live`.
- **FR3 — Live roles only on persistent containers.** A component MAY own a
  live role only on an element that stays mounted while its content changes.
  It MUST NOT mount that element already holding the text to announce.
- **FR4 — A live container owns its children.** Content added inside a mounted
  live container is delivered by that container. A child MUST NOT add its own
  live role or announce the same content through the channel.
- **FR5 — Urgency.** Errors and time-critical failures use the assertive
  channel. All other status messages use the polite channel.
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
  announces nothing and carries no live role. The owning component announces.
  A standalone indicator is its own owner and follows FR2.
- **FR9 — One shared channel per document.** The channel is one polite and one
  assertive region per document. They are created empty, stay mounted for the
  document's lifetime, and clear their text shortly after each announcement so
  stale text does not linger. `useAnnounce` is the public way to reach it.

### Platform support

- Supported feature/engine floor: the package's supported browsers.
- Unsupported behavior: without a document (server render), announcing is a
  no-op and renders nothing.
- Browser evidence: DOM and accessibility-tree checks prove routing (FR1–FR5,
  FR7–FR9). Spoken timing, order, and repetition (FR6 on real AT) require
  `spec:AST-009` FR4 evidence.

## Current-state impact

- `component:FieldStatus` already conforms. AR1 and AR2 link to FR2, FR5, FR7.
- `architecture:react-component-runtime` INV5 gains the authority it requires
  for the document-owned channel (FR9). INV2 and INV3 already require FR6.
- Toast: the viewport already announces each toast through the channel. Each
  visible card also carries `role="status"`/`role="alert"` with `aria-live`;
  under FR1 the card drops them.
- Switch: busy is announced through the channel, and the thumb Spinner also
  mounts with `role="status"`. Under FR8 the thumb Spinner is silent. Under FR6
  StrictMode replay does not repeat the busy announcement.
- Spinner (standalone): mounts with `role="status"` and its name. Under FR2 it
  announces its label through the channel when it appears. Its non-live
  exposure is decided by the Spinner record.
- ChatSystemMessage: forces `role="status"` inside the `role="log"` list. Under
  FR4 the log delivers it; dividers and dates are ordinary log content.
- ChatTypingIndicator (lab): mounts with `role="status"` and text. It follows
  FR4 inside a live log, otherwise FR2.
- `spec:AST-037` FR9 (Timer adds no unsolicited live region) already conforms.
- Consumer tests that query these elements by `status` or `alert` role change.
  Release notes name each affected component.

## Verification

| Contract | Verification                                         | Representative states                                          | Mutation or failure expectation                                  |
| -------- | ---------------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------- |
| FR1, FR4 | Shared test: one live owner per announced message    | Toast shown; busy Switch; system notice inside a chat log      | Adding a live role to a second element fails                     |
| FR2, FR3 | Shared test: no live element mounts holding its text | Conditional status, toast card, standalone Spinner             | Mounting `role="status"` with text fails                         |
| FR5      | Channel routing tests                                | Error, warning, success, loading                               | Routing an error to polite, or a success to assertive, fails     |
| FR6      | StrictMode and rerender tests on the channel spy     | Busy start, repeated rerender, same-value update, new occasion | Two announcements for one occasion, or none for a new one, fails |
| FR7      | Accessibility-tree check of the visible message      | FieldStatus attached/detached, toast card                      | Hiding the visible text or a word mismatch fails                 |
| FR9      | `useAnnounce` tests                                  | First use, many components, region removed, server render      | A second region pair, or stale text after the clear delay, fails |
| FR6 (AT) | `spec:AST-009` real-AT receipt                       | Toast, busy Switch, chat notice                                | Missing, repeated, or out-of-order speech fails                  |

## Decision log

### DEC-1 — One owner per message, delivered through the shared channel

**Reference:** `spec:AST-084/DEC-1`
**Decider:** cixzhang, 2026-10-15

Several components show status while also claiming it in a second place, or
mount a live region already holding its text. Screen-reader users then hear a
message twice or not at all. One owner and one shared, always-mounted channel
removes both failures with a single rule, and matches the delivery
`component:FieldStatus` already uses.

Rejected: each component keeps its own always-mounted live region — the page
gains many competing regions and the duplicate-owner failure recurs.

## Open questions

None.
