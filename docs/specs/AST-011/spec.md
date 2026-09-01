---
schema_version: 1
template_version: 1
kind: system-spec
id: spec:AST-011
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-08-31
phase: accepted
owners: [cixzhang]
affects_architecture: [architecture:public-component-api]
affects_families: [family:input-fields]
affects_contributing: []
affects_consumer_docs: [Selector, MultiSelector]
---

# Read-only selection inputs

## Intent

People should be able to review and submit a selected value that policy or
permissions prevent them from changing. Selector and MultiSelector should expose
that state as read-only rather than disabled, without offering a menu that cannot
change the value.

## Non-goals

- Adding read-only behavior to every input-family member in this change.
- Changing disabled, disabled-reason, loading, validation, or option-source state.
- Adding read-only explanation text or a tooltip API.
- Changing selected-value rendering, option rendering, or form serialization.

## Requirements

- **FR1 — Read-only preserves the value.** With `isReadOnly`, the current value
  MUST remain visible at full opacity, focusable in the ordinary tab order, and
  included in form submission. It MUST NOT invoke `onChange` or `changeAction`.
- **FR2 — Read-only exposes no selection surface.** Pointer, keyboard, typeahead,
  search, and `isDefaultOpen` MUST NOT open or render the Popover or BottomSheet
  selection surface while read-only.
- **FR3 — Editing affordances are absent.** Clear actions and the disclosure
  indicator MUST NOT render while read-only. Status and busy presentation remain
  independent because they describe the preserved value rather than an available
  edit.
- **FR4 — Accessibility matches behavior.** The focusable read-only value MUST
  use text-field semantics that expose its rendered text and read-only state. It
  MUST NOT use `combobox` semantics or expose `aria-expanded`, `aria-haspopup`,
  `aria-controls`, or another relationship to a selection surface that does not
  exist. Search-enabled and non-search selectors use the same read-only semantics
  because neither exposes a search or selection surface in this state.
- **FR5 — Disabled takes precedence.** When `isDisabled` and `isReadOnly` are both
  true, disabled focus, interaction, appearance, accessibility, and form-submission
  behavior win.
- **IR1 — The public API follows the input convention.** Selector and
  MultiSelector MUST use the established optional `isReadOnly` boolean and expose
  the existing `readonly` theme state on their root targets.
- **IR2 — Read-only is not disabled paint.** Implementations MUST NOT reuse
  disabled opacity or disabled form behavior for read-only state. They MAY remove
  hover, pressed, and pointer affordances that would falsely imply editability.

### Platform support

- Supported feature/engine floor: every browser and assistive-technology
  combination supported by Astryx Core.
- Platform constraint: `combobox` has an implicit `aria-haspopup="listbox"`.
  Chromium preserves that accessibility-tree popup even when the DOM omits
  `aria-haspopup` or sets it to `false`, so a combobox cannot truthfully represent
  a read-only value with no popup.
- Browser evidence: a focusable `role="textbox"` element with
  `aria-readonly="true"` exposes both the rendered text as its value and the
  read-only state in Chromium, without popup semantics.

## Current-state impact

- TextInput, TextArea, NumberInput, CheckboxInput, and CheckboxList already
  establish `isReadOnly` as the input-family name for visible, focusable,
  non-editable values.
- Selector and MultiSelector currently expose only disabled state. Their triggers
  can open a selection surface, their clear actions can change the value, and
  their form carriers are removed only when disabled.
- The caller owns whether a selected value is policy- or permission-locked; the
  components cannot derive that distinction from the value, options, loading
  state, or layout. The prop therefore satisfies `spec:AST-002` public-prop
  admission.
- Implementation updates both component contracts, consumer docs, focused tests,
  and theme-state metadata in the same pull request.

## Verification

| Contract | Verification                                        | Representative states                                        | Mutation or failure expectation                                                                        |
| -------- | --------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| FR1, FR5 | Focus, callback, and form-participation tests       | read-only; disabled; both; single and multiple values        | A read-only value changes, leaves the tab order, fails to submit, dims, or overrides disabled behavior |
| FR2, FR3 | Pointer/keyboard/typeahead and DOM affordance tests | popover, bottom sheet, adaptive, search, clear, default-open | A read-only trigger opens or renders a surface, clears a value, or displays a disclosure indicator     |
| FR4      | DOM and real-browser accessibility inspection       | search and non-search triggers; standalone and InputGroup    | The value lacks text-field/read-only state or claims expansion, popup, or control semantics            |
| IR1, IR2 | Theme-state and rendered-style tests                | input and ghost variants                                     | The root omits `data-readonly`, gains disabled opacity, or keeps interactive hover/pressed cues        |

## Decision log

### DEC-1 — Selection inputs use the established read-only contract

**Reference:** `spec:AST-011/DEC-1`
**Decider:** `cixzhang`, `2026-08-31`

Selector and MultiSelector accept `isReadOnly` when the caller owns a value that
must remain visible and submitted but cannot be changed. Read-only controls stay
focusable and expose their rendered content as the value of a read-only text
field, while selection and editing affordances are absent. Editable controls keep
their existing button/combobox semantics.

The read-only element uses `role="textbox"` rather than `combobox`: ARIA gives
`combobox` an implicit listbox popup, which would advertise a surface that does
not exist. A native input was rejected because it cannot preserve Selector's
custom `renderValue` content or MultiSelector's badge display. A focusable ARIA
textbox preserves those renderings while Chromium exposes both their text value
and read-only state.

Rejected: mapping this state to `isDisabled`, because disabled values are dimmed,
removed from the tab order by default, and excluded from form submission.

## Open questions

None.
