---
'@astryxdesign/core': patch
---

[fix] `FieldStatus` (and any element using `useEntryAnimation`) no longer causes a hydration mismatch on server-rendered pages. An element that arrives in the server's HTML now hydrates without the entry style and never plays its entry animation, even when hydration runs after the page has painted; elements mounted after hydration still animate. `useEntryAnimation` no longer documents server rendering as unsupported.

@harjothkhara
