---
'@astryxdesign/core': patch
---

[feat] TextInput, TextArea, NumberInput: add `isReadOnly`. The value is shown at full opacity and still submits with the form, but cannot be edited — the "visible, locked, still sent" case that `isDisabled` deliberately does not cover, since disabled controls are excluded from submission. Read-only fields are not dimmed and stay in the tab order, matching the native `readonly` semantics they compile to; `isDisabled` takes precedence when both are set, and the clear button is hidden while read-only. This completes the prop across the input family — `isReadOnly` already existed on CheckboxInput, CheckboxList, and PowerSearch.
@josephfarina
