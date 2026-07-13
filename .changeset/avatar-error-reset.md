---
'@astryxdesign/core': patch
---

[fix] Avatar: retry a changed src/fallbackSrc after a load error

A failed image load latched a boolean error flag that never reset, so updating `src` (or `fallbackSrc`) to a valid URL kept rendering the initials fallback forever. The error state now tracks the exact URL that failed, so a changed source gets a fresh load attempt.
@arham766
