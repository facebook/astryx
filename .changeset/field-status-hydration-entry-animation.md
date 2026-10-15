---
'@astryxdesign/core': patch
---

[fix] `FieldStatus` (and any element using `useEntryAnimation`) no longer causes a hydration mismatch when server-rendered HTML hydrates after the page has painted. The hook now returns no entry style while hydrating, matching the server markup, so elements present on page load stay unanimated as documented; elements mounted after hydration still animate.

@harjothkhara
