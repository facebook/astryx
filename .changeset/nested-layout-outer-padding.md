---
'@astryxdesign/core': patch
---

[fix] A Layout nested in AppShell content, or in any other Layout, no longer inherits the outer Layout's `padding`. Its header, panels, content, and footer keep their default inset (or the enclosing Card, Section, or Dialog padding) instead of rendering flush against the content edge. An explicit `padding` on the nested Layout still wins.

@thedjpetersen
