---
'@astryxdesign/core': patch
---

[fix] Slider: the track no longer resizes while dragging with `valueDisplay="text"`. Each value reserves room for the widest label the slider can reach, measured by the browser from your `formatValue` output (every step for ranges of up to 200 steps, evenly spaced steps beyond that), so the thumb stays under the pointer instead of shifting as the label grows and shrinks. (#4050)
@AKnassa
