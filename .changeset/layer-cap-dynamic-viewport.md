---
'@astryxdesign/core': patch
---

[fix] Anchored layers (`Popover`, `DropdownMenu`, and every component built on them) now keep their safe-area gutter and dynamic-viewport size cap in the shipped stylesheet. The compiled CSS referenced an undefined variable for the preferred value, so every browser used the fallback: on a phone with a dynamic toolbar or a notch, a tall layer could run past the visible screen or under a declared bottom bar. Desktop sizes are unchanged.

@cixzhang
