---
'@astryxdesign/core': patch
---

[fix] Calendar RTL: month-navigation chevrons now mirror correctly under RTL (via the shared `rtlStyles.mirror` transform on the nav-icon wrapper), and the range-selection / hover-preview fill pills use logical CSS (`insetInline*`, `border*Start/EndRadius`) so their rounded start/end caps follow the reading direction instead of the physical left/right. LTR rendering is unchanged.

@nynexman4464
