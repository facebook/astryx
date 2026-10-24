---
'@astryxdesign/core': patch
---

[experimental] `@astryxdesign/core/gestures/experimental` lets code outside a component relate to the component's own gesture recognizers, the way a UIKit app uses a recognizer's name and its own delegate: components publish their main recognizers under stable `Component.role` names (`PUBLISHED_GESTURES`), `gestureNamed(name, {within, containing})` matches them, and `addGestureDelegate` / `useGestureDelegate` add delegate methods (vetoes and require-to-fail or simultaneous relationships) on top of the component's own. Code that declares nothing behaves as before.

@vjeux
