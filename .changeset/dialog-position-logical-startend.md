---
'@astryxdesign/core': patch
---

[feat] Dialog: add logical `start`/`end` offsets to the `position` prop and deprecate the physical `left`/`right`. `start`/`end` map to `inset-inline-start`/`inset-inline-end`, so a positioned dialog mirrors correctly under RTL (start hugs the inline-start edge — left in LTR, right in RTL). The physical `left`/`right` still work unchanged and never mirror (non-breaking); they are now `@deprecated` and will be removed in a future major. When both a logical offset and its physical counterpart are set, the logical one wins. A codemod (`migrate-dialog-position-to-logical`, v0.2.1) rewrites `position={{left, right}}` to `{{start, end}}`.
@nynexman4464
