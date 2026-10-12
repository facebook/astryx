---
'@astryxdesign/theme-matcha': patch
'@astryxdesign/theme-y2k': patch
'@astryxdesign/cli': patch
---

[fix] matcha's and y2k's spacing steps are rem (`--spacing-2: 0.75rem`), so their gaps and padding follow the reader's root font size like the core scale; every step is the same pixel value at the default 16px root. The CLI's copies of both theme templates and the annotated theme template's spacing example change the same way.
@cixzhang
