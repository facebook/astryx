---
'@astryxdesign/core': patch
'@astryxdesign/theme-butter': patch
'@astryxdesign/theme-stone': patch
'@astryxdesign/theme-y2k': patch
---

[fix] A disabled `ComplexSelector` keeps its place in the tab order. Its trigger no longer renders the native `disabled` attribute; it exposes `aria-disabled="true"` instead, so keyboard and screen-reader users can reach it and hear that it is unavailable, and it shows its keyboard focus outline. A disabled trigger still opens nothing and does not run a caller's `onClick`. The butter, stone, and y2k themes keep the secondary hover fill off a disabled `ComplexSelector` trigger in either form.

@cixzhang
