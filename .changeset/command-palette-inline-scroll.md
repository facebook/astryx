---
'@xds/core': patch
---

`XDSCommandPaletteItem` no longer scrolls highlighted items into view on initial mount when rendered inside an inline dialog. This prevents inline CommandPalette picker examples from scrolling the surrounding documentation page when their selected value is auto-highlighted on mount, while preserving scroll-into-view after user navigation.
