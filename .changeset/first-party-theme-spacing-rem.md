---
'@astryxdesign/theme-matcha': minor
'@astryxdesign/theme-y2k': minor
'@astryxdesign/cli': minor
---

[breaking] matcha's and y2k's spacing steps are rem (`--spacing-2: 0.75rem`), so their gaps and padding follow the reader's root font size like the core scale. Every step is the same pixel value at the default 16px root; a reader with a larger root font size now sees proportionally larger spacing on these themes. The CLI's copies of both theme templates and the annotated theme template's spacing example change the same way.

Migration: nothing to change to take the new behaviour. To keep fixed pixel spacing on one of these themes, extend it and override the steps in px, which is honoured as written: `defineTheme({name: 'app', extends: matchaTheme, tokens: {'--spacing-2': '12px'}})`.
@cixzhang
