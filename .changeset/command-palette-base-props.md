---
'@astryxdesign/core': patch
---

[fix] Forward xstyle, className, style, and rest props to the underlying Dialog in CommandPalette. Previously these were accepted by the type but silently dropped.

@cixzhang
