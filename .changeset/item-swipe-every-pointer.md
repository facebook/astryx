---
'@astryxdesign/core': patch
---

[chore] Internal: with gestures attached for every pointer, a swipe-action row (`Item`, `ListItem`) still swipes only under a finger: a mouse or a pen never starts it, and the dismissing tap's click goes to the gesture host's click guard where the primary pointer is fine. Tests only otherwise; no API change.

@vjeux
