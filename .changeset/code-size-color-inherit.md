---
'@astryxdesign/core': patch
---

[feat] Code: add `color` and `size` props. `color` accepts `'primary' | 'secondary' | 'inherit'` and now defaults to `'primary'` (mirroring Text's color subset); previously the color was left to inherit implicitly. `size="inherit"` makes inline code adopt the surrounding text's `font-size` and `line-height`. Exports `CodeColor` and `CodeSize` types (#2846)
@durvesh1992
