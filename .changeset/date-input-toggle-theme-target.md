---
'@astryxdesign/core': patch
---

[feat] DateInput: add an `astryx-date-input-toggle-icon` theme target on the calendar-toggle glyph, so consumers can recolor and resize it — and style each open/closed state — via `defineTheme` instead of a fragile descendant selector or raw CSS. The open/closed state is reflected as a `data-state` attribute. Also fixes `Icon` to forward a consumer `className` on registry-rendered icons (it was previously dropped). Default rendering is unchanged.

@freddymeta
