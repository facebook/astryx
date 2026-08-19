---
'@astryxdesign/core': patch
---

[docs] Use the standard `<Section padding={4}>` wrapper in every Bottom Sheet example. Four of them padded the sheet body by hand — three with an inline `style={{padding: 'var(--spacing-4)'}}` and one with `<VStack padding={4}>` — because a `Section` there used to overflow the sheet (#5208). With that fixed, they match the pattern the showcase examples already use. Rendering is pixel-identical.

@imdreamrunner
