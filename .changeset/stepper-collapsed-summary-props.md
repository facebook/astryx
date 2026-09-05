---
'@astryxdesign/core': patch
---

[feat] Stepper's `horizontalOptions.collapsedVariant` lets a flow choose `withLabelAndControls`, `withLabel`, or `hiddenLabel` for its compact presentation. Use `withLabel` when the surrounding flow owns Back/Continue, or `hiddenLabel` when surrounding UI owns both the current-step heading and navigation and only a bare progress track is needed. The default preserves both label and controls, its controls require `onStepClick`, and every step keeps its name in the accessible sequence at any width. (#5659)

@ernestt
