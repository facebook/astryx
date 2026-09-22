---
'@astryxdesign/core': patch
---

[fix] Apply the theme's body font to the theme scope root. Generated theme CSS set `font-family` on headings, paragraphs, and code elements but never established a base font on the page, so components styled with `font-family: inherit` (SideNav items, Buttons) fell back to the browser default serif. The generator now emits `font-family: var(--font-family-body)` on `:scope`, which inherits through the tree.

@kentonquatman
