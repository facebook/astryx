---
'@astryxdesign/core': patch
---

[fix] Badge: a badge is now never shorter than one line of its own text and never narrower than it is tall. With a theme that follows the reader's text size on iOS (`typography.dynamicType`), a badge's label grew at the larger and accessibility sizes while the badge kept its fixed height, so the label spilled out of the pill and white text on a colored badge became unreadable. The badge now grows with its label, and a one-character count stays a circle instead of turning into a tall capsule. At the default size nothing changes, and a theme that sets the badge's height keeps that height there while its badges still grow with larger text.

@vjeux
