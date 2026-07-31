---
'@astryxdesign/core': patch
---

[fix] CheckboxInput & Switch: clicking the description now toggles the control. The description stays a sibling `<span>` of the `<label>` (not nested inside it) and forwards its click to the control, so the whole label area is a hit target without the description polluting the control's accessible name or being announced twice (it remains name-clean and referenced only via `aria-describedby`). Text inputs are unaffected — description click-forwarding is opt-in per control (`FieldLabel`'s new `descriptionActivatesControl`), off for `Field`-backed inputs and group labels.
@freddymeta
