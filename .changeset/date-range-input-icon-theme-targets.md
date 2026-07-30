---
'@astryxdesign/core': patch
---

[feat] DateRangeInput: add `astryx-date-range-input-clear-icon` and `astryx-date-range-input-toggle-icon` theme targets on the clear and calendar-toggle glyphs, so consumers can recolor, hover-morph, and resize them via `defineTheme` instead of a fragile descendant selector or raw CSS. The toggle icon reflects its open/closed state as a `data-state` attribute. `Icon` now fully handles its styling props (`className`, `style`, `xstyle`) so they compose with its base styles instead of being dropped. Default rendering is unchanged.

@freddymeta
