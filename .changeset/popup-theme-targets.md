---
'@astryxdesign/core': patch
---

[feat] ComplexSelector and MultiSelector: add `astryx-complex-selector-popup` and `astryx-multi-selector-popup` theme targets on the popup surface, so a theme can style the popup — background, border, radius, elevation, padding — through `defineTheme` instead of a structural selector or a fork. Both components already targeted their trigger but nothing in the popup, which is the part that has to match the rest of an app's menus. The target sits on the popup's content box rather than the layer element: `useLayer` zeroes the layer's borders, padding and background, so the content box is the surface that actually paints. Purely additive — default rendering is unchanged.

@cixzhang
