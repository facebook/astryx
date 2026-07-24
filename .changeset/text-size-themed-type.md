---
'@astryxdesign/core': patch
---

[fix] Text: an explicit `size` now overrides the font-size of a themed `type`. The `size` class lived in a lower cascade layer (`astryx-base`) than a theme's per-type font-size rule (`astryx-theme`), so `<Text type="supporting" size="xsm">` silently kept the type's size. Themes now re-emit the size classes in the theme layer so `size` wins as documented.
@ejc3
