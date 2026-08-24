---
'@astryxdesign/core': patch
---

[feat] DateTimeInput: new `timeOptionInterval` prop adds a dropdown of preset times to the time field, at a cadence of `5 | 10 | 15 | 30 | 60` minutes (`60` gives the 12 AM - 11 PM list). The field becomes an APG combobox over a `listbox`: click or Alt+ArrowDown opens it, ArrowUp/ArrowDown move the active option, Enter picks, Escape closes, and typing moves the highlight to the closest option without filtering the list. `min`/`max` trim the options on the boundary date. Style the popup through the `date-time-input-time-listbox` and `date-time-input-time-option` theme targets.

Opt-in and additive: with `timeOptionInterval` omitted the time field keeps exactly its current behavior and gains no combobox semantics, so existing `getByRole('combobox')` queries still resolve to the date input. With the list closed the arrow keys keep stepping by `timeIncrement` (#4837).

@AKnassa
