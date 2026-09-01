---
'@astryxdesign/core': patch
---

[fix] `themingTargets.test.ts` now discovers component sources at any depth under `src`, not only in a top-level directory. Sources nested a level down — `Table/plugins/<name>/` — were silently exempt from the guard, which is the same drift #3741 was filed to prevent. Nothing was failing (no nested source rendered a `themeProps()` class before this release), so this closes the hole rather than fixing a live break: the guard goes from 294 to 302 assertions.
@freddymeta
