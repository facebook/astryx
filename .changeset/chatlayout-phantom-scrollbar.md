---
'@astryxdesign/core': patch
---

[fix] ChatLayout no longer shows a phantom scrollbar in self-scroll mode when messages don't fill the viewport. The root is now a flex column: the message area flexes to fill the space the composer dock doesn't need, so the sticky dock's natural height is part of the 100% instead of overflowing past it by exactly the dock height. Long conversations still scroll and the dock still sticks; external-scrollRef mode (fixed dock) is unchanged.

@jiunshinn
