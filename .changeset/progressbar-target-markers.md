---
'@astryxdesign/core': patch
---

[feat] ProgressBar: add an opt-in `markers` prop that draws fixed target lines on the track at values in the same 0..max scale as `value` (e.g. a goal or threshold). Markers stay visible whether progress is below or past them; a `label` reveals it via a tooltip on hover/focus, marker height is themeable (and can overhang the bar) via the `progressbar-marker` target, and markers are ignored in indeterminate mode.
@freddymeta
