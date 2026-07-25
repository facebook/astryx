---
'@astryxdesign/core': patch
---

[feat] DateTimeInput: add `astryx-date-time-input-date-segment` and `astryx-date-time-input-time-segment` theme targets on the two segment wrappers, so a theme can restyle their geometry (padding/height/font) via `defineTheme` instead of being unable to reach them at all. Both reflect `size` and `status` as data attributes, mirroring the root target. Default rendering is unchanged.

@AKnassa
