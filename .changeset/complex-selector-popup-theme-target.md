---
'@astryxdesign/core': patch
---

[feat] ComplexSelector: expose the popup surface as the `astryx-complex-selector-popup` theme target. The popup content container now paints the surface itself (same background, radius, and shadow tokens as before), so `defineTheme` components — or any plain stylesheet — can restyle the popup's background, border, radius, and width, and `contentXstyle` can override the surface styles too. Rendered defaults are unchanged.

@AKnassa
