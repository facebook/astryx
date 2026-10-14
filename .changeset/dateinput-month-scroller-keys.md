---
'@astryxdesign/core': patch
---

[fix] The touch month scroller shared by `DateInput` and `DateTimeInput`: under RTL the horizontal arrows follow the reading direction (ArrowLeft moves to the next day, ArrowRight to the previous), and every keyboard move — arrows and Home/End — now lands on the real day in its own month pane rather than on the dimmed, disabled copy a neighbouring pane shows at its edge. Touch scrolling is unchanged.
