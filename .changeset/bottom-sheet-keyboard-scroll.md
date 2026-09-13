---
'@astryxdesign/core': patch
---

[fix] Make overflowing BottomSheet text keyboard reachable with a named scroll-body tab stop when content has no visible focusable child. Reuse the shared scroll behavior to follow live content changes and preserve focus when overflow disappears. Sheet scroll containment now applies only while content overflows and uses the shared `contain` policy, which permits native edge feedback.

@jiunshinn
