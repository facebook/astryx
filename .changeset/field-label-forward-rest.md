---
'@astryxdesign/core': patch
---

[fix] FieldLabel now forwards className, style, xstyle, and pass-through attributes (data-_, aria-_, event handlers) to the rendered element. Previously these were accepted by the type but silently dropped.

@cixzhang
