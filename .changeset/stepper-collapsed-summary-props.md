---
'@astryxdesign/core': patch
---

[feat] Stepper takes `hasCollapsedControls` and `hasCollapsedLabel`, so a flow that brings its own Back/Continue or heads its own step can drop the half of the collapsed summary row it would otherwise show twice on a phone. Both default to `true`, so a stepper that sets neither collapses exactly as it did before, and turning both off leaves the bare track with no row beneath it. Only visible copy goes either way — every step keeps its name in the accessible sequence at any width, so neither prop can shorten what a screen reader hears. Dropping the controls makes the compact track progress-only in both layouts, which is the intended shape when the surrounding flow already owns navigation. (#5935)

@ernestt
