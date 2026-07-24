---
'@astryxdesign/core': patch
---

[fix] CommandPalette: forward BaseProps pass-through attributes (className, style, xstyle, data-_, aria-_) to the underlying Dialog. Previously these were silently dropped.
@cixzhang
