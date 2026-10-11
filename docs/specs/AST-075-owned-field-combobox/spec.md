---
schema_version: 4
template_version: 2
kind: system-spec
id: spec:AST-075
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
phase: proposed
owners: [vjeux]
affects_architecture:
  [architecture:interaction-modality, architecture:public-component-api]
affects_families: [family:input-fields]
affects_contributing: []
affects_consumer_docs: [BaseTypeahead, Typeahead, ChatComposerInput]
---

# Combobox over a caller-rendered field system spec

## Intent

A person picks from a filtered list while focus stays in a text field the
product renders itself: a chat composer's textarea, a search field above an
emoji grid, a settings search whose results replace a page section, an "add
people" field whose matches list inline in a dialog. Astryx gives that field the
combobox semantics and keyboard model it gives its own typeahead input. The
product supplies the field, the rows, and where the list renders; every such
field behaves and announces the same way.

## Non-goals

- The field's shell and appearance, the rows' appearance, and where the list
  renders (a layer or the page's flow) stay with the caller.
- Searching, filtering, debouncing, and asynchronous sources stay with the
  caller.
- Finding the query inside the field's text, such as text after a trigger
  character in a composer, stays with the caller.
- Comboboxes hosted on a button or in a modal keep their own records; this spec
  does not set one interaction model for every combobox.
- Equivalent internal implementations remain valid when they satisfy this
  contract.

## Requirements

- **FR1 — Focus stays in the field.** Moving the active option MUST NOT move DOM
  focus out of the field. The field MUST name the active option through
  `aria-activedescendant`, which references a rendered option, and MUST carry no
  `aria-activedescendant` while no option is active.
- **FR2 — Expanded state follows the list.** While the list is shown, the field
  MUST expose `aria-expanded="true"` and an `aria-controls` that names the
  listbox. While it is not shown, the field MUST expose `aria-expanded="false"`
  and MUST NOT reference an element that is not rendered.
- **FR3 — Roles.** The field MUST expose `role="combobox"` whether it is an
  `input`, a `textarea`, or a contenteditable element. The list MUST be a named
  `listbox` whose rows are `option`s, with `aria-selected="true"` on the active
  one. The listbox MAY render anywhere in the document, including the page's
  flow. Controls that are not options MUST render outside the listbox.
- **FR4 — Keys.** ArrowDown and ArrowUp MUST move the active option. Enter on an
  active option MUST pick it and only then stop the field's own Enter. Escape
  MUST hide the list without dismissing an enclosing layer in the same press.
  Every other key MUST reach the field unchanged.
- **FR5 — Input method.** A key MUST NOT activate a combobox command while an
  input-method composition is active.
- **FR6 — Pointer.** Moving the pointer over an option MUST make it active
  without moving DOM focus. Pressing an option MUST pick it, and the field MUST
  keep focus through the press.
- **FR7 — Result count.** When the options change for a new query, the number of
  options, or that there are none, MUST be announced politely through the shared
  announcer rather than a live region per field.

### Platform support

- Supported feature/engine floor: the repository's supported engines; no new CSS
  or DOM feature.
- Unsupported behavior: none; screen readers announce `aria-activedescendant` on
  a contenteditable combobox unevenly, and FR1 still holds there.
- Browser evidence: Chromium accessibility-tree receipts for FR1–FR3 and real
  keyboard and pointer input for FR4–FR6, with screen-reader claims bounded by
  `spec:AST-009`.

## Current-state impact

- `component:BaseTypeahead` meets AR1–AR5 for the input it renders; this
  contract carries the same obligations to a field the caller renders.
- `component:ChatComposerInput` exposes combobox semantics for its trigger menu
  inside its own contenteditable field only.
- Consumer docs gain one entry for the public surface that answers OQ1.

## Verification

| Contract | Verification                                                         | Representative states                                         | Mutation or failure expectation                                                       |
| -------- | -------------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| FR1–FR3  | Chromium accessibility-tree binding under `spec:AST-021`; unit tests | input, textarea, contenteditable; list in a layer and in flow | focus leaves the field, or a stale `aria-activedescendant` or `aria-controls` remains |
| FR4, FR6 | real keyboard and pointer input in Chromium                          | arrows, Enter, Escape inside a dialog, hover and press        | a key or press picks, dismisses, or blurs the field at the wrong time                 |
| FR5      | composition event tests                                              | candidate selection confirmed with Enter                      | Enter during composition picks an option                                              |
| FR7      | shared announcer tests                                               | results, none, a new query                                    | no announcement, or an announcement from a per-field live region                      |

## Decision log

### DEC-1 — The caller renders the field and the list; Astryx owns the semantics and the keys

**Reference:** `spec:AST-075/DEC-1`
**Decider:** pending owner review

A product that already renders a composer, a search field, or a dialog field
cannot adopt the typeahead without replacing that field and moving its list into
a layer, so it wires the combobox pattern by hand, and each copy differs in the
details FR1–FR7 fix. With the field and the list left to the caller and the
semantics owned by Astryx, every such surface meets one tested contract.

Rejected: requiring the product's field to be the typeahead's own input — a textarea or contenteditable composer cannot be one, and an in-flow list is not a layer.

## Open questions

- **OQ1 — The public shape** (`human-api`): a headless hook that returns props
  for the field, the listbox, and each option; `BaseTypeahead` accepting a
  caller's field and an in-flow list; or the composer's trigger menu extended to
  an `input` and a `textarea`.
- **OQ2 — Home and End** (`human-design`): in a field the caller renders, they
  either keep moving the caret or move to the first and last option, as
  `component:BaseTypeahead` FR5 does for its own input.
- **OQ3 — A two-dimensional list** (`human-api`): whether a grid of options,
  such as an emoji picker, belongs to this contract or to a separate one.
