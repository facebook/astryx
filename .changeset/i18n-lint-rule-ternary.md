---
'@astryxdesign/core': patch
---

[feat] `@astryx/no-hardcoded-i18n-string` now also catches hardcoded strings inside ternaries, logical expressions, and template literals — patterns like `aria-label={isOpen ? 'Close' : 'Open'}` or `` aria-label={`Clear ${label}`} ``. Downstream packages with the rule enabled will see additional violations flagged after upgrading.

@nynexman4464
