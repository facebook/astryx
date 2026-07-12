---
'@astryxdesign/core': patch
---

[fix] CodeBlock: announce "Copied" via a polite live region when the copy button is used. Previously success was signalled only by swapping the button's `aria-label`, which screen readers don't reliably announce. (#3709)
@bhamodi
