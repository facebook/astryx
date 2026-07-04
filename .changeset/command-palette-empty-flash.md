---
'@astryxdesign/core': patch
---

[fix] CommandPalette: the empty state ("No results") no longer flashes when typing further characters into an already-empty search. The empty state stays mounted for the full duration of the pending search instead of briefly unmounting and re-appearing.
@cixzhang
