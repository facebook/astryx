---
'@astryxdesign/core': patch
---

[feat] Adds the `@astryx.diffViewer.*` keys to the `en` catalog so the lab `DiffViewer` reads its file-status badges, line counts, line-number button labels, per-line "Added"/"Removed" labels, and empty-state messages from the translation runtime. No existing string changes; locales without a translation fall back to English.

@latxh
