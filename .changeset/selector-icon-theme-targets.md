---
'@astryxdesign/core': patch
---

[feat] Selector & MultiSelector: add `astryx-selector-clear-icon`, `astryx-selector-indicator-icon`, `astryx-multi-selector-clear-icon`, and `astryx-multi-selector-indicator-icon` theme targets on the clear and chevron glyphs, so consumers can recolor, resize, and hover-style each icon — and style the chevron's open/closed state — via `defineTheme` instead of a fragile descendant selector or raw CSS. Each chevron reflects its open/closed state as a `data-state` attribute. `Icon` now fully handles its styling props (`className`, `style`, `xstyle`) so they compose with its base styles instead of being dropped. Default rendering is unchanged.

@freddymeta
