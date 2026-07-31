---
'@astryxdesign/core': patch
---

[feat] ProgressBar: add an opt-in `markers` prop that draws fixed target lines on the track at values in the same 0..max scale as `value` (e.g. a goal or threshold). Markers stay visible whether progress is below or past them, are decorative by default (a `label` exposes one to assistive tech), and are ignored in indeterminate mode.
@freddymeta
