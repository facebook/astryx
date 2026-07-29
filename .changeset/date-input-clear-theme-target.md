---
'@astryxdesign/core': patch
---

[feat] DateInput: add `astryx-date-input-clear-icon` and `astryx-date-input-toggle-icon` theme targets on the clear and calendar-toggle glyphs, so consumers can recolor, resize, and hover-style each icon — and style the toggle's open/closed state — via `defineTheme` instead of a fragile descendant selector or raw CSS. The toggle reflects its open/closed state as a `data-state` attribute. `Icon` now fully handles its styling props (`className`, `style`, `xstyle`) so they compose with its base styles instead of being dropped. Default rendering is unchanged.

@freddymeta
