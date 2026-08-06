---
'@astryxdesign/core': patch
---

[fix] Pagination: vertically center the first/last double-chevron caret icons in the `input` variant. Like the prev/next carets fixed in #4723, the first/last («/») buttons still wrapped their chevron in a `display: contents` mirror span, which dropped the icon out of the button's flex-centering context so the glyph sat a few pixels high. The mirror transform now rides on the `Icon` directly via `xstyle`, matching the prev/next carets — so the icon stays a centered flex child and still flips under RTL, with no wrapper element.
@freddymeta
