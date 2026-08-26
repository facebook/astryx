---
'@astryxdesign/core': patch
---

[fix] ToastViewport: the space below the bottom-most toast is the viewport's own padding again, not the viewport's padding plus the toast's. Each toast carries a trailing `--spacing-3` as the inter-toast gap, and the one at the visual bottom of the stack added it on top of the viewport's `--spacing-4` — 28px there against 16px on every other edge. That toast now drops its trailing gap. The flex direction flips with `position`, so it is the last toast for `bottomEnd`/`bottomStart` and the first for `topEnd`/`topStart`; all four are corrected. The gap is still padding, so entry and exit animate as before.

@cixzhang
