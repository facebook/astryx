---
'@astryxdesign/core': patch
---

[fix] `Table`'s row-expansion chevron now mirrors correctly under RTL. It previously rotated on expand with no RTL handling at all, so the directional glyph pointed the same way regardless of text direction, matching the pattern already used by `TreeListItem`'s chevron.

@HelloOjasMutreja
