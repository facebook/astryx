---
'@astryxdesign/core': patch
---

[fix] Markdown/useStreamingText: streaming text now respects `prefers-reduced-motion` — the per-character reveal snaps to the full text and the entry fade is disabled for users who prefer reduced motion, matching the convention already used by Spinner, Skeleton, ProgressBar, and Chat. (#3730)
@bhamodi
