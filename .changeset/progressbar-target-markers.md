---
'@astryxdesign/core': patch
---

[feat] ProgressBar: add an opt-in `marks` prop that draws fixed target lines on the track at values in the same 0..max scale as `value` (e.g. a goal or threshold). Marks stay visible whether progress is below or past them; each mark requires a `label` (its accessible name, revealed via a tooltip on hover/focus), mark height is themeable (and can overhang the bar) via the `progressbar-mark` target, and marks are ignored in indeterminate mode. The mark tooltip is loaded lazily, so a ProgressBar with no marks bundles no tooltip code. Named `marks` (with a `ProgressBarMark` type) to match the `marks` prop on Slider.
@freddymeta
