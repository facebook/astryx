---
'@astryxdesign/core': patch
---

[feat] Button: add `isInterruptible` to keep the button clickable while a `clickAction` is pending — the spinner and `aria-busy` still show, but the button is not disabled or deduped, so a re-click interrupts the in-flight action. ToggleButton's async toggle now runs through this path, staying interruptible.
@cixzhang
