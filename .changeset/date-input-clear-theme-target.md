---
'@astryxdesign/core': patch
---

[feat] DateInput: add an `astryx-date-input-clear-icon` theme target on the clear glyph, so consumers can recolor it, morph its color on hover, and resize it via `defineTheme` instead of a fragile descendant selector or raw CSS. Also fixes `Icon` to forward a consumer `className` on registry-rendered icons (it was previously dropped). Default rendering is unchanged.

@freddymeta
