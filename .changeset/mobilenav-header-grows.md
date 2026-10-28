---
'@astryxdesign/core': patch
---

[fix] MobileNav: the header row is at least one bar high and grows with its content. It was fixed at one bar (3rem), so a taller `header` (a search field under a title, a line that wraps at a larger text size) overflowed the row, drew the bottom border through itself and ran into the first item. A one-line header looks as before. `SideNav` in drawer mode passes its header to `MobileNav` and is fixed with it. No API changes.

@HelloOjasMutreja
