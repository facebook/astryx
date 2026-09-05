---
schema_version: 1
template_version: 1
kind: family
id: family:input-fields
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-08-31
owners: [cixzhang, imdreamrunner]
review_triggers: [behavior, layout, theming, accessibility]
verified_by:
  [
    packages/core/src/Field/Field.test.tsx,
    packages/core/src/InputGroup/InputGroup.test.tsx,
    packages/core/src/TextInput/TextInput.test.tsx,
    packages/core/src/Selector/Selector.test.tsx,
    packages/core/src/Typeahead/Typeahead.test.tsx,
    packages/core/src/Tokenizer/Tokenizer.test.tsx,
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
    component:ComplexSelector,
    component:Typeahead,
    component:Tokenizer,
  ]
architecture:
  [
    architecture:component-theming-surface,
    architecture:interaction-modality,
    architecture:public-component-api,
  ]
contributing: []
deciding_specs: [spec:AST-001/DEC-1, spec:AST-001/DEC-2, spec:AST-002/DEC-1]
---

# Input field family contract

## Intent

A person should encounter one coherent input system: state display, behavior,
appearance, and size use consistent treatment and API contracts across members.
Each component still owns the interaction model specific to the value it edits.

This record separates normative family requirements from shipped facts. The
frontmatter `verified_by` list names representative evidence anchors rather than
every member suite. The membership list and adoption table are exhaustive for
the current family; changes to any member still require its focused evidence.

## Membership rule

A component belongs when its primary public purpose is collecting or editing a
form value through a labeled field surface with a content lane. Members use
`Field` semantics or own an equivalent field shell and can participate in
`FormLayout`.

- **Members:** TextInput, TextArea, NumberInput, DateInput, DateRangeInput,
  DateTimeInput, TimeInput, FileInput, Selector, MultiSelector,
  ComplexSelector, Typeahead, and Tokenizer.
- **Collaborators:** Field and FieldStatus provide shared field chrome;
  FormLayout arranges fields; InputGroup groups its documented compatible
  single-line subset; InputClearButton, Spinner, Tooltip, and BaseTypeahead
  provide shared affordance or interaction behavior. These collaborators are
  not members.
- **Excluded:** CheckboxInput, RadioList, Switch, and Slider use labeled-control
  models without this content/end-lane geometry. PowerSearch and ChatComposer
  are higher-level compositions that consume member behavior rather than define
  another field primitive. BaseTypeahead is a combobox engine without a field
  surface.

Membership follows public responsibility, not use of `inputWrapperStyles` or
another implementation helper.

## Shared owner

- This family owns the consistent cross-component treatment and API contract for
  input state display, behavior, appearance, and size. Sizing and end-control
  geometry are invariants within that broader purpose, not the purpose itself.
- `Field` owns the standalone label, description, status placement, and explicit
  `width` seam. A member omits its nested Field when a supported InputGroup owns
  the group label and supporting text.
- `FormLayout` owns outer arrangement, spacing, direction, and form-level
  optionality. It does not redefine a member's internal control geometry.
- `InputGroup` owns the fixed row height and connected-edge alignment only for
  its documented compatible subset: TextInput, NumberInput, TimeInput,
  DateInput, Typeahead, Selector, and MultiSelector on current main.
- Each member owns the DOM and CSS mechanism that satisfies these requirements.
  End controls may be ordinary flex items or a component-local lane; this family
  does not require one shared wrapper, measurement hook, target, or custom
  property.
- Shared primitives retain their own visual and accessibility ownership. In
  particular, InputClearButton, Spinner, Tooltip, FieldStatus, and Icon do not
  become member-specific APIs when composed into a field.
- FieldStatus owns its direct `attached` and `detached` message-box
  presentations. Field owns composition with an input: it consumes `tooltip`
  before rendering FieldStatus and applies the member's supported placement
  contract.

## Canonical concepts

| Concept           | Values or states                                               | Default semantics                                                                                                    | Stability                                  |
| ----------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| field shell       | standalone Field or supported InputGroup path                  | One label/status owner surrounds the control                                                                         | shipped pattern                            |
| field size        | `sm`, `md`, `lg` where supported                               | Same-size single-line controls align without one state changing the row                                              | approved family rule                       |
| inline size       | intrinsic, explicit `Field.width`, or containing layout        | A member keeps its available inline size across value and busy-state changes                                         | approved rule; Selector exception below    |
| end controls      | absent, clear, busy, status, disclosure, or component content  | Every rendered control has non-overlapping space; absent controls leave no unexplained reserve                       | approved family rule                       |
| grouped row       | standalone or supported InputGroup child                       | InputGroup owns the fixed row height and connected edges                                                             | shipped contract for the compatible subset |
| disabled reason   | absent or component-supported `disabledMessage`                | The reason remains keyboard- and assistive-technology-reachable while mutation stays blocked                         | approved family rule where exposed         |
| input busy        | explicit `isLoading` or pending `changeAction` where exposed   | The field value is resolving or being saved                                                                          | approved by DEC-2 and AST-001              |
| source busy       | component-owned async search or option loading                 | Supporting data work is separate from input `isLoading`                                                              | component/system-spec owned                |
| Transition Action | absent or component-supported `changeAction`                   | Callback first, optimistic value next, Action in a transition, one busy presentation                                 | approved family rule where exposed         |
| status placement  | `attached`, `detached`, or `tooltip` at the input-family layer | Attached is the default where the member supports safe overlap; detached and tooltip remain available to every input | approved family rule                       |

## Cross-component invariants

- **FR1 — Inline size is stable across ordinary field states.** In the same
  containing layout, a member MUST NOT change its outer available inline size
  merely because placeholder content becomes a value, or because a busy,
  status, or clear control appears. Explicit `width`, parent layout, and
  responsive constraints still apply. Standalone Selector is the DEC-1
  exception and may follow its displayed content.
- **FR2 — Rendered end controls own non-overlapping space.** Text, tokens, the
  caret, and selected content MUST NOT paint or receive pointer input underneath
  a clear action, Spinner, status control, disclosure, or component-owned end
  content. A lane that is absent MUST NOT leave stale or unexplained space.
  This is an observable requirement, not a mandate for measurement or a shared
  lane primitive.
- **FR3 — InputGroup owns compatible row geometry.** A documented compatible
  member MUST fill but not expand the group's fixed-height row. Placeholder,
  selected, busy, status, and clear states remain one row; long or rich selected
  content truncates, folds within its own renderer, or clips at the group edge
  rather than bleeding outside it. Components not documented as compatible do
  not acquire this behavior by family membership.
- **FR4 — Disabled reasons remain reachable where supported.** When a member
  exposes `disabledMessage`, the inactive field remains focusable enough to
  expose the reason while editing, selection, and activation stay blocked.
  Components without that public concept are not required to add it.
- **FR5 — Input loading describes the value, not supporting data.** Where a
  member exposes `isLoading`, it means the field value is resolving or being
  saved. It MUST NOT make independently supplied options unavailable or change
  a data-source prop's contract. Initial option-source pending is the separate
  explicit state required by AST-001.
- **FR6 — Transition Actions preserve immediate feedback.** Where a member
  exposes `changeAction`, every documented value-change path runs `onChange`
  first, presents the proposed controlled value optimistically, runs
  `changeAction` in a React transition, and contributes to the same busy
  presentation until the controlled value accepts or replaces it.
- **FR7 — Component-owned source work keeps family geometry and accessibility.**
  Typeahead and Tokenizer own asynchronous search state through BaseTypeahead,
  not through the family `isLoading` meaning. Their visible source-busy feedback
  still MUST be named, expose busy semantics on the combobox, and satisfy FR1,
  FR2, and FR3 where grouped.
- **FR8 — Status placement follows member capability.** Every input MUST offer
  `detached` and `tooltip`. A member supports `attached` only when its direct
  control is opaque, bordered, fixed-height, and its owning root reliably
  reflects the resolved size used for overlap. Where supported, `attached` is
  the default. Wrapped, custom, tall, or translucent surfaces normally use
  `detached` or a component-owned placement. Direct FieldStatus continues to
  support only `attached` and `detached`; Field consumes `tooltip` before
  rendering it.

## Allowed component variation

- **AV1 — Native versus composed control.** Text fields may use native inputs;
  selection controls may use button/listbox or dialog composition.
- **AV2 — End-control mechanism and meaning.** A member may use in-flow flex
  items or a component-local out-of-flow lane and may render clear, busy,
  status, disclosure, stepper, or documented custom content. The mechanism does
  not weaken FR1 or FR2.
- **AV3 — Block-axis growth.** TextArea and Tokenizer may grow in the block axis
  for multiline or multi-token content. That variation does not make their
  inline size value-dependent. A component must be explicitly adopted by
  InputGroup before its rich content receives a grouped-row policy.
- **AV4 — Action callback shape.** Text-editing members may pass their change
  event to `changeAction`; structured-value members may pass only the proposed
  value. Component docs own the exact callback type.
- **AV5 — Supported concepts vary.** A member need not add `size`, `isLoading`,
  `changeAction`, `disabledMessage`, clear, or InputGroup support merely to join
  the family. When it exposes one of those concepts, the matching family rule
  applies.
- **AV6 — Attached-status support.** A member that cannot satisfy FR8 keeps
  attached unavailable rather than approximating the overlap. It still offers
  detached and tooltip through the family status contract.

## Representative matrix

| Member and state                                       | Shared invariant                                                            | Deliberate variation                                                        |
| ------------------------------------------------------ | --------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| TextInput / empty, valued, or input-busy               | Stable inline size; in-flow end controls do not overlap text                | Native input and optional clear/status controls                             |
| Selector / placeholder or selected                     | End controls and grouped row remain bounded                                 | Standalone inline size may follow displayed content under DEC-1             |
| Typeahead / empty, selected, or source-busy            | Stable inline size and one non-overlapping end area, standalone and grouped | Editable input becomes a selected Token; source busy is BaseTypeahead-owned |
| Tokenizer / tokens, source-busy, and endContent        | Stable inline size and clear content/end-control separation                 | Standalone tokens may wrap and grow the field in the block axis             |
| ComplexSelector / placeholder, selected, or input-busy | Stable field surface and non-overlapping Spinner/disclosure                 | Caller owns rich popup content; no InputGroup support                       |
| Compatible member / InputGroup                         | Group owns row height and connected edges in every field state              | Component owns internal truncation or folding                               |
| Member with `disabledMessage`                          | Reason is reachable; mutation remains blocked                               | Component owns the focus target and Tooltip composition                     |
| Member / validation status                             | Detached and tooltip are available; attached is default only when supported | Component owns whether its control safely satisfies attached eligibility    |

## Adoption and exceptions

### Current shipped facts

| Component       | Current adoption                                                                                                           | Recorded exception                                                                 |
| --------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| TextInput       | Field, FormLayout, InputGroup, size, width, `isLoading`, `changeAction`, clear, status, and disabled reason                | none                                                                               |
| TextArea        | Field, FormLayout, size, width, `isLoading`, `changeAction`, status, and disabled reason; block-axis growth                | not InputGroup-compatible                                                          |
| NumberInput     | Field, FormLayout, InputGroup, size, width, clear, status, and disabled reason                                             | no shipped `isLoading` or `changeAction`                                           |
| DateInput       | Field, FormLayout, InputGroup, size, width, `isLoading`, `changeAction`, clear, status, and disabled reason                | none                                                                               |
| DateRangeInput  | Field, FormLayout, size, width, `isLoading`, `changeAction`, clear, status, and disabled reason                            | not InputGroup-compatible                                                          |
| DateTimeInput   | Field, FormLayout, size, width, `isLoading`, `changeAction`, clear, status, and disabled reason                            | not InputGroup-compatible                                                          |
| TimeInput       | Field, FormLayout, InputGroup, size, width, `isLoading`, `changeAction`, clear, status, and disabled reason                | none                                                                               |
| FileInput       | Field, FormLayout, width, `isLoading`, `changeAction`, clear, status, and disabled reason                                  | no public `size`; compact and dropzone modes are component-owned                   |
| Selector        | Field, FormLayout, InputGroup, size, width, `isLoading`, `changeAction`, clear, status, and disabled reason                | DEC-1 permits standalone content-sized width                                       |
| MultiSelector   | Field, FormLayout, InputGroup, size, width, `isLoading`, `changeAction`, clear, status, and disabled reason                | trigger-display modes remain component-owned                                       |
| ComplexSelector | Field, FormLayout, size, width, `isLoading`, `changeAction`, and status                                                    | no InputGroup or disabled-reason API                                               |
| Typeahead       | Field, FormLayout, InputGroup, size, width, clear, status, disabled reason, and BaseTypeahead source loading               | no family `isLoading` or `changeAction`; search lifecycle is component-owned       |
| Tokenizer       | Field, FormLayout, size, width, `isLoading`, `changeAction`, clear, status, disabled reason, source busy, and block growth | not InputGroup-compatible on current main; the search lifecycle is component-owned |

### Implementation gaps

- **Typeahead state geometry:** current main removes the intrinsic-width input
  from layout when a selected Token is shown, so a content-sized parent can
  collapse the field onto the value. Its clear control is separately positioned,
  and current source-busy feedback is an in-flow static clock without
  `aria-busy`; selected, source-busy, and grouped combinations do not have the
  focused geometry coverage required by FR1–FR3 and FR7. PRs
  [#5555](https://github.com/facebook/astryx/pull/5555) and
  [#5682](https://github.com/facebook/astryx/pull/5682) are implementation
  candidates, not authority. Their in-flow Typeahead approach is compatible with
  this contract; the specific DOM/CSS mechanism remains component-owned.
- **Tokenizer state geometry:** current main positions `endContent` and clear
  controls out of flow without reserving their rendered width, so narrow input
  content can pass underneath them. Token count can also change intrinsic
  inline size. PR #5555 proposes a component-local reserve. Tokenizer is not an
  InputGroup-compatible child on current main; [#4405](https://github.com/facebook/astryx/pull/4405)
  is a separate adoption proposal and its single-row overflow treatment is not
  approved by this family.
- **Selector source-state semantics:** Selector and MultiSelector keep provided
  options available while input `isLoading` is true, but current empty/no-result
  presentation still treats that flag as option-source pending and neither
  component has the explicit source-pending API required by AST-001.
- **Transition Action coverage:** current TextInput and FileInput clear
  affordances call `onChange` without `changeAction`, and FileInput does not
  explicitly hold the proposed controlled files as an optimistic value while
  its Action is pending. Other exposed clear paths inspected on current main
  route through their ordinary Action pipeline. These are conformance gaps
  under FR6, not alternate family semantics.
- **Status placement conformance:** current Field defaults attached for arbitrary
  children without proving the control satisfies FR8. TextArea, Tokenizer, and
  FileInput's dropzone are representative tall, wrapped, or custom surfaces that
  cannot inherit attached solely from the shared default. Some member docs also
  omit tooltip or the whole status-placement projection even though Field
  consumes the family sentinel. Follow-up work must make attached capability and
  the three input-level choices accurate in each member's API and docs.
- **Attached FieldStatus overlap:** PR
  [#5769](https://github.com/facebook/astryx/pull/5769) expands overlap from a
  descendant `data-size`, which does not establish that the direct control is
  eligible or that its owning root reliably reflects the resolved size. The
  implementation must preserve attached for eligible members while unsupported
  wrapped, custom, tall, and translucent surfaces retain component-owned
  placement, normally detached.
- **Verification coverage:** current unit tests prove composition, semantics, and
  individual state behavior, but do not yet provide the complete real-browser
  inline-size/end-overlap matrix below. This current record names those
  implementation gaps rather than claiming they are already fixed.

The verification map names representative evidence, not every member suite.
The exhaustive coverage obligation follows the membership and adoption tables.

## Verification map

| Contract | Verification                                                                                                                          | Representative members and states                                                                               | Mutation or failure expectation                                                                                   |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| FR1      | Real-Chromium before/after inline-size measurements in block, flex-item, inline-block, grid auto-track, and explicit-width containers | TextInput baseline; Selector exception; Typeahead empty/selected/source-busy; Tokenizer zero/one/many tokens    | Value or busy state changes the field's outer inline size outside a recorded exception                            |
| FR2      | Real-Chromium content-box/control-box overlap matrix at narrow supported widths and LTR/RTL                                           | clear, Spinner, status, disclosure, Tokenizer `endContent`; alone and combined                                  | Content, caret, or pointer hit area intersects a rendered end control, or stale reserve remains after it unmounts |
| FR3      | InputGroup unit tests plus rendered row-height/overflow checks                                                                        | every compatible member; applicable placeholder/selected/busy/clear/status states; mismatched child/group sizes | A child expands the group, wraps controls to another row, or bleeds beyond the connected border                   |
| FR4      | Keyboard, pointer, and accessibility-tree tests                                                                                       | each member that exposes `disabledMessage`                                                                      | Reason becomes unreachable, or the disabled control mutates/activates                                             |
| FR5      | Selector and MultiSelector interaction and announcement tests from AST-001                                                            | populated options while input-busy; explicit source-pending; completed empty                                    | Input busy suppresses supplied options or substitutes for source state                                            |
| FR6      | Focused callback/order/optimistic/busy tests for every Action-capable mutation path                                                   | typing, selection, calendar/preset, file selection, and clear where exposed                                     | Callback/Action order changes, optimistic feedback disappears, or a clear path bypasses the Action contract       |
| FR7      | Typeahead/Tokenizer source-busy tests and real-browser geometry checks                                                                | direct BaseTypeahead, standalone wrappers, grouped Typeahead, selected/tokenized values                         | Busy feedback is unnamed/duplicated, `aria-busy` is absent, or source loading changes row/inline geometry         |
| FR8      | Representative member tests plus real-browser overlap/opacity/height checks                                                           | eligible single-line direct controls; wrapped, custom, tall, and translucent controls; all three placements     | Attached is missing where supported, appears where unsafe, or tooltip reaches direct FieldStatus                  |

## Decision links

### DEC-1 — Selector is the standalone inline-size exception

**Decider:** `cixzhang`, `2026-08-30`

Selector belongs to the input-field family, but a standalone Selector may size
with its displayed placeholder or selected value. This exception does not remove
constraints imposed by FormLayout, a supported InputGroup, or explicit product
layout.

### DEC-2 — Input loading describes value resolution or saving

**Decider:** `cixzhang`, `2026-08-30`

For members that expose `isLoading`, it describes the field value resolving or
being saved. It does not mean option or supporting data is loading. Data-source
props keep their normal contract while the value is busy.

`spec:AST-001/DEC-1` and `spec:AST-001/DEC-2` apply that distinction to Selector
and MultiSelector: provided options stay available, zero options is a no-choice
state, and initial option-source pending must be explicit.

### DEC-3 — Transition Actions are an input-family contract

**Decider:** `cixzhang`, `2026-08-30`

The optional `changeAction` API and its optimistic/pending behavior belong to the
input family. Component docs own each value and event type, but members do not
independently redefine callback ordering, optimistic feedback, or busy-state
semantics.

Public API admission remains owned by `spec:AST-002/DEC-1`; this family adds no
separate invalid-state or API-guardrail policy.

### DEC-4 — Attached status is conditional capability, not universal geometry

**Decider:** `cixzhang`, `2026-08-31`

Every input offers detached and tooltip status placement. A member offers
attached only when its direct control is opaque, bordered, fixed-height, and its
owning root reliably reflects the resolved size used for overlap. Attached is the
default whenever it is supported. Wrapped, custom, tall, or translucent surfaces
normally use detached or retain component-owned placement.

Direct FieldStatus remains limited to attached and detached presentation. Tooltip
is an input-family composition that Field consumes before rendering FieldStatus.

Rejected: deriving universal attached overlap from any descendant `data-size`,
because descendant metadata does not prove the direct surface is opaque,
bordered, fixed-height, or the owner of that resolved size.

## Open questions

None.

## Content boundary

This record owns only cross-component field behavior. Component props,
selection/search algorithms, visual target maps, implementation mechanisms,
current audit results, and product-specific compositions remain with their
component, architecture, design, audit, or callsite owners.
