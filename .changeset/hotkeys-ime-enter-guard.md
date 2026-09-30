---
'@astryxdesign/core': patch
---

[fix] Ignore IME key events (`isComposing` or `keyCode` 229) in useHotkeys, even with allowInInputs enabled, without preventing their default behavior.
@korkt-kim
