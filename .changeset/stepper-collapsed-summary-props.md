---
'@astryxdesign/core': patch
---

[feat] Stepper's `horizontalOptions.collapsedVariant` lets a flow choose `withLabelAndControls`, `withLabel`, or `hiddenLabel` for its compact presentation. Use `withLabel` when the surrounding flow owns Back/Continue, or `hiddenLabel` when the page already heads the current step. The default preserves both label and controls, controls still require `onStepClick`, and every step keeps its name in the accessible sequence at any width. (#5659)

@ernestt
