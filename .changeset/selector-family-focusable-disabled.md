---
'@astryxdesign/core': patch
---

[fix] A disabled `Selector`, `MultiSelector`, or `ComplexSelector` keeps its place in the tab order. Its trigger no longer renders the native `disabled` attribute or `tabIndex={-1}`; it exposes `aria-disabled="true"` instead, so keyboard and screen-reader users can reach it and hear that it is unavailable. A disabled trigger still opens nothing, ignores presses and keys, and does not run a caller's `onClick`. A disabled selector still submits no form value, and it keeps focus when it becomes disabled while focused.

@cixzhang
