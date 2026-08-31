---
schema_version: 1
template_version: 1
kind: family
id: family:input-fields
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang, imdreamrunner]
review_triggers: [behavior, layout, theming, accessibility]
verified_by:
  [
    packages/core/src/Field/,
    packages/core/src/FormLayout/,
    packages/core/src/InputGroup/,
  ]
members:
  [
    component:TextInput,
    component:TextArea,
    component:NumberInput,
    component:DateInput,
    component:DateRangeInput,
    component:DateTimeInput,
    component:TimeInput,
    component:FileInput,
    component:Selector,
    component:MultiSelector,
    component:Typeahead,
    component:Tokenizer,
  ]
architecture: []
contributing: []
deciding_specs: []
---

# Input field family contract

This record proposes one shared owner for input sizing and state layout. It is
intended for promotion after candidate members are verified against the contract.

## Intent

A person should be able to move between Astryx form controls without fields
changing width, row height, or interaction meaning because one control happens
to have a value, status, spinner, or trailing action.

## Membership rule

A component belongs when its primary purpose is collecting or editing one form
value through a labeled field surface with a content lane. It participates in
`Field` semantics and can be arranged by `FormLayout`.

- **Candidate members:** TextInput, TextArea, NumberInput, DateInput,
  DateRangeInput, DateTimeInput, TimeInput, FileInput, Selector, MultiSelector,
  Typeahead, and Tokenizer.
- **Collaborators:** Field and FieldStatus provide field chrome; FormLayout
  arranges all members; InputGroup groups only its documented compatible
  single-line subset (TextInput, NumberInput, TimeInput, DateInput, Typeahead,
  Selector, and MultiSelector). These collaborators are not members.
- **Excluded:** CheckboxInput, RadioList, Switch, and Slider do not expose this
  field content/end-lane model and need their own family rules.

The draft family is the source of candidate membership. Existing component
contracts do not backlink until this family becomes `current`.

## Shared owner

- `Field` owns label, description, status placement, and disabled-reason chrome.
- `FormLayout` owns outer arrangement, spacing, direction, and form-level
  optionality; members own their internal control layout.
- `InputGroup` owns grouped height and alignment only for its compatible subset.
- No shared owner currently guarantees content width or trailing-action space
  across every member. That missing ownership is the decision under review.

## Canonical concepts

| Concept         | Values or states                                       | Default semantics                                                               | Stability                           |
| --------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------- | ----------------------------------- |
| field size      | `sm`, `md`, `lg` where supported                       | Controls with the same size align in one row                                    | existing pattern; membership varies |
| width           | intrinsic, explicit width, or containing layout        | A value or placeholder does not unexpectedly change the field's available width | candidate family rule               |
| end lane        | empty, status, loading, clear, or component affordance | Text/content does not paint underneath a rendered end control                   | candidate family rule               |
| grouped row     | standalone or inside InputGroup                        | InputGroup owns row height; child content fits that row                         | existing behavior in several fields |
| disabled reason | absent or present                                      | A reason stays reachable without enabling the action                            | documented pattern                  |
| loading         | initial load, refresh, or pending action               | No shared meaning is currently recorded                                         | unresolved                          |

## Cross-component invariants

These are candidates to validate against every proposed member before approval.

- **FR1 — Stable available width unless explicitly excepted.** A field does
  not shrink or grow merely because its placeholder becomes a value, a loading
  indicator appears, or a clear action becomes available. Selector is the
  approved exception: its standalone width may follow its displayed content.
- **FR2 — End controls own explicit space.** A visible end affordance does not
  cover field content. An absent affordance does not reserve unexplained space.
- **FR3 — InputGroup constrains only compatible members.** When a documented
  compatible input is grouped, it does not expand the group row; rich content
  folds, clips, or otherwise follows the group contract.
- **FR4 — Disabled reasons remain reachable.** A disabled field with a reason is
  focusable enough to expose that reason while its action remains blocked.

- **FR5 — Loading describes the value, not supporting data.** Where a member
  exposes `isLoading`, it means the field value is resolving or being saved. It
  does not imply that supplied options are unavailable and does not change the
  contract of data-source props.
- **FR6 — Transition Actions preserve immediate feedback.** Where a member
  exposes `changeAction`, a value change notifies `onChange` immediately, renders
  the proposed controlled value optimistically, runs `changeAction` in a React
  transition, and contributes to the same busy presentation until the controlled
  value accepts or replaces it.

## Allowed component variation

- **AV1 — Native versus composed control.** Text fields may use native inputs;
  selection controls may use button/listbox composition.
- **AV2 — End affordance meaning.** A field may render clear, loading, status,
  disclosure, or stepper controls when its component contract defines them.
- **AV3 — Intrinsic content.** Standalone multiline or rich-value fields may
  grow when their own component contract allows it; grouped rows remain bounded.
- **AV4 — Action callback shape.** Text-editing members may pass their change
  event to `changeAction`; structured-value members may pass only the proposed
  value. Component docs own the exact callback type.

## Representative matrix

| Member and state                  | Shared invariant                              | Deliberate variation                             |
| --------------------------------- | --------------------------------------------- | ------------------------------------------------ |
| TextInput / empty → valued        | Available width stays stable                  | Native input text                                |
| Selector / placeholder → selected | Available width stays stable                  | Button/listbox trigger and custom selected value |
| Typeahead / empty → selected      | Available width stays stable                  | Editable combobox value                          |
| Tokenizer / tokens + loading      | End controls do not cover input content       | Tokens consume the content lane                  |
| Compatible member / InputGroup    | Group owns row height and alignment           | Component content may fold or clip               |
| Any member / FormLayout           | Layout owns outer arrangement and optionality | Component owns its internal content lane         |
| Any member / disabled with reason | Reason is reachable; activation is blocked    | Component-specific reason trigger                |

## Adoption and exceptions

| Component             | Adoption                                                                              | Exception decision               |
| --------------------- | ------------------------------------------------------------------------------------- | -------------------------------- |
| `component:Selector`  | Current code follows Field/InputGroup behavior; width and loading remain under review | none recorded                    |
| `component:Typeahead` | Current code exposes the width-stability gap that motivated this family draft         | none recorded                    |
| `component:Tokenizer` | Appears to share Typeahead's content/end-lane geometry                                | not yet verified                 |
| `component:TextInput` | Reference field for stable width in the historical Typeahead comparison               | not yet verified as family owner |
| other listed members  | Candidate membership                                                                  | not yet verified                 |

## Verification map

| Contract | Verification                                                         | Representative members and states                      | Mutation or failure expectation                                        |
| -------- | -------------------------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------- |
| FR1      | Real-browser width comparison before/after value and loading changes | TextInput, Selector, Typeahead; standalone and grouped | Reintroducing content-sized shrink makes measured width change         |
| FR2      | Real-browser overlap check at narrow supported widths                | clear, loading, status, disclosure end controls        | Removing reserved rendered-lane space produces content/control overlap |
| FR3      | InputGroup interaction/layout tests                                  | one-line and rich selected content                     | Allowing child height to win changes the group row or bleeds content   |
| FR4      | Keyboard and accessibility-tree tests                                | disabled with and without a reason                     | Reason becomes unreachable or disabled action activates                |

## Decision links

### DEC-1 — Selector is the width-stability exception

**Decider:** `cixzhang`, 2026-08-30

Selector belongs to the input-field family, but a standalone Selector may size
with its displayed placeholder or selected value. This exception does not
remove width constraints imposed by FormLayout, InputGroup compatibility, or an
explicit product layout.

### DEC-2 — Loading describes value resolution or saving

**Decider:** `cixzhang`, `2026-08-30`

For input-family members, `isLoading` describes the field value resolving or
being saved. It does not mean option or supporting data is loading. Data-source
props keep their normal contract while the value is busy.

Selector and MultiSelector already use the same busy presentation while a
`changeAction` value is optimistic and waiting to resolve. That is supporting
implementation evidence, not the source of this decision.

Rejected: using one loading flag to imply that supplied options are absent or
constrained, because the component receives those options independently.

### DEC-3 — Transition Actions are an input-family contract

**Decider:** `cixzhang`, `2026-08-30`

The optional `changeAction` API and its optimistic/pending behavior belong to the
input family. Component docs still own each value and event type, but members do
not independently redefine transition ordering or busy-state semantics.

Existing TextInput, TextArea, date/time inputs, FileInput, Selector, and
MultiSelector implementations provide evidence for this shared pattern. Member
coverage and behavioral differences must be verified before promotion.

## Open questions

- **OQ1 — Resolved.** The membership rule is correct. Selector remains a
  member with the DEC-1 width-stability exception. (`human-api`)
  None. Membership adoption still needs verification before this draft becomes
  `current`.

## Content boundary

This draft does not define each component's props, selection/search behavior,
visual treatment, or current audit result. Those remain component, design, and
audit responsibilities.
