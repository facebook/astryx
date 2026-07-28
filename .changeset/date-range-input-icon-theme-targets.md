---
'@astryxdesign/core': patch
---

[feat] DateRangeInput: add `astryx-date-range-input-clear-icon` and `astryx-date-range-input-toggle-icon` theme targets on the clear and calendar-toggle glyphs, so consumers can recolor, hover-morph, and resize them via `defineTheme` instead of a fragile descendant selector or raw CSS. The toggle icon reflects its open/closed state as a `data-state` attribute. Also fixes `Icon` to forward a consumer `className` on registry-rendered icons (it was previously dropped). Default rendering is unchanged.

@freddymeta
