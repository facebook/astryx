---
'@astryxdesign/core': patch
---

[chore] Internal: code outside a component relates to the component's own gesture recognizers by name, the way a UIKit app uses a recognizer's name and its own delegate (`gestureNamed`, `addGestureDelegate`, `useGestureDelegate`). Not exported from the package entry point; no component uses it yet.

@vjeux
