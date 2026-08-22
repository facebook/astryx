---
'@astryxdesign/core': patch
---

[fix] `Slider` with `orientation="vertical"` now gets the same 24px touch hit area the horizontal one got: its track was still only 20px wide on coarse pointers, under the WCAG 2.5.8 AA minimum. The whole track is the tap target for both orientations — the fix that floored the horizontal track's block size did nothing for vertical, whose short axis is the inline one — so the inline size is now floored to 24px on touch, with the same `@media (pointer: coarse)` gate. The rail, fill, marks and thumb all center on the inline 50%, so nothing visible moves and desktop is untouched (#5173).

@imdreamrunner
