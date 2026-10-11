---
schema_version: 3
template_version: 7
kind: component
id: component:Item
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [public-api, behavior, accessibility]
verified_by:
  [
    packages/core/src/Item/Item.test.tsx,
    packages/core/src/Item/__tests__/ItemControlProps.a11y.chromium.spec.ts,
    apps/storybook/stories/Item.stories.tsx,
    scripts/check-knowledge.mjs,
  ]
modules: []
families: []
design_specs: []
architecture: [architecture:public-component-api]
contributing: [contributing:api-conventions]
system_specs: [spec:AST-057/DEC-3]
---

# Item component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                                                                               |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Public contract         | `controlProps?: ItemControlProps`: attributes for the control the row renders, the element keyboard focus lands on. `ItemControlProps` is `React.HTMLAttributes` less `role`, `onClick`, `className`, `style`, `children` and `dangerouslySetInnerHTML`, plus `data-*`.                                |
| Behavior                | The row renders one control: the invisible anchor for `href`, the invisible button for `onClick`, or its own root when `as` is a link component. `controlProps` reach that element; the row's own attributes win where they meet; a row that renders no control ignores them and warns in development. |
| End-user impact         | A screen reader reads a disclosure's or toggle's state, and a control's own name, on the element it focuses; a composite's roving focus lands on the row's control.                                                                                                                                    |
| Builder impact          | None by default. A builder that needs an attribute on the focused control passes it in `controlProps`, on `Item` or through `ListItem`; everything else keeps landing on the root.                                                                                                                     |
| Compatibility/readiness | Additive optional prop; omission changes nothing. Draft record awaiting owner approval.                                                                                                                                                                                                                |
| Review checks           | Reject a state attribute forwarded from the root by name, a caller `role`, `onClick`, class or style on the control, a disabled row left in the tab order, or a second focusable element added to the row.                                                                                             |
| Governing rules         | `architecture:public-component-api/INV4–INV5`; `spec:AST-057/DEC-3`.                                                                                                                                                                                                                                   |

This table is a review projection; the body below is authoritative.

## Intent

Item is the one-row primitive: a label with an optional description, marker,
start and end content, selection, and one interaction — a click or a link.
It renders the interactive element itself (an invisible anchor or button the
label sits in) so a row stays one tab stop, and it spreads a caller's other
props on the root around that element. The row therefore owns which element is
the control, and `controlProps` is the one door to it: the states, relations,
names, marks and key handling a caller must put on the focused element rather
than on the row.

## Compatibility and migration

- Released default preserved: `yes`; omitting `controlProps` changes nothing.
- Compatibility class: additive optional prop.
- Controlled/uncontrolled behavior: not applicable.
- Migration decision: `component:Item/DEC-1`.

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- Which element of the row is the control, and that the row adds no second tab
  stop beside it.
- The control's own attributes: the button's `type`, click and disabled state;
  the anchor's `href`, `target` and `rel`; a disabled row's `aria-disabled` and
  `tabIndex={-1}`.
- The composition order of a caller's `controlProps` with those attributes.

**Does not own / non-goals**

- The parent composite's keyboard model (which row holds the roving `tabIndex`,
  what the arrow keys do) — owned by the composite, which expresses it through
  `controlProps`.
- A nested control's attributes under `interactiveRef` — owned by the nested
  control.
- The row's root attributes, which stay the caller's through the root props.
- Swipe actions — owned by `spec:AST-057`.

## Public concepts

| Concept       | Closed values or states                                                                                                           | Meaning                                                   | Availability by variant/orientation/state                                                             | Default | Owner            | Stability | Invalid-value behavior                                                                                     |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------- | ---------------- | --------- | ---------------------------------------------------------------------------------------------------------- |
| Control props | `ItemControlProps`: HTML attributes less `role`, `onClick`, `className`, `style`, `children`, `dangerouslySetInnerHTML`; `data-*` | Attributes for the element the row renders as its control | A row with `href` or `onClick` and no parent `role`; a row whose root is a link component, any `role` | omitted | `component:Item` | stable    | The excluded keys are rejected by the type; a row with no control ignores the bag and warns in development |

## Behavioral and layout contract

Draft requirements identify their basis so observed code is not mistaken for an
intentional decision. A `current` contract contains no unresolved rows.

| ID  | Candidate invariant                                                                                                                                                                                                                                                                                                                              | Basis                                                      | Draft review state |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- | ------------------ |
| FR1 | The row MUST render at most one control: the invisible anchor when `href` is set, else the invisible button when `onClick` is set, or the root itself when `as` is a link component and `href` is set. A row with a `role` on a plain root, or with an `interactiveRef` (a link root included), renders none.                                    | current behavior; `architecture:public-component-api/INV5` | settled            |
| FR2 | `controlProps` MUST be spread on that control and nowhere else: on a link root, the root alone, and not on an invisible button the row renders beside it for `onClick`. Where the row renders no control they MUST be ignored, and a development warning MUST name where the attributes belong (the nested control, or the row).                 | `component:Item/DEC-1`                                     | settled            |
| FR3 | The row's own attributes MUST win where they meet `controlProps`, on every control: a disabled row's button, anchor or link root carries `aria-disabled="true"` and `tabIndex={-1}` whatever the bag says; the button's `type`, `onClick` and `disabled`, and the anchor's `href`, `target` and `rel`, are never a caller's.                     | `component:Item/DEC-2`                                     | settled            |
| FR4 | On a link root the control and the root are one element: `controlProps` MUST be written after the root's props, so on an attribute named in both the `controlProps` value is the one written, and FR3 still holds over both. A row given no `controlProps`, whatever its control, MUST render exactly what it renders without the prop existing. | `component:Item/DEC-2`                                     | settled            |
| FR5 | `ItemControlProps` MUST exclude the control's own `role`, `onClick`, `className`, `style`, `children` and `dangerouslySetInnerHTML`, and MUST accept `data-*`, `aria-*`, `tabIndex`, `id` and event handlers.                                                                                                                                    | `component:Item/DEC-1`                                     | settled            |

### Allowed variation

- **AV1 — Which attributes a caller sends.** States (`aria-expanded`,
  `aria-haspopup`, `aria-pressed`), relations (`aria-controls`,
  `aria-describedby`), a name (`aria-label`, `aria-labelledby`), marks (`data-*`),
  key handling (`onKeyDown`) and a composite's `tabIndex` may all vary; the row
  does not interpret them.
- **AV2 — Which control the row renders.** An anchor, a button or a link root
  may each be the target without the caller changing the bag.

### Representative states

| State                                      | Required invariant                                                                | Allowed variation                                 |
| ------------------------------------------ | --------------------------------------------------------------------------------- | ------------------------------------------------- |
| `onClick` row, `controlProps` given        | The attributes sit on the invisible button; the root carries none of them.        | Any accepted attribute.                           |
| `href` row, `controlProps` given           | The attributes sit on the invisible anchor beside its `href`, `target` and `rel`. | Any accepted attribute.                           |
| Disabled row                               | `aria-disabled="true"`, `tabIndex={-1}` on the control, whatever the bag says.    | Anchor, button or link root.                      |
| Any row, no `controlProps`                 | Unchanged: every element renders what it did before the prop existed.             | Button, anchor or link root; enabled or disabled. |
| Link root (`as`), with or without a `role` | The attributes sit on the root, after the root's props; nothing warns.            | Any `role` the parent gives the row.              |
| `role` on a plain root; `interactiveRef`   | The bag is ignored and a development warning names the right element.             | Any role; any nested control; a link root too.    |

### Transformation and precedence order

- **ORD1 — The control.** Resolve the control per FR1 before any attribute is
  placed.
- **ORD2 — Composition on the control.** Write, in order: the root's props (a
  link root only), then `controlProps`, then the row's own attributes (FR3), so
  the later write wins on a shared attribute. With no bag the second step is
  absent and the first and third are what the row always wrote.

### Performance and resources

- **PR1 — No runtime beyond the spread.** `controlProps` adds no state, Effect,
  listener, observer or render pass; the row spreads the object it is given.

## Accessibility contract

- **AR1 — One tab stop.** `controlProps` never adds a focusable element to the
  row; it attributes the one the row already renders.
- **AR2 — State rides the focused element.** A state or relation a caller puts
  in `controlProps` is reported by the accessibility tree on the node that takes
  focus, not on a generic ancestor.
- **AR3 — A disabled row is not operable.** It is out of the tab order and says
  `aria-disabled`, whatever a caller's `controlProps` asked.

## Design relationships

| Anatomy or state | Design requirement                                            | Representation authority | Hierarchy role | Component contract |
| ---------------- | ------------------------------------------------------------- | ------------------------ | -------------- | ------------------ |
| Label            | The control the label sits in carries the caller's attributes | prescribed               | prominent      | FR1–FR2            |

## Family and system relationships

- `architecture:public-component-api` owns the admission of `controlProps`
  (INV4: a caller-owned intent the row cannot derive; INV5: accepted inputs reach
  the element that owns the contract, and component-owned accessibility is not
  overwritten).
- `spec:AST-057` owns swipe actions on the row and the roles that admit them
  (DEC-3); `controlProps` neither reaches a swipe panel nor changes availability.
- `component:List` passes the row's props through `ListItem` unchanged;
  `ListItem` declares `controlProps` beside `swipeActions` and `swipeBehavior`
  and forwards it as is.

## Verification map

| Contract      | Verification                                                  | Representative states                                                                                                                                                                                                                                                                                       | Mutation or failure expectation                                                                                                                | Audit section        |
| ------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| FR1–FR5, AR3  | `Item.test.tsx`                                               | button; anchor with `href`/`target`/`rel`; a name of the control's own; a disabled button, anchor and link root; a link root with and without the bag; a link root with `onClick` (one element carries the bag); a disabled button without the bag; the no-control cases, a delegating link root among them | Spreading the bag on the root, dropping the disabled precedence on any control, changing a bag-less link root, or warning on a link root fails | `audit:Item/control` |
| AR1–AR2       | `ItemControlProps.a11y.chromium.spec.ts` (real Chromium, axe) | a disclosure row closed and open, Tab then Enter                                                                                                                                                                                                                                                            | The focused node not reporting the state, the root reporting it, or an axe violation in either state fails                                     | `audit:Item/a11y`    |
| Documentation | `Item.doc.mjs`, Storybook, `scripts/check-knowledge.mjs`      | the prop entry; the Disclosure Row story                                                                                                                                                                                                                                                                    | A missing or stale entry, story or record fails                                                                                                | `audit:Item/docs`    |

## Decision log

### DEC-1 — `controlProps` is an explicit object, not a forwarding rule

**Reference:** `component:Item/DEC-1`
**Decider:** vjeux, 2026-10-11

The row cannot tell a root attribute from a control attribute by name: a
caller may put `aria-expanded` or a `data-*` mark on the row on purpose, and
`onKeyDown` means a different thing on each element. An object the caller fills
names the control explicitly, accepts the attributes the control's element
accepts, and excludes what the row owns on it (`role`, `onClick`, class, style,
children).

Rejected: forwarding a fixed list of ARIA state attributes from the root, because
it moves attributes some callers place on the root deliberately and cannot grow
to marks or handlers.

### DEC-2 — The row's own attributes win where the bags meet

**Reference:** `component:Item/DEC-2`
**Decider:** vjeux, 2026-10-11

A disabled row that a caller's `tabIndex` could put back in the tab order, or
whose `aria-disabled` a caller could clear, would contradict its own state; the
button's `type` and click and the anchor's address are likewise the row's. So
the row writes those last. Where the control is the root, the root's props are
written first and `controlProps` after them: the bag names the control
explicitly and is the more specific of the caller's two inputs.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit
results, implementation steps, or family/system rules. It links to their owners.
