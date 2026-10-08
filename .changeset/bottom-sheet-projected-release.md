---
'@astryxdesign/core': patch
---

[fix] A BottomSheet release is judged where the sheet would coast to at the finger's speed, not where the finger left it: a medium throw dismisses from short of the dismiss line and a gentle throw lands on the next detent instead of snapping back, the release speed is read over the finger's last 100ms rather than its last two samples, and a finger that rests before lifting releases no throw. A nudge under 48px still projects nothing.

@vjeux
