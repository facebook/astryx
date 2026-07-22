---
'@astryxdesign/core': patch
---

[fix] Button: size styles now use `min-height` plus a per-size `padding-block` instead of a fixed `height`, so a theme `paddingBlock` override actually makes the button taller. Previously the fixed height absorbed any added padding under `box-sizing: border-box`, so "make this button taller" via the theme silently did nothing. Default heights (sm/md/lg) and icon-only square sizing are unchanged. (#3379)

@josephfarina
