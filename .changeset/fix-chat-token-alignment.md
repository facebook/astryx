---
'@astryxdesign/core': patch
---

[fix] Chat: composer tokens no longer sit above surrounding text — `vertical-align` changed from `baseline` to `middle`, and `ChatComposerTokenElement` now uses a StyleX class instead of an inline style so consumers can override alignment without `!important` (#5324).

@athz
