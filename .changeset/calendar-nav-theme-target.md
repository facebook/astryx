---
'@astryxdesign/core': patch
---

[feat] Calendar: add a dedicated `astryx-calendar-nav` theme target for the prev/next month-nav buttons, so consumers can theme the nav controls (color, radius, per-direction, disabled edge) without reaching every Button via the global `astryx-button` handle. Reflects `direction` (prev/next) and the `disabled` state as data attributes.

@freddymeta
