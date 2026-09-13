---
'@astryxdesign/core': patch
---

[fix] Make overflowing BottomSheet text keyboard reachable with a named scroll-body tab stop when content has no usable sequential focus target. Add shared automatic keyboard ownership to `useScrollableArea`, which prefers eligible content and otherwise falls back to the viewport while preserving focus across live changes. Sheet scroll containment now applies only while content overflows and uses the shared `contain` policy, which permits native edge feedback.

@jiunshinn
