---
'@astryxdesign/cli': patch
---

[fix] Bottom Sheet showcase block: the filter checkboxes are interactive again.

`CheckboxInput` is fully controlled — `value` is required and the input only moves when the owner updates it. The showcase passed a literal `value={false}` with no `onChange`, so the three filters ("In stock", "On sale", "Free shipping") rendered but could never be toggled: on the docs site the first thing a reader tries in a Bottom Sheet does nothing, and anyone copying the block inherits three dead controls. Each filter now has its own `useState` and `onChange`, matching the checkbox wiring already used in the Bottom Sheet Switcher showcase.

@imdreamrunner
