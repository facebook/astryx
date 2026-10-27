---
schema_version: 4
template_version: 2
kind: system-spec
id: spec:AST-109
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
phase: proposed
owners: [cixzhang]
affects_architecture: [architecture:public-component-api]
affects_families: [family:input-fields]
affects_contributing: []
affects_consumer_docs:
  [Selector, MultiSelector, ComplexSelector, Typeahead, Tokenizer]
---

# Clear value system spec

<!-- path-applicability:v1 -->

```json
{
  "paths": [
    "packages/core/src/Selector/**",
    "packages/core/src/MultiSelector/**",
    "packages/core/src/ComplexSelector/**",
    "packages/core/src/Typeahead/**",
    "packages/core/src/Tokenizer/**"
  ]
}
```

<!-- Describe the system, not the project: present tense, what it does. No proposals, history, pull requests, or research in the record; see docs/contributing/spec-writing.md and report its rubric results in the pull request. -->

## Intent

Clearing a selector returns it to its starting point, and the caller says what
that point is. A filter whose starting point is "Everyone" clears to
"Everyone", not to a blank field. In `Selector` and `Typeahead`, the row that stands
for the starting point stays in the list while a search narrows it, so a person
can always get back from the list itself.

## Members

This rule applies to every selector in `family:input-fields`: the members whose
value is chosen from a presented list.

| Member            | Value type       | Clear option (FR4)                         | Notes                                                                                                                  |
| ----------------- | ---------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `Selector`        | `string`         | the option whose `value` is `clearValue`   | Delete and Backspace on the trigger clear as the clear button does.                                                    |
| `MultiSelector`   | `string[]`       | none; clear button and keys only           | Clear restores the starting set. Equality ignores order.                                                               |
| `Typeahead`       | `T`              | `clearValue` itself, as the first item     | Equality is the item's `id`. The input shows the item's label.                                                         |
| `Tokenizer`       | `T[]`            | none; clear button and keys only           | Clear restores the starting tokens and reports them with the change descriptor its clear reports. Equality is by `id`. |
| `ComplexSelector` | its `Value` type | caller-rendered content; nothing is pinned | Has no clear today. When it offers `hasClear`, it takes `clearValue` under this rule.                                  |

## Non-goals

- A reset concept separate from clear. There is one clear job, and `clearValue`
  names where it lands.
- A default value or uncontrolled mode. Every member is controlled; no member
  has `defaultValue`.
- Search matching and query normalization. `spec:AST-056` FR4 owns the matching
  floor.
- Members outside the selector set: text, number, date, time, and file inputs,
  and `PowerSearch`, whose value is a filter list rather than a selection.
- A clear option for set-valued members. `MultiSelector` and `Tokenizer` clear
  through the clear button and keys only.
- Equivalent internal implementations remain valid when they satisfy this
  contract.
- Internal modules, files, function names, algorithms, data structures, storage
  layouts, manifests, journals, locks, transaction protocols, and CI job/workflow
  topology belong in architecture or implementation unless callers or
  interoperating systems intentionally depend on that exact mechanism as a public
  protocol. In that case, state who depends on it and why an equivalent
  implementation would not satisfy the contract.

## Public contract

```tsx
<Selector
  label="Owner"
  hasClear
  clearValue="all"
  hasSearch
  value={owner} // string, never null
  onChange={setOwner} // (value: string) => void
  options={[
    {value: 'all', label: 'Everyone', icon: UsersIcon},
    {type: 'divider'},
    ...owners,
  ]}
/>

<MultiSelector
  label="Status"
  hasClear
  clearValue={['open', 'in-review']} // clear restores this set
  value={statuses}
  onChange={setStatuses}
  options={statusOptions}
/>

<Typeahead
  label="Owner"
  hasClear
  clearValue={everyone} // {id: 'all', label: 'Everyone'}
  value={owner} // T, never null
  onChange={setOwner}
  searchSource={people}
/>
```

## Requirements

- **FR1 — `clearValue` is where clear lands.** Every member that offers
  `hasClear` accepts an optional `clearValue` of its own value type. With it,
  every clear path reports `clearValue` through `onChange` and `changeAction`:
  the trigger's clear button, Delete and Backspace on the trigger where the
  member has them, and choosing the clear option (FR4). Without it, clear
  reports the empty value as it does today: `null` for `Selector` and
  `Typeahead`, `[]` for `MultiSelector` and `Tokenizer`. `clearValue` with
  clear turned off (`hasClear` false or absent where it defaults to false) is a
  type error; at runtime it is ignored and warns in development.
- **FR2 — Types follow `clearValue`, and existing callers are unchanged.** With
  `clearValue`, a single-value member's `value`, `onChange`, and
  `changeAction` take the value type without `null`: `string` for `Selector`
  and `T` for `Typeahead`. Without it, each member's types stay exactly as
  shipped, including `Selector`'s `null` under `hasClear` and `Typeahead`'s
  `T | null`. Set-valued members keep their array types either way. A caller
  that passes neither `hasClear` nor `clearValue` sees no type change.
- **FR3 — At the clear value there is nothing to clear.** While the value
  equals `clearValue` under the member's equality (Members table), the
  trigger's clear button is hidden, as it is hidden while the value is empty
  today. The trigger shows the value as it shows any value, so a `Selector`
  at `clearValue` shows that option's label and icon, and `placeholder` is not
  shown.
- **FR4 — The clear option stays in the list.** In `Selector`, the option whose
  `value` equals `clearValue` is the clear option. In `Typeahead`, `clearValue`
  itself is rendered as the first item whenever the list is open, and a source
  result with the same `id` is not repeated. Search never hides the clear
  option, including a query that matches nothing, where the empty-search
  message renders after it. It is not a result: result-count announcements and
  the empty-search state count matching items only. While a query is active,
  the default highlight lands on the first matching item, never on the clear
  option, so Enter never chooses it by accident; arrow keys reach it. In
  `Selector` it keeps the caller's position among top-level entries. A
  `Selector` whose `clearValue` matches no option pins nothing and warns in
  development. Set-valued members have no clear option.
- **FR5 — Choosing the clear option is choosing a value.** It uses the option
  row's anatomy, size, press model, touch target, theme target, and
  presentations, and closed-trigger type-to-find matches its label. In
  `Selector`, choosing it closes the surface and returns focus to the trigger
  (`component:Selector` FR1). In `Typeahead`, focus stays in the input, which
  shows the item's label. The clear button returns focus as it does today.
- **FR6 — Disabled, read-only, required, and forms keep their meaning.** Clear
  stays unavailable while a member is disabled or read-only
  (`component:Selector` FR6). An empty `clearValue` fails `isRequired`
  validation as an empty value does today; a non-empty one does not. With
  `htmlName`, the submitted value after clear is `clearValue`.

### Accessibility contract

- **AR1 — Name and state.** The clear option's accessible name is its label,
  and its selected state is exposed while the value equals `clearValue`. The
  clear button's accessible name and tooltip are unchanged (`family:input-fields`
  FR11).
- **AR2 — Focus.** As FR5: the trigger for `Selector`, the input for
  `Typeahead`, and the clear button's existing focus return for every member.
- **AR3 — Announcement.** A single-value member announces nothing extra: the
  trigger or input reads the new value, as for any choice. `MultiSelector`
  announces the resulting selection with its existing selection message, so a
  non-empty `clearValue` is announced as its count and an empty one as
  "Selection cleared".
- **AR4 — Motion.** Nothing here adds motion. Each surface's own motion and
  reduced-motion behavior apply.

### Platform support

- Supported feature/engine floor: every supported browser and renderer.
  Nothing here is behind a capability check.
- Unsupported behavior: none.
- Browser evidence: type tests for FR2; DOM and accessibility-tree assertions
  for names, selected state, focus, and announcements; real-Chromium
  interaction for the press model in the popover and the bottom sheet.

## Current-state impact

- `family:input-fields` names `clearValue` beside `hasClear` in its adoption
  table for each member in the Members table, and cites this record.
- `component:Selector` names the clear option and FR3's clear-button rule; the
  other member records cite this record for `clearValue`.
- Each member's `.doc.mjs` documents `clearValue`, its type narrowing, and its
  equality.
- `Selector` keeps one internal clear path; its current internal name does not
  constrain the public prop.

## Verification

| Contract | Verification                                                  | Representative states                                                                      | Mutation or failure expectation                                                                           |
| -------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| FR1      | Per-member callback and Action suites                         | Clear button, Delete/Backspace, clear option; with and without `clearValue`; no `hasClear` | Any clear path reports something other than `clearValue`, or the empty value is reported when it is given |
| FR2      | Type tests per member                                         | Neither prop; `hasClear` only; both                                                        | `null` is accepted with `clearValue`, or any shipped signature changes without it                         |
| FR3      | Trigger rendering suites                                      | Value equals `clearValue`; differs; empty                                                  | The clear button shows at `clearValue`, or the trigger shows `placeholder` there                          |
| FR4      | Search suites with live-region assertions                     | No query; matches; no match; Enter in the search input; a `clearValue` with no option      | The row is filtered, counted, highlighted by default under a query, chosen by Enter, or repeated          |
| FR5      | Interaction suites in popover and bottom sheet; real-Chromium | Pointer, touch, keyboard; type-to-find                                                     | The row diverges from option-row behavior, or focus lands elsewhere                                       |
| FR6      | Disabled, read-only, required, and form suites                | Disabled; read-only; required with empty and non-empty `clearValue`; `htmlName`            | Clear is reachable, required validation is wrong, or the submitted value differs                          |
| AR1–AR4  | Accessibility-tree, focus, and announcement assertions        | Each member at and away from `clearValue`                                                  | The name or state is missing, focus moves elsewhere, or an extra announcement fires                       |

Known verification gap: none of these suites exist on `main`.

## Decision log

### DEC-1 — Going back is clear, to a value the caller names

**Reference:** `spec:AST-109/DEC-1`
**Decider:** `cixzhang`, `2026-10-26`

Clear already means "go back to the starting point"; `clearValue` lets the
caller say where that is (`architecture:public-component-api` INV21). It is a
plain value, not a boolean or an anatomy setting (INV18, INV20), and it costs
nothing at runtime (INV19).

Rejected: a separate reset value or reset row, because it shares clear's job.

### DEC-2 — The clear option is the option that holds the clear value

**Reference:** `spec:AST-109/DEC-2`
**Decider:** pending

The option already carries the clear value's label and icon, so it is the row
that stays in the list. No new entry kind or label prop exists.

Rejected: a dedicated clear entry in `options`, because it names the clear
state a second time beside the option that holds the value.

### DEC-3 — Types narrow only when `clearValue` is given

**Reference:** `spec:AST-109/DEC-3`
**Decider:** `cixzhang`, `2026-10-26`

With `clearValue` a single-value member never reports `null`, so its types say
so. Without it nothing changes, so the prop is additive.

### DEC-4 — The family is the list selectors, and the clear option starts with single values

**Reference:** `spec:AST-109/DEC-4`
**Decider:** `cixzhang`, `2026-10-26`

`clearValue` applies to the selectors in the Members table. `PowerSearch` is
not a member. The clear option exists in `Selector` and `Typeahead`, where one
option holds the clear value; set-valued members clear through the clear
button and keys.

## Open questions

None.
