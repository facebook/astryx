---
'@astryxdesign/core': patch
---

[fix] Badge: a badge is now never shorter than one line of its own text. With a theme that follows the reader's text size on iOS (`typography.dynamicType`), a badge's label grew at the larger and accessibility sizes while the badge kept its fixed height, so the label spilled out of the pill and white text on a colored badge became unreadable. The badge now grows with its label. At the default size its height is unchanged, and a theme that sets the badge's `height` keeps its own value.

@vjeux
