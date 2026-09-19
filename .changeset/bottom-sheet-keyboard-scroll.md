---
'@astryxdesign/core': patch
---

[fix] Make overflowing BottomSheet text keyboard reachable with a named scroll-body tab stop. Add shared focus-time keyboard delegation to `useScrollableArea`: forward Tab may enter the first native link/button directly, while inputs, composite widgets, and nested scroll owners retain the viewport stop. Reverse traversal skips the delegated viewport; pointer/programmatic focus and content changes never trigger delegation. Sheet scroll containment now applies only while content overflows and uses the shared `contain` policy, which permits native edge feedback. (#6301)

@jiunshinn
