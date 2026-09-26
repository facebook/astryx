---
'@astryxdesign/core': patch
---

[feat] Add `hasClear` and `onClear` to `ComplexSelector`. The clear button renders between the loading spinner and the chevron while `triggerLabel` is set and the field is enabled, in the same slot `Selector`'s `hasClear` uses, and activating it does not open the popup. Without `onClear` it falls back to `onChange(undefined)`. (#6361)

@yomybaby
