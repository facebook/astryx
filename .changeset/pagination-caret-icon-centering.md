---
'@astryxdesign/core': patch
---

[fix] Pagination: vertically center the prev/next caret icons. The RTL mirror wrapped each chevron in a `display: contents` span, which dropped the icon out of the button's flex-centering context so the glyph sat a few pixels high. The mirror transform now rides on the `Icon` directly via `xstyle`, so the icon stays a centered flex child and still flips under RTL — no wrapper element.
@freddymeta
