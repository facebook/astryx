---
'@astryxdesign/core': patch
---

[feat] ProgressBar: add an opt-in `marks` prop that draws fixed target lines on the track at values in the same 0..max scale as `value` (e.g. a goal or threshold). Marks stay visible whether progress is below or past them; a `label` reveals it via a tooltip on hover/focus (an unlabeled mark is decorative), mark height is themeable (and can overhang the bar) via the `progressbar-mark` target, and marks are ignored in indeterminate mode. The mark tooltip is loaded lazily, so a ProgressBar with no marks — or only unlabeled ones — bundles no tooltip code. Named `marks` (with a `ProgressBarMark` type) to match the `marks` prop on Slider.
@freddymeta
