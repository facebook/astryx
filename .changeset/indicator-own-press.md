---
'@astryxdesign/core': patch
---

[feat] A theme indicator can paint its own press layer: an indicator marked with the new `indicatorPressScope` marker (`@astryxdesign/core/Indicator/indicator.markers.stylex`) and `data-astryx-indicator-press="self"` paints the press itself, and CheckboxInput leaves its rounded-square layer off, so a round indicator's press stays round. Indicators without it are unchanged.

@vjeux
