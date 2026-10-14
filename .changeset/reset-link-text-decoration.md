---
'@astryxdesign/core': patch
---

[fix] Under `reset.css`, links now inherit their parent's whole text decoration in Safari 17 through 26.1, not just the line. Those versions read unprefixed `text-decoration` as `text-decoration-line` alone, so a link inside text with a wavy, colored or thick underline drew its own solid underline in the link's color on top of it. The link rule adds `-webkit-text-decoration: inherit`, which carries the style and color there, and `text-decoration-thickness: inherit`. Chromium and Safari 26.2 and later already inherited all four longhands and render the same.

@vjeux
