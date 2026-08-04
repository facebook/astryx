---
'@astryxdesign/core': patch
---

[feat] ProgressBar: add an opt-in `marks` prop that draws fixed target lines on the track at values in the same 0..max scale as `value` (e.g. a goal or threshold). Marks stay visible whether progress is below or past them; each mark requires a `label` (its accessible name, revealed via a tooltip on hover/focus), and marks are ignored in indeterminate mode. The mark tick is directly themeable via the `progressbar-mark` target — a theme sets `backgroundColor`, `width`, and `height` on it (a larger height makes a "flag" tick that overhangs the bar symmetrically above and below). The mark tooltip is loaded lazily, so a ProgressBar with no marks bundles no tooltip code. Named `marks` (with a `ProgressBarMark` type) to match the `marks` prop on Slider.
@freddymeta
