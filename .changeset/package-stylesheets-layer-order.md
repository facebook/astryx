---
'@astryxdesign/core': patch
'@astryxdesign/richtext': patch
---

[fix] `astryx.css`, `reset.css`, and every other package stylesheet (`richtext.css`, `lab.css`, `charts.css`) now open with `@layer reset, astryx-base, astryx-theme;`, the same line theme stylesheets carry. The Astryx layer order holds whichever Astryx stylesheet loads first: loading `reset.css` after `astryx.css` no longer lets the reset override component styles, and theme overrides keep winning. Setups that already declare the order on their own first line are unchanged.

@cixzhang
