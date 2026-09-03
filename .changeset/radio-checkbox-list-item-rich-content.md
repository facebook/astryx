---
'@astryxdesign/core': patch
---

[feat] RadioListItem and CheckboxListItem accept rich `label` and `description`

`RadioListItem` typed `label` and `description` as `string` while its sibling
`CheckboxListItem` already typed `label` as `ReactNode` — so the same slot had
two contracts, and an app whose option descriptions carry links could not type
them on either component. Both now take `ReactNode`; the runtime already
rendered it.

`RadioListItem` gains the `aria-label` escape hatch `CheckboxListItem`
established, with the same meaning: a plain-text accessible name for the
control. The radio differs in one way worth knowing — it points at its visible
label for its accessible name, so a rich label still names it from its own
text, and `aria-label` is there to narrow a name that reads badly rather than
to supply a missing one. `aria-label` now lands on the radio instead of the row `<div>`,
where ARIA ignored it.

@cixzhang
