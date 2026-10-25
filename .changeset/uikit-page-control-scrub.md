---
'@astryxdesign/core': patch
---

[chore] Internal: core's `pageControl` table gains UIPageControl's scrub (start distance, switch point), its held state (delay, dimmed indicators), its window of ten slots with shrinking edge indicators and the spring and delay it slides on, its fades and its jog past the window's edge, each with its source. Its register function makes the slide's spring and delay and the fades' durations and curves motion roles a theme can retune. Not exported from the package entry point; Lab's PageControl reads it.

@vjeux
