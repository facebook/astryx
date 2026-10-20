---
'@astryxdesign/cli': patch
---

[fix] `astryx search` keeps a guide first when the query is a phrase of two or more words that the guide declares as a keyword. `font size` and `font weight` now open the font setup guide before the Text component, and `dark mode` opens the theme guides before the theme hooks. A component whose name is the whole query still comes first, one-word queries are unchanged, and the code terms and table cells in a reference doc don't count as its keywords.

@josephfarina
